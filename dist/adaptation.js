window.SID34_ADAPTATION = {
  title: 'Notes d’adaptation pour l’enseignante',
  changes: [
    {
      chapter: '1 · Fonction de perte',
      original: 'La définition affiche \\(\\ell(y,y^{\\prime})=0\\), puis \\(\\ell(y,y^{\\prime})>0\\) lorsque \\(y\\neq y^{\\prime}\\).',
      updated: 'La première égalité devient \\(\\ell(y,y)=0\\). Les pertes sur des scores ou des probabilités sont distinguées des pertes entre valeurs de même nature.',
      reason: 'Correction d’une coquille contradictoire ; la condition diagonale n’est pas imposée à toutes les pertes de classification.'
    },
    {
      chapter: '1 · Perte charnière',
      original: 'Le tableau applique \\(\\max(0,1-yy^{\\prime})\\) à \\(y^{\\prime}=\\operatorname{sign}(w^{\\top}x+b)\\).',
      updated: 'La perte devient \\(\\max(0,1-y\\,g(x))\\), avec \\(g(x)=w^{\\top}x+b\\). La classe prédite utilise le signe, avec la convention explicite \\(+1\\) lorsque le score est nul.',
      reason: 'La perte d’entraînement doit conserver le score continu et l’information de marge.'
    },
    {
      chapter: '1 · Expliquer et prédire',
      original: '« Bien expliquer ⇒ bien prédire ».',
      updated: 'L’explication et la prévision sont présentées comme des objectifs complémentaires, évalués séparément ; la qualité de l’une ne garantit pas celle de l’autre.',
      reason: 'Qualification de l’affirmation, sans supprimer la discussion statistique / machine learning.'
    },
    {
      chapter: '1 · Biais, variance et bruit',
      original: 'La décomposition locale utilise Var(ε) pour le bruit et une espérance de la prévision apprise.',
      updated: 'Les moyennes sur les échantillons d’apprentissage sont explicitées. Var(ε) suppose une variance conditionnelle constante ; le terme local général Var(Y | X = x) est précisé. Le plancher de bruit concerne l’erreur quadratique attendue sur une nouvelle réponse, pas la MSE d’apprentissage.',
      reason: 'Clarification des sources d’aléa et des hypothèses ; la décomposition quadratique est conservée.'
    },
    {
      chapter: '1 · Validation croisée',
      original: 'La sortie de l’algorithme est la moyenne des K erreurs de plis.',
      updated: 'La moyenne originale par pli est conservée. Son équivalence avec la moyenne des pertes par observation est précisée pour des plis de même taille, comme dans le laboratoire à cinq plis.',
      reason: 'La formule originale n’est pas erronée : elle donne le même poids à chaque pli. La pondération est précisée pour éviter un changement silencieux de convention.'
    },
    {
      chapter: '1 · Exemple Netflix',
      original: 'La valeur 0,953 est appelée « erreur quadratique moyenne (RMSE) ».',
      updated: 'Le RMSE est distingué de la MSE. Les données sont ramenées aux ordres de grandeur documentés : environ 480 000 clients, 18 000 films et 3 millions de prédictions réservées. Le RMSE test 0,9525 explique l’arrondi 0,953 ; le classement public utilise 0,9514.',
      reason: 'Correction de la métrique et des données historiques, en distinguant le classement public du test final.'
    },
    {
      chapter: '1 · Commentaires sur la validation croisée',
      original: 'La validation croisée est présentée comme plus stable et plus précise que la séparation apprentissage–validation.',
      updated: 'La répétition des séparations est conservée ; l’amélioration de stabilité ou de précision est qualifiée selon K, les données et l’algorithme.',
      reason: 'L’avantage n’est pas garanti pour tout problème. Le score utilisé pour sélectionner un modèle est distingué d’une évaluation finale réservée.'
    },
    {
      chapter: '1 · Figure des fonctions de perte',
      original: 'Dans lossff.png, la courbe de perte charnière utilise \\(y^{\\prime}\\) sur un axe continu.',
      updated: 'Le schéma vectoriel utilise g pour le score continu du SVM, et non pour sa classe prédite.',
      reason: 'La relation est conservée ; le score est distingué de la décision pour rester cohérent avec le tableau corrigé.'
    },
    {
      chapter: '1 · Figure de séparation des données',
      original: 'split.png montre Train, Validation et Test, tandis que l’algorithme hold-out utilise 𝒯 pour les indices de validation.',
      updated: 'Les indices de validation sont désormais notés 𝒱 dans le texte et les formules ; le test final reste réservé à l’évaluation.',
      reason: 'Éviter de faire désigner la validation et le test par la même lettre, sans modifier l’algorithme ni ses diapositives.'
    },
    {
      chapter: '1 · Figures de catégorisation',
      original: 'categ.png et here.png associent les modèles paramétriques à une loi normale, les non paramétriques à l’absence d’hypothèses et à une moindre puissance, et les linéaires à une séparation parfaite.',
      updated: 'Les cartes sont redessinées en format vectoriel en conservant les trois axes et la perspective linéaire / non linéaire. Les définitions précisent que paramétrique n’implique pas gaussien, non paramétrique n’implique ni absence d’hypothèses ni moindre puissance, et linéaire n’impose pas une séparation parfaite.',
      reason: 'Les trois axes de classement restent utiles ; les annotations trop générales des images ne doivent pas être prises comme des définitions.'
    },
    {
      chapter: '2 · Hyperplans',
      original: 'La définition est affine ; les exemples décrivent des droites et plans vectoriels passant par l’origine.',
      updated: 'Les exemples généraux deviennent une droite affine et un plan affine ; le cas \\(b=0\\) retrouve les exemples vectoriels. La condition \\(w\\neq0\\) est explicitée.',
      reason: 'Mise en cohérence des exemples avec la définition ; l’exercice original passant par l’origine reste valide.'
    },
    {
      chapter: '2 · Distance et marge',
      original: 'L’exemple calcule correctement \\(d(A,H)=2\\sqrt5\\) pour \\(A=(3,4)\\) et \\(H : 2x+y=0\\), puis utilise \\(\\text{marge}=2d\\).',
      updated: 'Le calcul de distance est conservé. Pour interpréter \\(2d\\) comme largeur de marge d’un séparateur, \\(d\\) est la plus petite distance des observations à la frontière. La formule \\(2/\\|w\\|\\) suppose les niveaux canoniques \\(\\pm1\\).',
      reason: 'Précision sur le point le plus proche et la normalisation ; aucune correction de l’arithmétique de l’exemple.'
    },
    {
      chapter: '2 · Marge dure et unicité',
      original: 'Le problème à marge dure pour des données séparables est annoncé à solution unique ; aucun point ne doit être à l’intérieur de la marge.',
      updated: 'Ces affirmations sont conservées dans le cadre à marge dure, avec les deux classes présentes et des données linéairement séparables. Les violations sont introduites ensuite pour la marge souple.',
      reason: 'Clarification du cadre, sans correction d’énoncés mathématiques valides.'
    },
    {
      chapter: '2 · Figure de distance entre droites parallèles',
      original: 'La figure dis.png écrit des coefficients \\(a,b\\) pour une droite et \\(a^{\\prime},b^{\\prime}\\) pour l’autre, puis utilise \\(|c-c^{\\prime}|/\\sqrt{a^{2}+b^{2}}\\).',
      updated: 'La légende précise que cette formule suppose les deux équations écrites avec le même vecteur normal \\((a,b)\\). Pour les niveaux canoniques \\(\\pm1\\) du SVM, la différence des termes constants vaut \\(2\\).',
      reason: 'Hypothèse nécessaire à la formule illustrée ; si les normales sont seulement proportionnelles, il faut d’abord écrire les équations avec les mêmes coefficients.'
    },
    {
      chapter: '1 · Prétraitements et validation',
      original: 'L’algorithme précise seulement que le modèle est appris sur les données d’apprentissage.',
      updated: 'Les prétraitements sont appris sur l’apprentissage seulement et réappris dans chaque pli. Le découpage respecte les groupes ou l’ordre temporel lorsque les observations sont liées.',
      reason: 'Rendre explicites les conditions pratiques qui évitent une fuite d’information.'
    },
    {
      chapter: '1 · Risque de classification',
      original: 'Une question demande d’écrire le risque pour la perte 0–1, sans réponse disponible sur la page.',
      updated: 'Une réponse à dévoiler donne le risque comme probabilité de mauvaise classification et rappelle la classe de probabilité conditionnelle maximale.',
      reason: 'Permettre aussi la révision autonome, en gardant la question et son emplacement.'
    },
    {
      chapter: '2 · Coefficients appris en régression',
      original: 'La même notation β désigne les coefficients candidats et ceux du modèle appris ; « régression quadratique » désigne un ajustement affine sous perte quadratique.',
      updated: '\\(\\beta\\) désigne les candidats, \\(\\hat\\beta\\) les coefficients appris ; \\(\\hat f=f_{\\hat\\beta}\\). L’objectif est écrit comme un argmin. Le texte précise « régression linéaire sous perte quadratique ».',
      reason: 'Distinguer le modèle candidat, son ajustement et la nature de la perte.'
    },
    {
      chapter: '2 · Combinaison multiclasses',
      original: 'La figure historique montre des zones ambiguës après combinaison des décisions binaires.',
      updated: 'La légende distingue ces ambiguïtés de la règle OvR finale fondée sur le plus grand score. Une égalité demande une convention. Les tendances du nombre de supports sont qualifiées « dans ce jeu ».',
      reason: 'Distinguer l’illustration ancienne de la décision du modèle et les exemples numériques des règles générales.'
    },
    {
      chapter: '2 · No Free Lunch',
      original: '« Sans hypothèse sur les données, aucun modèle n’est meilleur qu’un autre. »',
      updated: 'Le message pédagogique est conservé et signalé comme informel : sans hypothèses sur les problèmes considérés, on ne dispose pas d’une garantie universelle de supériorité. Il ne dit pas que tous les modèles obtiennent le même score sur chaque jeu de données.',
      reason: 'Qualification de la portée de l’énoncé, sans ajouter une démonstration ni remplacer la progression du cours.'
    }
  ],
  omissionsResolved: [
    'Chapitre 1 : vue d’ensemble des cinq chapitres SID34, contexte, deux approches et question du prix Netflix restaurés.',
    'Chapitre 1 : exemples chiffre–image et prix de voiture, glossaire et distinction entre données observées \\(d_n\\) et échantillon aléatoire \\(D_n\\) restaurés.',
    'Chapitre 1 : pertes \\(L^{p}\\) avec le facteur \\(1/p\\) et demi-perte quadratique conservées ; \\(m^{*}\\) désigne la vraie moyenne, \\(\\hat f\\) le prédicteur appris (noté \\(f_n\\) dans le support original).',
    'Chapitre 1 : algorithme hold-out, algorithme K-blocs, moyenne des erreurs de plis et Leave-One-Out restaurés ; 𝒱 remplace le 𝒯 historique pour la validation.',
    'Chapitre 1 : catégorisation, perspective linéaire / non linéaire, guide scikit-learn et bibliographie du support restaurés.',
    'Chapitre 2 : titre Algorithmes linéaires, ordre des sujets et exercice \\(w=(2,-1)\\) passant par l’origine restaurés.',
    'Chapitre 2 : No Free Lunch, distinction SVC / SVR et exemple de distance pour A = (3, 4) restaurés.',
    'Chapitre 2 : problèmes à marge dure et souple, Lagrangien, dual, combinaison des observations de support et comparaison des formulations restaurés.',
    'Chapitre 2 : stratégies multiclasses OvR et OvO et nombres de modèles restaurés.',
    'Les séquences nouvelles Ridge / Lasso, régression logistique et PCA ne remplacent plus le contenu central du chapitre 2.'
  ],
  references: [
    { label: 'SID34 · sources de l’année précédente', url: 'https://github.com/osidenna/kel-teaches/tree/lecture1' },
    { label: 'scikit-learn · perte charnière et score de décision', url: 'https://scikit-learn.org/stable/modules/generated/sklearn.metrics.hinge_loss.html' },
    { label: 'scikit-learn · validation croisée', url: 'https://scikit-learn.org/stable/modules/cross_validation.html' },
    { label: 'scikit-learn · formulation des SVM', url: 'https://scikit-learn.org/stable/modules/svm.html#mathematical-formulation' }
  ]
};
