import type { Scenario } from "@/types/domain";

export const scenarios: Scenario[] = [
  {
    id: "generic", partner: "Control plane", title: "Operational recovery", subtitle: "A complete approval-gated agent loop", goal: "Diagnose a conversion drop and prepare the safest high-impact response.", incident: "Conversion is 8.4% below the seven-day baseline after a configuration change.",
    metrics: [{ id: "conversion", label: "Conversion", value: "61.8%", delta: "−8.4%", direction: "down" }, { id: "value", label: "Recoverable value", value: "€41.2k", delta: "+€6.3k", direction: "up" }, { id: "risk", label: "Actions gated", value: "1", delta: "100%", direction: "neutral" }],
    evidence: [{ id: "e1", title: "Change correlation", detail: "The decline begins 11 minutes after configuration version 42 shipped.", source: "Synthetic event stream" }, { id: "e2", title: "Segment concentration", detail: "78% of lost outcomes are isolated to one route and retry policy.", source: "Deterministic fixture" }],
    timeline: [{ id: "t1", at: "11:04", label: "Signal detected", detail: "Baseline deviation crossed the alert threshold.", kind: "analysis" }, { id: "t2", at: "11:05", label: "Evidence read", detail: "Metrics and configuration history inspected read-only.", kind: "tool" }],
    proposal: { id: "p1", title: "Restore the last healthy routing policy", description: "Simulate rollback to version 41, then apply only after explicit approval.", risk: "medium", estimatedImpact: { annualizedValue: 494400, confidence: 0.86, rationale: "Fixture replay across affected traffic." } },
    tools: [{ name: "read_metrics", description: "Read current and baseline KPIs", readOnly: true }, { name: "inspect_changes", description: "Compare configuration history", readOnly: true }, { name: "apply_policy", description: "Apply an approved policy version", readOnly: false }]
  },
  {
    id: "solidgate", partner: "Solidgate hypothesis", title: "Payment revenue recovery", subtitle: "Synthetic payment orchestration incident", goal: "Recover authorization rate without increasing chargeback exposure.", incident: "Authorization fell after one provider degraded for PLN subscriptions; retries are amplifying processing cost.",
    metrics: [{ id: "auth", label: "Authorization rate", value: "72.4%", delta: "−6.8pp", direction: "down" }, { id: "revenue", label: "Recoverable revenue", value: "€68.7k", delta: "/ month", direction: "up" }, { id: "cost", label: "Retry cost", value: "€3.8k", delta: "+22%", direction: "down" }],
    evidence: [{ id: "s1", title: "Provider degradation", detail: "Provider North has 19% more soft declines on PLN recurring payments.", source: "Synthetic transactions: PL, DE, FR" }, { id: "s2", title: "Retry timing", detail: "Second attempts inside 90 seconds add cost with no measurable lift.", source: "Fixture cohort replay" }],
    timeline: [{ id: "st1", at: "13:16", label: "Incident injected", detail: "PLN recurring authorization drops below threshold.", kind: "analysis" }, { id: "st2", at: "13:17", label: "Declines inspected", detail: "Soft declines grouped by provider, currency, and attempt.", kind: "tool" }],
    proposal: { id: "sp1", title: "Route eligible PLN retries to Provider East", description: "Change routing only for eligible soft declines and delay the second attempt to the healthy window.", risk: "high", estimatedImpact: { annualizedValue: 824400, confidence: 0.78, rationale: "Synthetic replay; not a live Solidgate integration." } },
    tools: [{ name: "read_payment_metrics", description: "Aggregate synthetic authorization metrics", readOnly: true }, { name: "inspect_declines", description: "Analyze decline and retry cohorts", readOnly: true }, { name: "propose_routing", description: "Prepare a routing proposal", readOnly: true }, { name: "apply_routing", description: "Apply an approved live routing rule", readOnly: false }]
  },
  {
    id: "boski", partner: "Boski hypothesis", title: "Proactive goal execution", subtitle: "Personal operations with human control", goal: "Protect a product launch deadline while respecting calendar and communication preferences.", incident: "A new investor call overlaps the only deep-work block before the launch review.",
    metrics: [{ id: "tasks", label: "Tasks protected", value: "4 / 5", delta: "+2", direction: "up" }, { id: "focus", label: "Focus time", value: "3h 20m", delta: "+50m", direction: "up" }, { id: "messages", label: "Messages sent", value: "0", delta: "approval required", direction: "neutral" }],
    evidence: [{ id: "b1", title: "Calendar conflict", detail: "Investor call overlaps the final uninterrupted preparation block by 35 minutes.", source: "Synthetic calendar" }, { id: "b2", title: "User preference", detail: "Do not move external meetings or send messages without approval.", source: "Fixture preferences" }],
    timeline: [{ id: "bt1", at: "15:02", label: "Conflict found", detail: "Calendar inspected without making changes.", kind: "tool" }, { id: "bt2", at: "15:03", label: "Plan prepared", detail: "Tasks reordered and a draft message created.", kind: "proposal" }],
    proposal: { id: "bp1", title: "Move the internal review and draft a note", description: "Shift the internal review by 45 minutes and prepare—but do not send—a concise update.", risk: "medium", estimatedImpact: { annualizedValue: 0, confidence: 0.91, rationale: "Preserves the launch critical path in the fixture." } },
    tools: [{ name: "inspect_goals", description: "Read goals and deadlines", readOnly: true }, { name: "inspect_calendar", description: "Read synthetic availability", readOnly: true }, { name: "propose_calendar_change", description: "Prepare a calendar mutation", readOnly: true }, { name: "send_message", description: "Send an approved message", readOnly: false }]
  }
];

export const getScenario = (id: string) => scenarios.find((scenario) => scenario.id === id) ?? scenarios[0];
