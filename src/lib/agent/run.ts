import { createApproval } from "@/lib/approvals/policy";
import type { AgentRun, ApprovalRequest, Scenario } from "@/types/domain";

export function runDemoAgent(scenario: Scenario): { run: AgentRun; approval: ApprovalRequest } {
  return {
    run: { id: `run-${scenario.id}`, goal: scenario.goal, status: "blocked", steps: [
      { id: "context", title: "Read scenario context", status: "complete", summary: scenario.incident },
      { id: "evidence", title: "Inspect read-only evidence", status: "complete", summary: `${scenario.evidence.length} evidence items validated.` },
      { id: "plan", title: "Build typed action plan", status: "complete", summary: scenario.proposal.title },
      { id: "approval", title: "Wait for human approval", status: "blocked", summary: "No external state changes occur before a decision." }
    ], toolCalls: scenario.tools.filter((tool) => tool.readOnly).map((tool, index) => ({ id: `call-${index}`, tool: tool.name, inputSummary: scenario.id, outputSummary: "Deterministic fixture result", status: "success" })), finalExplanation: `The safest next move is to ${scenario.proposal.title.toLowerCase()}. The proposal remains simulated until approved.` },
    approval: createApproval(scenario.proposal)
  };
}
