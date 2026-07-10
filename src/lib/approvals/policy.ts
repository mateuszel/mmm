import type { ActionProposal, ApprovalRequest, ToolDefinition } from "@/types/domain";

export function requiresApproval(tool: ToolDefinition): boolean { return !tool.readOnly; }
export function createApproval(proposal: ActionProposal): ApprovalRequest { return { id: `approval-${proposal.id}`, proposal, status: "pending" }; }
export function decideApproval(request: ApprovalRequest, decision: "approved" | "rejected"): ApprovalRequest { return { ...request, status: decision }; }
