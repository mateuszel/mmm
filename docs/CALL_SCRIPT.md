# Simulated seller call script

**Expected duration: 27 seconds.** The UI must display `Simulated seller verification call`. Both voices are synthetic/prerecorded or performed in theatre mode. The real eBay seller is not contacted and the dialogue is not attributed to them.

| Time | Speaker | German | Polish translation | Risk signal / UI event |
|---|---|---|---|---|
| 00:00-00:04 | Agent | Guten Tag. Ich rufe über einen geschützten Relay-Dienst an. Ist die Fujifilm X100F noch verfügbar? | Dzień dobry. Dzwonię przez chroniony przekaźnik. Czy Fujifilm X100F jest nadal dostępny? | Privacy preserved; availability check. |
| 00:04-00:08 | Seller | Ja, noch da. Über eBay ist es aber unnötig teuer. | Tak, nadal jest. Ale przez eBay jest niepotrzebnie drogo. | Platform avoidance begins. |
| 00:08-00:13 | Agent | Können Kauf und Zahlung bei eBay mit Käuferschutz bleiben? | Czy zakup i płatność mogą zostać na eBay z ochroną kupującego? | Explicit protected-payment verification. |
| 00:13-00:18 | Seller | Nein. Überweisen Sie 760 Euro direkt auf mein Konto. Dann sparen wir beide die Gebühren. | Nie. Proszę przelać 760 euro bezpośrednio na moje konto. Oboje oszczędzimy prowizję. | Direct transfer; fee bypass; lower off-platform price. |
| 00:18-00:21 | Agent | Versenden Sie erst nach dem direkten Zahlungseingang? | Czy wyśle pan aparat dopiero po otrzymaniu bezpośredniego przelewu? | Confirms unsecured payment-before-shipment sequence. |
| 00:21-00:24 | Seller | Ja. Zahlen Sie heute, sonst nehme ich den nächsten Käufer. | Tak. Proszę zapłacić dziś, inaczej wybiorę następnego kupującego. | Urgency and social pressure. |
| 00:24-00:27 | Agent | Ohne Käuferschutz kann ich nicht fortfahren. Vielen Dank, ich beende das Gespräch. | Bez ochrony kupującego nie mogę kontynuować. Dziękuję, kończę rozmowę. | Mandate enforcement; call ends. |

## Final agent decision

> I rejected this listing. The fictionalized seller branch requested direct payment outside eBay and refused buyer protection. This violates your purchase mandate. I will continue searching for a safer offer.

Triggered rules: off-platform payment, direct bank transfer, buyer protection refused, transaction channel changed, urgency. Result: no money transferred, no personal phone number or payment data disclosed.

## Performance notes

- Natural German, calm agent, cordial seller becoming slightly insistent; no caricatured accent.
- Caption groups follow phrase boundaries, not word-by-word karaoke.
- Waveform is precomputed and deterministic; timer starts at connection and ends exactly at 00:27.
- Theatre version may mute only seller lines; the presenter follows the same timestamps.
