(function () {
  'use strict';
  /* Nouveautés 2026–2027, isolées des supports de l'an dernier :
     - leçon « Régression logistique » (chapitre 2), fil rouge chats et chiens ;
     - diapositives « Nouveau » dans trois leçons existantes ;
     - notations du fil rouge ; calendrier ajusté pour garder 2 × 90 minutes.
     slide-layout.js lit window.SID34_NEW pour placer ces diapositives sans renuméroter
     les diapositives d'origine. */
  const ch1 = window.SID34_CHAPTER_1, ch2 = window.SID34_CHAPTER_2;
  // Chapitre annoncé « à venir » (copie étudiants) : aucun ajout au chapitre 2.
  const live2 = !!ch2 && !ch2.comingSoon;
  const lesson = (chapter, id) => chapter.lessons.find(l => l.id === id);

  const glossary = {
    type: 'glossary',
    title: 'Notations du fil rouge',
    rows: [
      [String.raw`\(x_i=(x_{i1},x_{i2})\)`, String.raw`Entrée : les mesures de l’animal \(i\), poids \(x_{i1}\) (kg) et pelage \(x_{i2}\) (cm).`],
      [String.raw`\(y_i\)`, String.raw`Vraie étiquette de l’animal : \(0/1\) en logistique, \(-1/+1\) en SVM.`],
      [String.raw`\(\hat y_i\)`, String.raw`Classe prédite par le modèle ; elle peut différer de \(y_i\).`],
      [String.raw`\(w,\ b\)`, 'Paramètres appris : vecteur normal et biais.'],
      [String.raw`\(g(x)=w^{\top}x+b\)`, String.raw`Fonction de score, à valeurs réelles. Pour un animal donné, on abrège sa valeur par \(z=g(x)\).`],
      [String.raw`\(\sigma(z)=\frac{1}{1+e^{-z}}\)`, 'Sigmoïde : transforme un score réel en nombre de \\((0,1)\\).'],
      [String.raw`\(\hat p(x)=\sigma(g(x))\)`, String.raw`Probabilité estimée d’être un chien ; elle estime \(P(Y=1\mid X=x)\), pas la classe elle-même.`],
      [String.raw`\(t\)`, String.raw`Seuil de décision : \(\hat y=1\) si \(\hat p\ge t\).`],
      [String.raw`\(\ell(y,\hat p)\)`, String.raw`Perte ; ici l’entropie croisée binaire \(-[y\log\hat p+(1-y)\log(1-\hat p)]\).`],
      [String.raw`\(C\)`, 'Hyperparamètre de régularisation, choisi sur la validation (régression logistique et SVM).']
    ]
  };

  const logistic = {
    id: 'logistique',
    fresh: true,
    title: 'Régression logistique',
    duration: 20,
    intro: 'Le fil rouge des chats et des chiens : un score linéaire, une probabilité, une décision, puis une perte pour apprendre.',
    objective: 'Distinguer score, probabilité et classe prédite ; interpréter le seuil ; écrire l’entropie croisée binaire ; séparer apprentissage, validation et test.',
    blocks: [
      {type: 'prose', title: 'Pourquoi une probabilité ?', html: String.raw`<p>Pour une réponse binaire \(y\in\{0,1\}\), une droite de régression peut prédire \(1{,}4\) ou \(-0{,}3\) : ce ne sont pas des probabilités. La <strong>régression logistique</strong> garde un <strong>score linéaire</strong> et le transforme en probabilité.</p>`},
      {type: 'formula', tex: String.raw`\begin{aligned}\log\frac{P(Y=1\mid X=x)}{1-P(Y=1\mid X=x)}&=w^{\top}x+b,\\P(Y=1\mid X=x)&=\sigma(w^{\top}x+b)\\&=\frac{1}{1+e^{-(w^{\top}x+b)}}.\end{aligned}`,
        explanation: String.raw`Le logarithme de la cote (log-odds) est linéaire en \(x\) : c’est l’hypothèse annoncée dans le tableau des modèles linéaires supervisés.`},
      {type: 'callout', title: 'Fil rouge jusqu’aux SVM', html: String.raw`<p>Les mêmes 40 animaux synthétiques servent dans tout le chapitre : poids \(x_{1}\), pelage \(x_{2}\), chat \(=0\), chien \(=1\).</p>`},
      {type: 'logistic-story'},
      {type: 'animal-split-story'},
      glossary,
      {type: 'exercise', title: 'À faire — un calcul à la main',
        question: String.raw`<p>On reprend \(w=(1{,}37\,;\,-0{,}22)\) et \(b=-8{,}75\). Un animal pèse \(x_{1}=7\) kg et son pelage mesure \(x_{2}=2\) cm.</p><ol><li>Calculer le score \(z\).</li><li>En déduire \(\hat p\) ; on donne \(\sigma(0{,}40)\approx0{,}60\).</li><li>Donner la classe prédite pour \(t=0{,}5\), puis pour \(t=0{,}7\).</li><li>C’est en fait un chat. Calculer sa perte \(\ell\).</li></ol>`,
        answer: String.raw`<p>\(z=1{,}37\times7-0{,}22\times2-8{,}75=9{,}59-0{,}44-8{,}75=0{,}40\), donc \(\hat p=\sigma(0{,}40)\approx0{,}60\).</p><p>Avec \(t=0{,}5\) : \(\hat p\ge t\), donc \(\hat y=1\) (chien). Avec \(t=0{,}7\) : \(\hat y=0\) (chat). Le modèle n’a pas changé, seule la règle de décision a changé.</p><p>Pour un chat, \(y=0\) : \(\ell=-\log(1-\hat p)=-\log0{,}40\approx0{,}92\).</p>`}
    ]
  };
  if (live2) ch2.lessons.splice(ch2.lessons.findIndex(l => l.id === 'supervises') + 1, 0, logistic);

  // Chapitre 1 : présenter le fil rouge au moment où l'on distingue régression et discrimination.
  const rd = lesson(ch1, 'regression-discrimination');
  const rdStart = rd.blocks.length;
  rd.blocks.push(
    {type: 'prose', title: 'Fil rouge · chats et chiens', html: String.raw`<p>Un animal est décrit par deux mesures : son poids \(x_{i1}\) et la longueur de son pelage \(x_{i2}\). Prédire l’<strong>espèce</strong> \(y_i\in\{\text{chat},\text{chien}\}\) est un problème de <strong>discrimination</strong>. Prédire le <strong>poids</strong> à partir du pelage serait une <strong>régression</strong>.</p>`},
    {type: 'animal-intro'}
  );

  // Chapitre 2 : passage aux étiquettes −1 / +1 au moment d'introduire le SVM.
  const sg = live2 ? lesson(ch2, 'svm-geometrie') : {blocks: []};
  const sgStart = sg.blocks.length;
  sg.blocks.push(
    {type: 'prose', title: String.raw`Des étiquettes \(0/1\) aux étiquettes \(\pm1\)`, html: String.raw`<p>La logistique code chat \(0\), chien \(1\). Le SVM code chat \(-1\), chien \(+1\) : \(y_i^{\pm}=2y_i-1\).</p><p>Dans les formules SVM qui suivent, \(y_i\) désigne ce codage \(\pm1\). \(g(x_i)\) reste un score, et \(\hat y_i\) la classe prédite.</p>`},
    {type: 'formula', tex: String.raw`y_i\,g(x_i)>0\iff\text{l’observation }i\text{ est du bon côté de }g(x)=0`, explanation: String.raw`Avec \(0/1\), il faudrait distinguer deux cas : \(g(x)>0\) si \(y=1\) et \(g(x)<0\) si \(y=0\).`}
  );
  // Prix Netflix : figure ajoutée en fin de partie, affichée juste après le texte (slide-layout.js).
  lesson(ch1, 'introduction-generale').blocks.push({type: 'figures', items: [
    {src: 'assets/redrawn/netflix.svg',
      alt: 'Petite matrice clients × films : la plupart des cases sont vides, quelques notes de 1 à 5 sont connues et quelques notes sont à prédire.',
      caption: 'Matrice clients × films presque vide.'},
    {src: 'assets/netflix-prize.webp',
      alt: 'L’équipe BellKor’s Pragmatic Chaos sur scène, tenant un chèque géant de 1 000 000 $ signé Reed Hastings, daté du 21 septembre 2009.',
      caption: '21 septembre 2009 : BellKor’s Pragmatic Chaos remporte le million. Photo : Netflix.'}
  ]});
  // Récits au défilement pour les autres algorithmes du cours.
  const bv = lesson(ch1, 'biais-variance'), bvStart = bv.blocks.length; bv.blocks.push({type: 'bias-variance-story'});
  const er = lesson(ch1, 'estimation-risque'), erStart = er.blocks.length; er.blocks.push({type: 'cv-story'});
  const mc = live2 ? lesson(ch2, 'multiclasses') : {blocks: []}, mcStart = mc.blocks.length; mc.blocks.push({type: 'multiclass-story'});
  const hs = live2 ? lesson(ch2, 'hard-soft') : {blocks: []};
  const hsStart = hs.blocks.length;
  hs.blocks.push({type: 'logit-svm-story'});
  // Récits interactifs de more-stories.js, en fin de partie : diapositives « Nouveau », hors parcours en classe.
  const tail = (chapter, id, type) => { if (chapter === ch2 && !live2) return 0; const l = lesson(chapter, id), at = l.blocks.length; l.blocks.push({type}); return at; };
  // slide-layout.js décale d'un cran les indices ≥ 3 de l'introduction : on compense ici.
  const supStart = tail(ch1, 'introduction-generale', 'supervise-story') + 1;
  const lossStart = tail(ch1, 'fonction-perte', 'loss-story');
  const riskStart = tail(ch1, 'risque', 'risk-story');
  const geoStart = tail(ch2, 'geometrie', 'geometrie-story');
  const distStart = tail(ch2, 'svm-geometrie', 'distance-story');
  const slackStart = tail(ch2, 'marge-souple', 'slack-story');
  const dualStart = tail(ch2, 'dualite', 'dual-story');
  // Identifiant fixe (…-pas) : les identifiants des diapositives existantes ne bougent pas.
  const pas = (id, title, at) => ({after: 0, slides: [[title, [at], {fresh: true, id: id + '-pas'}]]});

  // Temps du parcours en classe ; la lecture complète reste disponible.
  const durations = {
    fondements: {'introduction-generale':10,'regression-discrimination':12,'fonction-perte':15,risque:15,'biais-variance':18,'estimation-risque':15,categorisation:5},
    lineaires: {geometrie:10,supervises:8,logistique:20,'svm-geometrie':6,'marge-dure':12,'marge-souple':10,dualite:10,'hard-soft':5,multiclasses:9}
  };
  for (const chapter of live2 ? [ch1, ch2] : [ch1]) for (const [id, d] of Object.entries(durations[chapter.id])) lesson(chapter, id).duration = d;

  window.SID34_NEW = {
    glossary,
    slides: {
      fondements: {
        'introduction-generale': {...pas('introduction-generale', 'Avec ou sans étiquettes', supStart), after: 8},
        'fonction-perte': {...pas('fonction-perte', 'Deux pertes pas à pas', lossStart), after: 1},
        risque: {...pas('risque', 'La meilleure prévision pas à pas', riskStart), after: 3},
        'regression-discrimination': {after: 1, slides: [['Fil rouge · chats et chiens', [rdStart, rdStart + 1], {fresh: true}]]},
        'biais-variance': {after: 2, slides: [['Biais et variance pas à pas', [bvStart], {fresh: true}]]},
        'estimation-risque': {after: 4, slides: [['La validation croisée pas à pas', [erStart], {fresh: true}]]}
      },
      lineaires: !live2 ? {} : {
        logistique: {replace: [['Pourquoi une probabilité ?', [0, 1, 2], {fresh: true}], ['De la mesure à la décision', [3], {fresh: true}], ['Apprendre, valider, tester', [4], {fresh: true}], ['Notations du fil rouge', [5], {fresh: true}], ['À faire · un calcul à la main', [6], {extra: true, fresh: true}]]},
        geometrie: {...pas('geometrie', 'Hyperplan pas à pas', geoStart), after: 2},
        'svm-geometrie': {inserts: [{after: 0, slides: [['Étiquettes du SVM', [sgStart, sgStart + 1], {fresh: true}]]}, {...pas('svm-geometrie', 'Du score à la distance pas à pas', distStart), after: 1}]},
        'marge-souple': {...pas('marge-souple', 'Les relâchements pas à pas', slackStart), after: 0},
        dualite: {...pas('dualite', 'Les multiplicateurs pas à pas', dualStart), after: 0},
        'hard-soft': {after: 0, slides: [['De la probabilité à la marge', [hsStart], {fresh: true}]]},
        multiclasses: {after: 0, slides: [['OvR et OvO pas à pas', [mcStart], {fresh: true}]]}
      }
    }
  };
})();
