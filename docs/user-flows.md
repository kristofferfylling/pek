# Brukerflater

Beskrivelse av hver hovedflate i Pek, fra både kundens og TRYs side. Se prototypene i `prototypes/` for interaktive versjoner.

## Kundens flater

### 1. Førstegangsbesøk

**Steg 1: Landing.** Kunden klikker en delt lenke (typisk fra Slack, epost, eller direkte fra TRY). Lander på en side som forklarer:
- Hvem som har delt (Kristoffer fra TRY Dig)
- Hva hun skal se på (kort liste: staging-sider + Figma-frames)
- Forhåndsutfylt navn hvis mulig, ellers tomt felt

Ingen epost, ingen konto.

**Steg 2: Velkomst-coach.** Tre regler, vises kun første gang:
1. Klikk hvor som helst → kommentaren fester seg
2. Bytt mellom mobil/desktop – kommentarer henger sammen
3. Vi svarer i kommentaren – ingen epost-spam

Coach kan opt-outes med "Vis meg dette igjen senere".

**Steg 3: Skrive kommentar.** Klikk på siden → composer popper ut ved siden av pin → kunden skriver → trykker Send.

- Highlight-ring viser hvilket element som er valgt
- Mini-kontekstlinje ("Peker på NYHET-merket")
- Device + viewport-stempel lagres automatisk

**Steg 4: Sendt.** Toast bekrefter. Toolbar viser progresjon ("Du har 1 kommentar her, neste: Produktside →") og inviterer henne til å fortsette.

### 2. Returbesøk (dag 2+)

**Velkommen tilbake-kort.** Sentralt midtpå sida, viser:
- "X nye svar" på dine kommentarer
- "Y endringer tatt med videre" – med eksempel-tekst
- CTA: "Se hva som er nytt"

Bakgrunnen viser allerede den oppdaterte siden – f.eks. "NY MODELL" der det før stod "NYHET". Kunden ser at vi har lyttet.

**Min innboks.** Kun hennes egne tråder. Filterpiller for "Alt / Nytt / Venter / Løst". Kortvisning av hver tråd med siste svar.

**Tråd-detalj.** Original kommentar + svar + system-events ("NYHET → NY MODELL på forsiden, i går"). Composer for å svare. "Bra"-reaksjon for "thanks!" uten støy.

**Fagord i TRYs svar.** Hvis Kristoffer skriver «Trenger vi eyebrow her?», vises *eyebrow* med stiplet understrek. Stine trykker → liten popover med AI-forklaring knyttet til det hun faktisk ser på siden (ikke en generell design-ordbok). Hun kan lese og fortsette uten å spørre «hva mener dere med…?» på epost.

**Avklaring.** Når TRY trenger presisering ("hvilken knapp mente du?"), sender vi henne tilbake til det visuelle laget. Klikk "Denne"-tag ved riktig element. Ingen tekstskjema.

## TRYs flater

### 3. Trådvisning (det daglige verktøyet)

To-kolonner: samtale til venstre, metadata til høyre.

**Venstre kolonne:**
- Pin-referanse med screenshot-thumb og DOM-info
- Kundens kommentar
- AI-foreslåtte tags (godkjenn med ett klikk)
- Interne notater fra teamet (gul venstre-kant, låsikon, KUN TEAMET)
- Composer (kollapset by default, ekspanderes ved klikk)

**Høyre kolonne:**
- Status-dropdown (Åpen / Sett / I arbeid / Løst)
- Tilordnet til
- Linear/Jira-issue (eller "Opprett issue"-knapp)
- Relaterte tråder (AI-foreslått)

**Composer ekspandert:**
- Tab-bytte mellom "Svar Stine" og "Intern notat" (visuelt distinkt)
- "Logg endring"-knapp for audit trail
- "Marker som løst"-checkbox knyttet til Send

**AI-gruppering:**
- Når tre+ tråder ser ut til å handle om samme tema, foreslår Pek å gruppere
- Forslag inkluderer utkast til Linear-issue-tittel og beskrivelse
- TRY må bekrefte før gruppering – AI tar ikke valget alene

### 4. Innboks (foreløpig kun skissert)

- Alle tråder på tvers av prosjektets sider/frames
- Metric cards: Åpne / Sett / Løst / Sendt til Linear
- Filterpiller: Alle / Åpne / Sendt / Løst
- Per rad: pin-nummer, forfatter, lokasjon, status, "→ Linear"-knapp
- Bulk-handling: "Gruppér med AI", "Lag teknisk spec"

### 5. Admin / Prosjektoversikt (ikke designet ennå)

Kommer i neste designfase. Inkluderer:
- Liste over alle prosjekter
- Opprett nytt prosjekt (lim inn staging-URL eller Figma-lenke)
- Del lenke
- Inviter team
- Prosjektinnstillinger (epost-policy, integrasjoner, status-mapping)

## Tilstander oppsummert

| Tilstand | Synlig for kunde | Synlig for team |
|---|---|---|
| **Åpen** | "Sendt" | "Åpen" – krever respons |
| **Sett** | "Sett av Kristoffer" | "Sett" – noen leste, ikke svart |
| **Venter på deg** | Øverst i innboks, fremhevet | "Venter på kunde" – ute av vår kø |
| **I arbeid** | "Vi jobber med det" | "I arbeid" – tilordnet, ofte koblet til Linear |
| **Løst** | "Endret" eller "På backlog" | "Løst" – endelig stempel, kun TRY kan sette |
