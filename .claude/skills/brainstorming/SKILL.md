---
name: brainstorming
description: Use when creating or developing, before writing code or implementation plans - refines rough ideas into fully-formed designs through collaborative questioning, alternative exploration, and incremental validation. Don't use during clear 'mechanical' processes
---

# Brainstorming Ideas Into Designs

## Overview

Help turn ideas into fully formed designs and specs through natural collaborative dialogue.

Start by understanding the current project context, then ask questions one at a time to refine the idea. Once you understand what you're building, present the design in small sections (200-300 words), checking after each section whether it looks right so far.

## The Process

**Understanding the idea:**
- Check out the current project state first (files, docs, recent commits)
- Ask questions one at a time to refine the idea
- Prefer multiple choice questions when possible, but open-ended is fine too
- Only one question per message - if a topic needs more exploration, break it into multiple questions
- Focus on understanding: purpose, constraints, success criteria

**Exploring approaches:**
- Propose 2-3 different approaches with trade-offs
- Present options conversationally with your recommendation and reasoning
- Lead with your recommended option and explain why

**Presenting the design:**
- Once you believe you understand what you're building, present the design
- Break it into sections of 200-300 words
- Ask after each section whether it looks right so far
- Cover: architecture, components, data flow, error handling, testing
- Be ready to go back and clarify if something doesn't make sense

## After the Design

**Documentation:**
- Write the validated design to `docs/plans/YYYY-MM-DD-<topic>-design.md`
- Use elements-of-style:writing-clearly-and-concisely skill if available
- Commit the design document to git

**Implementation (if continuing):**
- Ask: "Ready to set up for implementation?"
- Use superpowers:using-git-worktrees to create isolated workspace
- Use superpowers:writing-plans to create detailed implementation plan

## Key Principles

- **One question at a time** - Don't overwhelm with multiple questions
- **Multiple choice preferred** - Easier to answer than open-ended when possible
- **YAGNI ruthlessly** - Remove unnecessary features from all designs
- **Explore alternatives** - Always propose 2-3 approaches before settling
- **Incremental validation** - Present design in sections, validate each
- **Be flexible** - Go back and clarify when something doesn't make sense

---

## Optional Methodology Modes

When activated via command flags, apply these specialized approaches before or integrated with the standard 3-phase process.

### Pain-Point Mode (`--pain-point`)

Combines **5 Whys** + **G.R.O.W.** for pain-point-to-solution ideation:

1. **5 Whys** - Drill to root cause
   - Ask "Why is this a problem?" iteratively (3-5 times)
   - Don't accept surface-level answers
   - Output: True root cause identified

2. **G.R.O.W.** - Map pain to AI solution
   - **G**oal: What pain should AI solve?
   - **R**eality: Current state, data availability, constraints
   - **O**ptions: Which AI capabilities fit? (NLP, vision, prediction, automation)
   - **W**ay Forward: MVP definition, implementation path

3. **AI Capability Mapping** - Validate fit
   - Match root cause to AI capabilities
   - Check data requirements
   - Screen for ethics/risk concerns

4. **Standard 3-Phase** - Refine solution
   - Continue with Understand → Explore → Present

### Innovation Mode (`--innovate`)

Applies **SCAMPER** lens to existing solutions:

1. **SCAMPER Analysis** - Generate AI-enhanced ideas
   - **S**ubstitute: What can AI replace?
   - **C**ombine: What can AI merge/integrate?
   - **A**dapt: What AI patterns can we borrow?
   - **M**odify: How can AI magnify value or minimize friction?
   - **P**ut to other use: What else could this AI do?
   - **E**liminate: What can AI make unnecessary?
   - **R**everse: What if AI inverted the workflow?
   - Output: 10-15 potential AI enhancements

2. **Six Thinking Hats** - Evaluate ideas
   - ⚪ White: What data supports each idea?
   - ❤️ Red: Gut reaction to each idea
   - ⚫ Black: What could go wrong?
   - 💛 Yellow: What's the value?
   - 💚 Green: Alternative approaches?
   - 🔵 Blue: Which ideas to pursue?
   - Output: Top 3 ideas selected

3. **Reverse Brainstorming** - Risk discovery
   - "How could this AI feature fail?"
   - Invert failures into safeguards

4. **Standard 3-Phase** - Detail solution

### Discovery Mode (`--discover`)

Uses **Starbursting** + **JTBD** for open exploration:

1. **Starbursting** - Generate comprehensive questions
   - Who? What? Where? When? Why? How?
   - Output: 20-30 exploration questions

2. **Jobs-to-Be-Done** - Identify user motivations
   - What "job" are users trying to accomplish?
   - What are they "hiring" current solutions to do?
   - Where are they underserved?
   - Output: 3-5 key jobs identified

3. **AI Capability Mapping** - Match jobs to AI
   - Which jobs can AI do better?
   - Output: Prioritized opportunity list

4. **G.R.O.W.** - Deep dive on top opportunity

5. **Standard 3-Phase** - Develop solution

### Specific Methodology (`--method=<name>`)

Apply a single methodology by name:
- `grow` - G.R.O.W. model only
- `5whys` - 5 Whys root cause analysis
- `scamper` - SCAMPER innovation lenses
- `sixhats` - Six Thinking Hats evaluation
- `jtbd` - Jobs-to-Be-Done framework
- `reverse` - Reverse brainstorming
- `starbursting` - Question-first exploration

---

## Related Documentation

- [Q101-IDEATION-BRAINSTORMING-GUIDE.md](../../../documents/Q101-IDEATION-BRAINSTORMING-GUIDE.md) - Full methodology guide with templates
- [Q101-IDEATION-WORKFLOW-GUIDE.md](../../../documents/Q101-IDEATION-WORKFLOW-GUIDE.md) - Core ideation workflow
