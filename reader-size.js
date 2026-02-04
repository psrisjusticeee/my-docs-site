(function () {
  const KEY = "novel.baseFontPx";
  const MIN = 14, MAX = 22, STEP = 1;
  const root = document.documentElement;

  function apply(px) { root.style.fontSize = px + "px"; }
  function load() { return Math.min(MAX, Math.max(MIN, +(localStorage.getItem(KEY) || 18))); }

  function mount() {
    const wrap = document.createElement("div");
    wrap.style.display = "flex"; wrap.style.gap = "6px"; wrap.style.marginLeft = "8px";

    const minus = document.createElement("button"); minus.textContent = "A-";
    const plus  = document.createElement("button"); plus.textContent  = "A+";
    [minus, plus].forEach(b => { b.style.padding = "2px 6px"; b.style.borderRadius = "6px"; });

    let val = load(); apply(val);
    minus.onclick = () => { val = Math.max(MIN, val - STEP); localStorage.setItem(KEY, val); apply(val); };
    plus.onclick  = () => { val = Math.min(MAX, val + STEP); localStorage.setItem(KEY, val); apply(val); };

    (document.querySelector(".md-header__inner") || document.body).appendChild(wrap);
    wrap.append(minus, plus);
  }

  document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", mount) : mount();
})();

