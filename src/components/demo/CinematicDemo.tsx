"use client";

/* eslint-disable @next/next/no-img-element -- Frozen local source captures must remain exact and offline. */
import {
  ArrowRight,
  CheckCircle,
  CircleNotch,
  FolderOpen,
  LockKey,
  MagnifyingGlass,
  Paperclip,
  Phone,
  ShieldCheck,
  SlidersHorizontal,
  Tag,
  UserCircle,
  Warning,
  X,
} from "@phosphor-icons/react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef, useState } from "react";
import { callLines, retailSources, scenarios, type ScenarioId } from "@/lib/demo/scenario-data";
import { useScenarioOrchestrator } from "@/hooks/useScenarioOrchestrator";

gsap.registerPlugin(useGSAP);

type Scenario = "home" | ScenarioId;

const A = "/demo-assets";

const scenarioCopy = scenarios;

function MotionSurface({ token, children }: { token: string; children: React.ReactNode }) {
  const scope = useRef<HTMLDivElement>(null);
  useGSAP(() => {
    gsap.fromTo("[data-enter]", { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.38, stagger: 0.08, ease: "power2.out", clearProps: "transform,opacity,visibility" });
  }, { scope, dependencies: [token], revertOnUpdate: true });
  return <div ref={scope} className="cinema-motion-scope">{children}</div>;
}

function TypedText({ text, elapsedMs, startMs, durationMs }: { text: string; elapsedMs: number; startMs: number; durationMs: number }) {
  const progress = Math.max(0, Math.min(1, (elapsedMs - startMs) / durationMs));
  const length = Math.floor(text.length * progress);
  return <>{text.slice(0, length)}{progress > 0 && progress < 1 ? <span className="typing-caret" aria-hidden="true" /> : null}</>;
}

function formatTimer(milliseconds: number) {
  const seconds = Math.floor(milliseconds / 1_000);
  return `00:${String(seconds).padStart(2, "0")}`;
}

function MiniBrand({ large = false }: { large?: boolean }) {
  return <img className={large ? "cinema-brand cinema-brand--large" : "cinema-brand"} src="/brand/relyo-wordmark.svg" alt="Relyo" />;
}

function DemoLabel() {
  return null;
}

function TrustFooter({ scenario = "home" }: { scenario?: Scenario }) {
  return (
    <footer className="trust-footer">
      <div><img src={`${A}/icons/verification-check.svg`} alt="" /><strong>{scenario === "home" ? "You’re in control." : "Your mandate. Your evidence. Your decision."}</strong></div>
      <span>{scenario === "home" ? "I only act within your mandate." : "Public sources and simulated actions stay visibly separate."}</span>
      <span className="trust-footer__end"><i />{scenario === "home" ? "Ready for a request" : "Deterministic playback"}</span>
    </footer>
  );
}

function HomeScreen({ start }: { start: (scenario: Exclude<Scenario, "home">) => void }) {
  const [draft, setDraft] = useState("");
  const [activity, setActivity] = useState<string[]>([]);
  const [menu, setMenu] = useState<"profile" | "settings" | "activity" | null>(null);
  const cards = [
    { scenario: "retail" as const, image: `${A}/product/adidas-samba-og-ig1024-source.webp`, title: "Buy adidas Samba OG", body: "Compare true cost and act inside a hard cap." },
    { scenario: "private" as const, image: `${A}/product/switch-bundle-simulated.png`, title: "Verify a private listing", body: "Collect evidence and negotiate safely." },
    { scenario: "foreign" as const, image: `${A}/product/fujifilm-x100f-ebay-source.webp`, title: "Check a foreign seller", body: "Call privately and stop unsafe payment." },
  ];

  const submitDraft = (event: React.FormEvent) => {
    event.preventDefault();
    if (!draft.trim()) return;
    setActivity(["Request saved locally · no search started"]);
  };

  return (
    <div className="cinema cinema--home">
      <header className="home-header">
        <MiniBrand large />
        <div className="home-header__path" />
        <button data-testid="home-profile-trigger" className="header-icon-button" type="button" aria-label="Open profile" aria-haspopup="dialog" aria-expanded={menu === "profile"} onClick={() => setMenu(menu === "profile" ? null : "profile")}><UserCircle size={42} weight="regular" /></button>
        <button data-testid="home-settings-trigger" className="header-icon-button" type="button" aria-label="Open preferences" aria-haspopup="dialog" aria-expanded={menu === "settings"} onClick={() => setMenu(menu === "settings" ? null : "settings")}><SlidersHorizontal size={30} /></button>
        {menu === "profile" && <div role="dialog" aria-label="Demo profile" data-testid="home-profile-popover" className="home-popover home-popover--profile" data-enter><strong>Demo profile</strong><span>No account connected</span><p><ShieldCheck /> No personal data stored</p><button type="button">Preview preferences</button></div>}
        {menu === "settings" && <div role="dialog" aria-label="Shopping preferences" data-testid="home-settings-popover" className="home-popover" data-enter><strong>Shopping preferences</strong><label><input type="checkbox" defaultChecked /> Require buyer protection</label><label><input type="checkbox" defaultChecked /> Validate total delivered cost</label><label><input type="checkbox" /> Optional sound cues</label></div>}
      </header>
      <main className="home-main">
        <section className="home-workspace">
          <div className="home-intro">
            <div className="home-mark"><img src="/brand/relyo-symbol.svg" alt="Relyo protected handoff" /></div>
            <div><h1>Hello. I’m Relyo.<br />Your AI shopping agent.</h1><p>I research, compare, and buy on your behalf—<br />only within your mandate, always with proof.</p></div>
          </div>
          <form data-testid="home-composer" className="home-composer" onSubmit={submitDraft}>
            <div><textarea data-testid="home-composer-input" aria-label="Shopping request" value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="What would you like me to find or buy?" /><small>{activity.length ? "Request saved locally. Choose a prepared scenario to run the demo." : "Include the item, preferences, budget and timing."}</small></div>
            <div className="home-composer__tools"><Paperclip /><Tag /><SlidersHorizontal /></div>
            <button data-testid="home-composer-submit" type="submit" aria-label="Prepare shopping request" disabled={!draft.trim()}><img src="/brand/relyo-symbol.svg" alt="" /></button>
          </form>
          <div className="scenario-heading"><span>Try a scenario</span><i /></div>
          <div className="home-scenarios">
            {cards.map((card) => (
              <button key={card.scenario} type="button" onClick={() => start(card.scenario)}>
                <img src={card.image} alt="" /><span><strong>{card.title}</strong><small>{card.body}</small></span><ArrowRight size={30} />
              </button>
            ))}
          </div>
        </section>
        <aside className="home-evidence">
          <div className="evidence-title"><span>Evidence</span><span data-testid="home-evidence-count">0 items</span></div>
          <div className="evidence-path" />
          <div className="evidence-empty" data-testid="home-evidence-empty"><FolderOpen size={118} weight="thin" /><strong>No evidence yet</strong><p>Verified sources, prices and decisions will appear after research starts.</p></div>
          <button data-testid="home-activity-trigger" type="button" aria-haspopup="dialog" aria-expanded={menu === "activity"} onClick={() => setMenu(menu === "activity" ? null : "activity")}>{menu === "activity" ? "Hide activity" : "View all activity"} <ArrowRight size={25} /></button>
          {menu === "activity" && <div role="dialog" aria-label="Activity trail" data-testid="home-activity-popover" className="activity-popover" data-enter><strong>Activity trail</strong>{activity.length ? activity.map((item) => <p key={item}>{item}</p>) : <p>Nothing yet. Start with a request or a prepared scenario.</p>}</div>}
        </aside>
      </main>
      <TrustFooter />
    </div>
  );
}

function ScenarioLaunch({ scenario, elapsedMs }: { scenario: ScenarioId; elapsedMs: number }) {
  const request = scenarios[scenario].request;
  return <div className="cinema session-launch" data-testid="scenario-launch" data-scenario={scenario}>
    <header><MiniBrand /><span>Protected shopping session</span><ShieldCheck size={24} /></header>
    <main>
      <div className="session-launch__mark"><img src="/brand/relyo-symbol.svg" alt="" /></div>
      <div className="session-launch__composer" data-enter><span>Your request</span><p><TypedText text={request} elapsedMs={elapsedMs} startMs={0} durationMs={2_000} /></p><div><i style={{ width: `${Math.min(100, elapsedMs / 20)}%` }} /></div><small>{elapsedMs < 2_000 ? "Typing request…" : "Request understood · opening workspace"}</small></div>
    </main>
    <footer><ShieldCheck />Relyo acts only inside the visible mandate.</footer>
  </div>;
}

function WorkspaceHeader({ scenario, phase }: { scenario: Exclude<Scenario, "home">; phase: string }) {
  const status = scenario === "retail" ? "Protected handoff" : scenario === "private" ? "Buyer protection required" : phase === "approval" ? "Approval required" : "Proactive protection";
  return (
    <header className="workspace-header">
      <div className="workspace-header__brand"><MiniBrand /><span>AI shopping agent</span></div>
      <div className="workspace-header__title"><strong>Scenario {scenario === "retail" ? "1" : scenario === "private" ? "2" : "3"}</strong><span>·</span><span>{scenarioCopy[scenario].title}</span></div>
      <div className="workspace-header__status"><ShieldCheck size={23} /><span>{status}</span><i /></div>
    </header>
  );
}

function SourceBadge({ date = "11 Jul 2026" }: { date?: string }) {
  return <span className="source-badge">Public reference offer · captured {date}</span>;
}

function RetailSearchFunnel({ elapsedMs }: { elapsedMs: number }) {
  const local = elapsedMs - 5_500;
  const shown = Math.min(8, Math.max(1, Math.ceil(local / 330)));
  const resolved = local > 1_900;
  const narrowed = local > 3_000;

  return (
    <div className="retail-search-funnel" data-testid="retail-source-funnel">
      <div className="search-funnel__header"><span><CircleNotch className="spin-slow" />Searching trusted stores</span><strong>{narrowed ? "2 finalists" : resolved ? "8 sources checked" : `${shown} / 8`}</strong></div>
      <div className="search-funnel__progress"><i style={{ width: `${Math.min(100, (local / 4_200) * 100)}%` }} /></div>
      <div className="search-funnel__rows">
        {retailSources.map((source, index) => {
          const visible = index < shown;
          const finalist = source.tone === "candidate";
          const collapsed = narrowed && !finalist;
          return <div key={source.name} data-testid="retail-source-name" className={`search-source-row ${visible ? "is-visible" : ""} ${resolved ? `is-${source.tone}` : ""} ${collapsed ? "is-collapsed" : ""}`}>
            <span>{source.name}</span><em>{resolved ? source.result : index + 1 === shown ? "Checking availability" : "Searching"}</em>{resolved ? finalist ? <CheckCircle weight="fill" /> : <X /> : <CircleNotch className="spin-slow" />}
          </div>;
        })}
      </div>
      <div className="search-funnel__summary"><span className={resolved ? "is-done" : ""}>8 checked</span><ArrowRight /><span className={narrowed ? "is-done" : ""}>4 viable</span><ArrowRight /><strong>2 best matches</strong></div>
    </div>
  );
}

function RetailScreen({ elapsedMs, phase }: { elapsedMs: number; phase: string }) {
  const showAgent = elapsedMs >= 3_000;
  const showMandate = elapsedMs >= 3_350;
  const searching = elapsedMs >= 5_500 && elapsedMs < 10_000;
  const showSources = elapsedMs >= 10_000;
  const showSecond = elapsedMs >= 10_650;
  const showDecision = elapsedMs >= 13_000;
  const showCoupon = elapsedMs >= 14_100;
  const showCosts = elapsedMs >= 16_000;
  const decided = elapsedMs >= 18_500;
  const receipt = elapsedMs >= 20_000;
  return (
    <div className="cinema cinema--workspace" data-testid="scenario-screen" data-scenario="retail" data-stage={phase}>
      <WorkspaceHeader scenario="retail" phase={phase} />
      <main className="retail-grid">
        <section className="retail-chat soft-panel">
          <div className="panel-title"><strong>Conversation</strong><span>New chat</span></div>
          <div className="chat-user" data-enter><TypedText text={scenarioCopy.retail.request} elapsedMs={elapsedMs} startMs={500} durationMs={2_500} /><small>10:21&nbsp; ✓✓</small></div>
          <div className={showAgent ? "chat-agent" : "chat-agent is-hidden"} data-enter>I’ll search trusted stores, verify availability and discounts, and compare the final delivered cost.<small>10:21</small></div>
          <div className={showMandate ? "mandate-box" : "mandate-box is-hidden"} data-enter>
            <div><strong>Your mandate</strong><span>Active</span></div>
            {["Product · adidas Samba OG", "Size · EU43", "Condition · New and in stock", "Deliver to · Poland", "Goal · best true cost", "Rule · verified discounts only"].map((item, index) => <p key={item} className={elapsedMs >= 3_350 + index * 270 ? "" : "is-hidden"}><CheckCircle weight="fill" />{item}</p>)}
          </div>
        </section>
        <section className="retail-sources soft-panel">
          <div className="panel-title panel-title--large"><strong>{showSources ? "Top matches (2)" : "Market search"}</strong><span>{showSources ? "Live source captures" : "Deterministic source scan"}</span></div>
          {searching ? <RetailSearchFunnel elapsedMs={elapsedMs} /> : null}
          {!searching && <article data-testid="adidas-capture" data-enter className={showSources ? "retail-source-card" : "retail-source-card is-loading"}>
            <div className="source-card-head"><b>1</b><strong>adidas.pl</strong><SourceBadge /></div>
            <img src={`${A}/sources/adidas/adidas-ig1024-viewport.webp`} alt="Unmodified adidas Samba OG product-page capture" />
            <div className="source-card-meta"><span><CheckCircle weight="fill" />Demo check · EU43</span><span>Displayed price<strong>396.75 PLN</strong></span><span>Decision<strong>{decided ? "Selected" : showCoupon ? "Validating" : "Checking"}</strong></span></div>
          </article>}
          {!searching && <article data-testid="eobuwie-capture" data-enter className={showSecond ? "retail-source-card retail-source-card--second" : "retail-source-card retail-source-card--second is-loading"}>
            <div className="source-card-head"><b>2</b><strong>eobuwie.pl</strong><SourceBadge /></div>
            <img src={`${A}/sources/retail/eobuwie-ig1024-viewport.webp`} alt="Unmodified eobuwie Samba OG product-page capture" />
            <div className="source-card-meta"><span><CheckCircle weight="fill" />Demo check · EU43</span><span>Displayed price<strong>339.99 PLN</strong></span><span>Promotion<strong>{showCoupon ? "Unavailable" : "Checking"}</strong></span></div>
          </article>}
        </section>
        <aside className="decision-trail soft-panel">
          <div className="panel-title panel-title--large"><strong>Decision trail</strong></div>
          {!showDecision ? <div className="trail-empty"><CircleNotch className="spin-slow" size={42} /><strong>Comparing true cost</strong><span>Product · delivery · returns · coupon</span></div> : <>
            <div data-enter className={decided ? "selected-offer" : "selected-offer selected-offer--pending"}><CheckCircle weight="fill" /><span><small>{decided ? "Selected offer" : "Validating finalist"}</small><strong>adidas.pl</strong></span></div>
            <span className="source-badge">Deterministic demo validation · source capture unchanged</span>
            <div className="cost-lines"><p><span>Displayed price</span><strong>396.75 PLN</strong></p><p><span>SUMMER30</span><strong>{showCoupon ? "Valid · −30%" : "Validating"}</strong></p><p><span>Subtotal</span><strong>{showCosts ? "277.73 PLN" : "—"}</strong></p><p><span>Shipping</span><strong>{showCosts ? "0.00 PLN" : "—"}</strong></p><p className="cost-total"><span>True landed cost</span><strong>{showCosts ? "277.73 PLN" : "Calculating"}</strong></p></div>
            <div className="offer-checks">
              <h3>All checked offers</h3>
              <div className="offer-row offer-row--good"><CheckCircle weight="fill" /><span><strong>adidas.pl</strong><small>277.73 PLN · verified demo discount</small></span><em>{decided ? "Selected" : "Candidate"}</em></div>
              {showCoupon && <div data-enter className="offer-row offer-row--bad"><X /><span><strong>eobuwie.pl</strong><small>339.99 PLN · promotion unavailable</small></span><em>Rejected</em></div>}
              {showCoupon && <div data-enter className="coupon-row coupon-row--valid"><Tag /><span><strong>SUMMER30 validated</strong><small>Deterministic demo rule · −119.02 PLN</small></span></div>}
            </div>
            {receipt && <div data-testid="retail-final" data-enter className="mandate-result"><ShieldCheck /><span><strong>Protected handoff complete</strong><small>Simulated authorization · verified discounts only · 277.73 PLN final</small></span></div>}
          </>}
        </aside>
      </main>
      <footer className="workspace-footer"><span><i />Public reference capture — unmodified merchant page</span><span><i />Deterministic demo values — separate calculation</span><span>Protected handoff · complete decision trail</span></footer>
      <DemoLabel />
    </div>
  );
}

function PrivateScreen({ elapsedMs, phase }: { elapsedMs: number; phase: string }) {
  const showSource = elapsedMs >= 500;
  const showQuestion = elapsedMs >= 6_000;
  const showReply = elapsedMs >= 8_500;
  const evidenceCount = elapsedMs < 8_500 ? 0 : elapsedMs < 9_250 ? 1 : elapsedMs < 10_000 ? 2 : 3;
  const showEvidence = evidenceCount > 0;
  const showNegotiation = elapsedMs >= 11_500;
  const showCounter = elapsedMs >= 12_850;
  const showAccept = elapsedMs >= 14_000;
  const checkout = elapsedMs >= 15_000;
  const ready = elapsedMs >= 17_500;
  const final = elapsedMs >= 19_000;
  return (
    <div className="cinema cinema--workspace" data-testid="scenario-screen" data-scenario="private" data-stage={phase}>
      <WorkspaceHeader scenario="private" phase={phase} />
      <main className="private-grid">
        <section className="private-source soft-panel">
          <div className="section-heading"><MagnifyingGlass /><div><strong>Authentic OLX source capture</strong><span>Current search context · no real seller contacted</span></div></div>
          {!showSource && <div className="source-searching"><CircleNotch className="spin-slow" /><strong>Searching OLX listings</strong></div>}
          <div data-enter className={showSource ? "olx-capture" : "olx-capture is-loading"}><SourceBadge /><img src={`${A}/sources/olx/olx-switch-search-demo-column.png`} alt="Cropped, unmodified OLX Nintendo Switch OLED search-results capture" /></div>
          <div className="source-integrity"><ShieldCheck /><span><strong>Source integrity</strong><small>Seller identity and contact details redacted. Conversation and added evidence are simulated.</small></span></div>
        </section>
        <section className="seller-thread soft-panel">
          <div className="section-heading"><span className="chat-icon">••</span><div><strong>Simulated seller conversation</strong><span>Fictionalized seller branch · no message sent</span></div></div>
          {elapsedMs >= 4_000 && elapsedMs < 6_000 && <div className="evidence-gap-list" data-enter>{["Screen condition", "Serial number", "Included accessories"].map((item) => <p key={item}><Warning />Missing · {item}</p>)}</div>}
          {showQuestion && <div className="thread-message" data-enter><img src="/brand/relyo-symbol.svg" alt="" /><div><strong>Relyo</strong><p><TypedText text="Hello! I’m interested in the Nintendo Switch OLED from your listing. Could you send a photo of the screen, the console serial number, and confirm that all accessories are included?" elapsedMs={elapsedMs} startMs={6_000} durationMs={2_100} /></p><em>Evidence request</em></div></div>}
          {showReply && <div className="thread-message thread-message--seller" data-enter><img src={`${A}/seller/avatar-private.svg`} alt="Fictional seller" /><div><strong>Fictional seller</strong><p>Of course — I’m sending the photos now.</p>{showEvidence && <div className="evidence-thumbs">{evidenceCount >= 1 && <figure data-enter><img src={`${A}/product/switch-touchscreen-simulated.webp`} alt="Simulated screen evidence" /><figcaption>Screen · simulated</figcaption></figure>}{evidenceCount >= 2 && <figure data-enter><img src={`${A}/product/switch-bundle-simulated.png`} alt="Simulated bundle evidence" /><figcaption>Bundle · simulated</figcaption></figure>}{evidenceCount >= 3 && <figure className="evidence-serial" data-enter><ShieldCheck /><figcaption>Serial · received</figcaption></figure>}</div>}</div></div>}
          {showNegotiation && <div className="thread-message" data-enter><img src="/brand/relyo-symbol.svg" alt="" /><div><strong>Relyo</strong><p>Thank you. Could we complete the deal for 880 PLN with OLX shipping?</p><em>Offer · 880 PLN</em></div></div>}
          {showCounter && <div className="thread-message thread-message--seller" data-enter><img src={`${A}/seller/avatar-private.svg`} alt="Fictional seller" /><div><strong>Fictional seller</strong><p>My lowest price is 930 PLN with OLX shipping.</p><em>Counteroffer · 930 PLN</em></div></div>}
          {showAccept && <div className="thread-success" data-enter><CheckCircle weight="fill" />I accept 930 PLN with OLX shipping. Buyer protection remains active.</div>}
        </section>
        <aside className="checkout-panel soft-panel">
          <div className="section-heading"><LockKey /><div><strong>Protected checkout summary</strong><span>Simulated · approval required</span></div></div>
          <div className="checkout-product"><img src={`${A}/product/switch-bundle-simulated.png`} alt="Simulated Nintendo Switch bundle" /><div><strong>Nintendo Switch OLED bundle</strong><span>Used · simulated evidence</span></div></div>
          <div className="checkout-cost"><p><span>Agreed price</span><strong>{checkout ? "930.00 PLN" : "—"}</strong></p><p><span>OLX shipping</span><strong>{checkout ? "0.00 PLN" : "—"}</strong></p><p><span>Buyer protection</span><strong>{checkout ? "Included" : "Required"}</strong></p><p><span>Total due</span><strong>{checkout ? "930.00 PLN" : "—"}</strong></p></div>
          <button type="button" className={checkout ? "checkout-button is-ready" : "checkout-button"}><LockKey />{checkout ? "Simulated checkout prepared" : "Waiting for verified evidence"}</button>
          <div className="evidence-ledger"><h3>Evidence ledger</h3>{["OLX source captured", "Screen photo received", "Serial number received", "Accessories confirmed", "Negotiation completed", "Buyer protection active"].map((item, index) => { const completedAt = [500, 8_500, 9_250, 10_000, 14_000, 15_000][index]; return <p key={item} className={elapsedMs >= completedAt ? "is-complete" : ""}><span>{item}</span><CheckCircle /></p>; })}</div>
          {ready && <div data-testid="private-final" data-enter className="protected-ready"><ShieldCheck /><span><strong>{final ? "Verified deal ready" : "Protected checkout prepared"}</strong><small>930 PLN · buyer protection included · no payment made</small></span></div>}
        </aside>
      </main>
      <footer className="workspace-footer workspace-footer--brand"><MiniBrand /><span>Your agent. Your rules. Your evidence.</span><span>Simulated seller conversation · no real seller contacted</span></footer>
      <DemoLabel />
    </div>
  );
}

function ForeignScreen({ elapsedMs, callElapsedMs, phase, status, approve }: { elapsedMs: number; callElapsedMs: number; phase: string; status: string; approve: () => void }) {
  const phoneRequested = elapsedMs >= 2_500;
  const approval = status === "awaiting-approval";
  const calling = callElapsedMs > 0 && callElapsedMs < 31_000;
  const ended = callElapsedMs >= 31_000;
  const warning = callElapsedMs >= 4_000;
  const directTransfer = callElapsedMs >= 11_000;
  const personalData = callElapsedMs >= 20_000;
  const rejected = elapsedMs >= 35_000;
  const revealedLines = callElapsedMs > 0 ? callLines.filter((line) => callElapsedMs >= line.startMs) : [];
  return (
    <div className="cinema cinema--workspace" data-testid="scenario-screen" data-scenario="foreign" data-stage={phase}>
      <WorkspaceHeader scenario="foreign" phase={phase} />
      <main className="foreign-grid">
        <section className="foreign-source soft-panel">
          <div className="numbered-heading"><b>1</b><strong>Source evidence</strong></div>
          <div className="auth-source-title"><span>Authentic source capture</span><ShieldCheck /></div>
          <img className="ebay-capture" src={`${A}/sources/foreign/ebay-x100f-search-viewport.webp`} alt="Unmodified eBay Fujifilm X100F search capture" />
          <SourceBadge />
          <div className="deterministic-listing"><span>Deterministic listing summary · from source</span><div><img src={`${A}/product/fujifilm-x100f-ebay-source.webp`} alt="Fujifilm X100F reference product" /><section><h3>Fujifilm X100F</h3><p>Used · €1,100 + €20 delivery</p><small>Captured platform context. Fictional call branch is separate.</small></section></div></div>
        </section>
        <section className="call-workspace soft-panel">
          <div className="numbered-heading"><b>2</b><strong>Simulated seller verification call</strong><span>{approval ? "Approval required" : calling ? "Live scripted call" : ended ? "Call ended" : "Verifying listing"}</span></div>
          {phoneRequested && !calling && !ended && <div className="seller-call-request" data-enter><p><strong>Relyo</strong>Hello! I’m contacting you about the Fujifilm X100F. Is it still available? Could you confirm its technical condition, any visible wear and what is included?</p><p><strong>Fictional seller</strong>Yes, it’s available. Please call me. It will be easier to explain.</p></div>}
          <div className={phoneRequested ? "call-preflight" : "call-preflight is-hidden"} data-enter><div><strong>The seller wants to continue by phone</strong><p>I can call through a privacy-protected relay and verify the transaction conditions.</p></div><div><Phone weight="fill" /><strong>+44 •••• ••• 4821</strong></div>{approval ? <button data-testid="start-protected-call" type="button" onClick={approve}>Start protected call</button> : calling ? <span className="call-live"><i />Call in progress</span> : ended ? <span>Call ended · policy enforced</span> : <span>Preparing protected relay</span>}</div>
          <div className={calling || ended ? "call-session" : "call-session call-session--preview"} data-enter>
            <div className="call-session__meta"><span><i />{approval ? "Ready after approval" : ended ? "Call ended" : "Call in progress"}</span><strong data-testid="call-timer">{formatTimer(callElapsedMs)}</strong><span>Simulated call · synchronized transcript</span></div>
            <div className="waveform-live" aria-label="Deterministic call waveform">{Array.from({ length: 42 }, (_, index) => <i key={index} style={{ height: `${12 + ((index * 17) % 36)}px`, animationDelay: `${index * -45}ms` }} />)}</div>
            <div className="transcript-stream" data-testid="call-transcript">
              {revealedLines.map((line) => <div key={line.startMs} data-enter className={line.risk ? "is-risk" : ""}><time>{formatTimer(line.startMs)}</time><p><strong>{line.speaker}</strong>{line.text}</p></div>)}
            </div>
          </div>
          {rejected && <div data-enter className="handoff-stop"><img src={`${A}/warnings/risk-warning.svg`} alt="Risk boundary" /><span><strong>This transaction violates your mandate</strong><small>I rejected the listing and will continue searching for a safer offer.</small></span><X size={33} /></div>}
        </section>
        <aside className="risk-panel">
          <section className="soft-panel mandate-policy"><div className="numbered-heading"><b>3</b><strong>Your mandate & policy</strong></div><h3>Your mandate</h3><p>Find Fujifilm X100F, max €1,200, with safe payment and buyer protection. No direct bank transfer.</p><h3>Relyo policy</h3>{["Use protected channels only", "Require buyer protection", "Never share personal or payment data", "Reject unsafe transaction requests", "Continue search until safe match"].map((rule) => <div key={rule}><CheckCircle />{rule}</div>)}</section>
          <section className="soft-panel risk-ledger"><div className="numbered-heading"><b>4</b><strong>Risk ledger</strong></div><p><CheckCircle /><span>Protected relay</span><em>Kept</em></p><p data-testid={warning ? "risk-medium" : undefined} className={warning ? "is-risk" : ""}><Warning /><span>Move outside eBay</span><em>{warning ? "Medium" : "Monitoring"}</em></p><p data-testid={directTransfer ? "risk-critical" : undefined} className={directTransfer ? "is-risk" : ""}><Warning /><span>Direct bank transfer</span><em>{directTransfer ? "Critical" : "Monitoring"}</em></p><p data-testid={personalData ? "risk-personal" : undefined} className={personalData ? "is-risk" : ""}><Warning /><span>WhatsApp personal data</span><em>{personalData ? "High" : "Monitoring"}</em></p><p><CheckCircle /><span>Money transferred</span><em>No</em></p><p><CheckCircle /><span>Personal data shared</span><em>No</em></p>{rejected && <div data-testid="foreign-final" data-enter className="listing-rejected"><img src={`${A}/warnings/rejection-illustration.svg`} alt="Listing rejected" /><span><strong>Listing rejected</strong><small>Buyer protection refused<br />No money transferred<br />No personal data shared<br />Search continuing</small></span></div>}</section>
        </aside>
      </main>
      <footer className="workspace-footer"><span><LockKey />Simulated call · fictional seller · no real number dialled</span><span>Conversation and risk branch are not statements by eBay or any captured seller</span><span>Mandate boundary enforced</span></footer>
      <DemoLabel />
    </div>
  );
}

export function CinematicDemo({ internalQa = false }: { internalQa?: boolean }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playback = useScenarioOrchestrator(audioRef);
  const token = `${playback.sessionKey}:${playback.stage?.id ?? "home"}`;

  return <>
    <audio ref={audioRef} data-testid="call-audio" preload="none" />
    {playback.recording && !playback.assetsReady ? <div className="recording-loader" data-testid="recording-loader"><MiniBrand /><div><i style={{ width: `${Math.round(playback.assetProgress * 100)}%` }} /></div><span>Preparing offline demo assets…</span></div> : null}
    <MotionSurface token={token}>
      {!playback.scenarioId && <div data-testid="home-screen" data-ready={playback.hydrated ? "true" : "false"}><HomeScreen start={playback.start} /></div>}
      {playback.scenarioId && playback.elapsedMs < 2_300 && <ScenarioLaunch scenario={playback.scenarioId} elapsedMs={playback.elapsedMs} />}
      {playback.scenarioId === "retail" && playback.elapsedMs >= 2_300 && <RetailScreen elapsedMs={playback.elapsedMs} phase={playback.stage?.id ?? "enter"} />}
      {playback.scenarioId === "private" && playback.elapsedMs >= 2_300 && <PrivateScreen elapsedMs={playback.elapsedMs} phase={playback.stage?.id ?? "enter"} />}
      {playback.scenarioId === "foreign" && playback.elapsedMs >= 2_300 && <ForeignScreen elapsedMs={playback.elapsedMs} callElapsedMs={playback.callElapsedMs} phase={playback.stage?.id ?? "source"} status={playback.status} approve={playback.approveCall} />}
    </MotionSurface>
    {internalQa ? <div className="qa-readout"><strong>Internal QA</strong><span>{playback.scenarioId ?? "home"}</span><span>{playback.stage?.id ?? "ready"}</span><span>{(playback.elapsedMs / 1_000).toFixed(1)} s</span><button type="button" onClick={playback.reset}>Reset</button></div> : null}
  </>;
}
