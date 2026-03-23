# Agentic AI Guide Template

> **Usage:** Copy this template for new AI agent modules. Replace placeholder text in `{curly braces}` with your project-specific content. Delete sections that don't apply.

---

# Agentic AI Guide
## {Module Name}

A comprehensive guide to understanding and implementing AI agents for {module description}, with a focus on {key capabilities}.

---

## Table of Contents

1. [What is Agentic AI?](#what-is-agentic-ai)
2. [Agents in This Module](#agents-in-this-module)
3. [What Makes Our Agents "Agentic"](#what-makes-our-agents-agentic)
4. [Agent Architecture Patterns](#agent-architecture-patterns)
5. [{Domain}-Specific Processing Pipeline](#domain-specific-processing-pipeline)
6. [Celery: The Backbone of {Domain} Processing](#celery-the-backbone-of-processing)
7. [{Advanced Topic 1}](#advanced-topic-1)
8. [Best Practices for {Domain} AI Agents](#best-practices-for-domain-ai-agents)

---

## What is Agentic AI?

**Agentic AI** refers to AI systems that can autonomously perform complex, multi-step tasks with minimal human intervention. Unlike traditional AI models that respond to single prompts, agentic systems:

1. **Reason about goals**: They understand high-level objectives and break them into subtasks
2. **Take autonomous actions**: They execute tools, call APIs, and interact with external systems
3. **Adapt to context**: They adjust their behavior based on intermediate results
4. **Maintain state**: They track progress across multiple steps
5. **Handle failures**: They recover from errors and retry with different strategies

### The Spectrum of AI Agency

```
Low Agency                                                    High Agency
    │                                                              │
    ▼                                                              ▼
┌─────────┐    ┌─────────────┐    ┌──────────────┐    ┌──────────────────┐
│ {Low 1} │ →  │ {Low 2}     │ →  │ Multi-Step   │ →  │ Fully Autonomous │
│         │    │             │    │ Agent        │    │ Agent            │
└─────────┘    └─────────────┘    └──────────────┘    └──────────────────┘
   │                 │                   │                    │
   │                 │                   │                    │
 {Simple         {Rule-based        {AI-guided          {Self-improving
  example}        processing}        orchestration}       system}
```

This module implements **{Agency Level}** with elements of **{Higher Level}**.

---

## Agents in This Module

The {Module Name} uses a **multi-agent architecture** where specialized agents handle different aspects of the workflow:

### 1. {Agent 1 Name} (`src/agents/{agent_1_file}.py`)

**Purpose**: {Brief description of what this agent does}.

**Workflow**:
```
Input: {Input description}
    │
    ▼
┌─────────────────────────────────┐
│  1. {Step 1 Name}               │  ← {Technology/Tool used}
│     - {Sub-step 1}              │
│     - {Sub-step 2}              │
│     - {Sub-step 3}              │
└─────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────┐
│  2. {Step 2 Name}               │  ← {Technology/Tool used}
│     - {Sub-step 1}              │
│     - {Sub-step 2}              │
│     - {Sub-step 3}              │
└─────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────┐
│  3. {Step 3 Name}               │  ← {Technology/Tool used}
│     - {Sub-step 1}              │
│     - {Sub-step 2}              │
└─────────────────────────────────┘
    │
    ▼
Output: {Output type with description}
```

**Agentic Behavior**:
- {Autonomous behavior 1}
- {Autonomous behavior 2}
- {Autonomous behavior 3}

---

### 2. {Agent 2 Name} (`src/agents/{agent_2_file}.py`)

**Purpose**: {Brief description of what this agent does}.

**Workflow**:
```
Input: {Input description}
    │
    ▼
┌─────────────────────────────────┐
│  1. {Step 1 Name}               │  ← {Technology/Tool used}
│     - {Sub-step 1}              │
│     - {Sub-step 2}              │
└─────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────┐
│  2. {Step 2 Name}               │  ← {Technology/Tool used}
│     - {Sub-step 1}              │
│     - {Sub-step 2}              │
└─────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────┐
│  3. {Step 3 Name}               │  ← {Technology/Tool used}
│     - {Sub-step 1}              │
│     - {Sub-step 2}              │
└─────────────────────────────────┘
    │
    ▼
Output: {Output type with description}
```

**Agentic Behavior**:
- {Autonomous behavior 1}
- {Autonomous behavior 2}
- {Autonomous behavior 3}

---

### 3. {Agent 3 Name} (`src/agents/{agent_3_file}.py`)

**Purpose**: {Brief description of what this agent does}.

**Workflow**:
```
Input: {Input description}
    │
    ▼
┌─────────────────────────────────┐
│  1. {Step 1 Name}               │
│     - {Sub-step 1}              │
│     - {Sub-step 2}              │
└─────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────┐
│  2. {Step 2 Name}               │
│     - {Sub-step 1}              │
│     - {Sub-step 2}              │
└─────────────────────────────────┘
    │
    ▼
Output: {Output type with description}
```

**Agentic Behavior**:
- {Autonomous behavior 1}
- {Autonomous behavior 2}

---

## What Makes Our Agents "Agentic"

The agents in this module exhibit key characteristics that distinguish them from simple {scripts/wrappers/tools}:

### 1. {Characteristic 1: e.g., Autonomous Task Decomposition}

{Explanation of how agents exhibit this characteristic.}

```python
# {Description of code example}
async def {function_name}(self, {params}):
    # {Comment explaining agentic behavior}
    {step_1} = await self.{method_1}(...)

    # {Comment explaining decision making}
    if {condition}:
        {action_1}  # {Explanation}
    else:
        {action_2}

    # {Comment explaining next step}
    return {result}
```

### 2. {Characteristic 2: e.g., Multi-Step Reasoning}

{Explanation of how agents chain operations.}

```python
# {Description of code example}
async def {function_name}(self, {params}):
    # Step 1: {Description}
    {quick_check} = self.{method_1}({params})
    if {quick_check} > {threshold}:
        return {quick_check}  # Decision: {explanation}

    # Step 2: {Description} (only if needed)
    {deep_result} = await self.{method_2}({params})

    # Step 3: {Description}
    {score_1} = self.{method_3}({params})
    {final_result} = ({deep_result} * {weight_1}) + ({score_1} * {weight_2})

    return {final_result}
```

### 3. {Characteristic 3: e.g., Tool Use and Integration}

{Explanation of how agents orchestrate tools.}

```python
# {Description of code example}
async def {function_name}(self, {params}):
    # Tool 1: {Tool name and purpose}
    {result_1} = await self.{service_1}.{method}({params})

    # Tool 2: {Tool name and purpose}
    {result_2} = await self.{service_2}.{method}(
        {data}={result_1}.{field},
        {params}={params},
    )

    # Tool 3: {Tool name and purpose}
    {result_3} = self.{method}({result_2})

    return self.{build_result}({result_3}, ...)
```

### 4. {Characteristic 4: e.g., Error Handling and Recovery}

{Explanation of how agents handle failures.}

```python
# {Description - e.g., LLM Service implements fallback chain}
async def {function_name}(self, {params}):
    errors = []

    # Try each provider in the fallback chain
    for provider_name in self.fallback_chain:
        provider = self.providers.get(provider_name)
        if not provider or not provider.is_available():
            continue

        try:
            response = await provider.{method}({params})
            return response, provider_name
        except {ErrorType} as e:
            errors.append(e)
            logger.warning(f"Provider {provider_name} failed, trying next...")

    # {Fallback behavior description}
    {fallback_action}
```

### 5. {Characteristic 5: e.g., State Management}

{Explanation of how agents maintain state.}

```python
# {Description of state management}
async def {process_function}({id}: str):
    # State: Load {entity}
    {entity} = await db.get({id})

    # State: Phase 1
    {entity}.status = {Status}.{PHASE_1}
    {entity}.progress = {progress_value}
    await db.commit()

    {result_1} = await {agent_1}.{method}(...)
    {entity}.{result_field} = {result_1}  # Save intermediate state

    # State: Phase 2
    {entity}.status = {Status}.{PHASE_2}
    {entity}.progress = {progress_value}
    await db.commit()

    # ... continues through all phases
```

### 6. {Characteristic 6: e.g., Context-Aware Decision Making}

{Explanation of how agents use context.}

```python
# {Description of context usage}
prompt = self.{PROMPT_TEMPLATE}.format(
    {field_1}={metadata}.get("{field}"),
    {field_2}={context}.{field} if {context} else "Unknown",
    {field_3}={context}.{field} if {context} else "Unknown",
    # The agent uses {context type} to make {output} more relevant
)
```

---

## Agent Architecture Patterns

This module implements several proven patterns for agentic systems:

### Pattern 1: Pipeline Architecture

Agents are arranged in a sequential pipeline where each agent's output feeds the next:

```
┌──────────┐     ┌───────────┐     ┌──────────┐     ┌──────────┐
│ {Agent 1}│ ──▶ │ {Agent 2} │ ──▶ │ {Agent 3}│ ──▶ │ {Agent 4}│
│          │     │           │     │          │     │          │
└──────────┘     └───────────┘     └──────────┘     └──────────┘
     │                │                  │                │
     ▼                ▼                  ▼                ▼
 {Output 1}      {Output 2}        {Output 3}      {Output 4}
```

**Benefits**:
- Clear data flow
- Easy to test each stage
- Failures are isolated

### Pattern 2: Service Layer

External integrations are abstracted into services that agents consume:

```
┌─────────────────────────────────────────────────────────┐
│                        AGENTS                           │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐        │
│  │ {Agent 1}  │  │ {Agent 2}  │  │ {Agent 3}  │        │
│  └────────────┘  └────────────┘  └────────────┘        │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                       SERVICES                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────┐  │
│  │   LLM    │  │{Service 1}│  │{Service 2}│  │{Svc 3}│  │
│  │ Service  │  │          │  │          │  │       │  │
│  └──────────┘  └──────────┘  └──────────┘  └────────┘  │
└─────────────────────────────────────────────────────────┘
```

**Benefits**:
- Agents don't know about API details
- Easy to swap providers
- Centralized error handling

### Pattern 3: Provider Fallback Chain

Critical services have multiple implementations with automatic fallback:

```python
class {ServiceName}:
    fallback_chain = ["{provider_1}", "{provider_2}", "{provider_3}"]

    async def {method}(self, ...):
        for provider in self.fallback_chain:
            try:
                return await self.providers[provider].{method}(...)
            except:
                continue
        raise {AllProvidersFailed}()
```

**Benefits**:
- High availability
- Graceful degradation
- Cost optimization (can prefer cheaper providers)

### Pattern 4: Event-Driven Progress

Each stage emits events for progress tracking:

```python
class {JobOrchestrator}:
    async def process_job(self, job_id: str):
        job = await self.get_job(job_id)

        # Stage 1: {Stage name}
        await self._emit_progress(job_id, "{stage_1}", {progress_1})
        {result_1} = await self.{agent_1}.{method}(job.{input})

        # Stage 2: {Stage name}
        await self._emit_progress(job_id, "{stage_2}", {progress_2})
        {result_2} = await self.{agent_2}.{method}({result_1})

        # Stage 3: {Stage name}
        await self._emit_progress(job_id, "{stage_3}", {progress_3})
        {result_3} = await self.{service}.{method}({result_2})

        await self._emit_progress(job_id, "completed", 100)
        return {result_3}
```

---

## {Domain}-Specific Processing Pipeline

### {Processing Strategy 1}

{Description of the processing strategy.}

```python
async def {function_name}(
    self,
    {param}: {Type},
    {param}: {Type}
) -> {ReturnType}:
    """{Docstring description}."""
    {resource} = {library}.{open}(str({param}))
    {result_container} = {}

    for {item} in {items}:
        {processed} = []
        {start} = {calculation}
        {end} = {calculation}

        # {Processing logic description}
        {positions} = [
            {position_1},
            {position_2},
            {position_3}
        ]

        for {pos} in {positions}:
            {resource}.{set_position}({pos})
            {ret}, {data} = {resource}.{read}()
            if {ret}:
                {processed}.append({data})

        {result_container}[{item}.{id}] = {processed}

    {resource}.release()
    return {result_container}
```

### {Processing Strategy 2: e.g., Smart Processing/Detection}

{Description of intelligent processing.}

```python
async def {smart_function}(
    self,
    {param}: {Type},
    {param}: {Type}
) -> {ResultType}:
    """{Docstring description}."""

    # {Step 1 description}
    {resource} = {library}.{method}(str({param}))
    {metadata} = {resource}.get({property})
    {resource}.{set}({property}, {calculation})
    {ret}, {data} = {resource}.{read}()
    {resource}.release()

    if not {ret}:
        return self.{default_method}({data}.shape)

    # {Step 2: Detection/Analysis}
    with {detection_library}.{Detector}({config}) as {detector}:
        {results} = {detector}.process({data})

        if {results}.{detections}:
            # {Processing detected results}
            {detection} = {results}.{detections}[0]
            {extracted_data} = {detection}.{data}
            {calculated_value} = {extracted_data}.{field} + {extracted_data}.{field} / 2

            # {Calculation description}
            {dimension} = {data}.shape[0]
            {needed_value} = {dimension} * {ratio}
            {result_value} = max(0, {calculated_value} * {data}.shape[1] - {needed_value} / 2)

            return {ResultType}(
                {field_1}=int({result_value}),
                {field_2}=0,
                {field_3}=int({needed_value}),
                {field_4}={dimension}
            )

    return self.{default_method}({data}.shape)
```

---

## Celery: The Backbone of {Domain} Processing

{Domain} processing is inherently slow ({time range} per operation). Celery enables:

### Why Celery for {Domain} Processing?

1. **Long-Running Operations**: {Domain} {operations} can take {time range}
2. **Parallel Processing**: Multiple {items} can be processed simultaneously
3. **Fault Tolerance**: Failed jobs can be retried
4. **Progress Tracking**: Users can monitor job status

### Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           FastAPI Application                            │
│                                                                          │
│  POST /api/v1/{resources}/{action}  ─────────────────────────────▶      │
│                                                                          │
│     ┌────────────────────────────────────────────────────────────────┐  │
│     │  1. Create job record in database                               │  │
│     │  2. Queue task: {task_name}.delay(job_id)  ◀── Celery          │  │
│     │  3. Return job_id immediately                                   │  │
│     └────────────────────────────────────────────────────────────────┘  │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                              Redis                                       │
│                         (Message Broker)                                 │
│                                                                          │
│  Queue: [{job_type}_1, {job_type}_2, {job_type}_3, ...]                 │
│  Results: {task_id_1: result, task_id_2: result, ...}                   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    ▼               ▼               ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                          Celery Workers                                  │
│                                                                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                     │
│  │  Worker 1   │  │  Worker 2   │  │  Worker 3   │                     │
│  │             │  │             │  │             │                     │
│  │ {task_1}    │  │ {task_1}    │  │ {task_1}    │                     │
│  │ {task_2}    │  │ {task_2}    │  │ {task_2}    │                     │
│  │ {task_3}    │  │ {task_3}    │  │ {task_3}    │                     │
│  └─────────────┘  └─────────────┘  └─────────────┘                     │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Celery Configuration

```python
# src/workers/celery_app.py
from celery import Celery
from src.config import settings

celery_app = Celery(
    "{module_name}",
    broker=settings.redis_url,
    backend=settings.redis_url,
    include=["src.workers.tasks"],
)

celery_app.conf.update(
    task_serializer="json",
    task_acks_late=True,              # Acknowledge after completion
    task_reject_on_worker_lost=True,  # Re-queue if worker dies
    task_time_limit={hard_limit},     # {time} hard limit
    task_soft_time_limit={soft_limit},# {time} soft limit
    worker_prefetch_multiplier=1,     # One task at a time ({reason})
    worker_concurrency={concurrency}, # {N} parallel tasks per worker
)
```

### Task Implementation

```python
# src/workers/tasks.py
from src.workers.celery_app import celery_app
import asyncio

def run_async(coro):
    """Run async function in sync context."""
    loop = asyncio.new_event_loop()
    try:
        return loop.run_until_complete(coro)
    finally:
        loop.close()


@celery_app.task(bind=True, max_retries=3)
def {process_task_name}(self, job_id: str) -> dict:
    """Process a {job type} job."""
    try:
        result = run_async({_process_async}(job_id))
        return result
    except Exception as e:
        run_async(_mark_job_failed(job_id, str(e)))
        raise self.retry(exc=e, countdown=60)


async def {_process_async}(job_id: str) -> dict:
    """The actual job processing logic."""
    async with AsyncSessionLocal() as db:
        job = await db.get({JobModel}, job_id)

        # Phase 1: {Phase name}
        job.status = "{status_1}"
        job.progress = {progress_1}
        await db.commit()
        {result_1} = await {agent_1}.{method}(job.{input})

        # Phase 2: {Phase name}
        job.status = "{status_2}"
        job.progress = {progress_2}
        await db.commit()
        {result_2} = await {agent_2}.{method}({result_1})

        # Phase 3: {Phase name}
        job.status = "{status_3}"
        job.progress = {progress_3}
        await db.commit()
        {result_3} = await {service}.{method}({result_2})

        # Phase 4: {Phase name}
        job.status = "{status_4}"
        job.progress = {progress_4}
        await db.commit()
        {result_4} = await {agent_3}.{method}({result_3})

        # Complete
        job.status = "completed"
        job.progress = 100
        job.completed_at = datetime.utcnow()
        await db.commit()

        return {"status": "completed", "{results}": len({result_4})}
```

### Why Celery for Agentic AI?

| Feature | Celery | FastAPI BackgroundTasks | Python Threading |
|---------|--------|------------------------|------------------|
| Distributed | Yes | No | No |
| Persistent | Yes | No | No |
| Retry | Built-in | Manual | Manual |
| Rate Limiting | Built-in | Manual | Manual |
| Monitoring | Flower | None | None |
| Scalability | Horizontal | Vertical | Vertical |
| Best For | Production | Simple tasks | Quick scripts |

**Celery is the right choice for agentic AI because**:
- Agent tasks are long-running ({time range})
- External APIs have rate limits
- Reliability is critical
- Scale is needed for multiple concurrent jobs

---

## {Advanced Topic 1: e.g., Multi-Modal Analysis}

{Description of the advanced topic.}

### {Sub-topic 1: e.g., Visual Analysis}

```python
# {Description of technique}
from {library} import {imports}

async def {detect_function}({param}: {Type}, {config}: {Type} = {default}):
    """{Docstring description}."""
    {resource} = {Manager}([str({param})])
    {manager} = {Manager}()
    {manager}.add_{detector}({Detector}({config}={config}))

    {resource}.start()
    {manager}.{detect}(frame_source={resource})
    {resource}.release()

    return {manager}.get_{results}()
```

### {Sub-topic 2: e.g., Audio Analysis}

```python
# {Description of technique}
import {library}

async def {detect_function}({param}: {Type}):
    """{Docstring description}."""
    # {Step 1 description}
    {intermediate} = await {extract_method}({param})
    {data}, {rate} = {library}.load(str({intermediate}), sr={sample_rate})

    # {Detection type 1}
    {result_1} = {library}.{detection_1}.{method}(y={data}, sr={rate})
    {times_1} = {library}.{conversion}({result_1}, sr={rate})

    # {Detection type 2}
    {intervals} = {library}.{detection_2}.{method}({data}, {threshold})
    {times_2} = [{library}.{conversion}(i, sr={rate}) for i in {intervals}.flatten()]

    # {Detection type 3 - optional}
    {spectral} = {library}.feature.{method}(y={data}, sr={rate})
    # ... additional analysis

    return list(set({times_1}.tolist() + {times_2}))
```

### {Sub-topic 3: e.g., Motion/Pattern Analysis}

```python
# {Description of technique}
import {library}

async def {detect_function}({param}: {Type}):
    """{Docstring description}."""
    {cap} = {library}.{VideoCapture}(str({param}))
    {changes} = []

    {ret}, {prev_frame} = {cap}.read()
    {prev_processed} = {library}.cvtColor({prev_frame}, {library}.{CONVERSION})

    {idx} = 0
    {fps} = {cap}.get({library}.{FPS_PROPERTY})

    while True:
        {ret}, {frame} = {cap}.read()
        if not {ret}:
            break

        {processed} = {library}.cvtColor({frame}, {library}.{CONVERSION})

        # {Calculate change metric}
        {flow} = {library}.{calc_method}(
            {prev_processed}, {processed}, None, {params}
        )

        # {Calculate magnitude/metric}
        {metric}, _ = {library}.{metric_method}({flow}[..., 0], {flow}[..., 1])
        {avg_metric} = np.mean({metric})

        # {Detect significant changes}
        if {avg_metric} > {THRESHOLD}:
            {time} = {idx} / {fps}
            {changes}.append({time})

        {prev_processed} = {processed}
        {idx} += 1

    {cap}.release()
    return {changes}
```

### Signal Fusion / Integration

```python
async def {merge_signals}(
    {signal_1}: list,
    {signal_2}: list[float],
    {signal_3}: list[float],
    {min_threshold}: float = {default}
) -> list[{ResultType}]:
    """{Docstring description}."""

    # Collect all potential {results}
    {all_results} = set()

    # {Signal 1} are primary (weight: {X}%)
    for {item} in {signal_1}:
        {all_results}.add({item}.{start}.get_{unit}())
        {all_results}.add({item}.{end}.get_{unit}())

    # Add {signal 2} (weight: {Y}%)
    for {time} in {signal_2}:
        # Only add if not too close to existing
        if not any(abs({time} - b) < {proximity_threshold} for b in {all_results}):
            {all_results}.add({time})

    # Add {signal 3} (weight: {Z}%)
    for {time} in {signal_3}:
        if not any(abs({time} - b) < {proximity_threshold} for b in {all_results}):
            {all_results}.add({time})

    # Sort and filter
    {sorted_results} = sorted({all_results})
    {filtered_results} = [{sorted_results}[0]]

    for b in {sorted_results}[1:]:
        if b - {filtered_results}[-1] >= {min_threshold}:
            {filtered_results}.append(b)

    # Convert to {ResultType} objects
    {output} = []
    for i in range(len({filtered_results}) - 1):
        {output}.append({ResultType}(
            {start_field}=int({filtered_results}[i] * {multiplier}),
            {end_field}=int({filtered_results}[i + 1] * {multiplier})
        ))

    return {output}
```

---

## Best Practices for {Domain} AI Agents

### 1. {Best Practice 1: e.g., Memory Management}

{Description of the practice and why it's important.}

```python
# Good: {Description of good practice}
async def {process_function}({param}: {Type}):
    {resource} = {library}.{open}(str({param}))

    try:
        while True:
            {ret}, {data} = {resource}.read()
            if not {ret}:
                break

            # {Process data}
            {result} = await {process_method}({data})

            # {Release memory}
            del {data}
    finally:
        {resource}.release()  # Always release


# Good: {Description of limiting resources}
async def {analyze_function}({items}: list[{Type}], max_{items}: int = {limit}):
    """{Limit description}."""
    total_{items} = len({items}) * {ITEMS_PER_UNIT}
    if total_{items} > max_{items}:
        # {Sampling strategy}
        step = len({items}) // (max_{items} // {ITEMS_PER_UNIT})
        {items} = {items}[::step]

    return await {service}.{method}({items})
```

### 2. {Best Practice 2: e.g., Parallel Processing}

{Description of the practice.}

```python
import asyncio

async def {process_all_function}({items}: list[{Type}]):
    """{Description of parallel processing}."""
    tasks = []
    semaphore = asyncio.Semaphore({concurrent_limit})  # Limit concurrent {operations}

    async def {process_with_limit}({item}):
        async with semaphore:
            return await {service}.{process_method}({item})

    for {item} in {items}:
        tasks.append({process_with_limit}({item}))

    return await asyncio.gather(*tasks, return_exceptions=True)
```

### 3. {Best Practice 3: e.g., Graceful Degradation}

{Description of handling partial failures.}

```python
async def {process_all_function}({items}: list[{Type}]):
    """{Description of failure handling}."""
    results = []
    failures = []

    for {item} in {items}:
        try:
            result = await {process_method}({item})
            results.append(result)
        except Exception as e:
            logger.warning(f"Failed to process {item}.{id}: {e}")
            failures.append({"{item}_id": {item}.{id}, "error": str(e)})
            # Continue processing other {items}

    return {ProcessingResult}(
        successful=results,
        failed=failures,
        partial_success=len(failures) > 0
    )
```

### 4. {Best Practice 4: e.g., Caching Expensive Operations}

{Description of caching strategy.}

```python
from functools import lru_cache
import hashlib

def get_{item}_hash({item_path}: {Type}) -> str:
    """Get unique hash for {item} file."""
    with open({item_path}, 'rb') as f:
        return hashlib.md5(f.read({chunk_size})).hexdigest()  # First {size}

@lru_cache(maxsize={cache_size})
async def get_cached_{operation}({item_hash}: str, {item_path}: str):
    """Cache {operation} results."""
    return await {operation_method}({Type}({item_path}))

@lru_cache(maxsize={cache_size})
async def get_cached_{operation_2}({item_hash}: str, {item_path}: str, {config}: {Type}):
    """Cache {operation 2} results."""
    return await {operation_2_method}({Type}({item_path}), {config})
```

### 5. {Best Practice 5: e.g., Observability}

{Description of comprehensive logging.}

```python
import structlog

logger = structlog.get_logger()

async def {process_function}(job_id: str):
    """{Description with detailed logging}."""
    log = logger.bind(job_id=job_id)

    log.info("Starting {job type}")

    log.info("{Step 1 description}", {param}=str(job.{field}))
    {result_1} = await {agent_1}.{method}(job.{field})
    log.info("{Step 1} complete", count=len({result_1}))

    log.info("{Step 2 description}")
    {result_2} = await {agent_2}.{method}({result_1})
    log.info("{Step 2} complete",
             {metric_1}=len([c for c in {result_2} if c.{condition}]))

    log.info("{Step 3 description}", count=len({result_2}))
    {result_3} = await {service}.{method}({result_2})
    log.info("{Step 3} complete",
             successful=len([c for c in {result_3} if c.status == "success"]))

    log.info("Job completed", total_{items}=len({result_3}))
```

### 6. Design for Observability

Every agent action should be traceable:

```python
# Good: Comprehensive logging
logger.info(f"Starting {operation} for {entity}: {{name}}")
logger.info(f"{Step} returned {len(results)} results")
logger.info(f"{Output} generated using {provider}/{model}")

# Store intermediate results for debugging
job.{result_field} = {agent}.{to_dict}({result})
await db.commit()
```

### 7. Implement Graceful Degradation

Never let a single failure stop the entire pipeline:

```python
# Good: Continue with partial results
for {item} in {items}[:{limit}]:
    try:
        {data} = await self.{method}({item})
        {all_data}.extend({data})
    except Exception as e:
        logger.warning(f"{Operation} failed for '{item}': {e}")
        # Continue with other {items}
```

### 8. Use Structured Outputs

Enforce structure to make agent outputs reliable:

```python
# Good: Explicit schema in prompts
{PROMPT_TEMPLATE} = """
Return your {analysis} as JSON with this exact structure:
{
    "{section_1}": {
        "{field_1}": "one of: {option_1}, {option_2}, ...",
        "{field_2}": 0-100,
        ...
    },
    ...
}
"""

# Good: Parse and validate
def {_parse_response}(self, response: str) -> dict:
    # Try multiple parsing strategies
    try:
        return json.loads(response)
    except json.JSONDecodeError:
        # Try extracting from markdown
        json_match = re.search(r"```json\s*([\s\S]*?)```", response)
        ...
```

---

## Conclusion

Building {domain} AI agents requires careful attention to:

1. **{Key Area 1}**: {Brief description}
2. **{Key Area 2}**: {Brief description}
3. **{Key Area 3}**: {Brief description}
4. **{Key Area 4}**: {Brief description}
5. **{Key Area 5}**: {Brief description}

This module demonstrates how to build production-ready agentic systems for {domain} processing.

---

## References

- [Anthropic - Building Effective Agents](https://www.anthropic.com/engineering/building-effective-agents)
- [LangChain - Agent Documentation](https://python.langchain.com/docs/modules/agents/)
- [Celery Documentation](https://docs.celeryq.dev/)
- [{Domain Library 1} Documentation]({URL})
- [{Domain Library 2} Documentation]({URL})
- [{Domain Library 3} Documentation]({URL})

---

*Last Updated: {Month Year}*
