# html2pptx HTML Patterns Reference

> **Purpose:** Prevent common html2pptx validation errors by using correct HTML patterns.

## CRITICAL RULE

The html2pptx.js library has strict validation:

| Element Type | Background | Border | Shadow | Use For |
|-------------|------------|--------|--------|---------|
| `<div>` | ✅ YES | ✅ YES | ✅ YES | Shapes, containers, styled boxes |
| `<p>`, `<h1>`-`<h6>` | ❌ NO | ❌ NO | ❌ NO | Text content only |
| `<ul>`, `<ol>` | ❌ NO | ❌ NO | ❌ NO | Lists only |

**Key Rule:** Text inside `<div>` MUST be wrapped in `<p>`, `<h1>`-`<h6>`, `<ul>`, or `<ol>` tags.

---

## Pattern 1: Colored Badge/Pill

Use for: effort labels, status badges, tags

### ❌ WRONG - Background on `<p>`
```html
<p class="badge" style="background: #27AE60; color: #FFF; padding: 3pt 8pt; border-radius: 10pt;">LOW</p>
```
**Error:** "Text element `<p>` has background. Backgrounds only supported on `<div>` elements."

### ✅ CORRECT - Div wrapper with `<p>` inside
```html
<div class="badge" style="background: #27AE60; border-radius: 10pt;">
  <p style="color: #FFF; margin: 0; padding: 3pt 8pt; font-weight: bold;">LOW</p>
</div>
```

### CSS Pattern
```css
.badge {
  background: #27AE60;
  border-radius: 10pt;
}
.badge p {
  color: #FFFFFF;
  font-size: 9pt;
  font-weight: bold;
  margin: 0;
  padding: 3pt 8pt;
}
```

---

## Pattern 2: Numbered Circle

Use for: step numbers, feature numbers, list markers

### ❌ WRONG - Background on `<p>`
```html
<p class="num" style="background: #16A085; color: #FFF; border-radius: 50%; width: 20pt; height: 20pt;">1</p>
```
**Error:** "Text element `<p>` has background."

### ✅ CORRECT - Div wrapper with `<p>` inside
```html
<div class="num" style="background: #16A085; border-radius: 50%; width: 20pt; height: 20pt; display: flex; align-items: center; justify-content: center;">
  <p style="color: #FFF; margin: 0; font-weight: bold;">1</p>
</div>
```

### CSS Pattern
```css
.feature-num {
  background: #16A085;
  border-radius: 50%;
  width: 20pt;
  height: 20pt;
  display: flex;
  align-items: center;
  justify-content: center;
}
.feature-num p {
  color: #FFFFFF;
  font-size: 10pt;
  font-weight: bold;
  margin: 0;
}
```

---

## Pattern 3: Box with Border

Use for: separators, bordered text areas, cards with borders

### ❌ WRONG - Border on `<p>`
```html
<p style="border-top: 1pt solid #ECF0F1; padding-top: 5pt;">Goal: Validate core value</p>
```
**Error:** "Text element `<p>` has border."

### ✅ CORRECT - Div wrapper with border, `<p>` inside
```html
<div style="border-top: 1pt solid #ECF0F1; padding-top: 5pt;">
  <p style="margin: 0;">Goal: Validate core value</p>
</div>
```

### CSS Pattern
```css
.bordered-text-wrapper {
  border-top: 1pt solid #ECF0F1;
  padding-top: 5pt;
}
.bordered-text-wrapper p {
  margin: 0;
}
```

---

## Pattern 4: Phase/Step Label

Use for: phase indicators, step markers, positioned labels

### ❌ WRONG - Unwrapped text in `<div>`
```html
<div class="phase-num" style="background: #16A085; border-radius: 10pt; padding: 3pt 10pt;">PHASE 1</div>
```
**Error:** "DIV element contains unwrapped text 'PHASE 1'. All text must be wrapped in `<p>`, `<h1>`-`<h6>`, `<ul>`, or `<ol>` tags."

### ✅ CORRECT - Text wrapped in `<p>`
```html
<div class="phase-num" style="background: #16A085; border-radius: 10pt;">
  <p style="color: #FFF; margin: 0; padding: 3pt 10pt; font-weight: bold;">PHASE 1</p>
</div>
```

### CSS Pattern
```css
.phase-num {
  background: #16A085;
  border-radius: 10pt;
}
.phase-num p {
  color: #FFFFFF;
  font-size: 10pt;
  font-weight: bold;
  margin: 0;
  padding: 3pt 10pt;
}
```

---

## Pattern 5: Card with Left Border Accent

Use for: info cards, user cards, feature cards

### ❌ WRONG - Border on container without proper text wrapping
```html
<div class="card" style="border-left: 4pt solid #E74C3C; background: #FFF; padding: 15pt;">
  Practice Leaders
  <p>Description here</p>
</div>
```
**Error:** "DIV element contains unwrapped text 'Practice Leaders'."

### ✅ CORRECT - All text in proper tags
```html
<div class="card" style="border-left: 4pt solid #E74C3C; background: #FFF; padding: 15pt;">
  <h3 style="margin: 0 0 8pt 0;">Practice Leaders</h3>
  <p style="margin: 0;">Description here</p>
</div>
```

---

## Quick Reference Table

| Visual Need | Correct Pattern |
|-------------|-----------------|
| Colored background | `<div style="background: #color"><p>text</p></div>` |
| Border around text | `<div style="border: ..."><p>text</p></div>` |
| Rounded corners | `<div style="border-radius: ..."><p>text</p></div>` |
| Box shadow | `<div style="box-shadow: ..."><p>text</p></div>` |
| Left border accent | `<div style="border-left: ..."><p>text</p></div>` |
| Circle shape | `<div style="border-radius: 50%"><p>text</p></div>` |
| Plain text | `<p>text</p>` directly |

---

## Validation Errors Reference

| Error Message | Cause | Fix |
|---------------|-------|-----|
| "Text element `<p>` has background" | Background on `<p>`, `<h1>`-`<h6>` | Move background to parent `<div>` |
| "Text element `<p>` has border" | Border on text element | Move border to parent `<div>` |
| "DIV contains unwrapped text" | Text directly in `<div>` | Wrap text in `<p>` or heading tag |
| "HTML content overflows body" | Content too large | Reduce padding, font size, or content |
| "Text box ends too close to bottom" | Less than 0.5" margin | Add more bottom padding |

---

## Body Setup Template

Always start slides with this structure:

```html
<!DOCTYPE html>
<html>
<head>
<style>
html { background: #ffffff; }
body {
  width: 720pt; height: 405pt;  /* 16:9 ratio */
  margin: 0; padding: 0;
  background: #ECF0F1;
  font-family: Arial, sans-serif;
  display: flex;               /* Prevents margin collapse */
  flex-direction: column;
}
</style>
</head>
<body>
  <!-- Content here -->
</body>
</html>
```

---

## Font Requirements

Only use web-safe fonts:
- ✅ Arial, Helvetica, Verdana, Tahoma, Trebuchet MS
- ✅ Times New Roman, Georgia
- ✅ Courier New
- ✅ Impact, Comic Sans MS
- ❌ Segoe UI, SF Pro, Roboto, custom fonts

---

*Reference document for Q101 PPTX Skill - prevents html2pptx validation errors*
