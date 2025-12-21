(function () {
  // List the display name and the CSS font-family string
  const FONTS = [
//    ["文悦玄鹤古雅宋", '"WenYueXHGuYaSongJRFC", "Noto Serif SC", serif'],
    ["古典课本文宋", '"AaGuDianKeBenSong", "Noto Serif SC", serif'],
 //   ["兰宋", '"AaLanSong", "Noto Serif SC", serif'],
 //   ["汉仪报宋简", '"HanYiBaoSongJian", "Noto Serif SC", serif'],
 //   ["汉仪书宋一繁", '"HanYiShuSongYiFan", "Noto Serif SC", serif'],
//    ["汉仪书宋一简", '"HanYiShuSongYiJian", "Noto Serif SC", serif'],
	["方正宋一简", '"FZSongYi", "Noto Serif SC", serif'],
  ["文悦仿宋", '"WenYueGuTiFangSong", "Noto Serif SC", serif'],
 //   ["华光古韵宋", '"HuaGuangGuYunSong", "Noto Serif SC", serif'],
 //   ["灵动汽澈醇棠", '"LingDongQiCheChunTang", "Noto Serif SC", serif'],
 //   ["青鸟华光简报宋一", '"QingNiaoHuaGuangJianBaoSongYi", "Noto Serif SC", serif'],
 //   ["书宋简体", '"TTShuSongJ", "Noto Serif SC", serif'],
  ];

  const KEY = "novel.bodyFont";

  function applyFont(cssStack) {
  document.documentElement.style.setProperty("--body-font", cssStack);
  document.documentElement.style.setProperty("--md-text-font", cssStack);
  document.documentElement.style.setProperty("--ui-font", cssStack);
}


  function createPicker() {
    const select = document.createElement("select");
    select.setAttribute("id", "font-picker");
    select.style.marginLeft = "0.75rem";
    select.style.padding = "0.25rem 0.5rem";
    select.style.borderRadius = "6px";

    FONTS.forEach(([label, css]) => {
      const opt = document.createElement("option");
      opt.value = css; opt.textContent = label; select.appendChild(opt);
    });

    const saved = localStorage.getItem(KEY);
    if (saved) { select.value = saved; applyFont(saved); }

    select.addEventListener("change", () => {
      const val = select.value;
      localStorage.setItem(KEY, val);
      applyFont(val);
    });
    return select;
  }

  function mountPicker() {
    // Try to place next to the theme toggle if present
    const header = document.querySelector(".md-header__inner");
    if (!header) return;
    const container = document.createElement("div");
    container.className = "font-picker-wrapper";
    container.style.display = "flex";
    container.style.alignItems = "center";
    container.title = "选择正文字体";
    container.appendChild(createPicker());
    header.appendChild(container);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mountPicker);
  } else {
    mountPicker();
  }
})();

