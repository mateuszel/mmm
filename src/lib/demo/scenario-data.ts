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

export const privateMarketSources = [
  { name: "OLX", result: "Best protected match", tone: "candidate" },
  { name: "Allegro Lokalnie", result: "Incomplete evidence", tone: "rejected" },
  { name: "Allegro", result: "Higher final cost", tone: "rejected" },
  { name: "Facebook Marketplace", result: "No buyer protection", tone: "rejected" },
  { name: "eBay", result: "Delivery cost added", tone: "rejected" },
  { name: "Sprzedajemy.pl", result: "Wrong bundle", tone: "rejected" },
] as const;

const retail: ScenarioDefinition = {
  id: "retail",
  product: "adidas Samba OG",
  title: "Find Samba OG EU43 & get best true cost",
  request: "Find adidas Samba OG in EU43, new and in stock. Get the best true cost to my door in Poland.",
  durationMs: 22_500,
  assets: [
    "/demo-assets/sources/adidas/adidas-ig1024-viewport.webp",
    "/demo-assets/sources/retail/eobuwie-ig1024-viewport.webp",
    "/demo-assets/product/adidas-samba-og-ig1024-source.webp",
  ],
  stages: [
    { id: "enter", startMs: 0, durationMs: 500, visibleCopy: [], activeComponents: ["header", "conversation"], assetReferences: [], layoutState: "conversation", animationType: "compose", audioEvent: "none", nextStage: "typing", finalState: false },
    { id: "typing", startMs: 500, durationMs: 2_500, visibleCopy: ["Find adidas Samba OG in EU43, new and in stock. Get the best true cost to my door in Poland."], activeComponents: ["composer", "typing"], assetReferences: [], layoutState: "conversation", animationType: "compose", audioEvent: "none", nextStage: "mandate", finalState: false },
    { id: "mandate", startMs: 3_000, durationMs: 2_500, visibleCopy: ["I’ll search trusted stores, verify availability and discounts, and compare the final delivered cost."], activeComponents: ["conversation", "mandate"], assetReferences: [], layoutState: "conversation-mandate", animationType: "stagger", audioEvent: "none", nextStage: "market-search", finalState: false },
    { id: "market-search", startMs: 5_500, durationMs: 6_000, visibleCopy: ["Searching trusted stores", "8 sources checked", "4 viable offers", "2 best matching offers"], activeComponents: ["source-funnel", "progress-line"], assetReferences: [], layoutState: "search", animationType: "stagger", audioEvent: "none", nextStage: "finalists", finalState: false },
    { id: "finalists", startMs: 11_500, durationMs: 3_500, visibleCopy: ["2 best matching offers"], activeComponents: ["adidas-capture", "eobuwie-capture"], assetReferences: ["/demo-assets/sources/adidas/adidas-ig1024-viewport.webp", "/demo-assets/sources/retail/eobuwie-ig1024-viewport.webp"], layoutState: "comparison", animationType: "expand", audioEvent: "none", nextStage: "coupon", finalState: false },
    { id: "coupon", startMs: 15_000, durationMs: 3_500, visibleCopy: ["Validating SUMMER30", "Coupon valid", "eobuwie promotion unavailable"], activeComponents: ["coupon-validation", "decision-trail"], assetReferences: [], layoutState: "comparison", animationType: "calculate", audioEvent: "none", nextStage: "true-cost", finalState: false },
    { id: "true-cost", startMs: 18_500, durationMs: 2_500, visibleCopy: ["396.75 PLN", "-119.02 PLN", "277.73 PLN"], activeComponents: ["cost-calculation", "offer-status"], assetReferences: [], layoutState: "decision", animationType: "calculate", audioEvent: "none", nextStage: "decision", finalState: false },
    { id: "decision", startMs: 21_000, durationMs: 1_500, visibleCopy: ["adidas selected", "Use valid coupons only. Show total landed cost."], activeComponents: ["selected-offer", "protected-handoff"], assetReferences: [], layoutState: "decision", animationType: "decision", audioEvent: "none", nextStage: "final", finalState: false },
    { id: "final", startMs: 22_500, durationMs: null, visibleCopy: ["277.73 PLN", "Protected handoff complete"], activeComponents: ["retail-final"], assetReferences: [], layoutState: "decision", animationType: "decision", audioEvent: "none", nextStage: null, finalState: true },
  ],
};

const privateSeller: ScenarioDefinition = {
  id: "private",
  product: "Nintendo Switch OLED",
  title: "Verify and negotiate a private listing",
  request: "Find a Nintendo Switch OLED listing, verify the missing evidence and preserve OLX buyer protection.",
  durationMs: 21_500,
  assets: [
    "/demo-assets/sources/olx/olx-switch-search-demo-column.png",
    "/demo-assets/product/switch-touchscreen-simulated.webp",
    "/demo-assets/product/switch-bundle-simulated.png",
    "/demo-assets/product/switch-serial-evidence.svg",
    "/demo-assets/seller/avatar-private.svg",
  ],
  stages: [
    { id: "enter", startMs: 0, durationMs: 500, visibleCopy: [], activeComponents: ["header", "search"], assetReferences: [], layoutState: "source", animationType: "compose", audioEvent: "none", nextStage: "search", finalState: false },
    { id: "search", startMs: 500, durationMs: 5_000, visibleCopy: ["Searching resale marketplaces"], activeComponents: ["market-search"], assetReferences: [], layoutState: "source", animationType: "expand", audioEvent: "none", nextStage: "listing", finalState: false },
    { id: "listing", startMs: 5_500, durationMs: 1_000, visibleCopy: ["Best protected match found on OLX"], activeComponents: ["olx-capture", "listing-highlight"], assetReferences: ["/demo-assets/sources/olx/olx-switch-search-demo-column.png"], layoutState: "source", animationType: "expand", audioEvent: "none", nextStage: "gaps", finalState: false },
    { id: "gaps", startMs: 6_500, durationMs: 1_500, visibleCopy: ["Screen condition", "Serial number", "Included accessories"], activeComponents: ["evidence-gaps", "ledger"], assetReferences: [], layoutState: "evidence", animationType: "stagger", audioEvent: "none", nextStage: "question", finalState: false },
    { id: "question", startMs: 8_000, durationMs: 3_000, visibleCopy: ["Hello! I’m interested in the Nintendo Switch OLED from your listing. Could you send a photo of the screen, the console serial number, and confirm that all accessories are included?", "Evidence request"], activeComponents: ["seller-thread", "typing"], assetReferences: [], layoutState: "conversation", animationType: "compose", audioEvent: "none", nextStage: "evidence", finalState: false },
    { id: "evidence", startMs: 11_000, durationMs: 3_000, visibleCopy: ["Of course, I’m sending the photos now."], activeComponents: ["seller-reply", "evidence-images", "ledger"], assetReferences: ["/demo-assets/product/switch-touchscreen-simulated.webp", "/demo-assets/product/switch-bundle-simulated.png", "/demo-assets/product/switch-serial-evidence.svg"], layoutState: "conversation", animationType: "stagger", audioEvent: "none", nextStage: "negotiate", finalState: false },
    { id: "negotiate", startMs: 14_000, durationMs: 4_000, visibleCopy: ["Thank you. Could we complete the deal for 880 PLN with OLX shipping?", "My lowest price is 930 PLN with OLX shipping.", "I accept 930 PLN with OLX shipping."], activeComponents: ["negotiation", "price-bridge"], assetReferences: [], layoutState: "negotiation", animationType: "calculate", audioEvent: "none", nextStage: "checkout", finalState: false },
    { id: "checkout", startMs: 18_000, durationMs: 2_000, visibleCopy: ["930 PLN", "OLX shipping: 0 PLN", "Buyer protection: included", "Total due: 930 PLN"], activeComponents: ["checkout", "ledger"], assetReferences: [], layoutState: "checkout", animationType: "calculate", audioEvent: "none", nextStage: "ready", finalState: false },
    { id: "ready", startMs: 20_000, durationMs: 1_500, visibleCopy: ["Protected checkout prepared"], activeComponents: ["protected-handoff"], assetReferences: [], layoutState: "checkout", animationType: "decision", audioEvent: "none", nextStage: "final", finalState: false },
    { id: "final", startMs: 21_500, durationMs: null, visibleCopy: ["Verified deal ready", "No payment made"], activeComponents: ["private-final"], assetReferences: [], layoutState: "checkout", animationType: "decision", audioEvent: "none", nextStage: null, finalState: true },
  ],
};

export const callLines = [
  { startMs: 0, endMs: 8_341.392, speaker: "Relyo", text: "Hallo! Ich melde mich wegen der Fujifilm X100V. Können Sie mir kurz sagen, in welchem technischen Zustand sie ist, und vielleicht noch ein paar Fotos schicken?", translation: "Hello! I’m calling about the Fujifilm X100V. Could you briefly confirm its technical condition and send a few more photos?", risk: null, audio: "/demo-assets/audio/german-call/1.wav" },
  { startMs: 8_610.623, endMs: 17_809.454, speaker: "Seller", text: "Ähm ja, hören Sie, lassen Sie uns das doch privat regeln. Ich hab keine Lust auf die ganzen versteckten Gebühren bei eBay. Überweisen Sie mir das Geld einfach direkt, dann schicke ich Ihnen die Kamera. Ohne zusätzlichen Mist.", translation: "Let’s handle this privately. I don’t want the eBay fees. Transfer the money directly and I’ll send the camera.", risk: "Off-platform payment and direct transfer requested", audio: "/demo-assets/audio/german-call/2.wav" },
  { startMs: 18_078.685, endMs: 21_827.159, speaker: "Relyo", text: "Ähm, sorry, aber sicherheitshalber würde ich das lieber über eBay abwickeln.", translation: "Sorry, but for safety I would rather complete the transaction through eBay.", risk: null, audio: "/demo-assets/audio/german-call/3.wav" },
  { startMs: 22_096.389, endMs: 28_053.009, speaker: "Seller", text: "Ich meine, das ist doch eine Win-win-Situation für uns beide. Ich schicke Ihnen die Zahlungsdaten, schicken Sie mir einfach die Lieferadresse über WhatsApp.", translation: "It’s a win-win. I’ll send the payment details. Send me the delivery address through WhatsApp.", risk: "Payment details and personal data requested outside eBay", audio: "/demo-assets/audio/german-call/4.wav" },
  { startMs: 28_322.240, endMs: 32_132.514, speaker: "Relyo", text: "Ähm, ich fühle mich einfach nicht wohl dabei, das außerhalb von eBay zu machen. Tut mir leid.", translation: "I’m not comfortable doing this outside eBay. I’m sorry.", risk: null, audio: "/demo-assets/audio/german-call/5.wav" },
] as const;

const foreign: ScenarioDefinition = {
  id: "foreign",
  product: "Fujifilm X100V",
  title: "Stop an unsafe seller transaction",
  request: "Find Fujifilm X100V under €1,200 with safe payment and buyer protection. Never use direct bank transfer.",
  durationMs: 37_132.514,
  assets: [
    "/demo-assets/sources/foreign/ebay-x100f-search-viewport.webp",
    "/demo-assets/product/fujifilm-x100f-ebay-source.webp",
    "/demo-assets/seller/avatar-foreign-imagegen.png",
    "/demo-assets/call/waveform-27s.svg",
    "/demo-assets/warnings/rejection-illustration.svg",
    "/demo-assets/audio/german-call/combined-1-5.wav",
  ],
  stages: [
    { id: "source", startMs: 0, durationMs: 1_400, visibleCopy: ["Fujifilm X100F", "Used", "€1,100", "€20 shipping"], activeComponents: ["ebay-capture", "listing-summary"], assetReferences: ["/demo-assets/sources/foreign/ebay-x100f-search-viewport.webp"], layoutState: "source", animationType: "expand", audioEvent: "none", nextStage: "mandate", finalState: false },
    { id: "mandate", startMs: 1_400, durationMs: 1_100, visibleCopy: ["Protected channels only", "Buyer protection required", "No direct bank transfer", "No personal data sharing"], activeComponents: ["mandate", "policy"], assetReferences: [], layoutState: "policy", animationType: "stagger", audioEvent: "none", nextStage: "message", finalState: false },
    { id: "message", startMs: 2_500, durationMs: 1_500, visibleCopy: ["Hello! I’m contacting you about the Fujifilm X100F. Is it still available? Could you confirm its technical condition, any visible wear and what is included?", "Yes, it’s available. Please call me. It will be easier to explain."], activeComponents: ["seller-conversation", "phone-request"], assetReferences: [], layoutState: "conversation", animationType: "compose", audioEvent: "none", nextStage: "approval", finalState: false },
    { id: "approval", startMs: 5_000, durationMs: null, visibleCopy: ["The seller wants to continue by phone. I can call through a privacy-protected relay and verify the transaction conditions."], activeComponents: ["call-approval"], assetReferences: [], layoutState: "call-preview", animationType: "compose", audioEvent: "none", pauseCondition: "call-approval", nextStage: "call-01", finalState: false },
    { id: "call-01", startMs: 5_000, durationMs: 8_610.623, visibleCopy: [callLines[0].text], activeComponents: ["call", "timer", "waveform", "transcript"], assetReferences: ["/demo-assets/audio/german-call/combined-1-5.wav"], layoutState: "call", animationType: "compose", audioEvent: "call-start", nextStage: "call-02", finalState: false },
    { id: "call-02", startMs: 13_610.623, durationMs: 9_468.062, visibleCopy: [callLines[1].text, callLines[1].risk!], activeComponents: ["call", "transcript", "risk-critical"], assetReferences: [], layoutState: "call", animationType: "risk", audioEvent: "none", nextStage: "call-03", finalState: false },
    { id: "call-03", startMs: 23_078.685, durationMs: 4_017.704, visibleCopy: [callLines[2].text], activeComponents: ["call", "transcript"], assetReferences: [], layoutState: "call", animationType: "compose", audioEvent: "none", nextStage: "call-04", finalState: false },
    { id: "call-04", startMs: 27_096.389, durationMs: 6_225.851, visibleCopy: [callLines[3].text, callLines[3].risk!], activeComponents: ["call", "transcript", "risk-personal-data"], assetReferences: [], layoutState: "call", animationType: "risk", audioEvent: "none", nextStage: "call-05", finalState: false },
    { id: "call-05", startMs: 33_322.240, durationMs: 3_810.274, visibleCopy: [callLines[4].text], activeComponents: ["call", "transcript", "call-ended", "analysis"], assetReferences: [], layoutState: "decision", animationType: "compose", audioEvent: "call-stop", nextStage: "final", finalState: false },
    { id: "final", startMs: 37_132.514, durationMs: null, visibleCopy: ["Listing rejected", "No money was transferred", "No personal data was shared", "Search continuing"], activeComponents: ["foreign-final", "risk-ledger"], assetReferences: [], layoutState: "decision", animationType: "decision", audioEvent: "call-stop", nextStage: null, finalState: true },
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
