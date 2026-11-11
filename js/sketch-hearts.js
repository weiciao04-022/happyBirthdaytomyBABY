// ============================================================
//  愛心噴發層：點畫面任何地方都會噴愛心，按住不放會一直噴
//  其他程式可以呼叫 heartBurst(x, y, 數量, 力道) 來噴愛心
// ============================================================

const HEART_COLORS = ["#f2b8b5", "#e8919a", "#ece6da", "#e2c08d", "#d9716f"];

// 畫一顆愛心（中心在 0,0，大小 s）
function drawHeart(p, s) {
  p.beginShape();
  p.vertex(0, s * 0.35);
  p.bezierVertex(-s * 1.1, -s * 0.35, -s * 0.45, -s * 1.05, 0, -s * 0.45);
  p.bezierVertex(s * 0.45, -s * 1.05, s * 1.1, -s * 0.35, 0, s * 0.35);
  p.endShape(p.CLOSE);
}

let heartBurst = () => {}; // 先占位，p5 準備好之後會換成真的

new p5((p) => {
  const hearts = [];
  let holding = null; // 按住時記錄位置

  class Heart {
    constructor(x, y, power) {
      this.x = x;
      this.y = y;
      const angle = p.random(-p.PI * 0.95, -p.PI * 0.05); // 往上半圈噴
      const speed = p.random(2, 9) * power;
      this.vx = Math.cos(angle) * speed;
      this.vy = Math.sin(angle) * speed;
      this.size = p.random(6, 16);
      this.rot = p.random(-0.5, 0.5);
      this.spin = p.random(-0.08, 0.08);
      this.life = 1;
      this.decay = p.random(0.008, 0.016);
      this.color = p.color(p.random(HEART_COLORS));
      this.wobble = p.random(1000);
    }
    update() {
      this.vy += 0.18; // 重力
      this.vx *= 0.985;
      this.vy *= 0.985;
      this.x += this.vx + Math.sin(p.frameCount * 0.1 + this.wobble) * 0.4;
      this.y += this.vy;
      this.rot += this.spin;
      this.life -= this.decay;
    }
    draw() {
      p.push();
      p.translate(this.x, this.y);
      p.rotate(this.rot);
      this.color.setAlpha(255 * Math.min(1, this.life * 1.5));
      p.fill(this.color);
      drawHeart(p, this.size * (0.6 + this.life * 0.4));
      p.pop();
    }
  }

  heartBurst = (x, y, count = 18, power = 1) => {
    for (let i = 0; i < count; i++) hearts.push(new Heart(x, y, power));
    if (hearts.length > 900) hearts.splice(0, hearts.length - 900);
    p.loop();
  };

  p.setup = () => {
    const c = p.createCanvas(p.windowWidth, p.windowHeight);
    c.parent("hearts-layer");
    p.pixelDensity(Math.min(2, window.devicePixelRatio || 1));
    p.noStroke();
    p.noLoop();

    // 點一下噴一把；按住不放就持續噴
    document.addEventListener("pointerdown", (e) => {
      if (e.target.closest(".lightbox, .game-box.playing, .develop-frame")) return; // 這些地方手指要拿來玩，不噴愛心
      heartBurst(e.clientX, e.clientY, 16, 1);
      holding = { x: e.clientX, y: e.clientY, start: p.millis() };
    });
    document.addEventListener("pointermove", (e) => {
      if (holding) { holding.x = e.clientX; holding.y = e.clientY; }
    });
    ["pointerup", "pointercancel", "pointerleave"].forEach((ev) =>
      document.addEventListener(ev, () => (holding = null))
    );
  };

  p.draw = () => {
    p.clear();
    // 按住超過 0.3 秒 → 愛心噴泉
    if (holding && p.millis() - holding.start > 300) {
      for (let i = 0; i < 3; i++) hearts.push(new Heart(holding.x, holding.y, 1.3));
    }
    for (let i = hearts.length - 1; i >= 0; i--) {
      const h = hearts[i];
      h.update();
      if (h.life <= 0 || h.y > p.height + 40) hearts.splice(i, 1);
      else h.draw();
    }
    if (hearts.length === 0 && !holding) p.noLoop(); // 沒愛心時休息，省電
  };

  p.windowResized = () => p.resizeCanvas(p.windowWidth, p.windowHeight);
});
