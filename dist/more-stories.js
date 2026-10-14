(function () {
  'use strict';
  /* Récits interactifs pour les parties encore surtout faites de texte et de formules.
     Chapitre 1 : supervise-story (introduction), loss-story (fonction de perte),
                  risk-story (risque : la meilleure constante, puis la moyenne conditionnelle).
     Chapitre 2 : geometrie-story (hyperplan, vecteur normal, échelle), distance-story
                  (du score à la distance), slack-story (relâchements ξ, rôle de C),
                  dual-story (multiplicateurs α, vecteurs de support).
     Mêmes données que le fil rouge : les 24 chats et chiens d'apprentissage. */
  const K = window.StoryKit, A = window.Animals, AK = window.AlgoKit;
  const {X, Y, line, levelPath, levelLabelPoint, overlay, placeDots, setLines, setOverlay, animalName, measures} = K;
  const fr = A.fr, tx = A.tx, esc = AK.esc;
  const train = A.byRole('train'), D = A.DOMAIN;
  const COL = {cat: '#8a4f8c', dog: '#2e6b4f', ink: '#1d2433', muted: '#6e7380', grid: '#efeff1', axis: '#c4c4ca', error: '#b4532a', ochre: '#b07d2a', soft: '#cdb0cd', guide: '#9aa0ab'};
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const ypm = a => 2 * a.y - 1;
  const g = (m, p) => m.w1 * p.x1 + m.w2 * p.x2 + m.b;
  const norm = m => Math.hypot(m.w1, m.w2);
  const scale = (m, k) => ({w1: k * m.w1, w2: k * m.w2, b: k * m.b});
  // Pied de la perpendiculaire à la ligne de niveau g = c.
  const foot = (m, p, c = 0) => { const t = (g(m, p) - c) / (m.w1 * m.w1 + m.w2 * m.w2); return {x1: p.x1 - t * m.w1, x2: p.x2 - t * m.w2}; };
  const seg = (p, q, color, width = 2.4, dash = '') => line('M' + X(p.x1).toFixed(1) + ' ' + Y(p.x2).toFixed(1) + 'L' + X(q.x1).toFixed(1) + ' ' + Y(q.x2).toFixed(1), color, width, dash, 'stroke-linecap="round"');
  // Écriture d'une fonction affine : 1{,}01\,x_1-0{,}28\,x_2-5{,}75
  const term = (v, name, first) => (v < 0 ? '-' : first ? '' : '+') + tx(Math.abs(v)) + (name ? '\\,' + name : '');
  const affine = m => term(m.w1, 'x_1', true) + term(m.w2, 'x_2') + term(m.b, '');
  function arrow(p, q, color, width = 2.6) {
    const x1 = X(p.x1), y1 = Y(p.x2), x2 = X(q.x1), y2 = Y(q.x2), a = Math.atan2(y2 - y1, x2 - x1), h = 10;
    const tip = (s) => (x2 - h * Math.cos(a + s)).toFixed(1) + ' ' + (y2 - h * Math.sin(a + s)).toFixed(1);
    return '<path d="M' + x1.toFixed(1) + ' ' + y1.toFixed(1) + 'L' + x2.toFixed(1) + ' ' + y2.toFixed(1) + '" stroke="' + color + '" stroke-width="' + width + '" stroke-linecap="round"/>' +
      '<path d="M' + tip(-.42) + 'L' + x2.toFixed(1) + ' ' + y2.toFixed(1) + 'L' + tip(.42) + 'Z" fill="' + color + '"/>';
  }
  const inside = p => ({x1: clamp(p.x1, D.x1[0] + .7, D.x1[1] - .7), x2: clamp(p.x2, D.x2[0] + .5, D.x2[1] - .5)});
  const slider = (name, label, value, min, max, step, shown) => '<label class="as-slider"><span>' + label + ' : <strong data-out="' + name + '">' + shown + '</strong></span><input type="range" data-range="' + name + '" min="' + min + '" max="' + max + '" step="' + step + '" value="' + value + '" aria-label="' + esc(label.replace(/\\[()]/g, '').replace(/\\/g, '')) + '"></label>';
  function wireRange(ctx, name, set, show) {
    const input = ctx.controls.querySelector('[data-range="' + name + '"]'); if (!input) return;
    input.addEventListener('input', () => { set(+input.value); const out = ctx.controls.querySelector('[data-out="' + name + '"]'); if (out) out.textContent = show(+input.value); ctx.commit(); }, {signal: ctx.signal});
  }
  const unknownDot = u => ({id: 'u', x: X(u.x1), y: Y(u.x2), selected: true, movable: true, interactive: true, scale: 1.25, aria: 'Animal inconnu déplaçable, ' + measures(u)});
  const sideFig = (W, H, body, label) => '<div class="as-side-figure"><svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + esc(label) + '">' + body + '</svg></div>';
  const goal = K.goal;
  const legendRow = (color, text, ring) => '<span><i style="' + (ring ? 'border:2px solid ' + color + ';background:#fff' : 'background:' + color) + '"></i>' + text + '</span>';

  /* Petit graphique cartésien pour les récits à une variable (pertes, risque). */
  function miniChart(o) {
    const P = {W: 480, H: 330, L: 46, R: 466, T: 16, B: 290};
    const Xc = x => P.L + (x - o.x[0]) / (o.x[1] - o.x[0]) * (P.R - P.L), Yc = y => P.B - (y - o.y[0]) / (o.y[1] - o.y[0]) * (P.B - P.T);
    const path = (fn, a = o.x[0], b = o.x[1], n = 200) => Array.from({length: n + 1}, (_, i) => { const x = a + (b - a) * i / n; return (i ? 'L' : 'M') + Xc(x).toFixed(1) + ' ' + Yc(fn(x)).toFixed(1); }).join('');
    const label = v => String(v).replace('.', ',').replace('-', '\u2212');
    const svg = (uid, title) => '<svg class="as-scatter" viewBox="0 0 ' + P.W + ' ' + P.H + '" role="img" aria-labelledby="' + uid + '-t ' + uid + '-d"><title id="' + uid + '-t">' + esc(title) + '</title><desc id="' + uid + '-d"></desc>' +
      '<defs><clipPath id="' + uid + '-clip"><rect x="' + P.L + '" y="' + (P.T - 8) + '" width="' + (P.R - P.L) + '" height="' + (P.B - P.T + 8) + '"/></clipPath></defs><g>' +
      o.xt.map(v => '<path d="M' + Xc(v) + ' ' + P.T + 'V' + P.B + '" stroke="' + COL.grid + '"/><text x="' + Xc(v) + '" y="' + (P.B + 20) + '" text-anchor="middle" class="as-tick">' + label(v) + '</text>').join('') +
      o.yt.map(v => '<path d="M' + P.L + ' ' + Yc(v) + 'H' + P.R + '" stroke="' + COL.grid + '"/><text x="' + (P.L - 8) + '" y="' + (Yc(v) + 4) + '" text-anchor="end" class="as-tick">' + label(v) + '</text>').join('') +
      '<path d="M' + P.L + ' ' + P.T + 'V' + P.B + 'H' + P.R + '" fill="none" stroke="' + COL.axis + '"/></g>' +
      '<g class="as-lines" clip-path="url(#' + uid + '-clip)"></g><g class="as-under"></g><g class="as-dots"></g><g class="as-over"></g></svg>';
    return {P, X: Xc, Y: Yc, path, svg};
  }
  const setPlot = (ctx, html) => { ctx.svg.querySelector('.as-lines').innerHTML = html; };
  const dot = (x, y, color, r = 6, fill = '#fff') => '<circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="' + r + '" fill="' + fill + '" stroke="' + color + '" stroke-width="2.4"/>';

  /* =======================================================================
     Chapitre 1 · Introduction : avec ou sans étiquettes
     ==================================================================== */
  function kmeans2(points) {
    let c = [points.reduce((a, b) => b.x1 < a.x1 ? b : a), points.reduce((a, b) => b.x1 > a.x1 ? b : a)].map(p => ({x1: p.x1, x2: p.x2}));
    let lab = [];
    for (let it = 0; it < 25; it++) {
      lab = points.map(p => Math.hypot(p.x1 - c[0].x1, p.x2 - c[0].x2) <= Math.hypot(p.x1 - c[1].x1, p.x2 - c[1].x2) ? 0 : 1);
      c = [0, 1].map(k => { const q = points.filter((p, i) => lab[i] === k); return {x1: q.reduce((s, p) => s + p.x1, 0) / q.length, x2: q.reduce((s, p) => s + p.x2, 0) / q.length}; });
    }
    return {lab, c};
  }
  function hull(pts) {
    const p = pts.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]), cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
    const lower = [], upper = [];
    for (const q of p) { while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], q) <= 0) lower.pop(); lower.push(q); }
    for (const q of p.slice().reverse()) { while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], q) <= 0) upper.pop(); upper.push(q); }
    return lower.slice(0, -1).concat(upper.slice(0, -1));
  }
  const KM = kmeans2(train);
  const GROUP = [{fill: '#eef1f8', stroke: '#9fb0cf', text: '#4f6290'}, {fill: '#f7f1e4', stroke: '#cdb98f', text: '#7a6436'}];
  const supShared = {reveal: false};
  const superviseSpec = {
    id: 'supervise-story', kicker: 'FIL ROUGE · AVEC OU SANS ÉTIQUETTES', noDrag: true,
    footnote: 'Les 24 animaux d’apprentissage du fil rouge. Les groupes sont obtenus par la méthode des k-moyennes (deux groupes), présentée plus tard dans le cours.',
    stages: [
      {title: 'Avec étiquettes', html: String.raw`<p>Chaque animal arrive avec son <strong>étiquette</strong> : chat ou chien.</p><p>On peut apprendre une règle qui prédit l’étiquette d’un nouvel animal : c’est l’<strong>apprentissage supervisé</strong>.</p>`,
        details: {title: 'Entrée, sortie, exemple', html: String.raw`<p>Entrée \(x_i=(x_{i1},x_{i2})\) : poids et pelage. Sortie \(y_i\) : l’espèce. Un exemple étiqueté est un couple \((x_i,y_i)\).</p>`}},
      {title: 'Sans étiquettes', html: String.raw`<p>Mêmes mesures, mais <strong>sans étiquette</strong>.</p><p>Il n’y a plus de « bonne réponse » à apprendre : on peut seulement chercher une structure, par exemple des groupes.</p>`,
        details: {title: 'Apprentissage non supervisé', html: String.raw`<p>On dispose seulement des \(x_i\). L’objectif est exploratoire : regrouper des observations semblables, réduire la dimension, repérer des anomalies.</p>`}},
      {title: 'Des groupes, sans noms', html: String.raw`<p>Un algorithme trouve <strong>deux groupes</strong> d’animaux qui se ressemblent.</p><p>Il ne sait pas ce qu’ils représentent : il n’a jamais vu d’étiquette.</p>`,
        prompt: 'L’algorithme a trouvé deux groupes. Peut-il dire lequel est celui des chats ?',
        choices: [
          {t: 'Oui : le groupe des plus légers', why: 'C’est nous qui l’interprétons ainsi. L’algorithme n’a jamais vu le mot « chat ».'},
          {t: 'Non : il sait seulement que les animaux d’un groupe se ressemblent', ok: true},
          {t: 'Oui : le plus grand groupe', why: 'La taille d’un groupe ne dit rien de l’espèce.'}],
        answer: 'Sans étiquette, les groupes n’ont pas de nom. Les nommer demande une information extérieure : c’est toute la différence avec l’apprentissage supervisé.'}
    ],
    shared: supShared,
    reset() { supShared.reveal = false; },
    canonical() { return {reveal: false}; },
    init() {},
    controls(ctx) { return ctx.stage === 2 ? '<button type="button" class="as-button" data-reveal aria-pressed="' + ctx.state.reveal + '">' + (ctx.state.reveal ? 'Masquer les espèces' : 'Révéler les espèces') + '</button>' : ''; },
    wire(ctx) { ctx.controls.querySelector('[data-reveal]')?.addEventListener('click', () => { ctx.state.reveal = !ctx.state.reveal; ctx.commit({controls: true}); }, {signal: ctx.signal}); },
    draw(ctx) {
      const st = ctx.stage, s = ctx.state, hide = st >= 1 && !(st === 2 && s.reveal);
      let lines = '', over = '';
      if (st === 2) [0, 1].forEach(k => {
        const pts = hull(train.filter((a, i) => KM.lab[i] === k).map(a => [X(a.x1), Y(a.x2)]));
        lines += '<path d="M' + pts.map(p => p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join('L') + 'Z" fill="' + GROUP[k].fill + '" stroke="' + GROUP[k].fill + '" stroke-width="40" stroke-linejoin="round"/>' +
          '<path d="M' + pts.map(p => p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join('L') + 'Z" fill="none" stroke="' + GROUP[k].stroke + '" stroke-width="1.6" stroke-dasharray="5 5" stroke-linejoin="round"/>';
        over += overlay(X(KM.c[k].x1), Y(KM.c[k].x2 + (k ? 2.2 : 2.6)), 'groupe ' + (k + 1), 'as-region-label', undefined, undefined).replace('style="', 'style="color:' + GROUP[k].text + ';');
      });
      setLines(ctx, lines);
      placeDots(ctx, train.map(a => ({id: a.id, x: X(a.x1), y: Y(a.x2), hideLabel: hide, aria: hide ? 'Animal sans étiquette, ' + measures(a) : animalName(a) + ', ' + measures(a)})));
      setOverlay(ctx, over);
      ctx.svg.querySelector('desc').textContent = ['Animaux étiquetés chat ou chien.', 'Les mêmes animaux, sans étiquette.', 'Deux groupes trouvés sans étiquette.'][st];
      const n = [0, 1].map(k => KM.lab.filter(l => l === k).length);
      if (st === 0) ctx.side.innerHTML = '<div class="as-legend as-legend-col">' + legendRow(COL.cat, 'chats · 12') + legendRow(COL.dog, 'chiens · 12') + '</div><div class="as-card-glyphs">' + ['chat', 'chien'].map(k => '<svg viewBox="-16 -18 32 34" aria-hidden="true">' + A.head(k) + '</svg>').join('') + '</div>';
      if (st === 1) ctx.side.innerHTML = '<div class="as-card-glyphs"><svg viewBox="-16 -18 32 34" aria-hidden="true">' + A.head('inconnu') + '</svg></div><p class="as-side-caption">24 animaux, aucune étiquette : seulement des mesures.</p>';
      if (st === 2) {
        const comp = [0, 1].map(k => { const q = train.filter((a, i) => KM.lab[i] === k); return {cats: q.filter(a => !a.y).length, dogs: q.filter(a => a.y).length}; });
        ctx.side.innerHTML = '<table class="as-table"><thead><tr><th>Groupe</th><th>Animaux</th>' + (s.reveal ? '<th>Espèces</th>' : '') + '</tr></thead><tbody>' + [0, 1].map(k => '<tr><td style="color:' + GROUP[k].text + ';font-weight:700">groupe ' + (k + 1) + '</td><td>' + n[k] + '</td>' + (s.reveal ? '<td>' + comp[k].cats + ' chats, ' + comp[k].dogs + ' chiens</td>' : '') + '</tr>').join('') + '</tbody></table><p class="as-side-caption">' + (s.reveal ? 'Les groupes recoupent en partie les espèces, sans les connaître.' : 'Les groupes n’ont pas de nom.') + '</p>';
      }
      ctx.readout.innerHTML = ['<strong>Apprentissage supervisé</strong><span>Des couples \\((x_i,y_i)\\) : on apprend à prédire \\(y\\).</span>', '<strong>Apprentissage non supervisé</strong><span>Seulement des \\(x_i\\) : on cherche une structure.</span>', '<strong>Deux groupes : ' + n[0] + ' et ' + n[1] + ' animaux</strong><span>Trouvés à partir des mesures seules.</span>'][st];
    }
  };

  /* =======================================================================
     Chapitre 1 · Fonction de perte : absolue ou quadratique
     ==================================================================== */
  const lossChart = miniChart({x: [-3, 3], y: [0, 4.5], xt: [-3, -2, -1, 0, 1, 2, 3], yt: [0, 1, 2, 3, 4]});
  const LC = lossChart, absL = r => Math.abs(r), quadL = r => r * r / 2;
  const RESID = [-0.4, 0.3, 0.5, -0.2, 2.6];
  const lossShared = {r: 1.2, base: 1};
  const lossSpec = {
    id: 'loss-story', kicker: 'FONCTION DE PERTE · DEUX FAÇONS DE COMPTER', noDrag: true,
    axes: ['Résidu \\(r=y-\\hat y\\)', 'Perte'],
    plotSVG: uid => lossChart.svg(uid, 'Perte absolue et perte quadratique en fonction du résidu'),
    footnote: 'Perte absolue \\(|y-\\hat y|\\) et perte quadratique \\(\\tfrac12(y-\\hat y)^2\\), comme dans le tableau du cours (\\(p=1\\) et \\(p=2\\)).',
    stages: [
      {title: 'Deux façons de compter l’erreur', html: String.raw`<p>L’erreur d’une prévision est le <strong>résidu</strong> \(r=y-\hat y\).</p><p>La perte <strong>absolue</strong> compte \(|r|\) ; la perte <strong>quadratique</strong> compte \(\tfrac12r^2\). Faites varier \(r\).</p>`,
        details: {title: 'Mêmes zéros, formes différentes', html: String.raw`<p>Les deux pertes sont nulles si et seulement si \(\hat y=y\). La quadratique est plus douce près de \(0\), puis croît beaucoup plus vite.</p>`}},
      {title: 'Doubler l’erreur', html: String.raw`<p>Comparez une erreur \(r\) et une erreur deux fois plus grande, \(2r\).</p>`,
        prompt: 'Si l’erreur double, la perte quadratique…',
        choices: [
          {t: 'double aussi', why: String.raw`C’est le cas de la perte absolue : \(|2r|=2|r|\).`},
          {t: 'ne change pas', why: 'Une erreur plus grande coûte plus cher, pour les deux pertes.'},
          {t: String.raw`est multipliée par \(4\)`, ok: true}],
        answer: String.raw`\(\tfrac12(2r)^2=4\times\tfrac12r^2\) : les grosses erreurs pèsent beaucoup plus avec la perte quadratique.`},
      {title: 'Une grosse erreur domine', html: String.raw`<p>Cinq prévisions, dont une très mauvaise : \(r=2{,}6\).</p><p>Avec la perte quadratique, elle représente presque toute la perte totale.</p>`,
        details: {title: 'Sensibilité aux valeurs extrêmes', html: String.raw`<p>Minimiser une perte quadratique moyenne tire le modèle vers les points extrêmes. La perte absolue y est moins sensible.</p>`}}
    ],
    shared: lossShared,
    reset() { Object.assign(lossShared, {r: 1.2, base: 1}); },
    canonical() { return {r: 1.2, base: 1}; },
    init() {},
    controls(ctx) {
      if (ctx.stage === 0) return slider('r', 'Résidu \\(r\\)', ctx.state.r, -3, 3, 0.1, fr(ctx.state.r, 1));
      if (ctx.stage === 1) return '<span class="as-hint">Erreur \\(r\\)</span>' + AK.chips('base', [0.5, 1, 1.5], ctx.state.base, v => '\\(r=' + tx(v, 1) + '\\)');
      return '';
    },
    wire(ctx) {
      wireRange(ctx, 'r', v => { ctx.state.r = v; }, v => fr(v, 1));
      AK.wireChips(ctx, 'base', v => { ctx.state.base = +v; });
    },
    draw(ctx) {
      const st = ctx.stage, s = ctx.state;
      let lines = LC.path ? AK.pathEl(LC.path(absL), COL.dog, 2.6) + AK.pathEl(LC.path(quadL), COL.cat, 2.6) : '';
      let over = overlay(LC.X(-2.75), LC.Y(3.2), '\\(\\tfrac12r^2\\)', 'as-strong', LC.P.W, LC.P.H).replace('style="', 'style="color:' + COL.cat + ';') +
        overlay(LC.X(-2.6), LC.Y(2.15), '\\(|r|\\)', 'as-strong', LC.P.W, LC.P.H).replace('style="', 'style="color:' + COL.dog + ';');
      const marks = rs => rs.map(r => AK.pathEl('M' + LC.X(r).toFixed(1) + ' ' + LC.P.B + 'V' + LC.Y(Math.max(absL(r), Math.min(4.5, quadL(r)))).toFixed(1), COL.guide, 1.2, 'stroke-dasharray="4 4"') + dot(LC.X(r), LC.Y(absL(r)), COL.dog) + (quadL(r) <= 4.5 ? dot(LC.X(r), LC.Y(quadL(r)), COL.cat) : '')).join('');
      if (st === 0) lines += marks([s.r]);
      if (st === 1) { lines += marks([s.base, 2 * s.base]); over += overlay(LC.X(s.base), LC.P.B - 14, '\\(r\\)', 'as-small', LC.P.W, LC.P.H) + overlay(LC.X(2 * s.base), LC.P.B - 14, '\\(2r\\)', 'as-small', LC.P.W, LC.P.H); }
      if (st === 2) lines += RESID.map(r => dot(LC.X(r), LC.Y(absL(r)), COL.dog, 5) + dot(LC.X(r), LC.Y(Math.min(quadL(r), 4.45)), COL.cat, 5, r > 2 ? '#fbefe9' : '#fff')).join('');
      setPlot(ctx, lines); setOverlay(ctx, over);
      ctx.svg.querySelector('desc').textContent = ['Courbes |r| et r²/2 avec le résidu choisi.', 'Une erreur et son double sur les deux courbes.', 'Cinq résidus dont un grand.'][st];
      if (st === 0) { ctx.side.innerHTML = AK.bars([{label: '\\(|r|\\)', value: absL(s.r), text: fr(absL(s.r), 2), color: COL.dog}, {label: '\\(\\tfrac12r^2\\)', value: quadL(s.r), text: fr(quadL(s.r), 2), color: COL.cat}], 4.5); ctx.readout.innerHTML = '<strong>\\(r=' + tx(s.r, 1) + '\\) : \\(|r|=' + tx(absL(s.r)) + '\\), \\(\\tfrac12r^2=' + tx(quadL(s.r)) + '\\)</strong><span>Les deux pertes sont nulles seulement en \\(r=0\\).</span>'; }
      if (st === 1) { const r = s.base; ctx.side.innerHTML = '<table class="as-table"><thead><tr><th></th><th>\\(r\\)</th><th>\\(2r\\)</th><th>rapport</th></tr></thead><tbody><tr><td>absolue</td><td>' + fr(r, 2) + '</td><td>' + fr(2 * r, 2) + '</td><td>× 2</td></tr><tr><td>quadratique</td><td>' + fr(quadL(r), 3) + '</td><td>' + fr(quadL(2 * r), 3) + '</td><td>× 4</td></tr></tbody></table>'; ctx.readout.innerHTML = '<strong>Erreur doublée : absolue × 2, quadratique × 4</strong><span>\\(r=' + tx(r, 1) + '\\) puis \\(2r=' + tx(2 * r, 1) + '\\).</span>'; }
      if (st === 2) {
        const ta = RESID.reduce((t, r) => t + absL(r), 0), tq = RESID.reduce((t, r) => t + quadL(r), 0);
        ctx.side.innerHTML = '<table class="as-table"><thead><tr><th>\\(r\\)</th><th>\\(|r|\\)</th><th>\\(\\tfrac12r^2\\)</th></tr></thead><tbody>' + RESID.map(r => '<tr' + (r > 2 ? ' class="is-current"' : '') + '><td>' + fr(r, 1) + '</td><td>' + fr(absL(r), 2) + '</td><td>' + fr(quadL(r), 2) + '</td></tr>').join('') + '<tr><td><strong>part de la grosse erreur</strong></td><td><strong>' + Math.round(absL(2.6) / ta * 100) + ' %</strong></td><td><strong>' + Math.round(quadL(2.6) / tq * 100) + ' %</strong></td></tr></tbody></table>';
        ctx.readout.innerHTML = '<strong>Une seule erreur : ' + Math.round(quadL(2.6) / tq * 100) + ' % de la perte quadratique totale</strong><span>contre ' + Math.round(absL(2.6) / ta * 100) + ' % de la perte absolue totale.</span>';
      }
    }
  };

  /* =======================================================================
     Chapitre 1 · Risque : la meilleure prévision constante
     ==================================================================== */
  const WEIGHTS = train.map(a => ({x: a.x1, y: a.y}));
  const mean = v => v.reduce((s, x) => s + x, 0) / v.length;
  const median = v => { const q = v.slice().sort((a, b) => a - b), n = q.length; return n % 2 ? q[(n - 1) / 2] : (q[n / 2 - 1] + q[n / 2]) / 2; };
  const riskOf = (vals, c) => mean(vals.map(v => (v - c) * (v - c) / 2));
  const ALLW = WEIGHTS.map(w => w.x), CATW = WEIGHTS.filter(w => !w.y).map(w => w.x), DOGW = WEIGHTS.filter(w => w.y).map(w => w.x);
  const riskChart = miniChart({x: [2, 13], y: [0, 20], xt: [2, 4, 6, 8, 10, 12], yt: [0, 5, 10, 15, 20]});
  const RC = riskChart;
  const riskShared = {c: 10};
  const riskSpec = {
    id: 'risk-story', kicker: 'RISQUE · LA MEILLEURE PRÉVISION', noDrag: true,
    axes: ['Prévision constante \\(c\\) (kg)', 'Risque empirique \\(\\hat{\\mathcal R}(c)\\)'],
    plotSVG: uid => riskChart.svg(uid, 'Risque empirique d’une prévision constante du poids'),
    footnote: 'Poids des 24 animaux d’apprentissage. Perte quadratique \\(\\tfrac12(y-c)^2\\), moyennée sur les animaux. Les petits ronds sous l’axe sont les poids observés.',
    stages: [
      {title: 'Une seule prévision pour tous', html: String.raw`<p>On prévoit le <strong>poids</strong> d’un animal par une même constante \(c\), sans rien savoir de lui.</p><p>Le risque empirique \(\hat{\mathcal R}(c)\) est la perte quadratique moyenne. Cherchez son minimum.</p>`,
        details: {title: 'Risque et risque empirique', html: String.raw`<p>Le risque \(\mathcal R(c)=\mathbb E\big[\tfrac12(Y-c)^2\big]\) est inconnu ; on l’estime par la moyenne sur les données, \(\hat{\mathcal R}(c)=\frac1n\sum_i\tfrac12(y_i-c)^2\).</p>`}},
      {title: 'Le minimum', html: String.raw`<p>La courbe est une parabole. Son minimum est atteint en un point remarquable des poids.</p>`,
        prompt: String.raw`Quelle constante \(c\) minimise la perte quadratique moyenne ?`,
        choices: [
          {t: 'la médiane des poids', why: 'La médiane minimise la perte absolue moyenne, pas la quadratique.'},
          {t: 'la moyenne des poids', ok: true},
          {t: 'le poids le plus fréquent', why: 'Il ignore l’éloignement des autres poids, que la perte quadratique prend en compte.'}],
        answer: String.raw`\(\hat{\mathcal R}'(c)=c-\bar y\) s’annule en \(c=\bar y\) : la moyenne des poids minimise la perte quadratique moyenne.`},
      {title: 'Sachant l’espèce', html: String.raw`<p>Si l’on connaît l’espèce \(x\), on choisit une constante <strong>par espèce</strong>.</p><p>La meilleure est la <strong>moyenne conditionnelle</strong> \(m^*(x)=\mathbb E[Y\mid X=x]\) : la moyenne des chats pour un chat, celle des chiens pour un chien.</p>`,
        details: {title: 'Le prédicteur optimal', html: String.raw`<p>Pour la perte quadratique, la fonction de prévision optimale est \(m^*(x)=\mathbb E[Y\mid X=x]\). Connaître \(x\) réduit le risque minimal.</p>`}}
    ],
    shared: riskShared,
    reset() { riskShared.c = 10; },
    canonical() { return {c: mean(ALLW)}; },
    init() {},
    controls(ctx) { return ctx.stage <= 1 ? slider('c', 'Constante \\(c\\)', ctx.state.c, 2, 13, 0.1, fr(ctx.state.c, 1) + ' kg') : ''; },
    wire(ctx) { wireRange(ctx, 'c', v => { ctx.state.c = v; }, v => fr(v, 1) + ' kg'); },
    draw(ctx) {
      const st = ctx.stage, s = ctx.state, m = mean(ALLW), med = median(ALLW);
      let lines = '', over = '';
      const rug = WEIGHTS.map(w => '<circle cx="' + RC.X(w.x).toFixed(1) + '" cy="' + (RC.P.B - 7) + '" r="4" fill="#fff" stroke="' + (w.y ? COL.dog : COL.cat) + '" stroke-width="2"/>').join('');
      if (st <= 1) {
        lines += AK.pathEl(RC.path(c => riskOf(ALLW, c)), COL.ink, 2.6);
        const r = riskOf(ALLW, s.c);
        lines += AK.pathEl('M' + RC.X(s.c).toFixed(1) + ' ' + RC.P.B + 'V' + RC.Y(Math.min(r, 20)).toFixed(1), COL.guide, 1.2, 'stroke-dasharray="4 4"') + (r <= 20 ? dot(RC.X(s.c), RC.Y(r), COL.error) : '');
        if (st === 1) {
          lines += AK.pathEl('M' + RC.X(m).toFixed(1) + ' ' + RC.P.T + 'V' + RC.P.B, COL.cat, 1.6, 'stroke-dasharray="6 4"') + AK.pathEl('M' + RC.X(med).toFixed(1) + ' ' + RC.P.T + 'V' + RC.P.B, COL.guide, 1.2, 'stroke-dasharray="2 4"');
          over += overlay(RC.X(m) + 34, RC.P.T + 8, 'moyenne', 'as-small', RC.P.W, RC.P.H) + overlay(RC.X(med) - 30, RC.P.T + 24, 'médiane', 'as-small', RC.P.W, RC.P.H);
        }
      } else {
        lines += AK.pathEl(RC.path(c => riskOf(CATW, c)), COL.cat, 2.6) + AK.pathEl(RC.path(c => riskOf(DOGW, c)), COL.dog, 2.6) + AK.pathEl(RC.path(c => riskOf(ALLW, c)), COL.soft, 1.4, 'stroke-dasharray="4 4"');
        [[CATW, COL.cat, 'chats'], [DOGW, COL.dog, 'chiens']].forEach(([v, col, name]) => { const mu = mean(v); lines += dot(RC.X(mu), RC.Y(riskOf(v, mu)), col); over += overlay(RC.X(mu), RC.Y(riskOf(v, mu)) + 22, name, 'as-small', RC.P.W, RC.P.H).replace('style="', 'style="color:' + col + ';'); });
      }
      setPlot(ctx, lines); setOverlay(ctx, over);
      ctx.svg.querySelector('.as-dots').innerHTML = rug;
      ctx.svg.querySelector('desc').textContent = st <= 1 ? 'Parabole du risque empirique en fonction de la constante c.' : 'Une parabole par espèce, minimale en la moyenne de l’espèce.';
      if (st <= 1) {
        const r = riskOf(ALLW, s.c);
        ctx.side.innerHTML = '<table class="as-table"><tbody><tr><td>\\(c\\)</td><td>' + fr(s.c, 1) + ' kg</td></tr><tr><td>\\(\\hat{\\mathcal R}(c)\\)</td><td>' + fr(r, 2) + '</td></tr>' + (st === 1 ? '<tr><td>moyenne \\(\\bar y\\)</td><td>' + fr(m, 2) + ' kg</td></tr><tr><td>médiane</td><td>' + fr(med, 2) + ' kg</td></tr><tr><td>risque minimal</td><td>' + fr(riskOf(ALLW, m), 2) + '</td></tr>' : '') + '</tbody></table>';
        ctx.readout.innerHTML = '<strong>\\(\\hat{\\mathcal R}(' + tx(s.c, 1) + ')=' + tx(r) + '\\)</strong><span>' + (Math.abs(s.c - m) < .15 ? 'Vous êtes au minimum.' : 'Le minimum est ' + (s.c > m ? 'plus à gauche.' : 'plus à droite.')) + '</span>';
      } else {
        const rc = riskOf(CATW, mean(CATW)), rd = riskOf(DOGW, mean(DOGW)), cond = (rc * CATW.length + rd * DOGW.length) / ALLW.length;
        ctx.side.innerHTML = '<table class="as-table"><thead><tr><th></th><th>prévision</th><th>risque</th></tr></thead><tbody><tr><td>sans l’espèce</td><td>' + fr(m, 2) + ' kg</td><td>' + fr(riskOf(ALLW, m), 2) + '</td></tr><tr><td style="color:' + COL.cat + '">chat</td><td>' + fr(mean(CATW), 2) + ' kg</td><td rowspan="2">' + fr(cond, 2) + '</td></tr><tr><td style="color:' + COL.dog + '">chien</td><td>' + fr(mean(DOGW), 2) + ' kg</td></tr></tbody></table><p class="as-side-caption">Connaître l’espèce divise le risque minimal par ' + fr(riskOf(ALLW, m) / cond, 1) + '.</p>';
        ctx.readout.innerHTML = '<strong>\\(m^*(\\text{chat})=' + tx(mean(CATW)) + '\\), \\(m^*(\\text{chien})=' + tx(mean(DOGW)) + '\\)</strong><span>La moyenne conditionnelle : la meilleure prévision quand on connaît \\(x\\).</span>';
      }
    }
  };

  /* =======================================================================
     Chapitre 2 · Géométrie : une droite, un vecteur normal
     ==================================================================== */
  const C0 = {x1: 7.5, x2: 4};
  const geoShared = {theta: 35, off: 0, k: 1, unknown: {x1: 5.6, x2: 2.4}};
  const GEO = JSON.stringify(geoShared);
  function geoModel(s, k = s.k) { const t = s.theta * Math.PI / 180, n1 = Math.cos(t), n2 = Math.sin(t); return {w1: k * n1, w2: k * n2, b: -k * (n1 * C0.x1 + n2 * C0.x2 + s.off), n1, n2}; }
  const geoErrors = m => train.filter(a => (g(m, a) >= 0 ? 1 : 0) !== a.y).length;
  const geometrieSpec = {
    id: 'geometrie-story', kicker: 'HYPERPLAN · UNE DROITE, UN VECTEUR NORMAL',
    footnote: 'Dans le plan des mesures (poids, pelage), un hyperplan est une droite. Ici \\(w=k(\\cos\\theta,\\sin\\theta)\\) et la droite passe par un point qu’on fait glisser le long de \\(w\\).',
    stages: [
      {title: 'Une droite, un vecteur normal', html: String.raw`<p>La droite \(g(x)=w^{\top}x+b=0\) coupe le plan en deux. Le vecteur \(w\) lui est <strong>perpendiculaire</strong>.</p><p>Tournez \(w\) : la droite tourne. Changez \(b\) : elle glisse sans tourner.</p>`,
        details: {title: 'Pourquoi w est normal', html: String.raw`<p>Si \(x\) et \(x'\) sont sur la droite, \(w^{\top}x+b=w^{\top}x'+b=0\), donc \(w^{\top}(x-x')=0\) : \(w\) est orthogonal à toute direction de la droite.</p>`}},
      {title: 'Le signe du score classe', html: String.raw`<p>Chaque animal reçoit un score \(g(x)\) : <strong>positif, chien</strong> ; négatif, chat.</p><p><strong>Défi :</strong> placez la droite pour faire au plus <strong>2 erreurs</strong>.</p>`,
        details: {title: 'Lire le score', html: String.raw`<p>Du côté où pointe \(w\), \(g(x)>0\). Sur la droite, \(g(x)=0\). Déplacez « ? » pour lire son score.</p>`}},
      {title: 'Multiplier w et b', slideTitle: 'Multiplier \\(w\\) et \\(b\\)', html: String.raw`<p>Multiplions \(w\) et \(b\) par un même nombre \(k>0\).</p><p>Les scores changent d’échelle… et la droite ?</p>`,
        prompt: String.raw`On multiplie \(w\) et \(b\) par \(2\). La droite \(g(x)=0\)…`,
        choices: [
          {t: 'tourne', why: String.raw`Tourner demanderait de changer la direction de \(w\) ; ici, seule sa longueur change.`},
          {t: 'ne bouge pas', ok: true},
          {t: 'glisse vers l’origine', why: String.raw`Les points où \(2(w^{\top}x+b)=0\) sont exactement ceux où \(w^{\top}x+b=0\).`}],
        answer: String.raw`\(2w^{\top}x+2b=0\iff w^{\top}x+b=0\) : la droite ne bouge pas, seuls les scores sont multipliés par \(2\). Le SVM devra donc fixer une échelle.`}
    ],
    shared: geoShared,
    reset() { Object.assign(geoShared, JSON.parse(GEO)); },
    canonical(stage) { return {theta: stage ? -9 : 35, off: stage ? -0.5 : 0, k: stage === 2 ? 2 : 1, unknown: {x1: 5.6, x2: 2.4}}; },
    init() {},
    position(ctx) { return ctx.state.unknown; },
    selectable() { return false; },
    movable(ctx, id) { return id === 'u' && ctx.stage >= 1; },
    move(ctx, id, x1, x2) { ctx.state.unknown = {x1, x2}; },
    focusOrder(ctx) { return ctx.stage >= 1 ? ['u'] : []; },
    controls(ctx) {
      const s = ctx.state;
      if (ctx.stage === 2) return '<span class="as-hint">Multiplier \\(w\\) et \\(b\\) par</span>' + AK.chips('k', [0.5, 1, 2], s.k, v => '\\(k=' + tx(v, v === 0.5 ? 1 : 0) + '\\)');
      return slider('theta', 'Orientation de \\(w\\)', s.theta, -180, 180, 5, s.theta + '°') + slider('off', 'Glisser la droite', s.off, -4, 4, 0.1, fr(s.off, 1));
    },
    wire(ctx) {
      wireRange(ctx, 'theta', v => { ctx.state.theta = v; }, v => v + '°');
      wireRange(ctx, 'off', v => { ctx.state.off = v; }, v => fr(v, 1));
      AK.wireChips(ctx, 'k', v => { ctx.state.k = +v; });
    },
    draw(ctx) {
      const st = ctx.stage, s = ctx.state, k = st === 2 ? s.k : 1, m = geoModel(s, k), n = {x1: m.n1, x2: m.n2};
      const P = {x1: C0.x1 + s.off * n.x1, x2: C0.x2 + s.off * n.x2}, L = 1.5 * k;
      let lines = line(levelPath(m, 0), COL.ink, 2.6) + arrow(P, {x1: P.x1 + L * n.x1, x2: P.x2 + L * n.x2}, COL.cat);
      // Étiquettes des demi-plans décalées le long de la droite (t) pour ne pas recouvrir la flèche w.
      const t = {x1: -n.x2, x2: n.x1}, pos = inside({x1: P.x1 + 3.2 * n.x1 + 1.2 * t.x1, x2: P.x2 + 3.2 * n.x2 + 1.2 * t.x2}), neg = inside({x1: P.x1 - 3 * n.x1 + .8 * t.x1, x2: P.x2 - 3 * n.x2 + .8 * t.x2});
      let over = overlay(X(pos.x1), Y(pos.x2), '\\(g(x)>0\\)', 'as-region-label').replace('style="', 'style="color:' + COL.dog + ';') +
        overlay(X(neg.x1), Y(neg.x2), '\\(g(x)<0\\)', 'as-region-label').replace('style="', 'style="color:' + COL.cat + ';') +
        overlay(X(P.x1 + (L + .5) * n.x1), Y(P.x2 + (L + .5) * n.x2), '\\(w\\)', 'as-strong').replace('style="', 'style="color:' + COL.cat + ';');
      setLines(ctx, lines);
      const list = st >= 1 ? train.map(a => ({id: a.id, x: X(a.x1), y: Y(a.x2), error: (g(m, a) >= 0 ? 1 : 0) !== a.y, aria: animalName(a) + ', ' + measures(a) + ', score ' + fr(g(m, a), 2)})) : [];
      if (st >= 1) list.push(unknownDot(s.unknown));
      placeDots(ctx, list); setOverlay(ctx, over);
      ctx.svg.querySelector('desc').textContent = 'Droite g(x) = 0 et vecteur normal w.';
      const errs = geoErrors(m), gu = g(m, s.unknown);
      const table = '<table class="as-table"><tbody><tr><td>\\(w\\)</td><td>\\((' + tx(m.w1) + '\\,;\\,' + tx(m.w2) + ')\\)</td></tr><tr><td>\\(b\\)</td><td>\\(' + tx(m.b) + '\\)</td></tr><tr><td>\\(\\|w\\|\\)</td><td>\\(' + tx(norm(m)) + '\\)</td></tr></tbody></table>';
      if (st === 0) { ctx.side.innerHTML = table; ctx.readout.innerHTML = '<strong>\\(g(x)=' + affine(m) + '\\)</strong><span>La droite est l’ensemble des points où \\(g(x)=0\\).</span>'; }
      if (st === 1) {
        ctx.side.innerHTML = table + goal(errs <= 2, errs <= 2 ? errs + ' erreur' + (errs > 1 ? 's' : '') + ' seulement.' : 'Placez la droite pour faire au plus 2 erreurs. Actuellement ' + errs + '.', 'hyperplan');
        ctx.readout.innerHTML = '<strong>Animal « ? » : \\(g(x)=' + tx(gu) + '\\) → ' + (gu >= 0 ? 'chien' : 'chat') + '</strong><span>Erreurs cerclées en brique : ' + errs + ' sur 24.</span>';
      }
      if (st === 2) {
        ctx.side.innerHTML = '<table class="as-table"><thead><tr><th>\\(k\\)</th><th>\\(g(?)\\)</th><th>droite</th></tr></thead><tbody>' + [0.5, 1, 2].map(kk => '<tr' + (kk === k ? ' class="is-current"' : '') + '><td>' + fr(kk, kk === 0.5 ? 1 : 0) + '</td><td>' + fr(g(geoModel(s, kk), s.unknown), 2) + '</td><td>identique</td></tr>').join('') + '</tbody></table>';
        ctx.readout.innerHTML = '<strong>\\(k=' + tx(k, k === 0.5 ? 1 : 0) + '\\) : \\(g(?)=' + tx(gu) + '\\)</strong><span>La flèche \\(w\\) s’allonge ; la droite reste la même.</span>';
      }
    }
  };

  /* =======================================================================
     Chapitre 2 · SVM : du score à la distance
     ==================================================================== */
  const SVM1 = A.fitSVM(train, 1);
  const distShared = {k: 1, unknown: {x1: 4.6, x2: 6.2}};
  const distanceSpec = {
    id: 'distance-story', kicker: 'SVM · DU SCORE À LA DISTANCE',
    footnote: 'Droite du SVM à marge souple appris sur les 24 animaux (\\(C=1\\)). Les axes n’ont pas la même unité (kg, cm) : en pratique, on standardise les variables avant de mesurer des distances.',
    stages: [
      {title: 'La distance à la droite', html: String.raw`<p>La distance de \(x\) à la droite vaut \(d=\dfrac{|g(x)|}{\|w\|}\).</p><p>Déplacez « ? » : le segment brique est cette distance.</p>`,
        prompt: String.raw`Si l’on double \(w\) et \(b\), la distance de « ? » à la droite…`,
        choices: [
          {t: 'double', why: String.raw`Le score \(g(x)\) double, mais \(\|w\|\) double aussi : le quotient ne change pas.`},
          {t: 'est divisée par 2', why: String.raw`Ni le score ni la norme ne diminuent : les deux sont multipliés par \(2\).`},
          {t: 'ne change pas', ok: true}],
        answer: String.raw`\(\dfrac{|2g(x)|}{\|2w\|}=\dfrac{|g(x)|}{\|w\|}\) : la distance est géométrique, indépendante de l’échelle de \((w,b)\).`},
      {title: 'Changer d’échelle', html: String.raw`<p>Multipliez \(w\) et \(b\) par \(k\) : le <strong>score</strong> change, la <strong>distance</strong> non.</p>`,
        details: {title: 'Marge fonctionnelle et marge géométrique', html: String.raw`<p>\(y\,g(x)\) est la marge fonctionnelle : elle dépend de l’échelle. \(y\,g(x)/\|w\|\) est la marge géométrique : elle n’en dépend pas.</p>`}},
      {title: 'Le point le plus proche', html: String.raw`<p>Parmi les 24 animaux, l’un est le <strong>plus proche</strong> de la droite.</p><p>Le SVM cherche la droite qui rend cette plus petite distance la plus grande possible : c’est la <strong>marge</strong>.</p>`}
    ],
    shared: distShared,
    reset() { Object.assign(distShared, {k: 1, unknown: {x1: 4.6, x2: 6.2}}); },
    canonical(stage) { return {k: stage === 1 ? 2 : 1, unknown: {x1: 4.6, x2: 6.2}}; },
    init() {},
    position(ctx) { return ctx.state.unknown; },
    selectable() { return false; },
    movable(ctx, id) { return id === 'u' && ctx.stage <= 1; },
    move(ctx, id, x1, x2) { ctx.state.unknown = {x1, x2}; },
    focusOrder(ctx) { return ctx.stage <= 1 ? ['u'] : []; },
    controls(ctx) { return ctx.stage === 1 ? '<span class="as-hint">Multiplier \\(w\\) et \\(b\\) par</span>' + AK.chips('k', [1, 2, 5], ctx.state.k, v => '\\(k=' + v + '\\)') : ''; },
    wire(ctx) { AK.wireChips(ctx, 'k', v => { ctx.state.k = +v; }); },
    draw(ctx) {
      const st = ctx.stage, s = ctx.state, m = scale(SVM1, st === 1 ? s.k : 1), u = s.unknown;
      let lines = line(levelPath(m, 0), COL.ink, 2.6), over = '';
      { const q = levelLabelPoint(m, 0); if (q) over += overlay(q[0], q[1], '\\(g(x)=0\\)', 'as-top-label as-strong'); }
      let list;
      if (st <= 1) {
        const f = foot(m, u), d = Math.abs(g(m, u)) / norm(m);
        lines += seg(u, f, COL.error, 2.6) + '<circle cx="' + X(f.x1).toFixed(1) + '" cy="' + Y(f.x2).toFixed(1) + '" r="3.5" fill="' + COL.error + '"/>';
        over += overlay((X(u.x1) + X(f.x1)) / 2 + 18, (Y(u.x2) + Y(f.x2)) / 2 - 12, '\\(d=' + tx(d) + '\\)', 'as-small').replace('style="', 'style="color:' + COL.error + ';');
        list = train.map(a => ({id: a.id, x: X(a.x1), y: Y(a.x2), opacity: .35, aria: animalName(a) + ', ' + measures(a)}));
        list.push(unknownDot(u));
        const rows = [1, 2, 5].map(kk => { const mk = scale(SVM1, kk); return {kk, g: g(mk, u), n: norm(mk)}; });
        ctx.side.innerHTML = st === 0
          ? '<table class="as-table"><tbody><tr><td>\\(g(x)\\)</td><td>\\(' + tx(g(m, u)) + '\\)</td></tr><tr><td>\\(\\|w\\|\\)</td><td>\\(' + tx(norm(m)) + '\\)</td></tr><tr><td>\\(d\\)</td><td>\\(' + tx(d) + '\\)</td></tr></tbody></table>'
          : '<table class="as-table"><thead><tr><th>\\(k\\)</th><th>\\(g(x)\\)</th><th>\\(\\|w\\|\\)</th><th>\\(d\\)</th></tr></thead><tbody>' + rows.map(r => '<tr' + (r.kk === s.k ? ' class="is-current"' : '') + '><td>' + r.kk + '</td><td>' + fr(r.g, 2) + '</td><td>' + fr(r.n, 2) + '</td><td>' + fr(Math.abs(r.g) / r.n, 2) + '</td></tr>').join('') + '</tbody></table>';
        ctx.readout.innerHTML = '<strong>\\(d=\\dfrac{|g(x)|}{\\|w\\|}=\\dfrac{' + tx(Math.abs(g(m, u))) + '}{' + tx(norm(m)) + '}=' + tx(d) + '\\)</strong><span>' + (g(m, u) >= 0 ? 'Côté chien.' : 'Côté chat.') + '</span>';
      } else {
        const ds = train.map(a => ({a, d: Math.abs(g(m, a)) / norm(m)})), best = ds.reduce((p, q) => q.d < p.d ? q : p);
        lines += seg(best.a, foot(m, best.a), COL.error, 2.6);
        list = train.map(a => ({id: a.id, x: X(a.x1), y: Y(a.x2), halo: a === best.a ? 3 : 0, aria: animalName(a) + ', distance ' + fr(Math.abs(g(m, a)) / norm(m), 2)}));
        ctx.side.innerHTML = '<table class="as-table"><thead><tr><th>Animal</th><th>distance</th></tr></thead><tbody>' + ds.slice().sort((p, q) => p.d - q.d).slice(0, 4).map((r, i) => '<tr' + (i === 0 ? ' class="is-current"' : '') + '><td>' + animalName(r.a) + '</td><td>' + fr(r.d, 2) + '</td></tr>').join('') + '</tbody></table><p class="as-side-caption">Les quatre animaux les plus proches de la droite.</p>';
        ctx.readout.innerHTML = '<strong>Plus petite distance : ' + fr(best.d, 2) + ' (' + animalName(best.a) + ')</strong><span>Le SVM maximise cette plus petite distance.</span>';
      }
      setLines(ctx, lines); placeDots(ctx, list); setOverlay(ctx, over);
      ctx.svg.querySelector('desc').textContent = st <= 1 ? 'Distance de l’animal inconnu à la droite.' : 'Animal le plus proche de la droite.';
    }
  };

  /* =======================================================================
     Chapitre 2 · Marge souple : relâchements ξ et rôle de C
     ==================================================================== */
  const slackShared = {C: 1};
  const svmC = C => A.fitSVM(train, C);
  function slackParts(m) {
    return train.map((a, i) => { const marg = ypm(a) * g(m, a), xi = Math.max(0, 1 - marg); return {a, i, marg, xi, kind: xi <= 1e-6 ? 'out' : xi <= 1 + 1e-9 ? 'in' : 'wrong'}; });
  }
  function hingeFig(parts) {
    const W = 300, H = 210, L = 30, R = 290, T = 12, B = 182, mx = v => L + (v + 2.5) / 5.5 * (R - L), my = v => B - v / 3.6 * (B - T);
    let s = '<path d="M' + L + ' ' + B + 'H' + R + 'M' + mx(0) + ' ' + T + 'V' + B + '" stroke="' + COL.axis + '" fill="none"/>' +
      '<path d="M' + mx(1) + ' ' + T + 'V' + B + '" stroke="' + COL.guide + '" stroke-dasharray="4 4"/>' +
      '<path d="M' + mx(-2.5).toFixed(1) + ' ' + my(3.5).toFixed(1) + 'L' + mx(1).toFixed(1) + ' ' + my(0).toFixed(1) + 'L' + mx(3) + ' ' + my(0) + '" stroke="' + COL.ink + '" stroke-width="2.4" fill="none"/>';
    parts.forEach(p => { s += '<circle cx="' + mx(clamp(p.marg, -2.4, 2.9)).toFixed(1) + '" cy="' + my(Math.min(p.xi, 3.5)).toFixed(1) + '" r="4.2" fill="#fff" stroke="' + (p.a.y ? COL.dog : COL.cat) + '" stroke-width="2"/>'; });
    s += '<text x="' + (R - 4) + '" y="' + (B + 18) + '" text-anchor="end" class="as-tick">y g(x)</text><text x="' + (mx(1) + 4) + '" y="' + (T + 10) + '" class="as-tick">1</text><text x="' + (mx(0) + 4) + '" y="' + (T + 10) + '" class="as-tick">0</text>';
    return sideFig(W, H + 10, s, 'Perte charnière en fonction de y g(x), avec les 24 animaux');
  }
  const slackSpec = {
    id: 'slack-story', kicker: 'MARGE SOUPLE · LES RELÂCHEMENTS', noDrag: true,
    footnote: 'SVM linéaire à marge souple sur les 24 animaux d’apprentissage. \\(\\xi_i\\) se lit en unités de score : la longueur dessinée vaut \\(\\xi_i/\\|w\\|\\).',
    stages: [
      {title: 'Des animaux dans la marge', html: String.raw`<p>Les données se chevauchent : certains animaux sont <strong>dans la marge</strong>, voire du mauvais côté.</p><p>Chacun reçoit un <strong>relâchement</strong> \(\xi_i\ge0\) : ce qui lui manque pour atteindre son bord \(y_i\,g(x_i)=1\).</p>`,
        details: {title: 'La contrainte relâchée', html: String.raw`<p>On remplace \(y_i\,g(x_i)\ge1\) par \(y_i\,g(x_i)\ge1-\xi_i\), avec \(\xi_i\ge0\). Hors de la marge, \(\xi_i=0\).</p>`}},
      {title: 'Trois situations', html: String.raw`<p>\(\xi_i=0\) : hors de la marge. \(0<\xi_i\le1\) : <strong>dans la marge</strong>, encore du bon côté. \(\xi_i>1\) : <strong>mauvais côté</strong>.</p>`,
        prompt: String.raw`Un chat bien classé, mais à l’intérieur de la marge, a un relâchement \(\xi\)…`,
        choices: [
          {t: String.raw`égal à \(0\)`, why: String.raw`\(\xi=0\) seulement hors de la marge, du bon côté : \(y\,g(x)\ge1\).`},
          {t: String.raw`entre \(0\) et \(1\)`, ok: true},
          {t: String.raw`plus grand que \(1\)`, why: String.raw`\(\xi>1\) signifie \(y\,g(x)<0\) : l’animal a franchi la frontière.`}],
        answer: String.raw`Bien classé : \(y\,g(x)>0\). Dans la marge : \(y\,g(x)<1\). Donc \(\xi=1-y\,g(x)\in(0,1)\) : une violation de marge n’est pas forcément une erreur.`},
      {title: 'Le rôle de C', slideTitle: 'Le rôle de \\(C\\)', html: String.raw`<p>\(C\) règle le prix des violations dans \(\tfrac12\|w\|^2+C\sum_i\xi_i\).</p><p>Changez \(C\) et regardez la largeur de la marge.</p>`,
        prompt: String.raw`Quand \(C\) augmente, la marge…`,
        choices: [
          {t: 's’élargit', why: String.raw`Un grand \(C\) rend les violations plus coûteuses : le SVM réduit la marge pour en avoir moins.`},
          {t: 'se rétrécit', ok: true},
          {t: 'ne change pas', why: String.raw`\(C\) change le compromis entre \(\|w\|\) et \(\sum_i\xi_i\), donc la solution.`}],
        answer: String.raw`Ici, la largeur \(2/\|w\|\) passe d’environ \(7{,}0\) à \(1{,}4\) quand \(C\) va de \(0{,}01\) à \(10\). Un grand \(C\) pénalise davantage les violations.`},
      {title: 'ξ est la perte charnière', slideTitle: '\\(\\xi_i\\) est la perte charnière', html: String.raw`<p>À \(w,b\) fixés, le meilleur relâchement vaut \(\xi_i=\max\big(0,\,1-y_i\,g(x_i)\big)\) : la <strong>perte charnière</strong>.</p><p>Chaque animal est un point sur cette courbe.</p>`,
        details: {title: 'Le SVM souple, sans contraintes', html: String.raw`<p>Le problème devient \(\min_{w,b}\ \tfrac12\|w\|^2+C\sum_i\max\big(0,1-y_i\,g(x_i)\big)\) : une régularisation plus une perte charnière.</p>`}}
    ],
    shared: slackShared,
    reset() { slackShared.C = 1; },
    canonical() { return {C: 1}; },
    init() {},
    controls(ctx) { return ctx.stage === 2 ? '<span class="as-hint">Valeur de \\(C\\)</span>' + AK.chips('c', A.C_GRID, ctx.state.C, v => '\\(C=' + String(v).replace('.', '{,}') + '\\)') : ''; },
    wire(ctx) { AK.wireChips(ctx, 'c', v => { ctx.state.C = +v; }); },
    draw(ctx) {
      const st = ctx.stage, C = st === 2 ? ctx.state.C : 1, m = svmC(C), parts = slackParts(m), viol = parts.filter(p => p.kind !== 'out');
      let lines = line(levelPath(m, -1), COL.ink, 1.3, '6 4') + line(levelPath(m, 1), COL.ink, 1.3, '6 4') + line(levelPath(m, 0), COL.ink, 2.6), over = '';
      viol.forEach(p => { lines += seg(p.a, foot(m, p.a, ypm(p.a)), p.kind === 'wrong' ? COL.error : COL.ochre, 2.4); });
      if (viol.length <= 6) viol.forEach(p => { over += overlay(X(p.a.x1) + 26, Y(p.a.x2) - 14, '\\(\\xi=' + tx(p.xi) + '\\)', 'as-small').replace('style="', 'style="color:' + (p.kind === 'wrong' ? COL.error : COL.ochre) + ';'); });
      { const q = levelLabelPoint(m, 0); if (q) over += overlay(q[0], q[1], '\\(g(x)=0\\)', 'as-top-label as-strong'); }
      setLines(ctx, lines);
      placeDots(ctx, parts.map(p => ({id: p.a.id, x: X(p.a.x1), y: Y(p.a.x2), support: p.kind === 'in', error: p.kind === 'wrong', aria: animalName(p.a) + ', ' + measures(p.a) + ', ξ = ' + fr(p.xi, 2)})));
      setOverlay(ctx, over);
      ctx.svg.querySelector('desc').textContent = 'Frontière, bords de marge et relâchements des animaux qui violent la marge.';
      const nIn = parts.filter(p => p.kind === 'in').length, nWrong = parts.filter(p => p.kind === 'wrong').length, sum = parts.reduce((t, p) => t + p.xi, 0);
      if (st === 0) ctx.side.innerHTML = '<table class="as-table"><thead><tr><th>Animal</th><th>\\(y_i\\,g(x_i)\\)</th><th>\\(\\xi_i\\)</th></tr></thead><tbody>' + viol.sort((p, q) => q.xi - p.xi).map(p => '<tr><td>' + animalName(p.a) + '</td><td>' + fr(p.marg, 2) + '</td><td>' + fr(p.xi, 2) + '</td></tr>').join('') + '</tbody></table>';
      if (st === 1) ctx.side.innerHTML = '<div class="as-legend as-legend-col">' + legendRow(COL.ink, 'hors de la marge, \\(\\xi_i=0\\) · ' + (24 - nIn - nWrong), true) + legendRow(COL.ochre, 'dans la marge, \\(0<\\xi_i\\le1\\) · ' + nIn) + legendRow(COL.error, 'mauvais côté, \\(\\xi_i>1\\) · ' + nWrong) + '</div>';
      if (st === 2) ctx.side.innerHTML = '<table class="as-table"><thead><tr><th>\\(C\\)</th><th>largeur \\(2/\\|w\\|\\)</th><th>\\(\\sum\\xi_i\\)</th><th>violations</th></tr></thead><tbody>' + A.C_GRID.map(c => { const mc = svmC(c), pc = slackParts(mc); return '<tr' + (c === C ? ' class="is-current"' : '') + '><td>' + fr(c, c < 1 ? 2 : 0) + '</td><td>' + fr(2 / norm(mc), 2) + '</td><td>' + fr(pc.reduce((t, p) => t + p.xi, 0), 2) + '</td><td>' + pc.filter(p => p.kind !== 'out').length + '</td></tr>'; }).join('') + '</tbody></table>';
      if (st === 3) ctx.side.innerHTML = hingeFig(parts) + '<p class="as-side-caption">Points à droite de 1 : \\(\\xi_i=0\\). À gauche de 0 : mauvais côté.</p>';
      ctx.readout.innerHTML = st === 3
        ? '<strong>\\(\\xi_i=\\max\\big(0,\\,1-y_i\\,g(x_i)\\big)\\)</strong><span>\\(\\sum_i\\xi_i=' + tx(sum) + '\\) pour \\(C=1\\).</span>'
        : '<strong>' + viol.length + ' violation' + (viol.length > 1 ? 's' : '') + ' de marge · ' + nWrong + ' du mauvais côté</strong><span>\\(C=' + String(C).replace('.', '{,}') + '\\), largeur \\(2/\\|w\\|=' + tx(2 / norm(m)) + '\\), \\(\\sum_i\\xi_i=' + tx(sum) + '\\).</span>';
    }
  };

  /* =======================================================================
     Chapitre 2 · Dualité : un multiplicateur par animal
     ==================================================================== */
  const dualShared = {C: 1, pos: {}};
  const dualPoints = s => train.map(a => s.pos[a.id] ? {...a, ...s.pos[a.id]} : a);
  const dualFit = s => A.fitSVM(dualPoints(s), s.C);
  function alphaFig(m, pts, C) {
    const W = 300, H = 190, L = 26, R = 292, T = 16, B = 160, n = pts.length, bw = (R - L) / n;
    const order = pts.map((a, i) => ({a, al: m.alpha[i]})).sort((p, q) => q.al - p.al), top = Math.max(C, ...m.alpha) * 1.08 || 1, yy = v => B - v / top * (B - T);
    let s = '<path d="M' + L + ' ' + B + 'H' + R + '" stroke="' + COL.axis + '"/>' + '<path d="M' + L + ' ' + yy(C).toFixed(1) + 'H' + R + '" stroke="' + COL.error + '" stroke-dasharray="5 4"/><text x="' + (R - 2) + '" y="' + (yy(C) - 5).toFixed(1) + '" text-anchor="end" class="as-tick" fill="' + COL.error + '">C</text>';
    order.forEach((o, i) => { const h = B - yy(o.al); if (h > .3) s += '<rect x="' + (L + i * bw + 1.5).toFixed(1) + '" y="' + yy(o.al).toFixed(1) + '" width="' + (bw - 3).toFixed(1) + '" height="' + h.toFixed(1) + '" rx="2" fill="' + (o.al >= C - 1e-6 ? COL.error : o.a.y ? COL.dog : COL.cat) + '"/>'; else s += '<circle cx="' + (L + i * bw + bw / 2).toFixed(1) + '" cy="' + (B - 3) + '" r="1.8" fill="' + COL.guide + '"/>'; });
    s += '<text x="' + L + '" y="' + (B + 18) + '" class="as-tick">24 animaux, du plus grand \u03b1 au plus petit</text>';
    return sideFig(W, H + 10, s, 'Multiplicateurs alpha des 24 animaux');
  }
  const dualSpec = {
    id: 'dual-story', kicker: 'DUALITÉ · LES MULTIPLICATEURS',
    footnote: 'Solution du problème dual du cours sur les 24 animaux d’apprentissage (marge souple). Au deuxième temps, tous les animaux se déplacent : le SVM est réappris à chaque mouvement.',
    stages: [
      {title: 'Un α par animal', slideTitle: 'Un \\(\\alpha_i\\) par animal', html: String.raw`<p>Le dual associe un <strong>multiplicateur</strong> \(\alpha_i\ge0\) à chaque animal.</p><p>La plupart valent \(0\). Ceux qui sont strictement positifs désignent les <strong>vecteurs de support</strong>, cerclés.</p>`,
        details: {title: 'D’où vient α', html: String.raw`<p>\(\alpha_i\) est le multiplicateur de Lagrange de la contrainte \(y_i\,g(x_i)\ge1-\xi_i\). Il est nul quand la contrainte n’est pas active.</p>`}},
      {title: 'Seuls les supports comptent', html: String.raw`<p>\(w=\sum_i\alpha_i y_i x_i\) : seuls les animaux avec \(\alpha_i>0\) y contribuent.</p><p><strong>Déplacez un animal</strong> : la frontière ne bouge que s’il est (ou devient) un vecteur de support.</p>`,
        prompt: String.raw`On éloigne un chat de la frontière, sans qu’il entre dans la marge. \(w\)…`,
        choices: [
          {t: 'change un peu', why: String.raw`Hors de la marge, \(\alpha_i=0\) : l’animal n’apparaît pas dans \(w=\sum_i\alpha_i y_i x_i\).`},
          {t: 'ne change pas', ok: true},
          {t: 'change beaucoup', why: String.raw`Un animal sans multiplicateur actif n’a aucun poids dans \(w\).`}],
        answer: String.raw`Un animal hors de la marge garde \(\alpha_i=0\) : ni \(w\) ni \(b\) ne changent. Essayez en déplaçant un animal loin de la frontière.`},
      {title: 'α est borné par C', slideTitle: '\\(\\alpha_i\\) est borné par \\(C\\)', html: String.raw`<p>En marge souple, \(0\le\alpha_i\le C\).</p><p>\(0<\alpha_i<C\) : sur un bord. \(\alpha_i=C\) (en brique) : dans la marge ou mal classé.</p>`,
        prompt: String.raw`Un animal a \(\alpha_i=C\). Il est…`,
        choices: [
          {t: 'sur le bord de la marge', why: String.raw`Sur le bord, en général \(0<\alpha_i<C\).`},
          {t: 'loin de la frontière', why: String.raw`Loin de la frontière, hors de la marge : \(\alpha_i=0\).`},
          {t: 'dans la marge ou du mauvais côté', ok: true}],
        answer: String.raw`Si \(\alpha_i=C\), les conditions KKT donnent \(y_i\,g(x_i)\le1\) : l’animal ne respecte pas strictement la marge. Ici, ce sont les animaux dans la marge ou mal classés.`}
    ],
    shared: dualShared,
    reset() { dualShared.C = 1; dualShared.pos = {}; },
    canonical() { return {C: 1, pos: {}}; },
    init() {},
    position(ctx, id) { return dualPoints(ctx.state).find(a => a.id === id); },
    selectable() { return false; },
    movable(ctx, id) { return ctx.stage === 1 && id !== 'u'; },
    move(ctx, id, x1, x2) { ctx.state.pos = {...ctx.state.pos, [id]: {x1, x2}}; },
    focusOrder(ctx) { return ctx.stage === 1 ? train.map(a => a.id) : []; },
    controls(ctx) { return ctx.stage === 2 ? '<span class="as-hint">Valeur de \\(C\\)</span>' + AK.chips('c', A.C_GRID, ctx.state.C, v => '\\(C=' + String(v).replace('.', '{,}') + '\\)') : ''; },
    wire(ctx) { AK.wireChips(ctx, 'c', v => { ctx.state.C = +v; }); },
    draw(ctx) {
      const st = ctx.stage, s = ctx.state, C = st === 2 ? s.C : 1, sc = {...s, C}, pts = st === 1 ? dualPoints(s) : train, m = st === 1 ? dualFit(sc) : A.fitSVM(train, C);
      const sv = pts.map((a, i) => m.alpha[i] > 1e-6), atC = pts.map((a, i) => m.alpha[i] >= C - 1e-6);
      let lines = line(levelPath(m, -1), COL.ink, 1.3, '6 4') + line(levelPath(m, 1), COL.ink, 1.3, '6 4') + line(levelPath(m, 0), COL.ink, 2.6);
      if (st === 1) { const m0 = A.fitSVM(train, 1); if (Math.abs(m0.w1 - m.w1) + Math.abs(m0.w2 - m.w2) + Math.abs(m0.b - m.b) > 1e-3) lines = line(levelPath(m0, 0), COL.guide, 1.4, '2 4') + lines; }
      setLines(ctx, lines);
      placeDots(ctx, pts.map((a, i) => ({id: a.id, x: X(a.x1), y: Y(a.x2), support: sv[i] && !(st === 2 && atC[i]), error: st === 2 && atC[i], movable: st === 1, interactive: st === 1, aria: animalName(a) + ', ' + measures(a) + ', alpha ' + fr(m.alpha[i], 2)})));
      setOverlay(ctx, '');
      ctx.svg.querySelector('desc').textContent = 'SVM et vecteurs de support cerclés.';
      const nsv = sv.filter(Boolean).length;
      if (st === 0) { ctx.side.innerHTML = alphaFig(m, pts, C); ctx.readout.innerHTML = '<strong>' + nsv + ' animaux sur 24 ont \\(\\alpha_i>0\\)</strong><span>Les vecteurs de support. Les ' + (24 - nsv) + ' autres ont \\(\\alpha_i=0\\).</span>'; }
      if (st === 1) {
        const ws = pts.reduce((acc, a, i) => ({w1: acc.w1 + m.alpha[i] * ypm(a) * a.x1, w2: acc.w2 + m.alpha[i] * ypm(a) * a.x2}), {w1: 0, w2: 0});
        const m0 = A.fitSVM(train, 1), same = Math.abs(m0.w1 - m.w1) + Math.abs(m0.w2 - m.w2) + Math.abs(m0.b - m.b) < 1e-3, moved = Object.keys(s.pos).length > 0;
        ctx.side.innerHTML = '<table class="as-table"><thead><tr><th>Support</th><th>\\(\\alpha_i\\)</th><th>\\(y_i\\)</th></tr></thead><tbody>' + pts.map((a, i) => ({a, al: m.alpha[i]})).filter(r => r.al > 1e-6).sort((p, q) => q.al - p.al).map(r => '<tr><td>' + animalName(r.a) + '</td><td>' + fr(r.al, 3) + '</td><td>' + (r.a.y ? '+1' : '−1') + '</td></tr>').join('') + '</tbody></table>' +
          '<p class="as-side-caption">\\(\\sum_i\\alpha_i y_i x_i=(' + tx(ws.w1) + '\\,;\\,' + tx(ws.w2) + ')=w\\)</p>' + goal(moved && same, moved && same ? '\\(w\\) et \\(b\\) inchangés : l’animal déplacé n’est pas un support.' : (moved ? 'La frontière a bougé (pointillés : l’ancienne) : cet animal est un support. ' : '') + 'Déplacez un animal sans faire bouger la frontière.', 'dual-support');
        ctx.readout.innerHTML = '<strong>\\(w=(' + tx(m.w1) + '\\,;\\,' + tx(m.w2) + ')\\), \\(b=' + tx(m.b) + '\\)</strong><span>' + nsv + ' vecteurs de support. Réinitialiser remet les animaux en place.</span>';
      }
      if (st === 2) { ctx.side.innerHTML = alphaFig(m, pts, C) + '<div class="as-legend">' + legendRow(COL.error, '\\(\\alpha_i=C\\)') + legendRow(COL.cat, '\\(0<\\alpha_i<C\\)') + '</div>'; ctx.readout.innerHTML = '<strong>\\(C=' + String(C).replace('.', '{,}') + '\\) : ' + atC.filter(Boolean).length + ' animaux avec \\(\\alpha_i=C\\), ' + (nsv - atC.filter(Boolean).length) + ' avec \\(0<\\alpha_i<C\\)</strong><span>\\(\\sum_i\\alpha_i y_i=' + tx(pts.reduce((t, a, i) => t + m.alpha[i] * ypm(a), 0), 3) + '\\), comme l’exige le dual.</span>'; }
    }
  };

  window.SuperviseStory = K.defineStory(superviseSpec);
  window.LossStory = K.defineStory(lossSpec);
  window.RiskStory = K.defineStory(riskSpec);
  window.GeometryStory = K.defineStory(geometrieSpec);
  window.DistanceStory = K.defineStory(distanceSpec);
  window.SlackStory = K.defineStory(slackSpec);
  window.DualStory = K.defineStory(dualSpec);
})();
