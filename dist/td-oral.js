(function (root) {
  'use strict';
  /* Mini-oral de fin de TD : un dé tire un thème (la face), puis une question au hasard dans ce
     thème. 3 minutes par binôme, sans IA et sans notes. Les attendus restent repliés : ils servent
     à l'enseignante. L'exercice est déclaré dans td.js ({widget: 'oral-td1'}). */
  const TD1 = [
    {face: 1, name: 'Risque et preuve', questions: [
      {q: 'Pourquoi E[Y | X = x] minimise-t-il le risque quadratique ? Donnez l’idée de la preuve en une phrase.', relance: 'Que devient le terme croisé, et pourquoi ?', attendus: 'Décomposer Y − f(X) autour de m*(X) ; le terme croisé est nul en conditionnant par X ; il reste un terme ≥ 0.'},
      {q: 'Qu’est-ce qui distingue le risque du risque empirique ?', relance: 'Lequel peut-on calculer ?', attendus: 'Le risque est une espérance sous la loi inconnue des données ; le risque empirique est une moyenne sur l’échantillon. Seul le second se calcule.'},
      {q: 'Pour la perte absolue, quel prédicteur remplace la moyenne conditionnelle ?', relance: 'Pourquoi résiste-t-il mieux aux valeurs extrêmes ?', attendus: 'La médiane conditionnelle ; une valeur extrême déplace la moyenne, beaucoup moins la médiane.'}
    ]},
    {face: 2, name: 'Pertes', questions: [
      {q: 'Pour une marge m = 0,2, que valent la hinge et la perte 0-1 ? Que révèle la différence ?', relance: 'Et pour m = −0,5 ?', attendus: 'Hinge 0,8, 0-1 nulle : bien classé mais dans la marge. Pour −0,5 : 1,5 et 1. La hinge mesure de combien on est du bon côté.'},
      {q: 'Votre classement des trois risques empiriques était-il juste avant d’exécuter ? Qu’aviez-vous oublié ?', relance: 'La perte logistique peut-elle valoir 0 ?', attendus: 'Hinge = 0-1 = 0 < logistique ≈ 0,189 ; la perte logistique reste positive pour toute marge finie.'},
      {q: 'Si l’erreur double, que deviennent la perte absolue et la perte quadratique ?', relance: 'Laquelle préférer en présence de valeurs aberrantes ?', attendus: 'Absolue × 2, quadratique × 4 ; la perte absolue est plus robuste aux valeurs extrêmes.'}
    ]},
    {face: 3, name: 'Courbe en U', questions: [
      {q: 'La MSE d’apprentissage baisse toujours avec le degré. Pourquoi ne pas prendre le plus grand degré ?', relance: 'Montrez sur votre graphique où cela se voit.', attendus: 'Familles emboîtées ; la validation remonte après le degré 2 ; le modèle suit le bruit.'},
      {q: 'Votre croquis initial : où étiez-vous juste, où vous êtes-vous trompé ?', relance: 'Qu’est-ce qui vous a le plus surpris ?', attendus: 'Une réponse honnête sur la prédiction : apprentissage décroissant, validation en U, minimum au degré 2.'},
      {q: 'Sur votre graphique, où voit-on un modèle trop simple ? un modèle trop souple ?', relance: 'Une seule courbe de validation suffit-elle à mesurer la variance ?', attendus: 'Degrés 0-1 : les deux erreurs sont grandes. Degré 5 : l’apprentissage baisse, la validation remonte. Non : la variance se mesure en réapprenant sur plusieurs échantillons.'}
    ]},
    {face: 4, name: 'Bruit et taille de l’échantillon', questions: [
      {q: 'Avec n = 12, qu’est-ce qui a changé entre les deux courbes ? Et avec n = 500 ?', relance: 'Vers quelle valeur tend la MSE de validation au meilleur degré ?', attendus: 'n = 12 : l’écart se creuse (0,31 contre 1,26 au degré 5) ; n = 500 : les courbes se rejoignent ; plancher ≈ σ².'},
      {q: 'Avec σ = 3, pourquoi la MSE de validation ne descend-elle pas sous 9 environ ?', relance: 'Un meilleur modèle pourrait-il faire mieux ?', attendus: 'σ² = 9 est le bruit irréductible : même le vrai modèle le subit. Non.'},
      {q: 'Que changerait le doublement des données ? Et le doublement du bruit ?', relance: 'Lequel des deux améliore la généralisation ?', attendus: 'Plus de données réduisent l’écart entre apprentissage et validation ; doubler σ multiplie le plancher par 4.'}
    ]},
    {face: 5, name: 'Validation croisée et test', questions: [
      {q: 'Montrez la ligne de votre validation croisée qui garantit qu’un point n’est jamais évalué par un modèle qui l’a vu.', relance: 'Combien de modèles apprenez-vous pour un degré ?', attendus: 'Ajustement sur train_indices, évaluation sur val_indices ; K apprentissages par degré.'},
      {q: 'Pourquoi n’ouvrir le test qu’une seule fois ?', relance: 'Que vaut un score de test après dix essais ?', attendus: 'Sinon le test sert à choisir : le score devient optimiste et ne mesure plus la généralisation.'},
      {q: 'Pourquoi la MSE varie-t-elle d’un bloc à l’autre ?', relance: 'Pourquoi fait-on la moyenne ?', attendus: 'Chaque bloc contient des points différents ; la moyenne des blocs stabilise l’estimation du risque.'}
    ]},
    {face: 6, name: 'Audit du code de l’IA', questions: [
      {q: 'Sur du bruit pur, l’IA annonçait 90 % de réussite. Quelle erreur gonflait le plus ce score, et comment le savez-vous ?', relance: 'Que se passerait-il avec 20 000 variables de bruit ?', attendus: 'La sélection des variables sur toutes les données, test compris ; plus il y a de variables, plus certaines semblent liées à y par hasard.'},
      {q: 'Pourquoi la standardisation et la sélection doivent-elles être dans la Pipeline ?', relance: 'Que fait GridSearchCV de la Pipeline dans chaque pli ?', attendus: 'Elles sont réapprises sur la partie d’apprentissage de chaque pli ; le bloc de validation n’influence pas la transformation.'},
      {q: 'Qu’avez-vous vérifié vous-même avant de faire confiance au score corrigé ?', relance: 'Comment savoir que 50 % est le bon ordre de grandeur ?', attendus: 'Le test est séparé avant toute transformation et n’est utilisé qu’une fois ; sur du bruit pur, 50 % est attendu.'}
    ]}
  ];

  // Faces du dé : positions des points sur une grille 3 × 3.
  const PIPS = {1: [4], 2: [0, 8], 3: [0, 4, 8], 4: [0, 2, 6, 8], 5: [0, 2, 4, 6, 8], 6: [0, 2, 3, 5, 6, 8]};
  const dieSVG = face => '<svg viewBox="0 0 100 100" aria-hidden="true"><rect x="6" y="10" width="88" height="86" rx="20" fill="#6e3f70"/><rect x="6" y="4" width="88" height="86" rx="20" fill="#8a4f8c"/>' +
    PIPS[face].map(i => '<circle cx="' + (26 + (i % 3) * 24) + '" cy="' + (23 + Math.floor(i / 3) * 24) + '" r="7.5" fill="#fff"/>').join('') + '</svg>';
  const reduced = () => root.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const escape = s => String(s).replace(/[&<>"]/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'}[c]));

  function mount(THEMES, slot) {
    const used = new Set();
    let timer = null, left = 180;
    slot.innerHTML = '<div class="oral">' +
      '<div class="oral-roll"><button type="button" class="oral-die" aria-label="Lancer le dé">' + dieSVG(6) + '</button>' +
      '<div><button type="button" class="as-button as-primary oral-go">Lancer le dé</button>' +
      '<ol class="oral-themes">' + THEMES.map(t => '<li><span class="oral-face">' + t.face + '</span>' + escape(t.name) + '</li>').join('') + '</ol></div></div>' +
      '<div class="oral-card" aria-live="polite" hidden></div></div>';
    const die = slot.querySelector('.oral-die'), card = slot.querySelector('.oral-card');

    function pick(theme) {
      // Pas de répétition tant que le thème a des questions inédites.
      const fresh = theme.questions.filter(q => !used.has(q.q));
      const pool = fresh.length ? fresh : theme.questions;
      const q = pool[Math.floor(Math.random() * pool.length)];
      used.add(q.q);
      return q;
    }
    function clock() { return Math.floor(left / 60) + ':' + String(left % 60).padStart(2, '0'); }
    function stop() { clearInterval(timer); timer = null; }
    function show(theme, q) {
      stop(); left = 180;
      card.hidden = false;
      card.innerHTML = '<div class="oral-card-head"><span class="oral-face">' + theme.face + '</span><span class="oral-theme">' + escape(theme.name) + '</span>' +
        '<span class="oral-timer"><strong>' + clock() + '</strong><button type="button" class="as-button oral-start">Démarrer</button></span></div>' +
        '<p class="oral-q">' + escape(q.q) + '</p><p class="oral-relance"><span>Relance</span>' + escape(q.relance) + '</p>' +
        '<details class="oral-attendus"><summary>Attendus</summary><p>' + escape(q.attendus) + '</p></details>';
      const start = card.querySelector('.oral-start'), time = card.querySelector('.oral-timer strong');
      start.addEventListener('click', () => {
        if (timer) { stop(); start.textContent = 'Reprendre'; return; }
        start.textContent = 'Pause';
        timer = setInterval(() => {
          left = Math.max(0, left - 1); time.textContent = clock();
          if (left === 0) { stop(); start.textContent = 'Terminé'; start.disabled = true; card.classList.add('is-over'); }
        }, 1000);
      });
    }
    function roll() {
      const face = 1 + Math.floor(Math.random() * 6), theme = THEMES[face - 1], q = pick(theme);
      if (reduced()) { die.innerHTML = dieSVG(face); show(theme, q); return; }
      die.classList.add('is-rolling');
      let ticks = 0;
      const flicker = setInterval(() => {
        die.innerHTML = dieSVG(1 + Math.floor(Math.random() * 6));
        if (++ticks >= 8) { clearInterval(flicker); die.innerHTML = dieSVG(face); die.classList.remove('is-rolling'); show(theme, q); }
      }, 75);
    }
    die.addEventListener('click', roll);
    slot.querySelector('.oral-go').addEventListener('click', roll);
  }
  // Une banque = un élément {widget: nom} dans td.js. D'autres fichiers peuvent en ajouter.
  root.SID34Oral = {mount, register(name, themes) { root.SID34TDWidgets = Object.assign(root.SID34TDWidgets || {}, {[name]: slot => mount(themes, slot)}); }};
  root.SID34Oral.register('oral-td1', TD1);

  const style = document.createElement('style');
  style.textContent = `
.oral { margin: 8px 0 4px; }
.oral-roll { display: flex; align-items: center; gap: 22px; flex-wrap: wrap; }
.oral-die { width: 104px; height: 104px; padding: 0; border: 0; background: none; cursor: pointer; border-radius: 22px; }
.oral-die svg { width: 100%; height: 100%; display: block; }
.oral-die:focus-visible { outline: 3px solid var(--blue, #8a4f8c); outline-offset: 4px; }
.oral-die:hover { transform: rotate(-4deg); }
.oral-die.is-rolling { animation: oral-shake .6s ease-in-out; }
@keyframes oral-shake { 0% { transform: rotate(0) } 20% { transform: rotate(-24deg) translateY(-8px) } 40% { transform: rotate(18deg) } 60% { transform: rotate(-12deg) translateY(-4px) } 80% { transform: rotate(8deg) } 100% { transform: rotate(0) } }
.oral-go { margin-bottom: 10px; }
.oral-themes { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 4px 18px; margin: 0; padding: 0; list-style: none; font-size: 14px; }
.oral-themes li { display: flex; align-items: center; gap: 8px; margin: 0; }
.oral-face { flex: none; display: inline-grid; place-items: center; width: 22px; height: 22px; border-radius: 6px; background: var(--blue, #8a4f8c); color: #fff; font-size: 12.5px; font-weight: 700; }
.oral-card { margin-top: 18px; padding: 16px 18px; border-radius: 20px; background: var(--mauve-tint, #f8f2f9); border: 2px solid #e2dbe6; border-bottom-width: 5px; animation: as-rise .35s ease-out; }
.oral-card.is-over { border-color: #efc9b8; background: #fbefe9; }
.oral-card-head { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.oral-theme { font-size: 13px; font-weight: 700; letter-spacing: .04em; text-transform: uppercase; color: var(--blue, #8a4f8c); }
.oral-timer { margin-left: auto; display: flex; align-items: center; gap: 10px; }
.oral-timer strong { font: 700 24px/1 var(--serif, Bitter, serif); font-variant-numeric: tabular-nums; color: var(--ink, #1d2433); }
.oral-q { margin: 12px 0 10px; font: 700 21px/1.4 var(--serif, Bitter, serif); color: var(--ink, #1d2433); }
.oral-relance { margin: 0 0 10px; font-size: 15.5px; }
.oral-relance span { display: inline-block; margin-right: 8px; padding: 1px 9px; border-radius: 999px; background: #fdf3dc; color: #8a6417; font-size: 12px; font-weight: 700; }
.oral-attendus summary { cursor: pointer; font-size: 13.5px; font-weight: 700; color: var(--orange, #2e6b4f); }
.oral-attendus p { margin: 6px 0 0; font-size: 14.5px; }
@media (max-width: 560px) { .oral-themes { grid-template-columns: 1fr; } .oral-q { font-size: 18px; } }
@media print { .oral-roll, .oral-card { display: none; } }`;
  document.head.appendChild(style);
})(typeof window !== 'undefined' ? window : globalThis);
