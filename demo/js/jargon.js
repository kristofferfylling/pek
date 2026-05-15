/** Fagord-forklaring (beslutning 013) */
window.PekJargon = (function () {
  const TERMS = [
    { re: /\beyebrow\b/gi, key: "eyebrow" },
    { re: /\bhero\b/gi, key: "hero" },
    { re: /\bCTA\b/g, key: "cta" },
    { re: /\bcta\b/g, key: "cta" },
  ];

  function esc(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function explain(key, thread, state) {
    const label = state.eyebrow;
    const pin = thread?.pin || "elementet";
    const ctx =
      thread?.surface === "figma"
        ? `Figma-frame: ${thread?.frameLabel || "prototype"}`
        : `Staging · ${thread?.page || "Forsiden"}`;
    const map = {
      eyebrow: `Eyebrow er den lille tekstlinjen over hovedoverskriften — «øyet» over tittelen. Her: «${label}» (${pin}). ${ctx}.`,
      hero: `Hero er toppseksjonen — det første man ser. ${ctx}.`,
      cta: `CTA (call to action) er elementet som skal få brukeren til å handle — f.eks. «Les mer» eller «Kjøp nå».`,
    };
    return map[key] || "Faguttrykk i denne kommentaren.";
  }

  function link(text, forCustomer, threadId) {
    if (!forCustomer || !text) return esc(text);
    let html = esc(text);
    TERMS.forEach(({ re, key }) => {
      html = html.replace(
        re,
        (m) =>
          `<span class="pek-jargon" role="button" tabindex="0" data-action="explain-term" data-term="${key}" data-thread-id="${threadId || ""}">${m}</span>`
      );
    });
    return html;
  }

  return { link, explain, esc };
})();
