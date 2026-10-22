(function () {
  'use strict';
  /* S'entraîner « à la Brilliant », en mode lecture seulement (ni projection, ni PDF) :
     1. exercices vérifiés pas à pas, avec indices progressifs (Indice 1 → Indice 2 → Réponse) et
        messages ciblés sur les erreurs fréquentes ;
     2. trois questions en fin de partie : la question de sortie, une question nouvelle et une
        question de révision tirée d'une partie précédente ;
     3. notations : survoler ou toucher p̂, g(x), ξᵢ, αᵢ… affiche leur sens.
     La progression reste dans le navigateur (progress.js). */
  const Math_ = () => window.SID34Math;
  const render = root => { Math_()?.render(root); return root; };
  const mascot = kind => window.Animals ? window.Animals.mascot(kind) : '';
  const progress = () => window.SID34Progress;
  const esc = s => String(s).replace(/[&<>"]/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'}[c]));
  const parse = value => {
    const n = parseFloat(String(value).trim().replace(/\s/g, '').replace('−', '-').replace(',', '.'));
    return Number.isFinite(n) ? n : null;
  };
  const near = (x, target, tol) => Math.abs(x - target) <= tol;
  const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ------------------------------------------------------------ 1. exercices */
  // Chaque exercice est repéré par un extrait de son énoncé (le titre peut être masqué sur la diapo).
  const EXERCISES = [
    {id: 'calcul-logistique', match: 'w=(1{,}37', steps: [
      {kind: 'number', prompt: String.raw`Calculez le score \(z=1{,}37\times7-0{,}22\times2-8{,}75\).`, answer: 0.40, tol: 0.015,
        hints: [String.raw`Commencez par le poids : \(1{,}37\times7=9{,}59\).`, String.raw`Puis le pelage : \(-0{,}22\times2=-0{,}44\), et ajoutez \(b=-8{,}75\).`],
        slips: [{value: 0.84, tol: 0.015, msg: String.raw`Vous avez oublié le terme \(-0{,}22\times2=-0{,}44\).`},
          {value: 9.15, tol: 0.015, msg: String.raw`N’oubliez pas le biais \(b=-8{,}75\).`},
          {value: 17.9, tol: 0.05, msg: String.raw`Le biais est négatif : on ajoute \(-8{,}75\), on ne le soustrait pas.`}],
        ok: String.raw`\(z=9{,}59-0{,}44-8{,}75=0{,}40\) : le score est légèrement positif.`},
      {kind: 'number', prompt: String.raw`En déduire \(\hat p=\sigma(z)\). On donne \(\sigma(0{,}40)\approx0{,}60\).`, answer: 0.60, tol: 0.015,
        hints: [String.raw`\(\hat p=\sigma(z)\) avec \(z=0{,}40\).`, String.raw`L’énoncé donne directement \(\sigma(0{,}40)\approx0{,}60\).`],
        slips: [{value: 0.40, tol: 0.015, msg: String.raw`\(0{,}40\) est le score \(z\). La probabilité est \(\sigma(z)\) : un score positif donne \(\hat p>0{,}5\).`}],
        ok: String.raw`\(\hat p\approx0{,}60\) : le modèle penche légèrement vers « chien ».`},
      {kind: 'choice', prompt: String.raw`Classe prédite pour \(t=0{,}5\), puis pour \(t=0{,}7\) ?`, choices: [
        {t: 'chien, puis chien', why: String.raw`Avec \(t=0{,}7\), il faut \(\hat p\ge0{,}7\). Or \(\hat p\approx0{,}60\).`},
        {t: 'chien, puis chat', ok: true},
        {t: 'chat, puis chat', why: String.raw`Avec \(t=0{,}5\), \(\hat p\approx0{,}60\ge0{,}5\) : on prédit chien.`}],
        ok: String.raw`Le modèle n’a pas changé : seule la règle de décision \(\hat p\ge t\) a changé.`},
      {kind: 'number', prompt: String.raw`C’est en fait un chat (\(y=0\)). Calculez sa perte \(\ell\).`, answer: 0.92, tol: 0.02,
        hints: [String.raw`Pour \(y=0\), \(\ell=-\log(1-\hat p)\).`, String.raw`\(1-\hat p=0{,}40\) et \(-\log0{,}40\approx0{,}92\).`],
        slips: [{value: 0.51, tol: 0.02, msg: String.raw`\(-\log0{,}60\approx0{,}51\) serait la perte d’un chien. Pour un chat, prenez \(-\log(1-\hat p)\).`}],
        ok: String.raw`\(\ell=-\log0{,}40\approx0{,}92\) : le modèle est puni pour avoir penché vers « chien ».`}
    ]},
    {id: 'netflix', match: 'supervisé ou non supervisé', steps: [
      {kind: 'choice', prompt: 'Prédire les notes manquantes de Netflix, c’est…', choices: [
        {t: 'un problème non supervisé : on complète une matrice de notes', ok: true},
        {t: 'un problème supervisé : chaque note connue est une sortie observée', why: 'Aucune variable de sortie n’est séparée des entrées : toutes les cases sont des notes de même nature. On complète la matrice à partir de sa structure.'},
        {t: 'ni l’un ni l’autre : il n’y a pas de données', why: 'Les données sont les notes connues de la matrice clients × films.'}],
        ok: 'Pas de sortie distincte des entrées : on complète la matrice clients × films (complétion de matrice).'},
      {kind: 'choice', prompt: 'Comment prédire une case vide ?', choices: [
        {t: 'à partir des notes connues de clients et de films semblables', ok: true},
        {t: 'par la moyenne de toutes les notes', why: 'C’est une première référence, mais elle ignore les différences entre clients et entre films.'},
        {t: 'c’est impossible : 99 % des cases sont vides', why: 'Le 1 % de notes connues, réparti sur des centaines de milliers de clients et de films, suffit à exploiter la structure de la matrice.'}],
        ok: 'Des clients aux goûts proches notent de façon proche : la structure de la matrice permet de compléter les cases vides.'}
    ]},
    {id: 'vecteur-normal', match: 'w=(2,-1)', steps: [
      {kind: 'number', prompt: String.raw`Avec \(g(x)=2x_1-x_2\), calculez le score de \((1,1)\).`, answer: 1, tol: 0.001,
        hints: [String.raw`\(w=(2,-1)\) et \(b=0\) : \(g(x)=2x_1-x_2\).`, String.raw`\(g(1,1)=2\times1-1\).`],
        slips: [{value: 3, tol: 0.001, msg: String.raw`La seconde composante de \(w\) vaut \(-1\) : on soustrait \(x_2\).`}, {value: -1, tol: 0.001, msg: String.raw`Attention au signe : \(2\times1-1=+1\).`}],
        ok: String.raw`\(g(1,1)=1>0\).`},
      {kind: 'number', prompt: String.raw`Et le score de \((1,3)\) ?`, answer: -1, tol: 0.001,
        hints: [String.raw`\(g(1,3)=2\times1-3\).`, 'Le résultat est négatif.'],
        slips: [{value: 5, tol: 0.001, msg: String.raw`La seconde composante de \(w\) vaut \(-1\) : on soustrait \(x_2=3\).`}, {value: 1, tol: 0.001, msg: String.raw`\(2-3=-1\) : le signe compte.`}],
        ok: String.raw`\(g(1,3)=-1<0\).`},
      {kind: 'choice', prompt: 'Que dire de ces deux points ?', choices: [
        {t: 'Ils sont de part et d’autre de la droite', ok: true},
        {t: 'Ils sont du même côté', why: 'Leurs scores ont des signes opposés : ils sont de part et d’autre de la droite.'},
        {t: 'Ils sont sur la droite', why: String.raw`Un point de la droite a un score nul ; ici \(g=\pm1\).`}],
        ok: String.raw`Le signe du score indique le côté ; \(w\) pointe vers \(g>0\).`}
    ]},
    {id: 'relachement', match: 'le score vaut \\(0{,}4\\)', steps: [
      {kind: 'choice', prompt: String.raw`Label \(+1\), score \(0{,}4\). Le point est-il bien classé ?`, choices: [
        {t: 'Oui', ok: true},
        {t: 'Non', why: String.raw`Le score est positif et le label vaut \(+1\) : la classe prédite est la bonne.`}],
        ok: String.raw`\(y\,g(x)=0{,}4>0\) : bien classé.`},
      {kind: 'choice', prompt: 'Respecte-t-il la marge dure ?', choices: [
        {t: 'Oui', why: String.raw`La marge dure exige \(y\,g(x)\ge1\) ; ici \(0{,}4<1\).`},
        {t: 'Non', ok: true}],
        ok: String.raw`\(0{,}4<1\) : le point est dans la marge.`},
      {kind: 'number', prompt: String.raw`Quel est le plus petit relâchement \(\xi\) compatible ?`, answer: 0.6, tol: 0.005,
        hints: [String.raw`La contrainte relâchée s’écrit \(y\,g(x)\ge1-\xi\).`, String.raw`\(\xi\ge1-0{,}4\).`],
        slips: [{value: 0.4, tol: 0.005, msg: String.raw`\(0{,}4\) est la marge signée. Il manque \(1-0{,}4\).`}, {value: 1.4, tol: 0.005, msg: String.raw`C’est \(1-0{,}4\), pas \(1+0{,}4\).`}],
        ok: String.raw`\(\xi=0{,}6\) : entre 0 et 1, le point est dans la marge mais bien classé.`}
    ]}
  ];

  function feedbackHTML(good, title, html, extra = '') {
    return '<span class="as-fb-mascot">' + mascot(good ? 'cat' : 'ghost') + '</span><div><strong>' + title + '</strong><p>' + html + '</p>' + extra + '</div>';
  }
  function showFeedback(box, good, title, html, extra) {
    box.className = 'as-predict-feedback ' + (good ? 'is-good' : 'is-bad'); box.innerHTML = feedbackHTML(good, title, html, extra); box.hidden = false; render(box);
  }
  function optionsHTML(choices) {
    return '<div class="as-options" role="group" aria-label="Réponses possibles">' + choices.map((c, k) => '<button type="button" class="as-option" data-k="' + k + '" aria-pressed="false"><span class="as-option-letter" aria-hidden="true">' + 'ABCD'[k] + '</span><span class="as-option-text">' + c.t + '</span></button>').join('') + '</div>';
  }
  function wireOptions(card, onPick) {
    const opts = [...card.querySelectorAll('.as-option')];
    opts.forEach(o => o.addEventListener('click', () => { opts.forEach(x => { x.setAttribute('aria-pressed', String(x === o)); x.classList.remove('is-wrong', 'is-right'); }); onPick(+o.dataset.k); }));
    return opts;
  }

  function stepHTML(step, i, n) {
    const input = step.kind === 'number'
      ? '<label class="px-answer"><span class="px-sr">Votre réponse</span><input class="px-input" inputmode="decimal" autocomplete="off" placeholder="?"></label>'
      : optionsHTML(step.choices);
    const hints = step.kind === 'number' ? '<div class="px-hints">' + step.hints.map((h, k) => '<button type="button" class="px-hint-button" data-hint="' + k + '"' + (k ? ' disabled' : '') + '>Indice ' + (k + 1) + '</button>').join('') + '<button type="button" class="px-hint-button" data-hint="answer" disabled>Réponse</button></div><div class="px-hint-text" hidden></div>' : '';
    return '<li class="px-step' + (i ? ' is-locked' : '') + '" data-step="' + i + '"><div class="px-step-head"><span class="px-step-n">' + (i + 1) + '</span><p>' + step.prompt + '</p></div>' +
      '<div class="px-step-body">' + input + '<div class="as-predict-row"><button type="button" class="as-button as-primary px-check">Vérifier</button><span class="as-predict-error" aria-live="polite"></span></div>' + hints +
      '<div class="as-predict-feedback" aria-live="polite" hidden></div></div></li>';
  }

  function exercise(section, block) {
    const spec = EXERCISES.find(e => (block.question || '').includes(e.match));
    if (!spec) return;
    const box = document.createElement('div');
    box.className = 'px-exercise';
    box.innerHTML = '<div class="px-exercise-head"><span>Pas à pas</span><span class="px-dots">' + spec.steps.map(() => '<i></i>').join('') + '</span></div><ol class="px-steps">' + spec.steps.map(stepHTML).join('') + '</ol>' +
      '<div class="px-done" hidden>' + mascot('cat') + '<p><strong>Exercice réussi !</strong> La solution commentée reste disponible ci-dessous.</p></div>';
    section.querySelector('details')?.before(box);
    const summary = section.querySelector('details > summary'); if (summary) summary.lastChild.textContent = 'Solution commentée';
    const dots = [...box.querySelectorAll('.px-dots i')];
    const steps = [...box.querySelectorAll('.px-step')];
    let current = 0;
    const finish = (i, viaAnswer) => {
      steps[i].classList.add('is-solved'); dots[i].classList.add(viaAnswer ? 'is-shown' : 'is-done');
      steps[i].querySelectorAll('input, .as-option, .px-check').forEach(el => el.disabled = true);
      if (i + 1 < steps.length) { current = i + 1; steps[current].classList.remove('is-locked'); steps[current].querySelector('input, .as-option')?.focus({preventScroll: true}); }
      else { box.querySelector('.px-done').hidden = false; box.querySelector('.px-done').classList.add('revealed'); progress()?.solve('exercice-' + spec.id); }
    };
    spec.steps.forEach((step, i) => {
      const card = steps[i], fb = card.querySelector('.as-predict-feedback'), err = card.querySelector('.as-predict-error');
      let pick = null;
      const opts = step.kind === 'choice' ? wireOptions(card, k => { pick = k; err.textContent = ''; fb.hidden = true; }) : [];
      const check = () => {
        if (card.classList.contains('is-solved')) return;
        if (step.kind === 'number') {
          const v = parse(card.querySelector('.px-input').value);
          if (v === null) { err.textContent = 'Écrivez un nombre (virgule ou point).'; return; }
          err.textContent = '';
          if (near(v, step.answer, step.tol)) { showFeedback(fb, true, 'Bravo !', step.ok); card.querySelector('.px-input').classList.add('is-right'); finish(i); return; }
          const slip = step.slips?.find(s => near(v, s.value, s.tol));
          card.querySelector('.px-input').classList.add('is-wrong'); setTimeout(() => card.querySelector('.px-input').classList.remove('is-wrong'), 400);
          showFeedback(fb, false, slip ? 'Presque…' : 'Pas encore', slip ? slip.msg : 'Essayez un indice si besoin.');
        } else {
          if (pick === null) { err.textContent = 'Choisissez une réponse d’abord.'; return; }
          const c = step.choices[pick];
          if (c.ok) { opts[pick].classList.add('is-right'); showFeedback(fb, true, 'Exactement !', step.ok); finish(i); }
          else { opts[pick].classList.add('is-wrong'); showFeedback(fb, false, 'Pas tout à fait…', c.why); }
        }
      };
      card.querySelector('.px-check').addEventListener('click', check);
      card.querySelector('.px-input')?.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); check(); } });
      // Indices progressifs : chacun débloque le suivant ; « Réponse » termine l'étape.
      const hintText = card.querySelector('.px-hint-text');
      card.querySelectorAll('.px-hint-button').forEach(b => b.addEventListener('click', () => {
        const which = b.dataset.hint, buttons = [...card.querySelectorAll('.px-hint-button')];
        b.classList.add('is-used');
        if (which === 'answer') {
          card.querySelector('.px-input').value = String(step.answer).replace('.', ',');
          showFeedback(fb, true, 'La réponse', step.ok); finish(i, true); buttons.forEach(x => x.disabled = true); return;
        }
        const k = +which; hintText.innerHTML = step.hints[k]; hintText.hidden = false; render(hintText);
        if (buttons[k + 1]) buttons[k + 1].disabled = false;
      }));
    });
    render(box);
  }

  /* ------------------------------------------------- 2. questions de fin de partie */
  // [question de sortie (classroom.js) avec choix, question nouvelle] ; la 3ᵉ question est une révision.
  const q = (prompt, choices, why) => ({prompt, choices, why});
  const ok = t => ({t, ok: true});
  const no = (t, why) => ({t, why});
  const CHECKS = {
    'introduction-generale': [
      q('Quel est le rôle de l’étiquette dans un apprentissage supervisé ?', [ok('C’est la sortie observée que le modèle apprend à prédire à partir des entrées'), no('Elle identifie l’animal sur le dessin', String.raw`Le dessin est un repère visuel ; le modèle n’utilise que les mesures \(x\) et l’étiquette \(y\).`), no('Elle ne sert qu’au moment du test', String.raw`Elle sert dès l’apprentissage : les paires \((x_i,y_i)\) guident l’ajustement.`)], String.raw`Apprentissage supervisé : on observe des paires \((x_i,y_i)\) et on apprend à prédire \(y\) à partir de \(x\).`),
      q('Regrouper des clients sans catégorie connue à l’avance, c’est un apprentissage…', [no('supervisé', 'Aucune sortie n’est observée : il n’y a pas d’étiquette à prédire.'), ok('non supervisé'), no('de régression', 'La régression prédit une sortie numérique observée ; ici, aucune sortie n’est observée.')], 'Sans étiquette de sortie, on cherche une structure dans les données : c’est du clustering, un apprentissage non supervisé.')],
    'regression-discrimination': [
      q('Prédire le poids ou prédire l’espèce : quelle différence ?', [ok('Poids : régression (sortie numérique) ; espèce : discrimination (sortie catégorielle)'), no('Poids : discrimination ; espèce : régression', 'C’est l’inverse : une sortie numérique relève de la régression, une catégorie de la discrimination.'), no('Aucune : les mesures sont les mêmes', 'Les entrées peuvent être les mêmes ; c’est la nature de la sortie qui change.')], 'La nature de la sortie décide : nombre → régression, catégorie → discrimination.'),
      q(String.raw`Dans le fil rouge, que désigne \(\hat y\) ?`, [ok('La classe prédite par le modèle, qui peut différer de la vraie'), no('La vraie espèce de l’animal', String.raw`La vraie espèce est \(y\). Le chapeau marque une prévision.`), no('Le poids moyen des animaux', String.raw`\(\hat y\) est une prévision de la sortie, ici l’espèce.`)], String.raw`\(y\) est observé, \(\hat y\) est prédit ; leur écart mesure l’erreur.`)],
    'fonction-perte': [
      q('Si l’erreur est doublée, comment changent la perte absolue et la perte quadratique ?', [ok('Absolue ×2, quadratique ×4'), no('Les deux ×2', String.raw`\((2r)^2=4r^2\) : la perte quadratique est multipliée par 4.`), no('Absolue ×4, quadratique ×2', String.raw`\(|2r|=2|r|\) et \((2r)^2=4r^2\) : c’est l’inverse.`)], String.raw`\(|2r|=2|r|\) et \(\tfrac12(2r)^2=4\cdot\tfrac12r^2\).`),
      q('Quelle perte est la plus sensible à une grosse erreur isolée ?', [ok('La perte quadratique'), no('La perte absolue', 'Elle croît linéairement : une grosse erreur pèse moins qu’avec le carré.'), no('Elles réagissent de la même façon', 'Le carré amplifie les grandes erreurs ; la valeur absolue non.')], 'Le carré fait dominer les grosses erreurs : la perte quadratique est sensible aux valeurs extrêmes.')],
    risque: [
      q('Pourquoi le meilleur prédicteur théorique ne peut-il pas être calculé directement ?', [ok('Il dépend de la loi des données, inconnue : on n’a qu’un échantillon'), no('Il n’existe pas', String.raw`Pour la perte quadratique, il existe : c’est \(\mathbb E[Y\mid X=x]\). On ne connaît simplement pas la loi.`), no('Il demande trop de calculs', 'Le frein n’est pas le calcul mais la loi inconnue des données.')], 'Le risque est une espérance sous une loi inconnue : on l’estime avec les données.'),
      q('Pour la perte quadratique, le prédicteur optimal en x est…', [ok(String.raw`la moyenne conditionnelle \(\mathbb E[Y\mid X=x]\)`), no('la médiane conditionnelle', 'La médiane est optimale pour la perte absolue.'), no('la valeur la plus fréquente de Y', 'C’est l’optimum de la perte 0-1 en classification.')], 'Chaque perte a son optimum : moyenne pour le carré, médiane pour la valeur absolue.')],
    'biais-variance': [
      q('Que change un nouveau tirage des données d’apprentissage ?', [ok('Le modèle appris change ; la variance mesure cette dispersion'), no('Rien, si le modèle est bon', 'Tout modèle appris dépend des points tirés ; seule l’ampleur du changement varie.'), no(String.raw`La vraie relation \(m^*\)`, String.raw`\(m^*\) est fixe ; ce sont les points et leur bruit qui changent.`)], 'La variance mesure combien le modèle appris bouge d’un échantillon à l’autre.'),
      q('Un modèle très souple (degré élevé) a en général…', [ok('un biais faible et une variance élevée'), no('un biais élevé et une variance faible', 'C’est le profil d’un modèle trop simple, comme la droite.'), no('un biais et une variance nuls', String.raw`La variance augmente avec la souplesse, et le bruit \(\sigma^2\) reste.`)], 'Plus de souplesse : moins de biais, plus de variance. Le compromis se cherche sur des données non vues.')],
    'estimation-risque': [
      q('Peut-on choisir le degré sur le test, puis annoncer son erreur sur ce même test ?', [ok('Non : l’erreur annoncée serait trop optimiste'), no('Oui, c’est le rôle du test', 'Le test sert une seule fois, à la fin, après la sélection.'), no('Oui, si le test est grand', 'La taille ne corrige pas le biais de sélection : on a choisi le degré qui réussit sur ce test.')], 'On choisit sur la validation (ou par validation croisée), puis on évalue une seule fois sur le test.'),
      q('En validation croisée à K blocs, combien d’apprentissages faut-il pour un degré donné ?', [ok('K'), no('1', 'Chaque bloc sert une fois de validation : on réapprend sans lui, soit K apprentissages.'), no('K − 1', 'Il y a K plis, donc K apprentissages, chacun sur K − 1 blocs.')], 'K plis : K modèles, K erreurs, puis leur moyenne.')],
    categorisation: [
      q('Pourquoi commencer par un modèle simple ?', [ok('Il est interprétable et sert de référence avant les modèles non linéaires'), no('Il est toujours le plus précis', 'Aucun modèle n’est le meilleur partout (No Free Lunch).'), no('Il ne fait aucune hypothèse', 'Un modèle linéaire suppose une relation ou une frontière linéaire.')], 'Un modèle simple donne un point de comparaison clair pour juger les modèles plus complexes.'),
      q('La régression logistique est…', [ok('supervisée, paramétrique et linéaire'), no('non supervisée', 'Elle apprend à partir d’étiquettes observées.'), no('non paramétrique', String.raw`Son nombre de paramètres est fixé : \(w\) et \(b\).`)], 'Elle combine les trois axes : étiquettes, paramètres en nombre fixé, frontière affine.')],
    geometrie: [
      q('Que devient la frontière si on multiplie le score par un nombre positif ?', [ok('Elle ne change pas'), no('Elle se déplace', String.raw`\(k\,g(x)=0\iff g(x)=0\) pour \(k>0\).`), no('Elle tourne', String.raw`La direction de \(w\) est conservée : la droite ne tourne pas.`)], 'Seule l’échelle du score change ; la droite g(x) = 0 reste la même.'),
      q(String.raw`Pour \(g(x)=w^{\top}x+b\), le vecteur \(w\) est…`, [ok(String.raw`perpendiculaire à la frontière, orienté vers \(g>0\)`), no('parallèle à la frontière', String.raw`Le long de la frontière, \(g\) ne varie pas : \(w\) lui est orthogonal.`), no('le point de la frontière le plus proche de l’origine', String.raw`\(w\) est une direction, pas un point.`)], String.raw`\(w\) est le vecteur normal : il indique la direction où le score augmente.`)],
    supervises: [
      q('Que signifie « linéaire » dans une régression polynomiale ?', [ok('Linéaire en les paramètres'), no('La courbe est une droite', 'La courbe en x peut être courbe ; la linéarité porte sur les paramètres.'), no('Linéaire en x', String.raw`Les variables \(x^2,x^3,\dots\) ne sont pas linéaires en \(x\) ; le modèle l’est en \(\beta\).`)], String.raw`\(\hat y=\sum_j\beta_jx^j\) est une combinaison linéaire des paramètres \(\beta_j\).`),
      q('En moindres carrés, que minimise-t-on ?', [ok('La somme des carrés des résidus'), no('La somme des résidus', 'Les résidus positifs et négatifs se compenseraient.'), no('La somme des distances perpendiculaires à la droite', 'Les moindres carrés utilisent les résidus verticaux.')], String.raw`On minimise \(\sum_i(y_i-\hat y_i)^2\).`)],
    logistique: [
      q('Si on change le seuil, faut-il réapprendre le modèle ?', [ok(String.raw`Non : \(w\) et \(b\) restent, seule la décision change`), no('Oui, entièrement', String.raw`Le seuil n’intervient pas dans l’apprentissage de \(w\) et \(b\).`), no(String.raw`Oui, seulement \(b\)`, String.raw`\(b\) est appris une fois pour toutes ; le seuil s’applique ensuite à \(\hat p\).`)], String.raw`La règle \(\hat p\ge t\) se change sans réapprendre.`),
      q(String.raw`Un chat (\(y=0\)) reçoit \(\hat p=0{,}9\). Sa perte est…`, [ok(String.raw`grande : \(-\log0{,}1\approx2{,}3\)`), no(String.raw`petite : \(-\log0{,}9\approx0{,}11\)`, String.raw`Pour \(y=0\), on prend \(-\log(1-\hat p)\).`), no('nulle', 'Le modèle se trompe nettement : la perte est grande.')], 'L’entropie croisée punit fortement une probabilité confiante et fausse.')],
    'svm-geometrie': [
      q('Pourquoi diviser le score par la norme du vecteur normal ?', [ok(String.raw`Pour obtenir une distance, qui ne change pas si l’on multiplie \(w\) et \(b\)`), no('Pour rendre le score positif', 'La division par un nombre positif garde le signe.'), no('Pour obtenir une probabilité', 'Le résultat est une distance signée, non bornée.')], String.raw`\(g(x)/\|w\|\) est la distance signée à la frontière.`),
      q(String.raw`Distance de \(A=(3,4)\) à la droite \(2x_1+x_2=0\) ?`, [ok(String.raw`\(10/\sqrt5=2\sqrt5\)`), no(String.raw`\(10\)`, String.raw`\(10\) est le score ; il faut diviser par \(\|w\|=\sqrt5\).`), no(String.raw`\(\sqrt5\)`, String.raw`\(\sqrt5\) est \(\|w\|\) ; la distance vaut \(10/\sqrt5\).`)], String.raw`\(g(A)=10\) et \(\|w\|=\sqrt5\), donc \(d=2\sqrt5\).`)],
    'marge-dure': [
      q('Pourquoi fixer la plus petite marge fonctionnelle à 1 ?', [ok(String.raw`Pour lever l’invariance d’échelle de \((w,b)\)`), no('Parce que les données l’imposent', 'C’est un choix d’échelle, pas une propriété des données.'), no('Pour obtenir des probabilités', 'Les scores restent des réels non bornés.')], String.raw`Avec cette normalisation, maximiser la marge revient à minimiser \(\|w\|\).`),
      q('La largeur totale de la marge vaut…', [ok(String.raw`\(2/\|w\|\)`), no(String.raw`\(1/\|w\|\)`, String.raw`C’est la distance de chaque bord à la frontière ; la bande fait \(2/\|w\|\).`), no(String.raw`\(\|w\|\)`, 'La largeur diminue quand la norme augmente.')], String.raw`Les bords \(g=\pm1\) sont à \(1/\|w\|\) de part et d’autre de la frontière.`)],
    'marge-souple': [
      q('Une violation de marge est-elle forcément une erreur de classification ?', [ok(String.raw`Non : si \(0<\xi_i\le1\), le point est dans la marge mais bien classé`), no('Oui, toujours', String.raw`Seul \(\xi_i>1\) signifie que le point est du mauvais côté.`), no('Non, jamais', String.raw`Si \(\xi_i>1\), le point est mal classé.`)], String.raw`\(\xi_i\) mesure la violation : dans la marge si \(0<\xi_i\le1\), mal classé si \(\xi_i>1\).`),
      q(String.raw`Quand \(C\) augmente, en général…`, [ok('les violations coûtent plus cher et la marge se rétrécit'), no('la marge s’élargit', String.raw`Un grand \(C\) pénalise davantage les violations : la marge tend à se resserrer.`), no(String.raw`\(C\) n’a aucun effet`, String.raw`\(C\) règle le compromis entre marge et violations.`)], String.raw`\(C\) pondère la somme des \(\xi_i\) face à \(\tfrac12\|w\|^2\).`)],
    dualite: [
      q('En marge dure, que signifie un multiplicateur strictement positif ?', [ok('Le point est un vecteur de support, sur le bord de la marge'), no('Le point est mal classé', 'En marge dure, aucun point n’est mal classé.'), no('Le point est loin de la frontière', String.raw`Loin de la frontière, \(\alpha_i=0\).`)], String.raw`\(\alpha_i>0\) seulement pour les points qui définissent la marge.`),
      q(String.raw`\(w=\sum_i\alpha_iy_ix_i\). On déplace un animal où \(\alpha_i=0\) sans qu’il entre dans la marge :`, [ok(String.raw`\(w\) et \(b\) ne changent pas`), no(String.raw`\(w\) change`, String.raw`Son terme dans la somme est nul : il ne contribue pas à \(w\).`), no(String.raw`seul \(b\) change`, 'Le biais est aussi fixé par les vecteurs de support.')], 'Seuls les vecteurs de support comptent.')],
    'hard-soft': [
      q('Un score SVM est-il une probabilité ?', [ok(String.raw`Non : \(g(x)\) est un réel non borné`), no('Oui, entre 0 et 1', String.raw`\(g(x)\) peut valoir \(-3\) ou \(5\).`), no(String.raw`Oui, après la sigmoïde`, String.raw`Le SVM n’est pas appris pour estimer \(P(Y=1\mid x)\) : \(\sigma(g(x))\) n’est pas une probabilité fiable.`)], 'La logistique donne une probabilité ; le SVM, un score et une marge.'),
      q(String.raw`Comment choisir \(C\) ?`, [ok('Sur la validation'), no('En minimisant l’objectif d’apprentissage', String.raw`Cet objectif dépend de \(C\) lui-même et des données d’apprentissage : il ne mesure pas l’erreur sur de nouveaux animaux.`), no('Sur le test', 'Le test reste fermé jusqu’à l’évaluation finale.')], String.raw`\(C\) est un hyperparamètre : la validation le choisit, l’apprentissage fournit ensuite \(w,b\).`)],
    multiclasses: [
      q('Avec quatre classes, combien de modèles pour OvR et pour OvO ?', [ok('4 et 6'), no('4 et 4', String.raw`OvO apprend un modèle par paire : \(K(K-1)/2=6\).`), no('6 et 4', 'OvR apprend un modèle par classe : 4.')], String.raw`OvR : \(K\) modèles ; OvO : \(K(K-1)/2\).`),
      q('En OvR, comment décide-t-on la classe ?', [ok(String.raw`La classe au plus grand score \(g_k(x)\)`), no('Par le vote des duels', 'Le vote des duels, c’est OvO.'), no('La première classe au score positif', 'Plusieurs scores peuvent être positifs, ou aucun : on prend le plus grand.')], String.raw`\(\hat y=\arg\max_k g_k(x)\).`)]
  };

  // Chapitre 2 en cinq parties (chapter2-plan.js).
  CHECKS.modeles = CHECKS.supervises;
  CHECKS.acp = [
    q('Que maximise le premier axe de l’ACP ?', [ok('La variance des projections'), no('Le nombre d’erreurs de classification', 'L’ACP n’utilise aucune étiquette : il n’y a pas d’erreur à compter.'), no('La distance au point le plus proche', 'Ça, c’est la marge du SVM.')]),
    q(String.raw`Valeurs propres \(\lambda_1=3\), \(\lambda_2=1\) : quelle part de variance garde l’axe 1 ?`, [ok('75 %'), no('3 %', String.raw`On divise par la somme : \(3/(3+1)\).`), no('100 %', String.raw`L’axe 2 garde encore \(1/4\) de la variance.`)])
  ];
  CHECKS['svm-marge'] = [CHECKS['svm-geometrie'][1], CHECKS['marge-dure'][1]];

  function check(host, chapter, lesson) {
    const own = CHECKS[lesson.id];
    if (!host || !own) return;
    // Révision espacée : la question nouvelle d'une partie située deux parties plus tôt.
    const all = [window.SID34_CHAPTER_1, window.SID34_CHAPTER_2].filter(Boolean).flatMap(c => c.lessons);
    const at = all.findIndex(l => l.id === lesson.id), backLesson = at >= 2 ? all[at - 2] : null, back = backLesson?.id;
    // Ordre des choix mélangé de façon stable (la bonne réponse n'est pas toujours A).
    const shuffle = x => { const n = x.choices.length, r = [...x.prompt].reduce((h, c) => (h * 31 + c.charCodeAt(0)) % 9973, 7) % n; return {...x, choices: x.choices.map((_, k) => x.choices[(k + r) % n])}; };
    const items = own.concat(back && CHECKS[back] ? [{...CHECKS[back][1], review: backLesson?.title}] : []).map(shuffle);
    const key = chapter.id + '/' + lesson.id;
    const card = document.createElement('section');
    card.className = 'px-check-card';
    card.setAttribute('aria-label', 'Vérifier ses acquis');
    host.replaceWith(card);
    let index = 0, firstTry = 0, tried = false;
    const draw = () => {
      if (index >= items.length) {
        const all = firstTry === items.length;
        if (all) progress()?.solve('verif-' + key);
        card.innerHTML = '<div class="px-check-end' + (all ? ' revealed' : '') + '">' + mascot(all ? 'cat' : 'dog') + '<div><strong>' + firstTry + ' / ' + items.length + ' du premier coup</strong><p>' + (all ? 'Parfait : cette partie est acquise.' : 'Relisez les explications, puis réessayez quand vous voulez.') + '</p><button type="button" class="as-button px-again">Recommencer</button></div></div>';
        card.querySelector('.px-again').addEventListener('click', () => { index = 0; firstTry = 0; draw(); });
        return;
      }
      const it = items[index]; tried = false;
      card.innerHTML = '<header class="px-check-head">' + mascot('cat') + '<div><span class="px-check-kicker">Vérifier ses acquis · ' + (index + 1) + ' / ' + items.length + '</span>' +
        '<span class="px-dots">' + items.map((_, k) => '<i class="' + (k < index ? 'is-done' : k === index ? 'is-current' : '') + '"></i>').join('') + '</span></div></header>' +
        (it.review ? '<p class="px-review">Révision · ' + esc(it.review) + '</p>' : '') +
        '<p class="px-check-q">' + it.prompt + '</p>' + optionsHTML(it.choices) +
        '<div class="as-predict-row"><button type="button" class="as-button as-primary px-check">Vérifier</button><span class="as-predict-error" aria-live="polite"></span></div><div class="as-predict-feedback" aria-live="polite" hidden></div>';
      let pick = null;
      const fb = card.querySelector('.as-predict-feedback'), err = card.querySelector('.as-predict-error');
      const opts = wireOptions(card, k => { pick = k; err.textContent = ''; });
      card.querySelector('.px-check').addEventListener('click', () => {
        if (pick === null) { err.textContent = 'Choisissez une réponse d’abord.'; return; }
        const c = it.choices[pick];
        if (c.ok) {
          if (!tried) firstTry++;
          opts[pick].classList.add('is-right'); opts.forEach(o => o.disabled = true);
          showFeedback(fb, true, 'Exactement !', it.why, '<button type="button" class="as-button as-primary px-next">' + (index + 1 < items.length ? 'Question suivante →' : 'Voir le bilan') + '</button>');
          card.querySelector('.px-check').hidden = true;
          fb.querySelector('.px-next').addEventListener('click', () => { index++; draw(); card.scrollIntoView({block: 'nearest', behavior: reduced() ? 'auto' : 'smooth'}); });
        } else { tried = true; opts[pick].classList.add('is-wrong'); showFeedback(fb, false, 'Pas tout à fait…', c.why); }
      });
      render(card);
    };
    draw();
  }

  /* ----------------------------------------------------------- 3. notations */
  // Clés : source TeX sans espaces. Textes courts, sans formule, lus aussi par les lecteurs d'écran.
  const NOTES = {
    '\\hatp': 'p̂ : probabilité estimée d’être un chien, σ(g(x)). Ce n’est pas la classe.',
    '\\hatp(x)': 'p̂(x) : probabilité estimée d’être un chien, σ(g(x)). Ce n’est pas la classe.',
    '\\hat{p}': 'p̂ : probabilité estimée d’être un chien, σ(g(x)). Ce n’est pas la classe.',
    '\\hatp_i': 'p̂ᵢ : probabilité estimée pour l’animal i.',
    'g(x)': 'g(x) = wᵀx + b : score réel. Son signe donne le côté de la frontière.',
    'g(x_i)': 'g(xᵢ) : score de l’animal i. Son signe donne le côté de la frontière.',
    'z': 'z = g(x) : score d’un animal donné, avant la sigmoïde.',
    '\\haty': 'ŷ : classe prédite. Elle peut différer de la vraie étiquette y.',
    '\\haty_i': 'ŷᵢ : classe prédite pour l’animal i.',
    'y_i': 'yᵢ : vraie étiquette de l’animal i (0/1 en logistique, −1/+1 en SVM).',
    '\\xi_i': 'ξᵢ : relâchement de l’animal i. 0 hors de la marge, entre 0 et 1 dans la marge, plus de 1 s’il est mal classé.',
    '\\alpha_i': 'αᵢ : multiplicateur de l’animal i. Strictement positif seulement pour les vecteurs de support ; au plus C en marge souple.',
    '\\sigma': 'σ : sigmoïde, transforme un score réel en nombre entre 0 et 1.',
    '\\sigma(z)': 'σ(z) = 1 / (1 + e⁻ᶻ) : sigmoïde, entre 0 et 1.',
    'C': 'C : hyperparamètre de régularisation, choisi sur la validation.',
    't': 't : seuil de décision ; on prédit chien si p̂ ≥ t.',
    '\\ell': 'ℓ : perte d’un animal (entropie croisée en logistique, charnière en SVM).',
    'w': 'w : vecteur normal appris, perpendiculaire à la frontière.',
    '\\|w\\|': '‖w‖ : norme de w. La largeur de la marge vaut 2 / ‖w‖.',
    'm^*': 'm* : vraie relation moyenne, inconnue en pratique (connue ici car les données sont simulées).',
    '\\widehat{\\mathcal{R}}_{\\mathrm{CV}}': 'R̂_CV : erreur de validation croisée, moyenne des K erreurs de blocs.',
    '\\widehat{\\mathcalR}_{\\mathrm{CV}}': 'R̂_CV : erreur de validation croisée, moyenne des K erreurs de blocs.'
  };
  // Pas dans les graphiques ni les lectures des récits (réécrites à chaque geste) ; oui dans leur texte.
  const SKIP = '.glossary, .math-display, .px-check-card, .px-exercise, figure, svg, .presentation, .as-side, .as-readout, .as-controls, .as-overlay';
  function notations(root) {
    if (!root) return;
    // Une seule marque par symbole et par diapositive : l'aide reste discrète.
    const seen = new Map();
    root.querySelectorAll('.math-inline').forEach(span => {
      if (span.dataset.note || span.closest(SKIP)) return;
      const source = span.querySelector('annotation')?.textContent;
      const note = source && NOTES[source.replace(/\s+/g, '')];
      if (!note) return;
      const panel = span.closest('[data-slide-id], section') || root;
      if (!seen.has(panel)) seen.set(panel, new Set());
      if (seen.get(panel).has(note)) return;
      seen.get(panel).add(note);
      span.dataset.note = note; span.classList.add('has-note'); span.tabIndex = 0;
      span.setAttribute('role', 'button'); span.setAttribute('aria-label', note);
    });
  }
  // Toucher (mobile) : un appui affiche la note, un second la masque.
  document.addEventListener('click', event => {
    const span = event.target.closest?.('.has-note');
    document.querySelectorAll('.has-note.show-note').forEach(s => { if (s !== span) s.classList.remove('show-note'); });
    if (span) span.classList.toggle('show-note');
  });
  document.addEventListener('keydown', event => { if (event.key === 'Escape') document.querySelectorAll('.has-note.show-note').forEach(s => s.classList.remove('show-note')); });

  window.SID34Practice = {exercise, check, notations, EXERCISES, CHECKS, NOTES};
})();
