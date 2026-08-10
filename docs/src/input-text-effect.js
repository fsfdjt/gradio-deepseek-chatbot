export function getNewCharacterStart(previousValue, nextValue) {
  const previous = String(previousValue ?? "");
  const next = String(nextValue ?? "");
  let index = 0;

  while (
    index < previous.length &&
    index < next.length &&
    previous[index] === next[index]
  ) {
    index += 1;
  }

  return index;
}

export function renderTypingEffect({ container, value, previousValue = "", documentRef = globalThis.document } = {}) {
  if (!container || !documentRef?.createElement) return;

  const nextValue = String(value ?? "");
  const newStart = getNewCharacterStart(previousValue, nextValue);
  container.replaceChildren?.();
  container.textContent = "";
  container.setAttribute?.("aria-hidden", String(nextValue.length === 0));

  for (const [index, character] of Array.from(nextValue).entries()) {
    const span = documentRef.createElement("span");
    span.textContent = character === "\n" ? "\n" : character;
    if (index >= newStart) span.classList?.add("is-new-char");
    container.appendChild?.(span);
  }
}

export function mountTypingEffect({ input, container, documentRef = globalThis.document } = {}) {
  let previousValue = input?.value ?? "";

  const sync = () => {
    const nextValue = input?.value ?? "";
    renderTypingEffect({
      container,
      value: nextValue,
      previousValue,
      documentRef
    });
    previousValue = nextValue;
  };

  input?.addEventListener?.("input", sync);
  sync();

  return { sync };
}