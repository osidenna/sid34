(function (root) {
  'use strict';
  /* Chapitre 3 : les algorithmes eux-mêmes, sans dessin. Arbres CART, k plus proches voisins,
     SVM à noyau (dual, choix de paires de LIBSVM), k-means. Vérifiés face à scikit-learn : scripts/check-nonlin.cjs. */
  const A = root.Animals || (typeof require !== 'undefined' ? require('./animals.js') : null);
  // Le nuage du chapitre : les chats et chiens d'apprentissage, 4 chats de plus, et les chiens qui cassent la droite.
  const refuge = A.animals.filter(a => a.role === 'train' || (a.role === 'test' && a.y === 0)).concat(A.visitors);
  const acc = (pred, pts) => pts.filter(p => pred(p) === p.y).length / pts.length;

  /* ---------------------------------------------------------------- arbres */
  const gini = p => 2 * p * (1 - p);
  const FEATURES = ['x1', 'x2'];
  function stats(pts) { const n = pts.length, n1 = pts.filter(p => p.y === 1).length, p = n ? n1 / n : 0; return {n, n1, p, impurity: gini(p), pred: n1 * 2 >= n ? 1 : 0}; }
  // Δ(I) = P(N) I(N) − (P(N1) I(N1) + P(N2) I(N2)), où P est la proportion d'observations du nœud.
  function gain(pts, j, s, N = pts.length) {
    const left = pts.filter(p => p[j] <= s), right = pts.filter(p => p[j] > s);
    const a = stats(pts), l = stats(left), r = stats(right);
    return {gain: (a.n * a.impurity - l.n * l.impurity - r.n * r.impurity) / N, left: l, right: r, node: a};
  }
  function thresholds(pts, j) { const v = [...new Set(pts.map(p => p[j]))].sort((a, b) => a - b); return v.slice(1).map((x, i) => (x + v[i]) / 2); }
  function bestSplit(pts, N = pts.length) {
    let best = null;
    for (const j of FEATURES) for (const s of thresholds(pts, j)) { const g = gain(pts, j, s, N); if (!best || g.gain > best.gain + 1e-12) best = {j, s, ...g}; }
    return best;
  }
  function grow(pts, maxDepth = Infinity, N = pts.length, depth = 0) {
    const node = {...stats(pts), depth, pts};
    if (depth >= maxDepth || !node.n1 || node.n1 === node.n) return node;
    const b = bestSplit(pts, N);
    if (!b || b.gain <= 1e-12) return node;
    return Object.assign(node, {j: b.j, s: b.s, gain: b.gain, left: grow(pts.filter(p => p[b.j] <= b.s), maxDepth, N, depth + 1), right: grow(pts.filter(p => p[b.j] > b.s), maxDepth, N, depth + 1)});
  }
  const predictTree = (t, p) => { while (t.left) t = p[t.j] <= t.s ? t.left : t.right; return t.pred; };
  const leaves = t => t.left ? leaves(t.left) + leaves(t.right) : 1;
  const depthOf = t => t.left ? 1 + Math.max(depthOf(t.left), depthOf(t.right)) : 0;
  // Élagage coût-complexité : suite d'arbres emboîtés T0 ⊃ T1 ⊃ … ; on retire à chaque fois le maillon le plus faible.
  function pruneSeq(tree, N = tree.n) {
    const cost = t => t.n * t.impurity / N, subCost = t => t.left ? subCost(t.left) + subCost(t.right) : cost(t);
    const clone = t => ({...t, left: t.left && clone(t.left), right: t.right && clone(t.right)});
    let cur = clone(tree), alpha = 0;
    const seq = [{tree: clone(cur), alpha: 0, leaves: leaves(cur)}];
    while (cur.left) {
      let min = Infinity;
      (function visit(t) { if (!t.left) return; min = Math.min(min, (cost(t) - subCost(t)) / (leaves(t) - 1)); visit(t.left); visit(t.right); })(cur);
      alpha = Math.max(alpha, min);
      (function cut(t) { if (!t.left) return; if ((cost(t) - subCost(t)) / (leaves(t) - 1) <= min + 1e-12) { delete t.left; delete t.right; return; } cut(t.left); cut(t.right); })(cur);
      seq.push({tree: clone(cur), alpha, leaves: leaves(cur)});
    }
    return seq;
  }
  const atAlpha = (seq, alpha) => { let best = seq[0]; for (const s of seq) if (s.alpha <= alpha + 1e-12) best = s; return best.tree; };
  const loo = (pts, fit) => pts.filter((p, i) => fit(pts.filter((_, k) => k !== i))(p) === p.y).length / pts.length;
  const looDepth = (pts, depth) => loo(pts, tr => { const t = grow(tr, depth); return p => predictTree(t, p); });
  const looAlpha = (pts, alpha) => loo(pts, tr => { const t = atAlpha(pruneSeq(grow(tr)), alpha); return p => predictTree(t, p); });
  // Arbre de régression à une coupe : somme des carrés à gauche et à droite d'un seuil.
  function regSplit(pts, s) {
    const part = q => { const m = q.reduce((a, p) => a + p.y, 0) / (q.length || 1); return {n: q.length, mean: m, sse: q.reduce((a, p) => a + (p.y - m) ** 2, 0)}; };
    const l = part(pts.filter(p => p.x <= s)), r = part(pts.filter(p => p.x > s));
    return {left: l, right: r, sse: l.sse + r.sse};
  }

  /* --------------------------------------------------------------- k-NN */
  const METRICS = {
    euclidienne: (dx, dy) => Math.hypot(dx, dy),
    manhattan: (dx, dy) => Math.abs(dx) + Math.abs(dy),
    tchebychev: (dx, dy) => Math.max(Math.abs(dx), Math.abs(dy))
  };
  function neighbours(pts, q, k, metric = 'euclidienne', kx = 1) {
    const d = METRICS[metric];
    return pts.map(p => ({p, d: d((p.x1 - q.x1) * kx, p.x2 - q.x2)})).sort((a, b) => a.d - b.d || a.p.id - b.p.id).slice(0, k);
  }
  const vote = nn => { const n1 = nn.filter(o => o.p.y === 1).length; return n1 * 2 > nn.length ? 1 : n1 * 2 < nn.length ? 0 : nn[0].p.y; };
  const knn = (pts, q, k, metric, kx) => vote(neighbours(pts, q, k, metric, kx));
  const looK = (pts, k, metric, kx) => loo(pts, tr => p => knn(tr, p, k, metric, kx));

  /* --------------------------------------------------------- SVM à noyau */
  const KERNELS = {
    linear: () => (a, b) => a.x1 * b.x1 + a.x2 * b.x2,
    rbf: gamma => (a, b) => Math.exp(-gamma * ((a.x1 - b.x1) ** 2 + (a.x2 - b.x2) ** 2)),
    poly: (d, c = 1) => (a, b) => (a.x1 * b.x1 + a.x2 * b.x2 + c) ** d
  };
  // max Σα − ½ΣΣ αα yy K, 0 ≤ α ≤ C, Σαy = 0 : à chaque tour, la paire qui viole le plus les conditions KKT.
  function svm(pts, K, C, tol = 1e-3) {
    const n = pts.length, y = pts.map(p => p.y ? 1 : -1), Q = pts.map(a => pts.map(b => K(a, b)));
    const alpha = new Float64Array(n), G = new Float64Array(n).fill(-1);
    for (let it = 0; it < 200000; it++) {
      let i = -1, j = -1, up = -Infinity, low = Infinity;
      for (let t = 0; t < n; t++) {
        const v = -y[t] * G[t];
        if ((y[t] > 0 ? alpha[t] < C : alpha[t] > 0) && v > up) { up = v; i = t; }
        if ((y[t] > 0 ? alpha[t] > 0 : alpha[t] < C) && v < low) { low = v; j = t; }
      }
      if (i < 0 || j < 0 || up - low < tol) break;
      const curve = Math.max(Q[i][i] + Q[j][j] - 2 * Q[i][j], 1e-12);
      let delta = (up - low) / curve;
      const roomI = y[i] > 0 ? C - alpha[i] : alpha[i], roomJ = y[j] > 0 ? alpha[j] : C - alpha[j];
      delta = Math.min(delta, roomI, roomJ);
      const di = y[i] * delta, dj = -y[j] * delta;
      alpha[i] += di; alpha[j] += dj;
      for (let t = 0; t < n; t++) G[t] += y[t] * (y[i] * Q[t][i] * di + y[j] * Q[t][j] * dj);
    }
    let sum = 0, free = 0, ub = Infinity, lb = -Infinity;
    for (let t = 0; t < n; t++) {
      const v = -y[t] * G[t];
      if (alpha[t] > 1e-8 && alpha[t] < C - 1e-8) { sum += v; free++; }
      else if (y[t] > 0 ? alpha[t] <= 1e-8 : alpha[t] >= C - 1e-8) lb = Math.max(lb, v);
      else ub = Math.min(ub, v);
    }
    const b = free ? sum / free : (ub + lb) / 2;
    const sv = [...alpha.keys()].filter(t => alpha[t] > 1e-8);
    const score = p => sv.reduce((s, t) => s + alpha[t] * y[t] * K(pts[t], p), b);
    return {alpha, b, sv: sv.map(t => pts[t]), score, predict: p => score(p) >= 0 ? 1 : 0};
  }
  const looSVM = (pts, K, C) => loo(pts, tr => svm(tr, K, C).predict);

  /* ------------------------------------------------------------- k-means */
  function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t ^= t + Math.imul(t ^ (t >>> 7), 61 | t); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  const d2 = (a, b) => (a.x1 - b.x1) ** 2 + (a.x2 - b.x2) ** 2;
  const wcss = (pts, centres, lab) => pts.reduce((s, p, i) => s + d2(p, centres[lab[i]]), 0);
  function seeds(pts, k, seed) { const r = rng(seed), idx = pts.map((_, i) => i); for (let i = idx.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [idx[i], idx[j]] = [idx[j], idx[i]]; } return idx.slice(0, k).map(i => ({x1: pts[i].x1, x2: pts[i].x2})); }
  const assign = (pts, centres) => pts.map(p => { let b = 0; centres.forEach((c, k) => { if (d2(p, c) < d2(p, centres[b])) b = k; }); return b; });
  const update = (pts, centres, lab) => centres.map((c, k) => { const q = pts.filter((_, i) => lab[i] === k); return q.length ? {x1: q.reduce((s, p) => s + p.x1, 0) / q.length, x2: q.reduce((s, p) => s + p.x2, 0) / q.length} : c; });
  // Toutes les étapes de Lloyd : initialiser, affecter, recalculer, affecter… jusqu'à la stabilité.
  function lloyd(pts, k, seed) {
    let c = seeds(pts, k, seed), lab = assign(pts, c);
    const steps = [{kind: 'init', centres: c, lab: null, wcss: null}, {kind: 'assign', centres: c, lab, wcss: wcss(pts, c, lab)}];
    for (let it = 0; it < 50; it++) {
      c = update(pts, c, lab); steps.push({kind: 'update', centres: c, lab, wcss: wcss(pts, c, lab)});
      const next = assign(pts, c);
      if (next.every((v, i) => v === lab[i])) break;
      lab = next; steps.push({kind: 'assign', centres: c, lab, wcss: wcss(pts, c, lab)});
    }
    return steps;
  }
  const bestWCSS = (pts, k, tries = 30) => { let b = Infinity; for (let s = 1; s <= tries; s++) { const st = lloyd(pts, k, s); b = Math.min(b, st[st.length - 1].wcss); } return b; };

  const api = {refuge, acc, gini, gain, thresholds, bestSplit, grow, predictTree, leaves, depthOf, pruneSeq, atAlpha, loo, looDepth, looAlpha, regSplit, neighbours, knn, looK, KERNELS, svm, looSVM, lloyd, bestWCSS};
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.NonLin = api;
})(typeof window !== 'undefined' ? window : globalThis);
