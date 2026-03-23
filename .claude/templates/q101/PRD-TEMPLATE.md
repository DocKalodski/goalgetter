# Product Requirements Document (PRD) Template

> **Usage:** Copy this template and replace placeholder text in `{curly braces}` with your project-specific content. Delete sections that don't apply.

---

# Product Requirements Document (PRD)
## {Product Name} - {Brief Tagline}

**Version:** 1.0
**Date:** {YYYY-MM-DD}
**Status:** Draft | In Review | Approved

---

## 1. Executive Summary

### 1.1 Product Overview
{2-3 sentences describing what the product does and its core value proposition.}

### 1.2 Problem Statement
{Who has this problem? What are their pain points?}

- {Pain point 1}
- {Pain point 2}
- {Pain point 3}

{Why current solutions fail or don't exist.}

### 1.3 Solution
An end-to-end automated pipeline that:
1. {Step 1}
2. {Step 2}
3. {Step 3}
4. {Step 4}
5. {Step 5}

---

## 2. Goals & Success Metrics

### 2.1 Primary Goals
| Goal | Description |
|------|-------------|
| {Goal 1} | {Measurable outcome} |
| {Goal 2} | {Measurable outcome} |
| {Goal 3} | {Measurable outcome} |
| {Goal 4} | {Measurable outcome} |

### 2.2 Key Performance Indicators (KPIs)
- **{KPI 1}:** {What it measures and target value}
- **{KPI 2}:** {What it measures and target value}
- **{KPI 3}:** {What it measures and target value}
- **{KPI 4}:** {What it measures and target value}
- **{KPI 5}:** {What it measures and target value}

---

## 3. User Personas

### 3.1 Primary: {Persona Title}
- **Name:** {Fictional name}
- **Role:** {Job title and context}
- **Needs:** {What they need to accomplish}
- **Pain Points:** {Current frustrations with existing solutions}

### 3.2 Secondary: {Persona Title}
- **Name:** {Fictional name}
- **Role:** {Job title and context}
- **Needs:** {What they need to accomplish}
- **Pain Points:** {Current frustrations}

### 3.3 Tertiary: {Persona Title}
- **Name:** {Fictional name}
- **Role:** {Job title and context}
- **Needs:** {What they need to accomplish}
- **Pain Points:** {Current frustrations}

---

## 4. Detailed Feature Requirements

### 4.1 Module 1: {Module Name}

#### 4.1.1 Input Fields
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| {field_name} | {Text/Dropdown/etc.} | Yes/No | {constraints} |
| {field_name} | {Text/Dropdown/etc.} | Yes/No | {constraints} |

#### 4.1.2 Input Examples
```json
{
  "{field_1}": "{value}",
  "{field_2}": "{value}",
  "{field_3}": ["{value1}", "{value2}"]
}
```

#### 4.1.3 Acceptance Criteria
- [ ] {Criterion 1}
- [ ] {Criterion 2}
- [ ] {Criterion 3}
- [ ] {Criterion 4}

---

### 4.2 Module 2: {Module Name}

#### 4.2.1 Workflow
```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│  {Step 1}       │───▶│  {Step 2}        │───▶│  {Step 3}       │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                                        │
                                                        ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│  {Step 6}       │◀───│  {Step 5}        │◀───│  {Step 4}       │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

#### 4.2.2 Data Sources
| Source | Purpose | API/Method |
|--------|---------|------------|
| {Source 1} | {Purpose} | {Integration method} |
| {Source 2} | {Purpose} | {Integration method} |

#### 4.2.3 Output Schema
```json
{
  "{output_object}": {
    "{field_1}": "{description}",
    "{field_2}": ["{item1}", "{item2}"],
    "{field_3}": {
      "{nested_field}": "{value}"
    },
    "{confidence_field}": 0.95
  }
}
```

#### 4.2.4 Technology Stack
- **{Component 1}:** {Technology} for {purpose}
- **{Component 2}:** {Technology} for {purpose}
- **{Component 3}:** {Technology} for {purpose}

#### 4.2.5 Acceptance Criteria
- [ ] {Criterion with specific metric}
- [ ] {Criterion with specific metric}
- [ ] {Criterion with specific metric}

---

### 4.3 Module 3: {Module Name}

#### 4.3.1 Strategy/Priority Order
```
Priority Order:
1. {Highest priority approach}
2. {Second priority approach}
3. {Third priority approach}
4. {Fourth priority approach}
5. {Fallback approach}
```

#### 4.3.2 Ranking/Scoring Criteria
| Factor | Weight | Description |
|--------|--------|-------------|
| {Factor 1} | {X}% | {What it measures} |
| {Factor 2} | {X}% | {What it measures} |
| {Factor 3} | {X}% | {What it measures} |
| {Factor 4} | {X}% | {What it measures} |
| {Factor 5} | {X}% | {What it measures} |

#### 4.3.3 Technical Implementation Options

**Option A: {Official/Preferred Method}**
- {Description}
- {Pros/cons}

**Option B: {Alternative Method}**
| Library/Tool | Language | Features | Stability |
|--------------|----------|----------|-----------|
| [{Name}]({URL}) | {Language} | {Features} | {High/Medium/Low} |

**Option C: Third-Party Services**
- [{Service 1}]({URL}) - {Description}
- [{Service 2}]({URL}) - {Description}

#### 4.3.4 Output Schema
```json
{
  "{results_object}": {
    "{query}": "{value}",
    "{total}": 1523,
    "{items}": [
      {
        "{id}": "{value}",
        "{url}": "{value}",
        "{metrics}": {
          "{metric_1}": 2500000,
          "{metric_2}": 150000
        },
        "{score}": 0.98
      }
    ]
  }
}
```

#### 4.3.5 Acceptance Criteria
- [ ] {Criterion with specific metric}
- [ ] {Criterion with specific metric}
- [ ] {Criterion with specific metric}

---

### 4.4 Module 4: {Module Name}

#### 4.4.1 Requirements
| Requirement | Priority | Description |
|-------------|----------|-------------|
| {Requirement 1} | High | {Description} |
| {Requirement 2} | High | {Description} |
| {Requirement 3} | Medium | {Description} |
| {Requirement 4} | Low | {Description} |

#### 4.4.2 Technical Implementation
```python
# Primary Method: {Tool/Library Name}
import {library}

def {function_name}({param}: str, {param}: str) -> dict:
    """
    {Docstring description}
    """
    {options} = {
        '{option_1}': {value},
        '{option_2}': {value},
    }

    # Implementation
    {implementation_code}

    return {result}
```

**Fallback Methods:**
1. [{Alternative 1}]({URL}) - {Description}
2. {Alternative 2} - {Description}

#### 4.4.3 File Storage Structure
```
{root_folder}/
├── {session_id}/
│   ├── metadata.json           # {Description}
│   ├── {subfolder_1}/
│   │   ├── {file_1}.{ext}
│   │   ├── {file_1}.json       # {Description}
│   │   └── ...
│   └── {subfolder_2}/
│       ├── {file_1}_{type}.json
│       └── ...
```

#### 4.4.4 Error Handling
| Error Type | Handling Strategy |
|------------|-------------------|
| {Error 1} | {Strategy} |
| {Error 2} | {Strategy} |
| {Error 3} | {Strategy} |
| {Error 4} | {Strategy} |

#### 4.4.5 Acceptance Criteria
- [ ] {Criterion with specific metric}
- [ ] {Criterion with specific metric}
- [ ] {Criterion with specific metric}

---

### 4.5 Module 5: {Analysis/Processing Module Name}

#### 4.5.1 Analysis Pipeline
```
┌────────────────┐    ┌────────────────┐    ┌────────────────┐
│  {Stage 1}     │───▶│  {Stage 2}     │───▶│  {Stage 3}     │
└────────────────┘    └────────────────┘    └────────────────┘
        │                                            │
        ▼                                            ▼
┌────────────────┐    ┌────────────────┐    ┌────────────────┐
│  {Stage 4}     │───▶│  {Stage 5}     │───▶│  {Stage 6}     │
└────────────────┘    └────────────────┘    └────────────────┘
        │                                            │
        ▼                                            ▼
┌────────────────┐    ┌────────────────┐    ┌────────────────┐
│  {Stage 7}     │───▶│  {Stage 8}     │───▶│  {Stage 9}     │
└────────────────┘    └────────────────┘    └────────────────┘
```

#### 4.5.2 {Sub-component} Strategy

**Selection Methods:**
1. **{Method 1}:** {Description} (simple, fast)
2. **{Method 2}:** {Description}
3. **{Method 3}:** {Description} (recommended)

```python
import {libraries}

def {function_name}({param}: str, {param}: int = 10) -> list:
    """{Docstring with algorithm description}"""

    {implementation}

    return {result}
```

#### 4.5.3 Analysis Components

| Component | Technology | Output |
|-----------|------------|--------|
| {Component 1} | {Tech stack} | {Output description} |
| {Component 2} | {Tech stack} | {Output description} |
| {Component 3} | {Tech stack} | {Output description} |
| {Component 4} | {Tech stack} | {Output description} |

#### 4.5.4 {Secondary Analysis} Components

| Component | Technology | Output |
|-----------|------------|--------|
| {Component 1} | {Tech stack} | {Output description} |
| {Component 2} | {Tech stack} | {Output description} |

#### 4.5.5 LLM-Powered Synthesis

**Recommended Approach: {Model/API Name}**
- {Key capability 1}
- {Reference link}

```python
import {library}

def {analyze_function}({params}: list, {params}: str) -> dict:
    """{Description}"""

    # Prepare data
    {data_preparation}

    response = {api_call}(
        model="{model_name}",
        messages=[
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": f"""
                    {prompt_template}
                    """},
                    *{additional_content}
                ]
            }
        ],
        max_tokens={tokens}
    )

    return response.{result_path}
```

#### 4.5.6 Analysis Output Schema
```json
{
  "{analysis_object}": {
    "{id}": "{value}",
    "{timestamp}": "{ISO_datetime}",

    "{analysis_section_1}": {
      "{field_1}": ["{hex_color}", "{hex_color}"],
      "{field_2}": [
        {"label": "{value}", "confidence": 0.95}
      ],
      "{field_3}": "{category}"
    },

    "{analysis_section_2}": {
      "{field_1}": true,
      "{field_2}": "{transcribed text...}",
      "{field_3}": "{language_code}"
    },

    "{insights_section}": {
      "{field_1}": "{category}",
      "{field_2}": "{template_name}",
      "{field_3}": ["item1", "item2"]
    },

    "recommendations": [
      "{Specific actionable recommendation 1}",
      "{Specific actionable recommendation 2}"
    ]
  }
}
```

#### 4.5.7 Acceptance Criteria
- [ ] {Criterion with specific metric}
- [ ] {Criterion with specific metric}
- [ ] {Criterion with specific metric}
- [ ] {Criterion with specific metric}
- [ ] {Criterion with specific metric}

---

### 4.6 Module 6: {Strategic/Advanced Analysis Module Name}

{Description of what this advanced analysis provides beyond basic analysis.}

#### 4.6.1 Analysis Framework Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    {ANALYSIS PIPELINE NAME}                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────┐   ┌──────────────┐   ┌──────────────┐                │
│  │   {STAGE 1}  │   │  {STAGE 2}   │   │  {STAGE 3}   │                │
│  │   {Detail}   │──▶│  {Detail}    │──▶│  {Detail}    │                │
│  └──────────────┘   └──────────────┘   └──────────────┘                │
│         │                  │                  │                         │
│         ▼                  ▼                  ▼                         │
│  ┌──────────────┐   ┌──────────────┐   ┌──────────────┐                │
│  │  {STAGE 4}   │   │   {STAGE 5}  │   │  {STAGE 6}   │                │
│  │  {Detail}    │◀──│   {Detail}   │◀──│  {Detail}    │                │
│  └──────────────┘   └──────────────┘   └──────────────┘                │
│         │                                                               │
│         ▼                                                               │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │              {RECOMMENDATIONS/OUTPUT ENGINE}                      │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

#### 4.6.2 {Key Analysis Component 1}

{Description of this analysis component and why it matters.}

##### 4.6.2.1 Classification Types

| Type | Description | Detection Method | Example |
|------|-------------|------------------|---------|
| **{Type 1}** | {Description} | {How to detect} | "{Example}" |
| **{Type 2}** | {Description} | {How to detect} | "{Example}" |
| **{Type 3}** | {Description} | {How to detect} | "{Example}" |
| **{Type 4}** | {Description} | {How to detect} | "{Example}" |
| **{Type 5}** | {Description} | {How to detect} | "{Example}" |

##### 4.6.2.2 Scoring Model

```python
class {AnalysisComponent}:
    """{Description}"""

    def {analyze_method}(self, {param}: str, {param}: list) -> {ReturnType}:
        return {ReturnType}(
            # Core metrics
            {field_1}: str,                    # {Description}
            {field_2}: float,                  # 0-100 {description}

            # Detection elements
            {field_3}: bool,                   # {Description}
            {field_4}: bool,                   # {Description}
            {field_5}: float,                  # {Description} 0-1

            # Timing metrics
            {field_6}: int,                    # {Description}

            # Predictions
            {field_7}: float,                  # {Description}
            {field_8}: list[str]               # {Description}
        )
```

##### 4.6.2.3 Best Practices Detection

| Best Practice | How to Detect | Why It Works |
|---------------|---------------|--------------|
| {Practice 1} | {Detection method} | {Explanation} |
| {Practice 2} | {Detection method} | {Explanation} |
| {Practice 3} | {Detection method} | {Explanation} |

---

#### 4.6.3 {Key Analysis Component 2}

##### 4.6.3.1 Structure/Framework Detection

| Structure Type | Pattern | Detection Method |
|----------------|---------|------------------|
| **{Type 1}** | {Pattern description} | {Detection method} |
| **{Type 2}** | {Pattern description} | {Detection method} |
| **{Type 3}** | {Pattern description} | {Detection method} |

##### 4.6.3.2 Metrics Analysis

```python
class {MetricsAnalysis}:
    """{Description}"""

    def {analyze_method}(self, {param}: str) -> {MetricsType}:
        return {MetricsType}(
            # Quantitative metrics
            {metric_1}: int,                      # {Description}
            {metric_2}: int,                      # {Description}
            {metric_3}: float,                    # {Description}

            # Pattern analysis
            {pattern_1}: str,                     # "{option1}", "{option2}", "{option3}"
            {pattern_2}: float,                   # {Description}
            {pattern_3}: bool,                    # {Description}

            # Comparison
            {comparison_1}: float,                # {Description}
            {comparison_2}: float                 # 0-100 {description}
        )
```

##### 4.6.3.3 Breakdown Schema

```json
{
  "{breakdown_object}": [
    {
      "{segment_number}": 1,
      "{timestamp_start}": 0,
      "{timestamp_end}": 2100,
      "{duration}": 2100,
      "{segment_type}": "{type}",
      "{description}": "{What happens in this segment}",
      "{elements}": {
        "{element_1}": "{value}",
        "{element_2}": true,
        "{element_3}": "{detected_value}"
      },
      "{purpose}": "{segment_purpose}",
      "{effectiveness_score}": 87
    }
  ]
}
```

---

#### 4.6.4 {Scoring/Factors Analysis}

##### 4.6.4.1 Algorithm/Platform Signals

| Signal | Weight | How We Measure |
|--------|--------|----------------|
| **{Signal 1}** | Very High | {Measurement approach} |
| **{Signal 2}** | Very High | {Measurement approach} |
| **{Signal 3}** | High | {Measurement approach} |
| **{Signal 4}** | Medium | {Measurement approach} |

##### 4.6.4.2 Score Components

```python
class {ScoreAnalysis}:
    """{Description}"""

    def {calculate_method}(self, {param}: dict) -> {ScoreType}:
        return {ScoreType}(
            # Overall score
            {overall_score}: float,              # 0-100 {description}
            {tier}: str,                         # "{tier1}", "{tier2}", "{tier3}", "{tier4}"

            # Individual factor scores (0-100 each)
            factors: {
                "{factor_1}": 85,
                "{factor_2}": 78,
                "{factor_3}": 82,
                "{factor_4}": 65,
                "{factor_5}": 88,
            },

            # Elements detected
            {positive_elements}: [
                "{Element description 1}",
                "{Element description 2}",
            ],

            # Missing elements
            {missing_elements}: [
                "{Missing element 1}",
                "{Missing element 2}",
            ],

            # Comparison
            {percentile}: 78,                    # {Description}
            {benchmarks}: list[str]              # {Description}
        )
```

##### 4.6.4.3 Trigger Analysis

| Trigger | Detection Method | Impact |
|---------|------------------|--------|
| **{Trigger 1}** | {Detection approach} | {Expected outcome} |
| **{Trigger 2}** | {Detection approach} | {Expected outcome} |
| **{Trigger 3}** | {Detection approach} | {Expected outcome} |
| **{Trigger 4}** | {Detection approach} | {Expected outcome} |

---

#### 4.6.5 Best Practices Detection

##### 4.6.5.1 Practices Checklist

```python
class {BestPracticesAnalysis}:
    """{Description}"""

    def {analyze_method}(self, {param}: {Type}) -> {ReportType}:
        return {ReportType}(
            # Category 1 practices
            {category_1}_practices: {
                "{practice_1}": bool,           # {Description}
                "{practice_2}": bool,           # {Description}
                "{practice_3}": bool,           # {Description}
            },

            # Category 2 practices
            {category_2}_practices: {
                "{practice_1}": bool,           # {Description}
                "{practice_2}": bool,           # {Description}
            },

            # Category 3 practices
            {category_3}_practices: {
                "{practice_1}": bool,           # {Description}
                "{practice_2}": bool,           # {Description}
            },

            # Overall compliance
            {overall_score}: float,             # 0-100 overall score
            {practices_followed}: int,          # Count of practices followed
            {practices_total}: int,             # Total practices checked
            {priority_improvements}: list[str]  # Top things to improve
        )
```

##### 4.6.5.2 Category-Specific Best Practices

| Content Category | Key Best Practices |
|------------------|-------------------|
| **{Category 1}** | {Practice 1}, {Practice 2}, {Practice 3} |
| **{Category 2}** | {Practice 1}, {Practice 2}, {Practice 3} |
| **{Category 3}** | {Practice 1}, {Practice 2}, {Practice 3} |

---

#### 4.6.6 {Psychological/Behavioral Analysis}

##### 4.6.6.1 Trigger Detection

| Trigger | Pattern | Detection |
|---------|---------|-----------|
| **{Trigger 1}** | {Pattern description} | {Detection method} |
| **{Trigger 2}** | {Pattern description} | {Detection method} |
| **{Trigger 3}** | {Pattern description} | {Detection method} |

##### 4.6.6.2 Retention Pattern Analysis

```python
class {RetentionAnalysis}:
    """{Description}"""

    def {analyze_method}(self, {param}: {Type}) -> {PatternsType}:
        return {PatternsType}(
            # Technique 1
            {techniques_1}: [
                {"timestamp_ms": 3200, "type": "{type}", "description": "{Description}"},
            ],

            # Technique 2
            {techniques_2}: [
                {"timestamp_ms": 5000, "type": "{type}", "description": "{Description}"},
            ],

            # Predictions
            {prediction_1}: [
                {"timestamp_ms": 6000, "reason": "{Reason}", "severity": "{level}"}
            ],

            # Scores
            {score_1}: float,                  # {Description}
            {score_2}: list[str],              # {Description}

            # Overall
            {predicted_metric}: float,         # {Description}
            {overall_score}: float             # 0-100 {description}
        )
```

---

#### 4.6.7 Comprehensive Analysis Output Schema

```json
{
  "{strategic_analysis}": {
    "{id}": "{value}",
    "{version}": "2.0",
    "{timestamp}": "{ISO_datetime}",

    "executive_summary": {
      "{score}": 82,
      "{tier}": "{tier_value}",
      "key_strengths": [
        "{Specific strength 1}",
        "{Specific strength 2}"
      ],
      "key_weaknesses": [
        "{Specific weakness 1}",
        "{Specific weakness 2}"
      ],
      "overall_assessment": "{Detailed assessment paragraph}"
    },

    "{analysis_section_1}": {
      "{type}": "{classified_type}",
      "{score}": 88,
      "{duration}": 2100,
      "elements_detected": {
        "{element_1}": true,
        "{element_2}": "{detected_value}",
        "{element_3}": "{category}"
      },
      "effectiveness_breakdown": {
        "{metric_1}": 90,
        "{metric_2}": 85
      },
      "improvements": [
        "{Specific improvement 1}",
        "{Specific improvement 2}"
      ]
    },

    "{analysis_section_2}": {
      "detected_structure": "{structure_type}",
      "breakdown": {
        "{segment_1}": {"start": 0, "end": 2100, "effectiveness": 88},
        "{segment_2}": {"start": 2100, "end": 6000, "effectiveness": 75}
      },
      "{metrics}": {
        "{metric_1}": 12,
        "{metric_2}": 1900,
        "{metric_3}": 0.52,
        "{score}": 74
      }
    },

    "{scoring_section}": {
      "overall_score": 82,
      "factor_scores": {
        "{factor_1}": 88,
        "{factor_2}": 78,
        "{factor_3}": 80
      },
      "elements_present": [
        "{Element 1}",
        "{Element 2}"
      ],
      "missing_elements": [
        "{Missing element 1}",
        "{Missing element 2}"
      ]
    },

    "{compliance_section}": {
      "overall_score": 78,
      "practices_followed": 18,
      "practices_total": 24,
      "by_category": {
        "{category_1}": {"score": 92, "followed": 5, "total": 6},
        "{category_2}": {"score": 80, "followed": 4, "total": 5}
      },
      "critical_missing": [
        "{Critical missing practice 1}",
        "{Critical missing practice 2}"
      ]
    },

    "{triggers_section}": {
      "primary_triggers": ["{trigger_1}", "{trigger_2}"],
      "detected_patterns": [
        {"type": "{type}", "timestamp_ms": 18500, "intensity": "{level}"}
      ],
      "techniques": {
        "{technique_1}": 4,
        "{technique_2}": 3
      }
    },

    "actionable_recommendations": {
      "priority_1_critical": [
        {
          "issue": "{Identified issue}",
          "recommendation": "{Specific action to take}",
          "expected_impact": "{Quantified impact}",
          "implementation_difficulty": "{easy/medium/hard}"
        }
      ],
      "priority_2_important": [
        {
          "issue": "{Identified issue}",
          "recommendation": "{Specific action to take}",
          "expected_impact": "{Quantified impact}",
          "implementation_difficulty": "{easy/medium/hard}"
        }
      ],
      "what_to_replicate": [
        "{Element to replicate 1}",
        "{Element to replicate 2}"
      ]
    },

    "competitive_insights": {
      "differentiators": [
        "{Differentiator 1}",
        "{Differentiator 2}"
      ],
      "benchmarks": {
        "avg_score_in_category": 65,
        "this_item_percentile": 82
      }
    }
  }
}
```

---

#### 4.6.8 LLM Prompt for Strategic Analysis

```python
{ANALYSIS_PROMPT} = """
You are an expert {domain} strategist and analyst. Analyze this {item_type} for strategic insights.

## Context
- {Context field 1}: {context_value}
- {Context field 2}: {context_value}
- {Context field 3}: {context_value}
- {Transcription/Text}: {transcription}
- {Detected elements}: {elements}

## Data
You are seeing {num_items} {items} extracted at: {timestamps}

## Your Analysis Tasks

### 1. {ANALYSIS TASK 1}
- What type of {element} is used?
- Rate {element} strength 0-100 and explain why
- What makes this effective?
- What's missing that could improve it?

### 2. {ANALYSIS TASK 2}
Evaluate each factor 0-100:
- {Factor 1} ({description})
- {Factor 2} ({description})
- {Factor 3} ({description})

### 3. {ANALYSIS TASK 3}
- What framework is used?
- Identify the structure
- Where are the key moments?

### 4. {ANALYSIS TASK 4}
Check for these best practices:
- {Practice 1}?
- {Practice 2}?
- {Practice 3}?

### 5. WHY THIS WORKS (or doesn't)
Explain the key factors. Be specific.

### 6. ACTIONABLE RECOMMENDATIONS
Provide 3-5 specific, implementable recommendations.
For each:
- What to change
- Why it matters
- Expected impact

### 7. REPLICATION GUIDE
What elements should be replicated?
What should be avoided?

Provide your analysis in a structured JSON format.
"""
```

---

#### 4.6.9 Acceptance Criteria

- [ ] Correctly classifies {element} type with >{X}% accuracy
- [ ] {Score} correlates with actual performance (r > {threshold})
- [ ] Identifies at least {N} specific factors per item
- [ ] Detects structure/framework used
- [ ] Best practices checklist completeness >{X}%
- [ ] Generates minimum {N} actionable recommendations
- [ ] Recommendations are specific and implementable
- [ ] Analysis explains WHY the item performs well/poorly
- [ ] {Triggers/patterns} identified and explained
- [ ] Benchmarking against category averages
- [ ] Analysis completes within {X} minutes per item

---

## 5. System Architecture

### 5.1 High-Level Architecture
```
┌─────────────────────────────────────────────────────────────────┐
│                        User Interface                            │
│  ({Interface types})                                             │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API Gateway / Router                        │
│  ({Framework})                                                   │
└─────────────────────────────────────────────────────────────────┘
                                │
        ┌───────────────────────┼───────────────────────┐
        ▼                       ▼                       ▼
┌───────────────┐    ┌───────────────────┐    ┌───────────────────┐
│   {Agent 1}   │    │   {Agent 2}       │    │   {Agent 3}       │
│   Service     │    │   Service         │    │   Service         │
└───────────────┘    └───────────────────┘    └───────────────────┘
        │                       │                       │
        ▼                       ▼                       ▼
┌───────────────┐    ┌───────────────────┐    ┌───────────────────┐
│  {External 1} │    │  {External 2}     │    │  {External 3}     │
│  APIs         │    │  APIs             │    │  Models           │
└───────────────┘    └───────────────────┘    └───────────────────┘
                                │
                                ▼
                    ┌───────────────────┐
                    │   File Storage    │
                    │   ({Storage})     │
                    └───────────────────┘
                                │
                                ▼
                    ┌───────────────────┐
                    │   Database        │
                    │   ({Database})    │
                    └───────────────────┘
```

### 5.2 Technology Stack Recommendations

#### Backend
| Component | Recommended | Alternatives |
|-----------|-------------|--------------|
| Language | {Language + version} | {Alternatives} |
| Framework | {Framework} | {Alternatives} |
| Task Queue | {Queue + Broker} | {Alternatives} |
| Database | {Database} | {Alternatives} |
| Cache | {Cache} | {Alternatives} |
| File Storage | {Storage} | {Alternatives} |

#### AI/ML
| Component | Recommended | Alternatives |
|-----------|-------------|--------------|
| LLM | {Model} | {Alternatives} |
| Vision | {Model/API} | {Alternatives} |
| Speech-to-Text | {Model/API} | {Alternatives} |
| {Domain-specific} | {Model} | {Alternatives} |

#### Infrastructure
| Component | Recommended | Alternatives |
|-----------|-------------|--------------|
| Container | {Container tech} | {Alternatives} |
| Orchestration | {Orchestration} | {Alternatives} |
| CI/CD | {CI/CD tool} | {Alternatives} |
| Monitoring | {Monitoring stack} | {Alternatives} |
| Logging | {Logging stack} | {Alternatives} |

### 5.3 API Design

#### REST Endpoints
```
POST   /api/v1/{resources}                    # Create new {resource}
GET    /api/v1/{resources}/{id}               # Get {resource} status/results
GET    /api/v1/{resources}/{id}/{sub}         # List {sub-resources}
GET    /api/v1/{resources}/{id}/{analysis}    # Get analysis results
DELETE /api/v1/{resources}/{id}               # Cancel/cleanup

POST   /api/v1/{component_1}/{action}         # {Description}
POST   /api/v1/{component_2}/{action}         # {Description}
POST   /api/v1/{component_3}/{action}         # {Description}
```

#### WebSocket Events
```
{resource}.started          # Processing started
{resource}.{stage_1}.done   # {Stage 1} completed
{resource}.{stage_2}.found  # {Stage 2} discovered
{resource}.{stage_3}.progress # {Stage 3} progress update
{resource}.completed        # All processing complete
{resource}.failed           # Failed with error
```

---

## 6. Data Models

### 6.1 Core Entities

```python
# {Primary Entity} Model
class {PrimaryEntity}(BaseModel):
    id: UUID
    status: Literal["{status_1}", "{status_2}", "{status_3}", "{status_4}", "{status_5}"]
    created_at: datetime
    updated_at: datetime

    # Input
    {input_field_1}: str
    {input_field_2}: str
    {input_field_3}: str
    {input_field_4}: list[str]
    {input_field_5}: str

    # Results
    {result_1}: Optional[{ResultType1}]
    {result_2}: list[{ResultType2}]
    error: Optional[str]

# {Secondary Entity} Model
class {SecondaryEntity}(BaseModel):
    id: str  # {External ID}
    {parent}_id: UUID
    url: str
    {field_1}: str
    {field_2}: str
    {field_3}: list[str]
    metrics: {MetricsType}
    {timestamp}: datetime
    {duration}: int

    # Processing status
    {process_1}_status: Literal["pending", "processing", "completed", "failed"]
    local_path: Optional[str]
    file_size_bytes: Optional[int]

    # Analysis
    {analysis}_status: Literal["pending", "analyzing", "completed", "failed"]
    analysis: Optional[{AnalysisType}]

# {Analysis Entity} Model
class {AnalysisEntity}(BaseModel):
    {entity}_id: str
    analyzed_at: datetime
    {analysis_section_1}: {Section1Type}
    {analysis_section_2}: {Section2Type}
    {analysis_section_3}: {Section3Type}
    {insights}: {InsightsType}
    recommendations: list[str]
```

---

## 7. Security & Compliance

### 7.1 Security Requirements
| Requirement | Implementation |
|-------------|----------------|
| API Authentication | {Auth method} |
| Rate Limiting | {Limits} |
| Data Encryption | {Standards} |
| Input Validation | {Approach} |
| Secrets Management | {Tool/service} |

### 7.2 Compliance Considerations

#### {Platform/Service} Terms of Service
> **Important:** {Key compliance notes about using the platform/service. What's allowed, what requires approval, what alternatives exist for production use.}

#### Data Privacy
- {Privacy requirement 1}
- {Privacy requirement 2}
- {Privacy requirement 3}
- {Privacy requirement 4}

### 7.3 Legal Disclaimers
- {Disclaimer 1}
- {Disclaimer 2}
- {Disclaimer 3}
- {Disclaimer 4}

---

## 8. Performance Requirements

### 8.1 Response Time SLAs
| Operation | Target | Max |
|-----------|--------|-----|
| {Operation 1} | <{time} | {time} |
| {Operation 2} | <{time} | {time} |
| {Operation 3} | <{time} | {time} |
| {Operation 4} (each) | <{time} | {time} |
| {Operation 5} (each) | <{time} | {time} |
| **Total Pipeline** | **<{time}** | **{time}** |

### 8.2 Scalability Targets
| Metric | Initial | Scale Target |
|--------|---------|--------------|
| Concurrent {Jobs} | {N} | {N} |
| {Items}/Day | {N} | {N} |
| Storage | {size} | {size} |
| API Requests/Day | {N} | {N} |

### 8.3 Reliability
- **Uptime SLA:** {percentage}%
- **Data Durability:** {percentage}%
- **Error Rate:** <{percentage}% of jobs fail
- **Recovery Time:** <{time} for service restoration

---

## 9. Development Phases

### Phase 1: MVP (Core Pipeline)
**Scope:**
- [ ] Basic input interface ({interface types})
- [ ] {Core feature 1}
- [ ] {Core feature 2}
- [ ] {Core feature 3}
- [ ] Basic {analysis type}
- [ ] {Output format} output

**Deliverables:**
- Working end-to-end pipeline
- {Interface} interface
- Basic documentation

### Phase 2: Enhanced Analysis
**Scope:**
- [ ] {Enhanced feature 1}
- [ ] {Enhanced feature 2}
- [ ] {Enhanced feature 3}
- [ ] {Enhanced feature 4}
- [ ] Structured {output} reports
- [ ] Web UI dashboard

**Deliverables:**
- Rich {output} reports
- Web-based interface
- API documentation

### Phase 3: Scale & Polish
**Scope:**
- [ ] Multi-{item} batch processing
- [ ] Historical data comparison
- [ ] {Trend/pattern} analysis
- [ ] Export to {formats}
- [ ] Team collaboration features
- [ ] Webhook integrations

**Deliverables:**
- Enterprise-ready platform
- Advanced analytics
- Integration ecosystem

### Phase 4: Intelligence Layer
**Scope:**
- [ ] Competitive benchmarking
- [ ] {Recommendations} engine
- [ ] {Prediction} capabilities
- [ ] A/B testing insights
- [ ] {Business metric} tracking

---

## 10. Risks & Mitigations

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| {External API} changes/blocks | High | High | {Mitigation strategy} |
| {Process} failures | Medium | Medium | {Mitigation strategy} |
| AI model costs | Medium | Medium | {Mitigation strategy} |
| Legal/compliance issues | High | Low | {Mitigation strategy} |
| {Domain-specific risk} | Medium | Low | {Mitigation strategy} |

---

## 11. Success Criteria for MVP

| Criteria | Target | Measurement |
|----------|--------|-------------|
| Pipeline Completion | {X}% | {How measured} |
| {Quality metric 1} | {X}% | {How measured} |
| {Quality metric 2} | {X}% | {How measured} |
| {Quality metric 3} | {X}% | {How measured} |
| Response Time | <{time} | {How measured} |

---

## 12. Appendix

### 12.1 Glossary
| Term | Definition |
|------|------------|
| {Term 1} | {Definition} |
| {Term 2} | {Definition} |
| {Term 3} | {Definition} |
| {Term 4} | {Definition} |
| {Term 5} | {Definition} |

### 12.2 References

#### Technical Implementation
- [{Reference 1}]({URL})
- [{Reference 2}]({URL})
- [{Reference 3}]({URL})

#### {Domain} Research
- [{Reference 1}]({URL})
- [{Reference 2}]({URL})
- [{Reference 3}]({URL})

#### {Topic} Strategies
- [{Reference 1}]({URL})
- [{Reference 2}]({URL})

### 12.3 Related Tools & Services
- [{Tool 1}]({URL}) - {Description}
- [{Tool 2}]({URL}) - {Description}
- [{Tool 3}]({URL}) - {Description}

---

**Document History**
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | {Date} | {Author} | Initial PRD creation |
