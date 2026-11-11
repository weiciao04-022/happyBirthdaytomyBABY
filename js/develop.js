// ============================================================
//  底片顯影：照片先是橘色的「負片」，捲到畫面上時會慢慢顯影成真正的照片
//  用法：addDevelop(框框元素, 照片元素)
// ============================================================

function addDevelop(frame, img) {
  const canvas = document.createElement("canvas");
  frame.appendChild(canvas);
  const ctx = canvas.getContext("2d");
  let painted = false, started = false;

  function paint() {
    const r = frame.getBoundingClientRect();
    if (painted || r.width < 10 || !img.complete || !img.naturalWidth) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const w = r.width, h = r.height;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    // 照片（像 object-fit: cover 一樣裁切）
    const s = Math.max(w / img.naturalWidth, h / img.naturalHeight);
    const iw = img.naturalWidth * s, ih = img.naturalHeight * s;
    ctx.drawImage(img, (w - iw) / 2, (h - ih) / 2, iw, ih);
    // 反相：用白色做「差異」混合
    ctx.globalCompositeOperation = "difference";
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, w, h);
    // 底片的橘色片基
    ctx.globalCompositeOperation = "multiply";
    ctx.fillStyle = "#e0915a";
    ctx.fillRect(0, 0, w, h);
    painted = true;
  }

  // 捲到一半以上 → 等一下下 → 慢慢顯影
  new IntersectionObserver(([en], obs) => {
    paint();
    if (!en.isIntersecting || started || !painted) return;
    started = true;
    obs.disconnect();
    setTimeout(() => {
      canvas.classList.add("gone");
      setTimeout(() => canvas.remove(), 4000);
    }, 700);
  }, { threshold: 0.55 }).observe(frame);

  img.addEventListener("load", paint);
}
