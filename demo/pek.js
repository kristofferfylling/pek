(function () {
  const STORAGE_KEY = "pek-demo-v1";
  const PROJECT = { title: "Wilfa Shopify v3", owner: "Kristoffer fra TRY Dig", url: "feedback.try.no/p/wilfa-v3" };

  const defaultState = () => ({
    userName: "", coachSeen: false, device: "desktop", eyebrow: "NYHET",
    threads: [], welcomeDismissed: false, visitCount: 0,
    screen: "landing", role: "customer", activeThreadId: null, composer: null, toast: null,
    termPopover: null,
  });

  let state = loadState();
  if (location.hash === "#team") { state.role = "team"; state.screen = "team-inbox"; }

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? { ...defaultState(), ...JSON.parse(raw) } : defaultState();
    } catch { return defaultState(); }
  }
  function saveState() { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
  function initials(name) { return (name || "?").split(/\s+/).map(p => p[0]).join("").slice(0, 2).toUpperCase(); }
  function esc(s) { return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;"); }
  function threadById(id) { return state.threads.find(t => t.id === id); }
  function unreadCount() { return state.threads.filter(t => t.hasUnread).length; }
  function resolvedChangeCount() { return state.threads.filter(t => t.changeApplied).length; }

  function navigate(screen, threadId) {
    state.screen = screen; state.activeThreadId = threadId || null; state.composer = null; state.termPopover = null;
    saveState(); render();
  }
  function setRole(role) {
    state.role = role;
    state.screen = role === "team" ? "team-inbox" : state.userName ? "staging" : "landing";
    saveState(); render();
  }
  function showToast(msg) { state.toast = msg; render(); setTimeout(() => { state.toast = null; render(); }, 2800); }

  function enterProject(name) {
    const t = name.trim(); if (!t) return;
    state.userName = t; state.visitCount += 1;
    state.screen = state.coachSeen ? "staging" : "coach";
    saveState(); render();
  }
  function openComposer(xPct, yPct, label) {
    state.composer = { xPct, yPct, label, text: "" }; saveState(); render();
    const ta = document.querySelector(".pek-composer textarea"); if (ta) ta.focus();
  }
  function submitComment() {
    const c = state.composer; if (!c || !c.text.trim()) return;
    state.threads.push({
      id: "t-" + Date.now(), pin: c.label, xPct: c.xPct, yPct: c.yPct,
      text: c.text.trim(), author: state.userName, page: "Forsiden", device: state.device,
      status: "open", replies: [], events: [], hasUnread: false, changeApplied: false,
    });
    state.composer = null; state.screen = "staging"; saveState(); showToast("Sendt – TRY-teamet ser den nå");
  }
  function simulateTeamReply() {
    const thread = state.threads[0];
    if (!thread) { showToast("Legg inn en kommentar først (som kunde)"); return; }
    thread.replies.push({ author: "Kristoffer", role: "TRY Dig", text: "Bra catch. Vi endret til «Ny modell» – se forsiden 👀" });
    thread.hasUnread = true; thread.status = "resolved"; thread.changeApplied = true;
    state.eyebrow = "NY MODELL";
    thread.events.push({ text: "NYHET → NY MODELL på forsiden" });
    state.welcomeDismissed = false; saveState(); render();
  }
  function resetDemo() { if (!confirm("Nullstille all demo-data?")) return; state = defaultState(); saveState(); render(); }
  function dismissWelcome() { state.welcomeDismissed = true; saveState(); render(); }
  function finishCoach() { state.coachSeen = true; state.screen = "staging"; saveState(); render(); }
  function addTeamReply(threadId, text, internal) {
    const thread = threadById(threadId); if (!thread || !text.trim()) return;
    thread.replies.push({ author: internal ? "Marte (Tekst)" : "Kristoffer", role: internal ? "intern" : "TRY Dig", text: text.trim() });
    if (!internal) { thread.hasUnread = true; thread.status = "in_progress"; }
    saveState(); navigate("team-thread", threadId);
  }
  function updateThreadStatus(threadId, status) {
    const thread = threadById(threadId); if (!thread) return;
    thread.status = status; if (status === "resolved") thread.changeApplied = true;
    saveState(); render();
  }
  function markThreadRead(id) { const t = threadById(id); if (t) { t.hasUnread = false; saveState(); } }
  function statusLabel(s) {
    return ({ open: { label: "Åpen", cls: "warning" }, in_progress: { label: "I arbeid", cls: "info" }, resolved: { label: "Løst", cls: "success" } })[s] || { label: "Åpen", cls: "warning" };
  }
  const JARGON = [
    { re: /\beyebrow\b/gi, key: "eyebrow" },
    { re: /\bhero\b/gi, key: "hero" },
    { re: /\bCTA\b/g, key: "cta" },
    { re: /\bcta\b/g, key: "cta" },
  ];

  function explainTerm(key, thread) {
    const label = state.eyebrow;
    const pin = thread?.pin || "elementet på siden";
    const page = thread?.page || "Forsiden";
    const map = {
      eyebrow: `Eyebrow er den lille tekstlinjen over hovedoverskriften — «øyet» over tittelen. På ${page} er det «${label}»-merket (${pin}). I UI-språk brukes det ikke om bokstavelige øyenbryn.`,
      hero: `Hero er toppseksjonen — det første man ser når siden laster. Her: Wilfa-header, ${label}, og overskriften under.`,
      cta: `CTA (call to action) er det som skal få brukeren til å gjøre noe — f.eks. «Les mer» eller «Kjøp nå».`,
    };
    return map[key] || `Faguttrykk brukt i en kommentar på denne siden.`;
  }

  function linkJargon(text, forCustomer, threadId) {
    if (!forCustomer) return esc(text);
    let html = esc(text);
    JARGON.forEach(({ re, key }) => {
      html = html.replace(re, (match) =>
        `<button type="button" class="pek-jargon-term" data-action="explain-term" data-term="${key}" data-thread-id="${threadId || ""}">${match}</button>`
      );
    });
    return html;
  }

  function renderTermPopover() {
    if (!state.termPopover) return "";
    const thread = threadById(state.termPopover.threadId);
    const term = state.termPopover.term;
    const title = term === "eyebrow" ? "Eyebrow" : term === "hero" ? "Hero" : term.toUpperCase();
    return `
      <div class="pek-term-backdrop" data-action="close-term"></div>
      <div class="pek-term-popover" style="left:${state.termPopover.x}px;top:${state.termPopover.y}px">
        <button type="button" class="close" data-action="close-term" aria-label="Lukk">×</button>
        <p class="label"><i class="ti ti-sparkles"></i> Forklaring (demo-AI)</p>
        <p><strong>${esc(title)}</strong> — ${esc(explainTerm(term, thread))}</p>
        <p class="note">I produktet genereres dette fra kontekst (pin, side, screenshot).</p>
      </div>`;
  }

  function openTermPopover(term, threadId, el) {
    const rect = el.getBoundingClientRect();
    state.termPopover = {
      term,
      threadId,
      x: Math.min(rect.left, window.innerWidth - 320),
      y: rect.bottom + 8,
    };
    saveState();
    render();
  }

  function closeTermPopover() {
    state.termPopover = null;
    saveState();
    render();
  }

  function onStagingClick(e) {
    if (state.role !== "customer") return;
    if (e.target.closest(".pek-toolbar, .pek-composer, .pek-pin-layer button, .pek-welcome-card, .pek-coach-overlay")) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const xPct = ((e.clientX - rect.left) / rect.width) * 100;
    const yPct = ((e.clientY - rect.top) / rect.height) * 100;
    openComposer(xPct, yPct, yPct < 35 ? '"NYHET"-merket' : "Hero-området");
  }

  function renderDemoBar() {
    return `<div class="pek-demo-bar"><strong>Interaktiv demo</strong><span class="muted">Klikk på siden · localStorage</span><span class="spacer"></span><button type="button" class="ghost" data-action="role-customer">Kunde</button><button type="button" class="ghost" data-action="role-team">TRY</button><button type="button" class="ghost" data-action="simulate-reply">Simuler TRY-svar</button><button type="button" class="primary" data-action="reset">Nullstill</button></div>`;
  }

  function renderWilfaSite() {
    return `<div class="pek-wilfa-nav">WILFA <span>Produkter · Inspirasjon</span></div><div class="pek-wilfa-hero"><p class="eyebrow">${esc(state.eyebrow)}</p><h1>Svart presisjon for hjemmebaristaen</h1><p>Lær mer om vår nye espressomaskin.</p></div>`;
  }

  function renderPins() {
    return state.threads.map((t, i) => {
      const resolved = t.status === "resolved";
      return `<button type="button" class="pin-btn pin${resolved ? " pin-resolved" : ""}${t.hasUnread ? " unread" : ""}" style="left:${t.xPct}%;top:${t.yPct}%" data-action="open-thread" data-id="${t.id}">${i + 1}</button>`;
    }).join("");
  }

  function renderComposer() {
    if (!state.composer) return "";
    const c = state.composer;
    const left = Math.min(Math.max(c.xPct, 12), 72);
    const top = Math.min(Math.max(c.yPct, 8), 65);
    return `<div class="pek-highlight" style="left:${c.xPct - 4}%;top:${c.yPct - 3}%;width:18%;height:8%"></div>
      <div class="pek-composer" style="left:${left}%;top:${top}%">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px"><span class="pek-avatar">${initials(state.userName)}</span><div><p style="font-size:12px;font-weight:500;margin:0">${esc(state.userName)}</p><p style="font-size:10px;color:var(--color-text-tertiary);margin:0">Peker på ${esc(c.label)}</p></div></div>
        <textarea placeholder="Skriv kommentaren din…">${esc(c.text)}</textarea>
        <div class="pek-composer-actions"><button type="button" data-action="cancel-composer">Avbryt</button><span class="spacer"></span><button type="button" class="send" data-action="submit-comment">Send</button></div>
        <p class="pek-composer-meta"><i class="ti ti-device-${state.device === "mobile" ? "mobile" : "desktop"}"></i> ${state.device === "mobile" ? "Mobil · 375px" : "Desktop · 1440px"} · Forsiden</p>
      </div>`;
  }

  function renderWelcomeCard() {
    if (state.welcomeDismissed || state.role !== "customer") return "";
    const unread = unreadCount(), changes = resolvedChangeCount();
    if (state.visitCount < 2 && unread === 0) return "";
    if (unread === 0 && changes === 0) return "";
    return `<div class="pek-welcome-card">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px"><span class="pek-avatar">${initials(state.userName)}</span><div><p style="font-size:14px;font-weight:500;margin:0">Velkommen tilbake, ${esc(state.userName.split(" ")[0])}</p><p style="font-size:11px;color:var(--color-text-secondary);margin:2px 0 0">Det har skjedd litt siden sist</p></div></div>
      ${unread ? `<div style="background:var(--color-background-secondary);border-radius:8px;padding:10px 12px;margin-bottom:10px;display:flex;gap:10px"><i class="ti ti-message-circle" style="color:var(--color-text-info)"></i><p style="margin:0;font-size:12px"><strong>${unread} nye svar</strong> på dine kommentarer</p></div>` : ""}
      ${changes ? `<div style="background:var(--color-background-secondary);border-radius:8px;padding:10px 12px;margin-bottom:14px;display:flex;gap:10px"><i class="ti ti-sparkles" style="color:var(--color-text-success)"></i><p style="margin:0;font-size:12px"><strong>${changes} endring${changes > 1 ? "er" : ""}</strong> tatt med videre</p></div>` : ""}
      <div style="display:flex;gap:8px"><button type="button" data-action="go-inbox" style="flex:1;background:var(--color-text-primary);color:var(--color-background-primary);border:none;border-radius:8px;padding:10px;font-weight:500">Se hva som er nytt</button><button type="button" data-action="dismiss-welcome">Senere</button></div>
    </div>`;
  }

  function renderStaging() {
    const count = state.threads.length;
    return `<div class="pek-shell"><div class="pek-topbar"><button type="button" class="pek-back" data-action="go-inbox"><i class="ti ti-inbox"></i> Innboks${unreadCount() ? ` (${unreadCount()})` : ""}</button><span class="spacer"></span><span class="muted">${esc(state.userName)}</span><span class="pek-avatar">${initials(state.userName)}</span></div>
      <div class="pek-browser-chrome"><span class="pek-browser-dot" style="background:#ff5f57"></span><span class="pek-browser-dot" style="background:#febc2e"></span><span class="pek-browser-dot" style="background:#28c840"></span><span class="pek-url-bar">${PROJECT.url}</span></div>
      <div class="pek-staging-wrap"><div class="pek-staging-frame ${state.device}" data-staging="1">${renderWilfaSite()}<div class="pek-pin-layer">${renderPins()}</div>${renderComposer()}${renderWelcomeCard()}${state.toast ? `<div class="pek-toast"><i class="ti ti-check"></i> ${esc(state.toast)}</div>` : ""}<div class="pek-toolbar">${count ? `<div class="pek-toolbar-pill"><span>Du har ${count} kommentar${count > 1 ? "er" : ""} her</span></div>` : `<div class="pek-toolbar-pill"><span>Klikk på siden for å kommentere</span></div>`}<div class="pek-device-toggle"><button type="button" data-action="device-desktop" class="${state.device === "desktop" ? "active" : ""}">Desktop</button><button type="button" data-action="device-mobile" class="${state.device === "mobile" ? "active" : ""}">Mobil</button></div></div></div></div></div>`;
  }

  function renderCoach() {
    return `<div style="position:relative">${renderStaging()}<div class="pek-coach-overlay" style="border-radius:var(--border-radius-md)"><div class="pek-coach-card">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px"><span class="pek-avatar">${initials(state.userName)}</span><p style="margin:0;font-size:12px">Hei, ${esc(state.userName.split(" ")[0])} 👋</p></div>
      <h4 style="font-size:16px;margin:12px 0">Slik kommenterer du</h4>
      <div class="pek-coach-rule"><span class="icon"><i class="ti ti-pointer"></i></span><div><p style="font-weight:500;margin:0 0 2px;font-size:13px">Klikk hvor som helst</p><p style="margin:0;font-size:12px;color:var(--color-text-secondary)">Kommentaren fester seg til det stedet.</p></div></div>
      <div class="pek-coach-rule"><span class="icon alt"><i class="ti ti-device-mobile"></i></span><div><p style="font-weight:500;margin:0 0 2px;font-size:13px">Bytt mobil/desktop</p><p style="margin:0;font-size:12px;color:var(--color-text-secondary)">Knappen nederst – kommentarer henger sammen.</p></div></div>
      <div class="pek-coach-rule"><span class="icon alt"><i class="ti ti-message-circle"></i></span><div><p style="font-weight:500;margin:0 0 2px;font-size:13px">Vi svarer i kommentaren</p><p style="margin:0;font-size:12px;color:var(--color-text-secondary)">Ingen epost – se svar når du kommer tilbake.</p></div></div>
      <button type="button" data-action="finish-coach" style="width:100%;background:var(--color-text-primary);color:var(--color-background-primary);border:none;border-radius:8px;padding:10px;font-weight:500">Sett i gang</button>
    </div></div></div>`;
  }

  function renderLanding() {
    return `<div class="pek-shell"><div class="pek-topbar"><span class="pek-logo"><i class="ti ti-message-circle"></i></span><span style="font-weight:500">Pek</span><span class="muted">av TRY Dig</span></div>
      <div class="pek-landing-body"><div style="width:56px;height:56px;border-radius:12px;background:var(--color-background-info);display:inline-flex;align-items:center;justify-content:center;margin-bottom:16px"><i class="ti ti-folder-open" style="font-size:28px;color:var(--color-text-info)"></i></div>
      <h2>Du er invitert til å se på ${esc(PROJECT.title)}</h2><p class="intro">${esc(PROJECT.owner)} vil gjerne ha tilbakemeldingen din.</p>
      <div class="pek-scope-box"><p class="label">DET DU SKAL SE PÅ</p><p style="font-size:13px;margin:0 0 8px"><i class="ti ti-world"></i> Staging-versjon av forsiden</p><p style="font-size:13px;margin:0"><i class="ti ti-brand-figma"></i> Mobilnavigasjon (senere)</p></div>
      <p style="font-size:12px;color:var(--color-text-secondary)">Skriv navnet ditt:</p>
      <input type="text" id="pek-name" placeholder="Navnet ditt" value="${esc(state.userName)}" style="width:100%;margin:12px 0 10px;text-align:center">
      <button type="button" data-action="enter" style="width:100%;background:var(--color-text-primary);color:var(--color-background-primary);border:none;border-radius:8px;padding:12px;font-weight:500">Gå inn</button>
      <p style="font-size:11px;color:var(--color-text-tertiary);margin-top:12px"><i class="ti ti-lock"></i> Ingen innlogging</p></div></div>`;
  }

  function renderInbox(team) {
    const title = team ? "Alle tråder" : "Dine kommentarer";
    const threads = state.threads;
    return `<div class="pek-shell"><div class="pek-topbar"><button type="button" class="pek-back" data-action="${team ? "team-inbox" : "staging"}"><i class="ti ti-arrow-left"></i></button><span style="font-weight:500">${esc(PROJECT.title)}</span><span class="muted">· ${title}</span></div>
      <div class="pek-inbox-list">${!threads.length ? `<div class="pek-empty"><p>Ingen kommentarer ennå.</p><button type="button" data-action="staging" style="margin-top:12px">Til staging</button></div>` : ""}
      ${threads.map((t, i) => { const st = statusLabel(t.status); const last = t.replies[t.replies.length - 1];
        return `<div class="pek-inbox-item${t.hasUnread ? " highlight" : ""}" data-action="open-thread" data-id="${t.id}"><span class="pin" style="width:22px;height:22px;font-size:11px">${i+1}</span><div class="content"><div style="display:flex;gap:6px;margin-bottom:4px"><span style="font-size:12px">${team ? esc(t.author) : "Du"} · ${esc(t.pin)}</span><span class="pek-badge ${st.cls}" style="margin-left:auto">${st.label}</span></div><p style="font-size:12px;margin:0">${linkJargon(t.text, !team, t.id)}</p>${last && !team ? `<div class="pek-reply-bubble"><strong>${esc(last.author)}</strong> · ${linkJargon(last.text, true, t.id)}</div>` : ""}${t.changeApplied ? `<span class="pek-badge success" style="margin-top:6px;display:inline-block"><i class="ti ti-check"></i> Endret</span>` : ""}</div></div>`; }).join("")}
      </div></div>`;
  }

  function renderThread(team) {
    const t = threadById(state.activeThreadId);
    if (!t) return renderInbox(team);
    if (!team) markThreadRead(t.id);
    const st = statusLabel(t.status);
    const idx = state.threads.indexOf(t) + 1;
    const replies = t.replies.map(r => r.role === "intern"
      ? `<div class="pek-internal-note"><p style="margin:0;font-size:10px;color:#854f0b;font-weight:500"><i class="ti ti-lock"></i> INTERN</p><p style="margin:6px 0 0"><strong>${esc(r.author)}:</strong> ${esc(r.text)}</p></div>`
      : `<div style="display:flex;gap:10px;margin:12px 0"><span class="pek-avatar" style="background:#d3d1c7;color:#5f5e5a">K</span><div><p style="margin:0 0 4px;font-size:12px"><strong>${esc(r.author)}</strong></p><p style="margin:0;font-size:13px">${linkJargon(r.text, !team, t.id)}</p></div></div>`).join("");
    const events = t.events.map(e => `<div class="pek-event"><i class="ti ti-history"></i> ${esc(e.text)}</div>`).join("");

    if (team) {
      return `<div class="pek-shell"><div class="pek-topbar"><button type="button" class="pek-back" data-action="team-inbox"><i class="ti ti-arrow-left"></i> Innboks</button><span class="spacer"></span><span class="pek-badge ${st.cls}">${st.label}</span></div>
        <div class="pek-thread-grid"><div class="pek-thread-main"><div style="display:flex;gap:10px;margin-bottom:12px"><span class="pin">${idx}</span><div><p style="font-weight:500;margin:0;font-size:12px">${esc(t.pin)}</p></div></div>
        <div style="display:flex;gap:10px;margin-bottom:12px"><span class="pek-avatar">${initials(t.author)}</span><div><p style="margin:0 0 4px;font-size:12px"><strong>${esc(t.author)}</strong></p><p style="margin:0;font-size:13px">${esc(t.text)}</p></div></div>${events}${replies}
        <form class="team-reply-form" style="margin-top:16px"><textarea name="reply" placeholder="Svar ${esc(t.author.split(" ")[0])}…" style="width:100%;min-height:72px;margin-bottom:8px"></textarea><button type="submit">Send svar</button> <button type="button" data-action="team-internal">+ Intern notat</button></form></div>
        <div class="pek-thread-sidebar"><label>Status</label><select data-action="status-select" data-id="${t.id}"><option value="open"${t.status==="open"?" selected":""}>Åpen</option><option value="in_progress"${t.status==="in_progress"?" selected":""}>I arbeid</option><option value="resolved"${t.status==="resolved"?" selected":""}>Løst</option></select><button type="button" disabled style="width:100%">→ Linear (Lag 2)</button></div></div></div>`;
    }
    return `<div class="pek-shell"><div class="pek-topbar"><button type="button" class="pek-back" data-action="go-inbox"><i class="ti ti-arrow-left"></i> Innboks</button><span style="font-weight:500">${esc(t.pin)}</span></div>
      <div style="padding:16px"><div style="display:flex;gap:10px;margin-bottom:12px"><span class="pek-avatar">${initials(t.author)}</span><div><p style="margin:0;font-size:13px">${linkJargon(t.text, true, t.id)}</p></div></div>${events}${replies}</div></div>`;
  }

  function render() {
    const root = document.getElementById("pek-root");
    if (!root) return;
    let main;
    if (state.role === "team") {
      main = (state.screen === "team-thread" && state.activeThreadId) ? renderThread(true) : renderInbox(true);
    } else if (!state.userName || state.screen === "landing") {
      main = renderLanding();
    } else if (state.screen === "coach") {
      main = renderCoach();
    } else if (state.screen === "inbox") {
      main = renderInbox(false);
    } else if (state.screen === "thread") {
      main = renderThread(false);
    } else {
      main = renderStaging();
    }
    root.innerHTML = renderDemoBar() + main + renderTermPopover();
    bindEvents();
  }

  function bindEvents() {
    document.querySelectorAll("[data-action]").forEach(el => el.addEventListener("click", onAction));
    document.querySelectorAll("[data-staging]").forEach(el => el.addEventListener("click", onStagingClick));
    const nameInput = document.getElementById("pek-name");
    if (nameInput) nameInput.addEventListener("keydown", e => { if (e.key === "Enter") enterProject(nameInput.value); });
    const ta = document.querySelector(".pek-composer textarea");
    if (ta) ta.addEventListener("input", e => { if (state.composer) state.composer.text = e.target.value; });
    const form = document.querySelector(".team-reply-form");
    if (form) form.addEventListener("submit", e => {
      e.preventDefault();
      addTeamReply(state.activeThreadId, form.querySelector('[name="reply"]').value, false);
    });
    const sel = document.querySelector("[data-action='status-select']");
    if (sel) sel.addEventListener("change", e => updateThreadStatus(e.target.dataset.id, e.target.value));
  }

  function onAction(e) {
    const el = e.target.closest("[data-action]");
    if (!el) return;
    const a = el.dataset.action, id = el.dataset.id;
    if (a === "explain-term") { e.stopPropagation(); openTermPopover(el.dataset.term, el.dataset.threadId || state.activeThreadId, el); return; }
    if (a === "close-term") { e.stopPropagation(); closeTermPopover(); return; }
    if (a === "enter") { enterProject(document.getElementById("pek-name")?.value || ""); return; }
    if (a === "finish-coach") { finishCoach(); return; }
    if (a === "cancel-composer") { state.composer = null; saveState(); render(); return; }
    if (a === "submit-comment") { const ta = document.querySelector(".pek-composer textarea"); if (ta && state.composer) state.composer.text = ta.value; submitComment(); return; }
    if (a === "device-desktop") { state.device = "desktop"; saveState(); render(); return; }
    if (a === "device-mobile") { state.device = "mobile"; saveState(); render(); return; }
    if (a === "go-inbox") { dismissWelcome(); navigate(state.role === "team" ? "team-inbox" : "inbox"); return; }
    if (a === "dismiss-welcome") { dismissWelcome(); return; }
    if (a === "staging") { navigate("staging"); return; }
    if (a === "open-thread") { markThreadRead(id); navigate(state.role === "team" ? "team-thread" : "thread", id); return; }
    if (a === "role-customer") { setRole("customer"); return; }
    if (a === "role-team") { setRole("team"); return; }
    if (a === "simulate-reply") { simulateTeamReply(); return; }
    if (a === "reset") { resetDemo(); return; }
    if (a === "team-internal") { const text = prompt("Internt notat:"); if (text) addTeamReply(state.activeThreadId, text, true); return; }
    if (a === "team-inbox") { navigate("team-inbox"); return; }
  }

  render();
})();
