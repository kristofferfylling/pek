# Pek

Et kommentarverktøy for å samle kundefeedback ett sted – på staging-lenker og Figma-prototyper – uten at det renner ut i epost, Slack og Figma-tråder.

**Status:** Tidlig planleggingsfase. Ingen kode skrevet ennå. Dokumentasjon og interaktive prototyper.

**Eier:** TRY Dig. Bygges først for internt bruk, evaluering for TRY-huset etter MVP.

**Repo:** [github.com/kristofferfylling/pek](https://github.com/kristofferfylling/pek)

**Live demo:** [kristofferfylling.github.io/pek/demo](https://kristofferfylling.github.io/pek/demo/) · **Statiske prototyper:** [kristofferfylling.github.io/pek/prototypes](https://kristofferfylling.github.io/pek/prototypes/)

**GitHub Pages (engangsoppsett):** [Settings → Pages](https://github.com/kristofferfylling/pek/settings/pages) → **Deploy from a branch** → **`main`** → **`/ (root)`** (enklest). Alternativt **`gh-pages`** hvis du bruker deploy-workflowen.

Hvis workflow feiler med git 128: [Settings → Actions → General](https://github.com/kristofferfylling/pek/settings/actions) → **Workflow permissions** → **Read and write permissions** → Save.

---

## Problemet

Når et Dig-team sender et utkast til kunde for tilbakemelding, havner innsikten spredt over flere flater:

- Kommentarer i Figma som vi ikke alltid vil dele inn med kunden
- Epost-tråder hvor halve teamet ikke er CC-et
- Slack-meldinger som forsvinner i scroll
- Muntlige tilbakemeldinger som aldri loggføres

Resultatet er at vi enten mister kontekst eller bruker tid på å samle den i etterkant.

## Løsningen

Én delbar lenke per prosjekt. Kunden klikker, taster inn navn, og kan kommentere rett på staging-siden eller Figma-prototypen. All feedback samles i én innboks som TRY-teamet eier, kobles til Linear/Jira, og lukkes når jobben er gjort.

## Hvordan navigere dette repoet

| Filsti | Hva det er |
|---|---|
| [`docs/decisions.md`](docs/decisions.md) | Lett ADR-stil logg over produktvalg vi har tatt, med begrunnelse |
| [`docs/architecture.md`](docs/architecture.md) | Teknisk tilnærming: proxy, Figma-håndtering, datamodell, integrasjoner |
| [`docs/user-flows.md`](docs/user-flows.md) | Kundens og TRYs flater, tilstand for tilstand |
| [`docs/mvp-scope.md`](docs/mvp-scope.md) | Hva som er Lag 1 / 2 / 3, og hva som er senere |
| [`docs/open-questions.md`](docs/open-questions.md) | Åpne valg vi ikke har tatt ennå |
| [`demo/`](demo/) | **Interaktiv prototype** – klikk-pins, innboks, kunde/TRY, localStorage |
| [`prototypes/`](prototypes/) | Statiske HTML-skisser for tre nøkkelflater |

## Prototyper

Åpne hvilken som helst `index.html` direkte i nettleseren – ingen build-prosess.

- [`prototypes/customer-onboarding/`](prototypes/customer-onboarding/) – kundens første møte med Pek (landing, coach, første kommentar, sendt)
- [`prototypes/customer-return/`](prototypes/customer-return/) – kunden kommer tilbake dag 2 (velkommen tilbake, innboks, tråd, avklaring)
- [`prototypes/team-thread/`](prototypes/team-thread/) – TRY-rådgivers trådvisning (tråden, svar, gruppér relaterte)

## Neste steg

1. Beslutte åpne valg i [`docs/open-questions.md`](docs/open-questions.md)
2. Tegne admin-side: opprett prosjekt, del lenke, inviter team
3. Bygge teknisk prototype av proxy-laget – det vanskeligste tekniske problemet
4. Pilot med ett internt Dig-prosjekt før det vises til kunde

---

Arbeidsnavn: **Pek**. Kort, norsk, fungerer som verb. Kjernehandling i hele verktøyet.
