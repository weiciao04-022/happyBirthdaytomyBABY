// ============================================================
//  片頭動畫：陽光裡飄的光點和散景（bokeh）
//  手指劃過 → 光點被輕輕帶走
// ============================================================

new p5((p) => {
  const box = document.getElementById("opening");
  const motes = [];
  let pointer = null;

  class Mote {
    constructor() {
      this.x = p.random(p.width);
      this.y = p.random(p.height);
      this.bokeh = p.random() < 0.12;           // 少數是大的、糊糊的散景
      this.r = this.bokeh ? p.random(14, 34) : p.random(0.8, 2.6);
      this.vx = p.random(-0.15, 0.15);
      this.vy = p.random(-0.35, -0.05);
      this.phase = p.random(p.TWO_PI);
      this.warm = p.random() < 0.6;
    }
    update() {
      this.x += this.vx + Math.sin(p.frameCount * 0.01 + this.phase) * 0.2;
      this.y += this.vy;
      if (pointer) {
        const dx = this.x - pointer.x, dy = this.y - pointer.y, d = Math.hypot(dx, dy);
        if (d < 120 && d > 0.1) {
          this.vx += (dx / d) * 0.25 + (-dy / d) * 0.15; // 推開＋一點點繞圈
          this.vy += (dy / d) * 0.25 + (dx / d) * 0.15;
        }
      }
      this.vx *= 0.97;
      this.vy = this.vy * 0.97 - 0.004;
      if (this.y < -40) { this.y = p.height + 30; this.x = p.random(p.width); }
      if (this.x < -40) this.x = p.width + 30;
      if (this.x > p.width + 40) this.x = -30;
    }
    draw() {
      const tw = 0.55 + 0.45 * Math.sin(p.frameCount * 0.04 + this.phase);
      const c = this.warm ? [255, 226, 170] : [240, 240, 230];
      if (this.bokeh) {
        for (let i = 3; i > 0; i--) {
          p.fill(...c, 10 * tw);
          p.circle(this.x, this.y, this.r * (0.6 + i * 0.25));
        }
      } else {
        p.fill(...c, 200 * tw);
        p.circle(this.x, this.y, this.r);
      }
    }
  }

  p.setup = () => {
    const c = p.createCanvas(box.clientWidth, box.clientHeight);
    c.parent("dust-canvas");
    p.pixelDensity(Math.min(2, window.devicePixelRatio || 1));
    p.noStroke();
    for (let i = 0; i < 80; i++) motes.push(new Mote());

    const local = (e) => { const r = box.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
    box.addEventListener("pointermove", (e) => (pointer = local(e)));
    box.addEventListener("pointerdown", (e) => (pointer = local(e)));
    ["pointerup", "pointerleave", "pointercancel"].forEach((ev) => box.addEventListener(ev, () => (pointer = null)));
    new IntersectionObserver(([en]) => (en.isIntersecting ? p.loop() : p.noLoop())).observe(box);
  };

  p.draw = () => {
    p.clear();
    p.blendMode(p.ADD);
    for (const m of motes) { m.update(); m.draw(); }
    p.blendMode(p.BLEND);
  };

  p.windowResized = () => p.resizeCanvas(box.clientWidth, box.clientHeight);
});
