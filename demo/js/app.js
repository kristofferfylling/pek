/** Pek demo v2 – staging + Figma */
(function () {
  const cfg = window.PekConfig;
  const store = window.PekStore;
  const jargon = window.PekJargon;
  let state = store.get();

  if (location.hash === "#team") {
    state.role = "team";
    state.screen = "team-inbox";
    store.save();
  }

  function esc(s) {
    return jargon.esc(s);
  }
  function initials(name) {
    return (name || "?")
      .split(/\s+/)
      .map((p) => p[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }
  function save() {
    store.save();
    state = store.get();
  }
  function set(patch) {
    store.set(patch);
    state = store.get();
  }

  function navigate(screen, threadId) {
    set({
      screen,
      activeThreadId: threadId || null,
      composer: null,
      termPopover: null,
    });
    render();
  }

  function showToast(msg) {
    set({ toast: msg });
    render();
    setTimeout(() => {
      set({ toast: null });
      render();
    }, 2800);
  }

  function frameLabel(id) {
    return cfg.figma.frames.find((f) => f.id === id)?.label || id;
  }

  function surfaceLabel(surface, frameId) {
    if (surface === "figma") return frameLabel(frameId);
    return cfg.staging.label;
  }

  function enterProject(name) {
    const t = name.trim();
    if (!t) return;
    set({
      userName: t,
      visitCount: state.visitCount + 1,
      screen: state.coachSeen ? "viewer" : "coach",
    });
    render();
  }

  function finishCoach() {
    set({ coachSeen: true, screen: "viewer" });
    render();
  }

  function openComposer(xPct, yPct, label) {
    set({ composer: { xPct, yPct, label, text: "" } });
    render();
    document.querySelector(".pek-composer textarea")?.focus();
  }

  function submitComment() {
    const c = state.composer;
    if (!c?.text?.trim()) return;
    const surface = state.activeSurface;
    const frameId = surface === "figma" ? state.activeFigmaFrame : null;
    state.threads.push({
      id: "t-" + Date.now(),
      surface,
      frameId,
      frameLabel: frameId ? frameLabel(frameId) : null,
      pin: c.label,
      xPct: c.xPct,
      yPct: c.yPct,
      text: c.text.trim(),
      author: state.userName,
      page: surface === "staging" ? "Forsiden" : frameLabel(frameId),
      device: state.device,
      status: "open",
      replies: [],
      events: [],
      hasUnread: false,
      changeApplied: false,
    });
    set({ composer: null, screen: "viewer" });
    showToast("Sendt – TRY-teamet ser den nå");
  }

  function simulateReply() {
    const t = state.threads.find((x) => x.surface === "staging") || state.threads[0];
    if (!t) {
      showToast("Legg inn en kommentar først");
      return;
    }
    t.replies.push({
      author: "Kristoffer",
      role: "TRY Dig",
      text: "Godt spørsmål — eyebrow er endret til «Ny modell». Se staging 👀",
    });
    t.hasUnread = true;
    t.status = "resolved";
    t.changeApplied = true;
    state.eyebrow = "NY MODELL";
    t.events.push({ text: "NYHET → NY MODELL på forsiden" });
    state.welcomeDismissed = false;
    save();
    render();
  }

  function addTeamReply(threadId, text, internal) {
    const t = store.threadById(threadId);
    if (!t || !text.trim()) return;
    t.replies.push({
      author: internal ? "Marte (Tekst)" : "Kristoffer",
      role: internal ? "intern" : "TRY Dig",
      text: text.trim(),
    });
    if (!internal) {
      t.hasUnread = true;
      t.status = "in_progress";
    }
    save();
    navigate("team-thread", threadId);
  }

  function onSurfaceClick(e) {
    if (state.role !== "customer") return;
    if (
      e.target.closest(
        ".pek-toolbar, .pek-composer, .pek-pin-layer .pin-btn, .pek-coach-overlay, .pek-surface-tabs, .pek-frame-tabs"
      )
    )
      return;
    const rect = e.currentTarget.getBoundingClientRect();
    const xPct = ((e.clientX - rect.left) / rect.width) * 100;
    const yPct = ((e.clientY - rect.top) / rect.height) * 100;
    let label = "Punkt på siden";
    if (state.activeSurface === "staging") {
      label = yPct < 35 ? '"NYHET"-merket' : "Hero-området";
    } else {
      label = `${frameLabel(state.activeFigmaFrame)} · punkt`;
    }
    openComposer(xPct, yPct, label);
  }

  function renderPins() {
    const list = store.threadsForSurface(
      state.activeSurface,
      state.activeSurface === "figma" ? state.activeFigmaFrame : null
    );
    return list
      .map((t) => {
        const n = store.pinNumber(t);
        const resolved = t.status === "resolved";
        return `<button type="button" class="pin-btn pin${resolved ? " pin-resolved" : ""}${t.hasUnread ? " unread" : ""}" style="left:${t.xPct}%;top:${t.yPct}%" data-action="open-thread" data-id="${t.id}">${n}</button>`;
      })
      .join("");
  }

  function renderComposer() {
    if (!state.composer) return "";
    const c = state.composer;
    const left = Math.min(Math.max(c.xPct, 10), 70);
    const top = Math.min(Math.max(c.yPct, 6), 62);
    const meta =
      state.activeSurface === "staging"
        ? `${state.device === "mobile" ? "Mobil · 375px" : "Desktop"} · Forsiden`
        : `${frameLabel(state.activeFigmaFrame)} · Figma`;
    return `
      <div class="pek-highlight" style="left:${c.xPct - 3}%;top:${c.yPct - 2}%;width:14%;height:7%"></div>
      <div class="pek-composer" style="left:${left}%;top:${top}%">
        <div style="display:flex;gap:8px;margin-bottom:8px">
          <span class="pek-avatar">${initials(state.userName)}</span>
          <div><p style="margin:0;font-size:12px;font-weight:500">${esc(state.userName)}</p>
          <p style="margin:0;font-size:10px;color:var(--color-text-tertiary)">Peker på ${esc(c.label)}</p></div>
        </div>
        <textarea placeholder="Skriv kommentaren…">${esc(c.text)}</textarea>
        <div class="pek-composer-actions">
          <button type="button" data-action="cancel-composer">Avbryt</button>
          <span class="spacer"></span>
          <button type="button" class="send" data-action="submit-comment">Send</button>
        </div>
        <p class="pek-composer-meta">${esc(meta)}</p>
      </div>`;
  }

  function renderWilfa() {
    return `<div class="pek-wilfa-nav">WILFA <span style="font-weight:400;font-size:11px">Produkter</span></div>
      <div class="pek-wilfa-hero"><p class="eyebrow">${esc(state.eyebrow)}</p>
      <h1>Svart presisjon for hjemmebaristaen</h1><p>Lær mer om espressomaskinen.</p></div>`;
  }

    function renderFigmaMock(frameId) {
    const tabs = frameId === "nav-b" ? `<div class="tabs"><span class="on">Hjem</span><span>Shop</span><span>Mer</span></div>` : "";
    const bottom = frameId === "nav-c" ? `<div class="bottom-bar"><span class="on">Hjem</span><span>Shop</span><span>Søk</span><span>Mer</span></div>` : "";
    return `<div class="pek-figma-mock nav-${frameId.replace("nav-", "")}"><div class="status">9:41</div><div class="nav-header"><strong>WILFA</strong><i class="ti ti-menu-2"></i></div>${tabs}<div class="content"><p style="font-size:11px;color:#888">Prototype · ${esc(frameLabel(frameId))}</p><p style="font-weight:500;margin:8px 0 0">Klikk for å kommentere</p></div>${bottom}</div>`;
  }

  function renderFigmaSurface() {
    const frame = state.activeFigmaFrame;
    const useEmbed = state.figmaMode === "embed" && cfg.figma.useEmbed;
    const inner = useEmbed
      ? `<iframe src="${cfg.figma.embedUrl}" title="Figma prototype" loading="lazy"></iframe>`
      : renderFigmaMock(frame);
    return `<div class="pek-figma-wrap${state.figmaExplore ? " explore" : ""}" data-surface-click="1">${inner}
      <div class="pek-click-layer"></div>
      <div class="pek-pin-layer">${renderPins()}</div>${renderComposer()}</div>`;
  }

  function renderStagingSurface() {
    return `<div class="pek-staging-frame ${state.device}" data-surface-click="1">${renderWilfa()}
      <div class="pek-pin-layer">${renderPins()}</div>${renderComposer()}</div>`;
  }

  function renderViewer() {
    const count = store.threadsForSurface(state.activeSurface, state.activeSurface === "figma" ? state.activeFigmaFrame : null).length;
    const url = state.activeSurface === "staging"
      ? `${cfg.publicPath} → ${cfg.staging.targetHost}/`
      : `${cfg.publicPath}?source=figma&frame=${state.activeFigmaFrame}`;
    const frameTabs = state.activeSurface === "figma"
      ? `<div class="pek-frame-tabs">${cfg.figma.frames.map((f) =>
          `<button type="button" data-action="set-frame" data-frame="${f.id}" class="${f.id === state.activeFigmaFrame ? "active" : ""}">${esc(f.label.split("·")[1]?.trim() || f.label)}</button>`
        ).join("")}<button type="button" class="${state.figmaMode === "embed" ? "active" : ""}" data-action="figma-embed" title="Ekte Figma">Embed</button>
        <button type="button" class="${state.figmaMode === "mock" ? "active" : ""}" data-action="figma-mock">Mock</button></div>`
      : "";
    return `<div class="pek-shell">
      <div class="pek-topbar">
        <button type="button" class="pek-back" data-action="go-inbox"><i class="ti ti-inbox"></i> Innboks${store.unreadCount() ? ` (${store.unreadCount()})` : ""}</button>
        <span class="spacer"></span><span class="muted">${esc(state.userName)}</span><span class="pek-avatar">${initials(state.userName)}</span>
      </div>
      <div class="pek-surface-tabs">
        <button type="button" data-action="set-surface" data-surface="staging" class="${state.activeSurface === "staging" ? "active" : ""}"><i class="ti ti-world"></i> Staging</button>
        <button type="button" data-action="set-surface" data-surface="figma" class="${state.activeSurface === "figma" ? "active" : ""}"><i class="ti ti-brand-figma"></i> Figma</button>
      </div>
      ${state.activeSurface === "staging" ? `<div class="pek-proxy-banner"><i class="ti ti-cloud"></i> ${esc(cfg.staging.proxyNote)}</div>` : ""}
      <div class="pek-browser-chrome">
        <span class="pek-browser-dot" style="background:#ff5f57"></span>
        <span class="pek-browser-dot" style="background:#febc2e"></span>
        <span class="pek-browser-dot" style="background:#28c840"></span>
        <span class="pek-url-bar">${esc(url)}</span>
      </div>
      ${frameTabs}
      <div class="pek-viewer-body">${state.activeSurface === "staging" ? renderStagingSurface() : renderFigmaSurface()}</div>
      ${state.toast ? `<div class="pek-toast" style="position:fixed;bottom:24px;left:50%;transform:translateX(-50%);z-index:50"><i class="ti ti-check"></i> ${esc(state.toast)}</div>` : ""}
      <div class="pek-toolbar" style="position:fixed;bottom:20px;left:50%;transform:translateX(-50%)">
        <div class="pek-toolbar-pill">${count ? `${count} kommentar${count > 1 ? "er" : ""} her` : "Klikk for å kommentere"}</div>
        ${state.activeSurface === "staging" ? `<div class="pek-device-toggle">
          <button type="button" data-action="device-desktop" class="${state.device === "desktop" ? "active" : ""}">Desktop</button>
          <button type="button" data-action="device-mobile" class="${state.device === "mobile" ? "active" : ""}">Mobil</button>
        </div>` : `<button type="button" class="pek-toolbar-pill" data-action="toggle-figma-explore">${state.figmaExplore ? "Kommentarmodus" : "Utforsk Figma"}</button>`}
      </div>
    </div>`;
  }

  function renderLanding() {
    return `<div class="pek-shell"><div class="pek-topbar"><span class="pek-logo"><i class="ti ti-message-circle"></i></span><span style="font-weight:500">Pek</span><span class="muted">av TRY Dig</span></div>
      <div class="pek-landing-body">
        <h2 style="font-size:18px;font-weight:500;margin:0 0 6px">Du er invitert til ${esc(cfg.title)}</h2>
        <p style="color:var(--color-text-secondary);font-size:13px">${esc(cfg.owner)} vil ha tilbakemelding.</p>
        <div class="pek-scope-box">
          <p style="font-size:10px;color:var(--color-text-tertiary);margin:0 0 10px;letter-spacing:.5px">DET DU SKAL SE PÅ</p>
          <p class="pek-scope-item"><i class="ti ti-world"></i> ${esc(cfg.staging.label)}</p>
          <p class="pek-scope-item" style="margin:0"><i class="ti ti-brand-figma"></i> ${esc(cfg.figma.label)}</p>
        </div>
        <input type="text" id="pek-name" placeholder="Navnet ditt" value="${esc(state.userName)}" style="width:100%;margin:12px 0;text-align:center">
        <button type="button" data-action="enter" style="width:100%;padding:12px;background:var(--color-text-primary);color:white;border:none;border-radius:8px;font-weight:500">Gå inn</button>
      </div></div>`;
  }

  function renderCoach() {
    return `<div style="position:relative;min-height:280px">
      <div class="pek-coach-overlay"><div class="pek-coach-card">
        <h4 style="margin:0 0 12px">Slik kommenterer du</h4>
        <p style="font-size:13px;margin:0 0 8px">1. Bytt mellom <strong>Staging</strong> og <strong>Figma</strong> øverst.</p>
        <p style="font-size:13px;margin:0 0 8px">2. Klikk hvor du vil kommentere — pin fester seg.</p>
        <p style="font-size:13px;margin:0 0 16px">3. Vi svarer i tråden. Stiplet fagord kan du trykke på for forklaring.</p>
        <button type="button" data-action="finish-coach" style="width:100%;padding:10px;background:var(--color-text-primary);color:white;border:none;border-radius:8px">Sett i gang</button>
      </div></div></div>`;
  }

  function statusBadge(s) {
    const m = { open: ["Åpen", "warning"], in_progress: ["I arbeid", "info"], resolved: ["Løst", "success"] };
    const [l, c] = m[s] || m.open;
    return `<span class="pek-badge ${c}">${l}</span>`;
  }

  function renderInbox(team) {
    const threads = state.threads;
    return `<div class="pek-shell"><div class="pek-topbar">
        <button type="button" class="pek-back" data-action="${team ? "team-inbox" : "viewer"}"><i class="ti ti-arrow-left"></i></button>
        <span style="font-weight:500">${esc(cfg.title)}</span>
      </div>
      <div class="pek-inbox-list">${!threads.length ? `<div class="pek-empty"><p>Ingen kommentarer.</p><button data-action="viewer">Til visning</button></div>` : ""}
      ${threads.map((t) => {
        const n = store.pinNumber(t);
        const last = t.replies[t.replies.length - 1];
        const surf = t.surface === "figma" ? `<i class="ti ti-brand-figma"></i>` : `<i class="ti ti-world"></i>`;
        return `<div class="pek-inbox-item${t.hasUnread && !team ? " highlight" : ""}" data-action="open-thread" data-id="${t.id}">
          <span class="pin" style="width:22px;height:22px;font-size:11px">${n}</span>
          <div style="flex:1"><p class="meta">${surf} ${esc(t.page)} · ${esc(t.pin)} ${statusBadge(t.status)}</p>
          <p style="font-size:12px;margin:4px 0">${team ? esc(t.author) : "Du"}: ${jargon.link(t.text, !team, t.id)}</p>
          ${last && !team ? `<div class="pek-reply-bubble"><strong>${esc(last.author)}</strong>: ${jargon.link(last.text, true, t.id)}</div>` : ""}
          </div></div>`;
      }).join("")}
      </div></div>`;
  }

  function renderThread(team) {
    const t = store.threadById(state.activeThreadId);
    if (!t) return renderInbox(team);
    if (!team) { t.hasUnread = false; save(); }
    const n = store.pinNumber(t);
    const replies = t.replies.map((r) =>
      r.role === "intern"
        ? `<div class="pek-internal-note"><strong>Intern</strong> ${esc(r.author)}: ${esc(r.text)}</div>`
        : `<div style="margin:12px 0"><strong>${esc(r.author)}</strong><p style="margin:4px 0 0">${jargon.link(r.text, !team, t.id)}</p></div>`
    ).join("");
    const events = t.events.map((e) => `<div class="pek-event">${esc(e.text)}</div>`).join("");
    if (team) {
      return `<div class="pek-shell"><div class="pek-topbar"><button class="pek-back" data-action="team-inbox"><i class="ti ti-arrow-left"></i></button> Tråd #${n} ${statusBadge(t.status)}</div>
        <div class="pek-thread-grid"><div class="pek-thread-main"><p><strong>${esc(t.author)}</strong> · ${esc(t.pin)}</p><p>${esc(t.text)}</p>${events}${replies}
        <form class="team-reply-form"><textarea name="reply" placeholder="Svar…" style="width:100%;min-height:64px"></textarea><button type="submit">Send</button></form></div>
        <div class="pek-thread-sidebar"><label>Status</label><select data-action="status-select" data-id="${t.id}">
          <option value="open"${t.status==="open"?" selected":""}>Åpen</option>
          <option value="in_progress"${t.status==="in_progress"?" selected":""}>I arbeid</option>
          <option value="resolved"${t.status==="resolved"?" selected":""}>Løst</option></select></div></div></div>`;
    }
    return `<div class="pek-shell"><div class="pek-topbar"><button class="pek-back" data-action="go-inbox"><i class="ti ti-arrow-left"></i> Innboks</button></div>
      <div style="padding:16px"><p class="meta">${t.surface === "figma" ? "Figma" : "Staging"} · ${esc(t.page)}</p>
      <p style="font-size:15px;line-height:1.5">${jargon.link(t.text, true, t.id)}</p>${events}${replies}
      <p style="font-size:11px;color:var(--color-text-tertiary);margin-top:12px">Trykk på stiplet ord for forklaring</p></div></div>`;
  }

  function renderTermPopover() {
    if (!state.termPopover) return "";
    const thread = store.threadById(state.termPopover.threadId);
    const term = state.termPopover.term;
    return `<div class="pek-term-backdrop" data-action="close-term"></div>
      <div class="pek-term-popover" style="left:${state.termPopover.x}px;top:${state.termPopover.y}px">
        <button type="button" class="close" data-action="close-term">×</button>
        <p style="font-size:10px;color:var(--color-text-info);margin:0 0 6px"><i class="ti ti-sparkles"></i> AI-forklaring</p>
        <p style="margin:0">${esc(jargon.explain(term, thread, state))}</p>
      </div>`;
  }

  function renderDemoBar() {
    return `<div class="pek-demo-bar"><strong>Pek demo v2</strong><span class="muted">Staging + Figma</span><span class="spacer"></span>
      <button type="button" data-action="role-customer">Kunde</button>
      <button type="button" data-action="role-team">TRY</button>
      <button type="button" data-action="simulate-reply">Simuler svar</button>
      <button type="button" class="primary" data-action="reset">Nullstill</button></div>`;
  }

  function render() {
    const root = document.getElementById("pek-root");
    if (!root) return;
    let main;
    if (state.role === "team") {
      main = state.screen === "team-thread" && state.activeThreadId ? renderThread(true) : renderInbox(true);
    } else if (!state.userName || state.screen === "landing") main = renderLanding();
    else if (state.screen === "coach") main = renderCoach();
    else if (state.screen === "inbox") main = renderInbox(false);
    else if (state.screen === "thread") main = renderThread(false);
    else main = renderViewer();
    root.innerHTML = renderDemoBar() + main + renderTermPopover();
    bindEvents();
  }

  function bindEvents() {
    document.querySelectorAll("[data-action]").forEach((el) => el.addEventListener("click", onAction));
    document.querySelectorAll("[data-surface-click]").forEach((el) => el.addEventListener("click", onSurfaceClick));
    document.getElementById("pek-name")?.addEventListener("keydown", (e) => {
      if (e.key === "Enter") enterProject(e.target.value);
    });
    document.querySelector(".pek-composer textarea")?.addEventListener("input", (e) => {
      if (state.composer) state.composer.text = e.target.value;
    });
    document.querySelector(".team-reply-form")?.addEventListener("submit", (e) => {
      e.preventDefault();
      addTeamReply(state.activeThreadId, e.target.querySelector('[name="reply"]').value, false);
    });
    document.querySelector("[data-action='status-select']")?.addEventListener("change", (e) => {
      const t = store.threadById(e.target.dataset.id);
      if (t) { t.status = e.target.value; save(); render(); }
    });
  }

  function onAction(e) {
    const el = e.target.closest("[data-action]");
    if (!el) return;
    const a = el.dataset.action;
    const id = el.dataset.id;
    if (a === "explain-term") {
      e.stopPropagation();
      const rect = el.getBoundingClientRect();
      set({ termPopover: { term: el.dataset.term, threadId: el.dataset.threadId || state.activeThreadId, x: rect.left, y: rect.bottom + 6 } });
      render();
      return;
    }
    if (a === "close-term") { e.stopPropagation(); set({ termPopover: null }); render(); return; }
    if (a === "enter") { enterProject(document.getElementById("pek-name")?.value || ""); return; }
    if (a === "finish-coach") { finishCoach(); return; }
    if (a === "cancel-composer") { set({ composer: null }); render(); return; }
    if (a === "submit-comment") {
      const ta = document.querySelector(".pek-composer textarea");
      if (ta && state.composer) state.composer.text = ta.value;
      submitComment();
      return;
    }
    if (a === "set-surface") { set({ activeSurface: el.dataset.surface, composer: null }); render(); return; }
    if (a === "set-frame") { set({ activeFigmaFrame: el.dataset.frame, composer: null }); render(); return; }
    if (a === "figma-embed") { set({ figmaMode: "embed", figmaExplore: false }); render(); return; }
    if (a === "figma-mock") { set({ figmaMode: "mock" }); render(); return; }
    if (a === "toggle-figma-explore") { set({ figmaExplore: !state.figmaExplore, composer: null }); render(); return; }
    if (a === "device-desktop") { set({ device: "desktop" }); render(); return; }
    if (a === "device-mobile") { set({ device: "mobile" }); render(); return; }
    if (a === "go-inbox") { navigate("inbox"); return; }
    if (a === "viewer") { navigate("viewer"); return; }
    if (a === "open-thread") { navigate(state.role === "team" ? "team-thread" : "thread", id); return; }
    if (a === "role-customer") { set({ role: "customer", screen: state.userName ? "viewer" : "landing" }); render(); return; }
    if (a === "role-team") { set({ role: "team", screen: "team-inbox" }); render(); return; }
    if (a === "simulate-reply") { simulateReply(); return; }
    if (a === "reset") { if (confirm("Nullstille?")) { store.reset(); state = store.get(); render(); } return; }
    if (a === "team-inbox") { navigate("team-inbox"); return; }
  }

  render();
})();
