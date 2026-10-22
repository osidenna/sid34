(function () {
  'use strict';
  /* Chapitre 2 allégé : 5 parties au lieu de 9, moins d'hyperplans abstraits, plus d'exemples
     écrits pas à pas. Aucune diapositive n'est supprimée : celles qui sortent du fil principal
     passent en compléments (« Tout le support ») et gardent leur identifiant.
     Chargé après slide-layout.js et more-stories.js, avant classroom.js. */
  const ch2 = window.SID34_CHAPTER_2;
  if (!ch2 || !ch2.lessons.some(l => l.id === 'geometrie')) return;
  const byId = Object.fromEntries(ch2.lessons.map(l => [l.id, l]));
  const slide = id => { for (const l of ch2.lessons) { const s = l.slides.find(x => x.id === id); if (s) return s; } throw Error('Diapositive inconnue : ' + id); };
  const extra = s => ({...s, extra: true});
  const worked = (id, title, blocks) => ({title, blocks, extra: false, fresh: true, open: false, id, number: null, hidden: false});
  const steps = (title, items, tex) => [{type: 'prose', title, html: '<ol class="worked-steps">' + items.map(t => '<li>' + t + '</li>').join('') + '</ol>'}].concat(tex ? [{type: 'formula', tex}] : []);
  function part(id, base, fields, main, extras) {
    const slides = main.map(x => ({...slide(x), extra: false})).concat(extras.map(x => extra(slide(x))));
    const added = (fields.added || []);
    const all = slides.slice(0, main.length).concat(added, slides.slice(main.length));
    // Ordre voulu pour les exemples : insérés à la position demandée dans le fil principal.
    const order = fields.order ? fields.order.map(k => all.find(s => s.id === k)).concat(all.filter(s => !fields.order.includes(s.id))) : all;
    return {...base, id, title: fields.title, duration: fields.duration, intro: fields.intro, objective: fields.objective, outcome: fields.outcome,
      blocks: [...new Set(order.flatMap(s => s.blocks))], slides: order};
  }

  const logisticExample = worked('logistique-exemple', 'Exemple pas à pas', steps('Un animal de 7 kg, pelage 2 cm', [
    String.raw`Score : \(z=1{,}37\times7-0{,}22\times2-8{,}75=9{,}59-0{,}44-8{,}75=0{,}40\).`,
    String.raw`Probabilité : \(\hat p=\sigma(0{,}40)=\dfrac1{1+e^{-0{,}40}}\approx0{,}60\).`,
    String.raw`Décision avec \(t=0{,}5\) : \(0{,}60\ge0{,}5\), donc chien. Avec \(t=0{,}7\) : chat. Le modèle n’a pas changé.`,
    String.raw`C’est en fait un chat (\(y=0\)) : perte \(\ell=-\log(1-0{,}60)=-\log0{,}40\approx0{,}92\).`]));
  const marginExample = worked('svm-marge-exemple', 'Exemple pas à pas', steps('Distance et marge, la droite 2x₁ + x₂ = 0', [
    String.raw`Forme générale : \(w=(2,1)\), \(b=0\), donc \(g(x)=2x_1+x_2\).`,
    String.raw`Point \(A=(3,4)\) : \(g(A)=2\times3+4=10>0\), côté positif.`,
    String.raw`Norme : \(\|w\|=\sqrt{2^2+1^2}=\sqrt5\approx2{,}24\).`,
    String.raw`Distance : \(d(A)=\dfrac{|g(A)|}{\|w\|}=\dfrac{10}{\sqrt5}=2\sqrt5\approx4{,}47\).`,
    String.raw`Bords \(g(x)=\pm1\) : largeur de la marge \(\dfrac2{\|w\|}=\dfrac2{\sqrt5}\approx0{,}89\).`]));
  const dualExample = worked('marge-souple-exemple', 'Exemple pas à pas', steps('Le dual sur deux points', [
    String.raw`Données : \(x_1=(2,0)\), \(y_1=+1\) ; \(x_2=(0,0)\), \(y_2=-1\).`,
    String.raw`\(\sum_i\alpha_iy_i=0\) donne \(\alpha_1=\alpha_2=\alpha\), puis \(w=\alpha x_1-\alpha x_2=(2\alpha,0)\).`,
    String.raw`Les deux points sont sur les bords : \(g(x_1)=4\alpha+b=1\) et \(g(x_2)=b=-1\).`,
    String.raw`Donc \(b=-1\), \(\alpha=\tfrac12\), \(w=(1,0)\) : la frontière est la droite \(x_1=1\).`,
    String.raw`Marge : \(2/\|w\|=2\), exactement la distance entre les deux points.`]));

  // Diapositives simples : une idée, une phrase ou deux, une seule formule.
  const simple = (id, title, html, tex, note) => worked(id, title, [{type: 'prose', html}].concat(tex ? [{type: 'formula', tex, explanation: note || ''}] : []));
  const S = {
    modele: simple('simple-modele', 'Un modèle linéaire', String.raw`<p>Exemple : prédire le poids d’un animal à partir de son pelage avec \(\hat y=\theta_0+\theta_1x\).</p><p>On peut ajouter d’autres termes, \(x^2\), \(\sin x\)… Tant que chaque paramètre <strong>multiplie</strong> un terme, le modèle est linéaire.</p>`, String.raw`\hat y=\theta_0+\theta_1x+\theta_2x^2`),
    regclass: simple('simple-regclass', 'Régression ou classification', String.raw`<p>Un même score \(g(x)\) sert aux deux.</p><p><strong>Régression</strong> : la prévision est le score lui-même. <strong>Classification</strong> : on regarde seulement son <strong>signe</strong>.</p>`, String.raw`g(x)=w^{\top}x+b\qquad\hat y=\begin{cases}\text{chien}&\text{si }g(x)\ge0\\\text{chat}&\text{sinon}\end{cases}`),
    erreurs: simple('simple-erreurs', 'Apprendre, c’est réduire les erreurs', String.raw`<p>Chaque point a un <strong>résidu</strong> : l’écart entre la vraie valeur et la prévision.</p><p>On choisit les paramètres qui rendent la somme des résidus au carré la plus petite : les <strong>moindres carrés</strong>.</p>`, String.raw`\min_{\theta}\ \sum_i\big(y_i-\hat y_i\big)^2`),
    marge: simple('simple-marge', 'La marge', String.raw`<p>On trace deux droites parallèles à la frontière, où le score vaut \(+1\) et \(-1\).</p><p>La bande entre elles est la <strong>marge</strong>. Sa largeur ne dépend que de \(\|w\|\).</p>`, String.raw`\text{largeur}=\frac{2}{\|w\|}`),
    svm: simple('simple-svm', 'Le SVM en une ligne', String.raw`<p>Le SVM veut la marge <strong>la plus large</strong>, avec chaque animal du bon côté.</p><p>Marge large \(\iff\) \(\|w\|\) petit. Les étiquettes valent \(y=-1\) (chat) et \(y=+1\) (chien).</p>`, String.raw`\min_{w,b}\ \tfrac12\|w\|^2\quad\text{avec}\quad y_i\,g(x_i)\ge1`),
    C: simple('simple-C', 'Le compromis C', String.raw`<p>On accepte quelques animaux dans la marge, mais chacun coûte \(\xi_i\).</p><p><strong>\(C\) grand</strong> : les erreurs coûtent cher, marge étroite. <strong>\(C\) petit</strong> : marge large, plus d’erreurs tolérées.</p><p>Au mieux, \(\xi_i=\max(0,1-y_i\,g(x_i))\) : c’est la <strong>perte charnière</strong> du SVM.</p>`, String.raw`\min_{w,b}\ \tfrac12\|w\|^2+C\sum_i\xi_i`),
    supports: simple('simple-supports', 'Seuls quelques animaux comptent', String.raw`<p>Le SVM se résume aux animaux <strong>sur le bord ou dans la marge</strong> : les <strong>vecteurs de support</strong>.</p><p>Les autres peuvent bouger sans rien changer.</p>`, String.raw`w=\sum_{i\,\in\,\text{supports}}\alpha_i\,y_i\,x_i`)
  };
  const W = {
    cote: worked('why-cote', 'Pourquoi les odds ?', [
      {type: 'prose', title: 'L’intuition : un pari', html: String.raw`<p>Parmi 5 animaux de 9 kg, 4 sont des chiens et 1 est un chat. On dit que les <strong>odds</strong> sont de <strong>4 contre 1</strong> : \(\hat p=0{,}8\), odds \(=\dfrac{0{,}8}{0{,}2}=4\).</p><p>Les odds disent « combien de fois plus probable que l’inverse ».</p>`},
      {type: 'table', headers: ['\\(\\hat p\\)', 'odds \\(\\hat p/(1-\\hat p)\\)', 'log-odds', 'lecture'], rows: [
        ['0,2', '0,25', '−1,39', '1 contre 4 : plutôt chat'], ['0,5', '1', '0', 'autant de chances'], ['0,8', '4', '+1,39', '4 contre 1 : plutôt chien'], ['0,99', '99', '+4,6', 'presque sûr']]},
      {type: 'prose', title: 'Pourquoi ça arrange tout', html: String.raw`<p>\(\hat p\) est coincée entre 0 et 1 ; les odds vont de 0 à l’infini ; les <strong>log-odds</strong> vont de \(-\infty\) à \(+\infty\), comme une droite, et sont symétriques (chat \(-1{,}39\), chien \(+1{,}39\)).</p><p>On peut donc écrire les log-odds comme un score linéaire, puis revenir à \(\hat p\) par la sigmoïde.</p>`},
      {type: 'formula', tex: String.raw`\log\frac{\hat p}{1-\hat p}=w^{\top}x+b`, explanation: String.raw`Un kilo de plus ajoute \(w\) aux log-odds, donc multiplie les odds par \(e^{w}\).`}]),
    predict: worked('why-predict', 'Prédire un nouvel animal', steps('Quatre étapes, toujours les mêmes', [
      String.raw`<strong>Mesurer</strong> : \(x=(\text{poids},\text{pelage})\).`,
      String.raw`<strong>Score</strong> : \(z=w^{\top}x+b\), avec les \(w,b\) appris.`,
      String.raw`<strong>Probabilité</strong> : \(\hat p=\sigma(z)\).`,
      String.raw`<strong>Décision</strong> : chien si \(\hat p\ge t\), sinon chat. Le seuil \(t\) se choisit selon le coût des erreurs, sans réapprendre.`])),
    relax: simple('why-relax', 'Pourquoi relâcher la marge ?', String.raw`<p>Avec de vraies données, chats et chiens se chevauchent : <strong>aucune droite</strong> ne les sépare parfaitement. La marge dure n’a alors aucune solution.</p><p>On autorise donc chaque animal à dépasser son bord d’un peu, \(\xi_i\), et on fait payer ce dépassement.</p>`, String.raw`y_i\,g(x_i)\ge1-\xi_i,\qquad\xi_i\ge0`),
    lagr: simple('why-lagrange', 'Pourquoi le Lagrangien ?', String.raw`<p>Le SVM est un problème <strong>avec contraintes</strong> : minimiser \(\tfrac12\|w\|^2\) en gardant chaque animal du bon côté.</p><p>Le Lagrangien les met dans l’objectif : chaque contrainte reçoit un « prix » \(\alpha_i\ge0\). Si la contrainte gêne, son prix est positif ; sinon il vaut 0.</p>`, String.raw`L(w,b,\alpha)=\tfrac12\|w\|^2-\sum_i\alpha_i\big(y_i\,g(x_i)-1\big)`),
    dual: simple('why-dual', 'Pourquoi le dual ?', String.raw`<p>En annulant les dérivées du Lagrangien, \(w\) s’écrit avec les \(\alpha_i\). Il ne reste qu’un problème en \(\alpha\) : le <strong>dual</strong>.</p><p>Trois avantages : la plupart des \(\alpha_i\) valent 0 (seuls les <strong>vecteurs de support</strong> comptent) ; les données n’apparaissent que par des produits \(x_i^{\top}x_j\) (ce qui ouvrira les noyaux) ; les contraintes deviennent simples, \(0\le\alpha_i\le C\).</p>`, String.raw`w=\sum_i\alpha_i\,y_i\,x_i`),
    solve: simple('why-solve', 'Comment on résout en pratique', String.raw`<p>Le problème est <strong>convexe</strong> : un seul minimum, pas de piège local.</p><p>Un logiciel (scikit-learn) ajuste les \(\alpha_i\) deux par deux jusqu’à respecter toutes les conditions, puis calcule \(w\) et \(b\). On n’a jamais à le faire à la main : il suffit de comprendre ce que l’on obtient.</p>`)
  };
  const lossTable = worked('pertes-recap', 'Un algorithme = un modèle + une perte', [
    {type: 'prose', html: String.raw`<p>Comme au chapitre 1 : on choisit une <strong>perte</strong>, puis on minimise le <strong>risque empirique</strong>, sa moyenne sur les données. Chaque algorithme de ce chapitre est un choix de modèle et de perte.</p>`},
    {type: 'table', headers: ['Algorithme', 'Modèle', 'Perte \\(\\ell\\)'], rows: [
      ['Régression linéaire', String.raw`\(\hat y=w^{\top}x+b\)`, String.raw`quadratique \(\tfrac12(y-\hat y)^2\)`],
      ['Régression logistique', String.raw`\(\hat p=\sigma(w^{\top}x+b)\)`, String.raw`entropie croisée \(-y\log\hat p-(1-y)\log(1-\hat p)\)`],
      ['SVM', String.raw`\(g(x)=w^{\top}x+b\), classe = signe`, String.raw`charnière \(\max\big(0,\,1-y\,g(x)\big)\), plus \(\tfrac12\|w\|^2\)`]]}
  ]);
  // Régression linéaire puis logistique « de A à Z », sur un exemple d'élèves (hors fil rouge).
  const P = (html, title) => ({type: 'prose', html, title});
  const F = (tex, explanation) => ({type: 'formula', tex, explanation: explanation || ''});
  const T = (headers, rows) => ({type: 'table', headers, rows});
  const AZ = [
    worked('lr-donnees', 'Régression linéaire · les données', [P(String.raw`<p>Six élèves : heures de révision \(X\) et note sur 20 \(Y\).</p><p>But : estimer la note moyenne attendue pour \(x\) heures, \(E(Y\mid X=x)\).</p>`),
      T(['Heures \\(X\\)', '1', '2', '3', '4', '5', '6'], [['Note \\(Y\\)', '8', '9', '11', '12', '14', '15']])]),
    worked('lr-modele', 'Le modèle et ses hypothèses', [F(String.raw`Y_i=\beta_0+\beta_1x_i+\varepsilon_i`),
      P(String.raw`<ol><li><strong>Linéarité</strong> : \(E(Y\mid X=x)=\beta_0+\beta_1x\).</li><li><strong>Indépendance</strong> des erreurs \(\varepsilon_i\).</li><li><strong>Variance constante</strong> : \(\operatorname{Var}(\varepsilon_i)=\sigma^2\).</li><li>Souvent : \(\varepsilon_i\sim\mathcal N(0,\sigma^2)\), utile pour les intervalles et les tests.</li></ol>`)]),
    worked('lr-perte', 'La perte : les moindres carrés', [F(String.raw`J(\beta)=\frac1n\sum_{i=1}^{n}\big(y_i-\beta_0-\beta_1x_i\big)^2`),
      P(String.raw`<p>On cherche la droite qui rend les résidus au carré les plus petits.</p><p>Lien avec la suite : si les erreurs sont gaussiennes, minimiser \(J\) revient à <strong>maximiser la vraisemblance</strong>. La logistique fera la même chose avec une autre loi.</p>`)]),
    worked('lr-solution', 'La solution', [F(String.raw`\hat\beta_1=\frac{\sum_i(x_i-\bar x)(y_i-\bar y)}{\sum_i(x_i-\bar x)^2},\qquad\hat\beta_0=\bar y-\hat\beta_1\bar x`),
      P(String.raw`<p>Ici \(\bar x=3{,}5\), \(\bar y=11{,}5\) : \(\hat\beta_1\approx1{,}46\) point par heure, \(\hat\beta_0\approx6{,}4\).</p>`)]),
    worked('lr-predire', 'Prédire', [P(String.raw`<p>Un élève révise 7 heures : \(\hat y=6{,}4+1{,}46\times7\approx16{,}6\).</p><p>La prévision est une valeur réelle, sans limite : parfait pour une note, pas pour un oui/non.</p>`)]),
    worked('lg-quoi', '1 · Que modélise-t-on ?', [T(['Heures \\(X\\)', '1', '2', '3', '4', '5', '6'], [['Réussi \\(Y\\)', '0', '0', '0', '1', '1', '1']]),
      P(String.raw`<p>\(Y\in\{0,1\}\). On veut estimer \(p(x)=P(Y=1\mid X=x)\).</p><p>Comme \(Y\) vaut 0 ou 1, \(E(Y\mid X=x)=p(x)\) : on modélise encore une espérance conditionnelle, comme en régression linéaire, mais avec une autre forme.</p>`)]),
    worked('lg-loi', '2 · Choisir une loi', [F(String.raw`Y_i\mid X_i=x_i\sim\operatorname{Bernoulli}(p_i),\qquad P(Y_i=y_i)=p_i^{y_i}(1-p_i)^{1-y_i}`),
      P(String.raw`<p>Si \(p_i=0{,}8\) : 80 % de chances de réussir, 20 % d’échouer.</p><p>Pas encore de sigmoïde : on a seulement choisi la loi de la réponse.</p>`),
      {type: 'callout', title: 'Pourquoi Bernoulli, et pas une autre loi ?', html: String.raw`<p>Parce que \(Y\) ne prend que <strong>deux valeurs</strong>, 0 ou 1. Toute loi sur \(\{0,1\}\) est entièrement décrite par un seul nombre, \(p=P(Y=1)\) : c’est exactement la loi de Bernoulli. Ce n’est pas un choix, c’est la seule possibilité.</p><ul><li><strong>Gaussienne</strong> (régression linéaire) : elle donne des valeurs comme 0,37 ou −1,2, impossibles pour réussi/échoué.</li><li><strong>Binomiale</strong> : nombre de réussites sur \(n\) essais ; avec un seul essai, \(n=1\), c’est Bernoulli.</li><li><strong>Poisson</strong> : des comptages 0, 1, 2, 3… sans limite, pas un oui/non.</li></ul>`}]),
    worked('lg-lien', '3 · Relier X à la probabilité', [P(String.raw`<p>Un score linéaire \(z_i=\beta_0+\beta_1x_i\), et l’hypothèse : les <strong>log-odds</strong> valent ce score.</p>`),
      F(String.raw`\ln\frac{p_i}{1-p_i}=z_i\iff p_i=\sigma(z_i)=\frac1{1+e^{-z_i}}`),
      P(String.raw`<p>Le calcul du modèle : \(x\) → score \(z\) (n’importe quel réel) → sigmoïde → \(p\in(0,1)\) → éventuellement une classe avec un seuil.</p>`)]),
    worked('lg-perte', '4 · La perte : de la vraisemblance à la log loss', [F(String.raw`L(\beta)=\prod_{i=1}^{n}p_i^{y_i}(1-p_i)^{1-y_i}`, 'Observations supposées indépendantes : on multiplie.'),
      P(String.raw`<p>On cherche les \(\beta\) qui rendent les données observées les plus probables. On prend le logarithme, puis le signe moins : maximiser la vraisemblance revient à minimiser</p>`),
      F(String.raw`J(\beta)=-\frac1n\sum_{i=1}^{n}\big[y_i\ln p_i+(1-y_i)\ln(1-p_i)\big]`, 'C’est l’entropie croisée binaire, ou log loss.')]),
    worked('lg-explorer', 'Comment se comporte la log loss ?', [{type: 'bce-story'}]),
    worked('lg-train', '5 · Entraîner : trouver les meilleurs paramètres', [F(String.raw`\frac{\partial J}{\partial\beta_0}=\frac1n\sum_i(p_i-y_i),\qquad\frac{\partial J}{\partial\beta_1}=\frac1n\sum_i(p_i-y_i)\,x_i`),
      P(String.raw`<ol><li>Initialiser \(\beta_0,\beta_1\), par exemple à 0.</li><li>Calculer les scores \(z_i\), puis \(p_i=\sigma(z_i)\).</li><li>Calculer la log loss.</li><li>Calculer les gradients, puis \(\beta_j\leftarrow\beta_j-\alpha\,\partial J/\partial\beta_j\).</li><li>Recommencer jusqu’à convergence.</li></ol><p>Les logiciels utilisent souvent Newton ou L-BFGS plutôt que la descente de gradient simple.</p>`)]),
    worked('lg-predire', '6 · Prédire pour un nouvel élève', [P(String.raw`<p>L’entraînement a donné \(\hat\beta_0=-4\), \(\hat\beta_1=1\). Un élève a révisé 5 heures.</p><ol><li>Score : \(z=-4+1\times5=1\).</li><li>Probabilité : \(p=\dfrac1{1+e^{-1}}\approx0{,}731\), soit 73,1 % de chances de réussir.</li><li>Classe avec le seuil 0,5 : \(p\ge0{,}5\), donc <strong>réussi</strong>.</li></ol><p>Le seuil est une règle de décision, pas une partie du modèle de probabilité.</p>`)]),
    worked('lg-entrainement-prediction', '7 · Entraînement ou prédiction', [T(['Étape', 'Entraînement', 'Prédiction'], [
      ['Entrée', '\\(X_{\\text{train}},Y_{\\text{train}}\\)', 'nouveau \\(X\\)'], ['Paramètres', 'appris, mis à jour', 'fixés'], ['Score et sigmoïde', 'calculés', 'calculés'], ['Perte et gradients', 'calculés', 'inutiles'], ['Sortie', 'coefficients estimés', 'probabilité ou classe']])]),
    worked('lg-comparer', '8 · Linéaire ou logistique', [T(['', 'Régression linéaire', 'Régression logistique'], [
      ['On modélise', '\\(E(Y\\mid X)\\)', '\\(P(Y=1\\mid X)=E(Y\\mid X)\\)'], ['Hypothèse linéaire', '\\(E(Y\\mid X)=X^{\\top}\\beta\\)', '\\(\\operatorname{logit}(p)=X^{\\top}\\beta\\)'],
      ['Loi de la réponse', 'souvent gaussienne', 'Bernoulli'], ['Prévision', '\\(X^{\\top}\\beta\\)', '\\(\\sigma(X^{\\top}\\beta)\\)'], ['Perte', 'erreur quadratique', 'log loss'], ['Estimation', 'moindres carrés', 'maximum de vraisemblance']])]),
    worked('lg-resume', 'Le modèle complet en deux lignes', [F(String.raw`Y_i\mid X_i=x_i\sim\operatorname{Bernoulli}(p_i),\qquad\operatorname{logit}(p_i)=x_i^{\top}\beta`),
      P(String.raw`<p>La première ligne dit comment \(Y\) est distribuée sachant \(X\) ; la seconde, comment la probabilité dépend de \(X\).</p><p>On n’entraîne pas le modèle à prédire des odds : les log-odds sont une échelle commode et linéaire, que l’on transforme en probabilités, comparées aux étiquettes par la vraisemblance.</p>`)])
  ];
  // SVM : le fil du « Rappel SVM » de l'enseignante (marge dure, comment résoudre, dual ; marge souple).
  const SV = [
    worked('svm-hm-primal', 'Marge dure · le problème', [
      {type: 'figure', src: 'assets/redrawn/margin.svg', alt: 'Deux classes séparées par la droite w·x+b=0, bords w·x+b=±1 et la marge entre eux.', caption: String.raw`Frontière \(w\cdot x+b=0\), bords \(w\cdot x+b=\pm1\).`},
      F(String.raw`\min_{w,b}\ \tfrac12\|w\|^2\quad\text{sous}\quad y_i(w\cdot x_i+b)\ge1,\ \ \forall i\in[1,m]`),
      {type: 'callout', title: 'Pourquoi c’est « facile »', html: String.raw`<p>Les contraintes sont <strong>affines</strong> et l’objectif est <strong>convexe</strong> : les conditions KKT s’appliquent, on introduit des <strong>multiplicateurs de Lagrange</strong>.</p>`}]),
    worked('svm-hm-primal-dual', 'Primal ou dual ?', [
      P(String.raw`<p>On peut résoudre le problème sous sa forme <strong>primale</strong> (en \(w,b\)) ou <strong>duale</strong> (en \(\alpha\)).</p><ul><li>\(n\gg p\) (beaucoup d’exemples, peu de variables) : plutôt le <strong>primal</strong>.</li><li>\(p\gg n\) : plutôt le <strong>dual</strong>.</li></ul><p>Dans scikit-learn, <code>LinearSVC(dual="auto")</code> choisit selon les dimensions.</p>`),
      {type: 'callout', title: 'Comme en programmation linéaire… mais pas tout à fait', html: String.raw`<p>En PL, le dual échange objectif et contraintes. Ici, c’est de l’<strong>optimisation convexe</strong> : on passe par le Lagrangien.</p>`}]),
    worked('svm-hm-lagrangien', 'Comment le résoudre ? Le Lagrangien', [
      P(String.raw`<p>Idée : transformer un problème <strong>avec contraintes</strong> en un problème <strong>sans contraintes</strong>. Chaque contrainte reçoit un multiplicateur \(\alpha_i\ge0\).</p>`),
      F(String.raw`\mathcal L(w,b,\alpha)=\tfrac12\|w\|^2-\sum_{i=1}^{m}\alpha_i\big[y_i(w\cdot x_i+b)-1\big]`)]),
    worked('svm-hm-kkt', 'Les conditions KKT', [
      F(String.raw`\begin{aligned}\nabla_w\mathcal L=w-\textstyle\sum_i\alpha_iy_ix_i=0&\ \Longrightarrow\ w=\textstyle\sum_i\alpha_iy_ix_i\\\nabla_b\mathcal L=-\textstyle\sum_i\alpha_iy_i=0&\ \Longrightarrow\ \textstyle\sum_i\alpha_iy_i=0\\\forall i,\ \alpha_i\big[y_i(w\cdot x_i+b)-1\big]=0&\ \Longrightarrow\ \alpha_i=0\ \text{ou}\ y_i(w\cdot x_i+b)=1\end{aligned}`),
      P(String.raw`<p>Ces trois conditions donnent la solution \((w^*,b^*,\alpha^*)\). La dernière dit : soit \(\alpha_i=0\), soit le point est <strong>sur le bord</strong> — un vecteur de support.</p>`)]),
    worked('svm-hm-dual', 'Obtenir le dual en 3 étapes', [P(String.raw`<ol>
      <li><strong>Introduire</strong> un multiplicateur \(\alpha_i\ge0\) par contrainte : \(\mathcal L=\text{objectif}-\sum_i\alpha_i\,(\text{contrainte}_i)\).</li>
      <li><strong>Minimiser</strong> en \((w,b)\) : on obtient \(w=\sum_i\alpha_iy_ix_i\) et \(\sum_i\alpha_iy_i=0\). En remplaçant, \(\|w\|^2=\sum_{i,j}\alpha_i\alpha_jy_iy_j\,(x_i\cdot x_j)\) et le terme en \(b\) disparaît.</li>
      <li><strong>Maximiser</strong> en \(\alpha\) ce qui reste.</li></ol>`),
      F(String.raw`\max_{\alpha}\ \sum_i\alpha_i-\tfrac12\sum_{i,j}\alpha_i\alpha_jy_iy_j\,(x_i\cdot x_j)\quad\text{sous}\quad\alpha_i\ge0,\ \ \textstyle\sum_i\alpha_iy_i=0`)]),
    worked('svm-sm-primal', 'Marge souple · le problème', [
      F(String.raw`\min_{w,b,\xi}\ \tfrac12\|w\|^2+C\sum_{i=1}^{n}\xi_i\quad\text{sous}\quad y_i(w\cdot x_i+b)\ge1-\xi_i,\ \ \xi_i\ge0`),
      P(String.raw`<p>Chaque point peut entrer dans la marge, ou même passer de l’autre côté, de \(\xi_i\) ; \(C\) fixe le prix de ces violations.</p>`)]),
    worked('svm-sm-lagrangien', 'Deux familles de multiplicateurs', [
      P(String.raw`<p>Deux types de contraintes, donc deux multiplicateurs : \(\alpha_i\ge0\) pour \(y_i(w\cdot x_i+b)\ge1-\xi_i\), et \(\mu_i\ge0\) pour \(\xi_i\ge0\).</p>`),
      F(String.raw`L(w,b,\xi,\alpha,\mu)=\tfrac12\|w\|^2+C\sum_i\xi_i-\sum_i\alpha_i\big(y_i(w\cdot x_i+b)-1+\xi_i\big)-\sum_i\mu_i\xi_i`)]),
    worked('svm-sm-derivees', 'Annuler les dérivées', [
      F(String.raw`\frac{\partial L}{\partial w}=0\Rightarrow w=\sum_i\alpha_iy_ix_i\qquad\frac{\partial L}{\partial b}=0\Rightarrow\sum_i\alpha_iy_i=0\qquad\frac{\partial L}{\partial\xi_i}=0\Rightarrow\alpha_i+\mu_i=C`),
      P(String.raw`<p>Comme \(\alpha_i\ge0\), \(\mu_i\ge0\) et \(\alpha_i+\mu_i=C\) : <strong>\(0\le\alpha_i\le C\)</strong>. C’est la seule différence avec la marge dure.</p>`)]),
    worked('svm-sm-dual', 'Finalement', [F(String.raw`\max_{\alpha}\ \sum_i\alpha_i-\tfrac12\sum_{i,j}\alpha_i\alpha_jy_iy_j\,(x_i\cdot x_j)\quad\text{sous}\quad0\le\alpha_i\le C,\ \ \textstyle\sum_i\alpha_iy_i=0`),
      P(String.raw`<p>Même dual qu’en marge dure, avec une borne supérieure \(C\) sur chaque \(\alpha_i\).</p>`)])
  ];
  const lessons = [
    part('modeles', byId.supervises, {title: 'Modèles linéaires', duration: 10,
      intro: 'Ce que « linéaire » veut dire, puis un score pour prédire ou classer.',
      objective: 'Reconnaître un modèle linéaire et son critère.', outcome: 'Reconnaître un modèle linéaire et son critère.',
      added: [S.modele, S.regclass, S.erreurs, lossTable], order: ['geometrie-lineaire', 'simple-modele', 'simple-regclass', 'simple-erreurs', 'supervises-6', 'pertes-recap']},
      ['geometrie-lineaire', 'supervises-6'],
      ['supervises-2', 'supervises-3', 'supervises-4', 'supervises-5', 'geometrie-1', 'geometrie-2', 'geometrie-3', 'geometrie-pas', 'geometrie-4', 'supervises-1', 'supervises-7']),
    part('logistique', byId.logistique, {title: 'Régression linéaire et logistique', duration: 30,
      intro: 'Construire la régression logistique de A à Z : le modèle statistique, la perte, l’entraînement, la prédiction.',
      objective: byId.logistique.objective, outcome: byId.logistique.outcome, added: [...AZ, W.cote],
      order: ['lr-donnees', 'lr-modele', 'lr-perte', 'lr-solution', 'lr-predire', 'lg-quoi', 'lg-loi', 'lg-lien', 'why-cote', 'lg-perte', 'lg-explorer', 'lg-train', 'lg-predire', 'lg-entrainement-prediction', 'lg-comparer', 'lg-resume', 'logistique-n2', 'logistique-n3']},
      ['logistique-n2', 'logistique-n3'], ['logistique-intro', 'logistique-n1', 'logistique-n4', 'logistique-n5']),
    part('svm-marge', byId['svm-geometrie'], {title: 'SVM : marge dure', duration: 17,
      intro: 'La marge, le problème primal, puis comment le résoudre : Lagrangien, KKT et dual.',
      objective: 'Écrire le primal de la marge dure, ses conditions KKT et son dual.', outcome: 'Écrire le primal, les KKT et le dual.',
      added: [marginExample, S.marge, S.supports, dualExample, ...SV.slice(0, 5)],
      order: ['marge-dure-4', 'svm-geometrie-droite', 'svm-marge-exemple', 'svm-geometrie-pas', 'simple-marge', 'svm-hm-primal', 'svm-hm-primal-dual', 'svm-hm-lagrangien', 'svm-hm-kkt', 'svm-hm-dual', 'dualite-pas', 'simple-supports', 'marge-souple-exemple']},
      ['marge-dure-4', 'svm-geometrie-droite', 'svm-geometrie-pas', 'dualite-pas'], ['svm-geometrie-1', 'svm-geometrie-3', 'svm-geometrie-n2', 'marge-dure-1', 'marge-dure-2', 'marge-dure-3', 'dualite-1', 'dualite-2', 'dualite-3']),
    part('marge-souple', byId['marge-souple'], {title: 'SVM : marge souple', duration: 16,
      intro: 'Quand les classes se chevauchent : relâchements, rôle de C, et le dual avec 0 ≤ α ≤ C.',
      objective: 'Écrire le primal de la marge souple et retrouver la contrainte 0 ≤ α ≤ C.', outcome: 'Interpréter les relâchements, C et la borne sur α.',
      added: [W.relax, S.C, ...SV.slice(5)],
      order: ['why-relax', 'marge-souple-pas', 'svm-sm-primal', 'simple-C', 'svm-sm-lagrangien', 'svm-sm-derivees', 'svm-sm-dual', 'hard-soft-n2']},
      ['marge-souple-pas', 'hard-soft-n2'], ['marge-souple-1', 'marge-souple-3', 'marge-souple-2', 'hard-soft-1']),
    {...byId.multiclasses, duration: 7, slides: [byId.multiclasses.slides.find(x => x.id === 'multiclasses-n2'), ...byId.multiclasses.slides.filter(x => x.id !== 'multiclasses-n2')]},
    (() => {
      const story = worked('acp-pas', 'L’ACP pas à pas', [{type: 'pca-story'}]);
      const why = simple('why-acp', 'Pourquoi l’ACP ?', String.raw`<p>Quand on a beaucoup de mesures, on veut les <strong>voir</strong>, les <strong>compresser</strong> ou enlever le bruit.</p><p>L’ACP fabrique quelques nouvelles variables, des combinaisons linéaires des anciennes, qui gardent le plus de variance possible. Pas besoin d’étiquette : c’est un algorithme <strong>non supervisé</strong>.</p><p>Sa perte : l’<strong>erreur de reconstruction</strong> \(\|x-\hat x\|^2\). Garder la variance maximale revient à la rendre minimale.</p>`, String.raw`z=u^{\top}(x-\bar x)\qquad\text{avec } u \text{ la direction de variance maximale}`);
      const ex = worked('acp-exemple', 'Exemple pas à pas', steps('Une matrice de covariance 2 × 2', [
        String.raw`Données centrées de covariance \(\Sigma=\begin{pmatrix}2&1\\1&2\end{pmatrix}\).`,
        String.raw`Valeurs propres : \((2-\lambda)^2-1=0\), donc \(\lambda_1=3\) et \(\lambda_2=1\).`,
        String.raw`Premier axe : \(\Sigma u=3u\) donne \(u=\tfrac1{\sqrt2}(1,1)\), la diagonale.`,
        String.raw`Information gardée : \(\dfrac{\lambda_1}{\lambda_1+\lambda_2}=\dfrac34=75\,\%\).`,
        String.raw`Le point centré \(x=(1,3)\) devient \(z=u^{\top}x=\dfrac{1+3}{\sqrt2}\approx2{,}83\).`]));
      const slides = [story, why, ex].map(x => ({...x, fresh: false}));
      return {...byId.multiclasses, id: 'acp', title: 'ACP : réduire sans étiquette', duration: 10, fresh: false,
        intro: 'Un algorithme linéaire non supervisé : résumer des données par quelques axes qui gardent le plus de variance.',
        objective: 'Expliquer ce que maximise l’ACP et lire la part de variance gardée.', outcome: 'Expliquer l’ACP et la variance gardée.',
        blocks: slides.flatMap(x => x.blocks), slides};
    })()
  ];
  ch2.lessons = lessons;
  // Anciennes adresses → nouvelles parties.
  window.SID34_CH2_ALIASES = {'lineaires/geometrie': 'lineaires/modeles', 'lineaires/supervises': 'lineaires/modeles', 'lineaires/svm-geometrie': 'lineaires/svm-marge',
    'lineaires/marge-dure': 'lineaires/svm-marge', 'lineaires/dualite': 'lineaires/marge-souple', 'lineaires/hard-soft': 'lineaires/marge-souple'};
})();
