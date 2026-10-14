(function () {
  'use strict';

  const NS = 'http://www.w3.org/2000/svg';
  const COLORS = ['#8a4f8c', '#2e6b4f', '#5b6475', '#b4532a'];
  const INK = '#1d2433';
  let uid = 0;
  const fmt = (n, digits = 2) => Number.isFinite(n) ? n.toLocaleString('fr-FR', { maximumFractionDigits: digits, minimumFractionDigits: digits }) : '—';
  const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));
  function random(seed) {
    return function () {
      seed |= 0; seed = seed + 0x6D2B79F5 | 0;
      let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  const mean = a => a.reduce((s, x) => s + x, 0) / a.length;
  const dot = (a, b) => a.reduce((s, x, j) => s + x * b[j], 0);
  const sigmoid = g => g >= 0 ? 1 / (1 + Math.exp(-g)) : Math.exp(g) / (1 + Math.exp(g));
  const soft = (z, t) => Math.sign(z) * Math.max(0, Math.abs(z) - t);
  function node(tag, className, text) {
    const n = document.createElement(tag);
    if (className) n.className = className;
    if (text !== undefined) n.textContent = text;
    return n;
  }
  function shell(el, title, note, isStatic) {
    el.replaceChildren();
    const wrap = node('div', 'demo-shell');
    const heading = node('div', 'demo-heading');
    heading.append(node('span', '', title), node('span', '', 'Données synthétiques · reproductibles'));
    const controls = node('div', 'demo-controls');
    controls.hidden = !!isStatic;
    if (isStatic) controls.style.display = 'none';
    const plot = node('div', 'demo-plot');
    const legend = node('div', 'demo-legend');
    const stats = node('div', 'demo-stats');
    const footer = node('div', 'demo-note', note);
    wrap.append(heading, controls, plot, legend, stats, footer);
    el.append(wrap);
    return { wrap, controls, plot, legend, stats, footer };
  }
  function range(parent, label, min, max, step, value, onChange, digits = 2) {
    const c = node('div', 'control');
    const id = `model-control-${++uid}`;
    const l = node('label', '', label); l.htmlFor = id;
    const input = node('input'); input.type = 'range'; input.id = id;
    input.min = String(min); input.max = String(max); input.step = String(step); input.value = String(value);
    const output = node('output', '', fmt(value, digits)); output.htmlFor = id;
    input.addEventListener('input', () => {
      const v = Number(input.value); output.value = fmt(v, digits); onChange(v);
    });
    c.append(l, input, output); parent.append(c);
    return { input, output, set(v) { input.value = String(v); output.value = fmt(v, digits); } };
  }
  function select(parent, label, entries, value, onChange) {
    const c = node('div', 'control'); const id = `model-control-${++uid}`;
    const l = node('label', '', label); l.htmlFor = id;
    const input = node('select'); input.id = id;
    entries.forEach(([v, text]) => { const o = node('option', '', text); o.value = v; input.append(o); });
    input.value = value; input.addEventListener('change', () => onChange(input.value));
    c.append(l, input); parent.append(c); return input;
  }
  function button(parent, label, onClick) {
    const b = node('button', 'secondary-button', label); b.type = 'button';
    b.addEventListener('click', onClick); parent.append(b); return b;
  }
  function legends(parent, entries) {
    parent.replaceChildren();
    entries.forEach(([label, color]) => {
      const item = node('span'); const mark = node('span', 'legend-dot'); mark.style.background = color;
      item.append(mark, document.createTextNode(label)); parent.append(item);
    });
  }
  function statistics(parent, entries) {
    parent.replaceChildren();
    entries.forEach(([label, value, highlight]) => {
      const item = node('div', `stat${highlight ? ' highlight' : ''}`);
      item.append(node('span', '', label), node('strong', '', value)); parent.append(item);
    });
  }
  function svg(host, label, width = 700, height = 370) {
    host.replaceChildren();
    const s = document.createElementNS(NS, 'svg');
    s.setAttribute('viewBox', `0 0 ${width} ${height}`);
    s.setAttribute('role', 'img'); s.setAttribute('aria-label', label);
    const desc = document.createElementNS(NS, 'desc'); desc.textContent = label; s.append(desc);
    host.append(s); return s;
  }
  function element(svgNode, tag, attrs, text) {
    const n = document.createElementNS(NS, tag);
    Object.entries(attrs || {}).forEach(([k, v]) => n.setAttribute(k, String(v)));
    if (text !== undefined) n.textContent = text;
    svgNode.append(n); return n;
  }
  function axes(s, box, bounds, xLabel, yLabel, ticks = 5) {
    const { x, y, w, h } = box, [xmin, xmax, ymin, ymax] = bounds;
    const X = v => x + (v - xmin) / (xmax - xmin) * w;
    const Y = v => y + h - (v - ymin) / (ymax - ymin) * h;
    const clipId = `model-clip-${++uid}`;
    const defs = element(s, 'defs'); const clip = element(defs, 'clipPath', { id: clipId });
    element(clip, 'rect', { x, y, width: w, height: h });
    element(s, 'rect', { x, y, width: w, height: h, fill: '#fafafa', stroke: '#dce3e2' });
    const precision = step => Math.abs(step - Math.round(step)) < 1e-8 ? 0 : Math.abs(step * 10 - Math.round(step * 10)) < 1e-8 ? 1 : 2;
    for (let i = 0; i <= ticks; i++) {
      const xv = xmin + (xmax - xmin) * i / ticks, yv = ymin + (ymax - ymin) * i / ticks;
      element(s, 'line', { x1: X(xv), y1: y, x2: X(xv), y2: y + h, stroke: '#ececee', 'stroke-width': 1 });
      element(s, 'line', { x1: x, y1: Y(yv), x2: x + w, y2: Y(yv), stroke: '#ececee', 'stroke-width': 1 });
      element(s, 'text', { x: X(xv), y: y + h + 20, 'text-anchor': 'middle' }, fmt(xv, precision((xmax - xmin) / ticks)));
      element(s, 'text', { x: x - 9, y: Y(yv) + 4, 'text-anchor': 'end' }, fmt(yv, precision((ymax - ymin) / ticks)));
    }
    if (xmin <= 0 && xmax >= 0) element(s, 'line', { x1: X(0), y1: y, x2: X(0), y2: y + h, stroke: '#cad4d2' });
    if (ymin <= 0 && ymax >= 0) element(s, 'line', { x1: x, y1: Y(0), x2: x + w, y2: Y(0), stroke: '#cad4d2' });
    element(s, 'text', { x: x + w / 2, y: y + h + 42, 'text-anchor': 'middle' }, xLabel);
    element(s, 'text', { x: x - 12, y: y - 12, 'text-anchor': 'start' }, yLabel);
    const group = element(s, 'g', { 'clip-path': `url(#${clipId})` });
    return { X, Y, group, x, y, w, h };
  }
  function path(plot, data, color, width = 2.5, dash) {
    const d = data.map((p, i) => `${i ? 'L' : 'M'}${plot.X(p[0]).toFixed(3)},${plot.Y(p[1]).toFixed(3)}`).join(' ');
    return element(plot.group, 'path', { d, fill: 'none', stroke: color, 'stroke-width': width, ...(dash ? { 'stroke-dasharray': dash } : {}) });
  }
  function point(plot, p, color, radius = 4, stroke = '#fff', strokeWidth = 1.2) {
    return element(plot.group, 'circle', { cx: plot.X(p[0]), cy: plot.Y(p[1]), r: radius, fill: color, stroke, 'stroke-width': strokeWidth });
  }
  function solve(matrix, vector) {
    const n = vector.length, a = matrix.map((row, i) => [...row, vector[i]]);
    for (let j = 0; j < n; j++) {
      let pivot = j;
      for (let i = j + 1; i < n; i++) if (Math.abs(a[i][j]) > Math.abs(a[pivot][j])) pivot = i;
      [a[j], a[pivot]] = [a[pivot], a[j]];
      if (Math.abs(a[j][j]) < 1e-12) throw new Error('Matrice singulière dans la démonstration.');
      const scale = a[j][j]; for (let k = j; k <= n; k++) a[j][k] /= scale;
      for (let i = 0; i < n; i++) if (i !== j) {
        const f = a[i][j]; for (let k = j; k <= n; k++) a[i][k] -= f * a[j][k];
      }
    }
    return a.map(row => row[n]);
  }

  // Fixed sample. Every feature is centered and scaled with its own training statistics.
  const regression = (() => {
    const rng = random(3402), rawX = [], rawY = [];
    for (let i = 0; i < 48; i++) {
      const x1 = 4 * rng() - 2, x2 = .86 * x1 + .8 * (rng() - .5);
      const x3 = 4 * rng() - 2, x4 = 4 * rng() - 2;
      rawX.push([x1, x2, x3, x4]);
      rawY.push(1.3 + 2.2 * x1 - .9 * x2 + .75 * x3 + .8 * (rng() - .5));
    }
    const mu = [0, 1, 2, 3].map(j => mean(rawX.map(row => row[j])));
    const sd = mu.map((m, j) => Math.sqrt(mean(rawX.map(row => (row[j] - m) ** 2))));
    const X = rawX.map(row => row.map((v, j) => (v - mu[j]) / sd[j]));
    const intercept = mean(rawY), y = rawY.map(v => v - intercept);
    const G = [0, 1, 2, 3].map(j => [0, 1, 2, 3].map(k => mean(X.map(row => row[j] * row[k]))));
    const c = [0, 1, 2, 3].map(j => mean(X.map((row, i) => row[j] * y[i])));
    return { X, y, rawX, rawY, intercept, G, c, mu, sd };
  })();
  function ridgeFit(lambda = 1, method = 'ridge') {
    const { G, c, X, y, intercept } = regression;
    let coefficients;
    if (method !== 'lasso' || lambda === 0) {
      coefficients = solve(G.map((row, j) => row.map((v, k) => v + (j === k ? lambda : 0))), c);
    } else {
      coefficients = [0, 0, 0, 0];
      for (let it = 0; it < 2000; it++) {
        let delta = 0;
        for (let j = 0; j < 4; j++) {
          let rho = c[j];
          for (let k = 0; k < 4; k++) if (j !== k) rho -= G[j][k] * coefficients[k];
          const next = soft(rho, lambda / 2) / G[j][j];
          delta = Math.max(delta, Math.abs(next - coefficients[j])); coefficients[j] = next;
        }
        if (delta < 1e-10) break;
      }
    }
    const mse = mean(X.map((row, i) => (y[i] - dot(row, coefficients)) ** 2));
    const penalty = lambda * coefficients.reduce((s, b) => s + (method === 'lasso' ? Math.abs(b) : b * b), 0);
    return { coefficients, intercept, mse, penalty, objective: mse + penalty, active: coefficients.filter(b => Math.abs(b) > 1e-7).length };
  }
  const paths = {};
  function coefficientPaths(method) {
    if (!paths[method]) paths[method] = Array.from({ length: 101 }, (_, i) => {
      const lambda = 6 * i / 100; return { lambda, coefficients: ridgeFit(lambda, method).coefficients };
    });
    return paths[method];
  }
  function ridge(el, options = {}) {
    const defaults = { lambda: .7, method: 'ridge' };
    const state = { ...defaults, ...(typeof options.preset === 'object' ? options.preset : {}) };
    state.lambda = clamp(Number(state.lambda), 0, 6); state.method = state.method === 'lasso' ? 'lasso' : 'ridge';
    const ui = shell(el, 'Ridge / Lasso', 'Objectif : \\(\\mathrm{MSE}+\\lambda\\times\\text{pénalité}\\). Les 4 variables sont centrées et standardisées ; l’interception n’est pas pénalisée. Le graphique suit des solutions effectivement calculées.', options.static);
    const methodInput = select(ui.controls, 'Pénalité', [['ridge', 'Ridge · L2'], ['lasso', 'Lasso · L1']], state.method, v => { state.method = v; draw(); });
    const lambdaInput = range(ui.controls, '\\(\\lambda\\)', 0, 6, .01, state.lambda, v => { state.lambda = v; draw(); });
    button(ui.controls, 'Réinitialiser', () => { Object.assign(state, defaults); methodInput.value = state.method; lambdaInput.set(state.lambda); draw(); });
    legends(ui.legend, COLORS.map((c, j) => [`Coefficient \\(\\beta_{${j + 1}}\\)`, c]));
    function draw() {
      const fit = ridgeFit(state.lambda, state.method), all = coefficientPaths(state.method);
      const values = all.flatMap(p => p.coefficients), lo = Math.min(-.4, ...values) - .2, hi = Math.max(.4, ...values) + .2;
      const s = svg(ui.plot, `Trajectoires ${state.method === 'ridge' ? 'Ridge' : 'Lasso'} sur quatre coefficients. λ = ${fmt(state.lambda)}. MSE = ${fmt(fit.mse, 3)}.`, 700, 360);
      const p = axes(s, { x: 64, y: 33, w: 605, h: 267 }, [0, 6, lo, hi], 'Intensité λ', 'Coefficient', 6);
      for (let j = 0; j < 4; j++) path(p, all.map(a => [a.lambda, a.coefficients[j]]), COLORS[j]);
      element(p.group, 'line', { x1: p.X(state.lambda), y1: p.y, x2: p.X(state.lambda), y2: p.y + p.h, stroke: '#72818b', 'stroke-dasharray': '4 4' });
      fit.coefficients.forEach((b, j) => point(p, [state.lambda, b], COLORS[j], 5));
      statistics(ui.stats, [['MSE apprentissage', fmt(fit.mse, 3)], ['Pénalité', fmt(fit.penalty, 3)], ['Objectif total', fmt(fit.objective, 3), true], ['Coefficients non nuls', `${fit.active} / 4`]]);
    }
    draw();
  }

  const logisticData = (() => {
    const rng = random(3414);
    return Array.from({ length: 32 }, (_, i) => {
      const x = -2.85 + 5.7 * i / 31;
      const y = rng() < sigmoid(1.6 * x - .25) ? 1 : 0;
      return { x, y };
    });
  })();
  function logisticFit(w = 1.6, b = -.25, threshold = .5) {
    const points = logisticData.map(p => {
      const g = w * p.x + b, probability = sigmoid(g), prediction = probability >= threshold ? 1 : 0;
      const loss = Math.max(g, 0) - p.y * g + Math.log1p(Math.exp(-Math.abs(g)));
      return { ...p, g, probability, prediction, loss };
    });
    return { points, loss: mean(points.map(p => p.loss)), accuracy: mean(points.map(p => Number(p.y === p.prediction))), pAtOne: sigmoid(w + b), boundary: Math.abs(w) > 1e-12 ? (Math.log(threshold / (1 - threshold)) - b) / w : null };
  }
  function logistic(el, options = {}) {
    const defaults = { w: 1.6, b: -.25, threshold: .5 };
    const state = { ...defaults, ...(typeof options.preset === 'object' ? options.preset : {}) };
    state.w = clamp(Number(state.w), -3, 3); state.b = clamp(Number(state.b), -3, 3); state.threshold = clamp(Number(state.threshold), .05, .95);
    const ui = shell(el, 'Score → probabilité → classe', 'Modèle réglé à la main : \\(g(x)=w\\,x+b\\), \\(\\hat p(x)=\\sigma(g(x))\\). Le seuil change les classes prédites ; il ne change ni les probabilités ni la log loss.', options.static);
    const wInput = range(ui.controls, 'Coefficient \\(w\\)', -3, 3, .05, state.w, v => { state.w = v; draw(); });
    const bInput = range(ui.controls, 'Biais b', -3, 3, .05, state.b, v => { state.b = v; draw(); });
    const thresholdInput = range(ui.controls, 'Seuil \\(t\\)', .05, .95, .01, state.threshold, v => { state.threshold = v; draw(); });
    button(ui.controls, 'Réinitialiser', () => { Object.assign(state, defaults); wInput.set(state.w); bInput.set(state.b); thresholdInput.set(state.threshold); draw(); });
    legends(ui.legend, [['Score / probabilité du modèle', INK], ['Classe observée 0', COLORS[0]], ['Classe observée 1', COLORS[1]], ['Seuil de décision', COLORS[3]]]);
    function draw() {
      const fit = logisticFit(state.w, state.b, state.threshold);
      const s = svg(ui.plot, `Score linéaire puis probabilité sigmoid. Seuil ${fmt(state.threshold)} ; exactitude ${fmt(100 * fit.accuracy, 0)} pour cent ; log loss ${fmt(fit.loss, 3)}.`, 740, 360);
      const left = axes(s, { x: 46, y: 38, w: 286, h: 259 }, [-3, 3, -12, 12], 'Caractéristique x', 'Score g(x)', 4);
      const right = axes(s, { x: 411, y: 38, w: 286, h: 259 }, [-3, 3, 0, 1], 'Caractéristique x', 'Probabilité estimée', 4);
      const grid = Array.from({ length: 121 }, (_, i) => -3 + i * .05);
      path(left, grid.map(x => [x, state.w * x + state.b]), INK);
      path(right, grid.map(x => [x, sigmoid(state.w * x + state.b)]), INK);
      path(right, [[-3, state.threshold], [3, state.threshold]], COLORS[3], 2, '6 4');
      if (fit.boundary !== null && fit.boundary >= -3 && fit.boundary <= 3) {
        path(right, [[fit.boundary, 0], [fit.boundary, 1]], COLORS[3], 1.5, '3 4');
      }
      fit.points.forEach(p => point(right, [p.x, p.y === 1 ? .97 : .03], COLORS[p.y], 4, p.prediction !== p.y ? '#202b37' : '#fff', p.prediction !== p.y ? 2 : 1));
      element(s, 'text', { x: 371, y: 170, 'text-anchor': 'middle', style: 'font-size:24px;fill:#72818b' }, '→');
      element(s, 'text', { x: 371, y: 191, 'text-anchor': 'middle', style: 'font-size:10px' }, 'sigmoid');
      statistics(ui.stats, [['Probabilité à \\(x=1\\)', fmt(fit.pAtOne, 3)], ['Log loss moyenne', fmt(fit.loss, 3), true], ['Exactitude au seuil choisi', `${fmt(100 * fit.accuracy, 0)} %`]]);
      ui.footer.textContent = `Modèle réglé à la main, sans réapprentissage automatique. Les points de classe 0 et 1 sont légèrement décalés verticalement pour rester lisibles ; un contour sombre signale une erreur de classe. Changer le seuil seul conserve la log loss.`;
    }
    draw();
  }

  const baseSvm = [
    { x: [-2.2, -1.1], y: -1 }, { x: [-1.8, .9], y: -1 }, { x: [-.9, -.8], y: -1 },
    { x: [-1.05, .65], y: -1 }, { x: [-2.5, .15], y: -1 },
    { x: [1, -.8], y: 1 }, { x: [1.25, .75], y: 1 }, { x: [2.2, -1], y: 1 },
    { x: [2.4, .35], y: 1 }, { x: [1.75, 1.2], y: 1 }
  ];
  const svmData = outlier => outlier ? [...baseSvm, { x: [-1.7, 0], y: 1 }] : baseSvm;
  function svmGeometry(angle = 0, bias = 0, outlier = false) {
    const radians = angle * Math.PI / 180, normal = [Math.cos(radians), Math.sin(radians)];
    const data = svmData(outlier);
    const q = data.map(p => p.y * (dot(normal, p.x) + bias)), radius = Math.min(...q);
    const feasible = radius > 1e-10, scale = feasible ? radius : 1;
    const points = data.map((p, i) => {
      const score = (dot(normal, p.x) + bias) / scale;
      return { ...p, score, signedMargin: q[i] / scale, hinge: Math.max(0, 1 - q[i] / scale), prediction: score >= 0 ? 1 : -1 };
    });
    return { normal, bias, radius, feasible, scale, width: feasible ? 2 * radius : null, norm: 1 / scale, points, meanHinge: mean(points.map(p => p.hinge)), accuracy: mean(points.map(p => Number(p.prediction === p.y))) };
  }
  function svmBest(outlier = false) {
    const data = svmData(outlier); let best = null;
    for (let i = 0; i < 720; i++) {
      const angle = i * .5, r = angle * Math.PI / 180, n = [Math.cos(r), Math.sin(r)];
      const minPositive = Math.min(...data.filter(p => p.y === 1).map(p => dot(n, p.x)));
      const maxNegative = Math.max(...data.filter(p => p.y === -1).map(p => dot(n, p.x)));
      const radius = (minPositive - maxNegative) / 2;
      if (radius > 1e-10 && (!best || radius > best.radius)) {
        best = { angle: angle > 180 ? angle - 360 : angle, bias: -(minPositive + maxNegative) / 2, radius };
      }
    }
    return best;
  }
  function boundary(plot, normal, bias, level, color, dash, width = 2) {
    const t = [-normal[1], normal[0]], center = normal.map(v => v * (level - bias));
    path(plot, [[center[0] - 20 * t[0], center[1] - 20 * t[1]], [center[0] + 20 * t[0], center[1] + 20 * t[1]]], color, width, dash);
  }
  function svm(el, options = {}) {
    const defaults = { angle: 0, bias: 0, outlier: false };
    const state = { ...defaults, ...(typeof options.preset === 'object' ? options.preset : {}) };
    state.angle = clamp(Number(state.angle), -180, 180); state.bias = clamp(Number(state.bias), -3, 3); state.outlier = !!state.outlier;
    const ui = shell(el, 'Explorer une marge', 'La frontière est réglée à la main. Quand elle sépare les données, la bande symétrique atteint le point le plus proche. La recherche angulaire est une approximation géométrique sur 720 directions ; elle ne simule pas un SVM à marge souple.', options.static);
    const angleInput = range(ui.controls, 'Angle du vecteur normal', -180, 180, .5, state.angle, v => { state.angle = v; draw(); }, 1);
    const biasInput = range(ui.controls, 'Décalage c', -3, 3, .01, state.bias, v => { state.bias = v; draw(); });
    const checkControl = node('div', 'control'); const checkId = `model-control-${++uid}`;
    const checkbox = node('input'); checkbox.type = 'checkbox'; checkbox.id = checkId; checkbox.checked = state.outlier;
    const checkLabel = node('label', '', 'Ajouter une observation atypique'); checkLabel.htmlFor = checkId;
    checkbox.addEventListener('change', () => { state.outlier = checkbox.checked; draw(); }); checkControl.append(checkbox, checkLabel); ui.controls.append(checkControl);
    button(ui.controls, 'Chercher la marge · 720 directions', () => {
      const best = svmBest(state.outlier);
      if (best) { state.angle = best.angle; state.bias = best.bias; angleInput.set(state.angle); biasInput.set(state.bias); }
      draw(!best ? 'Aucune séparation trouvée : le point ajouté est à l’intérieur du groupe de classe opposée.' : 'Meilleure marge parmi les 720 orientations échantillonnées ; elle reste une approximation.');
    });
    button(ui.controls, 'Réinitialiser', () => { Object.assign(state, defaults); angleInput.set(state.angle); biasInput.set(state.bias); checkbox.checked = false; draw(); });
    legends(ui.legend, [['Classe \\(-1\\)', COLORS[0]], ['Classe \\(+1\\)', COLORS[1]], ['Frontière de décision', INK], ['Anneau : bord ou violation de marge', COLORS[3]]]);
    function draw(message = '') {
      const fit = svmGeometry(state.angle, state.bias, state.outlier);
      const s = svg(ui.plot, `Séparateur affine exploratoire. Angle ${fmt(state.angle, 1)} degrés. ${fit.feasible ? `Marge de séparation ${fmt(fit.width)}.` : 'Pas de marge de séparation positive.'} Exactitude ${fmt(100 * fit.accuracy, 0)} pour cent.`, 700, 430);
      const p = axes(s, { x: 167, y: 30, w: 350, h: 350 }, [-3, 3, -3, 3], 'Caractéristique x₁', 'Caractéristique x₂', 6);
      const t = [-fit.normal[1], fit.normal[0]], corners = [];
      for (const [a, b] of [[-1, -1], [-1, 1], [1, 1], [1, -1]]) {
        const center = (a * fit.scale - state.bias);
        corners.push([fit.normal[0] * center + b * 20 * t[0], fit.normal[1] * center + b * 20 * t[1]]);
      }
      element(p.group, 'polygon', { points: corners.map(x => `${p.X(x[0])},${p.Y(x[1])}`).join(' '), fill: COLORS[3], opacity: .11 });
      boundary(p, fit.normal, state.bias, 0, INK, null, 2.7);
      boundary(p, fit.normal, state.bias, fit.scale, INK, '6 5', 1.5);
      boundary(p, fit.normal, state.bias, -fit.scale, INK, '6 5', 1.5);
      fit.points.forEach(pnt => {
        if (pnt.signedMargin <= 1 + 1e-8) point(p, pnt.x, 'none', 8, COLORS[3], 2);
        point(p, pnt.x, pnt.y === -1 ? COLORS[0] : COLORS[1], 4.5, pnt.prediction !== pnt.y ? '#202b37' : '#fff', pnt.prediction !== pnt.y ? 2 : 1.2);
      });
      element(s, 'text', { x: 542, y: 145, style: 'font-size:11px' }, 'Trait plein : g = 0');
      element(s, 'text', { x: 542, y: 167, style: 'font-size:11px' }, 'Pointillés : g = ±1');
      statistics(ui.stats, [['Marge symétrique', fit.feasible ? fmt(fit.width) : 'Aucune', true], ['Norme du score w', fmt(fit.norm)], ['Hinge loss moyenne', fmt(fit.meanHinge, 3)], ['Exactitude', `${fmt(100 * fit.accuracy, 0)} %`]]);
      ui.footer.textContent = message || (fit.feasible
        ? 'Séparation valide : le score continu est normalisé pour que le point le plus proche ait une marge signée de \\(1\\). Largeur \\(=2/\\|w\\|\\). La frontière manuelle n’est pas nécessairement optimale.'
        : 'La frontière actuelle ne sépare pas toutes les observations. La bande affichée correspond aux scores \\(\\pm1\\) avec un vecteur normal de norme 1 ; elle ne représente pas une marge dure valide. Les violations sont mesurées par \\(\\max(0,\\,1-y\\,g)\\).');
    }
    draw();
  }

  const pcaData = (() => {
    const rng = random(3426), theta = 35 * Math.PI / 180, raw = [];
    for (let i = 0; i < 44; i++) {
      const along = 4.8 * (rng() - .5), across = 1.3 * (rng() - .5);
      raw.push([Math.cos(theta) * along - Math.sin(theta) * across + .6, Math.sin(theta) * along + Math.cos(theta) * across - .35]);
    }
    const center = [mean(raw.map(p => p[0])), mean(raw.map(p => p[1]))];
    const points = raw.map(p => [p[0] - center[0], p[1] - center[1]]);
    const xx = mean(points.map(p => p[0] ** 2)), yy = mean(points.map(p => p[1] ** 2)), xy = mean(points.map(p => p[0] * p[1]));
    const angle = .5 * Math.atan2(2 * xy, xx - yy) * 180 / Math.PI;
    return { points, xx, yy, xy, total: xx + yy, angle, center };
  })();
  function pcaFit(angle = pcaData.angle) {
    const theta = angle * Math.PI / 180, u = [Math.cos(theta), Math.sin(theta)];
    const projected = pcaData.points.map(p => { const score = dot(p, u); return { original: p, score, reconstruction: u.map(v => v * score) }; });
    const variance = mean(projected.map(p => p.score ** 2));
    const reconstructionError = mean(projected.map(p => p.original.reduce((s, v, j) => s + (v - p.reconstruction[j]) ** 2, 0)));
    return { u, projected, variance, ratio: variance / pcaData.total, reconstructionError, total: pcaData.total, principalAngle: pcaData.angle };
  }
  function pca(el, options = {}) {
    const initialAngle = options.preset && typeof options.preset === 'object' && Number.isFinite(options.preset.angle) ? options.preset.angle : pcaData.angle;
    const state = { angle: clamp(initialAngle, -90, 90) };
    const ui = shell(el, 'ACP · conserver la variance', 'Les données sont centrées, sans standardisation. Les projections orthogonales et l’erreur de reconstruction sont calculées pour chaque orientation. Les unités des deux axes sont identiques sur le dessin.', options.static);
    const angleInput = range(ui.controls, 'Angle de projection', -90, 90, .5, state.angle, v => { state.angle = v; draw(); }, 1);
    button(ui.controls, 'Aligner sur la première composante', () => { state.angle = pcaData.angle; angleInput.set(state.angle); draw(); });
    button(ui.controls, 'Réinitialiser', () => { state.angle = pcaData.angle; angleInput.set(state.angle); draw(); });
    legends(ui.legend, [['Observations centrées', COLORS[0]], ['Projection / reconstruction', COLORS[1]], ['Axe choisi', INK]]);
    function draw() {
      const fit = pcaFit(state.angle);
      const s = svg(ui.plot, `Projection ACP à ${fmt(state.angle, 1)} degrés. Variance conservée ${fmt(100 * fit.ratio, 1)} pour cent. Erreur quadratique de reconstruction ${fmt(fit.reconstructionError, 3)}.`, 700, 430);
      const p = axes(s, { x: 167, y: 30, w: 350, h: 350 }, [-3, 3, -3, 3], 'Caractéristique x₁ centrée', 'Caractéristique x₂ centrée', 6);
      path(p, [[-10 * fit.u[0], -10 * fit.u[1]], [10 * fit.u[0], 10 * fit.u[1]]], INK, 2.5);
      fit.projected.forEach(item => {
        path(p, [item.original, item.reconstruction], '#bd4b32', .9);
        point(p, item.original, COLORS[0], 3.6);
        point(p, item.reconstruction, COLORS[1], 2.8);
      });
      element(s, 'text', { x: 542, y: 145, style: 'font-size:11px' }, 'Les segments sont');
      element(s, 'text', { x: 542, y: 165, style: 'font-size:11px' }, 'perpendiculaires');
      element(s, 'text', { x: 542, y: 185, style: 'font-size:11px' }, 'à l’axe choisi.');
      statistics(ui.stats, [['Variance conservée', `${fmt(100 * fit.ratio, 1)} %`, true], ['Variance projetée', fmt(fit.variance, 3)], ['Erreur de reconstruction', fmt(fit.reconstructionError, 3)]]);
      ui.footer.textContent = `Variance totale = ${fmt(fit.total, 3)}. Variance projetée + erreur moyenne de reconstruction = variance totale. La première composante (${fmt(pcaData.angle, 1)}°) maximise ici la variance conservée ; cela ne mesure pas une performance prédictive.`;
    }
    draw();
  }

  window.SID34ModelDemos = {
    ridge, logistic, svm, pca,
    compute: { ridge: ridgeFit, logistic: logisticFit, svm: svmGeometry, svmBest, pca: pcaFit },
    datasets: { regression, logistic: logisticData, svm: baseSvm, pca: pcaData }
  };
})();
