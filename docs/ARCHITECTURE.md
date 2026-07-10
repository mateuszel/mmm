# Architecture

One Next.js App Router application contains the presentation UI, deterministic fixtures, domain logic, approval policy, evaluation, and server-only OpenAI wrapper. `PartnerAdapter` is the boundary for generic, Solidgate, and Boski modes; tonight all implementations are mocks.

Flow: goal → scenario context → typed plan → read-only tools → action proposal → approval queue → deterministic simulation → metrics/timeline → concise explanation. No database or network is needed. A future live adapter must preserve the same interface, remain server-side, and never bypass approval.

The visual thesis is a compact editorial operations console with warm paper surfaces, hard typographic hierarchy, and one acid-green action accent. The interaction thesis uses fast scenario transitions, a brief run-state fade, and an explicit approval-state transformation.
