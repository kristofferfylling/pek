# MVP-scope

Tre lag i prioritert rekkefølge. Rangering er basert på Kristoffers svar: 1. Innsamling, 2. Handling, 3. Triage.

## Lag 1: Innsamling (MVP)

Mål: ett TRY-team kan opprette et prosjekt, dele en lenke, og samle alle kundekommentarer ett sted.

**Må ha:**
- [ ] Opprett prosjekt fra staging-URL eller Figma-lenke
- [ ] Delbar offentlig lenke (anonym tilgang)
- [ ] Proxy for staging-lenker (best effort, screenshot-fallback)
- [ ] Figma-embed med postMessage-overlay
- [ ] Pin-baserte kommentarer (klikk → composer)
- [ ] Tråder med svar
- [ ] Auto-screenshot ved kommentaropprettelse
- [ ] Device-toggle (mobil/desktop) på staging
- [ ] Status: åpen / sett / løst (kun TRY kan lukke)
- [ ] Onboarding-coach første gang
- [ ] Returbesøk med "velkommen tilbake"-kort
- [ ] Anonym deltakelse via localStorage-navn
- [ ] **Fagord-forklaring:** stiplet understrek på UI/UX-termer i kommentarer kunden leser → klikk → AI-forklaring i kontekst (f.eks. «eyebrow»)

**Ikke i dette laget:**
- Mobil-prototype-støtte i Figma (Figma håndterer det selv)
- Avansert search/filter
- Eksport
- Versjonshistorikk på sider

## Lag 2: Handling (rett etter MVP)

Mål: feedback flyter ut til Linear/Jira slik at den faktisk blir håndtert.

**Må ha:**
- [ ] Linear-integrasjon: "Send til Linear"-knapp per kommentar
- [ ] Linear-issue inneholder screenshot, kontekst, lenke tilbake til Pek-tråd
- [ ] Lenke fra Pek-tråd tilbake til Linear-issue
- [ ] **Jira-integrasjon med to-veis sync** – kritisk, ikke nice-to-have
- [ ] Webhook-håndtering: Jira "Done" → Pek "Løst" automatisk
- [ ] Status-mapping per prosjekt

**Ikke i dette laget:**
- Notion, Asana, monday.com (vurderes etter Linear + Jira er ute)
- Bulk-sending til Linear

## Lag 3: Triage (når folk faktisk bruker det)

Mål: TRY-rådgivere kan håndtere store mengder kommentarer effektivt.

**Må ha:**
- [ ] AI-klassifisering av kommentarer (tags i bakkant)
- [ ] AI-gruppering: forslag når 3+ tråder ser ut til å handle om samme tema
- [ ] Bekreftelsesflyt: AI foreslår, designer/utvikler godkjenner gruppering
- [ ] Komponentgjenkjenning: forstå at "hero på forsiden" og "hero på produktside" er samme React-komponent
- [ ] Bulk-actions i innboks
- [ ] Interne notater i tråd (gul visuell skiller)
- [ ] "Logg endring"-event i tråd

## Senere (ikke prioritert ennå)

- Pek for TRY-huset (utenfor Dig)
- Public roadmap / changelog som vises til kunde
- Versjonering ("dette gjelder v3 av staging-siden")
- Eksport av kommentarsamling som dokument
- Slack-integrasjon ("ny kommentar i Pek" → Slack-kanal)
- Notion-integrasjon
- Mobile native app for TRY-team (innboks på mobil)
- Søk på tvers av prosjekter
- Analytics: "hvilken kunde gir mest verdifull feedback?"
- Roller og rettigheter (admin / editor / viewer på TRY-siden)

## Beslutningskriterier for å pushe noe ned eller opp

- **Opp:** Et reelt Dig-prosjekt blir blokkert uten det
- **Opp:** Tre eller flere TRY-rådgivere ber om det innen samme måned
- **Ned:** Kompleksiteten er stor og verdien er hypotetisk
- **Ned:** Konkurrenter har det, men vår bruksbase trenger det ikke ennå
