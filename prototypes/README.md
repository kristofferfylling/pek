# Prototyper

Tre klikkbare HTML-prototyper som dekker Peks viktigste flater. Hver fil er standalone – åpne `index.html` direkte i nettleseren, ingen build-prosess.

## Innhold

### `customer-onboarding/`
Kundens første møte med Pek. Fire steg:
1. Landing-siden hun ser når hun klikker den delte lenken
2. Velkomst-coachen som forklarer tre regler
3. Skrive første kommentar (klikk → composer)
4. Sendt-bekreftelse + neste steg

### `customer-return/`
Kunden kommer tilbake dag 2+. Fire steg:
1. "Velkommen tilbake"-kort med oppsummering
2. Min innboks (kun egne tråder)
3. Tråd-detalj med TRYs svar
4. Avklaringsflyt (TRY trenger å vite hvilket element)

### `team-thread/`
TRY-rådgivers trådvisning. Tre tilstander:
1. Standardvisning av en åpen tråd
2. Skriver svar (med "logg endring"-forslag)
3. AI foreslår gruppering av relaterte tråder

## Hvordan se dem

**Lokalt:** Klon repo, åpne hvilken som helst `index.html` i Chrome/Safari/Firefox.

**Delt:** [kristofferfylling.github.io/pek/prototypes](https://kristofferfylling.github.io/pek/prototypes/) – oppdateres automatisk ved push til `main`.

## Hva de IKKE er

- Reelle implementasjoner (ingen backend, ingen state)
- Komplett designsystem (bare nok til å validere flyten)
- Bygd for mobil (designet for 680px container)

Prototypene er ment som diskusjonsgrunnlag og brukertest-stimuli. Når reelle Pek bygges, blir HTML-koden kastet til fordel for React-komponenter med ekte data.
