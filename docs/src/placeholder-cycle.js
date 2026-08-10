export const PLACEHOLDER_PHRASES = [
  "比如：我又熬夜了 / 下雨没带伞 / 今天被夸了",
  "写下一件今天的小事，越具体越好。",
  "不用很正式，一句话也可以。",
  "收银员正在等你的今日故事。"
];

export function nextPhraseIndex(currentIndex, length) {
  return (currentIndex + 1) % length;
}

export function shouldShowPlaceholder(value) {
  return String(value ?? "").trim().length === 0;
}

export function createPlaceholderCycler({
  phrases = PLACEHOLDER_PHRASES,
  element,
  intervalMs = 2600,
  setIntervalFn = globalThis.setInterval,
  clearIntervalFn = globalThis.clearInterval
} = {}) {
  let index = 0;
  let timer = null;

  const render = () => {
    if (!element) return;
    element.textContent = phrases[index % phrases.length];
    element.classList?.remove("is-flipping");
    if (element.offsetWidth !== undefined) void element.offsetWidth;
    element.classList?.add("is-flipping");
    index = nextPhraseIndex(index, phrases.length);
  };

  const start = () => {
    if (timer !== null) return timer;
    render();
    timer = setIntervalFn(render, intervalMs);
    return timer;
  };

  const stop = () => {
    if (timer !== null) clearIntervalFn(timer);
    timer = null;
  };

  return {
    start,
    stop,
    render,
    getIndex: () => index
  };
}

export function mountPlaceholderCycler({
  input,
  overlay,
  phrase,
  phrases = PLACEHOLDER_PHRASES,
  documentRef = globalThis.document,
  setIntervalFn,
  clearIntervalFn
} = {}) {
  const cycler = createPlaceholderCycler({
    element: phrase,
    phrases,
    setIntervalFn,
    clearIntervalFn
  });

  const sync = () => {
    const visible = shouldShowPlaceholder(input?.value ?? "");
    overlay?.classList?.toggle?.("is-visible", visible);
    overlay?.setAttribute?.("aria-hidden", String(!visible));
  };

  input?.addEventListener?.("input", sync);
  input?.addEventListener?.("focus", sync);
  input?.addEventListener?.("blur", sync);
  sync();
  cycler.start();

  return { cycler, sync };
}