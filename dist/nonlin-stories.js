(function () {
  'use strict';
  /* Chapitre 3 : récits interactifs. Un seul nuage (NonLin.refuge) pour la droite, les arbres, les voisins et les noyaux ;
     les animaux d'apprentissage et les lapins pour k-means ; de vraies images de chiffres pour t-SNE.
     Algorithmes : nonlin-ml.js. Grille γ × C pré-calculée et vérifiée : scripts/check-nonlin.cjs. */
  const K = window.StoryKit, A = window.Animals, N = window.NonLin;
  const {X, Y, SC, line, placeDots, setLines, setOverlay, overlay, measures} = K;
  const fr = A.fr, D = A.DOMAIN, pts = N.refuge, goal = K.goal;
  const COL = {cat: '#8a4f8c', dog: '#2e6b4f', ink: '#1d2433', muted: '#6e7380', grid: '#efeff1', axis: '#c4c4ca', error: '#b4532a', ochre: '#b07d2a', blue: '#3d6fb4', soft: '#cdb0cd', softDog: '#9fc7b1'};
  const pct = (v, d = 0) => fr(100 * v, d) + ' %';
  const esc = s => String(s).replace(/[&<>"]/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'}[c]));
  const memo = fn => { const m = new Map(); return (...a) => { const k = a.join('|'); if (!m.has(k)) m.set(k, fn(...a)); return m.get(k); }; };
  const once = fn => { let v, done = false; return () => { if (!done) { v = fn(); done = true; } return v; }; };
  const name = j => j === 'x1' ? 'poids' : 'pelage', unit = j => j === 'x1' ? 'kg' : 'cm';
  const dot = (a, o = {}) => ({id: a.id, x: X(a.x1), y: Y(a.x2), scale: .8, aria: (a.y ? 'Chien' : 'Chat') + ', ' + measures(a), ...o});
  const unknown = u => ({id: 'u', x: X(u.x1), y: Y(u.x2), selected: true, movable: true, interactive: true, scale: 1.25, aria: 'Animal inconnu déplaçable, ' + measures(u)});
  const slider = (key, label, value, min, max, step, shown) => '<label class="as-slider"><span>' + label + ' : <strong data-out="' + key + '">' + shown + '</strong></span><input type="range" data-range="' + key + '" min="' + min + '" max="' + max + '" step="' + step + '" value="' + value + '"></label>';
  function wireRange(ctx, key, set, show) {
    const input = ctx.controls.querySelector('[data-range="' + key + '"]'); if (!input) return;
    input.addEventListener('input', () => { set(+input.value); const out = ctx.controls.querySelector('[data-out="' + key + '"]'); if (out) out.textContent = show(+input.value); ctx.commit(); }, {signal: ctx.signal});
  }
  const buttons = (attr, list, cur) => '<div class="nl-row">' + list.map(([v, label]) => '<button type="button" class="as-button" data-' + attr + '="' + v + '" aria-pressed="' + (String(cur) === String(v)) + '">' + label + '</button>').join('') + '</div>';
  function wireButtons(ctx, attr, set) { ctx.controls.querySelectorAll('[data-' + attr + ']').forEach(b => b.addEventListener('click', () => { set(b.dataset[attr]); ctx.commit({controls: true}); }, {signal: ctx.signal})); }

  /* Carte de décision : cellules regroupées en deux chemins (mauve : chat, vert : chien). */
  const MAP = {nx: 66, ny: 48};
  function mapPaths(fn, box = {L: SC.L, R: SC.R, T: SC.T, B: SC.B}, grid = MAP) {
    const w = (box.R - box.L) / grid.nx, h = (box.B - box.T) / grid.ny, d = ['', ''];
    for (let r = 0; r < grid.ny; r++) {
      const x2 = D.x2[1] - (r + .5) / grid.ny * (D.x2[1] - D.x2[0]);
      let start = 0, prev = null;
      for (let c = 0; c <= grid.nx; c++) {
        const v = c < grid.nx ? fn({x1: D.x1[0] + (c + .5) / grid.nx * (D.x1[1] - D.x1[0]), x2}) : null;
        if (v !== prev) {
          if (prev !== null) d[prev] += 'M' + (box.L + start * w).toFixed(1) + ' ' + (box.T + r * h).toFixed(1) + 'h' + ((c - start) * w).toFixed(1) + 'v' + (h + .4).toFixed(1) + 'h-' + ((c - start) * w).toFixed(1) + 'z';
          start = c; prev = v;
        }
      }
    }
    return '<path d="' + d[0] + '" fill="' + COL.soft + '" opacity=".42"/><path d="' + d[1] + '" fill="' + COL.softDog + '" opacity=".42"/>';
  }
  /* Petit graphique : plusieurs courbes en fonction d'une valeur, repère vertical sur la valeur courante. */
  function curves({xs, series, x, xlabel, ylabel = 'bien classés (%)', ymin = 40, ymax = 100, W = 320, H = 178}) {
    const L = 36, R = W - 84, T = 10, B = H - 34, n = xs.length;
    const px = i => L + i / (n - 1) * (R - L), py = v => B - (v - ymin) / (ymax - ymin) * (B - T);
    const yt = [], ystep = ymax - ymin > 100 ? 100 : 20; for (let v = ymin; v <= ymax; v += ystep) yt.push(v);
    const grid = yt.map(v => '<path d="M' + L + ' ' + py(v) + 'H' + R + '" stroke="' + COL.grid + '"/><text x="' + (L - 6) + '" y="' + (py(v) + 4) + '" text-anchor="end" class="as-tick">' + v + '</text>').join('');
    const every = n > 8 ? 2 : 1;
    const ticks = xs.map((v, i) => i % every ? '' : '<text x="' + px(i) + '" y="' + (B + 16) + '" text-anchor="middle" class="as-tick">' + v + '</text>').join('');
    const at = xs.indexOf(x);
    const mark = at >= 0 ? '<path d="M' + px(at) + ' ' + T + 'V' + B + '" stroke="' + COL.ink + '" stroke-dasharray="3 3"/>' : '';
    const lines = series.map(s => '<path d="' + s.ys.map((v, i) => (i ? 'L' : 'M') + px(i).toFixed(1) + ' ' + py(v).toFixed(1)).join('') + '" fill="none" stroke="' + s.color + '" stroke-width="2.4"/>' +
      (at >= 0 ? '<circle cx="' + px(at) + '" cy="' + py(s.ys[at]) + '" r="4.4" fill="' + s.color + '"/>' : '') +
      '<text x="' + (R + 6) + '" y="' + (py(s.ys[n - 1]) + (s.dy || 4)) + '" class="as-tick" fill="' + s.color + '" style="fill:' + s.color + ';font-weight:700">' + s.label + '</text>').join('');
    return '<div class="as-side-figure"><svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + esc(ylabel + ' selon ' + xlabel) + '">' + grid + ticks + mark + lines +
      '<text x="' + ((L + R) / 2) + '" y="' + (H - 2) + '" text-anchor="middle" class="as-tick">' + xlabel + '</text></svg></div>';
  }
  /* Dessin d'un arbre. */
  function treeFigure(t) {
    const n = N.leaves(t), depth = N.depthOf(t), wide = n > 6, W = 300, step = wide ? 34 : 56, H = 18 + Math.max(depth, 1) * step + 20;
    let k = 0;
    const place = (node, d) => { node._d = d; if (!node.left) { node._x = (k++ + .5) / n * W; return node._x; } node._x = (place(node.left, d + 1) + place(node.right, d + 1)) / 2; return node._x; };
    place(t, 0);
    let edges = '', nodes = '';
    (function walk(node) {
      const y = 18 + node._d * step;
      if (node.left) {
        for (const [c, lab] of [[node.left, 'oui'], [node.right, 'non']]) {
          const cy = 18 + c._d * step;
          edges += '<path d="M' + node._x.toFixed(1) + ' ' + y + 'L' + c._x.toFixed(1) + ' ' + cy + '" stroke="' + COL.axis + '" stroke-width="1.5"/>';
          if (!wide) edges += '<text x="' + ((node._x + c._x) / 2 + (c === node.left ? -13 : 13)).toFixed(1) + '" y="' + ((y + cy) / 2 + 2) + '" text-anchor="middle" class="as-tick" style="font-size:10px">' + lab + '</text>';
        }
        walk(node.left); walk(node.right);
        const text = name(node.j) + ' ≤ ' + fr(node.s, 2);
        nodes += wide ? '<circle cx="' + node._x.toFixed(1) + '" cy="' + y + '" r="' + (node._active ? 7 : 5) + '" fill="#fff" stroke="' + (node._active ? COL.ochre : COL.ink) + '" stroke-width="' + (node._active ? 3 : 1.4) + '"/>'
          : '<rect x="' + (node._x - 42).toFixed(1) + '" y="' + (y - 11) + '" width="84" height="22" rx="6" fill="#fff" stroke="' + (node._active ? COL.ochre : COL.ink) + '" stroke-width="' + (node._active ? 2.5 : 1) + '"/><text x="' + node._x.toFixed(1) + '" y="' + (y + 4) + '" text-anchor="middle" class="as-tick" style="font-size:11px;fill:' + COL.ink + '">' + text + '</text>';
      } else {
        const c = node.pred ? COL.dog : COL.cat;
        nodes += wide ? '<circle cx="' + node._x.toFixed(1) + '" cy="' + y + '" r="6" fill="' + c + '"/>'
          : '<rect x="' + (node._x - 22).toFixed(1) + '" y="' + (y - 11) + '" width="44" height="22" rx="11" fill="' + c + '"/><text x="' + node._x.toFixed(1) + '" y="' + (y + 4) + '" text-anchor="middle" class="as-tick" style="font-size:11px;fill:#fff;font-weight:700">' + (node.n - node.n1) + ' | ' + node.n1 + '</text>';
      }
    })(t);
    return '<div class="as-side-figure"><svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Arbre de décision à ' + n + ' feuilles et de profondeur ' + depth + '">' + edges + nodes + '</svg></div>' +
      (wide ? '' : '<p class="as-side-caption">Dans chaque feuille : chats | chiens.</p>');
  }
  // Coupes de l'arbre, chacune limitée à la zone de son nœud.
  function cuts(t, box = {x1: [...D.x1], x2: [...D.x2]}) {
    if (!t.left) return '';
    const seg = t.j === 'x1' ? 'M' + X(t.s).toFixed(1) + ' ' + Y(box.x2[0]).toFixed(1) + 'V' + Y(box.x2[1]).toFixed(1) : 'M' + X(box.x1[0]).toFixed(1) + ' ' + Y(t.s).toFixed(1) + 'H' + X(box.x1[1]).toFixed(1);
    const a = {x1: [...box.x1], x2: [...box.x2]}, b = {x1: [...box.x1], x2: [...box.x2]};
    a[t.j][1] = t.s; b[t.j][0] = t.s;
    return line(seg, COL.ink, 2) + cuts(t.left, a) + cuts(t.right, b);
  }

  /* ------------------------------------------- 1. Quand la droite ne suffit plus */
  const fit24 = once(() => N.svm(A.byRole('train'), N.KERNELS.linear(), 1));
  const lineModel = (theta, off) => { const t = theta * Math.PI / 180, w1 = Math.cos(t), w2 = Math.sin(t); return {w1, w2, b: -(w1 * 7.5 + w2 * 4) - off}; };
  const scoreLine = (m, set) => { const n = set.filter(p => (m.w1 * p.x1 + m.w2 * p.x2 + m.b > 0 ? 1 : 0) === p.y).length; return Math.max(n, set.length - n) / set.length; };
  const bestLine = once(() => { let best = 0; for (let t = -90; t < 90; t += 2) for (let o = -8; o <= 8; o += .1) best = Math.max(best, scoreLine(lineModel(t, o), pts)); return best; });
  function linePath(m) {
    if (Math.abs(m.w2) < 1e-6) { const x = -m.b / m.w1; return 'M' + X(x).toFixed(1) + ' ' + Y(-2).toFixed(1) + 'L' + X(x).toFixed(1) + ' ' + Y(10).toFixed(1); }
    const f = x => -(m.w1 * x + m.b) / m.w2; return 'M' + X(-4).toFixed(1) + ' ' + Y(f(-4)).toFixed(1) + 'L' + X(20).toFixed(1) + ' ' + Y(f(20)).toFixed(1);
  }
  const thumbs = once(() => {
    const box = {L: 0, R: 150, T: 0, B: 110}, grid = {nx: 50, ny: 36};
    const tree = N.grow(pts, 3), rbf = N.svm(pts, N.KERNELS.rbf(.1), 10);
    const items = [['Couper l’espace', p => N.predictTree(tree, p)], ['Demander aux voisins', p => N.knn(pts, p, 5)], ['Changer d’espace', p => rbf.predict(p)]];
    const sx = v => (v - D.x1[0]) / (D.x1[1] - D.x1[0]) * 150, sy = v => 110 - (v - D.x2[0]) / (D.x2[1] - D.x2[0]) * 110;
    return '<div class="nl-thumbs">' + items.map(([label, fn]) => '<figure><svg viewBox="0 0 150 110" role="img" aria-label="' + label + '">' + mapPaths(fn, box, grid) +
      pts.map(p => '<circle cx="' + sx(p.x1).toFixed(1) + '" cy="' + sy(p.x2).toFixed(1) + '" r="2.6" fill="' + (p.y ? COL.dog : COL.cat) + '"/>').join('') + '<rect width="150" height="110" fill="none" stroke="' + COL.axis + '"/></svg><figcaption>' + label + '</figcaption></figure>').join('') + '</div>';
  });
  const whyShared = {theta: 0, off: 0};
  const whySpec = {
    id: 'nl-why-story', kicker: 'NON LINÉAIRE · LA DROITE NE SUFFIT PLUS', noDrag: true, scatter: {},
    footnote: 'Exemple synthétique : les chats et chiens du cours, plus des animaux ajoutés pour ce chapitre. Une droite est jugée sur tout le nuage, avec le meilleur choix de côté.',
    stages: [
      {title: 'La droite marchait', html: String.raw`<p>Au chapitre 2, une droite séparait presque tous nos chats et nos chiens : petits contre grands.</p>`},
      {title: 'Le refuge s’agrandit', html: String.raw`<p>Arrivent les petits chiens à poil court, les petits chiens à poil long, les grands chiens à poil long, et quelques animaux atypiques.</p><p>Tournez et déplacez la droite. Dépasserez-vous <strong>90 %</strong> ?</p>`,
        prompt: 'Les chats sont maintenant au milieu, les chiens autour. Que peut faire une droite ?',
        choices: [
          {t: 'Tout séparer, il suffit de bien la placer', why: 'Cherchez : quelle que soit la position, des chiens restent du côté des chats.'},
          {t: 'Laisser des chiens de chaque côté de la zone des chats', ok: true},
          {t: 'Rien : elle se trompe sur la moitié des animaux', why: 'Elle fait mieux que le hasard, mais plafonne loin de 90 %.'}],
        answer: 'Une droite n’a que deux côtés. Elle ne peut pas entourer une région.'},
      {title: 'Trois façons de s’en sortir', html: String.raw`<p>La meilleure droite possible plafonne. Trois idées pour faire mieux, qui sont le plan de ce chapitre :</p><ul><li><strong>couper</strong> l’espace en rectangles : les arbres ;</li><li><strong>demander aux voisins</strong> : les k-NN ;</li><li><strong>changer d’espace</strong>, là où une droite suffit : les noyaux.</li></ul>`}
    ],
    shared: whyShared,
    reset() { Object.assign(whyShared, {theta: 0, off: 0}); },
    canonical() { return {theta: 40, off: 0}; },
    init() {},
    controls(ctx) { return ctx.stage === 1 ? slider('theta', 'Orientation', ctx.state.theta, -90, 90, 1, ctx.state.theta + '°') + slider('off', 'Position', ctx.state.off, -8, 8, .1, fr(ctx.state.off, 1)) : ''; },
    wire(ctx) { wireRange(ctx, 'theta', v => { ctx.state.theta = v; }, v => v + '°'); wireRange(ctx, 'off', v => { ctx.state.off = v; }, v => fr(v, 1)); },
    draw(ctx) {
      const st = ctx.stage, set = st === 0 ? A.byRole('train') : pts;
      ctx.svg.querySelector('desc').textContent = 'Nuage des animaux et droite de séparation.';
      if (st === 0) {
        const m = fit24(), a = N.acc(m.predict, set);
        const w = (p => m.score(p) - m.b), w1 = w({x1: 1, x2: 0}), w2 = w({x1: 0, x2: 1});
        setLines(ctx, line(linePath({w1, w2, b: m.b}), COL.ink, 2.6));
        placeDots(ctx, set.map(a => dot(a, {scale: 1})));
        ctx.side.innerHTML = '<p class="as-side-caption">24 animaux, une droite apprise par SVM.</p>';
        ctx.readout.innerHTML = '<strong>' + pct(a) + ' bien classés</strong><span>Une droite suffit.</span>';
      } else if (st === 1) {
        const m = lineModel(ctx.state.theta, ctx.state.off), a = scoreLine(m, pts);
        setLines(ctx, line(linePath(m), COL.ink, 2.6));
        placeDots(ctx, pts.map(p => dot(p)));
        ctx.side.innerHTML = goal(a >= .9, a >= .9 ? 'Atteint.' : 'Dépasser 90 % avec une seule droite.', 'nl-why');
        ctx.readout.innerHTML = '<strong>' + pct(a) + ' bien classés</strong><span>' + pts.length + ' animaux, ' + pts.filter(p => !p.y).length + ' chats, ' + pts.filter(p => p.y).length + ' chiens.</span>';
      } else {
        setLines(ctx, '');
        placeDots(ctx, pts.map(p => dot(p)));
        ctx.side.innerHTML = thumbs();
        ctx.readout.innerHTML = '<strong>Meilleure droite possible : ' + pct(bestLine()) + '</strong><span>Trois modèles non linéaires, sur les mêmes animaux.</span>';
      }
    }
  };

  /* ---------------------------------------------------- 2. Arbres de décision */
  const rootBest = once(() => N.bestSplit(pts));
  const DEPTHS = [1, 2, 3, 4, 5, 6, 7, 8];
  const treeAt = memo(d => N.grow(pts, d));
  const depthCurve = once(() => ({train: DEPTHS.map(d => { const t = treeAt(d); return 100 * N.acc(p => N.predictTree(t, p), pts); }), cv: DEPTHS.map(d => 100 * N.looDepth(pts, d))}));
  const seqFull = once(() => N.pruneSeq(N.grow(pts)));
  const pruneCurve = once(() => {
    const s = seqFull(), alphas = s.map((x, i) => i < s.length - 1 ? Math.sqrt(Math.max(x.alpha, 1e-6) * s[i + 1].alpha) : x.alpha + .01);
    return {train: s.map(x => 100 * N.acc(p => N.predictTree(x.tree, p), pts)), cv: alphas.map(a => 100 * N.looAlpha(pts, a))};
  });
  const treeMap = memo(key => { const t = key[0] === 'd' ? treeAt(+key.slice(1)) : seqFull()[+key.slice(1)].tree; return mapPaths(p => N.predictTree(t, p)); });
  const bar = (label, v, color) => '<div class="as-bar-row"><span class="as-bar-label">' + label + '</span><span class="as-bar-track"><i style="width:' + (v / .5 * 100).toFixed(1) + '%;background:' + color + '"></i></span><span class="as-bar-value">' + fr(v, 3) + '</span></div>';
  const treeShared = {j: 'x1', s: 7, cut: 1, depth: 3, prune: 0};
  const tex = (v, d = 3) => fr(v, d).replace(',', '{,}');
  const cutText = (j, c) => name(j) + ' ≤ ' + fr(c, 2) + ' ' + unit(j);
  // Un nœud : son mélange en barre, puis le calcul de son Gini avec ses propres effectifs.
  function nodeCard(label, q) {
    const dogs = q.n1, cats = q.n - q.n1;
    return '<div class="nl-node"><div class="nl-node-head"><strong>' + label + '</strong><span>' + cats + ' chats, ' + dogs + ' chiens</span></div>' +
      '<div class="nl-mix"><i style="flex:' + cats + ';background:' + COL.cat + '"></i><i style="flex:' + dogs + ';background:' + COL.dog + '"></i></div>' +
      '<p>' + (q.n ? '\\(2\\times\\tfrac{' + dogs + '}{' + q.n + '}\\times\\tfrac{' + cats + '}{' + q.n + '}=' + tex(q.impurity) + '\\)' : 'Nœud vide') + '</p></div>';
  }
  // La parabole 2p(1 − p) : 0 pour un nœud pur, 0,5 pour un mélange à parts égales.
  function giniCurve(p) {
    const W = 260, H = 132, L = 30, R = 246, T = 12, B = 96, px = v => L + v * (R - L), py = v => B - v / .5 * (B - T);
    let d = ''; for (let i = 0; i <= 50; i++) d += (i ? 'L' : 'M') + px(i / 50).toFixed(1) + ' ' + py(N.gini(i / 50)).toFixed(1);
    const tick = (x, y, t, a = 'middle') => '<text x="' + x + '" y="' + y + '" text-anchor="' + a + '" class="as-tick">' + t + '</text>';
    return '<div class="as-side-figure"><svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Gini selon la part de chiens : 0 pour un nœud pur, 0,5 à parts égales">' +
      '<path d="M' + L + ' ' + T + 'V' + B + 'H' + R + '" fill="none" stroke="' + COL.axis + '"/><path d="' + d + '" fill="none" stroke="' + COL.ink + '" stroke-width="2.2"/>' +
      tick(L - 6, B + 4, '0', 'end') + tick(L - 6, T + 4, '0,5', 'end') + tick(L, B + 16, 'que des chats', 'start') + tick(R, B + 16, 'que des chiens', 'end') + tick((L + R) / 2, B + 32, 'part de chiens \u00a0p') +
      '<circle cx="' + px(p).toFixed(1) + '" cy="' + py(N.gini(p)).toFixed(1) + '" r="5" fill="' + COL.ochre + '"/></svg></div>';
  }
  // Le gain de chaque seuil essayé, une courbe par variable, sur la même échelle.
  function gainCurves(best) {
    const W = 300, H = 92, L = 8, R = 292, T = 8, B = 66;
    const fig = j => {
      const list = N.thresholds(pts, j), ys = list.map(c => N.gain(pts, j, c).gain), px = c => L + (c - D[j][0]) / (D[j][1] - D[j][0]) * (R - L), py = v => B - Math.max(v, 0) / best.gain * (B - T);
      const d = list.map((c, i) => (i ? 'L' : 'M') + px(c).toFixed(1) + ' ' + py(ys[i]).toFixed(1)).join(''), hit = j === best.j;
      return '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Gain selon le seuil, ' + name(j) + '"><path d="M' + L + ' ' + B + 'H' + R + '" stroke="' + COL.axis + '"/><path d="' + d + '" fill="none" stroke="' + COL.ink + '" stroke-width="2"/>' +
        (hit ? '<circle cx="' + px(best.s).toFixed(1) + '" cy="' + py(best.gain).toFixed(1) + '" r="5" fill="' + COL.ochre + '"/><text x="' + (px(best.s) + 9).toFixed(1) + '" y="' + (py(best.gain) + 8).toFixed(1) + '" class="as-tick" style="font-weight:700;fill:' + COL.ink + '">gain ' + fr(best.gain, 3) + ' à ' + fr(best.s, 2) + ' ' + unit(j) + '</text>' : '') +
        '<text x="' + L + '" y="' + (B + 16) + '" class="as-tick">' + fr(D[j][0], 0) + '</text><text x="' + R + '" y="' + (B + 16) + '" text-anchor="end" class="as-tick">' + fr(D[j][1], 0) + '</text><text x="' + ((L + R) / 2) + '" y="' + (B + 16) + '" text-anchor="middle" class="as-tick">seuil sur le ' + name(j) + '</text></svg>';
    };
    return '<div class="as-side-figure nl-gains">' + fig('x1') + fig('x2') + '</div>';
  }
  // Les coupes d'un arbre de profondeur 3, niveau par niveau, chacune avec la zone qu'elle coupe.
  const cutList = once(() => {
    const out = [], queue = [{node: treeAt(3), box: {x1: [...D.x1], x2: [...D.x2]}}];
    while (queue.length) {
      const {node, box} = queue.shift(); if (!node.left) continue;
      out.push({node, box});
      const a = {x1: [...box.x1], x2: [...box.x2]}, b = {x1: [...box.x1], x2: [...box.x2]};
      a[node.j][1] = node.s; b[node.j][0] = node.s;
      queue.push({node: node.left, box: a}, {node: node.right, box: b});
    }
    return out;
  });
  // L'arbre après k coupes : les nœuds pas encore coupés restent des feuilles.
  const partialTree = memo(k => {
    const done = new Set(cutList().slice(0, k).map(c => c.node)), active = cutList()[k - 1].node;
    const copy = node => { const {left, right, ...rest} = node; rest._active = node === active; return done.has(node) ? {...rest, left: copy(left), right: copy(right)} : rest; };
    return copy(treeAt(3));
  });
  const partialMap = memo(k => mapPaths(p => N.predictTree(partialTree(k), p)));
  const treeSpec = {
    id: 'tree-story', kicker: 'ARBRES · UNE QUESTION À LA FOIS', noDrag: true, scatter: {},
    footnote: 'Algorithme CART, impureté de Gini, sur les 46 animaux. Le score de validation est un leave-one-out : chaque animal est prédit par un arbre appris sans lui.',
    stages: [
      {title: 'Mesurer le mélange', html: String.raw`<p>Un <strong>nœud</strong> est un groupe d’animaux. Le Gini dit à quel point il est mélangé :</p><p>\(\text{Gini}=2\,p\,(1-p)\), où \(p\) est la part de chiens.</p><p><strong>0</strong> : une seule espèce. <strong>0,5</strong> : moitié-moitié.</p>`,
        prompt: 'Un nœud ne contient que des chiens. Que vaut son Gini ?',
        choices: [
          {t: '0', ok: true},
          {t: '0,5', why: 'C’est la valeur quand il y a autant de chats que de chiens.'},
          {t: '1', why: 'Ici \\(p=1\\), donc \\(2\\times1\\times0=0\\).'}],
        answer: '\\(p=1\\), donc \\(2\\times1\\times0=0\\) : le nœud est pur.'},
      {title: 'Une coupe, deux nœuds', html: String.raw`<p>Posons une question sur <strong>une variable</strong> et un <strong>seuil</strong> : pelage ≤ 4,25 cm ?</p><p>Le plan se coupe en deux, et les animaux aussi. On calcule le Gini de chaque nœud, avec la même formule.</p>`},
      {title: 'Le gain', html: String.raw`<p>Après la coupe, on fait la moyenne des deux Gini. Un gros nœud compte plus qu’un petit.</p><p>Le <strong>gain</strong>, c’est ce que le mélange a perdu.</p>`},
      {title: 'À vous', html: String.raw`<p>Changez la variable et déplacez le seuil. Le calcul se refait à chaque position.</p><p>Cherchez le plus grand gain.</p>`},
      {title: 'L’algorithme teste tout', html: String.raw`<p>L’algorithme fait la même chose : il essaie <strong>chaque variable</strong> et <strong>chaque seuil</strong>, entre deux valeurs voisines.</p><p>Il garde le plus grand gain.</p>`,
        prompt: 'Et ensuite ? Les deux nœuds sont encore mélangés.',
        choices: [
          {t: 'On recommence dans chaque nœud, séparément', ok: true},
          {t: 'On revient modifier la première coupe', why: 'Jamais : CART est glouton. Une coupe faite n’est plus remise en cause.'},
          {t: 'On trace une droite oblique dans ce nœud', why: 'CART ne coupe que parallèlement aux axes : une variable, un seuil.'}],
        answer: 'CART est <strong>récursif et glouton</strong> : à chaque nœud, la meilleure coupe du moment.'},
      {title: 'Couper chaque zone', html: String.raw`<p>Chaque zone du plan est un nœud. On y refait le même calcul, <strong>avec les seuls animaux de cette zone</strong>.</p><p>Avancez coupe par coupe. Chaque zone finale prédit sa classe <strong>majoritaire</strong>.</p><p>Le plan devient des rectangles : la frontière est un <strong>escalier</strong>.</p>`},
      {title: 'Jusqu’où couper ?', html: String.raw`<p>L’arbre maximal classe parfaitement les animaux qu’il a vus. Regardez le score de validation.</p><p><strong>Peu de coupes :</strong> beaucoup de biais. <strong>Beaucoup de coupes :</strong> beaucoup de variance.</p>`,
        prompt: 'Quelle profondeur retenir ?',
        choices: [
          {t: 'Celle où le score d’apprentissage atteint 100 %', why: 'Ce score monte toujours avec la profondeur : l’arbre apprend aussi le bruit, jusqu’aux animaux atypiques.'},
          {t: 'Celle où le score de validation est le plus haut', ok: true},
          {t: 'La plus petite : un arbre simple est toujours meilleur', why: 'À profondeur 1, le biais est énorme : regardez la courbe.'}],
        answer: 'On choisit sur des données que l’arbre n’a pas vues, comme au chapitre 1.'},
      {title: 'Élaguer', html: String.raw`<p>Plutôt que de décider quand arrêter : on construit l’arbre maximal \(\mathcal T_{\max}\), puis une suite d’arbres emboîtés, en retirant à chaque fois la branche la moins utile.</p>`,
        details: {title: 'La suite emboîtée', html: String.raw`<p>\(\mathcal T_{\max}=\mathcal T_0\supset\mathcal T_1\supset\dots\supset\mathcal T_K\). Puis on sélectionne un arbre dans cette suite, par validation croisée.</p>`}}
    ],
    shared: treeShared,
    reset() { Object.assign(treeShared, {j: 'x1', s: 7, cut: 1, depth: 3, prune: 0}); },
    canonical(stage) { return {j: stage === 3 ? 'x1' : rootBest().j, s: stage === 3 ? 7 : rootBest().s, cut: cutList().length, depth: stage === 6 ? 6 : 3, prune: stage === 7 ? 3 : 0}; },
    init() {},
    controls(ctx) {
      const s = ctx.state, st = ctx.stage;
      if (st === 3) { const r = D[s.j]; return buttons('var', [['x1', 'Poids'], ['x2', 'Pelage']], s.j) + slider('seuil', 'Seuil', s.s, r[0], r[1], .05, fr(s.s, 2) + ' ' + unit(s.j)); }
      if (st === 5) return slider('cut', 'Coupes', s.cut, 1, cutList().length, 1, s.cut);
      if (st === 6) return slider('depth', 'Profondeur', s.depth, 1, 8, 1, s.depth);
      if (st === 7) return slider('prune', 'Branches retirées', s.prune, 0, seqFull().length - 1, 1, s.prune);
      return '';
    },
    wire(ctx) {
      const s = ctx.state;
      wireButtons(ctx, 'var', v => { s.j = v; s.s = (D[v][0] + D[v][1]) / 2; });
      wireRange(ctx, 'seuil', v => { s.s = v; }, v => fr(v, 2) + ' ' + unit(s.j));
      wireRange(ctx, 'cut', v => { s.cut = v; }, v => v);
      wireRange(ctx, 'depth', v => { s.depth = v; }, v => v);
      wireRange(ctx, 'prune', v => { s.prune = v; }, v => v);
    },
    draw(ctx) {
      const st = ctx.stage, s = ctx.state, best = rootBest();
      ctx.svg.querySelector('desc').textContent = 'Nuage des animaux et coupes de l’arbre.';
      placeDots(ctx, pts.map(p => dot(p)));
      const after = g => g.node.impurity - g.gain;
      if (st === 0) {
        const q = best.node;
        setLines(ctx, '');
        ctx.side.innerHTML = nodeCard('Tous les animaux', q) + giniCurve(q.p);
        ctx.readout.innerHTML = '<strong>Gini = ' + fr(q.impurity, 3) + '</strong><span>Presque moitié-moitié : très mélangé.</span>';
      } else if (st <= 4) {
        const j = st === 3 ? s.j : best.j, c = st === 3 ? s.s : best.s, g = N.gain(pts, j, c);
        const seg = j === 'x1' ? 'M' + X(c).toFixed(1) + ' ' + Y(D.x2[0]) + 'V' + Y(D.x2[1]) : 'M' + X(D.x1[0]) + ' ' + Y(c).toFixed(1) + 'H' + X(D.x1[1]);
        setLines(ctx, mapPaths(p => (p[j] <= c ? g.left.pred : g.right.pred)) + line(seg, COL.ink, 2.6));
        const labels = [name(j) + ' ≤ ' + fr(c, 2), name(j) + ' > ' + fr(c, 2)];
        if (st === 1) {
          ctx.side.innerHTML = nodeCard(labels[0], g.left) + nodeCard(labels[1], g.right);
          ctx.readout.innerHTML = '<strong>Gini : ' + fr(g.left.impurity, 3) + ' et ' + fr(g.right.impurity, 3) + '</strong><span>Un nœud assez pur, un nœud encore très mélangé.</span>';
        } else if (st === 2) {
          ctx.side.innerHTML = bar('Avant', g.node.impurity, COL.axis) + bar('Après', after(g), COL.ochre) +
            '<p class="nl-calc">\\(\\text{Après}=\\tfrac{' + g.left.n + '}{' + g.node.n + '}\\times' + tex(g.left.impurity) + '+\\tfrac{' + g.right.n + '}{' + g.node.n + '}\\times' + tex(g.right.impurity) + '=' + tex(after(g)) + '\\)</p>' +
            '<p class="nl-calc">\\(\\text{Gain}=' + tex(g.node.impurity) + '-' + tex(after(g)) + '=' + tex(g.gain) + '\\)</p>';
          ctx.readout.innerHTML = '<strong>Gain = ' + fr(g.gain, 3) + '</strong><span>' + cutText(j, c) + '.</span>';
        } else if (st === 3) {
          const ok = g.gain >= best.gain - 5e-4;
          const row = (t, q) => '<tr><td>' + t + '</td><td>' + (q.n - q.n1) + '</td><td>' + q.n1 + '</td><td>' + fr(q.impurity, 3) + '</td></tr>';
          ctx.side.innerHTML = '<table class="as-table"><thead><tr><th>Nœud</th><th>Chats</th><th>Chiens</th><th>Gini</th></tr></thead><tbody>' + row(labels[0], g.left) + row(labels[1], g.right) + '</tbody></table>' +
            goal(ok, ok ? 'La meilleure coupe du nuage.' : 'Trouver la coupe au plus grand gain.', 'nl-coupe');
          ctx.readout.innerHTML = '<strong>Gain = ' + fr(g.node.impurity, 3) + ' − ' + fr(after(g), 3) + ' = ' + fr(g.gain, 3) + '</strong><span>' + cutText(j, c) + '.</span>';
        } else {
          ctx.side.innerHTML = gainCurves(best);
          ctx.readout.innerHTML = '<strong>Première question : ' + cutText(j, c) + ' ?</strong><span>' + (N.thresholds(pts, 'x1').length + N.thresholds(pts, 'x2').length) + ' seuils testés, sur 2 variables.</span>';
        }
      } else if (st === 5) {
        const list = cutList(), k = Math.min(s.cut, list.length), t = partialTree(k), {node, box} = list[k - 1];
        const seg = node.j === 'x1' ? 'M' + X(node.s).toFixed(1) + ' ' + Y(box.x2[0]).toFixed(1) + 'V' + Y(box.x2[1]).toFixed(1) : 'M' + X(box.x1[0]).toFixed(1) + ' ' + Y(node.s).toFixed(1) + 'H' + X(box.x1[1]).toFixed(1);
        const zone = '<rect x="' + X(box.x1[0]).toFixed(1) + '" y="' + Y(box.x2[1]).toFixed(1) + '" width="' + (X(box.x1[1]) - X(box.x1[0])).toFixed(1) + '" height="' + (Y(box.x2[0]) - Y(box.x2[1])).toFixed(1) + '" fill="none" stroke="' + COL.ochre + '" stroke-width="2.5"/>';
        setLines(ctx, partialMap(k) + cuts(t) + zone + line(seg, COL.ochre, 3.4));
        const afterNode = (node.left.n * node.left.impurity + node.right.n * node.right.impurity) / node.n;
        ctx.side.innerHTML = treeFigure(t) + '<p class="as-side-caption">Coupe ' + k + ' : dans cette zone, ' + (node.n - node.n1) + ' chats et ' + node.n1 + ' chiens. Le Gini passe de ' + fr(node.impurity, 3) + ' à ' + fr(afterNode, 3) + '.</p>';
        ctx.readout.innerHTML = '<strong>' + cutText(node.j, node.s) + ' ?</strong><span>' + N.leaves(t) + ' zones · ' + pct(N.acc(p => N.predictTree(t, p), pts)) + ' bien classés.</span>';
      } else if (st === 6) {
        const t = treeAt(s.depth), a = depthCurve();
        setLines(ctx, treeMap('d' + s.depth) + cuts(t));
        ctx.side.innerHTML = curves({xs: DEPTHS, x: s.depth, xlabel: 'profondeur', series: [{label: 'apprentissage', ys: a.train, color: COL.cat}, {label: 'validation', ys: a.cv, color: COL.dog, dy: 12}]});
        const i = DEPTHS.indexOf(s.depth);
        ctx.readout.innerHTML = '<strong>' + N.leaves(t) + ' feuille' + (N.leaves(t) > 1 ? 's' : '') + ' · ' + fr(a.train[i], 0) + ' % en apprentissage</strong><span>Validation : ' + fr(a.cv[i], 0) + ' %.</span>';
      } else {
        const seq = seqFull(), x = seq[s.prune], c = pruneCurve();
        setLines(ctx, treeMap('p' + s.prune) + cuts(x.tree));
        ctx.side.innerHTML = treeFigure(x.tree) + curves({xs: seq.map(q => q.leaves), x: x.leaves, xlabel: 'feuilles de l’arbre', H: 160, series: [{label: 'apprentissage', ys: c.train, color: COL.cat}, {label: 'validation', ys: c.cv, color: COL.dog, dy: 12}]});
        ctx.readout.innerHTML = '<strong>\\(\\mathcal T_{' + s.prune + '}\\) : ' + x.leaves + ' feuille' + (x.leaves > 1 ? 's' : '') + '</strong><span>Apprentissage ' + fr(c.train[s.prune], 0) + ' %, validation ' + fr(c.cv[s.prune], 0) + ' %.</span>';
      }
    }
  };

  /* ---------------------------------------------------- 3. Arbre de régression */
  const DOGS = [[22, 3.4], [25, 4.1], [27, 3.8], [30, 6.2], [32, 5.4], [35, 7.1], [37, 6.5], [52, 24], [55, 27.5], [58, 26], [61, 33], [64, 31], [68, 38], [72, 41]].map(([x, y]) => ({x, y}));
  const RG = {W: 480, H: 340, L: 50, R: 468, T: 12, B: 296, x0: 15, x1: 80, y1: 48};
  const rx = v => RG.L + (v - RG.x0) / (RG.x1 - RG.x0) * (RG.R - RG.L), ry = v => RG.B - v / RG.y1 * (RG.B - RG.T);
  const regAll = once(() => N.regSplit(DOGS, Infinity).left);
  const REG_CUT = 44.5; // Au milieu du vide entre 37 et 52 cm : la meilleure première coupe.
  // Coupes successives : à chaque pas, celle qui fait le plus baisser le total, dans la zone où elle se trouve.
  const regCuts = once(() => {
    let leaves = [{a: RG.x0, b: RG.x1, q: DOGS}]; const seq = [];
    for (let k = 0; k < 5; k++) {
      let best = null;
      for (const leaf of leaves) {
        const xs = leaf.q.map(d => d.x).sort((u, v) => u - v), base = N.regSplit(leaf.q, Infinity).left.sse;
        for (let i = 1; i < xs.length; i++) { const s = (xs[i] + xs[i - 1]) / 2, drop = base - N.regSplit(leaf.q, s).sse; if (!best || drop > best.drop + 1e-9) best = {leaf, s, drop}; }
      }
      if (!best || best.drop < 1e-9) break;
      const {leaf, s} = best;
      leaves = leaves.flatMap(l => l === leaf ? [{a: l.a, b: s, q: l.q.filter(d => d.x <= s)}, {a: s, b: l.b, q: l.q.filter(d => d.x > s)}] : [l]);
      seq.push({s, leaves, zone: leaf});
    }
    return seq;
  });
  const leafFit = l => N.regSplit(l.q, Infinity).left;
  const regTotal = leaves => leaves.reduce((t, l) => t + leafFit(l).sse, 0);
  const regBar = (label, v, max, color) => '<div class="as-bar-row"><span class="as-bar-label">' + label + '</span><span class="as-bar-track"><i style="width:' + (v / max * 100).toFixed(1) + '%;background:' + color + '"></i></span><span class="as-bar-value">' + fr(v, 1) + '</span></div>';
  const regLeaf = (label, f) => '<div class="nl-node"><div class="nl-node-head"><strong>' + label + '</strong><span>' + f.n + ' chiens</span></div><p>Moyenne ' + fr(f.mean, 1) + ' kg · somme des carrés ' + fr(f.sse, 1) + '</p></div>';
  const regShared = {s: 33, cut: 1};
  const regSpec = {
    id: 'tree-reg-story', kicker: 'ARBRES · ET POUR UNE VALEUR ?', noDrag: true, axes: ['Taille au garrot (cm)', 'Poids (kg)'],
    plotSVG(uid) {
      const xt = [20, 30, 40, 50, 60, 70, 80].map(v => '<path d="M' + rx(v) + ' ' + RG.T + 'V' + RG.B + '" stroke="' + COL.grid + '"/><text x="' + rx(v) + '" y="' + (RG.B + 22) + '" text-anchor="middle" class="as-tick">' + v + '</text>').join('');
      const yt = [0, 10, 20, 30, 40].map(v => '<path d="M' + RG.L + ' ' + ry(v) + 'H' + RG.R + '" stroke="' + COL.grid + '"/><text x="' + (RG.L - 10) + '" y="' + (ry(v) + 5) + '" text-anchor="end" class="as-tick">' + v + '</text>').join('');
      return '<svg class="as-scatter" viewBox="0 0 ' + RG.W + ' ' + RG.H + '" role="img" aria-labelledby="' + uid + '-t"><title id="' + uid + '-t">Poids des chiens selon leur taille, et prédiction de l’arbre</title><desc></desc>' + xt + yt + '<path d="M' + RG.L + ' ' + RG.T + 'V' + RG.B + 'H' + RG.R + '" fill="none" stroke="' + COL.axis + '"/><g class="rg-fit"></g>' +
        DOGS.map(d => '<circle cx="' + rx(d.x).toFixed(1) + '" cy="' + ry(d.y).toFixed(1) + '" r="6" fill="' + COL.dog + '" stroke="#fff"/>').join('') + '</svg>';
    },
    footnote: 'Exemple synthétique : 14 chiens, une seule variable pour pouvoir tout dessiner.',
    stages: [
      {title: 'Une valeur à prédire', html: String.raw`<p>On ne prédit plus chat ou chien, mais un <strong>nombre</strong> : le poids, à partir de la taille.</p><p>Un nœud prédit donc la <strong>moyenne</strong> de ses chiens.</p>`},
      {title: 'Mesurer l’erreur', html: String.raw`<p>Le Gini compte des espèces : il ne sert plus ici.</p><p>On prend l’écart de chaque chien à la moyenne (les traits), on le met au carré, et on additionne : c’est la <strong>somme des carrés</strong>.</p><p>Plus elle est petite, meilleur est le nœud.</p>`},
      {title: 'Une coupe, deux moyennes', html: String.raw`<p>Coupons à 44,5 cm. Chaque côté prédit <strong>sa</strong> moyenne, et a sa somme des carrés.</p><p>On additionne les deux : le total a fortement baissé.</p>`},
      {title: 'À vous', html: String.raw`<p>Déplacez le seuil. Cherchez le <strong>plus petit total</strong>.</p>`,
        details: {title: 'Le critère', html: String.raw`<p>On choisit le couple \((j,s)\) qui minimise \(\sum_{X_i\in\mathcal N_1}(Y_i-\bar Y_1)^2+\sum_{X_i\in\mathcal N_2}(Y_i-\bar Y_2)^2\).</p>`}},
      {title: 'Couper encore', html: String.raw`<p>On recommence dans chaque zone, avec les seuls chiens de cette zone.</p><p>La prédiction devient un <strong>escalier</strong> : une marche par feuille.</p>`}
    ],
    shared: regShared,
    reset() { Object.assign(regShared, {s: 33, cut: 1}); },
    canonical() { return {s: REG_CUT, cut: regCuts().length}; },
    init() {},
    controls(ctx) {
      if (ctx.stage === 3) return slider('s', 'Seuil', ctx.state.s, 18, 76, .5, fr(ctx.state.s, 1) + ' cm');
      if (ctx.stage === 4) return slider('cut', 'Coupes', ctx.state.cut, 1, regCuts().length, 1, ctx.state.cut);
      return '';
    },
    wire(ctx) { wireRange(ctx, 's', v => { ctx.state.s = v; }, v => fr(v, 1) + ' cm'); wireRange(ctx, 'cut', v => { ctx.state.cut = v; }, v => v); },
    draw(ctx) {
      const st = ctx.stage, all = regAll(), g = ctx.svg.querySelector('.rg-fit');
      ctx.svg.querySelector('desc').textContent = 'Poids des chiens selon leur taille, moyenne de chaque zone et écarts à cette moyenne.';
      const s = st === 3 ? ctx.state.s : REG_CUT;
      const step = regCuts()[Math.min(ctx.state.cut, regCuts().length) - 1];
      const leaves = st < 2 ? [{a: RG.x0, b: RG.x1, q: DOGS}] : st === 4 ? step.leaves : [{a: RG.x0, b: s, q: DOGS.filter(d => d.x <= s)}, {a: s, b: RG.x1, q: DOGS.filter(d => d.x > s)}];
      const fit = leaves.filter(l => l.q.length).map(l => { const m = leafFit(l).mean; return '<path d="M' + rx(l.a) + ' ' + ry(m) + 'H' + rx(l.b) + '" stroke="' + COL.cat + '" stroke-width="3"/>' + (st === 0 ? '' : l.q.map(d => '<path d="M' + rx(d.x) + ' ' + ry(d.y) + 'V' + ry(m) + '" stroke="' + COL.error + '" opacity=".6"/>').join('')); }).join('');
      const seams = st < 2 ? '' : st === 4 ? step.leaves.slice(1).map(l => '<path d="M' + rx(l.a) + ' ' + RG.T + 'V' + RG.B + '" stroke="' + (l.a === step.s ? COL.ochre : COL.ink) + '" stroke-width="' + (l.a === step.s ? 2.6 : 1) + '" stroke-dasharray="5 4"/>').join('') : '<path d="M' + rx(s) + ' ' + RG.T + 'V' + RG.B + '" stroke="' + COL.ink + '" stroke-dasharray="5 4"/>';
      g.innerHTML = seams + fit;
      if (st === 0) {
        ctx.side.innerHTML = '<p class="nl-calc">\\(\\text{Moyenne}=\\dfrac{3{,}4+4{,}1+\\dots+41}{14}=' + tex(all.mean, 1) + '\\) kg</p>';
        ctx.readout.innerHTML = '<strong>Prédiction : ' + fr(all.mean, 1) + ' kg</strong><span>La même pour tous les chiens, petits ou grands.</span>';
      } else if (st === 1) {
        const m = tex(all.mean, 1);
        ctx.side.innerHTML = '<p class="nl-calc">\\((3{,}4-' + m + ')^2+(4{,}1-' + m + ')^2\\)</p><p class="nl-calc">\\(+\\dots+(41-' + m + ')^2=' + tex(all.sse, 1) + '\\)</p>';
        ctx.readout.innerHTML = '<strong>Somme des carrés : ' + fr(all.sse, 1) + '</strong><span>Une seule moyenne pour 14 chiens : les écarts sont grands.</span>';
      } else if (st === 2) {
        const r = N.regSplit(DOGS, s);
        ctx.side.innerHTML = regLeaf('Taille ≤ ' + fr(s, 1) + ' cm', r.left) + regLeaf('Taille > ' + fr(s, 1) + ' cm', r.right) + regBar('Avant', all.sse, all.sse, COL.axis) + regBar('Après', r.sse, all.sse, COL.ochre) +
          '<p class="nl-calc">\\(' + tex(r.left.sse, 1) + '+' + tex(r.right.sse, 1) + '=' + tex(r.sse, 1) + '\\)</p>';
        ctx.readout.innerHTML = '<strong>Total : ' + fr(r.sse, 1) + '</strong><span>Il était de ' + fr(all.sse, 1) + ' avant la coupe.</span>';
      } else if (st === 3) {
        const r = N.regSplit(DOGS, s), ok = r.sse <= N.regSplit(DOGS, REG_CUT).sse + 1e-6;
        ctx.side.innerHTML = '<table class="as-table"><thead><tr><th>Côté</th><th>Chiens</th><th>Moyenne</th><th>Somme des carrés</th></tr></thead><tbody><tr><td>gauche</td><td>' + r.left.n + '</td><td>' + fr(r.left.mean, 1) + ' kg</td><td>' + fr(r.left.sse, 1) + '</td></tr><tr><td>droite</td><td>' + r.right.n + '</td><td>' + fr(r.right.mean, 1) + ' kg</td><td>' + fr(r.right.sse, 1) + '</td></tr></tbody></table>' +
          goal(ok, ok ? 'La meilleure coupe.' : 'Rendre le total le plus petit possible.', 'nl-reg');
        ctx.readout.innerHTML = '<strong>Total : ' + fr(r.left.sse, 1) + ' + ' + fr(r.right.sse, 1) + ' = ' + fr(r.sse, 1) + '</strong><span>Seuil : ' + fr(s, 1) + ' cm.</span>';
      } else {
        const rows = step.leaves.map(l => { const f = leafFit(l), lo = Math.min(...l.q.map(d => d.x)), hi = Math.max(...l.q.map(d => d.x)); return '<tr><td>' + lo + ' à ' + hi + ' cm</td><td>' + f.n + '</td><td>' + fr(f.mean, 1) + ' kg</td></tr>'; }).join('');
        ctx.side.innerHTML = '<table class="as-table"><thead><tr><th>Feuille</th><th>Chiens</th><th>Prédiction</th></tr></thead><tbody>' + rows + '</tbody></table>';
        ctx.readout.innerHTML = '<strong>Total : ' + fr(regTotal(step.leaves), 1) + '</strong><span>Nouvelle coupe à ' + fr(step.s, 1) + ' cm · ' + step.leaves.length + ' feuilles.</span>';
      }
    }
  };

  /* ------------------------------------------------------ 4. k plus proches voisins */
  const KS = [1, 3, 5, 7, 9, 11, 15, 21, 31];
  const knnMap = memo((k, metric, kx) => mapPaths(p => N.knn(pts, p, k, metric, kx)));
  const knnCurve = once(() => ({train: KS.map(k => 100 * N.acc(p => N.knn(pts, p, k), pts)), cv: KS.map(k => 100 * N.looK(pts, k))}));
  const knnShared = {k: 1, u: {x1: 5.4, x2: 2.6}, metric: 'euclidienne', grams: false, kIdx: 0};
  const knnSpec = {
    id: 'knn-story', kicker: 'K-NN · DEMANDER AUX VOISINS', scatter: {},
    keysHint: 'Glissez l’animal inconnu. Clavier : flèches.',
    footnote: 'Mêmes 46 animaux. Le score de validation est un leave-one-out : chaque animal vote sans se compter lui-même. Aucun apprentissage ici : le modèle, ce sont les données.',
    stages: [
      {title: 'Le plus proche', html: String.raw`<p>Pour classer un animal, pas de paramètres à apprendre : on regarde qui lui ressemble le plus, et on copie.</p><p>Déplacez l’animal inconnu.</p>`},
      {title: 'k voisins votent', html: String.raw`<p>Un seul voisin peut être un cas atypique. Faisons voter les \(k\) plus proches.</p><p>Le modèle : (1) choisir \(k\) et une distance ; (2) trouver les \(k\) voisins ; (3) vote majoritaire.</p>`,
        prompt: 'Pourquoi prendre \\(k\\) impair ici ?',
        choices: [
          {t: 'Pour éviter les égalités entre deux classes', ok: true},
          {t: 'Parce que l’algorithme ne fonctionne pas avec \\(k\\) pair', why: 'Il fonctionne, mais une égalité à 2 contre 2 demande une règle de plus.'},
          {t: 'Pour que le calcul soit plus rapide', why: 'Le coût dépend de \\(n\\), pas de la parité de \\(k\\).'}],
        answer: 'Avec deux classes, un nombre impair de voix donne toujours une majorité.'},
      {title: 'Le choix de k', html: String.raw`<p>Faites varier \(k\) : voici la frontière que dessine le vote, partout.</p><p><strong>Petit \(k\) :</strong> frontière très flexible, sensible au bruit. <strong>Grand \(k\) :</strong> frontière plus lisse, biais plus élevé.</p>`,
        prompt: 'À \\(k=1\\), le score d’apprentissage vaut 100 %. Est-ce une bonne nouvelle ?',
        choices: [
          {t: 'Non : chaque animal est son propre plus proche voisin', ok: true},
          {t: 'Oui : le modèle ne fait aucune erreur', why: 'Regardez le score de validation à \\(k=1\\).'},
          {t: 'Oui : c’est la preuve que \\(k=1\\) est le meilleur choix', why: 'On choisit \\(k\\) par validation croisée, pas sur les données mémorisées.'}],
        answer: 'Ce 100 % ne dit rien. Le score de validation, lui, est faible à \\(k=1\\) et baisse aussi à grand \\(k\\).'},
      {title: 'Quelle distance ?', html: String.raw`<p>« Proche » dépend de la distance et des <strong>unités</strong>.</p><p>Changez de distance : la carte bouge un peu. Passez le poids en grammes : elle change complètement. Le pelage ne compte plus.</p>`,
        note: {kind: 'ghost', html: String.raw`Standardisez d’abord : \(Z_{ij}=(X_{ij}-\mu_j)/\sigma_j\).`}}
    ],
    shared: knnShared,
    reset() { Object.assign(knnShared, {k: 1, u: {x1: 5.4, x2: 2.6}, metric: 'euclidienne', grams: false, kIdx: 0}); },
    canonical(stage) { return {k: stage === 1 ? 5 : 1, u: {x1: 5.4, x2: 2.6}, metric: 'euclidienne', grams: false, kIdx: stage === 2 ? 2 : 0}; },
    init() {},
    position(ctx) { return ctx.state.u; },
    movable(ctx, id) { return id === 'u' && ctx.stage <= 1; },
    move(ctx, id, x1, x2) { ctx.state.u = {x1, x2}; },
    focusOrder(ctx) { return ctx.stage <= 1 ? ['u'] : []; },
    controls(ctx) {
      const s = ctx.state, st = ctx.stage;
      if (st === 1) return slider('k', 'Voisins \\(k\\)', s.k, 1, 15, 2, s.k);
      if (st === 2) return slider('ki', 'Voisins \\(k\\)', s.kIdx, 0, KS.length - 1, 1, KS[s.kIdx]);
      if (st === 3) return buttons('metric', [['euclidienne', 'Euclidienne'], ['manhattan', 'Manhattan'], ['tchebychev', 'Tchebychev']], s.metric) + buttons('grams', [['false', 'Poids en kg'], ['true', 'Poids en grammes']], s.grams);
      return '';
    },
    wire(ctx) {
      const s = ctx.state;
      wireRange(ctx, 'k', v => { s.k = v; }, v => v);
      wireRange(ctx, 'ki', v => { s.kIdx = v; }, v => KS[v]);
      wireButtons(ctx, 'metric', v => { s.metric = v; });
      wireButtons(ctx, 'grams', v => { s.grams = v === 'true'; });
    },
    draw(ctx) {
      const st = ctx.stage, s = ctx.state;
      ctx.svg.querySelector('desc').textContent = 'Nuage des animaux, animal inconnu et ses voisins.';
      if (st <= 1) {
        const k = st ? s.k : 1, nn = N.neighbours(pts, s.u, k), ids = new Set(nn.map(o => o.p.id)), pred = N.knn(pts, s.u, k), r = nn[nn.length - 1].d;
        const rxp = r / (D.x1[1] - D.x1[0]) * (SC.R - SC.L), ryp = r / (D.x2[1] - D.x2[0]) * (SC.B - SC.T);
        setLines(ctx, '<ellipse cx="' + X(s.u.x1).toFixed(1) + '" cy="' + Y(s.u.x2).toFixed(1) + '" rx="' + rxp.toFixed(1) + '" ry="' + ryp.toFixed(1) + '" fill="#ffe58f" fill-opacity=".28" stroke="' + COL.ochre + '" stroke-dasharray="4 4"/>' +
          nn.map(o => line('M' + X(s.u.x1).toFixed(1) + ' ' + Y(s.u.x2).toFixed(1) + 'L' + X(o.p.x1).toFixed(1) + ' ' + Y(o.p.x2).toFixed(1), COL.ochre, 1.6)).join(''));
        placeDots(ctx, pts.map(p => dot(p, {opacity: ids.has(p.id) ? 1 : .4})).concat(unknown(s.u)));
        const dogs = nn.filter(o => o.p.y).length;
        ctx.side.innerHTML = '<table class="as-table"><thead><tr><th>Voisin</th><th>Distance</th></tr></thead><tbody>' + nn.slice(0, 7).map(o => '<tr><td>' + (o.p.y ? 'Chien' : 'Chat') + '</td><td>' + fr(o.d, 2) + '</td></tr>').join('') + (nn.length > 7 ? '<tr><td colspan="2">… ' + (nn.length - 7) + ' de plus</td></tr>' : '') + '</tbody></table>';
        ctx.readout.innerHTML = '<strong>Prédiction : ' + (pred ? 'chien' : 'chat') + '</strong><span>' + (k - dogs) + ' chat' + (k - dogs > 1 ? 's' : '') + ', ' + dogs + ' chien' + (dogs > 1 ? 's' : '') + '.</span>';
      } else if (st === 2) {
        const k = KS[s.kIdx], c = knnCurve();
        setLines(ctx, knnMap(k, 'euclidienne', 1));
        placeDots(ctx, pts.map(p => dot(p)));
        ctx.side.innerHTML = curves({xs: KS, x: k, xlabel: 'nombre de voisins k', series: [{label: 'apprentissage', ys: c.train, color: COL.cat, dy: -4}, {label: 'validation', ys: c.cv, color: COL.dog, dy: 12}]});
        ctx.readout.innerHTML = '<strong>k = ' + k + ' · ' + fr(c.train[s.kIdx], 0) + ' % en apprentissage</strong><span>Validation : ' + fr(c.cv[s.kIdx], 0) + ' %.</span>';
      } else {
        const kx = s.grams ? 1000 : 1;
        setLines(ctx, knnMap(5, s.metric, kx));
        placeDots(ctx, pts.map(p => dot(p)));
        const score = N.looK(pts, 5, s.metric, kx);
        ctx.side.innerHTML = '<table class="as-table"><thead><tr><th>Distance</th><th>Formule</th></tr></thead><tbody><tr><td>Euclidienne</td><td>\\(\\sqrt{\\sum_j(x_j-x_j\')^2}\\)</td></tr><tr><td>Manhattan</td><td>\\(\\sum_j|x_j-x_j\'|\\)</td></tr><tr><td>Tchebychev</td><td>\\(\\max_j|x_j-x_j\'|\\)</td></tr></tbody></table>';
        ctx.readout.innerHTML = '<strong>k = 5, ' + s.metric + (s.grams ? ', poids en grammes' : '') + '</strong><span>Validation : ' + pct(score) + '.</span>';
      }
    }
  };

  /* --------------------------------------------------------- 5. Soulever les points */
  const LIFT = [[1, 1.8], [1, 2.2], [1, 2.6], [0, 3.4], [0, 3.8], [0, 4.6], [0, 5], [0, 5.7], [0, 6.4], [1, 8.2], [1, 9], [1, 10.4], [1, 11.1]].map(([y, x]) => ({y, x, kind: y ? 'chien' : 'chat'}));
  const T1 = 3, T2 = 7.3;
  const LF = {L: 50, R: 468, B: 340, H: 310, xMax: 12};
  const lx = v => LF.L + v / LF.xMax * (LF.R - LF.L), ly = (v2, t) => LF.B - t * v2 / (LF.xMax * LF.xMax) * LF.H;
  const liftShared = {t: 0};
  const liftSpec = {
    id: 'lift-story', kicker: 'NOYAUX · SOULEVER LES POINTS', noDrag: true, axes: ['Poids \\(x\\) (kg)', 'Nouvelle mesure \\(x^{2}\\)'],
    plotSVG(uid) {
      const xt = [0, 2, 4, 6, 8, 10, 12].map(v => '<text x="' + lx(v) + '" y="' + (LF.B + 22) + '" text-anchor="middle" class="as-tick">' + v + '</text>').join('');
      return '<svg class="as-scatter" viewBox="0 0 480 380" role="img" aria-labelledby="' + uid + '-t"><title id="' + uid + '-t">Animaux décrits par leur poids, soulevés sur la parabole x au carré</title><desc></desc>' +
        '<path d="M' + LF.L + ' 20V' + LF.B + 'H' + LF.R + '" fill="none" stroke="' + COL.axis + '"/>' + xt + '<g class="lf-back"></g><g class="lf-pts">' + LIFT.map((p, i) => '<g data-i="' + i + '" class="lf-pt"><g transform="scale(.82)">' + A.head(p.kind) + '</g></g>').join('') + '</g></svg>';
    },
    footnote: 'Exemple synthétique, une seule mesure pour pouvoir dessiner les deux espaces.',
    stages: [
      {title: 'Une seule mesure', html: String.raw`<p>Gardons seulement le poids. Les petits chiens à gauche, les chats au milieu, les grands chiens à droite.</p>`,
        prompt: 'Un seul seuil sur le poids peut-il séparer chats et chiens ?',
        choices: [
          {t: 'Non : il faudrait deux seuils', ok: true},
          {t: 'Oui, si on le place au milieu des chats', why: 'Il couperait les chats en deux, et les chiens resteraient de chaque côté.'},
          {t: 'Oui, avec un SVM à marge souple', why: 'La marge souple tolère des erreurs. Elle ne plie pas la frontière.'}],
        answer: 'En dimension 1, un séparateur linéaire est un seuil unique : impossible ici.'},
      {title: 'Ajouter une mesure', html: String.raw`<p>Ajoutons une colonne calculée : \(\phi(x)=(x,\,x^2)\). Aucune donnée nouvelle, seulement un nouvel espace.</p><p>Soulevez les points.</p>`},
      {title: 'Là-haut, une droite suffit', html: String.raw`<p>Une <strong>droite</strong> sépare maintenant les chats des chiens.</p><p>Redescendue sur l’axe du poids, elle devient <strong>deux seuils</strong> : une frontière non linéaire.</p>`,
        details: {title: 'Pourquoi deux seuils', html: String.raw`<p>La droite \(x^2=(t_1+t_2)\,x-t_1t_2\) se réécrit \((x-t_1)(x-t_2)=0\). Elle coupe la parabole exactement en \(x=t_1\) et \(x=t_2\), ici \(3\) et \(7{,}3\) kg.</p>`}}
    ],
    shared: liftShared,
    reset() { liftShared.t = 0; },
    canonical(stage) { return {t: stage === 0 ? 0 : 1}; },
    init() {},
    controls(ctx) { return ctx.stage === 1 ? slider('t', 'Soulever', ctx.state.t, 0, 1, .02, pct(ctx.state.t)) : ''; },
    wire(ctx) { wireRange(ctx, 't', v => { ctx.state.t = v; }, v => pct(v)); },
    draw(ctx) {
      const st = ctx.stage, t = st === 0 ? 0 : st === 2 ? 1 : ctx.state.t;
      ctx.svg.querySelectorAll('.lf-pt').forEach(g => { const p = LIFT[+g.dataset.i]; g.setAttribute('transform', 'translate(' + lx(p.x).toFixed(1) + ' ' + (ly(p.x * p.x, t) - (t ? 0 : 16)).toFixed(1) + ')'); });
      let back = '';
      if (t > 0) { let d = ''; for (let v = 0; v <= 12; v += .25) d += (v ? 'L' : 'M') + lx(v).toFixed(1) + ' ' + ly(v * v, t).toFixed(1); back += line(d, COL.axis, 1.5, '4 4'); }
      if (st === 2) {
        const f = v => (T1 + T2) * v - T1 * T2;
        const a = 1.2, b = 12;
        back += line('M' + lx(a).toFixed(1) + ' ' + ly(f(a), 1).toFixed(1) + 'L' + lx(b).toFixed(1) + ' ' + ly(f(b), 1).toFixed(1), COL.ink, 2.6);
        back += [T1, T2].map(v => line('M' + lx(v).toFixed(1) + ' ' + ly(v * v, 1).toFixed(1) + 'V' + LF.B, COL.error, 1.6, '5 4')).join('');
        back += '<rect x="' + lx(T1) + '" y="' + (LF.B - 7) + '" width="' + (lx(T2) - lx(T1)) + '" height="7" fill="' + COL.cat + '"/><rect x="' + lx(0) + '" y="' + (LF.B - 7) + '" width="' + (lx(T1) - lx(0)) + '" height="7" fill="' + COL.dog + '"/><rect x="' + lx(T2) + '" y="' + (LF.B - 7) + '" width="' + (lx(12) - lx(T2)) + '" height="7" fill="' + COL.dog + '"/>';
      }
      ctx.svg.querySelector('.lf-back').innerHTML = back;
      ctx.side.innerHTML = st === 2 ? '<p class="as-side-caption">Sous la droite : chat. Au-dessus : chien.</p>' : '';
      ctx.readout.innerHTML = st === 0 ? '<strong>Une seule mesure : le poids</strong><span>Chiens, chats, chiens.</span>' : st === 1 ? '<strong>\\(\\phi(x)=(x,\\,x^{2})\\)</strong><span>De la dimension 1 à la dimension 2.</span>' : '<strong>Linéaire en \\(\\phi(x)\\), non linéaire en \\(x\\)</strong><span>Seuils : 3 et 7,3 kg.</span>';
    }
  };

  /* --------------------------------------------------------------- 6. Noyau RBF */
  const GAMMAS = [.01, .03, .1, .3, 1, 3, 10], CS = [.1, 1, 10, 100, 1000];
  // Validation croisée leave-one-out (%), lignes : γ, colonnes : C. Recalculée par scripts/check-nonlin.cjs.
  const RBF_CV = window.SID34_RBF_CV;
  const model = memo((g, c) => N.svm(pts, g === 'lin' ? N.KERNELS.linear() : N.KERNELS.rbf(+g), +c));
  const rbfMap = memo((g, c) => { const m = model(g, c); return mapPaths(p => m.predict(p)); });
  const showNum = v => fr(v, v < .1 ? 2 : v < 1 ? 1 : 0);
  const bestCV = once(() => Math.max(...RBF_CV.flat()));
  const rbfShared = {gi: 2, ci: 2};
  const rbfSpec = {
    id: 'rbf-story', kicker: 'NOYAUX · LE RBF ET SES RÉGLAGES', noDrag: true, scatter: {},
    footnote: 'SVM à noyau RBF sur les 46 animaux, résolu dans la page : mêmes résultats que scikit-learn. Le score de validation est un leave-one-out.',
    stages: [
      {title: 'Le noyau linéaire', html: String.raw`<p>Le SVM du chapitre 2 : une droite, et ses limites.</p>`},
      {title: 'Le noyau RBF', html: String.raw`<p>Le noyau le plus utilisé : \(K(x,x')=\exp(-\gamma\|x-x'\|^2)\).</p><p>Il mesure une <strong>ressemblance</strong> : 1 si deux animaux sont identiques, près de 0 s’ils sont loin.</p><p>La frontière s’enroule autour des chats. Cerclés : les <strong>vecteurs de support</strong>.</p>`},
      {title: 'γ : le rayon d’influence', html: String.raw`<p>\(\gamma\) règle le <strong>rayon d’influence</strong> de chaque vecteur de support.</p>`,
        prompt: 'Que se passe-t-il si \\(\\gamma\\) devient très grand ?',
        choices: [
          {t: 'Chaque animal forme son îlot : surapprentissage', ok: true},
          {t: 'La frontière devient une droite', why: 'C’est plutôt à très petit \\(\\gamma\\) que la frontière redevient très lisse.'},
          {t: 'Rien : seul \\(C\\) contrôle la complexité', why: 'Essayez : la carte change beaucoup avec \\(\\gamma\\).'}],
        answer: 'Grand \\(\\gamma\\) : influence très locale. Le score d’apprentissage monte, le score de validation chute.'},
      {title: 'C : le prix des erreurs', html: String.raw`<p>\(C\) grand : les erreurs coûtent cher, la frontière se plie pour les éviter.</p><p>\(C\) petit : frontière plus simple, plus d’erreurs tolérées.</p>`},
      {title: 'Régler les deux ensemble', html: String.raw`<p>On choisit \(\gamma\) et \(C\) <strong>ensemble</strong>, par validation croisée.</p><p>Cliquez une case de la grille.</p>`,
        note: {kind: 'ghost', html: String.raw`Le RBF dépend des distances : on standardise les variables, comme pour les k-NN.`}}
    ],
    shared: rbfShared,
    reset() { Object.assign(rbfShared, {gi: 2, ci: 2}); },
    canonical(stage) { return {gi: stage === 2 ? 6 : 2, ci: stage === 3 ? 4 : 2}; },
    init() {},
    controls(ctx) {
      const s = ctx.state, st = ctx.stage;
      if (st === 2) return slider('g', '\\(\\gamma\\)', s.gi, 0, GAMMAS.length - 1, 1, showNum(GAMMAS[s.gi]));
      if (st === 3) return slider('c', '\\(C\\)', s.ci, 0, CS.length - 1, 1, showNum(CS[s.ci]));
      return '';
    },
    wire(ctx) {
      const s = ctx.state;
      wireRange(ctx, 'g', v => { s.gi = v; }, v => showNum(GAMMAS[v]));
      wireRange(ctx, 'c', v => { s.ci = v; }, v => showNum(CS[v]));
    },
    draw(ctx) {
      const st = ctx.stage, s = ctx.state, lin = st === 0, c = lin ? 1 : CS[st === 1 ? 2 : s.ci], gi = st === 1 ? 2 : s.gi;
      const gg = lin ? 'lin' : GAMMAS[gi], m = model(gg, c), tr = N.acc(m.predict, pts), sv = new Set(m.sv.map(p => p.id));
      ctx.svg.querySelector('desc').textContent = 'Nuage des animaux et zones de décision du SVM.';
      setLines(ctx, rbfMap(gg, c));
      placeDots(ctx, pts.map(p => dot(p, {support: sv.has(p.id)})));
      const cv = lin ? null : RBF_CV[gi][CS.indexOf(c)];
      ctx.readout.innerHTML = '<strong>' + pct(tr) + ' en apprentissage' + (cv == null ? '' : ' · ' + fr(cv, 0) + ' % en validation') + '</strong><span>' + (lin ? 'Noyau linéaire, \\(C=1\\)' : '\\(\\gamma=' + showNum(GAMMAS[gi]).replace(',', '{,}') + '\\), \\(C=' + showNum(c).replace(',', '{,}') + '\\)') + ', ' + m.sv.length + ' vecteurs de support.</span>';
      if (st <= 1) ctx.side.innerHTML = '';
      else if (st <= 3) {
        const W = 300, H = 130, L = 34, R = W - 10, T = 10, B = H - 30, dMax = 8, gm = GAMMAS[gi];
        let d = ''; for (let i = 0; i <= 80; i++) { const x = i / 80 * dMax; d += (i ? 'L' : 'M') + (L + x / dMax * (R - L)).toFixed(1) + ' ' + (B - Math.exp(-gm * x * x) * (B - T)).toFixed(1); }
        ctx.side.innerHTML = st === 2 ? '<div class="as-side-figure"><svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Valeur du noyau selon la distance"><path d="M' + L + ' ' + T + 'V' + B + 'H' + R + '" fill="none" stroke="' + COL.axis + '"/><path d="' + d + '" fill="none" stroke="' + COL.cat + '" stroke-width="2.6"/><text x="' + (L - 6) + '" y="' + (T + 8) + '" text-anchor="end" class="as-tick">1</text><text x="' + (L - 6) + '" y="' + B + '" text-anchor="end" class="as-tick">0</text><text x="' + ((L + R) / 2) + '" y="' + (H - 6) + '" text-anchor="middle" class="as-tick">distance entre deux animaux</text></svg></div>' : '';
      } else {
        const best = bestCV();
        ctx.side.innerHTML = '<table class="as-table nl-grid"><caption>Score de validation (%)</caption><thead><tr><th>\\(\\gamma\\) \\ \\(C\\)</th>' + CS.map(v => '<th>' + showNum(v) + '</th>').join('') + '</tr></thead><tbody>' +
          GAMMAS.map((gv, i) => '<tr><th>' + showNum(gv) + '</th>' + CS.map((_, j) => { const v = RBF_CV[i][j]; return '<td><button type="button" data-cell="' + i + ',' + j + '" class="nl-cell' + (i === gi && CS[j] === c ? ' is-on' : '') + (v === best ? ' is-best' : '') + '" style="--v:' + Math.max(0, (v - 50) / 40).toFixed(2) + '" aria-label="gamma ' + showNum(gv) + ', C ' + showNum(CS[j]) + ', ' + fr(v, 0) + ' pour cent">' + fr(v, 0) + '</button></td>'; }).join('') + '</tr>').join('') + '</tbody></table>';
        ctx.side.querySelectorAll('[data-cell]').forEach(b => b.addEventListener('click', () => { const [a, q] = b.dataset.cell.split(','); s.gi = +a; s.ci = +q; ctx.commit(); }, {signal: ctx.signal}));
      }
    }
  };

  /* ------------------------------------------------------------------ 7. k-means */
  const blobs = A.byRole('train').concat(A.rabbits);
  const CLUSTER = ['#8a4f8c', '#2e6b4f', '#b07d2a', '#3d6fb4', '#b4532a', '#6e7380', '#c2558f', '#4aa3a2'];
  const runs = memo((k, seed) => N.lloyd(blobs, k, seed));
  const ELBOW = once(() => [1, 2, 3, 4, 5, 6, 7, 8].map(k => N.bestWCSS(blobs, k)));
  // Départs à montrer : ceux dont le résultat final diffère.
  const SEEDS = once(() => { const seen = new Map(); for (let s = 1; s <= 40; s++) { const st = runs(3, s), w = st[st.length - 1].wcss.toFixed(1); if (!seen.has(w)) seen.set(w, s); } return [...seen.values()].sort((a, b) => { const f = s => { const r = runs(3, s); return r[r.length - 1].wcss; }; return f(a) - f(b); }); });
  const STEPNAME = {init: 'Centroïdes de départ, tirés au hasard', assign: 'Chaque animal rejoint le centroïde le plus proche', update: 'Chaque centroïde va à la moyenne de son groupe'};
  function kmView(ctx, step, k, reveal) {
    const c = step.centres, lab = step.lab;
    const voronoi = lab ? (() => { let out = ''; c.forEach((_, i) => { const w = (SC.R - SC.L) / 44, h = (SC.B - SC.T) / 32; let d = ''; for (let r = 0; r < 32; r++) for (let q = 0; q < 44; q++) { const p = {x1: D.x1[0] + (q + .5) / 44 * (D.x1[1] - D.x1[0]), x2: D.x2[1] - (r + .5) / 32 * (D.x2[1] - D.x2[0])}; let b = 0; c.forEach((m, t) => { if ((p.x1 - m.x1) ** 2 + (p.x2 - m.x2) ** 2 < (p.x1 - c[b].x1) ** 2 + (p.x2 - c[b].x2) ** 2) b = t; }); if (b === i) d += 'M' + (SC.L + q * w).toFixed(1) + ' ' + (SC.T + r * h).toFixed(1) + 'h' + (w + .3).toFixed(1) + 'v' + (h + .3).toFixed(1) + 'h-' + (w + .3).toFixed(1) + 'z'; } out += '<path d="' + d + '" fill="' + CLUSTER[i] + '" opacity=".1"/>'; }); return out; })() : '';
    const under = lab ? blobs.map((p, i) => '<circle cx="' + X(p.x1).toFixed(1) + '" cy="' + Y(p.x2).toFixed(1) + '" r="13" fill="' + CLUSTER[lab[i]] + '" opacity=".55"/>').join('') : '';
    const marks = c.map((m, i) => { const x = X(m.x1), y = Y(m.x2); return '<g transform="translate(' + x.toFixed(1) + ' ' + y.toFixed(1) + ')"><path d="M-9 -9L9 9M-9 9L9 -9" stroke="#fff" stroke-width="7" stroke-linecap="round"/><path d="M-9 -9L9 9M-9 9L9 -9" stroke="' + CLUSTER[i] + '" stroke-width="4" stroke-linecap="round"/></g>'; }).join('');
    setLines(ctx, voronoi + under);
    placeDots(ctx, blobs.map(p => ({id: p.id, x: X(p.x1), y: Y(p.x2), scale: .8, hideLabel: !reveal, aria: reveal ? p.kind + ', ' + measures(p) : 'Animal sans étiquette, ' + measures(p)})));
    ctx.svg.querySelector('.as-over').innerHTML = marks;
  }
  const kmShared = {k: 3, step: 0, seedI: 0};
  const kmSpec = {
    id: 'kmeans-story', kicker: 'K-MEANS · DES GROUPES SANS ÉTIQUETTE', noDrag: true, scatter: {},
    footnote: 'Les 24 chats et chiens d’apprentissage et 13 lapins, sans étiquette. Pour la courbe du coude, on garde le meilleur résultat de 30 départs.',
    stages: [
      {title: 'Plus d’étiquettes', html: String.raw`<p>On n’a plus que les mesures. Pas de \(Y\), rien à prédire. Peut-on tout de même trouver des <strong>groupes</strong> ?</p><p>Comptez à l’œil : combien en voyez-vous ?</p>`},
      {title: 'Affecter, recalculer', html: String.raw`<p>Fixons \(k=3\). Avancez pas à pas :</p><ol><li>tirer \(k\) centroïdes au hasard ;</li><li><strong>affecter</strong> chaque animal au centroïde le plus proche ;</li><li><strong>recalculer</strong> chaque centroïde comme une moyenne ;</li><li>répéter jusqu’à ce que plus rien ne bouge.</li></ol>`,
        details: {title: 'Ce qui baisse à chaque étape', html: String.raw`<p>\(\mathrm{WCSS}=\sum_{i=1}^{k}\sum_{x\in C_i}\|x-\mu_i\|^2\), la somme des carrés intra-cluster. Affecter et recalculer ne peuvent que la faire baisser : l’algorithme s’arrête toujours, mais peut-être pas au meilleur résultat.</p>`}},
      {title: 'Un mauvais départ', html: String.raw`<p>Même données, même \(k\), un autre tirage de départ.</p>`,
        prompt: 'Comment se protéger d’un mauvais départ ?',
        choices: [
          {t: 'Lancer plusieurs départs et garder la plus petite WCSS', ok: true},
          {t: 'Augmenter le nombre d’itérations', why: 'L’algorithme a déjà convergé : il reste bloqué dans ce minimum local.'},
          {t: 'Choisir \\(k\\) plus petit', why: 'Cela change la question, sans résoudre le problème du départ.'}],
        answer: 'WCSS ne garantit qu’un minimum <strong>local</strong>. Plusieurs départs, ou une initialisation plus soignée (k-means++).'},
      {title: 'Combien de groupes ?', html: String.raw`<p>\(k\) doit être choisi à l’avance. On lance k-means pour plusieurs \(k\) et on trace la WCSS.</p><p>On cherche le <strong>coude</strong> : le point où la baisse ralentit fortement.</p>`,
        prompt: 'Pourquoi ne pas simplement prendre la plus petite WCSS ?',
        choices: [
          {t: 'Parce qu’elle baisse toujours quand \\(k\\) augmente', ok: true},
          {t: 'Parce qu’elle remonte après le coude', why: 'Regardez : elle ne remonte jamais.'},
          {t: 'Parce qu’elle dépend des unités', why: 'C’est vrai, mais ce n’est pas la raison ici.'}],
        answer: 'Avec \\(k=n\\), chaque animal est son propre centroïde et WCSS vaut 0. Ce n’est plus un résumé.'},
      {title: 'Et si on regardait ?', html: String.raw`<p>Révélons les espèces.</p><p>k-means a trouvé des groupes de <strong>points proches</strong>. Ils ressemblent à des espèces parce que ces espèces sont ici bien séparées. Rien ne l’obligeait à ce résultat.</p>`,
        note: {kind: 'ghost', html: String.raw`Un cluster n’est pas une classe. Et k-means préfère les groupes ronds : sur le nuage du refuge, avec les chats au milieu, il ne retrouverait pas chats et chiens.`}}
    ],
    shared: kmShared,
    reset() { Object.assign(kmShared, {k: 3, step: 0, seedI: 0}); },
    canonical(stage) { return {k: 3, step: stage === 1 ? 99 : 0, seedI: stage === 2 ? 1 : 0}; },
    init() {},
    onStage(ctx) { if (ctx.isStatic) return; if (ctx.stage === 1) ctx.state.step = Math.min(ctx.state.step, 1); if (ctx.stage === 2 && SEEDS().length > 1) ctx.state.seedI = SEEDS().slice(0, 5).length - 1; },
    controls(ctx) {
      const s = ctx.state, st = ctx.stage;
      if (st === 1) { const r = runs(3, SEEDS()[0]); return '<div class="nl-row"><button type="button" class="as-button as-primary" data-kstep' + (s.step >= r.length - 1 ? ' disabled' : '') + '>Étape suivante</button><button type="button" class="as-button" data-krestart>Recommencer</button></div>'; }
      if (st === 2) return buttons('seed', SEEDS().slice(0, 5).map((v, i) => [i, 'Départ ' + (i + 1)]), s.seedI);
      if (st === 3) return slider('kv', '\\(k\\)', s.k, 1, 8, 1, s.k);
      return '';
    },
    wire(ctx) {
      const s = ctx.state;
      ctx.controls.querySelector('[data-kstep]')?.addEventListener('click', () => { s.step++; ctx.commit({controls: true}); }, {signal: ctx.signal});
      ctx.controls.querySelector('[data-krestart]')?.addEventListener('click', () => { s.step = 0; ctx.commit({controls: true}); }, {signal: ctx.signal});
      wireButtons(ctx, 'seed', v => { s.seedI = +v; });
      wireRange(ctx, 'kv', v => { s.k = v; }, v => v);
    },
    draw(ctx) {
      const st = ctx.stage, s = ctx.state;
      ctx.svg.querySelector('desc').textContent = 'Animaux sans étiquette, groupes et centroïdes de k-means.';
      if (st === 0) {
        setLines(ctx, ''); ctx.svg.querySelector('.as-over').innerHTML = '';
        placeDots(ctx, blobs.map(p => ({id: p.id, x: X(p.x1), y: Y(p.x2), scale: .8, hideLabel: true, aria: 'Animal sans étiquette, ' + measures(p)})));
        ctx.side.innerHTML = ''; ctx.readout.innerHTML = '<strong>' + blobs.length + ' animaux, aucune étiquette</strong><span>Seulement poids et pelage.</span>';
      } else if (st === 1) {
        const r = runs(3, SEEDS()[0]), step = r[Math.min(s.step, r.length - 1)];
        kmView(ctx, step, 3, false);
        ctx.side.innerHTML = '<p class="as-side-caption">Étape ' + (Math.min(s.step, r.length - 1) + 1) + ' sur ' + r.length + '</p>';
        ctx.readout.innerHTML = '<strong>' + STEPNAME[step.kind] + '</strong><span>' + (step.wcss == null ? 'WCSS : pas encore de groupes.' : 'WCSS = ' + fr(step.wcss, 1)) + '</span>';
      } else if (st === 2) {
        const seeds = SEEDS(), r = runs(3, seeds[Math.min(s.seedI, seeds.length - 1)]), last = r[r.length - 1], best = runs(3, seeds[0]);
        kmView(ctx, last, 3, false);
        ctx.side.innerHTML = seeds.length < 2 ? '<p class="as-side-caption">Ici, tous les départs mènent au même résultat.</p>' : '<p class="as-side-caption">Meilleure WCSS trouvée : ' + fr(best[best.length - 1].wcss, 1) + '</p>';
        ctx.readout.innerHTML = '<strong>WCSS finale = ' + fr(last.wcss, 1) + '</strong><span>' + (last.wcss > best[best.length - 1].wcss + .05 ? 'Convergé… vers un moins bon résultat.' : 'Le meilleur des départs.') + '</span>';
      } else if (st === 3) {
        let bestSeed = 1, bw = Infinity; for (let i = 1; i <= 30; i++) { const q = runs(s.k, i), w = q[q.length - 1].wcss; if (w < bw) { bw = w; bestSeed = i; } }
        const q = runs(s.k, bestSeed); kmView(ctx, q[q.length - 1], s.k, false);
        const e = ELBOW();
        ctx.side.innerHTML = curves({xs: [1, 2, 3, 4, 5, 6, 7, 8], x: s.k, xlabel: 'nombre de groupes k', ylabel: 'WCSS', ymin: 0, ymax: 400, series: [{label: 'WCSS', ys: e, color: COL.cat}]});
        ctx.readout.innerHTML = '<strong>k = ' + s.k + ' : WCSS = ' + fr(bw, 1) + '</strong><span>Le coude est vers \\(k=3\\).</span>';
      } else {
        const seeds = SEEDS(), r = runs(3, seeds[0]), last = r[r.length - 1];
        kmView(ctx, last, 3, true);
        const kinds = ['chat', 'chien', 'lapin'], rows = [0, 1, 2].map(c => '<tr><td><span class="nl-swatch" style="background:' + CLUSTER[c] + '"></span>Groupe ' + (c + 1) + '</td>' + kinds.map(kd => '<td>' + blobs.filter((p, i) => last.lab[i] === c && p.kind === kd).length + '</td>').join('') + '</tr>').join('');
        ctx.side.innerHTML = '<table class="as-table"><thead><tr><th></th><th>Chats</th><th>Chiens</th><th>Lapins</th></tr></thead><tbody>' + rows + '</tbody></table>';
        ctx.readout.innerHTML = '<strong>k-means n’a jamais vu ces étiquettes</strong><span>On les regarde seulement après coup.</span>';
      }
    }
  };

  /* -------------------------------------------------------------------- 8. t-SNE */
  const DG = window.SID34_DIGITS;
  const DIGIT_COL = ['#8a4f8c', '#2e6b4f', '#b07d2a', '#3d6fb4', '#b4532a', '#c2558f', '#4aa3a2', '#6b7a1e', '#1d2433', '#d97a00'];
  const TS = {W: 480, H: 400, pad: 18};
  const tx = v => TS.pad + v / 1000 * (TS.W - 2 * TS.pad), ty = v => TS.pad + v / 1000 * (TS.H - 2 * TS.pad);
  function digitImage(i) {
    const h = DG.images[i]; let cells = '';
    for (let k = 0; k < 64; k++) { const v = parseInt(h[k], 16); cells += '<rect x="' + (k % 8) + '" y="' + Math.floor(k / 8) + '" width="1.02" height="1.02" fill="rgb(' + [29, 36, 51].map(c => Math.round(255 - (255 - c) * v / 15)).join(',') + ')"/>'; }
    return '<svg viewBox="0 0 8 8" class="nl-digit" role="img" aria-label="Image du chiffre ' + DG.labels[i] + '">' + cells + '</svg>';
  }
  const tsShared = {view: 'p30', hover: 12};
  const tsSpec = {
    id: 'tsne-story', kicker: 'T-SNE · VOIR EN GRANDE DIMENSION', noDrag: true, axes: ['', ''],
    plotSVG(uid) {
      return '<svg class="as-scatter nl-tsne" viewBox="0 0 ' + TS.W + ' ' + TS.H + '" role="img" aria-labelledby="' + uid + '-t"><title id="' + uid + '-t">800 images de chiffres manuscrits placées dans le plan</title><desc></desc><rect width="' + TS.W + '" height="' + TS.H + '" fill="#fff" stroke="' + COL.grid + '"/><g class="ts-pts">' +
        [...DG.labels].map((c, i) => '<text data-i="' + i + '" class="ts-pt" text-anchor="middle" dy=".35em">' + c + '</text>').join('') + '</g></svg>';
    },
    footnote: '800 images de 8 × 8 pixels du jeu « digits » (scikit-learn ; UCI, Optical Recognition of Handwritten Digits, CC BY 4.0). Coordonnées calculées à l’avance avec scikit-learn. Part de voisins de même chiffre : sur les 10 plus proches voisins de chaque image.',
    stages: [
      {title: 'Un point en dimension 64', html: String.raw`<p>Quittons les animaux. Voici de vraies images de chiffres manuscrits : 8 × 8 pixels, donc <strong>64 variables</strong>. Impossible à dessiner.</p><p>Survolez un point pour voir son image. Résumons d’abord avec l’ACP du chapitre 2, sans regarder les chiffres.</p>`},
      {title: 'L’ACP écrase tout', html: String.raw`<p>L’ACP garde les deux axes de plus grande variance, une <strong>projection linéaire</strong>. Colorons par chiffre : tout se chevauche.</p>`},
      {title: 't-SNE garde les voisins', html: String.raw`<p>t-SNE ne cherche pas à garder la variance, mais les <strong>voisinages locaux</strong> : deux images proches en dimension 64 doivent rester proches en 2D.</p><p>Les chiffres se rangent en amas, <strong>sans avoir jamais vu les étiquettes</strong>.</p>`,
        details: {title: 'Comment ça marche', html: String.raw`<p>En dimension 64, on transforme les distances en probabilités d’être voisins (lois gaussiennes). En 2D, on fait de même avec une loi de Student, d’où le « t ». On déplace les points pour que les deux tableaux de probabilités se ressemblent.</p>`}},
      {title: 'Un réglage, plusieurs images', html: String.raw`<p>La <strong>perplexité</strong> indique combien de voisins chaque point considère. Changez-la, puis changez seulement le tirage aléatoire.</p>`,
        prompt: 'Sur cette carte, deux amas sont très éloignés. Que peut-on en conclure ?',
        choices: [
          {t: 'Pas grand-chose : les distances entre amas ne sont pas fiables', ok: true},
          {t: 'Ces deux chiffres sont les plus différents du jeu de données', why: 'Changez le tirage : la position des amas change, leurs distances aussi.'},
          {t: 'L’amas le plus gros contient le plus d’images', why: 'Ici, chaque chiffre a 80 images. La taille d’un amas ne se lit pas non plus.'}],
        answer: 't-SNE conserve le local. La distance entre amas, leur taille et leur forme ne s’interprètent pas.'}
    ],
    shared: tsShared,
    reset() { Object.assign(tsShared, {view: 'p30', hover: 12}); },
    canonical(stage) { return {view: 'p30', hover: 12}; },
    init(ctx) {
      if (ctx.isStatic) return;
      ctx.svg.addEventListener('pointerover', e => { const i = e.target.dataset?.i; if (i == null) return; ctx.state.hover = +i; const box = ctx.side.querySelector('[data-image]'); if (box) box.innerHTML = digitImage(+i) + '<p class="as-side-caption">C’est un <strong>' + (ctx.stage === 0 ? '?' : DG.labels[+i]) + '</strong>' + (ctx.stage === 0 ? '' : '.') + '</p>'; }, {signal: ctx.signal});
    },
    controls(ctx) { return ctx.stage === 3 ? buttons('view', [['p5', 'Perplexité 5'], ['p30', 'Perplexité 30'], ['p100', 'Perplexité 100'], ['p30b', '30, autre tirage']], ctx.state.view) : ''; },
    wire(ctx) { wireButtons(ctx, 'view', v => { ctx.state.view = v; }); },
    draw(ctx) {
      const st = ctx.stage, s = ctx.state, view = st <= 1 ? 'pca' : st === 2 ? 'p30' : s.view, c = DG.views[view];
      ctx.svg.querySelectorAll('.ts-pt').forEach(el => { const i = +el.dataset.i; el.style.transform = 'translate(' + tx(c[2 * i]).toFixed(1) + 'px,' + ty(c[2 * i + 1]).toFixed(1) + 'px)'; el.style.fill = st === 0 ? '#9aa0ab' : DIGIT_COL[+el.textContent]; });
      ctx.side.innerHTML = '<div data-image>' + digitImage(s.hover) + '<p class="as-side-caption">C’est un <strong>' + (st === 0 ? '?' : DG.labels[s.hover]) + '</strong>' + (st === 0 ? '' : '.') + '</p></div>';
      const label = {pca: 'ACP', p5: 't-SNE, perplexité 5', p30: 't-SNE, perplexité 30', p100: 't-SNE, perplexité 100', p30b: 't-SNE, perplexité 30, autre tirage'}[view];
      ctx.readout.innerHTML = st === 0 ? '<strong>800 images, 64 variables</strong><span>Sans étiquette : résumées ici par l’ACP.</span>' : '<strong>' + label + ' : ' + fr(DG.stats[view], 0) + ' % de voisins du même chiffre</strong><span>' + (view === 'pca' ? 'L’ACP garde ' + fr(100 * (window.SID34_PCA.ratio[0] + window.SID34_PCA.ratio[1]), 0) + ' % de la variance.' : 'En dimension 64 : ' + fr(DG.stats.orig, 0) + ' %.') + '</span>';
    }
  };

  window.NLWhyStory = K.defineStory(whySpec);
  window.TreeStory = K.defineStory(treeSpec);
  window.TreeRegStory = K.defineStory(regSpec);
  window.KnnStory = K.defineStory(knnSpec);
  window.LiftStory = K.defineStory(liftSpec);
  window.RBFStory = K.defineStory(rbfSpec);
  window.KMeansStory = K.defineStory(kmSpec);
  window.TSNEStory = K.defineStory(tsSpec);
})();
