# Protected seller call

Duration: **46.925 seconds**, including five 350 ms inter-turn gaps. Clips `1/3/5` are Relyo; `2/4/6` are the fictional seller. Playback uses `public/demo-assets/audio/german-call/combined.wav`; exact machine timings are in `public/demo-assets/call/german-transcript.json`.

| Time | Clip | Speaker | German dialogue | UI event |
|---|---:|---|---|---|
| 00:00.000–00:10.844 | 1 | Relyo | Hallo! Ich melde mich wegen der Fujifilm X100V. Können Sie mir kurz sagen, in welchem technischen Zustand sie ist, und vielleicht noch ein paar Fotos schicken? | Protected verification starts. |
| 00:11.194–00:23.152 | 2 | Seller | Ähm ja, hören Sie, lassen Sie uns das doch privat regeln. Ich hab keine Lust auf die ganzen versteckten Gebühren bei eBay. Überweisen Sie mir das Geld einfach direkt, dann schicke ich Ihnen die Kamera. Ohne zusätzlichen Mist. | Off-platform request; direct transfer becomes critical. |
| 00:23.502–00:28.375 | 3 | Relyo | Ähm, sorry, aber sicherheitshalber würde ich das lieber über eBay abwickeln. | Protected-channel rule restated. |
| 00:28.725–00:36.469 | 4 | Seller | Ich meine, das ist doch eine Win-win-Situation für uns beide. Ich schicke Ihnen die Zahlungsdaten, schicken Sie mir einfach die Lieferadresse über WhatsApp. | Payment and personal data requested outside eBay. |
| 00:36.819–00:41.772 | 5 | Relyo | Ähm, ich fühle mich einfach nicht wohl dabei, das außerhalb von eBay zu machen. Tut mir leid. | Relyo refuses the unsafe path. |
| 00:42.122–00:46.925 | 6 | Seller | Ach, fahren Sie zur Hölle. Wenn Sie es nicht ernst meinen, verschwenden Sie nicht meine Zeit. | Seller ends the call; listing rejected. |

The real marketplace seller was not contacted. The phone number and seller branch are fictional. No payment or personal data is sent.
