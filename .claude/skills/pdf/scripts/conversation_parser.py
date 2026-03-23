"""
Parse and clean ideation conversation for PDF export.

This module filters out technical/system messages from ideation conversations,
keeping only the human-readable dialogue for clean PDF export.
"""

import re
from dataclasses import dataclass, field
from typing import List, Literal, Optional, Tuple
from enum import Enum


class TurnType(Enum):
    QUESTION = "question"
    ANSWER = "answer"
    SUMMARY = "summary"
    TABLE = "table"
    DIAGRAM = "diagram"
    PHASE_HEADER = "phase_header"
    NARRATIVE = "narrative"


@dataclass
class ConversationTurn:
    """Represents a single turn in the conversation."""
    speaker: Literal["user", "assistant", "system"]
    content: str
    turn_type: TurnType
    metadata: dict = field(default_factory=dict)


# Patterns to EXCLUDE from conversation export
EXCLUDE_PATTERNS = [
    # Todo updates
    r'^Update Todos',
    r'^\s*\[\s*\{.*"content".*"status".*\}\s*\]',  # JSON todo arrays

    # Tool calls
    r'^(Bash|Read|Write|Edit|Glob|Grep)\s+',
    r'^(Bash|Read|Write|Edit|Glob|Grep)$',

    # File operations
    r'^\d+\s+lines?$',
    r'^File created successfully',
    r'^File written',
    r'^File saved',
    r'^Read c:\\',
    r'^Write c:\\',
    r'^Edit c:\\',
    r'^Processing:',
    r'^Presentation saved',
    r'^convert .*\.(pptx|pdf|docx)',

    # System reminders
    r'<system-reminder>.*?</system-reminder>',

    # Compact text windows (IN/OUT blocks)
    r'^IN\n.*?\nOUT\n',

    # Line number prefixes from file reads
    r'^\s*\d+→',

    # HTML/code blocks that are file contents
    r'^<!DOCTYPE html>',
    r'^<html>',
    r'^</html>',

    # Tool result markers
    r'^Result of calling',
    r'^Called the \w+ tool',

    # Notification messages
    r'^✓\s+',
    r'^⚠\s+',
    r'^❌\s+',

    # Agent/task markers
    r'^Task \w+ completed',
    r'^Agent \w+ started',

    # Git/version control
    r'^git\s+',
    r'^commit\s+[a-f0-9]+',
]

# Compiled patterns for efficiency
EXCLUDE_COMPILED = [re.compile(p, re.MULTILINE | re.DOTALL | re.IGNORECASE) for p in EXCLUDE_PATTERNS]

# Patterns to identify markdown tables
TABLE_PATTERN = re.compile(r'^\|.*\|$', re.MULTILINE)
TABLE_SEPARATOR = re.compile(r'^\|[\s\-:|]+\|$', re.MULTILINE)

# Phase header patterns
PHASE_PATTERNS = [
    re.compile(r'^#+\s*Phase\s+\d+', re.IGNORECASE),
    re.compile(r'^#+\s*(UNDERSTAND|EXPLORE|PRESENT)', re.IGNORECASE),
    re.compile(r'^\*\*Phase\s+\d+', re.IGNORECASE),
]

# Question patterns
QUESTION_PATTERNS = [
    re.compile(r'^#+\s*Q\d+[:\s]', re.IGNORECASE),
    re.compile(r'^\*\*Q\d+[:\s]', re.IGNORECASE),
    re.compile(r'^Question\s+\d+[:\s]', re.IGNORECASE),
]


def should_exclude(text: str) -> bool:
    """Check if text matches any exclusion pattern."""
    text_stripped = text.strip()
    if not text_stripped:
        return True

    for pattern in EXCLUDE_COMPILED:
        if pattern.search(text_stripped):
            return True
    return False


def detect_turn_type(text: str) -> TurnType:
    """Detect the type of content in a conversation turn."""
    text_stripped = text.strip()

    # Check for phase headers
    for pattern in PHASE_PATTERNS:
        if pattern.search(text_stripped):
            return TurnType.PHASE_HEADER

    # Check for questions
    for pattern in QUESTION_PATTERNS:
        if pattern.search(text_stripped):
            return TurnType.QUESTION

    # Check for tables
    lines = text_stripped.split('\n')
    table_lines = sum(1 for line in lines if TABLE_PATTERN.match(line.strip()))
    if table_lines >= 3:  # Header, separator, at least one data row
        return TurnType.TABLE

    # Check for ASCII diagrams (multiple lines with box characters)
    box_chars = ['┌', '┐', '└', '┘', '│', '─', '├', '┤', '┬', '┴', '┼', '+', '-', '|']
    diagram_lines = sum(1 for line in lines if any(c in line for c in box_chars))
    if diagram_lines >= 3:
        return TurnType.DIAGRAM

    return TurnType.NARRATIVE


def clean_turn(text: str) -> str:
    """Remove tool artifacts and clean whitespace from text."""
    # Remove system reminder tags
    text = re.sub(r'<system-reminder>.*?</system-reminder>', '', text, flags=re.DOTALL)

    # Remove line number prefixes (e.g., "    1→")
    text = re.sub(r'^\s*\d+→', '', text, flags=re.MULTILINE)

    # Remove tool call markers
    text = re.sub(r'^(Called the \w+ tool.*?)$', '', text, flags=re.MULTILINE)
    text = re.sub(r'^(Result of calling.*?)$', '', text, flags=re.MULTILINE)

    # Remove file path references in tool outputs
    text = re.sub(r'^(Read|Write|Edit)\s+[cC]:\\.*$', '', text, flags=re.MULTILINE)

    # Clean up excessive whitespace
    text = re.sub(r'\n{4,}', '\n\n\n', text)
    text = re.sub(r'[ \t]+$', '', text, flags=re.MULTILINE)

    return text.strip()


def extract_tables(text: str) -> List[Tuple[int, int, str]]:
    """Extract markdown tables from text with their positions."""
    tables = []
    lines = text.split('\n')
    i = 0

    while i < len(lines):
        line = lines[i].strip()
        if TABLE_PATTERN.match(line):
            # Found potential table start
            table_start = i
            table_lines = [lines[i]]
            i += 1

            # Collect consecutive table lines
            while i < len(lines) and TABLE_PATTERN.match(lines[i].strip()):
                table_lines.append(lines[i])
                i += 1

            # Valid table needs at least 3 lines (header, separator, data)
            if len(table_lines) >= 3:
                tables.append((table_start, i, '\n'.join(table_lines)))
        else:
            i += 1

    return tables


def parse_markdown_table(table_text: str) -> List[List[str]]:
    """Parse a markdown table into a list of rows."""
    lines = [line.strip() for line in table_text.strip().split('\n')]
    rows = []

    for line in lines:
        if not line or TABLE_SEPARATOR.match(line):
            continue

        # Split by | and clean cells
        cells = [cell.strip() for cell in line.split('|')]
        # Remove empty first/last cells from | borders
        if cells and cells[0] == '':
            cells = cells[1:]
        if cells and cells[-1] == '':
            cells = cells[:-1]

        if cells:
            rows.append(cells)

    return rows


def split_by_speaker(raw_text: str) -> List[Tuple[str, str]]:
    """Split conversation into (speaker, content) pairs."""
    # Common patterns for speaker identification
    patterns = [
        (r'^Human:\s*', 'user'),
        (r'^User:\s*', 'user'),
        (r'^Assistant:\s*', 'assistant'),
        (r'^Claude:\s*', 'assistant'),
        (r'^AI:\s*', 'assistant'),
    ]

    turns = []
    current_speaker = None
    current_content = []

    for line in raw_text.split('\n'):
        new_speaker = None
        new_line = line

        for pattern, speaker in patterns:
            match = re.match(pattern, line, re.IGNORECASE)
            if match:
                new_speaker = speaker
                new_line = line[match.end():]
                break

        if new_speaker and new_speaker != current_speaker:
            # Save previous turn
            if current_speaker and current_content:
                turns.append((current_speaker, '\n'.join(current_content)))
            current_speaker = new_speaker
            current_content = [new_line] if new_line.strip() else []
        else:
            if current_speaker:
                current_content.append(line)

    # Don't forget last turn
    if current_speaker and current_content:
        turns.append((current_speaker, '\n'.join(current_content)))

    return turns


def parse_conversation_file(file_path: str) -> List[ConversationTurn]:
    """Parse pre-recorded conversation file (ideate_conversation.md format)."""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    turns = []

    # Split by section markers (## Phase, ### Q, ### A)
    sections = re.split(r'^(#{2,3}\s+)', content, flags=re.MULTILINE)

    i = 0
    while i < len(sections):
        section = sections[i]

        # Check for phase headers
        if re.match(r'^Phase\s+\d+', section, re.IGNORECASE):
            turns.append(ConversationTurn(
                speaker="assistant",
                content=f"## {section}",
                turn_type=TurnType.PHASE_HEADER
            ))

        # Check for questions (Q1, Q2, etc.)
        elif re.match(r'^Q\d+[:\s]', section, re.IGNORECASE):
            # Get the content after the header marker
            if i + 1 < len(sections):
                q_content = sections[i] + sections[i + 1] if i + 1 < len(sections) else sections[i]
                cleaned = clean_turn(q_content)
                if cleaned and not should_exclude(cleaned):
                    turns.append(ConversationTurn(
                        speaker="assistant",
                        content=cleaned,
                        turn_type=TurnType.QUESTION
                    ))
                i += 1

        # Check for answers (A1, A2, etc.)
        elif re.match(r'^A\d+[:\s]', section, re.IGNORECASE):
            if i + 1 < len(sections):
                a_content = sections[i] + sections[i + 1] if i + 1 < len(sections) else sections[i]
                cleaned = clean_turn(a_content)
                if cleaned and not should_exclude(cleaned):
                    turns.append(ConversationTurn(
                        speaker="user",
                        content=cleaned,
                        turn_type=TurnType.ANSWER
                    ))
                i += 1

        i += 1

    return turns


def parse_raw_conversation(raw_text: str) -> List[ConversationTurn]:
    """Parse raw pasted conversation text from Claude Code interface."""
    turns = []

    # First, clean the entire text
    cleaned_text = clean_turn(raw_text)

    # Split into lines for processing
    lines = cleaned_text.split('\n')

    # Patterns to identify different content types
    user_answer_pattern = re.compile(r'^[A-E]{1,5}\s*[-–—:]', re.IGNORECASE)
    question_header_pattern = re.compile(r'^Q\d+\s+of\s+\d+', re.IGNORECASE)
    phase_pattern = re.compile(r'^Phase\s+\d+[:\s]', re.IGNORECASE)
    option_pattern = re.compile(r'^\([A-E]\)\s+', re.IGNORECASE)
    table_header_pattern = re.compile(r'^\|.*\|$')
    section_header_pattern = re.compile(r'^#{1,3}\s+')
    banner_pattern = re.compile(r'^[=]+$')

    current_block = []
    current_type = None
    last_was_question = False

    def save_block():
        nonlocal current_block, current_type, last_was_question
        if current_block and current_type:
            content = '\n'.join(current_block).strip()
            if content and not should_exclude(content):
                # Determine speaker
                if current_type == 'user_answer':
                    speaker = 'user'
                    turn_type = TurnType.ANSWER
                elif current_type == 'phase':
                    speaker = 'assistant'
                    turn_type = TurnType.PHASE_HEADER
                elif current_type == 'question':
                    speaker = 'assistant'
                    turn_type = TurnType.QUESTION
                    last_was_question = True
                elif current_type == 'table':
                    speaker = 'assistant'
                    turn_type = TurnType.TABLE
                elif current_type == 'diagram':
                    speaker = 'assistant'
                    turn_type = TurnType.DIAGRAM
                else:
                    speaker = 'assistant'
                    turn_type = TurnType.NARRATIVE

                turns.append(ConversationTurn(
                    speaker=speaker,
                    content=content,
                    turn_type=turn_type
                ))

                if current_type == 'user_answer':
                    last_was_question = False

        current_block = []
        current_type = None

    i = 0
    while i < len(lines):
        line = lines[i]
        stripped = line.strip()

        # Skip empty lines between blocks
        if not stripped:
            if current_block:
                current_block.append(line)
            i += 1
            continue

        # Skip banner/separator lines
        if banner_pattern.match(stripped) or stripped.startswith('==='):
            save_block()
            i += 1
            continue

        # Detect user answers (e.g., "ABCDE -", "D -", "BC -")
        if user_answer_pattern.match(stripped):
            save_block()
            current_type = 'user_answer'
            current_block = [line]
            i += 1
            # Collect continuation lines
            while i < len(lines):
                next_line = lines[i].strip()
                if not next_line:
                    current_block.append(lines[i])
                    i += 1
                    break
                # Stop if we hit a new section
                if (question_header_pattern.match(next_line) or
                    phase_pattern.match(next_line) or
                    section_header_pattern.match(next_line) or
                    user_answer_pattern.match(next_line)):
                    break
                current_block.append(lines[i])
                i += 1
            save_block()
            continue

        # Detect question headers (e.g., "Q3 of 8-12")
        if question_header_pattern.match(stripped):
            save_block()
            current_type = 'question'
            current_block = [line]
            i += 1
            # Collect until user answer or next question
            while i < len(lines):
                next_line = lines[i].strip()
                if user_answer_pattern.match(next_line):
                    break
                if question_header_pattern.match(next_line):
                    break
                if phase_pattern.match(next_line) and 'UNDERSTAND' not in next_line.upper():
                    break
                current_block.append(lines[i])
                i += 1
            save_block()
            continue

        # Detect phase headers
        if phase_pattern.match(stripped) or 'Phase 1: UNDERSTAND' in stripped or 'Phase 2: EXPLORE' in stripped or 'Phase 3: PRESENT' in stripped:
            save_block()
            current_type = 'phase'
            current_block = [line]
            i += 1
            # Collect a few lines for context
            count = 0
            while i < len(lines) and count < 5:
                next_line = lines[i].strip()
                if question_header_pattern.match(next_line):
                    break
                if user_answer_pattern.match(next_line):
                    break
                current_block.append(lines[i])
                i += 1
                count += 1
            save_block()
            continue

        # Detect tables
        if table_header_pattern.match(stripped):
            save_block()
            current_type = 'table'
            current_block = [line]
            i += 1
            while i < len(lines):
                next_line = lines[i].strip()
                if table_header_pattern.match(next_line):
                    current_block.append(lines[i])
                    i += 1
                else:
                    break
            save_block()
            continue

        # Detect ASCII diagrams
        box_chars = ['┌', '┐', '└', '┘', '│', '─', '├', '┤', '┬', '┴', '┼']
        if any(c in stripped for c in box_chars):
            save_block()
            current_type = 'diagram'
            current_block = [line]
            i += 1
            while i < len(lines):
                next_line = lines[i]
                if any(c in next_line for c in box_chars) or next_line.strip() == '':
                    current_block.append(next_line)
                    i += 1
                    if next_line.strip() == '':
                        break
                else:
                    break
            save_block()
            continue

        # Default: add to current block or start narrative
        if current_type is None:
            current_type = 'narrative'
        current_block.append(line)
        i += 1

    # Save any remaining block
    save_block()

    return turns


def format_for_display(turns: List[ConversationTurn]) -> str:
    """Format parsed turns for text display/debugging."""
    output = []

    for turn in turns:
        speaker_label = "USER" if turn.speaker == "user" else "ASSISTANT"
        type_label = turn.turn_type.value.upper()

        output.append(f"\n[{speaker_label} - {type_label}]")
        output.append("-" * 50)
        output.append(turn.content)
        output.append("")

    return '\n'.join(output)


if __name__ == "__main__":
    import sys

    if len(sys.argv) < 2:
        print("Usage: python conversation_parser.py <input_file> [--debug]")
        sys.exit(1)

    input_file = sys.argv[1]
    debug = "--debug" in sys.argv

    with open(input_file, 'r', encoding='utf-8') as f:
        raw_text = f.read()

    turns = parse_raw_conversation(raw_text)

    print(f"Parsed {len(turns)} conversation turns")

    if debug:
        print(format_for_display(turns))
