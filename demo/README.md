# Pek · Interaktiv demo v2

Full klikkbar prototype med **staging** og **Figma** — én innboks, samme datamodell.

**Åpne:** [kristofferfylling.github.io/pek/demo](https://kristofferfylling.github.io/pek/demo/) eller `demo/index.html` lokalt.

## Hva fungerer

| Flate | Demo | Produkt (plan) |
|-------|------|----------------|
| **Staging** | Mock Wilfa-side + proxy-banner | Edge-proxy injiserer widget |
| **Figma** | Mock mobilnav (A/B/C) + valgfri embed | iframe + postMessage-overlay |
| **Kommentarer** | Klikk → pin → tråd | Samme modell |
| **Fagord** | Stiplet understrek → AI-forklaring | Beslutning 013 |
| **TRY** | Innboks, svar, status | Linear/Jira i Lag 2 |

## Testflyt

1. **Nullstill** → skriv navn → coach
2. **Staging:** klikk på «NYHET» → skriv med «eyebrow»
3. **Figma:** bytt flate → velg konsept → klikk og kommenter
4. **TRY:** svar med fagord → **Kunde:** se stiplet understrek i tråd
5. **Simuler svar** for returbesøk-demo på staging

Data lagres i `localStorage` (`pek-demo-v2`).
