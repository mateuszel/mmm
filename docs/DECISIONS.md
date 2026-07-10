# Decisions

## 001 — Single full-stack application

Use Next.js instead of a monorepo or services to reduce integration and onboarding risk.

## 002 — Deterministic demo first

All core flows run without credentials, partner APIs, a database, or Docker. Live adapters are deferred.

## 003 — Approval is a domain boundary

Read-only tools may run automatically. External state changes require a recorded human decision.

## 004 — Models are configuration

No model identifier is hardcoded. Live mode requires both `OPENAI_API_KEY` and `OPENAI_MODEL` server-side.
