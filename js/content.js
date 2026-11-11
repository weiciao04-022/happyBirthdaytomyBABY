// ============================================================
//  網站上的文字都在這裡（現在是「只放照片」的版本，不需要寫字）
//  之後想加一句話，改這裡就好
// ============================================================

const CONTENT = {
  // ---- 片頭字幕（一行一行淡入）----
  opening: {
    by: "baby",                  // 會顯示成「A FILM BY ___」
    starring: "北鼻",
    title: "Happy Birthday",     // 片頭最大的字
    titleEn: "生日快樂，北鼻",    // 下面的小字
  },

  // ---- 擎天崗那一幕的標題 ----
  feature: {
    label: "SPECIAL SCREENING",
    title: "擎天崗",
    date: "2026.08.11",
  },

  // ---- 結尾：吹蠟燭 → 煙火 → 片尾名單 ----
  finale: {
    candles: 5, // 蠟燭數量
    title: "許個願吧",
    start: "點我，然後對著手機吹氣",
    tapHint: "也可以直接點火焰把蠟燭吹熄",
    message: "Happy Birthday",
    again: "再看一次",
  },

  // ---- 片尾名單：會從下往上捲 ----
  credits: [
    { role: "A Film By", name: "baby" },
    { role: "Starring", name: "北鼻" },
  ],
  theEnd: "To be continued…",
};
