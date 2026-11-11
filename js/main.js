// ============================================================
//  主程式：依照片日期排出每一幕，串起片頭、擎天崗和結尾
// ============================================================

const $ = (id) => document.getElementById(id);
function make(tag, className, text) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (text !== undefined) el.textContent = text;
  return el;
}
const MONTHS_EN = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

// ---------- 1. 片頭 ----------
$("opening-photo").style.backgroundImage = `url(${FILM.hero})`;
$("op-by").textContent = CONTENT.opening.by;
$("op-star").textContent = CONTENT.opening.starring;
$("op-title").textContent = CONTENT.opening.title;
$("op-title-en").textContent = CONTENT.opening.titleEn;

// ---------- 2. 照片依月份分組 ----------
const groups = {};
PHOTOS.forEach((photo, index) => {
  photo.index = index;
  const key = photo.date ? photo.date.slice(0, 7) : "extra";
  (groups[key] = groups[key] || []).push(photo);
});
const months = Object.keys(groups).filter((k) => k !== "extra").sort();
if (groups.extra) months.push("extra");

// 一幕：場記 → 月份 → 顯影的大照片 → 可以滑的底片條
function scene(no, key, photos) {
  const sec = make("section", "scene reveal");
  sec.appendChild(make("p", "slate-line", `SCENE ${no}`));
  const head = make("h2", "scene-title");
  if (key === "extra") head.appendChild(make("span", "m", "Moments"));
  else {
    const [y, m] = key.split("-");
    head.append(make("span", "m", MONTHS_EN[Number(m) - 1]), make("span", "y", y));
  }
  sec.appendChild(head);

  const first = photos[0];
  const frame = make("button", "develop-frame");
  const img = make("img");
  img.src = first.file;
  img.alt = "";
  frame.appendChild(img);
  frame.addEventListener("click", () => openLightbox(first.index));
  sec.appendChild(frame);
  addDevelop(frame, img);

  if (photos.length > 1) {
    const wrap = make("div", "strip-wrap");
    const strip = make("div", "strip");
    strip.appendChild(make("span", "pad"));
    photos.slice(1).forEach((ph) => {
      const b = make("button");
      const im = make("img");
      im.src = ph.file;
      im.loading = "lazy";
      im.alt = "";
      im.style.aspectRatio = `${ph.w} / ${ph.h}`;
      b.appendChild(im);
      b.addEventListener("click", () => openLightbox(ph.index));
      strip.appendChild(b);
    });
    strip.appendChild(make("span", "pad"));
    wrap.appendChild(strip);
    sec.appendChild(wrap);
    sec.appendChild(make("p", "strip-count", `← ${photos.length - 1}`));
  }
  return sec;
}

// 擎天崗：全寬照片一張一張浮現
function feature() {
  const f = CONTENT.feature;
  const sec = make("section", "feature");
  const head = make("div", "feature-head reveal");
  head.append(make("p", "label", f.label), make("h2", "", f.title), make("p", "date", f.date));
  sec.appendChild(head);
  FILM.feature.forEach((src) => {
    const shot = make("figure", "shot");
    const img = make("img");
    img.src = src;
    img.loading = "lazy";
    img.alt = "";
    shot.appendChild(img);
    sec.appendChild(shot);
  });
  return sec;
}

const scenes = $("scenes");
months.forEach((m, i) => {
  scenes.appendChild(scene(String(i + 1).padStart(2, "0"), m, groups[m]));
  if (m === "2026-08") scenes.appendChild(feature());
});
if (!months.includes("2026-08")) scenes.appendChild(feature());

// ---------- 3. 吹蠟燭 → 片尾名單 ----------
const F = CONTENT.finale;
$("finale-title").textContent = F.title;
$("blow-btn").textContent = F.start;
$("finale-hint").textContent = F.tapHint;
$("blow-btn").addEventListener("click", async (e) => {
  e.stopPropagation();
  const ok = await startBlow();
  $("blow-btn").textContent = ok ? "對著手機用力吹 ～" : "改用手指點火焰吧";
});
window.onCandlesOut = () => {
  const roll = $("roll");
  roll.innerHTML = "";
  roll.appendChild(make("p", "msg", F.message));
  CONTENT.credits.forEach((c) => roll.append(make("p", "role", c.role), make("p", "name", c.name)));
  roll.appendChild(make("p", "end", CONTENT.theEnd));
  const again = make("button", "btn again", F.again);
  again.addEventListener("click", (e) => {
    e.stopPropagation();
    $("end-roll").hidden = true;
    resetCandles();
  });
  roll.appendChild(again);
  $("end-bg").style.backgroundImage = `url(${FILM.ending})`;
  $("end-roll").hidden = false;
};

// ---------- 捲到才出現 ----------
const io = new IntersectionObserver((entries) => {
  entries.forEach((en) => {
    if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
  });
}, { threshold: 0.15 });
document.querySelectorAll(".reveal, .shot").forEach((el) => io.observe(el));

// ---------- 點照片放大（可左右滑） ----------
let current = 0;
function showPhoto(i) {
  current = (i + PHOTOS.length) % PHOTOS.length;
  const ph = PHOTOS[current];
  $("lb-img").src = ph.file;
  $("lb-caption").textContent = ph.date ? ph.date.replaceAll("-", ".") : "";
}
function openLightbox(i) { showPhoto(i); $("lightbox").hidden = false; }
function closeLightbox() { $("lightbox").hidden = true; }
$("lb-close").addEventListener("click", closeLightbox);
$("lb-prev").addEventListener("click", () => showPhoto(current - 1));
$("lb-next").addEventListener("click", () => showPhoto(current + 1));
$("lightbox").addEventListener("click", (e) => { if (e.target.id === "lightbox") closeLightbox(); });
document.addEventListener("keydown", (e) => {
  if ($("lightbox").hidden) return;
  if (e.key === "Escape") closeLightbox();
  if (e.key === "ArrowLeft") showPhoto(current - 1);
  if (e.key === "ArrowRight") showPhoto(current + 1);
});
let touchX = null;
$("lightbox").addEventListener("touchstart", (e) => (touchX = e.touches[0].clientX), { passive: true });
$("lightbox").addEventListener("touchend", (e) => {
  if (touchX === null) return;
  const dx = e.changedTouches[0].clientX - touchX;
  if (Math.abs(dx) > 50) showPhoto(current + (dx < 0 ? 1 : -1));
  touchX = null;
});
