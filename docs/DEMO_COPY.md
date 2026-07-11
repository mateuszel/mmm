# Demo copy

**Language:** primary UI English; seller call German with Polish translation. Final choice remains open.

## Global

- Brand placeholder: **MMM shopping agent**
- Status: **Scripted demo · No live transactions**
- Cold open: **One agent. Every channel. Your rules.**
- End card: **Autonomy does not mean blind execution.**
- End subcopy: **The agent knows when to buy, when to ask, and when to stop.**

## Scenario 1 — adidas Samba OG

### User request

> Find adidas Samba OG White/Green, product code IG1024, size EU 43⅓, new, under PLN 350 delivered. Buy automatically if the retailer is trusted and protected payment stays within my mandate.

### Mandate

- **Product:** adidas Samba OG · IG1024
- **Size / condition:** EU 43⅓ · New
- **Hard cap:** PLN 350.00 delivered
- **Retailer:** Trusted store only
- **Payment:** Protected checkout
- **Autonomy:** Auto-buy allowed within every rule

### Search and decisions

- **Searching 4 trusted retailers…**
- adidas: **PLN 396.75 delivered** — `Rejected · PLN 46.75 above cap`
- Farfetch: **PLN 379.00 before delivery** — `Rejected · above cap before delivery`
- PRM: **PLN 329.99 + PLN 19.99 delivery = PLN 349.98**
- Coupon: **Extra 5% requires a PLN 500 basket** — `Not applicable`
- eobuwie: **PLN 339.99 + PLN 0.99 delivery = PLN 340.98**
- Checks: **Exact code · EU 43⅓ available · 30-day return · Protected checkout**
- Agent: **This is the lowest verified final cost. It satisfies every mandate rule.**
- Progress: **Within mandate. Simulating payment authorization…**
- Payment label: **Simulated payment authorization · BLIK-style experience**

### Receipt

- **Purchase simulated successfully**
- Product: **adidas Samba OG White/Green · IG1024 · EU 43⅓**
- Merchant: **eobuwie · public reference offer**
- Item: **PLN 339.99**
- Delivery: **PLN 0.99**
- Final: **PLN 340.98**
- Cap remaining: **PLN 9.02**
- Authority: **AP2-aligned shopping mandate concept**
- Reason: **Exact match, trusted checkout, lowest verified landed cost, within hard cap**

## Scenario 2 — Nintendo Switch OLED on OLX

### User request

> Find a used Nintendo Switch OLED with the complete dock set. Verify the condition, keep protected delivery, and prepare checkout if the final price stays under PLN 980.

### Listing and policy

- **OLX listing · public snapshot · ID 1083464946**
- **Nintendo Switch OLED Neon bundle · PLN 940**
- **Cosmetic crack disclosed in black screen bezel**
- **Seller identity and contact details redacted**
- Communication: **May ask product questions**
- Negotiation: **Target PLN 900 · walk-away PLN 930 item price**
- Payment: **OLX protected checkout only**
- Purchase: **User approval required**

### Evidence gaps

- **Touchscreen around crack** — Missing
- **Joy-Con drift test** — Missing
- **Dock / HDMI output** — Missing
- **Serial label and full bundle** — Partial
- **Protected delivery** — Available in public listing

### Simulated alternate conversation

Agent:
> Hi. Before I prepare the purchase, could you send a short touchscreen test around the crack, confirm there is no Joy-Con drift, show HDMI output through the dock, and include one photo of the serial label and accessories? I will only use OLX protected delivery.

Fictionalized seller branch:
> Sure. Touch works across the whole display, the Joy-Cons do not drift, and the dock outputs correctly. I have sent the tests and the full set photo. OLX delivery is fine.

Agent:
> Thank you. The disclosed cosmetic defect remains, but the functional checks are consistent. Would you accept PLN 900 for the set through protected OLX checkout?

Fictionalized seller branch:
> I can do PLN 920 and reserve it for 15 minutes.

### Evidence summary

- **Touchscreen:** Consistent in scripted test
- **Joy-Cons:** No drift in scripted test
- **Dock / HDMI:** Output shown
- **Bundle:** Dock, charger, HDMI, case, 128 GB card and controller visible
- **Remaining risk:** Cosmetic crack; evidence is demo-only and not independently verified
- **Conversation and added evidence:** Simulated; not statements by the real OLX seller

### Final state

- Item: **PLN 920.00**
- Protected delivery: **PLN 15.99**
- Buyer protection: **PLN 15.99**
- True final cost: **PLN 951.98**
- Budget remaining: **PLN 28.02**
- **Verified deal ready for approval**
- **Reserved 15 min · Protected checkout prepared · No payment made**

## Scenario 3 — Fujifilm X100F on eBay.de

### Listing and mandate

- **Fujifilm X100F · used · private listing/search snapshot**
- Item: **EUR 805.00**
- Protected shipping: **EUR 5.50**
- Frozen FX: **PLN 4.31/EUR**
- Protected final cost: **EUR 810.50 = PLN 3,493.26**
- Seller identity: **Redacted and replaced for demo**
- Policy: **May message seller · Ask before call · Never reveal user number · Never pay off-platform · Never waive buyer protection**

### Simulated marketplace message

Agent:
> Hi, I am interested in the Fujifilm X100F. Is it still available? Please confirm the shutter count, condition, included accessories, and that purchase and payment can stay on eBay with buyer protection.

Fictionalized seller branch:
> Yes, it is available. Call me at this number; it will be easier to explain.

- Number: **+49 ••• ••• 4821**
- Agent: **The seller wants to continue by phone. I can call through a privacy-protected relay and verify the transaction conditions. Allow the call?**
- Button: **Allow agent to call**
- Secondary: **Decline**
- Call label: **Simulated seller verification call**

### Call outcome

- Offer introduced on call: **EUR 760 by direct bank transfer**
- Detection: **Transaction moved outside eBay**
- Detection: **Direct bank transfer requested**
- Detection: **Buyer protection refused**
- Detection: **Urgency / social pressure**
- Detection: **Transaction channel changed**

### Final decision

> I rejected this listing. The fictionalized seller branch requested direct payment outside eBay and refused buyer protection. This violates your purchase mandate. I will continue searching for a safer offer.

- **Listing rejected · High payment risk**
- **No money transferred**
- **No personal data shared**
- **Mandate preserved**
- **Search continuing**

The complete bilingual call appears in [Call script](CALL_SCRIPT.md).
