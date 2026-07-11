# Protected seller call

Presentation duration: **32.132514 seconds**. The five-clip source master contains four 350 ms gaps and plays at `1.3×`, so each gap lasts approximately 269.231 ms in the presentation. Clips `1/3/5` are Relyo; `2/4` are the fictional seller. Playback uses `public/demo-assets/audio/german-call/combined-1-5.wav`; exact source and presentation timings are in `public/demo-assets/call/german-transcript.json`.

| Presentation time | Clip | Speaker | German dialogue | UI event |
|---|---:|---|---|---|
| 00:00.000–00:08.341 | 1 | Relyo | Hallo! Ich melde mich wegen der Fujifilm X100V. Können Sie mir kurz sagen, in welchem technischen Zustand sie ist, und vielleicht noch ein paar Fotos schicken? | Protected verification starts. |
| 00:08.611–00:17.809 | 2 | Seller | Ähm ja, hören Sie, lassen Sie uns das doch privat regeln. Ich hab keine Lust auf die ganzen versteckten Gebühren bei eBay. Überweisen Sie mir das Geld einfach direkt, dann schicke ich Ihnen die Kamera. Ohne zusätzlichen Mist. | Off-platform request begins at 8.611 s; direct transfer becomes critical at 13.077 s. |
| 00:18.079–00:21.827 | 3 | Relyo | Ähm, sorry, aber sicherheitshalber würde ich das lieber über eBay abwickeln. | Protected-channel rule restated. |
| 00:22.096–00:28.053 | 4 | Seller | Ich meine, das ist doch eine Win-win-Situation für uns beide. Ich schicke Ihnen die Zahlungsdaten, schicken Sie mir einfach die Lieferadresse über WhatsApp. | Payment and personal data requested outside eBay. |
| 00:28.322–00:32.133 | 5 | Relyo | Ähm, ich fühle mich einfach nicht wohl dabei, das außerhalb von eBay zu machen. Tut mir leid. | Relyo refuses the unsafe path; active call flow ends. |

Clip `6.wav` remains preserved as source material but is excluded from the active presentation flow. The policy decision follows Relyo's refusal at 32.132514 seconds.

The real marketplace seller was not contacted. The phone number and seller branch are fictional. No payment or personal data is sent.
