# Product Requirements Prompt (PRP) Template

A context-engineered prompt template for AI-powered software development, based on Anthropic's best practices for agentic coding.

---

## How to Use This Template

1. **Copy this template** for each new project
2. **Replace placeholders** (marked with `{{PLACEHOLDER}}`) with your project details
3. **Delete sections** that don't apply to your project
4. **Add sections** specific to your domain
5. **Keep it minimal** - include only high-signal information

---

## Template Structure Overview

```
PRP-TEMPLATE.md
├── PART 1: SYSTEM IDENTITY        → Who the agent is
├── PART 2: TECHNOLOGY CONTEXT     → Stack, tools, constraints
├── PART 3: MODULE SPECIFICATIONS  → Detailed component specs
├── PART 4: DATA MODELS            → Schemas, types, examples
├── PART 5: IMPLEMENTATION GUIDE   → Patterns, best practices
├── PART 6: TESTING REQUIREMENTS   → Quality assurance
├── PART 7: CONTEXT RESOURCES      → References, examples
└── PART 8: SUCCESS CRITERIA       → Definition of done
```

---

# PRODUCT REQUIREMENTS PROMPT (PRP)

## {{PROJECT_NAME}}

**Version:** 1.0
**Last Updated:** {{DATE}}
**Author:** {{AUTHOR}}

---

## PART 1: SYSTEM IDENTITY

<system_identity>
## Agent Role & Objective

You are an expert {{DOMAIN}} engineer building {{PROJECT_DESCRIPTION}}.

### Primary Objective
{{PRIMARY_OBJECTIVE}}

### Core Responsibilities
1. {{RESPONSIBILITY_1}}
2. {{RESPONSIBILITY_2}}
3. {{RESPONSIBILITY_3}}

### Success Metrics
- {{METRIC_1}}
- {{METRIC_2}}
- {{METRIC_3}}

### Constraints
- {{CONSTRAINT_1}}
- {{CONSTRAINT_2}}
</system_identity>

---

## PART 2: TECHNOLOGY CONTEXT

<technology_stack>
## Technology Stack

### Core
- **Language:** {{LANGUAGE}} {{VERSION}}
- **Framework:** {{FRAMEWORK}}
- **Database:** {{DATABASE}}
- **Cache/Queue:** {{CACHE_QUEUE}}

### AI/ML (if applicable)
- **Primary LLM:** {{LLM_PROVIDER}} - `{{LLM_MODEL}}`
- **Fallback:** {{FALLBACK_PROVIDER}}
- **Other ML:** {{OTHER_ML_TOOLS}}

### External Services
- **Service 1:** {{SERVICE_1}} - {{PURPOSE_1}}
- **Service 2:** {{SERVICE_2}} - {{PURPOSE_2}}

### Development Tools
- **Testing:** {{TEST_FRAMEWORK}}
- **Linting:** {{LINTER}}
- **CI/CD:** {{CI_CD_TOOL}}
</technology_stack>

<llm_configuration>
## LLM Configuration (if applicable)

### Supported Providers
| Provider | Model | Use Case | Env Variable |
|----------|-------|----------|--------------|
| {{PROVIDER_1}} | `{{MODEL_1}}` | {{USE_CASE_1}} | `{{ENV_VAR_1}}` |
| {{PROVIDER_2}} | `{{MODEL_2}}` | {{USE_CASE_2}} | `{{ENV_VAR_2}}` |

### Configuration Parameters
```python
LLM_CONFIG = {
    "model": "{{DEFAULT_MODEL}}",
    "max_tokens": {{MAX_TOKENS}},
    "temperature": {{TEMPERATURE}},
}
```

### Fallback Chain
```
Primary ({{PRIMARY}}) → Fallback 1 ({{FALLBACK_1}}) → Error
```
</llm_configuration>

---

## PART 3: MODULE SPECIFICATIONS

<module_template>
## Module {{N}}: {{MODULE_NAME}}

### Purpose
{{MODULE_PURPOSE}}

### Input Schema
```{{LANGUAGE}}
{{INPUT_SCHEMA}}
```

### Output Schema
```{{LANGUAGE}}
{{OUTPUT_SCHEMA}}
```

### Core Logic
```
{{FLOWCHART_OR_PSEUDOCODE}}
```

### Dependencies
- Depends on: {{UPSTREAM_MODULES}}
- Depended by: {{DOWNSTREAM_MODULES}}

### Error Handling
| Error Type | Handling Strategy | User Message |
|------------|-------------------|--------------|
| {{ERROR_1}} | {{STRATEGY_1}} | {{MESSAGE_1}} |
| {{ERROR_2}} | {{STRATEGY_2}} | {{MESSAGE_2}} |

### Acceptance Criteria
- [ ] {{CRITERION_1}}
- [ ] {{CRITERION_2}}
- [ ] {{CRITERION_3}}
</module_template>

<!-- Repeat for each module -->

---

## PART 4: DATA MODELS

<data_models>
## Data Models

### {{MODEL_1_NAME}}
```{{LANGUAGE}}
{{MODEL_1_DEFINITION}}
```

### {{MODEL_2_NAME}}
```{{LANGUAGE}}
{{MODEL_2_DEFINITION}}
```

### Database Schema
```sql
{{SQL_SCHEMA}}
```

### API Response Format
```{{LANGUAGE}}
class APIResponse(BaseModel, Generic[T]):
    success: bool
    data: Optional[T]
    error: Optional[str]
    timestamp: datetime
```
</data_models>

---

## PART 5: IMPLEMENTATION GUIDE

<implementation_patterns>
## Implementation Patterns

### Error Handling Pattern
```{{LANGUAGE}}
{{ERROR_HANDLING_EXAMPLE}}
```

### Logging Pattern
```{{LANGUAGE}}
{{LOGGING_EXAMPLE}}
```

### Configuration Pattern
```{{LANGUAGE}}
{{CONFIG_EXAMPLE}}
```

### Async Pattern (if applicable)
```{{LANGUAGE}}
{{ASYNC_EXAMPLE}}
```
</implementation_patterns>

<environment_variables>
## Environment Variables

```bash
# =============================================================================
# .env.example - {{PROJECT_NAME}} Configuration
# =============================================================================

# -----------------------------------------------------------------------------
# API KEYS (Required)
# -----------------------------------------------------------------------------
{{REQUIRED_API_KEY_1}}={{PLACEHOLDER_1}}
{{REQUIRED_API_KEY_2}}={{PLACEHOLDER_2}}

# -----------------------------------------------------------------------------
# DATABASE
# -----------------------------------------------------------------------------
DATABASE_URL={{DATABASE_URL_PLACEHOLDER}}
REDIS_URL={{REDIS_URL_PLACEHOLDER}}

# -----------------------------------------------------------------------------
# LLM CONFIGURATION
# -----------------------------------------------------------------------------
LLM_PROVIDER={{DEFAULT_PROVIDER}}
LLM_MODEL={{DEFAULT_MODEL}}
LLM_TEMPERATURE={{DEFAULT_TEMP}}
LLM_MAX_TOKENS={{DEFAULT_TOKENS}}

# -----------------------------------------------------------------------------
# APPLICATION SETTINGS
# -----------------------------------------------------------------------------
LOG_LEVEL=INFO
DEBUG=false
```
</environment_variables>

<build_sequence>
## Build Sequence

Follow this order when implementing:

### Phase 1: Foundation
1. Set up project structure and configuration
2. Implement database models and migrations
3. Create base API routes and health checks
4. Set up logging and error handling

### Phase 2: Core Features
5. Implement Module 1: {{MODULE_1_NAME}}
6. Implement Module 2: {{MODULE_2_NAME}}
7. {{CONTINUE_MODULES}}

### Phase 3: Integration
8. Wire up module dependencies
9. Implement background workers (if applicable)
10. Add rate limiting and authentication

### Phase 4: Quality
11. Write unit tests (>80% coverage)
12. Write integration tests
13. Performance testing
14. Security audit

### Phase 5: Deployment
15. Docker configuration
16. CI/CD pipeline
17. Documentation
18. Monitoring setup
</build_sequence>

---

## PART 6: TESTING REQUIREMENTS

<testing_requirements>
## Testing & Deployment Validation

### Testing Pyramid
```
              ┌───────────────┐
              │   E2E Tests   │  ← Few, slow
              ├───────────────┤
           ┌──┴───────────────┴──┐
           │ Integration Tests   │  ← Medium
           ├─────────────────────┤
        ┌──┴─────────────────────┴──┐
        │       Unit Tests          │  ← Many, fast
        └───────────────────────────┘
```

### 1. Unit Tests

#### Coverage Requirements
| Module | Minimum Coverage | Critical Paths |
|--------|------------------|----------------|
| `{{MODULE_1}}` | {{COVERAGE_1}}% | {{CRITICAL_PATHS_1}} |
| `{{MODULE_2}}` | {{COVERAGE_2}}% | {{CRITICAL_PATHS_2}} |

#### Mocking Strategy
```{{LANGUAGE}}
@pytest.fixture
def mock_{{SERVICE}}():
    """Mock {{SERVICE}} for deterministic testing."""
    with patch("{{MODULE_PATH}}") as mock:
        mock.return_value = {{MOCK_RESPONSE}}
        yield mock
```

### 2. Integration Tests

```{{LANGUAGE}}
@pytest.mark.integration
class TestIntegration:
    async def test_full_workflow(self, test_client):
        """Test complete workflow from start to finish."""
        # 1. Setup
        # 2. Execute
        # 3. Verify
        pass
```

### 3. Security Tests

```{{LANGUAGE}}
@pytest.mark.security
class TestSecurity:
    @pytest.mark.parametrize("malicious_input", [
        "'; DROP TABLE users; --",  # SQL injection
        "<script>alert('xss')</script>",  # XSS
        "../../../etc/passwd",  # Path traversal
    ])
    def test_input_sanitization(self, malicious_input):
        """Verify malicious inputs are handled safely."""
        pass
```

### 4. Performance Tests

```{{LANGUAGE}}
@pytest.mark.performance
class TestPerformance:
    def test_response_time(self, benchmark):
        """Verify response times meet SLA."""
        result = benchmark(lambda: {{OPERATION}})
        assert result.mean < {{MAX_RESPONSE_TIME}}
```

### 5. AI Output Quality Tests (if applicable)

```{{LANGUAGE}}
@pytest.mark.quality
class TestAIQuality:
    def test_output_accuracy(self, labeled_dataset):
        """Verify AI output meets accuracy requirements."""
        correct = 0
        for input_data, expected in labeled_dataset:
            result = {{AI_FUNCTION}}(input_data)
            if result == expected:
                correct += 1
        accuracy = correct / len(labeled_dataset)
        assert accuracy >= {{MIN_ACCURACY}}
```

### 6. Smoke Tests

```{{LANGUAGE}}
@pytest.mark.smoke
class TestSmoke:
    def test_health_endpoint(self, client):
        response = client.get("/health")
        assert response.status_code == 200

    def test_database_connection(self, db):
        result = db.execute("SELECT 1")
        assert result.scalar() == 1
```

### Pre-Deployment Checklist

```markdown
### Automated Checks (Must Pass)
- [ ] All unit tests pass (>{{MIN_COVERAGE}}% coverage)
- [ ] All integration tests pass
- [ ] All security tests pass
- [ ] Smoke tests pass against staging
- [ ] Type checking passes
- [ ] Linting passes

### Manual Verification
- [ ] API documentation up-to-date
- [ ] Environment variables documented
- [ ] Database migrations tested
- [ ] Rollback procedure tested

### Performance Validation
- [ ] Load test passed
- [ ] Response times within SLA
- [ ] No memory leaks detected
```

### Test Commands
```bash
# Run all tests
pytest

# Run with coverage
pytest --cov={{SRC_DIR}} --cov-report=html

# Run by category
pytest -m unit
pytest -m integration
pytest -m security
pytest -m smoke

# Run in parallel
pytest -n auto
```
</testing_requirements>

---

## PART 7: CONTEXT RESOURCES

<reference_documentation>
## Key Documentation Links

### Primary Framework
- {{FRAMEWORK_DOCS}}: {{FRAMEWORK_URL}}

### Database
- {{DATABASE_DOCS}}: {{DATABASE_URL}}

### External APIs
- {{API_1_DOCS}}: {{API_1_URL}}
- {{API_2_DOCS}}: {{API_2_URL}}
</reference_documentation>

<example_inputs_outputs>
## Example Inputs & Outputs

### Example Input
```json
{{EXAMPLE_INPUT_JSON}}
```

### Example Output
```json
{{EXAMPLE_OUTPUT_JSON}}
```

### Error Response Example
```json
{
  "success": false,
  "data": null,
  "error": "{{ERROR_MESSAGE}}",
  "timestamp": "2025-01-01T00:00:00Z"
}
```
</example_inputs_outputs>

---

## PART 8: SUCCESS CRITERIA

<success_criteria>
## Definition of Done

### Functional Requirements
- [ ] {{FUNCTIONAL_REQ_1}}
- [ ] {{FUNCTIONAL_REQ_2}}
- [ ] {{FUNCTIONAL_REQ_3}}

### Non-Functional Requirements
- [ ] Response time < {{MAX_RESPONSE_TIME}}
- [ ] Uptime > {{MIN_UPTIME}}%
- [ ] Test coverage > {{MIN_COVERAGE}}%

### Quality Gates
1. All tests pass
2. Code review approved
3. Security scan clean
4. Performance benchmarks met
5. Documentation complete

### Deliverables
1. Working application code
2. Test suite with >{{MIN_COVERAGE}}% coverage
3. API documentation (OpenAPI spec)
4. Deployment configuration (Docker/K8s)
5. README with setup instructions
</success_criteria>

---

## APPENDIX: QUICK REFERENCE

### Project Structure
```
{{PROJECT_NAME}}/
├── src/
│   ├── main.py
│   ├── config.py
│   ├── models/
│   ├── api/
│   ├── services/
│   └── {{DOMAIN_MODULES}}/
├── tests/
│   ├── unit/
│   ├── integration/
│   └── conftest.py
├── .env.example
├── requirements.txt
├── Dockerfile
└── README.md
```

### API Endpoints Summary
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/{{RESOURCE}}` | Create {{RESOURCE}} |
| `GET` | `/api/v1/{{RESOURCE}}/{id}` | Get {{RESOURCE}} |
| `GET` | `/api/v1/{{RESOURCE}}` | List {{RESOURCE}}s |
| `DELETE` | `/api/v1/{{RESOURCE}}/{id}` | Delete {{RESOURCE}} |

### Key Commands
```bash
# Development
python -m src.main

# Testing
pytest --cov=src

# Linting
ruff check src/
mypy src/

# Docker
docker build -t {{PROJECT_NAME}} .
docker run -p 8000:8000 {{PROJECT_NAME}}
```

---

**Template Version:** 1.0
**Based on:** TikTok Video Analyzer PRP
**Context Engineering Principles:** P.A.R.T. Framework (Prompt, Archive, Resources, Tools)
