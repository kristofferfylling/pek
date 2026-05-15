# Åpne spørsmål

Ting vi har snakket om, men ikke besluttet. Når et spørsmål er besluttet, flytt det til `decisions.md` og fjern fra denne fila.

## Produkt

### Hvilke ord får stiplet understrek?
**Kontekst:** Beslutning 013 – AI forklarer fagord når kunden klikker. Uklart hvordan vi finner ordene.
**Alternativer:**
- AI detekterer jargon i teksten ved visning (fleksibelt, kan over/under-fange)
- Fast ordliste (eyebrow, hero, CTA, …) + AI forklarer bare konteksten
- Hybrid: ordliste for vanlige UX-termer, AI flagger resten over en terskel
- TRY kan markere ord manuelt ved sending (fallback)

### Språk på fagord-forklaringer
**Kontekst:** Kommentar kan være norsk eller engelsk; kunden er ofte norsk.
**Alternativer:**
- Alltid norsk forklaring til kunde
- Samme språk som kommentaren
- Prosjektinnstilling per kunde/prosjekt

### Proaktiv AI-gruppering i innboksen – ja eller for mye magi?
**Kontekst:** Pek kan dukke opp en banner i innboksen som sier "Tre relaterte kommentarer ser ut til å handle om samme ting – gruppér?". Det reduserer kognitivt arbeid, men kan også føles påtrengende.
**Alternativer:**
- Ja – proaktivt forslag i innboksen
- Nei – kun når TRY eksplisitt ber om gruppering
- På hold – god idé, men ikke MVP

### Intern notat i samme tråd – trygt nok?
**Kontekst:** Vi har designet et tydelig gult signalsystem. Spørsmålet er om det er nok, eller om interne notater bør ligge i en helt egen flate.
**Alternativer:**
- Ja – fargeforskjellen er nok signal
- Nei – separat side eller modal for interne notater
- Ja, men intern notat skal også være mulig fra ekstern Slack/chat

### Hvilken integrasjon bygger vi først?
**Kontekst:** Linear nevnt som mest brukt, Jira som kundekrav. Andre kandidater: Notion, Asana, monday.com.
**Beslutningstaker:** Kristoffer (TRY Dig)

## Design

### Sub-logo / wordmark for "Pek"
Ikke designet ennå. Holder seg lavmælt – Pek skal ikke konkurrere med kundens visuelle identitet på staging-siden.

### Onboarding for TRY-rådgivere som ikke har sett Pek før
Skissert lite. Bør være en kort tour første gang noen åpner prosjekt-innboksen.

### Tom-tilstanden i innboksen
Når et nytt prosjekt opprettes og ingen kommentarer finnes ennå – hva ser TRY?

## Teknisk

### Proxy-fallback-strategi
Hva gjør Pek når proxy ikke fungerer (CSP-blokkert, SSO-beskyttet, JS som hardkoder kundens domene)? Foreslått: screenshot-fallback. Må valideres mot reelle Dig-prosjekter før vi commiter.

### Figma-versjonshåndtering
Når en kunde har kommentert på en Figma-frame som senere fjernes/endres i Figma, hva gjør vi? Foreslått: "denne kommentaren peker på en frame som er fjernet" + lenke til forrige versjon.

### Hvor hostes proxy-funksjonen?
Cloudflare Workers vs Vercel Edge. Cloudflare har bedre rewriter-API for HTML, Vercel har bedre Next.js-integrasjon. Praktisk valg når vi begynner å bygge.

### Datalagring og GDPR
- Hvor lenge lagres data etter prosjektarkivering?
- Hvilke kunder krever databehandleravtale før vi kan bruke Pek på deres prosjekter?
- Skal screenshots av kundens staging-sider lagres permanent eller slettes etter X dager?

## Forretning

### Skal Pek eksponeres for hele TRY-huset, eller bare Dig?
Foreslått: bygg for Dig først, evaluer for TRY-huset etter MVP er testet på ~3 prosjekter.

### Skal Pek på sikt være et produkt vi selger eller bare en intern fordel?
Avklares når vi har MVP og data på hvor mye tid det sparer per prosjekt.
