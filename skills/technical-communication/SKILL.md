---
name: technical-communication
description: Use when writing user-facing technical explanations, interview mini-notes, research reports, architecture decisions, reviews, debugging findings, or implementation summaries. Produces compact, evidence-based material for a Senior developer with low cognitive load. Applies to prose and human-readable artifacts, not machine-readable output contracts.
---

# Technical Communication

## Purpose

Reduce the reader's effort, not merely the word count. The reader should quickly understand what happens, why it matters, and what to do next.

Technical correctness is mandatory. Within that constraint, prioritize **clarity → structure → practical value → completeness**.

Load once per agent context. Apply to user-facing prose and human-readable artifacts, including drafts handed to another agent. Do not print this policy or announce the selected template in the deliverable.

## Choose the opening

| Task | Start with |
|---|---|
| Explain or teach | A simple mental model: what it is, why it exists, which problem it solves |
| Diagnose | The observed symptom and established cause; if unconfirmed, label the hypothesis |
| Recommend or design | The decision needed and recommended approach |
| Review | The verdict and highest-impact finding |
| Report completed work | What changed and its actual verification status |

For a short follow-up, answer directly. Do not force a complete report around a one-sentence answer.

## Writing rules

- Use the user's language; Russian by default in this user's workflow. Keep API names, paths, commands, versions, and error codes exact.
- One thought per short paragraph, usually 1–3 short sentences. Explain the idea simply before naming the mechanism. Do not open with a glossary.
- Write grammatically complete, readable prose. Compression must not make the reader reconstruct missing causal links.
- Remove filler, bureaucratic language, repeated conclusions, long enumerations, and dense paragraphs.
- Prefer concrete subjects and verbs: identify which component validates, stores, retries, or rejects.
- Show a complex mechanism as `A → B → C`, explaining the important transition. Do not use arrows to imply unproven causation.
- Use a small table for comparisons along common dimensions. Use a numbered list for ordered actions. Use prose when a table adds no clarity.
- Add code only to explain a mechanism or show an exact change. Prefer one focused example over scaffolding; preserve essential error handling and constraints.
- Explain the relevant production consequence: data loss, duplicate effects, availability, latency, security, operability, or recovery. Do not append every concern to every topic.
- Keep the main answer self-contained. Move optional internals, rare API details, version-specific syntax, and facts a Senior need not memorize into **Углубление** or **Справочно**.
- Related topics must have a stated connection. Do not expand into an API manual or a catalogue of adjacent concepts.
- Use only sections that carry useful information. Preserve mandatory sections required by the task or agent contract; mark missing evidence explicitly rather than inventing content.

## Evidence and precise claims

Distinguish **observed fact**, **hypothesis**, and **recommendation** whenever confusing them would change a decision. Labels are useful for uncertainty, not required before every sentence.

Keep guarantees scoped: version, component, transaction boundary, failure mode, and assumptions where relevant. Avoid unconditional claims such as “exactly once,” “thread-safe,” or “no data loss” without their conditions.

Do not promote one kind of evidence into another:

- Source inspection is not observation of a running deployment.
- A log saying `Outcome Applied` establishes acceptance, not necessarily business success.
- Successful compilation is not a passing test suite; passing unit tests are not browser or end-to-end verification.
- A change in Core source is not a published package or an updated host.
- Delegated conclusions remain attributed until independently checked. Never invent checks, citations, benchmark values, or runtime evidence.

For verification, distinguish **passed / failed / skipped / not run**. Give the command or test scope and result when it helps the reader act. Mention unresolved failures even when outside the change's scope.

Use code paths or concise citations near the claim they support. For library/version-sensitive facts, follow the research and Context7 instructions already in force; this skill does not require external research for every response.

## Templates

Choose the task-appropriate template. Existing ADR, specification, review, handoff, and machine-readable schemas keep their required structure; apply these writing rules inside them.

### Interview question / Senior mini-note

Use this full structure when preparing an interview question and answer guide. It should be scannable during an interview.

1. **Основной вопрос** — a short production scenario in ordinary language. Ask for a decision, explanation, or response to a failure.
2. **Что проверяем** — 2–4 key ideas, not a list of library names.
3. **Мини-конспект** — start with the mental model; then mechanism, causal chain, and necessary limits. Include enough theory for a confident answer.
4. **Безопасный production-подход** — the preferred solution, why it works, its assumptions and meaningful trade-offs. Do not imply one universally safe solution.
5. **Типичные ошибки** — the dangerous suggestion, its consequence, and the qualification required to make it defensible.
6. **Смежные темы** — only genuinely related concepts; explain the connection. If none are needed, say so briefly.
7. **Операционные follow-up вопросы** — short prompts such as “Что произойдёт, если…?” or “Что будете делать, если…?”. Probe failures, detection, and recovery relevant to this scenario.
8. **Что достаточно услышать от Senior** — the minimum signs of a strong answer: correct boundaries, trade-offs, failure reasoning, and a way to verify the decision. Do not require verbatim terminology.

For a concept explanation without an interview request, use only mental model → mechanism → production significance → pitfalls, plus optional depth.

### Diagnosis and fix

**Симптом → доказательства → причина → исправление → проверка → следующий шаг.**

If cause is uncertain, state the hypothesis and the smallest check that distinguishes it from alternatives. Keep the next step actionable: a command, observation, restart, release, or question about missing evidence.

### Architecture and research

**Проблема → ограничения → рекомендация → компромиссы → поведение при сбоях.**

Include alternatives only if they could realistically change the decision. Explain when each is preferable. Cite material evidence; move exhaustive comparisons and reference details out of the main narrative.

### Code or architecture review

**Вердикт → существенные замечания → проверки → оставшиеся риски.**

Each finding should say where, under which conditions, what fails, and what change addresses it. Preserve severity, evidence, and the review agent's required output schema. Omit generic praise and speculative warnings.

### Completed work

**Что изменилось → что проверено → что осталось сделать.**

Report user-visible outcomes rather than tool-call history. Include files, agent order, or artifact lists when required by the agent's contract or useful for navigation. State deployment/package/restart dependencies explicitly.

## This user's engineering context

Prefer relevant examples from .NET/C#, PostgreSQL, Kafka, background workers, S3, Blazor, and modular NuGet-based services. Use the actual project stack; do not force these examples into Go or unrelated work.

Read current project conventions before asserting ownership or behavior. For the Banksight reporting flow, a useful mental model is:

**DataBridge creates the file → Kafka transports the result → IN validates the contract → Core updates job state → IN issues a download URL.**

Separate responsibility, evidence, and rollout stage. A producer acknowledgment does not prove consumer success; an accepted result can represent failure; an expired URL does not by itself prove the object was deleted.

Choose relevant operational questions, not a universal checklist: what happens after a pod dies, after an uncertain publish, during replay, after expiration, or while different package versions coexist?

## Interaction with other skills

- **Caveman:** remove conversational filler, but retain grammar and causal clarity in learning material and reports. Compact does not mean cryptic.
- **Ponytail:** remove unnecessary complexity, not requested explanation, validation, security conditions, or material trade-offs.
- **Verification:** governs which success claims are justified; this skill only shapes their presentation.
- **Research / Context7:** supply evidence for external and version-sensitive claims. Preserve attribution and uncertainty.
- **Agent-specific formats:** retain required headings, schemas, acceptance criteria, severity ranking, and handoff fields. Do not turn every artifact into an interview note.

Explicit user requirements and higher-priority instructions remain authoritative. This skill adds no new delegation, research, approval, or file-writing workflow.

## Example: compact but precise

**Weak:** “Idempotency provides reliable exactly-once processing and prevents all duplicate execution.”

**Better:** “Kafka can deliver a message again. Idempotency prevents that repeat from applying the same business change twice. For a database-only effect, record the event ID and the business change in one transaction. An external API call needs its own idempotency mechanism.”

**Mechanism:** business change commits → consumer crashes before offset commit → Kafka replays → stored event ID prevents the duplicate database effect.

## Final editing pass

Before sending, check:

1. Does the opening answer the question or give the mental model?
2. Can the main point be understood without the optional detail?
3. Are uncertainty, assumptions, ownership, and verification stated accurately?
4. Is the production consequence concrete and relevant?
5. Can any sentence, section, table, or code block be removed without losing meaning?

Shorten if yes. Stop when further compression would harm understanding or precision.
