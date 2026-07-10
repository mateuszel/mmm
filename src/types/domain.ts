export type PartnerMode = "generic" | "solidgate" | "boski";
export type StepStatus = "queued" | "running" | "complete" | "blocked";

export interface Evidence { id: string; title: string; detail: string; source: string }
export interface BusinessMetric { id: string; label: string; value: string; delta: string; direction: "up" | "down" | "neutral" }
export interface ImpactEstimate { annualizedValue: number; confidence: number; rationale: string }
export interface ToolDefinition { name: string; description: string; readOnly: boolean }
export interface ToolCallRecord { id: string; tool: string; inputSummary: string; outputSummary: string; status: "success" | "failed" }
export interface ActionProposal { id: string; title: string; description: string; risk: "low" | "medium" | "high"; estimatedImpact: ImpactEstimate }
export interface ApprovalRequest { id: string; proposal: ActionProposal; status: "pending" | "approved" | "rejected" }
export interface TimelineEvent { id: string; at: string; label: string; detail: string; kind: "analysis" | "tool" | "proposal" | "approval" }
export interface AgentStep { id: string; title: string; status: StepStatus; summary: string }
export interface AgentRun { id: string; goal: string; status: StepStatus; steps: AgentStep[]; toolCalls: ToolCallRecord[]; finalExplanation: string }
export interface EvaluationResult { score: number; passed: boolean; notes: string[] }

export interface Scenario {
  id: PartnerMode;
  partner: string;
  title: string;
  subtitle: string;
  goal: string;
  incident: string;
  metrics: BusinessMetric[];
  evidence: Evidence[];
  timeline: TimelineEvent[];
  proposal: ActionProposal;
  tools: ToolDefinition[];
}
