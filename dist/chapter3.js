(function () {
  'use strict';
  /* Chapitre 3 · Algorithmes non linéaires. D'après lecture3.pdf (CART, k-NN, SVM à noyau, k-means, t-SNE ;
     ACP et AFC laissées de côté à la demande de l'enseignante). Récits : nonlin-stories.js. Lu en défilant. */
  let number = 0;
  const S = (id, title, blocks) => ({id, title, blocks, extra: false, fresh: false, open: false, number: ++number, hidden: false});
  const P = (html, title) => ({type: 'prose', title, html});
  const F = (tex, explanation) => ({type: 'formula', tex, explanation: explanation || ''});
  const C = (title, html) => ({type: 'callout', title, html});
  const T = (headers, rows) => ({type: 'table', headers, rows});
  const EX = (title, question, answer) => ({type: 'exercise', title, question, answer});
  const R = String.raw;
  const X = (id, title, blocks) => ({id, title, blocks, extra: true, fresh: false, open: false, number: null, hidden: false});
  const DUAL = (kernel, cons) => R`\begin{aligned}&\max_{\alpha}\ \sum_{i=1}^{m}\alpha_i-\frac12\sum_{i=1}^{m}\sum_{j=1}^{m}\alpha_i\alpha_jy_iy_j\,\textcolor{#8a4f8c}{\boxed{${kernel}}}\\[6pt]&\text{sous contraintes : }\ ${cons}\quad\text{et}\quad\sum_{i=1}^{m}\alpha_iy_i=0\end{aligned}`;
  const steps = items => '<ol class="worked-steps">' + items.map(t => '<li>' + t + '</li>').join('') + '</ol>';
  const lesson = (id, title, duration, intro, objective, outcome, exitQuestion, slides) => ({id, title, duration, intro, objective, outcome, exitQuestion, slides, blocks: slides.flatMap(s => s.blocks)});

  const pourquoi = lesson('pourquoi', 'Quand la droite ne suffit plus', 8,
    'Le même problème qu’au chapitre 2, avec quelques animaux de plus. La droite ne suit plus.',
    'Reconnaître un problème non linéaire et distinguer méthode paramétrique et non paramétrique.',
    'Dire pourquoi une droite échoue, et citer trois façons de faire mieux.',
    'Pourquoi une droite ne peut-elle pas isoler une région entourée par l’autre classe ?', [
      S('pourquoi-recit', 'Le refuge s’agrandit', [{type: 'nl-why-story'}]),
      S('pourquoi-def', 'Qu’est-ce que le non-linéaire ?', [
        P(R`<p><strong>Non linéaire</strong> : une relation ou une structure qu’une transformation linéaire simple ne peut pas représenter.</p><p>Beaucoup de ces méthodes reposent sur des <strong>distances</strong>, des <strong>voisinages</strong> ou des <strong>partitions</strong>, et leurs sorties ne sont pas toujours des paramètres interprétables.</p>`),
        T(['', 'Paramétrique', 'Non paramétrique'], [
          ['Exemples', 'régression logistique, SVM linéaire', 'k-NN, arbre'],
          ['Gardé pour prédire', 'quelques nombres appris', 'les points (k-NN), les nœuds (arbre)'],
          ['Avec plus de données', 'toujours autant de nombres', 'ce qui est gardé peut grossir'],
          ['Réglages choisis avant l’entraînement', 'oui : \\(C\\)', 'oui : \\(k\\), profondeur']]),
        C('À retenir', R`<p>On passe du <strong>sous-espace</strong> (linéaire) à la <strong>géométrie des données</strong> (non linéaire).</p>`)])
    ]);

  const arbres = lesson('arbres', 'Arbres de décision (CART)', 27,
    'Couper l’espace par une suite de questions simples : une variable, un seuil.',
    'Calculer une impureté et un gain, construire une coupe, expliquer le lien entre profondeur et biais-variance.',
    'Calculer le gain d’une coupe et justifier le choix d’une profondeur.',
    'Pourquoi un arbre maximal a-t-il toujours 100 % sur les données d’apprentissage ?', [
      S('arbres-def', 'Arbres de décision', [
        P(R`<p>Différentes méthodes de construction d’arbres de décision existent. <strong>CART</strong> est la plus répandue ; CHAID et ID3 sont des alternatives.</p><p><strong>CART</strong> = <em>Classification And Regression Trees</em>.</p><p>Classifieur et régresseur : mêmes principes, critères différents.</p>`)]),
      S('arbres-notations', 'Notations', [
        P(R`<ul><li>On cherche à expliquer une variable \(Y\) par \(p\) variables explicatives \(X_1,\dots,X_p\).</li><li>\(Y\) peut avoir un nombre quelconque de modalités.</li><li>Les variables explicatives peuvent être qualitatives et/ou quantitatives.</li></ul>`)]),
      S('arbres-binaires', 'Arbres binaires', [
        P(R`<ul><li>On se place dans un cadre de <strong>discrimination binaire</strong>.</li><li>La variable réponse \(Y\) admet deux modalités : \(Y\in\{-1,1\}\).</li><li>On suppose deux variables explicatives quantitatives.</li></ul>`)]),
      S('arbres-donnees', 'Représentation des données', [
        P(R`<ul><li>On dispose de \(n\) observations \((X_1,Y_1),\dots,(X_n,Y_n)\).</li><li>\(X_i\in\mathbb R^2\) et \(Y_i\in\{-1,1\}\).</li></ul>`),
        {type: 'figure', src: 'assets/lecture3/cart-donnees.svg', alt: 'Les 46 animaux du cours : chats au centre, chiens autour'},
        P(R`<p><em>Approche par arbres :</em> trouver une <strong>partition</strong> de l’espace des observations qui sépare au mieux les chats des chiens.</p>`)]),
      S('arbres-def-binaire', 'Définition : arbre binaire', [
        P(R`<p>Un arbre de décision CART est :</p><ul><li>un algorithme de <strong>moyennage local par partition</strong> : moyenne en régression, vote majoritaire en discrimination ;</li><li>une méthode construisant la partition par <strong>divisions successives</strong> ;</li><li>utilisant des <strong>hyperplans orthogonaux aux axes</strong> de \(\mathbb R^p\) ;</li><li>dépendant des données \((X_i,Y_i)\).</li></ul>`)]),
      S('arbres-partitions', 'Divisions parallèles aux axes', [
        P(R`<p>La méthode CART construit une partition par des divisions successives parallèles aux axes. Deux exemples de partition :</p>`),
        {type: 'figure', src: 'assets/lecture3/cart-partitions.svg', alt: 'Deux partitions du plan par des coupes parallèles aux axes'}]),
      S('arbres-etapes', 'Une division à chaque étape', [
        P(R`<p>À chaque étape, la méthode cherche une nouvelle division : <strong>une variable</strong> et <strong>un seuil de coupure</strong>.</p>`),
        {type: 'figure', src: 'assets/lecture3/cart-etapes.svg', alt: 'Quatre étapes de découpage, la dernière coupe en gras'}]),
      S('arbres-representation', 'Représentation des arbres binaires', [
        {type: 'figure', src: 'assets/lecture3/cart-arbre.svg', alt: 'Le découpage du plan et l’arbre binaire correspondant'}]),
      S('arbres-decoupes', 'Choix des découpes', [
        P(R`<p><strong>Questions</strong></p><ol><li>Comment choisir les découpes ?</li><li>Faut-il stopper les découpes ? Si oui, quand ?</li></ol><p>À chaque étape, on cherche un couple \((j,s)\) qui coupe un nœud \(\mathcal N\) en deux nœuds fils :</p>`),
        F(R`\mathcal N_1(j,s)=\{X\in\mathcal N\mid X_j\le s\}\quad\text{et}\quad\mathcal N_2(j,s)=\{X\in\mathcal N\mid X_j>s\}`),
        P(R`<p>La sélection du couple \((j,s)\) s’effectue en optimisant un critère qui mesure l’impureté ou l’hétérogénéité des deux nœuds fils.</p>`)]),
      S('arbres-critere', 'Critère de découpe', [
        P(R`<p>L’impureté \(\mathcal I\) d’un nœud doit être :</p><ol><li><strong>faible</strong> lorsqu’un nœud est homogène : les valeurs de \(Y\) dans le nœud sont proches ;</li><li><strong>élevée</strong> lorsqu’un nœud est hétérogène : les valeurs de \(Y\) dans le nœud sont dispersées.</li></ol><p><strong>L’idée : gain d’impureté.</strong> Une fois \(\mathcal I\) définie, on choisit le couple \((j,s)\) qui maximise :</p>`),
        F(R`\Delta(\mathcal I)=\mathbb P(\mathcal N)\,\mathcal I(\mathcal N)-\Big(\mathbb P(\mathcal N_1)\,\mathcal I\big(\mathcal N_1(j,s)\big)+\mathbb P(\mathcal N_2)\,\mathcal I\big(\mathcal N_2(j,s)\big)\Big)`, 'P(N) représente la proportion d’observations dans le nœud N.')]),
      S('arbres-regression', 'Cas de la régression', [
        P(R`<p>Une mesure naturelle de l’impureté d’un nœud \(\mathcal N\) en régression est la <strong>variance</strong> du nœud :</p>`),
        F(R`\mathcal I(\mathcal N)=\frac1{|\mathcal N|}\sum_{i:X_i\in\mathcal N}\big(Y_i-\bar Y_{\mathcal N}\big)^2`, 'La moyenne des Y dans N est notée Y barre N.'),
        P(R`<p><strong>Découpe en régression.</strong> À chaque étape, on choisit le couple \((j,s)\) qui <strong>minimise</strong> :</p>`),
        F(R`\sum_{X_i\in\mathcal N_1(j,s)}\big(Y_i-\bar Y_1\big)^2+\sum_{X_i\in\mathcal N_2(j,s)}\big(Y_i-\bar Y_2\big)^2\quad\text{où}\quad\bar Y_k=\frac1{|\mathcal N_k(j,s)|}\sum_{X_i\in\mathcal N_k(j,s)}Y_i`),
        {type: 'figure', src: 'assets/lecture3/cart-regression.svg', alt: 'Deux seuils candidats sur 14 chiens, avec la somme des carrés de chaque côté', caption: 'Exemple : poids de 14 chiens selon leur taille. En rouge, la somme des carrés de chaque côté.'},
        P(R`<p><strong>Sélection.</strong> \(5{,}5+1\,186{,}7=1\,192{,}2\) à gauche, \(12{,}7+237{,}5=250{,}2\) à droite. On choisit le seuil de droite.</p>`)]),
      S('arbres-discrimination', 'Cas de la discrimination supervisée', [
        P(R`<p>On se place ici dans le cas <em>binaire</em>, \(Y\in\{0,1\}\). Un nœud est <strong>pur</strong> si :</p><ul><li>il contient beaucoup de 0 et peu de 1 (ou l’inverse) ;</li><li>la proportion de 1 est proche de 1 (ou de 0).</li></ul><p><strong>Impureté de Gini</strong></p>`),
        F(R`\mathcal I(\mathcal N)=2\,p(\mathcal N)\big(1-p(\mathcal N)\big)`, 'p(N) représente la proportion de 1 dans N.'),
        P(R`<p><strong>Exemple :</strong> les 46 animaux, \(\mathcal I(\mathcal N)=0{,}485\). Deux découpes candidates :</p>`),
        {type: 'figure', src: 'assets/lecture3/cart-gini.svg', alt: 'Deux découpes candidates : poids inférieur à 7 kg à gauche, pelage inférieur à 4,25 cm à droite'},
        T(['', R`\(\mathcal I(\mathcal N_1)\)`, R`\(\mathcal I(\mathcal N_2)\)`, R`\(\Delta(\mathcal I)\)`], [
          ['Gauche', '0,498', '0,305', '0,054'],
          ['Droite', '0,266', '0,483', '0,092']]),
        P(R`<p><strong>Conclusion.</strong> On choisit la découpe de droite.</p>`)]),
      S('arbres-questions', 'Questions', [
        P(R`<ul><li>Comment construire un bon arbre ?</li><li>Construire l’arbre maximal ? (on découpe les nœuds jusqu’à ce qu’on ne puisse plus)</li><li>Faut-il se donner un critère d’arrêt ?</li><li>Faut-il construire un arbre grand et choisir un sous-arbre de ce dernier ?</li></ul>`)]),
      S('arbres-biais', 'Biais et variance', [
        P(R`<p>La profondeur régule le compromis biais/variance :</p><ol><li>Peu de découpes (arbres peu profonds) : arbres stables, peu de variance… mais beaucoup de biais.</li><li>Beaucoup de découpes (arbres profonds) : arbres instables, peu de biais… mais beaucoup de variance.</li></ol><p><strong>Principe d’élagage</strong> (<em>pruning</em>). Plutôt que de choisir « quand couper », on raisonne en 3 temps :</p><ol><li>On construit un arbre maximal (très profond) \(\mathcal T_{\max}\) ;</li><li>On sélectionne une suite d’arbres emboîtés : \(\mathcal T_{\max}=\mathcal T_0\supset\mathcal T_1\supset\dots\supset\mathcal T_K\) ;</li><li>On sélectionne un arbre dans cette sous-suite.</li></ol>`)]),
      X('arbres-exercice', 'À vous : comparer deux coupes', [
        EX('À vous : comparer deux coupes', R`<p>Un nœud contient 10 animaux, dont 5 chiens. Coupe A : (4 chiens, 1 chat) et (1 chien, 4 chats). Coupe B : (3 chiens, 3 chats) et (2 chiens, 2 chats).</p><ol><li>Calculer l’impureté du nœud.</li><li>Calculer le gain de chaque coupe, en prenant \(\mathbb P(\mathcal N)=1\).</li><li>Laquelle choisir ?</li></ol>`,
          R`<ol><li>\(\mathcal I=2\times0{,}5\times0{,}5=0{,}5\).</li><li>Coupe A : les deux fils valent \(2\times0{,}8\times0{,}2=0{,}32\), gain \(0{,}5-0{,}32=0{,}18\). Coupe B : les deux fils valent \(0{,}5\), gain \(0\).</li><li>La coupe A. La coupe B ne purifie rien.</li></ol>`)])
    ]);

  const voisins = lesson('voisins', 'k plus proches voisins', 13,
    'Pas de paramètres à apprendre : on classe un animal en regardant ceux qui lui ressemblent.',
    'Dérouler un k-NN à la main, choisir k par validation croisée, expliquer l’effet des unités.',
    'Prédire avec un k-NN et justifier le choix de k.',
    'Pourquoi un k-NN à k = 1 a-t-il toujours 100 % sur les données d’apprentissage ?', [
      S('voisins-recit', 'Demander aux voisins', [{type: 'knn-story'}]),
      S('voisins-distances', 'Quelle distance choisir ?', [
        T(['Distance', 'Formule', 'Pour…'], [
          ['Euclidienne', R`\(\sqrt{\sum_j(x_j-x_j')^2}\)`, 'des mesures de même échelle'],
          ['Manhattan', R`\(\sum_j|x_j-x_j'|\)`, 'un déplacement sur une grille, données creuses'],
          ['Minkowski', R`\(\big(\sum_j|x_j-x_j'|^q\big)^{1/q}\)`, 'généraliser les deux précédentes (\\(q=1,2\\))'],
          ['Tchebychev', R`\(\max_j|x_j-x_j'|\)`, 'le plus grand écart compte seul'],
          ['Cosinus', R`\(1-\dfrac{x^{\top}x'}{\|x\|\,\|x'\|}\)`, 'la direction plutôt que la taille, textes'],
          ['Hamming', R`nombre de positions différentes`, 'des codes de même longueur'],
          ['Jaccard, Dice', R`à partir de \(|A\cap B|\) et \(|A\cup B|\)`, 'des ensembles'],
          ['Haversine', R`distance sur une sphère`, 'des latitudes et longitudes']]),
        C('Piège : la haute dimension', R`<p>Quand le nombre de variables augmente, les distances deviennent presque toutes semblables : le « plus proche » voisin n’est plus vraiment proche. Le k-NN y est fragile.</p>`)]),
      S('voisins-exercice', 'À la main', [
        EX('À vous : un k-NN sur quatre animaux', R`<p>Animaux connus (poids, pelage) : chat \((4,5)\), chat \((5,4)\), chien \((9,3)\), chien \((7,2)\). Un animal inconnu est en \((6,3)\).</p><ol><li>Calculer les distances euclidiennes.</li><li>Que prédit le modèle à \(k=1\) ?</li><li>Et à \(k=3\) ?</li></ol>`,
          R`<ol><li>Chat \((4,5)\) : \(\sqrt{4+4}\approx2{,}83\). Chat \((5,4)\) : \(\sqrt{1+1}\approx1{,}41\). Chien \((9,3)\) : \(3\). Chien \((7,2)\) : \(\sqrt{1+1}\approx1{,}41\).</li><li>À \(k=1\) : égalité entre le chat \((5,4)\) et le chien \((7,2)\), tous deux à \(1{,}41\). Il faut une règle pour départager.</li><li>À \(k=3\) : ces deux-là et le chat \((4,5)\), soit 2 chats contre 1 chien : chat.</li></ol>`)])
    ]);

  const noyaux = lesson('noyaux', 'SVM à noyau', 22,
    'Une droite ne suffit pas ? On soulève les points, sans jamais calculer leur nouvelle position.',
    'Expliquer l’astuce du noyau, régler γ et C, écrire le modèle en scikit-learn.',
    'Expliquer l’astuce du noyau et interpréter γ et C.',
    'Pourquoi le SVM peut-il éviter de calculer φ(x) ?', [
      S('noyaux-intuition', 'Soulever les points', [{type: 'lift-story'}]),
      S('noyaux-dual', 'Rappel SVM linéaire : dual', [
        P(R`<p><strong>Hard Margin</strong></p>`),
        F(DUAL(R`x_i^{\top}x_j`, R`\alpha_i\ge0,\ \forall i`)),
        P(R`<p><strong>Soft Margin</strong></p>`),
        F(DUAL(R`x_i^{\top}x_j`, R`0\le\alpha_i\le C,\ \forall i`)),
        F(R`K(x_i,x_j)=x_i^{\top}x_j`)]),
      S('noyaux-objectif', 'SVM non linéaire : où se place le noyau', [
        P(R`<p><strong>Hard Margin</strong></p>`),
        F(DUAL(R`K(x_i,x_j)`, R`\alpha_i\ge0,\ \forall i`)),
        P(R`<p><strong>Soft Margin</strong></p>`),
        F(DUAL(R`K(x_i,x_j)`, R`0\le\alpha_i\le C,\ \forall i`)),
        F(R`K(x_i,x_j)=\langle\phi(x_i),\phi(x_j)\rangle`),
        C('À retenir', R`<p>Mêmes objectifs, mêmes contraintes. Seul le terme encadré change.</p>`)]),
      S('noyaux-astuce', 'L’astuce du noyau', [
        P(R`<p>Soulever coûte cher : avec 100 variables et le degré 5, \(\phi(x)\) a près de 97 millions de composantes.</p><p>Or le SVM n’a besoin que d’une chose : le <strong>produit scalaire</strong> entre deux points. Le noyau \(K\) le donne directement, sans soulever.</p>`),
        F(R`K(x,x')=\langle\phi(x),\phi(x')\rangle`, 'Le produit scalaire là-haut, calculé avec les points d’en bas.'),
        T(['\\(x=(1,2)\\), \\(x\'=(3,4)\\)', 'Calcul', 'Résultat'], [
          ['Soulever, puis multiplier', R`\(1+6+16+9+48+64\)`, R`\(\mathbf{144}\)`],
          ['Noyau polynomial de degré 2', R`\((1\cdot3+2\cdot4+1)^2\)`, R`\(\mathbf{144}\)`]]),
        C('À retenir', R`<p>Même résultat, sans jamais calculer \(\phi(x)\).</p>`)]),
      S('noyaux-rbf', 'Le noyau RBF et ses réglages', [{type: 'rbf-story'}]),
      S('noyaux-code', 'En code', [
        P(R`<pre class="ad-code"><code>from sklearn.svm import SVC

# X standardisé : le RBF dépend des distances
modele = SVC(kernel="rbf", gamma=0.1, C=10)
modele.fit(X, y)
# décision pour de nouveaux animaux
modele.predict(X_nouveaux)</code></pre><p>Pour revenir à la droite du chapitre 2 : <code>kernel="linear"</code>.</p>`)]),
      S('noyaux-comparer', 'SVM linéaire ou SVM à noyau ?', [
        T(['', 'SVM linéaire', 'SVM à noyau'], [
          ['Frontière', 'hyperplan', 'courbe, via le noyau'],
          ['Réglages', R`\(C\)`, R`\(C\) et ceux du noyau (\(\gamma\), \(d\)…)`],
          ['Coût', 'faible à moyen', 'souvent plus élevé'],
          ['Interprétabilité', 'meilleure', 'plus faible']]),
        C('À retenir', R`<p>Le noyau apporte de la flexibilité, mais augmente la sensibilité au réglage.</p>`)]),
      {id: 'noyaux-calcul', title: 'Le calcul complet : l’exemple 144 = 144', extra: true, fresh: false, open: false, number: null, hidden: false, blocks: [
        C('Deux noyaux courants', R`<ul><li>RBF : \(K(x,x')=\exp(-\gamma\|x-x'\|^2)\)</li><li>Polynomial : \(K(x,x')=(x^{\top}x'+c)^d\)</li></ul>`),
        P(R`<p>Noyau polynomial de degré 2, \(\phi:\mathbb R^2\to\mathbb R^6\) :</p>`),
        F(R`\phi(x)=\big(1,\ \sqrt2x_1,\ \sqrt2x_2,\ x_1^2,\ \sqrt2x_1x_2,\ x_2^2\big)`, 'La projection explicite du noyau polynomial de degré 2, avec c = 1.'),
        P(steps([
          R`Avec \(x=(1,2)\) : \(\phi(x)=(1,\sqrt2,2\sqrt2,1,2\sqrt2,4)\).`,
          R`Avec \(x'=(3,4)\) : \(\phi(x')=(1,3\sqrt2,4\sqrt2,9,12\sqrt2,16)\).`,
          R`Produit scalaire : \(\langle\phi(x),\phi(x')\rangle=1+6+16+9+48+64=\mathbf{144}\).`,
          R`Sans projection : \(K(x,x')=(1\cdot3+2\cdot4+1)^2=12^2=\mathbf{144}\).`]), 'Deux chemins, un seul résultat'),
        C('Pourquoi c’est décisif', R`<p>Avec \(p=100\) variables et \(d=2\), \(\phi\) a déjà \(5\,151\) composantes ; avec \(d=5\), près de \(97\) millions. \(K\) ne demande toujours que \(100\) produits, plus une puissance.</p>`),
        EX('À vous : vérifier l’astuce', R`<p>Avec le même noyau, \(x=(2,0)\) et \(x'=(1,3)\).</p><ol><li>Calculer \(\phi(x)\) et \(\phi(x')\), puis leur produit scalaire.</li><li>Calculer \(K(x,x')\) directement.</li></ol>`,
          R`<ol><li>\(\phi(x)=(1,2\sqrt2,0,4,0,0)\) et \(\phi(x')=(1,\sqrt2,3\sqrt2,1,3\sqrt2,9)\). Produit scalaire : \(1+4+0+4+0+0=9\).</li><li>\(K(x,x')=(2\cdot1+0\cdot3+1)^2=3^2=9\).</li></ol>`)]}
    ]);

  const kmeans = lesson('kmeans', 'k-means', 13,
    'Plus d’étiquettes : trouver des groupes à partir des seules mesures.',
    'Dérouler k-means, écrire la WCSS, choisir k par la méthode du coude.',
    'Dérouler une itération de k-means et lire une courbe du coude.',
    'Pourquoi la WCSS ne peut-elle pas servir seule à choisir k ?', [
      S('kmeans-recit', 'Des groupes sans étiquette', [{type: 'kmeans-story'}]),
      S('kmeans-formule', 'Ce que k-means minimise', [
        P(R`<p>Un nombre de clusters \(k\) fixé à l’avance ; chaque observation appartient à un seul cluster, représenté par son <strong>centroïde</strong> \(\mu_i\).</p>`),
        F(R`\min_{C_1,\dots,C_k}\ \sum_{i=1}^{k}\ \sum_{x\in C_i}\|x-\mu_i\|^2`, 'WCSS, Within-Cluster Sum of Squares : la somme des carrés des distances au centroïde.'),
        EX('À vous : une itération', R`<p>Points : \((1,1)\), \((2,1)\), \((4,3)\), \((5,4)\). Centroïdes de départ : \(\mu_1=(1,1)\) et \(\mu_2=(2,1)\).</p><ol><li>Affecter chaque point.</li><li>Recalculer les centroïdes.</li><li>L’affectation change-t-elle ensuite ?</li></ol>`,
          R`<ol><li>\((1,1)\) va à \(\mu_1\). Les trois autres vont à \(\mu_2\).</li><li>\(\mu_1=(1,1)\), \(\mu_2=\big(\tfrac{11}3,\tfrac83\big)\approx(3{,}67;\,2{,}67)\).</li><li>Oui : \((2,1)\) est maintenant à distance 1 de \(\mu_1\) et environ \(2{,}36\) de \(\mu_2\). Il passe à \(\mu_1\), puis l’algorithme se stabilise avec \(\mu_1=(1{,}5;\,1)\) et \(\mu_2=(4{,}5;\,3{,}5)\).</li></ol>`)])
    ]);

  const tsne = lesson('tsne', 't-SNE, et ce qu’il faut retenir', 7,
    'Représenter des données de grande dimension en 2D, en conservant les voisinages locaux.',
    'Distinguer ce que t-SNE conserve, ce qu’il ne conserve pas, et comparer les méthodes du chapitre.',
    'Dire ce qui se lit et ce qui ne se lit pas sur une carte t-SNE.',
    'Que conserve t-SNE que l’ACP ne conserve pas ?', [
      S('tsne-recit', 'Voir en grande dimension', [{type: 'tsne-story'}]),
      S('tsne-pieges', 'Bien lire une carte t-SNE', [
        C('Piège : t-SNE sert à regarder', R`<p>Il ne fournit pas de transformation pour de nouvelles données, et les distances, tailles et formes des amas ne s’interprètent pas. Pour visualiser, oui. Comme entrée d’un modèle, ou pour conclure sur des distances, non.</p>`)]),
      S('tsne-resume', 'Résumé du chapitre', [
        T(['Méthode', 'Tâche', 'Force', 'Limite'], [
          ['CART', 'classification, régression', 'très interprétable', 'risque de surapprentissage'],
          ['k-NN', 'classification, régression', 'simple, fondé sur les distances', 'fragile en haute dimension'],
          ['SVM à noyau', 'classification, régression (SVR)', 'puissant', 'réglage sensible'],
          ['k-means', 'clustering', 'simple et rapide', 'k fixé, groupes ronds, minimum local'],
          ['t-SNE', 'visualisation', 'voisinages locaux', 'distances entre amas non fiables']]),
        C('Attention : avant de choisir', R`<p>Toujours clarifier la <strong>tâche</strong> (classification ou régression), la <strong>métrique</strong> d’évaluation, et les <strong>contraintes</strong> (interprétabilité, coût).</p>`),
        P(R`<p>Chapitre suivant : l’<strong>agrégation</strong>. Un arbre seul est instable ; beaucoup d’arbres ensemble, beaucoup moins.</p>`),
        {type: 'references', links: [
          {label: 'Breiman, Friedman, Olshen, Stone (1984), Classification and Regression Trees', url: 'https://doi.org/10.1201/9781315139470'},
          {label: 'scikit-learn · Arbres de décision', url: 'https://scikit-learn.org/stable/modules/tree.html'},
          {label: 'scikit-learn · Plus proches voisins', url: 'https://scikit-learn.org/stable/modules/neighbors.html'},
          {label: 'scikit-learn · RBF SVM : paramètres gamma et C', url: 'https://scikit-learn.org/stable/auto_examples/svm/plot_rbf_parameters.html'},
          {label: 'scikit-learn · k-means', url: 'https://scikit-learn.org/stable/modules/clustering.html#k-means'},
          {label: 'van der Maaten, Hinton (2008), Visualizing Data using t-SNE', url: 'https://jmlr.org/papers/v9/vandermaaten08a.html'},
          {label: 'Wattenberg, Viégas, Johnson (2016), How to Use t-SNE Effectively', url: 'https://distill.pub/2016/misread-tsne/'}]}])
    ]);

  window.SID34_CHAPTER_3 = {
    id: 'non-lineaires', number: '03', title: 'Algorithmes non linéaires',
    subtitle: 'Arbres, voisins, noyaux, puis groupes et cartes sans étiquettes.',
    duration: 90, slideCount: number,
    lessons: [pourquoi, arbres, voisins, noyaux, kmeans, tsne]
  };
})();
