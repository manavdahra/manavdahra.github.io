(function () {
  const canvas = document.getElementById('trainingLoopCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  canvas.width  = 710;
  canvas.height = 300;

  const C = {
    bg:         '#1a2d2d',
    fill:       '#2a4444',
    border:     '#bdb76b',
    text:       '#c8c4b8',
    sub:        '#a09890',
    arrow:      '#bdb76b',
    muted:      '#a09890',
    activeFill: '#3a5a3a',
    neuronLit:  '#4a7a4a',
  };

  const N = {
    features:    { cx: 75,  cy: 118, w: 120, h: 48,  type: 'parallelogram', label: 'Features',    sub: 'x\u1D62' },
    model:       { cx: 245, cy: 118, w: 155, h: 88,  type: 'neural_net',    label: 'Model',       sub: 'h\u03B8(x\u1D62)' },
    predictions: { cx: 445, cy: 118, w: 155, h: 48,  type: 'stadium',       label: 'Predictions', sub: '\u0177\u1D62' },
    labels:      { cx: 615, cy: 118, w: 115, h: 48,  type: 'parallelogram', label: 'Labels',      sub: 'y\u1D62' },
    loss:        { cx: 445, cy: 248, w: 155, h: 52,  type: 'hexagon',       label: 'Loss',        sub: 'L(\u0177\u1D62, y\u1D62)' },
    update:      { cx: 245, cy: 248, w: 155, h: 52,  type: 'rect',          label: 'Update',      sub: '\u03B8 \u2190 \u03B8 \u2212 \u03B1\u2207L' },
  };

  const NN_LAYERS = [2, 3, 2];
  const NN_XS     = [194, 245, 296];
  const NN_SPACE  = 22;
  const NN_R      = 6;

  function nnPositions() {
    return NN_LAYERS.map((count, li) => {
      const pts = [];
      for (let i = 0; i < count; i++) {
        pts.push({ x: NN_XS[li], y: N.model.cy + (i - (count - 1) / 2) * NN_SPACE });
      }
      return pts;
    });
  }

  const EDGES = [
    { from: 'features',    to: 'model',       x1: () => N.features.cx + N.features.w/2,         y1: () => N.features.cy,                         x2: () => N.model.cx - N.model.w/2,             y2: () => N.model.cy },
    { from: 'model',       to: 'predictions', x1: () => N.model.cx + N.model.w/2,               y1: () => N.model.cy,                            x2: () => N.predictions.cx - N.predictions.w/2, y2: () => N.predictions.cy },
    { from: 'predictions', to: 'loss',        x1: () => N.predictions.cx,                       y1: () => N.predictions.cy + N.predictions.h/2,  x2: () => N.loss.cx,                             y2: () => N.loss.cy - N.loss.h/2 },
    { from: 'labels',      to: 'loss',        x1: () => N.labels.cx,                            y1: () => N.labels.cy + N.labels.h/2,            x2: () => N.loss.cx + N.loss.w/2,               y2: () => N.loss.cy },
    { from: 'loss',        to: 'update',      x1: () => N.loss.cx - N.loss.w/2,                 y1: () => N.loss.cy,                             x2: () => N.update.cx + N.update.w/2,           y2: () => N.update.cy },
    { from: 'update',      to: 'model',       x1: () => N.update.cx,                            y1: () => N.update.cy - N.update.h/2,            x2: () => N.model.cx,                           y2: () => N.model.cy + N.model.h/2 },
  ];

  const SEQUENCE = [
    { activeNodes: ['features'],    activeEdges: [],     duration: 700  },
    { activeNodes: [],              activeEdges: [0],    duration: 550  },
    { activeNodes: ['model'],       activeEdges: [],     duration: 1300 },
    { activeNodes: [],              activeEdges: [1],    duration: 550  },
    { activeNodes: ['predictions'], activeEdges: [],     duration: 700  },
    { activeNodes: ['labels'],      activeEdges: [2, 3], duration: 650  },
    { activeNodes: ['loss'],        activeEdges: [],     duration: 700  },
    { activeNodes: [],              activeEdges: [4],    duration: 550  },
    { activeNodes: ['update'],      activeEdges: [],     duration: 700  },
    { activeNodes: [],              activeEdges: [5],    duration: 550  },
  ];

  let paused    = false;
  let stepIndex = 0;
  let stepStart = null;

  function setGlow(color, blur) { ctx.shadowColor = color; ctx.shadowBlur = blur; }
  function clearGlow()          { ctx.shadowBlur = 0; }

  function arrowHead(x2, y2, x1, y1) {
    const angle = Math.atan2(y2 - y1, x2 - x1), s = 9;
    ctx.save();
    ctx.translate(x2, y2);
    ctx.rotate(angle);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-s,  s * 0.42);
    ctx.lineTo(-s, -s * 0.42);
    ctx.closePath();
    ctx.fillStyle = C.arrow;
    ctx.fill();
    ctx.restore();
  }

  function drawEdge(i, progress) {
    const e = EDGES[i];
    const x1 = e.x1(), y1 = e.y1(), x2 = e.x2(), y2 = e.y2();
    const active = progress !== null;
    if (active) setGlow(C.border, 6);
    ctx.beginPath();
    ctx.strokeStyle = C.arrow;
    ctx.lineWidth   = active ? 2 : 1.5;
    ctx.moveTo(x1, y1); ctx.lineTo(x2, y2);
    ctx.stroke();
    clearGlow();
    arrowHead(x2, y2, x1, y1);
    if (active && progress >= 0 && progress <= 1) {
      const px = x1 + (x2 - x1) * progress;
      const py = y1 + (y2 - y1) * progress;
      setGlow(C.border, 18);
      ctx.beginPath(); ctx.arc(px, py, 5, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff'; ctx.fill();
      clearGlow();
    }
  }

  function nodeLabel(cx, cy, label, sub) {
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.shadowBlur = 0;
    ctx.fillStyle = C.text; ctx.font = '13px Inter,sans-serif'; ctx.fillText(label, cx, cy - 7);
    ctx.fillStyle = C.sub;  ctx.font = '12px Inter,sans-serif'; ctx.fillText(sub,   cx, cy + 8);
  }

  function drawParallelogram(n, active) {
    const { cx, cy, w, h } = n, sk = 11;
    const path = () => {
      ctx.beginPath();
      ctx.moveTo(cx - w/2 + sk, cy - h/2); ctx.lineTo(cx + w/2 + sk, cy - h/2);
      ctx.lineTo(cx + w/2 - sk, cy + h/2); ctx.lineTo(cx - w/2 - sk, cy + h/2);
      ctx.closePath();
    };
    path(); ctx.fillStyle = active ? C.activeFill : C.fill; ctx.fill();
    if (active) setGlow(C.border, 12);
    path(); ctx.strokeStyle = C.border; ctx.lineWidth = active ? 2.2 : 1.8; ctx.stroke();
    clearGlow();
    nodeLabel(cx, cy, n.label, n.sub);
  }

  function drawNeuralNet(n, active, t) {
    const { cx, cy, w, h } = n;
    const x = cx - w/2, y = cy - h/2, p = 8;
    // Box fill
    ctx.beginPath(); ctx.roundRect(x, y, w, h, 4);
    ctx.fillStyle = active ? C.activeFill : C.fill; ctx.fill();
    // Box stroke
    if (active) setGlow(C.border, 12);
    ctx.beginPath(); ctx.roundRect(x, y, w, h, 4);
    ctx.strokeStyle = C.border; ctx.lineWidth = active ? 2.2 : 1.8; ctx.stroke();
    clearGlow();
    // Subroutine indicator lines
    ctx.strokeStyle = C.border; ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(x + p, y); ctx.lineTo(x + p, y + h);
    ctx.moveTo(x + w - p, y); ctx.lineTo(x + w - p, y + h);
    ctx.stroke();

    const layers = nnPositions();
    const layerT  = (active && t !== null) ? t * (NN_LAYERS.length - 1) : -1;

    // Connections
    for (let li = 0; li < layers.length - 1; li++) {
      const lit = layerT >= li + 0.3;
      for (const from of layers[li]) {
        for (const to of layers[li + 1]) {
          ctx.beginPath();
          ctx.strokeStyle = lit ? 'rgba(189,183,107,0.65)' : 'rgba(58,84,84,0.9)';
          ctx.lineWidth   = 0.9;
          if (lit) setGlow('rgba(189,183,107,0.35)', 4);
          ctx.moveTo(from.x, from.y); ctx.lineTo(to.x, to.y); ctx.stroke();
          clearGlow();
        }
      }
    }

    // Neurons
    for (let li = 0; li < layers.length; li++) {
      const lit = layerT >= li;
      for (const pos of layers[li]) {
        ctx.beginPath(); ctx.arc(pos.x, pos.y, NN_R, 0, Math.PI * 2);
        ctx.fillStyle = lit ? C.neuronLit : C.fill; ctx.fill();
        if (lit) setGlow(C.border, 8);
        ctx.beginPath(); ctx.arc(pos.x, pos.y, NN_R, 0, Math.PI * 2);
        ctx.strokeStyle = C.border; ctx.lineWidth = lit ? 1.6 : 1.2; ctx.stroke();
        clearGlow();
      }
    }

    // Labels at top / bottom of box
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.shadowBlur = 0;
    ctx.fillStyle = C.muted; ctx.font = '11px Inter,sans-serif'; ctx.fillText(n.label, cx, y + 10);
    ctx.fillStyle = C.sub;   ctx.font = '11px Inter,sans-serif'; ctx.fillText(n.sub,   cx, y + h - 10);
  }

  function drawStadium(n, active) {
    const { cx, cy, w, h } = n;
    ctx.beginPath(); ctx.roundRect(cx - w/2, cy - h/2, w, h, h/2);
    ctx.fillStyle = active ? C.activeFill : C.fill; ctx.fill();
    if (active) setGlow(C.border, 12);
    ctx.beginPath(); ctx.roundRect(cx - w/2, cy - h/2, w, h, h/2);
    ctx.strokeStyle = C.border; ctx.lineWidth = active ? 2.2 : 1.8; ctx.stroke();
    clearGlow();
    nodeLabel(cx, cy, n.label, n.sub);
  }

  function drawHexagon(n, active) {
    const { cx, cy } = n, rx = n.w/2, ry = n.h/2, ox = rx * 0.28;
    const path = () => {
      ctx.beginPath();
      ctx.moveTo(cx - rx, cy); ctx.lineTo(cx - ox, cy - ry);
      ctx.lineTo(cx + ox, cy - ry); ctx.lineTo(cx + rx, cy);
      ctx.lineTo(cx + ox, cy + ry); ctx.lineTo(cx - ox, cy + ry);
      ctx.closePath();
    };
    path(); ctx.fillStyle = active ? C.activeFill : C.fill; ctx.fill();
    if (active) setGlow(C.border, 12);
    path(); ctx.strokeStyle = C.border; ctx.lineWidth = active ? 2.2 : 1.8; ctx.stroke();
    clearGlow();
    nodeLabel(cx, cy, n.label, n.sub);
  }

  function drawRect(n, active) {
    const { cx, cy, w, h } = n;
    ctx.beginPath(); ctx.roundRect(cx - w/2, cy - h/2, w, h, 4);
    ctx.fillStyle = active ? C.activeFill : C.fill; ctx.fill();
    if (active) setGlow(C.border, 12);
    ctx.beginPath(); ctx.roundRect(cx - w/2, cy - h/2, w, h, 4);
    ctx.strokeStyle = C.border; ctx.lineWidth = active ? 2.2 : 1.8; ctx.stroke();
    clearGlow();
    nodeLabel(cx, cy, n.label, n.sub);
  }

  const DRAWERS = {
    parallelogram: (n, a, t) => drawParallelogram(n, a),
    neural_net:    drawNeuralNet,
    stadium:       (n, a, t) => drawStadium(n, a),
    hexagon:       (n, a, t) => drawHexagon(n, a),
    rect:          (n, a, t) => drawRect(n, a),
  };

  function getStep(time) {
    if (stepStart === null) stepStart = time;
    const step    = SEQUENCE[stepIndex];
    const elapsed = time - stepStart;
    let t         = elapsed / step.duration;
    if (t >= 1) {
      stepIndex = (stepIndex + 1) % SEQUENCE.length;
      stepStart = time;
      t = 0;
    }
    return { step, t: Math.min(t, 1) };
  }

  function draw(time) {
    const { step, t } = paused ? { step: SEQUENCE[stepIndex], t: 0.5 } : getStep(time);
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    ctx.beginPath(); ctx.roundRect(0, 0, W, H, 10);
    ctx.fillStyle = C.bg; ctx.fill();

    ctx.shadowBlur = 0;
    ctx.fillStyle  = C.muted; ctx.font = '13px Inter,sans-serif';
    ctx.textAlign  = 'center'; ctx.textBaseline = 'alphabetic';
    ctx.fillText('Training Loop', W / 2, 20);

    EDGES.forEach((e, i) => {
      drawEdge(i, step.activeEdges.includes(i) ? t : null);
    });

    Object.keys(N).forEach(key => {
      const n = N[key], active = step.activeNodes.includes(key);
      DRAWERS[n.type](n, active, active ? t : null);
    });
  }

  requestAnimationFrame(function loop(time) {
    if (!paused) draw(time);
    requestAnimationFrame(loop);
  });

  draw(0);

  // Play / Pause button
  const btn = document.createElement('button');
  btn.textContent  = '\u23F8\u00A0Pause';
  btn.style.cssText = 'display:block;margin:0.5rem auto 0;background:#2a4444;color:#bdb76b;border:1px solid #3a5454;padding:0.3rem 1.2rem;border-radius:4px;cursor:pointer;font-family:Inter,sans-serif;font-size:12px;';
  btn.addEventListener('click', () => {
    paused = !paused;
    if (!paused) stepStart = null;
    btn.textContent = paused ? '\u25B6\u00A0Play' : '\u23F8\u00A0Pause';
    if (paused) draw(0);
  });
  canvas.parentElement.appendChild(btn);

  canvas._nodes = N;
  canvas._edges = EDGES;
}());
