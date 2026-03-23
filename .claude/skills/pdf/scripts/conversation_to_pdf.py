"""
Generate Q101-branded PDF from parsed ideation conversation.

Uses reportlab to create professionally styled PDFs with:
- Q101 brand colors (blue/gold)
- Speaker-labeled conversation turns
- Preserved tables and diagrams
- Header/footer with session info
- Proper text wrapping for long content
- Beautiful typography with proper line spacing
"""

import os
import re
from datetime import datetime
from typing import List, Optional

from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_JUSTIFY
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    PageBreak, Preformatted, KeepTogether, HRFlowable
)
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

# Import parser
from conversation_parser import (
    ConversationTurn, TurnType, parse_raw_conversation,
    parse_conversation_file, parse_markdown_table, extract_tables
)


# Q101 Brand Colors
Q101_BLUE = colors.HexColor('#1A5276')
Q101_GOLD = colors.HexColor('#F39C12')
Q101_LIGHT_BLUE = colors.HexColor('#EBF5FB')
Q101_DARK_TEXT = colors.HexColor('#2C3E50')
Q101_GRAY = colors.HexColor('#5D6D7E')
Q101_WHITE = colors.HexColor('#FFFFFF')
Q101_LIGHT_GOLD = colors.HexColor('#FCF3CF')
Q101_SEPARATOR = colors.HexColor('#E8E8E8')  # Light gray for separators

# Page layout constants (Letter: 8.5" x 11")
PAGE_WIDTH = letter[0]  # 612 points = 8.5 inches
LEFT_MARGIN = 0.75 * inch
RIGHT_MARGIN = 0.75 * inch
AVAILABLE_WIDTH = PAGE_WIDTH - LEFT_MARGIN - RIGHT_MARGIN  # 7.0 inches = 504 points


def wrap_text_for_width(text: str, max_chars_per_line: int = 80) -> str:
    """
    Pre-process text to ensure it can wrap properly.
    Inserts zero-width spaces after certain characters in long strings.
    This helps URLs and technical strings wrap at natural break points.
    """
    if not text:
        return text

    result = []
    for word in text.split():
        if len(word) > max_chars_per_line:
            # Insert zero-width space after break characters: / - _ . @
            word = re.sub(r'([/\-_.@])', r'\1&#8203;', word)
        result.append(word)
    return ' '.join(result)


def create_wrapped_cell(text: str, style: ParagraphStyle) -> Paragraph:
    """
    Create a Paragraph object suitable for use in a table cell.
    Ensures text will wrap properly within the cell.
    """
    processed_text = wrap_text_for_width(text)
    # Escape ampersands for XML
    processed_text = processed_text.replace('&', '&amp;').replace('&amp;#8203;', '&#8203;')
    return Paragraph(processed_text, style)


def get_q101_styles() -> dict:
    """Create Q101-branded paragraph styles with proper typography and spacing."""
    styles = getSampleStyleSheet()

    # Title style - 24pt font, 32pt leading (1.33x)
    styles.add(ParagraphStyle(
        name='Q101Title',
        parent=styles['Title'],
        fontSize=24,
        leading=32,
        textColor=Q101_BLUE,
        spaceAfter=16,
        alignment=TA_CENTER,
        fontName='Helvetica-Bold',
        splitLongWords=1,
    ))

    # Subtitle style - 12pt font, 17pt leading (1.42x)
    styles.add(ParagraphStyle(
        name='Q101Subtitle',
        parent=styles['Normal'],
        fontSize=12,
        leading=17,
        textColor=Q101_GRAY,
        spaceAfter=8,
        alignment=TA_CENTER,
        fontName='Helvetica',
        splitLongWords=1,
    ))

    # Phase header style - 16pt font, 22pt leading (1.38x)
    styles.add(ParagraphStyle(
        name='Q101PhaseHeader',
        parent=styles['Heading1'],
        fontSize=16,
        leading=22,
        textColor=Q101_WHITE,
        backColor=Q101_BLUE,
        spaceBefore=20,
        spaceAfter=14,
        leftIndent=10,
        rightIndent=10,
        borderPadding=8,
        fontName='Helvetica-Bold',
        splitLongWords=1,
    ))

    # Question style (Assistant questions) - 11pt font, 15pt leading (1.36x)
    styles.add(ParagraphStyle(
        name='Q101Question',
        parent=styles['Normal'],
        fontSize=11,
        leading=15,
        textColor=Q101_DARK_TEXT,
        spaceBefore=10,
        spaceAfter=8,
        leftIndent=0,
        fontName='Helvetica-Bold',
        splitLongWords=1,
    ))

    # Answer style (user response) - 11pt font, 15pt leading (1.36x)
    styles.add(ParagraphStyle(
        name='Q101Answer',
        parent=styles['Normal'],
        fontSize=11,
        leading=15,
        textColor=Q101_DARK_TEXT,
        backColor=Q101_LIGHT_BLUE,
        spaceBefore=8,
        spaceAfter=14,
        leftIndent=10,
        rightIndent=10,
        borderPadding=6,
        fontName='Helvetica',
        splitLongWords=1,
    ))

    # Narrative/body style - 10pt font, 14pt leading (1.4x) - LEFT aligned for readability
    styles.add(ParagraphStyle(
        name='Q101Body',
        parent=styles['Normal'],
        fontSize=10,
        leading=14,
        textColor=Q101_DARK_TEXT,
        spaceBefore=8,
        spaceAfter=8,
        alignment=TA_LEFT,
        fontName='Helvetica',
        splitLongWords=1,
    ))

    # Monospace style for diagrams - 8pt font, 11pt leading (1.38x)
    styles.add(ParagraphStyle(
        name='Q101Mono',
        parent=styles['Code'],
        fontSize=8,
        leading=11,
        textColor=Q101_DARK_TEXT,
        backColor=colors.HexColor('#F8F9F9'),
        spaceBefore=10,
        spaceAfter=10,
        leftIndent=10,
        rightIndent=10,
        fontName='Courier',
        splitLongWords=1,
    ))

    # Summary box style - 10pt font, 14pt leading (1.4x)
    styles.add(ParagraphStyle(
        name='Q101Summary',
        parent=styles['Normal'],
        fontSize=10,
        leading=14,
        textColor=Q101_DARK_TEXT,
        backColor=Q101_LIGHT_GOLD,
        spaceBefore=12,
        spaceAfter=12,
        leftIndent=10,
        rightIndent=10,
        borderPadding=8,
        fontName='Helvetica',
        splitLongWords=1,
    ))

    # Speaker label style - 9pt font, 12pt leading (1.33x)
    styles.add(ParagraphStyle(
        name='Q101SpeakerLabel',
        parent=styles['Normal'],
        fontSize=9,
        leading=12,
        textColor=Q101_GOLD,
        spaceBefore=12,
        spaceAfter=4,
        fontName='Helvetica-Bold',
        splitLongWords=1,
    ))

    # Table cell style - 9pt font, 12pt leading (1.33x)
    styles.add(ParagraphStyle(
        name='Q101TableCell',
        parent=styles['Normal'],
        fontSize=9,
        leading=12,
        textColor=Q101_DARK_TEXT,
        fontName='Helvetica',
        splitLongWords=1,
    ))

    # Table header cell style - 9pt font, 12pt leading (1.33x)
    styles.add(ParagraphStyle(
        name='Q101TableHeader',
        parent=styles['Normal'],
        fontSize=9,
        leading=12,
        textColor=Q101_WHITE,
        fontName='Helvetica-Bold',
        splitLongWords=1,
    ))

    # Bullet item style - 10pt font, 14pt leading (1.4x)
    styles.add(ParagraphStyle(
        name='Q101Bullet',
        parent=styles['Normal'],
        fontSize=10,
        leading=14,
        textColor=Q101_DARK_TEXT,
        spaceBefore=3,
        spaceAfter=3,
        leftIndent=15,
        bulletIndent=5,
        fontName='Helvetica',
        splitLongWords=1,
    ))

    return styles


def create_header_footer(canvas, doc, session_id: str, topic: str):
    """Add header and footer to each page."""
    canvas.saveState()

    # Header - gold accent bar
    canvas.setFillColor(Q101_GOLD)
    canvas.rect(0, letter[1] - 25, letter[0], 25, fill=True, stroke=False)

    # Header text - truncate topic if too long
    canvas.setFillColor(Q101_WHITE)
    canvas.setFont('Helvetica-Bold', 10)
    display_topic = topic[:50] + "..." if len(topic) > 50 else topic
    canvas.drawString(0.5 * inch, letter[1] - 18, f"Ideation Session: {display_topic}")

    # Footer
    canvas.setFillColor(Q101_BLUE)
    canvas.rect(0, 0, letter[0], 20, fill=True, stroke=False)

    canvas.setFillColor(Q101_WHITE)
    canvas.setFont('Helvetica', 8)
    canvas.drawString(0.5 * inch, 7, f"Session ID: {session_id}")
    canvas.drawRightString(letter[0] - 0.5 * inch, 7, f"Page {doc.page}")
    canvas.drawCentredString(letter[0] / 2, 7, "Q101 Framework")

    canvas.restoreState()


def build_title_page(topic: str, session_id: str, date: str, styles: dict) -> List:
    """Build the title page elements."""
    elements = []

    # Add spacing from top
    elements.append(Spacer(1, 1.5 * inch))

    # Title
    elements.append(Paragraph(
        "Ideation Session Transcript",
        styles['Q101Title']
    ))

    elements.append(Spacer(1, 0.3 * inch))

    # Topic - wrap if needed
    wrapped_topic = wrap_text_for_width(topic, 60)
    elements.append(Paragraph(
        f"<b>{wrapped_topic}</b>",
        styles['Q101Subtitle']
    ))

    elements.append(Spacer(1, 0.5 * inch))

    # Session info table
    info_data = [
        ['Session ID:', session_id],
        ['Date:', date],
        ['Framework:', 'Q101 Agentic Coding Framework'],
    ]

    info_table = Table(info_data, colWidths=[1.5 * inch, 4 * inch])
    info_table.setStyle(TableStyle([
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('FONTNAME', (1, 0), (1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('TEXTCOLOR', (0, 0), (0, -1), Q101_GRAY),
        ('TEXTCOLOR', (1, 0), (1, -1), Q101_DARK_TEXT),
        ('ALIGN', (0, 0), (0, -1), 'RIGHT'),
        ('ALIGN', (1, 0), (1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 10),
    ]))

    elements.append(info_table)

    elements.append(Spacer(1, 1 * inch))

    # Q101 branding note
    elements.append(Paragraph(
        "Generated by Q101 Framework /ideate command",
        ParagraphStyle(
            'BrandNote',
            fontSize=9,
            leading=12,
            textColor=Q101_GRAY,
            alignment=TA_CENTER,
            splitLongWords=1,
        )
    ))

    elements.append(PageBreak())

    return elements


def convert_markdown_to_paragraph(text: str, style: ParagraphStyle) -> Paragraph:
    """Convert markdown formatting to reportlab paragraph with proper text wrapping."""
    # Pre-process for wrapping FIRST
    text = wrap_text_for_width(text)

    # Escape ampersands BEFORE adding XML tags (but preserve our zero-width spaces)
    text = text.replace('&', '&amp;').replace('&amp;#8203;', '&#8203;')

    # Convert backticks to code FIRST (protects content inside from other transformations)
    text = re.sub(r'`(.+?)`', r'<font name="Courier">\1</font>', text)

    # Then convert other markdown to XML tags
    text = re.sub(r'\*\*(.+?)\*\*', r'<b>\1</b>', text)
    text = re.sub(r'__(.+?)__', r'<b>\1</b>', text)
    text = re.sub(r'\*(.+?)\*', r'<i>\1</i>', text)
    # NOTE: Underscore-italic (_text_) intentionally NOT supported - conflicts with identifiers like project_path

    # Handle line breaks
    text = text.replace('\n', '<br/>')

    return Paragraph(text, style)


def build_multi_paragraph_content(content: str, style: ParagraphStyle, styles: dict) -> List:
    """
    Split content into paragraphs and render with proper spacing.
    Handles: double newlines, bullet lists, numbered lists.
    """
    elements = []

    # Split on double newlines (paragraph breaks)
    paragraphs = re.split(r'\n\s*\n', content)

    for i, para in enumerate(paragraphs):
        para = para.strip()
        if not para:
            continue

        # Check if it's a bullet list (starts with - or •)
        if re.match(r'^[-•]\s', para):
            # Split into bullet items
            items = re.split(r'\n[-•]\s*', para)
            for item in items:
                item = item.strip()
                if item:
                    # Remove leading - or • if present
                    item = re.sub(r'^[-•]\s*', '', item)
                    bullet_text = f"• {item}"
                    bullet_text = wrap_text_for_width(bullet_text)
                    bullet_text = bullet_text.replace('&', '&amp;').replace('&amp;#8203;', '&#8203;')
                    elements.append(Paragraph(bullet_text, styles['Q101Bullet']))
        # Check if it's a numbered list
        elif re.match(r'^\d+[.)]\s', para):
            items = re.split(r'\n(?=\d+[.)]\s)', para)
            for item in items:
                item = item.strip()
                if item:
                    item_text = wrap_text_for_width(item)
                    item_text = item_text.replace('&', '&amp;').replace('&amp;#8203;', '&#8203;')
                    elements.append(Paragraph(item_text, styles['Q101Bullet']))
        else:
            # Regular paragraph
            elements.append(convert_markdown_to_paragraph(para, style))

        # Add spacing between paragraphs (not after last)
        if i < len(paragraphs) - 1:
            elements.append(Spacer(1, 6))  # 6pt between paragraphs

    return elements


def build_table_element(table_text: str, styles: dict) -> Table:
    """Convert markdown table to reportlab Table with proper text wrapping."""
    rows = parse_markdown_table(table_text)

    if not rows:
        return None

    # Calculate column widths based on available width
    num_cols = max(len(row) for row in rows)
    col_width = AVAILABLE_WIDTH / num_cols

    # Get cell styles
    cell_style = styles['Q101TableCell']
    header_style = styles['Q101TableHeader']

    # Normalize rows and wrap cells in Paragraphs for proper text wrapping
    wrapped_rows = []
    for row_idx, row in enumerate(rows):
        # Pad row to match column count
        while len(row) < num_cols:
            row.append('')

        # Wrap each cell in a Paragraph
        style = header_style if row_idx == 0 else cell_style
        wrapped_row = []
        for cell in row:
            cell_text = str(cell) if cell else ''
            # Escape ampersands and wrap
            cell_text = wrap_text_for_width(cell_text, 40)
            cell_text = cell_text.replace('&', '&amp;').replace('&amp;#8203;', '&#8203;')
            wrapped_row.append(Paragraph(cell_text, style))
        wrapped_rows.append(wrapped_row)

    table = Table(wrapped_rows, colWidths=[col_width] * num_cols)

    # Style the table
    style_commands = [
        # Header row
        ('BACKGROUND', (0, 0), (-1, 0), Q101_BLUE),
        ('TEXTCOLOR', (0, 0), (-1, 0), Q101_WHITE),

        # Body rows - alternating colors
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [Q101_WHITE, Q101_LIGHT_BLUE]),

        # Alignment and padding
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('LEFTPADDING', (0, 0), (-1, -1), 10),
        ('RIGHTPADDING', (0, 0), (-1, -1), 10),

        # Grid
        ('GRID', (0, 0), (-1, -1), 0.5, Q101_GRAY),
    ]

    table.setStyle(TableStyle(style_commands))

    return table


def build_diagram_element(text: str, styles: dict) -> Preformatted:
    """Create a preformatted element for ASCII diagrams."""
    return Preformatted(text, styles['Q101Mono'])


def build_turn_elements(turn: ConversationTurn, styles: dict, is_last: bool = False) -> List:
    """Build elements for a single conversation turn with proper spacing and visual hierarchy."""
    elements = []

    if turn.turn_type == TurnType.PHASE_HEADER:
        # Phase headers get special treatment - more space before
        header_text = turn.content.lstrip('#').strip()
        elements.append(Spacer(1, 0.25 * inch))

        # Create a colored background box for phase header
        phase_table = Table([[header_text]], colWidths=[AVAILABLE_WIDTH])
        phase_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), Q101_BLUE),
            ('TEXTCOLOR', (0, 0), (-1, -1), Q101_WHITE),
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 14),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('TOPPADDING', (0, 0), (-1, -1), 12),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
        ]))
        elements.append(phase_table)
        elements.append(Spacer(1, 0.2 * inch))

    elif turn.turn_type == TurnType.QUESTION:
        # Use KeepTogether to prevent orphaned speaker labels
        speaker_label = Paragraph("ASSISTANT:", styles['Q101SpeakerLabel'])

        # Check if content has tables
        tables = extract_tables(turn.content)
        if tables:
            # Complex content with tables - handle separately
            elements.append(speaker_label)
            elements.append(Spacer(1, 4))

            content = turn.content
            last_end = 0

            for start, end, table_text in tables:
                # Text before table
                lines = content.split('\n')
                pre_table = '\n'.join(lines[:start])
                if pre_table.strip():
                    # Use multi-paragraph processing
                    para_elements = build_multi_paragraph_content(
                        pre_table.strip(),
                        styles['Q101Question'],
                        styles
                    )
                    elements.extend(para_elements)

                # Table - pass styles for wrapped cells
                table_elem = build_table_element(table_text, styles)
                if table_elem:
                    elements.append(Spacer(1, 0.1 * inch))
                    elements.append(table_elem)
                    elements.append(Spacer(1, 0.1 * inch))

                last_end = end

            # Text after last table
            post_table = '\n'.join(content.split('\n')[last_end:])
            if post_table.strip():
                para_elements = build_multi_paragraph_content(
                    post_table.strip(),
                    styles['Q101Body'],
                    styles
                )
                elements.extend(para_elements)
        else:
            # Simple content - use KeepTogether for label + first paragraph
            content_elements = build_multi_paragraph_content(
                turn.content,
                styles['Q101Question'],
                styles
            )
            if content_elements:
                # Keep speaker label with first content element
                first_content = content_elements[0]
                elements.append(KeepTogether([
                    speaker_label,
                    Spacer(1, 4),
                    first_content
                ]))
                # Add remaining content elements
                elements.extend(content_elements[1:])
            else:
                elements.append(speaker_label)

    elif turn.turn_type == TurnType.ANSWER:
        speaker_label = Paragraph("USER:", styles['Q101SpeakerLabel'])

        # Process multi-paragraph content for answers
        content_elements = build_multi_paragraph_content(
            turn.content,
            styles['Q101Body'],
            styles
        )

        # Create wrapped content for the answer box
        if content_elements:
            # Build inner content with proper spacing
            inner_elements = []
            for elem in content_elements:
                inner_elements.append(elem)

            # User answers in light blue box with increased padding
            answer_table = Table([[inner_elements]], colWidths=[AVAILABLE_WIDTH - 0.3 * inch])
            answer_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, -1), Q101_LIGHT_BLUE),
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('VALIGN', (0, 0), (-1, -1), 'TOP'),
                ('TOPPADDING', (0, 0), (-1, -1), 12),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
                ('LEFTPADDING', (0, 0), (-1, -1), 14),
                ('RIGHTPADDING', (0, 0), (-1, -1), 14),
            ]))

            # Keep speaker label with answer box
            elements.append(KeepTogether([
                speaker_label,
                Spacer(1, 4),
                answer_table
            ]))
        else:
            elements.append(speaker_label)

    elif turn.turn_type == TurnType.TABLE:
        table_elem = build_table_element(turn.content, styles)
        if table_elem:
            elements.append(Spacer(1, 0.12 * inch))
            elements.append(table_elem)
            elements.append(Spacer(1, 0.12 * inch))

    elif turn.turn_type == TurnType.DIAGRAM:
        elements.append(Spacer(1, 0.12 * inch))
        elements.append(build_diagram_element(turn.content, styles))
        elements.append(Spacer(1, 0.12 * inch))

    elif turn.turn_type == TurnType.SUMMARY:
        speaker_label = Paragraph("SUMMARY:", styles['Q101SpeakerLabel'])

        # Process multi-paragraph content for summary
        content_elements = build_multi_paragraph_content(
            turn.content,
            styles['Q101Body'],
            styles
        )

        if content_elements:
            # Build inner content
            inner_elements = []
            for elem in content_elements:
                inner_elements.append(elem)

            # Summary box with gold background and increased padding
            summary_table = Table([[inner_elements]], colWidths=[AVAILABLE_WIDTH - 0.3 * inch])
            summary_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, -1), Q101_LIGHT_GOLD),
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('VALIGN', (0, 0), (-1, -1), 'TOP'),
                ('TOPPADDING', (0, 0), (-1, -1), 12),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
                ('LEFTPADDING', (0, 0), (-1, -1), 14),
                ('RIGHTPADDING', (0, 0), (-1, -1), 14),
            ]))

            elements.append(KeepTogether([
                speaker_label,
                Spacer(1, 4),
                summary_table
            ]))
        else:
            elements.append(speaker_label)

    else:  # NARRATIVE
        speaker_label = Paragraph("ASSISTANT:", styles['Q101SpeakerLabel'])

        # Process multi-paragraph content
        content_elements = build_multi_paragraph_content(
            turn.content,
            styles['Q101Body'],
            styles
        )

        if content_elements:
            # Keep speaker label with first content element
            first_content = content_elements[0]
            elements.append(KeepTogether([
                speaker_label,
                Spacer(1, 4),
                first_content
            ]))
            # Add remaining content elements
            elements.extend(content_elements[1:])
        else:
            elements.append(speaker_label)

    # Add spacing after turn content
    elements.append(Spacer(1, 0.08 * inch))

    # Add visual separator between turns (not after last turn or phase headers)
    if not is_last and turn.turn_type != TurnType.PHASE_HEADER:
        elements.append(HRFlowable(
            width="80%",
            thickness=0.5,
            color=Q101_SEPARATOR,
            spaceBefore=4,
            spaceAfter=8,
            hAlign='CENTER'
        ))

    return elements


def create_conversation_pdf(
    turns: List[ConversationTurn],
    output_path: str,
    session_id: str,
    topic: str,
    date: Optional[str] = None
):
    """Generate Q101-branded PDF from parsed conversation."""
    if date is None:
        date = datetime.now().strftime("%Y-%m-%d")

    # Create document with proper margins
    doc = SimpleDocTemplate(
        output_path,
        pagesize=letter,
        topMargin=0.6 * inch,
        bottomMargin=0.5 * inch,
        leftMargin=LEFT_MARGIN,
        rightMargin=RIGHT_MARGIN,
    )

    styles = get_q101_styles()

    # Build story
    story = []

    # Title page
    story.extend(build_title_page(topic, session_id, date, styles))

    # Conversation turns - track if last turn for separator logic
    for i, turn in enumerate(turns):
        is_last = (i == len(turns) - 1)
        turn_elements = build_turn_elements(turn, styles, is_last)
        story.extend(turn_elements)

    # Build PDF with header/footer
    def add_header_footer(canvas, doc):
        create_header_footer(canvas, doc, session_id, topic)

    doc.build(story, onFirstPage=add_header_footer, onLaterPages=add_header_footer)

    return output_path


def export_conversation_to_pdf(
    input_path: str,
    output_path: str,
    session_id: str,
    topic: str,
    date: Optional[str] = None,
    is_raw: bool = True
) -> str:
    """
    Main entry point for conversation PDF export.

    Args:
        input_path: Path to input file (raw text or ideate_conversation.md)
        output_path: Path for output PDF
        session_id: Session identifier
        topic: Ideation topic
        date: Session date (optional, defaults to today)
        is_raw: True if input is raw pasted text, False if pre-formatted

    Returns:
        Path to generated PDF
    """
    # Parse the conversation
    if is_raw:
        with open(input_path, 'r', encoding='utf-8') as f:
            raw_text = f.read()
        turns = parse_raw_conversation(raw_text)
    else:
        turns = parse_conversation_file(input_path)

    if not turns:
        raise ValueError("No conversation content found after filtering")

    # Generate PDF
    return create_conversation_pdf(turns, output_path, session_id, topic, date)


if __name__ == "__main__":
    import sys

    if len(sys.argv) < 5:
        print("Usage: python conversation_to_pdf.py <input_file> <output_pdf> <session_id> <topic> [--formatted]")
        sys.exit(1)

    input_file = sys.argv[1]
    output_file = sys.argv[2]
    session_id = sys.argv[3]
    topic = sys.argv[4]
    is_raw = "--formatted" not in sys.argv

    result = export_conversation_to_pdf(
        input_file,
        output_file,
        session_id,
        topic,
        is_raw=is_raw
    )

    print(f"PDF generated: {result}")
