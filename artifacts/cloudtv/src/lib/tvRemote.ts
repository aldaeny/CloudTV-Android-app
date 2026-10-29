/** D-pad / remote support: arrow keys move focus spatially, Enter activates. */
const SELECTOR = 'button, a[href], input, select, textarea, [role="button"], [tabindex]:not([tabindex="-1"])';

function candidates(): HTMLElement[] {
  return Array.from(document.querySelectorAll<HTMLElement>(SELECTOR)).filter((el) => {
    if ((el as HTMLButtonElement).disabled) return false;
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  });
}

export function installTvRemote(): () => void {
  function onKey(e: KeyboardEvent) {
    const dir =
      e.key === "ArrowUp" ? "up" : e.key === "ArrowDown" ? "down" : e.key === "ArrowLeft" ? "left" : e.key === "ArrowRight" ? "right" : null;
    const active = document.activeElement as HTMLElement | null;
    if (!dir) {
      if (e.key === "Enter" && active && active !== document.body && active.getAttribute("role") === "button") {
        e.preventDefault();
        active.click();
      }
      return;
    }
    if (active && /^(INPUT|TEXTAREA)$/.test(active.tagName) && (dir === "left" || dir === "right")) return;
    const list = candidates();
    if (!list.length) return;
    if (!active || active === document.body || !list.includes(active)) {
      e.preventDefault();
      list[0].focus();
      return;
    }
    const from = active.getBoundingClientRect();
    const fx = from.left + from.width / 2;
    const fy = from.top + from.height / 2;
    let best: HTMLElement | null = null;
    let bestScore = Infinity;
    for (const el of list) {
      if (el === active) continue;
      const r = el.getBoundingClientRect();
      const dx = r.left + r.width / 2 - fx;
      const dy = r.top + r.height / 2 - fy;
      const main = dir === "up" ? -dy : dir === "down" ? dy : dir === "left" ? -dx : dx;
      if (main <= 1) continue;
      const cross = dir === "up" || dir === "down" ? Math.abs(dx) : Math.abs(dy);
      const score = main + cross * 2;
      if (score < bestScore) {
        bestScore = score;
        best = el;
      }
    }
    if (best) {
      e.preventDefault();
      best.focus();
      best.scrollIntoView({ block: "nearest", inline: "nearest" });
    }
  }
  window.addEventListener("keydown", onKey);
  return () => window.removeEventListener("keydown", onKey);
}

export function isTvDevice(): boolean {
  return /Android TV|AFTT|SmartTV|GoogleTV|BRAVIA|AFTM|AFTB/i.test(navigator.userAgent);
}
