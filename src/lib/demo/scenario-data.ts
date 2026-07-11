export type ScenarioId = "retail" | "private" | "foreign";
export type AnimationType = "compose" | "stagger" | "expand" | "calculate" | "risk" | "decision";
export type AudioEvent = "none" | "call-start" | "call-stop";

export type ScenarioStage = {
  id: string;
  startMs: number;
  durationMs: number | null;
  visibleCopy: string[];
  activeComponents: string[];
  assetReferences: string[];
  layoutState: string;
  animationType: AnimationType;
  audioEvent: AudioEvent;
  pauseCondition?: "call-approval";
  nextStage: string | null;
  finalState: boolean;
};

export type PriceHistoryPoint = {
  at: string;
  price: number;
};

export type ScenarioDefinition = {
  id: ScenarioId;
  product: string;
  title: string;
  request: string;
  durationMs: number;
  assets: string[];
  stages: ScenarioStage[];
  priceHistory?: PriceHistoryPoint[];
};

export const retailSources = [
  { name: "adidas", result: "Candidate", tone: "candidate" },
  { name: "eobuwie", result: "Candidate", tone: "candidate" },
  { name: "Zalando", result: "EU43 unavailable", tone: "rejected" },
  { name: "Sizeer", result: "Higher final cost", tone: "rejected" },
  { name: "Footshop", result: "Delivery added", tone: "rejected" },
  { name: "JD Sports", result: "Wrong variant", tone: "rejected" },
  { name: "PRM", result: "Product unavailable", tone: "rejected" },
  { name: "Farfetch", result: "Above best cost", tone: "rejected" },
] as const;

const retail: ScenarioDefinition = {
  id: "retail",
  product: "adidas Samba OG",
  title: "Find Samba OG EU43 & get best true cost",
  request: "Find adidas Samba OG in EU43, new and in stock. Get the best true cost to my door in Poland.",
  durationMs: 20_000,
  assets: [
    "/demo-assets/sources/adidas/adidas-ig1024-viewport.webp",
    "/demo-assets/sources/retail/eobuwie-ig1024-viewport.webp",
    "/demo-assets/product/adidas-samba-og-ig1024-source.webp",
  ],
  stages: [
    { id: "enter", startMs: 0, durationMs: 500, visibleCopy: [], activeComponents: ["header", "conversation"], assetReferences: [], layoutState: "conversation", animationType: "compose", audioEvent: "none", nextStage: "typing", finalState: false },
    { id: "typing", startMs: 500, durationMs: 2_500, visibleCopy: ["Find adidas Samba OG in EU43, new and in stock. Get the best true cost to my door in Poland."], activeComponents: ["composer", "typing"], assetReferences: [], layoutState: "conversation", animationType: "compose", audioEvent: "none", nextStage: "mandate", finalState: false },
    { id: "mandate", startMs: 3_000, durationMs: 2_500, visibleCopy: ["I’ll search trusted stores, verify availability and discounts, and compare the final delivered cost."], activeComponents: ["conversation", "mandate"], assetReferences: [], layoutState: "conversation-mandate", animationType: "stagger", audioEvent: "none", nextStage: "market-search", finalState: false },
    { id: "market-search", startMs: 5_500, durationMs: 4_500, visibleCopy: ["Searching trusted stores", "8 sources checked", "4 viable offers", "2 best matching offers"], activeComponents: ["source-funnel", "progress-line"], assetReferences: [], layoutState: "search", animationType: "stagger", audioEvent: "none", nextStage: "finalists", finalState: false },
    { id: "finalists", startMs: 10_000, durationMs: 3_000, visibleCopy: ["2 best matching offers"], activeComponents: ["adidas-capture", "eobuwie-capture"], assetReferences: ["/demo-assets/sources/adidas/adidas-ig1024-viewport.webp", "/demo-assets/sources/retail/eobuwie-ig1024-viewport.webp"], layoutState: "comparison", animationType: "expand", audioEvent: "none", nextStage: "coupon", finalState: false },
    { id: "coupon", startMs: 13_000, durationMs: 3_000, visibleCopy: ["Validating SUMMER30", "Coupon valid", "eobuwie promotion unavailable"], activeComponents: ["coupon-validation", "decision-trail"], assetReferences: [], layoutState: "comparison", animationType: "calculate", audioEvent: "none", nextStage: "true-cost", finalState: false },
    { id: "true-cost", startMs: 16_000, durationMs: 2_500, visibleCopy: ["396.75 PLN", "−119.02 PLN", "277.73 PLN"], activeComponents: ["cost-calculation", "offer-status"], assetReferences: [], layoutState: "decision", animationType: "calculate", audioEvent: "none", nextStage: "decision", finalState: false },
    { id: "decision", startMs: 18_500, durationMs: 1_500, visibleCopy: ["adidas selected", "Use valid coupons only. Show total landed cost."], activeComponents: ["selected-offer", "protected-handoff"], assetReferences: [], layoutState: "decision", animationType: "decision", audioEvent: "none", nextStage: "final", finalState: false },
    { id: "final", startMs: 20_000, durationMs: null, visibleCopy: ["277.73 PLN", "Protected handoff complete"], activeComponents: ["retail-final"], assetReferences: [], layoutState: "decision", animationType: "decision", audioEvent: "none", nextStage: null, finalState: true },
  ],
};

const privateSeller: ScenarioDefinition = {
  id: "private",
  product: "Nintendo Switch OLED",
  title: "Verify and negotiate a private listing",
  request: "Find a Nintendo Switch OLED listing, verify the missing evidence and preserve OLX buyer protection.",
  durationMs: 19_000,
  assets: [
    "/demo-assets/sources/olx/olx-switch-search-demo-column.png",
    "/demo-assets/product/switch-touchscreen-simulated.webp",
    "/demo-assets/product/switch-bundle-simulated.png",
    "/demo-assets/seller/avatar-private.svg",
  ],
  stages: [
    { id: "enter", startMs: 0, durationMs: 500, visibleCopy: [], activeComponents: ["header", "search"], assetReferences: [], layoutState: "source", animationType: "compose", audioEvent: "none", nextStage: "search", finalState: false },
    { id: "search", startMs: 500, durationMs: 2_000, visibleCopy: ["Searching OLX listings"], activeComponents: ["olx-search"], assetReferences: ["/demo-assets/sources/olx/olx-switch-search-demo-column.png"], layoutState: "source", animationType: "expand", audioEvent: "none", nextStage: "listing", finalState: false },
    { id: "listing", startMs: 2_500, durationMs: 1_500, visibleCopy: ["Promising listing found"], activeComponents: ["olx-capture", "listing-highlight"], assetReferences: [], layoutState: "source", animationType: "expand", audioEvent: "none", nextStage: "gaps", finalState: false },
    { id: "gaps", startMs: 4_000, durationMs: 2_000, visibleCopy: ["Screen condition", "Serial number", "Included accessories"], activeComponents: ["evidence-gaps", "ledger"], assetReferences: [], layoutState: "evidence", animationType: "stagger", audioEvent: "none", nextStage: "question", finalState: false },
    { id: "question", startMs: 6_000, durationMs: 2_500, visibleCopy: ["Hello! I’m interested in the Nintendo Switch OLED from your listing. Could you send a photo of the screen, the console serial number, and confirm that all accessories are included?", "Evidence request"], activeComponents: ["seller-thread", "typing"], assetReferences: [], layoutState: "conversation", animationType: "compose", audioEvent: "none", nextStage: "evidence", finalState: false },
    { id: "evidence", startMs: 8_500, durationMs: 3_000, visibleCopy: ["Of course — I’m sending the photos now."], activeComponents: ["seller-reply", "evidence-images", "ledger"], assetReferences: ["/demo-assets/product/switch-touchscreen-simulated.webp", "/demo-assets/product/switch-bundle-simulated.png"], layoutState: "conversation", animationType: "stagger", audioEvent: "none", nextStage: "negotiate", finalState: false },
    { id: "negotiate", startMs: 11_500, durationMs: 3_500, visibleCopy: ["Thank you. Could we complete the deal for 880 PLN with OLX shipping?", "My lowest price is 930 PLN with OLX shipping.", "I accept 930 PLN with OLX shipping."], activeComponents: ["negotiation", "price-bridge"], assetReferences: [], layoutState: "negotiation", animationType: "calculate", audioEvent: "none", nextStage: "checkout", finalState: false },
    { id: "checkout", startMs: 15_000, durationMs: 2_500, visibleCopy: ["930 PLN", "OLX shipping: 0 PLN", "Buyer protection: included", "Total due: 930 PLN"], activeComponents: ["checkout", "ledger"], assetReferences: [], layoutState: "checkout", animationType: "calculate", audioEvent: "none", nextStage: "ready", finalState: false },
    { id: "ready", startMs: 17_500, durationMs: 1_500, visibleCopy: ["Protected checkout prepared"], activeComponents: ["protected-handoff"], assetReferences: [], layoutState: "checkout", animationType: "decision", audioEvent: "none", nextStage: "final", finalState: false },
    { id: "final", startMs: 19_000, durationMs: null, visibleCopy: ["Verified deal ready", "No payment made"], activeComponents: ["private-final"], assetReferences: [], layoutState: "checkout", animationType: "decision", audioEvent: "none", nextStage: null, finalState: true },
  ],
};

export const callLines = [
  { startMs: 0, endMs: 4_000, speaker: "Relyo", text: "Hi, I’m calling about the Fujifilm X100F. Could you confirm its technical condition and send a few additional photos?", risk: null },
  { startMs: 4_000, endMs: 11_000, speaker: "Seller", text: "Yeah, listen, it would be easier if we handled this privately. I don’t want to deal with all the fees eBay is going to charge us.", risk: "Seller suggests moving the transaction outside eBay · Medium risk" },
  { startMs: 11_000, endMs: 16_000, speaker: "Seller", text: "Just send me the money directly and I’ll ship the camera. We both save money that way.", risk: "Direct bank transfer requested · Critical risk" },
  { startMs: 16_000, endMs: 20_000, speaker: "Relyo", text: "For safety, I need the payment and transaction to stay on eBay with buyer protection.", risk: null },
  { startMs: 20_000, endMs: 25_000, speaker: "Seller", text: "It’s a win-win. I’ll send you my payment details. Just send me the shipping address on WhatsApp.", risk: "Personal data requested outside the platform · High risk" },
  { startMs: 25_000, endMs: 28_000, speaker: "Relyo", text: "I can’t continue outside eBay or without buyer protection.", risk: null },
  { startMs: 28_000, endMs: 31_000, speaker: "Seller", text: "Then stop wasting my time.", risk: "Seller ended the call" },
] as const;

const foreign: ScenarioDefinition = {
  id: "foreign",
  product: "Fujifilm X100F",
  title: "Stop an unsafe seller transaction",
  request: "Find Fujifilm X100F under €1,200 with safe payment and buyer protection. Never use direct bank transfer.",
  durationMs: 35_000,
  assets: [
    "/demo-assets/sources/foreign/ebay-x100f-search-viewport.webp",
    "/demo-assets/product/fujifilm-x100f-ebay-source.webp",
    "/demo-assets/seller/avatar-foreign-imagegen.png",
    "/demo-assets/call/waveform-27s.svg",
    "/demo-assets/warnings/rejection-illustration.svg",
  ],
  stages: [
    { id: "source", startMs: 0, durationMs: 1_400, visibleCopy: ["Fujifilm X100F", "Used", "€1,100", "€20 shipping"], activeComponents: ["ebay-capture", "listing-summary"], assetReferences: ["/demo-assets/sources/foreign/ebay-x100f-search-viewport.webp"], layoutState: "source", animationType: "expand", audioEvent: "none", nextStage: "mandate", finalState: false },
    { id: "mandate", startMs: 1_400, durationMs: 1_100, visibleCopy: ["Protected channels only", "Buyer protection required", "No direct bank transfer", "No personal data sharing"], activeComponents: ["mandate", "policy"], assetReferences: [], layoutState: "policy", animationType: "stagger", audioEvent: "none", nextStage: "message", finalState: false },
    { id: "message", startMs: 2_500, durationMs: 1_500, visibleCopy: ["Hello! I’m contacting you about the Fujifilm X100F. Is it still available? Could you confirm its technical condition, any visible wear and what is included?", "Yes, it’s available. Please call me. It will be easier to explain."], activeComponents: ["seller-conversation", "phone-request"], assetReferences: [], layoutState: "conversation", animationType: "compose", audioEvent: "none", nextStage: "approval", finalState: false },
    { id: "approval", startMs: 4_000, durationMs: null, visibleCopy: ["The seller wants to continue by phone. I can call through a privacy-protected relay and verify the transaction conditions."], activeComponents: ["call-approval"], assetReferences: [], layoutState: "call-preview", animationType: "compose", audioEvent: "none", pauseCondition: "call-approval", nextStage: "call-00", finalState: false },
    { id: "call-00", startMs: 4_000, durationMs: 4_000, visibleCopy: [callLines[0].text], activeComponents: ["call", "timer", "waveform", "transcript"], assetReferences: [], layoutState: "call", animationType: "compose", audioEvent: "call-start", nextStage: "call-04", finalState: false },
    { id: "call-04", startMs: 8_000, durationMs: 7_000, visibleCopy: [callLines[1].text, callLines[1].risk!], activeComponents: ["call", "transcript", "risk-medium"], assetReferences: [], layoutState: "call", animationType: "risk", audioEvent: "none", nextStage: "call-11", finalState: false },
    { id: "call-11", startMs: 15_000, durationMs: 5_000, visibleCopy: [callLines[2].text, callLines[2].risk!], activeComponents: ["call", "transcript", "risk-critical"], assetReferences: [], layoutState: "call", animationType: "risk", audioEvent: "none", nextStage: "call-16", finalState: false },
    { id: "call-16", startMs: 20_000, durationMs: 4_000, visibleCopy: [callLines[3].text], activeComponents: ["call", "transcript"], assetReferences: [], layoutState: "call", animationType: "compose", audioEvent: "none", nextStage: "call-20", finalState: false },
    { id: "call-20", startMs: 24_000, durationMs: 5_000, visibleCopy: [callLines[4].text, callLines[4].risk!], activeComponents: ["call", "transcript", "risk-personal-data"], assetReferences: [], layoutState: "call", animationType: "risk", audioEvent: "none", nextStage: "call-25", finalState: false },
    { id: "call-25", startMs: 29_000, durationMs: 3_000, visibleCopy: [callLines[5].text], activeComponents: ["call", "transcript"], assetReferences: [], layoutState: "call", animationType: "compose", audioEvent: "none", nextStage: "call-28", finalState: false },
    { id: "call-28", startMs: 32_000, durationMs: 3_000, visibleCopy: [callLines[6].text], activeComponents: ["call", "transcript", "call-ended", "analysis"], assetReferences: [], layoutState: "decision", animationType: "risk", audioEvent: "call-stop", nextStage: "final", finalState: false },
    { id: "final", startMs: 35_000, durationMs: null, visibleCopy: ["Listing rejected", "No money was transferred", "No personal data was shared", "Search continuing"], activeComponents: ["foreign-final", "risk-ledger"], assetReferences: [], layoutState: "decision", animationType: "decision", audioEvent: "call-stop", nextStage: null, finalState: true },
  ],
};

export const scenarios: Record<ScenarioId, ScenarioDefinition> = { retail, private: privateSeller, foreign };

export const criticalAssets = Array.from(new Set(Object.values(scenarios).flatMap((scenario) => scenario.assets)));

export const optionalSoundCues = {
  enabled: false,
  messageSent: null,
  sourceFound: null,
  evidenceReceived: null,
  couponValidated: null,
  offerSelected: null,
  negotiationCompleted: null,
  riskDetected: null,
  listingRejected: null,
} as const;

export function stageAt(scenario: ScenarioDefinition, elapsedMs: number): ScenarioStage {
  for (let index = scenario.stages.length - 1; index >= 0; index -= 1) {
    if (elapsedMs >= scenario.stages[index].startMs) return scenario.stages[index];
  }
  return scenario.stages[0];
}

export function stageIndexAt(scenario: ScenarioDefinition, elapsedMs: number): number {
  return scenario.stages.findLastIndex((stage) => elapsedMs >= stage.startMs);
}
