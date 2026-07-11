"use client";

/* eslint-disable @next/next/no-img-element -- Frozen local source captures must remain exact and offline. */
import {
  ArrowRight,
  CheckCircle,
  CircleNotch,
  FolderOpen,
  Info,
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
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type Scenario = "home" | "retail" | "private" | "foreign";
type TimelineStep = { id: string; duration: number | null; pause?: boolean };

const A = "/demo-assets";

const timelines: Record<Exclude<Scenario, "home">, TimelineStep[]> = {
  retail: [
    { id: "typing", duration: 2600 },
    { id: "mandate", duration: 2600 },
    { id: "search", duration: 2200 },
    { id: "sources", duration: 2800 },
    { id: "compare", duration: 2200 },
    { id: "reject", duration: 2200 },
    { id: "coupon", duration: 2600 },
    { id: "purchase", duration: 3500 },
    { id: "receipt", duration: null },
  ],
  private: [
    { id: "typing", duration: 2600 },
    { id: "source", duration: 2400 },
    { id: "listing", duration: 2400 },
    { id: "question", duration: 3000 },
    { id: "reply", duration: 3400 },
    { id: "evidence", duration: 3000 },
    { id: "negotiate", duration: 3600 },
    { id: "checkout", duration: 3200 },
    { id: "ready", duration: null },
  ],
  foreign: [
    { id: "source", duration: 3800 },
    { id: "phone-request", duration: 3600 },
    { id: "approval", duration: null, pause: true },
    { id: "calling", duration: 4000 },
    { id: "transcript", duration: 9000 },
    { id: "warning", duration: 7000 },
    { id: "refusal", duration: 7000 },
    { id: "rejected", duration: 4000 },
    { id: "continue", duration: null },
  ],
};

const scenarioCopy = {
  retail: {
    title: "Find Samba OG EU43 & get best true cost",
    request: "Find adidas Samba OG in EU43, new, under 350 PLN delivered. Buy automatically if the retailer is trusted and the final cost stays within my mandate.",
  },
  private: {
    title: "Verify and negotiate a private listing",
    request: "Find a Nintendo Switch OLED under 1,000 PLN. Verify the condition and keep payment inside OLX protection.",
  },
  foreign: {
    title: "Detect unsafe seller behavior",
    request: "Find a Fujifilm X100F under €1,200. Buyer protection is mandatory. Never use a direct bank transfer.",
  },
};

function currentPhase(scenario: Scenario, step: number) {
  if (scenario === "home") return "home";
  return timelines[scenario][Math.min(step, timelines[scenario].length - 1)]?.id ?? "home";
}

function MiniBrand({ large = false }: { large?: boolean }) {
  return <img className={large ? "cinema-brand cinema-brand--large" : "cinema-brand"} src="/brand/relyo-wordmark.svg" alt="Relyo" />;
}

function DemoLabel() {
  return <span className="cinema-demo-label">Scripted demo · No live transactions</span>;
}

function TrustFooter({ scenario = "home" }: { scenario?: Scenario }) {
  return (
    <footer className="trust-footer">
      <div><img src={`${A}/icons/verification-check.svg`} alt="" /><strong>{scenario === "home" ? "You’re in control." : "Your mandate. Your evidence. Your decision."}</strong></div>
      <span>{scenario === "home" ? "I only act within your mandate." : "Public sources and simulated actions stay visibly separate."}</span>
      <span className="trust-footer__end"><i />{scenario === "home" ? "All systems ready" : "Deterministic playback"}</span>
    </footer>
  );
}

function HomeScreen({ start }: { start: (scenario: Exclude<Scenario, "home">) => void }) {
  const cards = [
    { scenario: "retail" as const, image: `${A}/product/adidas-samba-og-ig1024-source.webp`, title: "Buy adidas Samba OG", body: "Compare true cost and act inside a hard cap." },
    { scenario: "private" as const, image: `${A}/product/switch-bundle-simulated.png`, title: "Verify a private listing", body: "Collect evidence and negotiate safely." },
    { scenario: "foreign" as const, image: `${A}/product/fujifilm-x100f-ebay-source.webp`, title: "Check a foreign seller", body: "Call privately and stop unsafe payment." },
  ];

  return (
    <div className="cinema cinema--home">
      <header className="home-header">
        <MiniBrand large />
        <div className="home-header__path" />
        <div className="home-header__status"><CircleNotch className="spin-slow" size={30} /><span>Demo mode</span><Info size={18} /></div>
        <div className="home-header__status"><ShieldCheck size={27} /><span>Mandate inactive</span><Info size={18} /></div>
        <UserCircle size={44} weight="regular" />
        <SlidersHorizontal size={32} />
      </header>
      <main className="home-main">
        <section className="home-workspace">
          <div className="home-intro">
            <div className="home-mark"><img src="/brand/relyo-symbol.svg" alt="Relyo protected handoff" /></div>
            <div><h1>Hello. I’m Relyo.<br />Your AI shopping agent.</h1><p>I research, compare, and buy on your behalf—<br />only within your mandate, always with proof.</p></div>
          </div>
          <div className="home-composer">
            <div><span>What would you like me to find or buy?</span><small>Be specific about item, preferences, budget, and timing.</small></div>
            <div className="home-composer__tools"><Paperclip /><Tag /><SlidersHorizontal /></div>
            <button type="button" aria-label="Start a shopping request"><img src="/brand/relyo-symbol.svg" alt="" /></button>
          </div>
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
          <div className="evidence-title"><span>Evidence</span><span>0 items</span></div>
          <div className="evidence-path" />
          <div className="evidence-empty"><FolderOpen size={118} weight="thin" /><strong>No evidence yet</strong><p>When I research or act,<br />you’ll see sources,<br />prices, and updates here.</p></div>
          <button type="button">View all activity <ArrowRight size={25} /></button>
        </aside>
      </main>
      <TrustFooter />
      <DemoLabel />
    </div>
  );
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

function RetailScreen({ step }: { step: number }) {
  const phase = currentPhase("retail", step);
  const showMandate = step >= 1;
  const showSources = step >= 2;
  const showSecond = step >= 3;
  const showDecision = step >= 4;
  const showRejected = step >= 5;
  const showCoupon = step >= 6;
  const purchased = step >= 7;
  const receipt = step >= 8;
  return (
    <div className="cinema cinema--workspace">
      <WorkspaceHeader scenario="retail" phase={phase} />
      <main className="retail-grid">
        <section className="retail-chat soft-panel">
          <div className="panel-title"><strong>Conversation</strong><span>New chat</span></div>
          <div className="chat-user reveal">{scenarioCopy.retail.request}<small>10:21&nbsp; ✓✓</small></div>
          <div className={step >= 1 ? "chat-agent reveal" : "chat-agent is-hidden"}>On it. I’ll compare trusted stores, apply only valid coupons, and show you the true landed cost.<small>10:21</small></div>
          <div className={showMandate ? "mandate-box reveal" : "mandate-box is-hidden"}>
            <div><strong>Your mandate</strong><span>Active</span></div>
            {["Product · adidas Samba OG", "Size · EU43", "Condition · New", "Deliver to · Poland", "Hard cap · 350 PLN", "Valid coupons only"].map((item) => <p key={item}><CheckCircle weight="fill" />{item}</p>)}
          </div>
        </section>
        <section className="retail-sources soft-panel">
          <div className="panel-title panel-title--large"><strong>{showSources ? "Top matches (2)" : "Searching public sources"}</strong><span>Public source captures</span></div>
          <article className={showSources ? "retail-source-card reveal" : "retail-source-card is-loading"}>
            <div className="source-card-head"><b>1</b><strong>adidas.pl</strong><SourceBadge /></div>
            <img src={`${A}/sources/adidas/adidas-ig1024-viewport.webp`} alt="Unmodified adidas Samba OG product-page capture" />
            <div className="source-card-meta"><span className="danger-text"><X />EU43 unavailable in capture</span><span>Displayed price<strong>396.75 PLN</strong></span><span>Final decision<strong>{showRejected ? "Rejected" : "Checking"}</strong></span></div>
          </article>
          <article className={showSecond ? "retail-source-card retail-source-card--second reveal" : "retail-source-card retail-source-card--second is-loading"}>
            <div className="source-card-head"><b>2</b><strong>eobuwie.pl</strong><SourceBadge /></div>
            <img src={`${A}/sources/retail/eobuwie-ig1024-viewport.webp`} alt="Unmodified eobuwie Samba OG product-page capture" />
            <div className="source-card-meta"><span><CheckCircle weight="fill" />Exact product</span><span>Displayed price<strong>339.99 PLN</strong></span><span>Demo delivery<strong>0.99 PLN</strong></span></div>
          </article>
        </section>
        <aside className="decision-trail soft-panel">
          <div className="panel-title panel-title--large"><strong>Decision trail</strong></div>
          {!showDecision ? <div className="trail-empty"><CircleNotch className="spin-slow" size={42} /><strong>Comparing true cost</strong><span>Product · delivery · returns · coupon</span></div> : <>
            <div className={purchased ? "selected-offer reveal" : "selected-offer selected-offer--pending reveal"}><CheckCircle weight="fill" /><span><small>{purchased ? "Selected offer" : "Best valid offer"}</small><strong>eobuwie.pl</strong></span></div>
            <SourceBadge />
            <div className="cost-lines"><p><span>Displayed price</span><strong>339.99 PLN</strong></p><p><span>Deterministic delivery</span><strong>0.99 PLN</strong></p><p><span>Coupon applied</span><strong>{showCoupon ? "None valid" : "Checking"}</strong></p><p className="cost-total"><span>True landed cost</span><strong>340.98 PLN</strong></p></div>
            <div className="offer-checks">
              <h3>All checked offers</h3>
              <div className="offer-row offer-row--good"><CheckCircle weight="fill" /><span><strong>eobuwie.pl</strong><small>340.98 PLN · within mandate</small></span><em>Selected</em></div>
              {showRejected && <div className="offer-row offer-row--bad reveal"><X /><span><strong>adidas.pl</strong><small>EU43 unavailable · above cap</small></span><em>Rejected</em></div>}
              {showCoupon && <div className="coupon-row reveal"><Tag /><span><strong>Coupon rejected</strong><small>Scripted code did not validate</small></span></div>}
            </div>
            {receipt && <div className="mandate-result reveal"><ShieldCheck /><span><strong>Purchased within mandate</strong><small>Simulated payment authorization · AP2-aligned mandate concept · 9.02 PLN below cap</small></span></div>}
          </>}
        </aside>
      </main>
      <footer className="workspace-footer"><span><i />Public reference capture — unmodified merchant page</span><span><i />Deterministic demo values — separate calculation</span><span>Esc · return home</span></footer>
      <DemoLabel />
    </div>
  );
}

function PrivateScreen({ step }: { step: number }) {
  const phase = currentPhase("private", step);
  const showSource = step >= 1;
  const showQuestion = step >= 3;
  const showReply = step >= 4;
  const showEvidence = step >= 5;
  const showNegotiation = step >= 6;
  const checkout = step >= 7;
  const ready = step >= 8;
  return (
    <div className="cinema cinema--workspace">
      <WorkspaceHeader scenario="private" phase={phase} />
      <main className="private-grid">
        <section className="private-source soft-panel">
          <div className="section-heading"><MagnifyingGlass /><div><strong>Authentic OLX source capture</strong><span>Current search context · no real seller contacted</span></div></div>
          <div className={showSource ? "olx-capture reveal" : "olx-capture is-loading"}><SourceBadge /><img src={`${A}/sources/olx/olx-switch-search-demo-column.png`} alt="Cropped, unmodified OLX Nintendo Switch OLED search-results capture" /></div>
          <div className="source-integrity"><ShieldCheck /><span><strong>Source integrity</strong><small>Seller identity and contact details redacted. Conversation and added evidence are simulated.</small></span></div>
        </section>
        <section className="seller-thread soft-panel">
          <div className="section-heading"><span className="chat-icon">••</span><div><strong>Simulated seller conversation</strong><span>Fictionalized seller branch · no message sent</span></div></div>
          {showQuestion && <div className="thread-message reveal"><img src="/brand/relyo-symbol.svg" alt="" /><div><strong>Relyo</strong><p>Dzień dobry. Czy konsola jest dostępna? Proszę o zdjęcie ekranu, numeru seryjnego i akcesoriów. Czy możemy użyć Przesyłki OLX?</p><em>Requesting missing evidence</em></div></div>}
          {showReply && <div className="thread-message thread-message--seller reveal"><img src={`${A}/seller/avatar-private.svg`} alt="Fictional seller" /><div><strong>Fictional seller</strong><p>Tak, dostępna. Wysyłam zdjęcia. Płatność i wysyłka przez OLX są w porządku.</p>{showEvidence && <div className="evidence-thumbs"><figure><img src={`${A}/product/switch-touchscreen-simulated.webp`} alt="Simulated screen evidence" /><figcaption>Simulated evidence</figcaption></figure><figure><img src={`${A}/product/switch-bundle-simulated.png`} alt="Simulated bundle evidence" /><figcaption>Simulated evidence</figcaption></figure></div>}</div></div>}
          {showNegotiation && <><div className="thread-message reveal"><img src="/brand/relyo-symbol.svg" alt="" /><div><strong>Relyo</strong><p>Mogę zaproponować 880 zł z wysyłką OLX.</p><em>Inside negotiation mandate</em></div></div><div className="thread-message thread-message--seller reveal"><img src={`${A}/seller/avatar-private.svg`} alt="Fictional seller" /><div><strong>Fictional seller</strong><p>Najniższa cena to 920 zł.</p><em>Counteroffer</em></div></div></>}
          {ready && <div className="thread-success reveal"><CheckCircle weight="fill" />920 zł accepted inside mandate. Protected checkout prepared for your approval.</div>}
        </section>
        <aside className="checkout-panel soft-panel">
          <div className="section-heading"><LockKey /><div><strong>Protected checkout summary</strong><span>Simulated · approval required</span></div></div>
          <div className="checkout-product"><img src={`${A}/product/switch-bundle-simulated.png`} alt="Simulated Nintendo Switch bundle" /><div><strong>Nintendo Switch OLED bundle</strong><span>Used · simulated evidence</span></div></div>
          <div className="checkout-cost"><p><span>Negotiated price</span><strong>920.00 PLN</strong></p><p><span>Delivery</span><strong>15.99 PLN</strong></p><p><span>Buyer-protection fee</span><strong>15.99 PLN</strong></p><p><span>Total prepared</span><strong>951.98 PLN</strong></p></div>
          <button type="button" className={checkout ? "checkout-button is-ready" : "checkout-button"}><LockKey />{checkout ? "Simulated checkout prepared" : "Waiting for verified evidence"}</button>
          <div className="evidence-ledger"><h3>Evidence ledger</h3>{["OLX source captured", "Screen photo received", "Serial number received", "Accessories confirmed", "Negotiation completed", "No payment made"].map((item, index) => <p key={item} className={index <= (showEvidence ? 5 : showReply ? 1 : 0) ? "is-complete" : ""}><span>{item}</span><CheckCircle /></p>)}</div>
          {ready && <div className="protected-ready reveal"><ShieldCheck /><span><strong>Verified deal ready for approval</strong><small>Reserved for 15 minutes · no payment made</small></span></div>}
        </aside>
      </main>
      <footer className="workspace-footer workspace-footer--brand"><MiniBrand /><span>Your agent. Your rules. Your evidence.</span><span>Simulated seller conversation · no real seller contacted</span></footer>
      <DemoLabel />
    </div>
  );
}

const transcript = [
  { at: "00:04", who: "Agent", de: "Können wir die Zahlung über die Plattform mit Käuferschutz abwickeln?", pl: "Czy możemy zapłacić przez platformę z ochroną kupującego?", risk: false },
  { at: "00:11", who: "Seller", de: "Nein, überweisen Sie direkt. So sparen wir beide die Gebühren.", pl: "Nie, proszę zrobić przelew bezpośredni. Oboje oszczędzimy prowizję.", risk: true },
  { at: "00:19", who: "Agent", de: "Ohne Käuferschutz kann ich die Transaktion nicht fortsetzen.", pl: "Bez ochrony kupującego nie mogę kontynuować transakcji.", risk: false },
  { at: "00:24", who: "Seller", de: "Ich akzeptiere keinen Käuferschutz.", pl: "Nie akceptuję ochrony kupującego.", risk: true },
];

function ForeignScreen({ step, approve }: { step: number; approve: () => void }) {
  const phase = currentPhase("foreign", step);
  const phoneRequested = step >= 1;
  const approval = step === 2;
  const calling = step >= 3;
  const showTranscript = step >= 4;
  const warning = step >= 5;
  const refusal = step >= 6;
  const rejected = step >= 7;
  return (
    <div className="cinema cinema--workspace">
      <WorkspaceHeader scenario="foreign" phase={phase} />
      <main className="foreign-grid">
        <section className="foreign-source soft-panel">
          <div className="numbered-heading"><b>1</b><strong>Source evidence</strong></div>
          <div className="auth-source-title"><span>Authentic source capture</span><ShieldCheck /></div>
          <img className="ebay-capture" src={`${A}/sources/foreign/ebay-x100f-search-viewport.webp`} alt="Unmodified eBay Fujifilm X100F search capture" />
          <SourceBadge />
          <div className="deterministic-listing"><span>Deterministic demo values</span><div><img src={`${A}/product/fujifilm-x100f-ebay-source.webp`} alt="Fujifilm X100F reference product" /><section><h3>Fujifilm X100F</h3><p>Demo offer: €805 + €5.50 delivery</p><small>Separate from the public €1,100 + €20 capture</small></section></div></div>
        </section>
        <section className="call-workspace soft-panel">
          <div className="numbered-heading"><b>2</b><strong>Simulated seller verification call</strong><span>{approval ? "Before connection" : calling ? "00:27 scripted call" : "Awaiting seller"}</span></div>
          <div className={phoneRequested ? "call-preflight reveal" : "call-preflight is-hidden"}><div><strong>Call seller through a simulated privacy relay</strong><p>User number not shared · seller identity fictional</p></div><div><Phone weight="fill" /><strong>+49 ••• ••• 4821</strong></div>{approval ? <button type="button" onClick={approve}>Allow agent to call</button> : calling ? <span className="call-live"><i />{rejected ? "Call ended" : "Call in progress"}</span> : <span>Approval required</span>}</div>
          <div className={phoneRequested ? calling ? "call-session reveal" : "call-session call-session--preview reveal" : "call-session is-hidden"}>
            <div className="call-session__meta"><span><i />{rejected ? "Call ended" : "Call in progress"}</span><strong>{rejected ? "00:27" : "00:18"}</strong><span>Synchronized scripted transcript</span></div>
            <img className="waveform-image" src={`${A}/call/waveform-27s.svg`} alt="Deterministic 27-second call waveform" />
            <div className="transcript-table"><header><span>Time</span><span>Deutsch · original</span><span>Polski · tłumaczenie</span></header>{transcript.map((line, index) => <div key={line.at} className={line.risk && (warning || refusal) ? "is-risk" : index > (showTranscript ? 3 : 0) ? "is-hidden" : ""}><time>{line.at}</time><p><strong>{line.who}</strong>{line.de}</p><p>{line.pl}</p></div>)}</div>
          </div>
          {rejected && <div className="handoff-stop reveal"><img src={`${A}/warnings/risk-warning.svg`} alt="Risk boundary" /><span><strong>Protected handoff stopped at the risk boundary</strong><small>The fictional seller refused buyer protection and requested direct transfer.</small></span><X size={33} /></div>}
        </section>
        <aside className="risk-panel">
          <section className="soft-panel mandate-policy"><div className="numbered-heading"><b>3</b><strong>Your mandate & policy</strong></div><h3>Your mandate</h3><p>Find Fujifilm X100F, max €1,200, with safe payment and buyer protection. No direct bank transfer.</p><h3>Relyo policy</h3>{["Use protected channels only", "Require buyer protection", "Never share personal or payment data", "Reject unsafe transaction requests", "Continue search until safe match"].map((rule) => <div key={rule}><CheckCircle />{rule}</div>)}</section>
          <section className="soft-panel risk-ledger"><div className="numbered-heading"><b>4</b><strong>Risk ledger</strong></div><p><CheckCircle /><span>Simulated privacy relay</span><em>Kept</em></p><p className={warning ? "is-risk reveal" : ""}><Warning /><span>Off-platform payment request</span><em>{warning ? "High risk" : "Monitoring"}</em></p><p className={refusal ? "is-risk reveal" : ""}><Warning /><span>Buyer protection refused</span><em>{refusal ? "Critical" : "Monitoring"}</em></p><p><CheckCircle /><span>Money transferred</span><em>No</em></p><p><CheckCircle /><span>Personal data shared</span><em>No</em></p>{rejected && <div className="listing-rejected reveal"><img src={`${A}/warnings/rejection-illustration.svg`} alt="Listing rejected" /><span><strong>Listing rejected</strong><small>No money transferred<br />No personal data shared<br />Mandate preserved<br />Search continuing</small></span></div>}</section>
        </aside>
      </main>
      <footer className="workspace-footer"><span><LockKey />Simulated call · fictional seller · no real number dialled</span><span>Conversation and risk branch are not statements by eBay or any captured seller</span><span>Esc · return home</span></footer>
      <DemoLabel />
    </div>
  );
}

export function CinematicDemo() {
  const [scenario, setScenario] = useState<Scenario>("home");
  const [step, setStep] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const stopAudio = useCallback(() => {
    if (!audioRef.current) return;
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
  }, []);

  const goHome = useCallback(() => {
    stopAudio();
    setScenario("home");
    setStep(0);
  }, [stopAudio]);

  const start = useCallback((next: Exclude<Scenario, "home">) => {
    stopAudio();
    setStep(0);
    setScenario(next);
  }, [stopAudio]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") return goHome();
      if (scenario !== "home") return;
      if (event.key === "1") start("retail");
      if (event.key === "2") start("private");
      if (event.key === "3") start("foreign");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goHome, scenario, start]);

  const active = useMemo(() => scenario === "home" ? null : timelines[scenario][step], [scenario, step]);
  useEffect(() => {
    if (!active || active.duration === null || active.pause) return;
    const timer = window.setTimeout(() => setStep((value) => Math.min(value + 1, timelines[scenario as Exclude<Scenario, "home">].length - 1)), active.duration);
    return () => window.clearTimeout(timer);
  }, [active, scenario]);

  const approveCall = useCallback(() => {
    if (scenario !== "foreign" || currentPhase("foreign", step) !== "approval") return;
    setStep(3);
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      void audioRef.current.play().catch(() => undefined);
    }
  }, [scenario, step]);

  return <>
    <audio ref={audioRef} preload="auto" src={`${A}/audio/scenario-3-call-combined.m4a`} />
    {scenario === "home" && <HomeScreen start={start} />}
    {scenario === "retail" && <RetailScreen step={step} />}
    {scenario === "private" && <PrivateScreen step={step} />}
    {scenario === "foreign" && <ForeignScreen step={step} approve={approveCall} />}
  </>;
}
