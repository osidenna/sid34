(function () {
  'use strict';
  /* Chapitre 2 · ACP en grande dimension : de vraies images de chiffres, 64 nombres ramenés à 2, et ce que la carte ne montre pas.
     Images : digits-tsne.js. Axes, parts de variance et piège 5 contre 8 : pca-digits.js, généré par scripts/build-pca.cjs. */
  const K = window.StoryKit, A = window.Animals, DG = window.SID34_DIGITS, P = window.SID34_PCA;
  const fr = A.fr, goal = K.goal, T = P.trap;
  const COL = {a: '#8a4f8c', b: '#2e6b4f', ink: '#1d2433', muted: '#6e7380', grid: '#efeff1', axis: '#c4c4ca', error: '#b4532a', one: '#3d6fb4', two: '#b07d2a', dot: '#9aa0ab'};
  const W = 480, H = 400;
  const pct = (v, d = 0) => fr(100 * v, d) + ' %';
  const slider = (key, label, value, min, max, step, shown) => '<label class="as-slider"><span>' + label + ' : <strong data-out="' + key + '">' + shown + '</strong></span><input type="range" data-range="' + key + '" min="' + min + '" max="' + max + '" step="' + step + '" value="' + value + '"></label>';
  function wireRange(ctx, key, set, show) {
    const input = ctx.controls.querySelector('[data-range="' + key + '"]'); if (!input) return;
    input.addEventListener('input', () => { set(+input.value); const out = ctx.controls.querySelector('[data-out="' + key + '"]'); if (out) out.textContent = show(+input.value); ctx.commit(); }, {signal: ctx.signal});
  }
  const buttons = (attr, list, cur) => '<div class="nl-row">' + list.map(([v, label]) => '<button type="button" class="as-button" data-' + attr + '="' + v + '" aria-pressed="' + (String(cur) === String(v)) + '">' + label + '</button>').join('') + '</div>';
  function wireButtons(ctx, attr, set) { ctx.controls.querySelectorAll('[data-' + attr + ']').forEach(b => b.addEventListener('click', () => { set(b.dataset[attr]); ctx.commit({controls: true}); }, {signal: ctx.signal})); }

  const pixels = DG.images.map(h => [...h].map(c => parseInt(c, 16)));
  const center = i => pixels[i].map((v, j) => v - P.mean[j]);
  const dotp = (a, b) => a.reduce((s, v, i) => s + v * b[i], 0);
  /* Coordonnées de chaque image sur les axes utilisés par les dessins. */
  const Z = pixels.map((_, i) => { const c = center(i); return [0, 1, 2, 3, 4, 5].map(k => dotp(P.axes[k], c)); });
  const PX = pixels.map((_, i) => { const c = center(i); return P.pixels.map(j => c[j]); });
  const cumul = (() => { let s = 0; return P.ratio.map(v => (s += v)); })();
  const kept = cumul[1], twoAxes = fr(100 * kept, 0), thrown = fr(100 * (1 - kept), 0);
  const OTHER = 5; // axe de faible variance avec lequel on fait tourner le premier
  const shareAt = deg => { const t = deg * Math.PI / 180; return P.ratio[0] * Math.cos(t) ** 2 + P.ratio[OTHER] * Math.sin(t) ** 2; };
  const sd = k => Math.sqrt(Z.reduce((s, z) => s + z[k] * z[k], 0) / Z.length);

  const shade = v => 'rgb(' + [29, 36, 51].map(c => Math.round(255 - (255 - c) * Math.max(0, Math.min(15, v)) / 15)).join(',') + ')';
  function digit(values, label) {
    let cells = ''; values.forEach((v, k) => { cells += '<rect x="' + (k % 8) + '" y="' + Math.floor(k / 8) + '" width="1.02" height="1.02" fill="' + shade(v) + '"/>'; });
    return '<svg viewBox="0 0 8 8" class="nl-digit" role="img" aria-label="' + label + '">' + cells + '</svg>';
  }
  /* Un axe vu comme une image : poids positifs en bleu, négatifs en ocre. */
  function axisImage(k) {
    const u = P.axes[k], big = Math.max(...u.map(Math.abs)); let cells = '';
    u.forEach((v, i) => { const a = Math.abs(v) / big; cells += '<rect x="' + (i % 8) + '" y="' + Math.floor(i / 8) + '" width="1.02" height="1.02" fill="' + (v > 0 ? COL.one : COL.two) + '" opacity="' + a.toFixed(2) + '"/>'; });
    return '<svg viewBox="0 0 8 8" class="nl-digit" role="img" aria-label="Axe ' + (k + 1) + ' vu comme une image">' + cells + '</svg>';
  }
  const label = (x, y, text, color = COL.ink, anchor = 'middle') => '<text x="' + x.toFixed(1) + '" y="' + y.toFixed(1) + '" text-anchor="' + anchor + '" class="ad-lab" fill="' + color + '">' + text + '</text>';
  const seg = (x1, y1, x2, y2, color, w = 1.4, dash = '') => '<path d="M' + x1.toFixed(1) + ' ' + y1.toFixed(1) + 'L' + x2.toFixed(1) + ' ' + y2.toFixed(1) + '" stroke="' + color + '" stroke-width="' + w + '"' + (dash ? ' stroke-dasharray="' + dash + '"' : '') + ' fill="none"/>';
  function arrow(x1, y1, x2, y2, color) {
    const a = Math.atan2(y2 - y1, x2 - x1), s = 9;
    return seg(x1, y1, x2, y2, color, 3) + '<path d="M' + x2.toFixed(1) + ' ' + y2.toFixed(1) + 'L' + (x2 - s * Math.cos(a - .45)).toFixed(1) + ' ' + (y2 - s * Math.sin(a - .45)).toFixed(1) + 'L' + (x2 - s * Math.cos(a + .45)).toFixed(1) + ' ' + (y2 - s * Math.sin(a + .45)).toFixed(1) + 'z" fill="' + color + '"/>';
  }
  const bars = rows => '<div class="as-bars">' + rows.map(r => '<div class="as-bar-row' + (r.on ? ' is-current' : '') + '"><span class="as-bar-label">' + r.t + '</span><span class="as-bar-track"><i style="width:' + (r.v * 100 / (r.max || 1)).toFixed(1) + '%;background:' + (r.c || COL.one) + '"></i></span><span class="as-bar-value">' + pct(r.v) + '</span></div>').join('') + '</div>';

  /* Place les 800 points : (x, y, couleur, opacité), avec une transition quand le dessin l'autorise. */
  function placePts(ctx, fn) {
    ctx.svg.querySelectorAll('.ad-pt').forEach((el, i) => { const [x, y, c, o] = fn(i); el.style.transform = 'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px)'; el.style.fill = c; el.style.opacity = o; });
  }
  const hidePts = ctx => placePts(ctx, () => [W / 2, H / 2, COL.dot, 0]);
  const setLayers = (ctx, under, over = '') => { ctx.svg.querySelector('.ad-under').innerHTML = under; ctx.svg.querySelector('.ad-over').innerHTML = over; };

  const PLANES = {
    px: {t: '2 pixels', v: pc => PX[pc], share: P.pixelShare, x: 'Pixel ' + (P.pixels[0] + 1), y: 'Pixel ' + (P.pixels[1] + 1)},
    a56: {t: 'Axes 5 et 6', v: pc => [Z[pc][4], Z[pc][5]], share: P.ratio[4] + P.ratio[5], x: 'Axe 5', y: 'Axe 6'},
    a34: {t: 'Axes 3 et 4', v: pc => [Z[pc][2], Z[pc][3]], share: P.ratio[2] + P.ratio[3], x: 'Axe 3', y: 'Axe 4'},
    a12: {t: 'Axes 1 et 2', v: pc => [Z[pc][0], Z[pc][1]], share: kept, x: 'Axe 1', y: 'Axe 2'}
  };

  const MAP = {cx: 240, cy: 196, s: 5.6};
  const mapX = v => MAP.cx + MAP.s * v, mapY = v => MAP.cy - MAP.s * v;
  const frame = '<rect x="8" y="8" width="' + (W - 16) + '" height="' + (H - 16) + '" fill="none" stroke="' + COL.grid + '"/>';
  const cross = seg(16, MAP.cy, W - 16, MAP.cy, COL.grid) + seg(MAP.cx, 16, MAP.cx, H - 16, COL.grid);

  const adShared = {img: 12, dims: 3, theta: 90, plane: 'px', k: 2};
  const adSpec = {
    id: 'acp-images-story', kicker: 'ACP · DE 64 NOMBRES À 2', noDrag: true, axes: ['', ''],
    plotSVG(uid) {
      return '<svg class="as-scatter ad-story" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-labelledby="' + uid + '-t"><title id="' + uid + '-t">ACP de 800 images de chiffres manuscrits</title><desc></desc><rect width="' + W + '" height="' + H + '" fill="#fff"/><g class="ad-under"></g><g class="ad-pts">' + pixels.map(() => '<circle class="ad-pt" r="2.2"></circle>').join('') + '</g><g class="ad-over"></g></svg>';
    },
    footnote: `800 images du jeu « digits » (scikit-learn ; UCI, CC BY 4.0). Étape 3 : le nuage tourne dans le plan des axes 1 et 6. Étape 8 : analyse discriminante, validation croisée à 5 plis, ${T.flatOk} / ${T.n} sur la carte, ${T.fullOk} / ${T.n} dans les 64 dimensions ; ${T.ownOk} / ${T.n} si l’ACP est refaite sur les seuls 5 et 8.`,
    stages: [
      {title: 'Une image, 64 nombres', html: String.raw`<p>Voici une vraie image de chiffre manuscrit : 8 × 8 pixels.</p><p>Chaque pixel est un nombre. L’image entière est donc une liste de <strong>64 nombres</strong>.</p>`},
      {title: 'Un point, 64 axes', html: String.raw`<p>Deux nombres : un point dans un plan. 64 nombres : un point dans un espace à <strong>64 axes</strong>.</p><p>Impossible à dessiner. L’ACP en fait une carte à 2 axes.</p>`},
      {title: 'La direction la plus étalée', html: String.raw`<p>Faites tourner le nuage. En bas, son <strong>ombre</strong>.</p><p>Plus l’ombre est large, plus on garde de variance. Trouvez la plus large.</p>`},
      {title: 'Puis à angle droit', html: String.raw`<p>La gagnante est le <strong>premier axe</strong>. Le deuxième est la plus étalée à angle droit du premier. Et ainsi de suite.</p><p>Un axe est aussi 64 nombres : on peut le regarder comme une image.</p>`},
      {title: 'Deux axes : tout tombe à plat', html: String.raw`<p>On garde 2 axes, on jette les 62 autres : 64 nombres deviennent 2.</p><p>Comparez les plans : <strong>aucun</strong> ne garde plus de variance que celui des axes 1 et 2.</p>`},
      {title: 'Ce que l’on perd', html: String.raw`<p>Recollons l’image à partir de ses \(k\) premiers axes. Faites glisser \(k\).</p><p>Ce qui manque, c’est l’<strong>erreur de reconstruction</strong> : plus on garde de variance, plus elle est petite.</p>`},
      {title: 'Le piège : 5 contre 8', html: String.raw`<p>Colorons les 5 et les 8 : ils se mélangent.</p>`,
        prompt: 'Que peut-on en conclure ?',
        choices: [
          {t: 'Ces chiffres se ressemblent trop', why: 'La carte ne suffit pas pour le dire : elle ne montre qu’une partie des données.'},
          {t: 'Rien : la carte ne montre qu’une partie des données', ok: true},
          {t: 'L’ACP s’est trompée', why: 'Non : elle a gardé le plus de variance. C’est son seul travail.'}],
        answer: 'La carte garde ' + twoAxes + ' % de la variance. Le reste n’y est pas.'},
      {title: 'Étalé ne veut pas dire important', html: String.raw`<p>Dans les 64 dimensions, les 5 et les 8 sont <strong>séparés</strong>. Sur la carte, ils se mélangent.</p><p>Leur différence varie trop peu. L’ACP garde <strong>ce qui varie le plus</strong>.</p>`},
      {title: 'Le réflexe', html: String.raw`<pre class="ad-code"><code># on garde 2 axes
pca = PCA(n_components=2)
# 64 nombres deviennent 2, sans y
Z = pca.fit_transform(X)
# ce que la carte garde
pca.explained_variance_ratio_</code></pre><p>Ici, ${fr(100 * P.ratio[0], 0)} % + ${fr(100 * P.ratio[1], 0)} % = ${twoAxes} %.</p><p>Lisez toujours cette ligne : <strong>${thrown} % de la variance n’est pas sur la carte.</strong></p>`}
    ],
    shared: adShared,
    reset() { Object.assign(adShared, {img: 12, dims: 3, theta: 90, plane: 'px', k: 2}); },
    canonical(stage) { return {img: 12, dims: 64, theta: stage === 2 ? 20 : 90, plane: 'a12', k: 2}; },
    init() {},
    controls(ctx) {
      const st = ctx.stage, s = ctx.state;
      if (st === 0) return buttons('next', [[1, 'Autre image']], '');
      if (st === 1) return slider('dims', 'Nombre d’axes', s.dims, 2, 64, 1, s.dims);
      if (st === 2) return slider('theta', 'Faire tourner', s.theta, 0, 180, 1, s.theta + '°');
      if (st === 4) return buttons('plane', Object.entries(PLANES).map(([k, v]) => [k, v.t]), s.plane);
      if (st === 5) return slider('k', 'Axes gardés', s.k, 1, 64, 1, s.k) + buttons('next', [[1, 'Autre image']], '');
      return '';
    },
    wire(ctx) {
      const s = ctx.state;
      wireRange(ctx, 'dims', v => { s.dims = v; }, v => v);
      wireRange(ctx, 'theta', v => { s.theta = v; }, v => v + '°');
      wireRange(ctx, 'k', v => { s.k = v; }, v => v);
      wireButtons(ctx, 'plane', v => { s.plane = v; });
      wireButtons(ctx, 'next', () => { s.img = (s.img + 137) % pixels.length; });
    },
    draw(ctx) {
      const st = ctx.stage, s = ctx.state;
      ctx.svg.classList.toggle('ad-live', st === 2);
      const desc = ctx.svg.querySelector('desc');
      if (st === 0) {
        hidePts(ctx);
        const size = 42, ox = (W - 8 * size) / 2, oy = 32; let cells = '';
        pixels[s.img].forEach((v, k) => { const x = ox + (k % 8) * size, y = oy + Math.floor(k / 8) * size; cells += '<rect x="' + x + '" y="' + y + '" width="' + size + '" height="' + size + '" fill="' + shade(v) + '" stroke="#fff"/><text x="' + (x + size / 2) + '" y="' + (y + size / 2 + 5) + '" text-anchor="middle" class="ad-cell" fill="' + (v > 8 ? '#fff' : COL.ink) + '">' + v + '</text>'; });
        setLayers(ctx, cells);
        desc.textContent = 'Une image de 8 pixels sur 8 et la valeur de chaque pixel.';
        ctx.side.innerHTML = '<p class="as-side-caption">Une image du chiffre <strong>' + DG.labels[s.img] + '</strong>. Foncé : grande valeur.</p>';
        ctx.readout.innerHTML = '<strong>' + pixels[s.img].length + ' nombres par image</strong><span>(' + pixels[s.img].slice(0, 6).join(' ; ') + ' ; … ; ' + pixels[s.img][63] + ')</span>';
      }
      if (st === 1) {
        hidePts(ctx);
        const cx = W / 2, cy = 192, R = 165; let rays = '';
        const ray = i => i === 0 ? 0 : i === 1 ? -Math.PI / 2 : i === 2 ? 2.45 : i * 2.39996;
        for (let i = 0; i < s.dims; i++) { const a = ray(i), L = R * (i < 3 ? 1 : .72 + .28 * Math.abs(Math.sin(i * 12.9))); rays += seg(cx - (i < 2 ? 0 : L * Math.cos(a)), cy - (i < 2 ? 0 : L * Math.sin(a)), cx + L * Math.cos(a), cy + L * Math.sin(a), i < 3 ? COL.ink : '#aeb2bb', i < 3 ? 1.8 : 1); }
        setLayers(ctx, rays, label(cx + R - 8, cy - 8, 'pixel 1', COL.ink, 'end') + label(cx + 8, cy - R + 8, 'pixel 2', COL.ink, 'start') + (s.dims > 2 ? label(cx + R * Math.cos(ray(2)) + 4, cy + R * Math.sin(ray(2)) + 14, 'pixel 3', COL.ink, 'start') : '') + '<circle cx="' + (cx + 62) + '" cy="' + (cy - 44) + '" r="6" fill="' + COL.error + '"/>' + label(cx + 72, cy - 40, 'une image', COL.error, 'start'));
        desc.textContent = s.dims + ' axes partant du même centre, et une image représentée par un seul point.';
        ctx.side.innerHTML = '<div class="nl-thumbs"><figure>' + digit(pixels[s.img], 'Image du chiffre ' + DG.labels[s.img]) + '<figcaption>Un seul point dans cet espace.</figcaption></figure></div>';
        ctx.readout.innerHTML = '<strong>' + s.dims + ' axes : un point = ' + s.dims + ' nombres</strong><span>' + (s.dims > 3 ? 'Dessin impossible : en vrai, tous ces axes sont à angle droit.' : 'On sait encore le dessiner.') + '</span>';
      }
      if (st === 2) {
        const t = s.theta * Math.PI / 180, c = Math.cos(t), n = Math.sin(t), cx = W / 2, cy = 134, S = 4, base = 380, binW = 4, bins = new Map();
        placePts(ctx, i => { const a = Z[i][0], b = Z[i][OTHER], u = a * c + b * n, v = -a * n + b * c, k = Math.floor(u / binW); bins.set(k, (bins.get(k) || 0) + 1); return [cx + S * u, cy - S * v, COL.dot, .75]; });
        let hist = ''; bins.forEach((count, k) => { const h = count * .7; hist += '<rect x="' + (cx + S * k * binW).toFixed(1) + '" y="' + (base - h).toFixed(1) + '" width="' + (S * binW - .8).toFixed(1) + '" height="' + h.toFixed(1) + '" fill="' + COL.one + '" opacity=".75"/>'; });
        const share = shareAt(s.theta);
        setLayers(ctx, hist + seg(16, base, W - 16, base, COL.ink, 1.6), '');
        desc.textContent = 'Le nuage des 800 images tourne ; en bas, l’histogramme de ses projections sur la droite horizontale.';
        ctx.side.innerHTML = bars([{t: 'variance gardée', v: share, max: .2, on: true}]) + goal(share > .145, share > .145 ? 'Bravo : c’est le premier axe.' : 'Dépasser ' + fr(14.5, 1) + ' %.');
        ctx.readout.innerHTML = '<strong>Cette direction garde ' + pct(share, 1) + ' de la variance</strong><span>Sur les 64 dimensions.</span>';
      }
      if (st === 3) {
        placePts(ctx, i => [mapX(Z[i][0]), mapY(Z[i][1]), COL.dot, .55]);
        const a = 2.1 * sd(0) * MAP.s, b = 2.1 * sd(1) * MAP.s, m = 12;
        setLayers(ctx, frame, arrow(MAP.cx, MAP.cy, MAP.cx + a, MAP.cy, COL.one) + arrow(MAP.cx, MAP.cy, MAP.cx, MAP.cy - b, COL.two) + '<path d="M' + (MAP.cx + m) + ' ' + MAP.cy + 'V' + (MAP.cy - m) + 'H' + MAP.cx + '" fill="none" stroke="' + COL.ink + '"/>' +
          label(MAP.cx + a, MAP.cy + 20, 'Axe 1 · ' + pct(P.ratio[0]), COL.one, 'end') + label(MAP.cx + 8, MAP.cy - b, 'Axe 2 · ' + pct(P.ratio[1]), COL.two, 'start'));
        desc.textContent = 'Le nuage dans le plan des deux premiers axes, à angle droit.';
        ctx.side.innerHTML = '<div class="nl-thumbs ad-axes">' + [0, 1, 2].map(k => '<figure>' + axisImage(k) + '<figcaption>Axe ' + (k + 1) + ' · ' + pct(P.ratio[k]) + '</figcaption></figure>').join('') + '</div>';
        ctx.readout.innerHTML = '<strong>Axe 1 : ' + pct(P.ratio[0]) + ' · Axe 2 : ' + pct(P.ratio[1]) + ' · Axe 3 : ' + pct(P.ratio[2]) + '</strong><span>Bleu : poids positif. Ocre : poids négatif.</span>';
      }
      if (st === 4) {
        const pl = PLANES[s.plane];
        placePts(ctx, i => { const [a, b] = pl.v(i); return [mapX(a), mapY(b), COL.one, .55]; });
        setLayers(ctx, frame + cross, label(W - 18, MAP.cy - 8, pl.x, COL.muted, 'end') + label(MAP.cx + 8, 28, pl.y, COL.muted, 'start'));
        desc.textContent = 'Les 800 images projetées sur le plan choisi : ' + pl.t + '.';
        ctx.side.innerHTML = bars(Object.entries(PLANES).map(([k, v]) => ({t: v.t, v: v.share, max: .35, on: k === s.plane})));
        ctx.readout.innerHTML = '<strong>' + pl.t + ' : ' + pct(pl.share) + ' de la variance</strong><span>' + (s.plane === 'a12' ? 'Le meilleur plan possible.' : s.plane === 'px' ? 'Les deux pixels les plus variables.' : 'Moins étalé, à la même échelle.') + '</span>';
      }
      if (st === 5) {
        hidePts(ctx);
        const L = 44, R = 462, n = 64, x = i => L + i * (R - L) / n, T1 = 18, B1 = 182, T2 = 226, B2 = 362, y1 = v => B1 - v * (B1 - T1), y2 = v => B2 - v / .16 * (B2 - T2);
        let g = '';
        [0, .5, 1].forEach(v => { g += seg(L, y1(v), R, y1(v), COL.grid) + '<text x="' + (L - 6) + '" y="' + (y1(v) + 4) + '" text-anchor="end" class="as-tick">' + v * 100 + '</text>'; });
        [0, .08, .16].forEach(v => { g += seg(L, y2(v), R, y2(v), COL.grid) + '<text x="' + (L - 6) + '" y="' + (y2(v) + 4) + '" text-anchor="end" class="as-tick">' + v * 100 + '</text>'; });
        P.ratio.forEach((v, i) => { g += '<rect x="' + (x(i) + .6).toFixed(1) + '" y="' + y2(v).toFixed(1) + '" width="' + ((R - L) / n - 1.2).toFixed(1) + '" height="' + (B2 - y2(v)).toFixed(1) + '" fill="' + (i < s.k ? COL.one : '#d7d9de') + '"/>'; });
        g += '<path d="' + cumul.map((v, i) => (i ? 'L' : 'M') + (x(i) + (R - L) / n / 2).toFixed(1) + ' ' + y1(v).toFixed(1)).join('') + '" fill="none" stroke="' + COL.one + '" stroke-width="2.4"/>';
        [1, 10, 20, 30, 40, 50, 64].forEach(v => { g += '<text x="' + (x(v - 1) + (R - L) / n / 2).toFixed(1) + '" y="' + (B2 + 16) + '" text-anchor="middle" class="as-tick">' + v + '</text>'; });
        const mx = x(s.k - 1) + (R - L) / n / 2;
        g += seg(mx, T1, mx, B2, COL.ink, 1, '4 4') + '<circle cx="' + mx.toFixed(1) + '" cy="' + y1(cumul[s.k - 1]).toFixed(1) + '" r="5" fill="' + COL.ink + '"/>';
        setLayers(ctx, g, label(L + 4, T1 - 4, 'Variance gardée par les k premiers axes (%)', COL.muted, 'start') + label(L + 4, T2 - 8, 'Part de chaque axe (%)', COL.muted, 'start') + label(R, B2 + 34, 'axe', COL.muted, 'end'));
        desc.textContent = 'Part de variance de chacun des 64 axes et cumul jusqu’à k = ' + s.k + '.';
        const c = center(s.img), back = P.mean.slice();
        for (let j = 0; j < s.k; j++) { const zj = dotp(P.axes[j], c); P.axes[j].forEach((u, i) => { back[i] += zj * u; }); }
        ctx.side.innerHTML = '<div class="nl-thumbs ad-pair"><figure>' + digit(pixels[s.img], 'Image d’origine') + '<figcaption>L’image</figcaption></figure><figure>' + digit(back, 'Image reconstruite avec ' + s.k + ' axes') + '<figcaption>Avec ' + s.k + ' axe' + (s.k > 1 ? 's' : '') + '</figcaption></figure></div>';
        ctx.readout.innerHTML = '<strong>' + s.k + ' axe' + (s.k > 1 ? 's' : '') + ' : ' + pct(cumul[s.k - 1], cumul[s.k - 1] > .995 ? 1 : 0) + ' de la variance gardée</strong><span>' + (P.need[80] + ' axes pour 80 %, ' + P.need[95] + ' pour 95 %.') + '</span>';
      }
      if (st === 6) {
        placePts(ctx, i => [mapX(Z[i][0]), mapY(Z[i][1]), COL.dot, .16]);
        let glyphs = ''; Z.forEach((z, i) => { const c = DG.labels[i]; if (+c === T.a || +c === T.b) glyphs += '<text x="' + mapX(z[0]).toFixed(1) + '" y="' + (mapY(z[1]) + 4).toFixed(1) + '" text-anchor="middle" class="ad-glyph" fill="' + (+c === T.a ? COL.a : COL.b) + '">' + c + '</text>'; });
        setLayers(ctx, frame + cross, glyphs + label(W - 18, MAP.cy - 8, 'Axe 1', COL.muted, 'end') + label(MAP.cx + 8, 28, 'Axe 2', COL.muted, 'start'));
        desc.textContent = 'Les images de 5 et de 8 sur la carte des deux premiers axes : elles se mélangent.';
        ctx.side.innerHTML = '<p class="as-side-caption"><span class="nl-swatch" style="background:' + COL.a + '"></span>' + T.a + '<br><span class="nl-swatch" style="background:' + COL.b + '"></span>' + T.b + '</p>';
        ctx.readout.innerHTML = '<strong>' + T.n + ' images, sur la carte des ' + pixels.length + '</strong><span>L’ACP a été calculée sans les étiquettes.</span>';
      }
      if (st === 7) {
        hidePts(ctx);
        const row = (scores, base, title) => {
          const all = scores[0].concat(scores[1]), m = Math.sqrt(all.reduce((t, v) => t + v * v, 0) / all.length), px = 84, bw = 9, h = 7, stacks = new Map(); let out = '';
          scores.forEach((list, cls) => list.forEach(v => { const k = Math.round(v / m * px / bw), n = stacks.get(k) || 0; stacks.set(k, n + 1); const x = Math.max(14, Math.min(W - 14, W / 2 + k * bw)); out += '<text x="' + x.toFixed(1) + '" y="' + (base - 3 - n * h).toFixed(1) + '" text-anchor="middle" class="ad-glyph-s" fill="' + (cls ? COL.b : COL.a) + '">' + (cls ? T.b : T.a) + '</text>'; }));
          return seg(14, base, W - 14, base, COL.ink, 1.3) + seg(W / 2, base + 5, W / 2, base - 150, COL.error, 1.4, '5 4') + out + label(16, base - 152, title, COL.ink, 'start');
        };
        setLayers(ctx, row(T.flat, 188, 'Sur la carte : mélangés') + row(T.full, 382, 'Dans les 64 dimensions : séparés'));
        desc.textContent = 'Les 5 et les 8 le long de la meilleure coupe : mélangés sur la carte, séparés dans les 64 dimensions.';
        ctx.side.innerHTML = bars([{t: 'Axe 1', v: P.ratio[0], max: .2}, {t: 'Différence 5 / 8', v: T.share, max: .2, c: COL.error, on: true}]);
        ctx.readout.innerHTML = '<strong>La différence existe, mais la carte ne la montre pas</strong><span>Elle porte ' + pct(T.share) + ' de la variance.</span>';
      }
      if (st === 8) {
        hidePts(ctx);
        const table = (x, y, w, h, top, left, c) => '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" fill="' + c + '" fill-opacity=".14" stroke="' + c + '" stroke-width="1.6"/>' + label(x + w / 2, y - 8, top, c) + label(x + w / 2, y + h / 2 + 5, left, c);
        let g = table(30, 46, 190, 150, '64 colonnes', 'X : 800 lignes', COL.ink);
        g += table(232, 46, 24, 150, 'y', '', COL.error) + seg(232, 46, 256, 196, COL.error, 2) + seg(256, 46, 232, 196, COL.error, 2);
        g += arrow(270, 121, 326, 121, COL.ink) + table(340, 46, 110, 150, '2 colonnes', 'Z : 800 lignes', COL.one);
        const bx = 30, bw = 420; let run = bx; P.ratio.forEach((v, i) => { const w = v * bw; g += '<rect x="' + run.toFixed(1) + '" y="262" width="' + Math.max(w - .6, .3).toFixed(1) + '" height="34" fill="' + (i === 0 ? COL.one : i === 1 ? COL.two : '#d7d9de') + '"/>'; run += w; });
        const split = bx + kept * bw;
        g += label(bx, 252, 'Toute la variance, découpée en 64 axes', COL.muted, 'start') + label(bx, 322, 'Sur la carte : ' + twoAxes + ' %', COL.one, 'start') + label(bx + bw, 322, 'Jeté : ' + thrown + ' %', COL.muted, 'end') + seg(split, 256, split, 304, COL.ink, 1.4);
        setLayers(ctx, g);
        desc.textContent = 'La matrice X de 800 lignes et 64 colonnes devient Z à 2 colonnes, sans y. La carte garde ' + twoAxes + ' % de la variance.';
        ctx.side.innerHTML = '<p class="as-side-caption">Deux groupes confondus sur une carte ne le sont pas forcément dans les données.</p>';
        ctx.readout.innerHTML = '<strong>La carte montre ' + twoAxes + ' % de la variance</strong><span>Ce n’est pas tout ce qu’il y a dans les données.</span>';
      }
    }
  };

  window.ACPImagesStory = K.defineStory(adSpec);
})();
