# Arkitektur

Teknisk tilnærming for Pek MVP. Skrives som "slik vi planlegger" – endres til "slik det er" når kode finnes.

## Stack-valg

| Lag | Valg | Begrunnelse |
|---|---|---|
| Frontend (admin + innboks) | Next.js (App Router) | Standard for TRY Dig, god DX, native API routes for backend-glue |
| Database | Postgres (Supabase eller Neon) | Relasjonell modell passer godt: prosjekt → tråd → kommentar |
| Filhåndtering (screenshots) | S3-kompatibel object storage | Screenshots og vedlegg, ikke i DB |
| Realtime | Supabase Realtime eller Pusher | Live oppdatering i innboks når kommentarer kommer inn |
| Edge-funksjoner (proxy) | Cloudflare Workers eller Vercel Edge | Proxy må være tett på kunden geografisk, lav latency |
| AI | Anthropic Claude API | Klassifisering, gruppering, "logg endring"-forslag |

## To kommentarflater, én modell

### Staging-lenke (proxy-modell)

```
Kunde besøker:  feedback.try.no/p/<projectId>
                          │
                          ▼
              Cloudflare/Vercel Edge
                          │
                          │  1. Henter mål-URL fra DB
                          │  2. Fetcher kundens nettside server-side
                          │  3. Rewriter relative URLs til absolute
                          │  4. Strypper/justerer CSP-headere
                          │  5. Injiserer <script src="/pek-widget.js">
                          │  6. Serverer modifisert HTML til klient
                          ▼
                  Kunden ser nettsiden
                  + Pek-widget oppå
```

**Det vanskelige:**
- **CSP-headere** (Content-Security-Policy) kan blokkere injiserte script. Vi må enten fjerne dem helt (svekker kundens sikkerhet i proxy-konteksten – akseptabelt fordi vi ikke sender ekte trafikk her) eller utvide med vår egen origin.
- **Relative URLs i HTML.** `<img src="/logo.png">` må rewritres til `<img src="https://kundens-domene.com/logo.png">`. Standard HTML-rewriter på edge.
- **Auth-cookies.** Hvis staging er bak passord eller SSO, fungerer ikke proxy. Fallback: extension eller screenshot-modus.
- **Klient-side fetch til relative endpoints.** Hvis Wilfas Shopify gjør `fetch('/cart.json')`, vil det treffe vår proxy, ikke Shopify. Vi må enten proxy disse også (vanskelig) eller hooke `window.fetch` for å rewrite (skjørt).

**Pragmatisk MVP-strategi:** Bygg proxy som "best effort". Når proxy ikke fungerer (kunden ser tom side eller broken layout), tilby screenshot-fallback: kunden ser opplastet screenshot og kan kommentere på det. Dekker 95 % av reelle prosjekter.

### Figma-prototype (postMessage-modell)

```
Kunde besøker:  feedback.try.no/p/<projectId>?source=figma
                          │
                          ▼
            Vår wrapper-side (Next.js)
                          │
                          │  <iframe src="https://www.figma.com/embed?embed_host=pek&url=...">
                          │  + Pek-widget overlay
                          │
                          ▼
                  Lytter på postMessage fra Figma:
                  - PRESENTED_NODE_CHANGED → vi vet hvilken frame
                  - MOUSE_PRESS_OR_RELEASE → vi får klikk-koordinater
```

**Det vanskelige:**
- Pin festes til `frameId + relativ koordinat (0–1, 0–1)`. Når Figma re-renderer eller bruker zoomer, må vi rekonstruere absolutt pixel-posisjon.
- Hvis prototypen oppdateres i Figma (ny versjon publisert), kan frame-IDer endres. Vi må håndtere "tråd peker på frame som ikke finnes lenger".

**Pragmatisk MVP-strategi:** Vis advarsel når frame ikke finnes ("Denne kommentaren peker på en frame som er fjernet. Vis i forrige versjon?"). Lagre Figma-fil-versjon med hver kommentar.

## Datamodell (forenklet)

```
projects
├── id (uuid)
├── name (text)
├── owner_id (fk: users)
├── source_type (enum: staging | figma)
├── source_url (text)
├── settings (jsonb)  -- epost-policy, integrasjoner, m.m.
└── created_at

threads
├── id (uuid)
├── project_id (fk: projects)
├── pin_number (int)  -- 1, 2, 3... per prosjekt
├── status (enum: open | seen | in_progress | resolved)
├── anchor (jsonb)
│   ├── For staging: { xpath, viewport, scroll, screenshot_id }
│   └── For figma:   { file_key, frame_id, x_rel, y_rel }
├── ai_tags (text[])
├── external_issue_key (text, nullable)  -- "DIG-247" eller "PROJ-123"
├── assignee_id (fk: users, nullable)
└── created_at

comments
├── id (uuid)
├── thread_id (fk: threads)
├── author_name (text)  -- anonym, fra localStorage
├── author_email (text, nullable)
├── author_type (enum: customer | team)
├── visibility (enum: shared | internal)
├── body (text)
├── reactions (jsonb)  -- { "👍": ["sk@wilfa.no"] }
└── created_at

events
├── id (uuid)
├── thread_id (fk: threads)
├── kind (enum: change_logged | status_changed | linked_to_issue | grouped)
├── payload (jsonb)
└── created_at
```

## Integrasjoner

### Linear (første integrasjon)

- **Send til Linear:** Pek-tråd → Linear API → opprett issue med screenshot, lenke tilbake, kontekst i beskrivelse
- **Lenke tilbake:** Linear-issue får custom field eller URL i description som peker til Pek-tråden
- **Webhook fra Linear:** Når status endres i Linear, oppdater Pek-tråd (én-veis i V1, to-veis senere)

### Jira (andre integrasjon, kritisk for kundeprosjekter)

- **To-veis sync er ikke valgfritt.** Når en utvikler markerer Jira-task som Done/Resolved, må Pek-tråd settes til "Løst" automatisk. Slipper dobbeltarbeid.
- **Implementasjon:** Jira-webhook (issue_updated event) → vår endpoint → finn tilknyttede tråder via `external_issue_key` → oppdater status
- **Status-mapping:** Konfigureres per prosjekt. Default: `Done`/`Resolved` → `resolved`, `In Progress` → `in_progress`.

## AI-laget

Tre konkrete bruksområder:

1. **Klassifisering ved oppretting**: Send kommentartekst + kontekst til Claude, få tilbake sannsynlige tags. TRY-team godkjenner eller justerer.
2. **Gruppering på tvers**: Periodisk jobb (eller trigger ved ny kommentar) som ser etter semantisk og strukturell likhet mellom åpne tråder. Bekreftelse fra TRY før sammenslåing.
3. **"Logg endring"-deteksjon**: Når TRY skriver svar, kjør lett NER/regex for "endret X til Y"-mønster og foreslå å logge endringen formelt.

## GDPR-hensyn

- Anonym deltakelse betyr ikke at vi ikke samler personopplysninger. Vi logger navn, IP, evt. epost.
- Screenshots av kundens staging-side kan inneholde personopplysninger.
- Vi trenger databehandleravtaler med kundene som bruker Pek, og en personvernerklæring kunden ser før første kommentar.
- Lagringspolicy: data slettes når prosjekt arkiveres (manuell handling) eller etter X måneder.
