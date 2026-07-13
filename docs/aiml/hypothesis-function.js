(function() {
    const canvas = document.getElementById("hypothesisFunctionCanvas");
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    canvas.width  = 710;
    canvas.height = 300;

    // Coefficients for degree-6 polynomials: [c0, c1, c2, c3, c4, c5, c6]
    // p(x) = c0 + c1*x + c2*x^2 + ... + c6*x^6
    const CURVES = [
        { label: 'True function f',   coeffs: [-2.1470,  2.9894, -0.1070, -12.4918, -12.2840,  5.2941, 12.2110], color: '#7ec8a0', dash: [] },
        { label: 'Hypothesis h\u2081', coeffs: [-2.0876,  2.8135, -1.3520, -11.7514,  -8.6641,  4.6502,  9.6070], color: '#e0b84a', dash: [6, 4] },
        { label: 'Hypothesis h\u2082', coeffs: [-11.2921,  8.4548, -2.2871, 25.5321,  -22.6856,  -3.4702,  11.8532], color: '#e07070', dash: [3, 5] },
        { label: 'Hypothesis h\u2083', coeffs: [-2,       3,      -1,       -11,        0,        0,       0     ], color: '#70b9e0', dash: [2, 6] },
    ];

    const C = {
        bg:   '#1a2d2d',
        axis: '#4a6a6a',
        grid: '#2a4444',
        text: '#a09890',
    };

    const PAD = { top: 24, right: 20, bottom: 36, left: 44 };
    const W = canvas.width  - PAD.left - PAD.right;
    const H = canvas.height - PAD.top  - PAD.bottom;

    const X_MIN = -1.4, X_MAX = 1.4;
    const STEPS = 400;

    function evalPoly(coeffs, x) {
        let val = 0, xp = 1;
        for (let i = 0; i < coeffs.length; i++) { val += coeffs[i] * xp; xp *= x; }
        return val;
    }

    // Compute y range across all curves
    let yMin = Infinity, yMax = -Infinity;
    for (const curve of CURVES) {
        for (let s = 0; s <= STEPS; s++) {
            const x = X_MIN + (X_MAX - X_MIN) * s / STEPS;
            const y = evalPoly(curve.coeffs, x);
            if (y < yMin) yMin = y;
            if (y > yMax) yMax = y;
        }
    }
    // Add 10% padding
    const yPad = (yMax - yMin) * 0.1;
    yMin -= yPad; yMax += yPad;

    function toCanvasX(x) { return PAD.left + (x - X_MIN) / (X_MAX - X_MIN) * W; }
    function toCanvasY(y) { return PAD.top  + (1 - (y - yMin) / (yMax - yMin)) * H; }

    // Background
    ctx.fillStyle = C.bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Grid lines and axis ticks
    ctx.strokeStyle = C.grid;
    ctx.lineWidth = 1;
    ctx.setLineDash([]);

    const xTicks = [-1, -0.5, 0, 0.5, 1];
    for (const tx of xTicks) {
        const cx = toCanvasX(tx);
        ctx.beginPath(); ctx.moveTo(cx, PAD.top); ctx.lineTo(cx, PAD.top + H); ctx.stroke();
        ctx.fillStyle = C.text; ctx.font = '11px Inter,sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
        ctx.fillText(tx.toFixed(1), cx, PAD.top + H + 6);
    }

    const yTickCount = 5;
    for (let i = 0; i <= yTickCount; i++) {
        const y = yMin + (yMax - yMin) * i / yTickCount;
        const cy = toCanvasY(y);
        ctx.beginPath(); ctx.moveTo(PAD.left, cy); ctx.lineTo(PAD.left + W, cy); ctx.stroke();
        ctx.fillStyle = C.text; ctx.font = '11px Inter,sans-serif'; ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
        ctx.fillText(y.toFixed(1), PAD.left - 6, cy);
    }

    // Axes
    ctx.strokeStyle = C.axis; ctx.lineWidth = 1.5; ctx.setLineDash([]);
    // x-axis (y=0 if in range)
    if (yMin <= 0 && yMax >= 0) {
        const cy0 = toCanvasY(0);
        ctx.beginPath(); ctx.moveTo(PAD.left, cy0); ctx.lineTo(PAD.left + W, cy0); ctx.stroke();
    }
    // y-axis (x=0)
    {
        const cx0 = toCanvasX(0);
        ctx.beginPath(); ctx.moveTo(cx0, PAD.top); ctx.lineTo(cx0, PAD.top + H); ctx.stroke();
    }

    // Plot curves
    for (const curve of CURVES) {
        ctx.strokeStyle = curve.color;
        ctx.lineWidth = 2;
        ctx.setLineDash(curve.dash);
        ctx.beginPath();
        for (let s = 0; s <= STEPS; s++) {
            const x = X_MIN + (X_MAX - X_MIN) * s / STEPS;
            const y = evalPoly(curve.coeffs, x);
            const cx = toCanvasX(x);
            const cy = toCanvasY(y);
            if (s === 0) ctx.moveTo(cx, cy); else ctx.lineTo(cx, cy);
        }
        ctx.stroke();
    }
    ctx.setLineDash([]);

    // Legend (top-right area)
    const legendX = PAD.left + W - 170;
    const legendY = PAD.top + 8;
    const legendLineW = 22;
    const rowH = 18;

    ctx.fillStyle = 'rgba(26,45,45,0.85)';
    ctx.fillRect(legendX - 6, legendY - 4, 178, CURVES.length * rowH + 8);

    for (let i = 0; i < CURVES.length; i++) {
        const rx = legendX, ry = legendY + i * rowH + rowH / 2;
        ctx.strokeStyle = CURVES[i].color;
        ctx.lineWidth = 2;
        ctx.setLineDash(CURVES[i].dash);
        ctx.beginPath(); ctx.moveTo(rx, ry); ctx.lineTo(rx + legendLineW, ry); ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = CURVES[i].color;
        ctx.font = '12px Inter,sans-serif'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
        ctx.fillText(CURVES[i].label, rx + legendLineW + 6, ry);
    }
}());
