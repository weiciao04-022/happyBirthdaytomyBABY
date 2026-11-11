// ============================================================
//  結尾：生日蛋糕＋蠟燭
//  startBlow() 打開麥克風，對手機吹氣就能吹熄蠟燭；也可以直接點火焰
//  全部吹熄 → 愛心煙火 → 呼叫 window.onCandlesOut()（main.js 會播片尾名單）
// ============================================================

new p5((p) => {
  const box = document.getElementById("finale");
  const N = CONTENT.finale.candles || 5;
  let candles = [];
  const smoke = [];
  const sparks = [];
  const queue = [];
  let analyser = null, buf = null, blowPower = 0, level = 0;
  let allOut = false;
  let glow = 1; // 蠟燭的光，吹熄會慢慢變暗

  const cake = () => ({ x: p.width / 2, y: p.height * 0.72, w: Math.min(p.width * 0.62, 260) });

  function layout() {
    const c = cake();
    candles = Array.from({ length: N }, (_, i) => ({
      x: c.x - c.w * 0.26 + (c.w * 0.52 * i) / Math.max(1, N - 1),
      y: c.y - c.w * 0.52 - 30 - (i % 2) * 5, // 插在上層蛋糕上
      lit: candles[i] ? candles[i].lit : true,
      seed: p.random(1000),
    }));
  }

  function drawCake() {
    const c = cake();
    const W = c.w, x = c.x, y = c.y;
    p.noStroke();
    // 盤子
    p.fill(60, 56, 50);
    p.ellipse(x, y + 6, W * 1.25, 26);
    // 下層
    p.fill(236, 222, 204);
    p.rect(x - W / 2, y - W * 0.3, W, W * 0.3, 6);
    p.ellipse(x, y - W * 0.3, W, 22);
    // 上層
    const tw = W * 0.72;
    p.fill(242, 214, 210);
    p.rect(x - tw / 2, y - W * 0.52, tw, W * 0.24, 6);
    p.ellipse(x, y - W * 0.52, tw, 18);
    // 奶油滴下來
    p.fill(250, 244, 236);
    for (let i = 0; i < 9; i++) {
      const dx = x - tw / 2 + 8 + (i * (tw - 16)) / 8;
      p.ellipse(dx, y - W * 0.5 + (i % 3) * 3, 12, 14 + (i % 3) * 6);
    }
    // 小愛心裝飾
    p.fill(217, 113, 111);
    for (let i = 0; i < 5; i++) {
      p.push();
      p.translate(x - W * 0.36 + (i * W * 0.72) / 4, y - W * 0.14);
      drawHeart(p, 7);
      p.pop();
    }
  }

  function drawCandles() {
    const ctx = p.drawingContext;
    for (const cd of candles) {
      // 蠟燭本體（細細的條紋）
      p.noStroke();
      p.fill(245, 240, 230);
      p.rect(cd.x - 4, cd.y, 8, 34, 2);
      p.fill(226, 192, 141);
      for (let k = 0; k < 4; k++) p.rect(cd.x - 4, cd.y + 4 + k * 8, 8, 3);
      p.stroke(40);
      p.strokeWeight(1.5);
      p.line(cd.x, cd.y, cd.x, cd.y - 6);
      if (!cd.lit) continue;
      // 火焰：會晃，吹氣時晃更大
      const t = p.frameCount * 0.15 + cd.seed;
      const sway = Math.sin(t) * 1.5 + level * 40 * Math.sin(t * 3);
      const fh = 18 + Math.sin(t * 1.7) * 2 - level * 20;
      const fx = cd.x + sway, fy = cd.y - 8 - fh / 2;
      const g = ctx.createRadialGradient(fx, fy, 0, fx, fy, 46);
      g.addColorStop(0, "rgba(255,200,120,0.45)");
      g.addColorStop(1, "rgba(255,200,120,0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(fx, fy, 46, 0, Math.PI * 2);
      ctx.fill();
      p.noStroke();
      p.fill(255, 170, 70);
      p.ellipse(fx, fy, 10, Math.max(6, fh));
      p.fill(255, 245, 210);
      p.ellipse(fx, fy + 3, 5, Math.max(3, fh * 0.5));
    }
  }

  function blowOut(cd) {
    if (!cd.lit) return;
    cd.lit = false;
    for (let i = 0; i < 14; i++) smoke.push({ x: cd.x, y: cd.y - 10, vx: p.random(-0.3, 0.3), vy: p.random(-1.2, -0.6), a: 120, r: p.random(4, 8) });
    if (candles.every((c) => !c.lit) && !allOut) {
      allOut = true;
      document.getElementById("finale-ui").classList.add("hide");
      setTimeout(launchHearts, 1200);
    }
  }

  // 愛心形狀的煙火
  const hx = (t) => 16 * Math.pow(Math.sin(t), 3);
  const hy = (t) => -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
  function burst(x, y, scale, big) {
    const cols = ["#ece6da", "#e2c08d", "#f2b8b5", "#e8919a"];
    const n = big ? 160 : 90;
    for (let i = 0; i < n; i++) {
      const t = (i / n) * p.TWO_PI;
      const s = scale / 16;
      sparks.push({ x, y, vx: hx(t) * s, vy: hy(t) * s, life: 1, c: p.color(p.random(cols)) });
    }
    const r = box.getBoundingClientRect();
    heartBurst(r.left + x, r.top + y, big ? 50 : 12, big ? 1.6 : 0.8);
  }
  function launchHearts() {
    const now = p.millis();
    for (let i = 0; i < 7; i++) queue.push({ at: now + i * 520, x: p.random(p.width * 0.2, p.width * 0.8), y: p.random(p.height * 0.15, p.height * 0.4), s: p.random(4, 6), big: false });
    queue.push({ at: now + 7 * 520 + 500, x: p.width / 2, y: p.height * 0.3, s: Math.min(10, p.width / 45), big: true });
    setTimeout(() => window.onCandlesOut && window.onCandlesOut(), 7 * 520 + 2600);
  }

  window.startBlow = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const ac = new (window.AudioContext || window.webkitAudioContext)();
      analyser = ac.createAnalyser();
      analyser.fftSize = 512;
      buf = new Uint8Array(analyser.fftSize);
      ac.createMediaStreamSource(stream).connect(analyser);
      return true;
    } catch (e) {
      return false; // 不能用麥克風就只能點火焰
    }
  };

  window.resetCandles = () => {
    allOut = false;
    glow = 1;
    candles.forEach((c) => (c.lit = true));
    document.getElementById("finale-ui").classList.remove("hide");
  };

  p.setup = () => {
    const c = p.createCanvas(box.clientWidth, box.clientHeight);
    c.parent("finale-canvas");
    p.pixelDensity(Math.min(2, window.devicePixelRatio || 1));
    layout();
    // 點火焰也能吹熄
    box.addEventListener("pointerdown", (e) => {
      const r = box.getBoundingClientRect();
      const x = e.clientX - r.left, y = e.clientY - r.top;
      for (const cd of candles) if (cd.lit && Math.hypot(cd.x - x, cd.y - 18 - y) < 34) { blowOut(cd); break; }
    });
    new IntersectionObserver(([en]) => (en.isIntersecting ? p.loop() : p.noLoop())).observe(box);
  };

  p.draw = () => {
    p.background(7, 7, 6);
    // 麥克風音量
    if (analyser) {
      analyser.getByteTimeDomainData(buf);
      let sum = 0;
      for (const v of buf) sum += ((v - 128) / 128) ** 2;
      level = p.lerp(level, Math.sqrt(sum / buf.length), 0.4);
      blowPower = level > 0.1 ? blowPower + level : blowPower * 0.9;
      if (blowPower > 1.2) {
        const lit = candles.filter((c) => c.lit);
        if (lit.length) blowOut(p.random(lit));
        blowPower = 0.4;
      }
    } else level *= 0.9;

    // 暖暖的燭光照亮四周
    const lit = candles.filter((c) => c.lit).length;
    glow = p.lerp(glow, lit / N, 0.05);
    const ctx = p.drawingContext;
    const c = cake();
    const g = ctx.createRadialGradient(c.x, c.y - c.w * 0.6, 0, c.x, c.y - c.w * 0.6, p.height * 0.7);
    g.addColorStop(0, `rgba(255,190,120,${0.22 * glow})`);
    g.addColorStop(1, "rgba(255,190,120,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, p.width, p.height);

    drawCake();
    drawCandles();

    for (let i = smoke.length - 1; i >= 0; i--) {
      const s = smoke[i];
      s.x += s.vx + Math.sin(p.frameCount * 0.05 + i) * 0.3;
      s.y += s.vy;
      s.r += 0.15;
      s.a -= 1.2;
      p.noStroke();
      p.fill(200, 200, 200, s.a);
      p.circle(s.x, s.y, s.r);
      if (s.a <= 0) smoke.splice(i, 1);
    }

    const now = p.millis();
    while (queue.length && queue[0].at <= now) { const q = queue.shift(); burst(q.x, q.y, q.s, q.big); }
    p.blendMode(p.ADD);
    for (let i = sparks.length - 1; i >= 0; i--) {
      const s = sparks[i];
      s.vx *= 0.975;
      s.vy = s.vy * 0.975 + 0.03;
      s.x += s.vx;
      s.y += s.vy;
      s.life -= 0.011;
      s.c.setAlpha(255 * s.life);
      p.stroke(s.c);
      p.strokeWeight(2.6);
      p.point(s.x, s.y);
      if (s.life <= 0) sparks.splice(i, 1);
    }
    p.blendMode(p.BLEND);
  };

  p.windowResized = () => {
    if (Math.abs(box.clientWidth - p.width) < 2) return;
    p.resizeCanvas(box.clientWidth, box.clientHeight);
    layout();
  };
});
