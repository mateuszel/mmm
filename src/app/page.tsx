"use client";

import { useMemo, useState } from "react";
import { runDemoAgent } from "@/lib/agent/run";
import { scenarios } from "@/lib/fixtures/scenarios";
import type { PartnerMode } from "@/types/domain";

export default function Home() {
  const [mode, setMode] = useState<PartnerMode>("generic");
  const [decision, setDecision] = useState<"pending" | "approved" | "rejected">("pending");
  const [running, setRunning] = useState(false);
  const scenario = scenarios.find((item) => item.id === mode) ?? scenarios[0];
  const result = useMemo(() => runDemoAgent(scenario), [scenario]);

  function selectMode(next: PartnerMode) { setMode(next); setDecision("pending"); setRunning(false); }
  function run() { setRunning(true); window.setTimeout(() => setRunning(false), 550); }
  function reset() { setMode("generic"); setDecision("pending"); setRunning(false); }

  return (
    <main>
      <header className="topbar">
        <div className="brand"><span className="brand-mark">M</span><div><strong>MMM Control Plane</strong><small>Hackathon agent workspace</small></div></div>
        <div className="status"><span className="pulse" /> DEMO MODE <span className="divider" /> No external calls</div>
      </header>

      <div className="shell">
        <aside className="sidebar">
          <p className="eyebrow">Scenario</p>
          <nav aria-label="Scenario selector">
            {scenarios.map((item) => <button key={item.id} className={mode === item.id ? "scenario active" : "scenario"} onClick={() => selectMode(item.id)} aria-pressed={mode === item.id}><span>{item.partner}</span><small>{item.title}</small></button>)}
          </nav>
          <div className="sidebar-bottom"><p>Partner modes are fixture-backed hypotheses until the official brief.</p><button className="ghost" onClick={reset}>Reset demo</button></div>
        </aside>

        <section className="workspace">
          <div className="workspace-head">
            <div><p className="eyebrow">{scenario.partner}</p><h1>{scenario.title}</h1><p>{scenario.subtitle}</p></div>
            <button className="primary" onClick={run} disabled={running}>{running ? "Analyzing…" : "Run agent"}<span>↗</span></button>
          </div>

          <div className="incident"><span>ACTIVE SIGNAL</span><p>{scenario.incident}</p></div>

          <section className="metrics" aria-label="Business impact">
            {scenario.metrics.map((metric) => <div className="metric" key={metric.id}><span>{metric.label}</span><strong>{metric.value}</strong><small className={metric.direction}>{metric.delta}</small></div>)}
          </section>

          <div className="columns">
            <section className="main-column">
              <div className="section-title"><div><p className="eyebrow">Agent run</p><h2>Evidence → proposal → approval</h2></div><span className="run-id">{result.run.id}</span></div>
              <div className={running ? "steps loading" : "steps"}>
                {result.run.steps.map((step, index) => <div className="step" key={step.id}><span className={step.status === "blocked" ? "step-dot blocked" : "step-dot"}>{index + 1}</span><div><strong>{step.title}</strong><p>{step.summary}</p></div><small>{step.status}</small></div>)}
              </div>

              <div className="section-title evidence-title"><div><p className="eyebrow">Evidence</p><h2>Why this action</h2></div></div>
              <div className="evidence-list">{scenario.evidence.map((item) => <article key={item.id}><strong>{item.title}</strong><p>{item.detail}</p><small>{item.source}</small></article>)}</div>
            </section>

            <aside className="inspector">
              <div className="section-title"><div><p className="eyebrow">Approval queue</p><h2>1 sensitive action</h2></div></div>
              <div className="proposal">
                <div className="risk"><span>{scenario.proposal.risk} risk</span><span>{Math.round(scenario.proposal.estimatedImpact.confidence * 100)}% confidence</span></div>
                <h3>{scenario.proposal.title}</h3><p>{scenario.proposal.description}</p>
                {scenario.proposal.estimatedImpact.annualizedValue > 0 && <div className="impact"><span>Estimated annual impact</span><strong>€{scenario.proposal.estimatedImpact.annualizedValue.toLocaleString("en-US")}</strong></div>}
                {decision === "pending" ? <div className="actions"><button className="approve" onClick={() => setDecision("approved")}>Approve simulation</button><button className="reject" onClick={() => setDecision("rejected")}>Reject</button></div> : <div className={`decision ${decision}`} role="status"><strong>{decision === "approved" ? "Simulation approved" : "Proposal rejected"}</strong><span>{decision === "approved" ? "Fixture metrics updated. No live change made." : "No change made. Agent run closed safely."}</span></div>}
              </div>

              <div className="section-title timeline-title"><div><p className="eyebrow">Timeline</p><h2>Trace</h2></div></div>
              <ol className="timeline">{scenario.timeline.map((event) => <li key={event.id}><time>{event.at}</time><div><strong>{event.label}</strong><p>{event.detail}</p></div></li>)}{decision !== "pending" && <li><time>now</time><div><strong>{decision === "approved" ? "Human approved" : "Human rejected"}</strong><p>Decision recorded in local UI state.</p></div></li>}</ol>
            </aside>
          </div>
        </section>
      </div>
    </main>
  );
}
