# Beslutninger

Lett ADR-stil. Hver beslutning har kontekst, valget, og begrunnelsen. Når vi reverserer en beslutning, lar vi den gamle stå og legger til en ny med dato.

---

## 001 · Verktøyet skal støtte både staging-lenker og Figma-prototyper

**Valg:** Begge kildetyper i samme verktøy, samme innboks.

**Begrunnelse:** Et Dig-prosjekt går typisk fra Figma-konsept til implementert staging-versjon i samme tidsperiode. Å splitte feedback over to verktøy ville skapt det samme spredte-innsikt-problemet på nytt.

**Konsekvens:** To forskjellige tekniske integrasjoner (proxy for staging, postMessage for Figma). Mer kompleksitet i MVP, men løser problemet ordentlig.

---

## 002 · Anonym deltakelse via delbar lenke

**Valg:** Kunden trenger ikke konto. Navn + lenke. Ingen epost-bekreftelse.

**Begrunnelse:** Friksjon dreper bruk. Hvert ekstra steg fra "her er lenken" til "her er kommentaren min" mister oss en prosentdel av deltakerne. En PM hos kunden vil ikke opprette enda en konto for å si "kan vi bytte ord".

**Konsekvens:** Navn lagres i localStorage for å huske brukeren på tvers av sesjoner. Hvis hun bytter enhet, må hun taste navnet på nytt – akseptabelt trade-off.

---

## 003 · Arbeidsnavn er "Pek"

**Valg:** Pek.

**Begrunnelse:** Kort, norsk, fungerer som verb ("pek på det her"). Kjernehandlingen i hele verktøyet er å peke. Lavmælt, jordnært, rimer med TRY-tonen.

**Konsekvens:** Reserverer pek.try.no eller tilsvarende domene før vi går for langt.

---

## 004 · Ingen faste kategorier på kommentarer ved opprettelse

**Valg:** Kunden velger ikke "Forslag/Spørsmål/Feil/Ros" når hun skriver. AI klassifiserer i bakkant.

**Begrunnelse:** Hver gang vi tvinger kunden til å velge fra dropdown mister vi 5–10 % av kommentarene helt. Dropdown-svar er dessuten ofte vilkårlige – "Forslag" og "Spørsmål" overlapper. AI-klassifisering gir bedre data uten å koste kunden noe, og taksonomien kan justeres etterhvert.

**Konsekvens:** AI-klassifisering må bygges (kan starte enkelt – Claude API mot kommentartekst). TRY-teamet kan overstyre.

---

## 005 · Epost-varsling for kunden velges per prosjekt

**Valg:** Prosjekteier hos TRY bestemmer om kunden får ukentlig digest, ingen epost (Pastel-modellen), eller noe imellom.

**Begrunnelse:** Wilfa med én PM som kommenterer kan trenge digest fredager. DNB-prosjekt med 14 deltakere ville få epost-storm. Én policy passer ikke alle.

**Konsekvens:** Innstilling på prosjektnivå. Default er ingen epost (mindre invaderende).

---

## 006 · Kunden ser kun sine egne tråder by default

**Valg:** Stine ser Stines kommentarer i innboksen. En "Alle på Wilfa-siden"-toggle finnes for når de eksplisitt vil samarbeide.

**Begrunnelse:** Personvern by default. Kollega-Eiriks halvferdige tanke skal ikke bli underholdning for Stine. Senker også terskelen for å skrive "dumme" spørsmål.

**Konsekvens:** Pins på staging-siden viser likevel alle åpne kommentarer fra alle på kundesiden – ikke i innboks, men i sidevisning. Det signaliserer "vi jobber sammen" uten å eksponere private tråder.

---

## 007 · Kun TRY-teamet kan lukke tråder

**Valg:** Kunden kan reagere ("Bra"-knapp), men kan ikke sette status til "Løst".

**Begrunnelse:** Status er teamets ansvar fordi teamet eier leveransen. Forhindrer "jeg trodde dette var avklart"-diskusjoner. Konsistent med hvordan vi allerede jobber.

**Konsekvens:** Statusen "Venter på deg" må være tydelig i kundens innboks når TRY venter på avklaring. Ellers stagnerer tråder.

---

## 008 · Intern notat i samme tråd, gult signalsystem

**Valg:** TRY kan skrive interne notater i samme tråd som kundekommentaren. Visuelt umulig å forveksle: gul venstre-kant, låsikon, "KUN TEAMET"-caps.

**Begrunnelse:** Splittet flate ("intern" et annet sted) gjør at intern strategi ikke kobles til den konkrete kommentaren. Risikoen for å sende internt utad er reell – derfor må visuelt skille være maks tydelig, ikke bare en liten badge.

**Konsekvens:** Composer har to tabs ("Svar Stine" / "Intern notat"). Tab-bytte endrer hele komposeren visuelt.

---

## 009 · AI foreslår gruppering av relaterte kommentarer (proaktivt)

**Valg:** Når tre eller flere tråder ser ut til å handle om samme tema/komponent, foreslår AI å gruppere dem. TRY må bekrefte før sammenslåing.

**Begrunnelse:** Sentral verdi vs. konkurrenter (Pastel, BugHerd). Reduserer kognitivt arbeid i triage. Når flere kommenterer på "hero" på ulike sider som egentlig er samme React-komponent, er det én utviklerjobb, ikke tre.

**Konsekvens:** Krever AI-lag som kombinerer semantisk likhet (kommentartekst) med strukturell likhet (DOM-element, klassenavn, Figma-frame-ID). Bekreftelse via designer/utvikler før gruppering settes.

**Lagret som langtidsnotat fra Kristoffer:** AI kan be designer/utvikler bekrefte om relaterte tråder hører sammen før gruppering.

---

## 010 · Linear er første integrasjon, Jira nummer to med to-veis sync

**Valg:** Linear bygges først (mest brukt internt). Jira bygges nummer to, med to-veis statussync som er kritisk: når en task markeres som "Done"/"Resolved" i Jira, oppdateres tilknyttede Pek-tråder automatisk.

**Begrunnelse:** Linear er det Dig bruker mest. Jira er det kundene ofte krever. To-veis sync er forskjellen på et verktøy folk bruker og et verktøy folk ser som ekstra arbeid – ingen designer/utvikler skal måtte lukke en oppgave på to steder.

**Konsekvens:** Webhook fra Linear/Jira → Pek (push-basert, ikke polling). Hver tråd får et `external_issue_key`-felt som primær lenke. Status-mapping defineres i prosjektinnstillinger.

**Lagret som langtidsnotat fra Kristoffer:** To-veis Jira-sync er kritisk – slipper dobbelmarkering.

---

## 011 · "Logg endring" som førsteklasses primitive i tråd-svar

**Valg:** Når TRY skriver "vi endret X til Y", foreslår Pek å logge endringen som et eget tråd-event. Audit trail uten ekstra steg.

**Begrunnelse:** Lar Stine se "ja, dette ble faktisk gjort" uten å lete. Hjelper også TRY-teamet å rekonstruere historikk: "denne endringen kom fra Stines kommentar #14".

**Konsekvens:** AI eller mønstergjenkjenning på composer-tekst foreslår "Logg X → Y"-felt. Endringen blir et separat element i tråden, ikke bare fritekst.

---

## 012 · Marker som løst-checkbox knyttes til Send-knappen

**Valg:** Når TRY sender et svar, kan de samtidig krysse av "Marker som løst". Ett klikk, to handlinger.

**Begrunnelse:** I 95 % av tilfellene hvor TRY skriver "vi endret det nå", vil de også lukke tråden. Tre separate steg (skriv, send, naviger til status-dropdown, velg "Closed") er friksjon uten verdi.

**Konsekvens:** Checkboxen er ikke forhåndsavkrysset – TRY må aktivt velge det. Forhindrer feilaktig lukking.
