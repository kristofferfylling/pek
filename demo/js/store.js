/** State + localStorage (demo v2) */
window.PekStore = (function () {
  const KEY = "pek-demo-v2";
  const cfg = window.PekConfig;

  function defaultState() {
    return {
      userName: "",
      coachSeen: false,
      role: "customer",
      screen: "landing",
      activeSurface: "staging",
      activeFigmaFrame: cfg.figma.frames[0].id,
      figmaMode: "mock",
      figmaExplore: false,
      figmaInputUrl: "",
      figmaEmbedUrl: "",
      device: "desktop",
      eyebrow: "NYHET",
      threads: [],
      welcomeDismissed: false,
      visitCount: 0,
      activeThreadId: null,
      composer: null,
      toast: null,
      termPopover: null,
    };
  }

  let state = load();

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return defaultState();
      return { ...defaultState(), ...JSON.parse(raw) };
    } catch {
      return defaultState();
    }
  }

  function save() {
    localStorage.setItem(KEY, JSON.stringify(state));
  }

  function reset() {
    state = defaultState();
    save();
  }

  function get() {
    return state;
  }

  function set(patch) {
    Object.assign(state, patch);
    save();
  }

  function threadById(id) {
    return state.threads.find((t) => t.id === id);
  }

  function pinNumber(thread) {
    return state.threads.indexOf(thread) + 1;
  }

  function threadsForSurface(surface, frameId) {
    return state.threads.filter((t) => {
      if (t.surface !== surface) return false;
      if (surface === "figma" && frameId) return t.frameId === frameId;
      return true;
    });
  }

  function unreadCount() {
    return state.threads.filter((t) => t.hasUnread).length;
  }

  return {
    get,
    set,
    save,
    reset,
    load,
    threadById,
    pinNumber,
    threadsForSurface,
    unreadCount,
    defaultState,
  };
})();
