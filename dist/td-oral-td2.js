(function (root) {
  'use strict';
  // Mini-oral du TD 2 (hors dépôt pour l'instant) : banque de questions et exercice ajoutés au TD 2.
  const td = root.SID34TD, oral = root.SID34Oral;
  if (!td || !oral) return;
  oral.register('oral-td2', [
    {face: 1, name: 'Linéarité en paramètres', questions: [
      {q: 'La régression logistique est-elle un modèle linéaire ? En quel sens ?', relance: 'Écrivez la frontière p̂(x) = t.', attendus: 'Pas linéaire en (w, b) à cause de σ ; mais la frontière w·x + b = logit(t) est un hyperplan.'},
      {q: 'g(x) = w₁x₁x₂ + w₂x₁ + b : linéaire en paramètres ? en x ? Quelle forme a sa frontière ?', relance: 'Dans quel espace la frontière devient-elle un hyperplan ?', attendus: 'Linéaire en paramètres, pas en x ; frontière courbe en x, hyperplan dans l’espace de φ(x) = (x₁x₂, x₁, 1).'},
      {q: 'Pourquoi f(x) = e^(wx) n’est-il pas linéaire en w ?', relance: 'Quelle transformation le ramènerait à un modèle linéaire ?', attendus: 'e^((w+w′)x) ≠ e^(wx) + e^(w′x) ; en passant au logarithme, log f(x) = wx devient linéaire en w.'}
    ]},
    {face: 2, name: 'Frontières et hyperplans', questions: [
      {q: 'Que devient la frontière si l’on multiplie w et b par 2 ? Et par −1 ?', relance: 'Que change la multiplication par −1 pour les prédictions ?', attendus: 'Par 2 : rien. Par −1 : même droite, mais les deux côtés sont échangés.'},
      {q: 'Que représente w géométriquement ?', relance: 'Dans quel sens pointe-t-il ?', attendus: 'Le vecteur normal à la frontière ; il pointe vers g(x) > 0.'},
      {q: 'Pour un SVM à noyau RBF, la frontière est-elle un hyperplan ?', relance: 'Dans quel espace l’est-elle ?', attendus: 'Elle est courbe en x ; c’est un hyperplan dans l’espace associé au noyau.'}
    ]},
    {face: 3, name: 'SVM et choix de C', questions: [
      {q: 'Votre prédiction sur le nombre de vecteurs de support quand C augmente était-elle juste ? Expliquez.', relance: 'Ce sens de variation est-il garanti en général ?', attendus: 'Ici 1 232 → 425 : un grand C pénalise plus les violations. Non garanti en général ; seule la somme des ξᵢ ne peut pas augmenter.'},
      {q: 'Pourquoi le noyau RBF s’effondre-t-il avec C = 0,001 ?', relance: 'Et pourquoi le linéaire résiste-t-il mieux ?', attendus: 'Régularisation trop forte : le modèle est presque constant (score ≈ 0,23).'},
      {q: 'Différence entre paramètre appris et hyperparamètre : donnez un exemple de chaque dans votre code.', relance: 'Sur quelles données choisit-on l’hyperparamètre ?', attendus: 'w, b (ou αᵢ) appris ; C et le noyau choisis par validation croisée sur l’apprentissage.'}
    ]},
    {face: 4, name: 'Lire les résultats', questions: [
      {q: 'Montrez une confusion dans votre matrice. Est-elle plausible pour des chiffres manuscrits ?', relance: 'Comment l’améliorer sans toucher au test ?', attendus: 'Par exemple des 8 pris pour des 1 ; améliorer par la validation croisée, d’autres variables ou plus de données, jamais en regardant le test.'},
      {q: 'La validation croisée donne 0,979, le test 0,982. Quel score annoncer, et pourquoi ?', relance: 'Pourquoi les deux peuvent-ils différer ?', attendus: 'Le score de test, évaluation indépendante faite une fois ; la validation croisée a servi au choix. Les échantillons diffèrent.'},
      {q: 'Le RBF obtient 0,978, le linéaire 0,979. Cette différence compte-t-elle ?', relance: 'Que regarderiez-vous pour trancher ?', attendus: 'Non : l’écart est minuscule face à la dispersion entre plis ; regarder l’écart-type des plis, préférer le modèle le plus simple.'}
    ]},
    {face: 5, name: 'Votre prompt', questions: [
      {q: 'Lisez votre prompt. Quelle phrase a le plus aidé ? Laquelle changeriez-vous ?', relance: 'L’IA a-t-elle respecté les quatre points du premier coup ?', attendus: 'Nommer les objets (train_test_split stratifié, Pipeline, GridSearchCV) et interdire le test avant l’évaluation finale.'},
      {q: 'Montrez une ligne écrite par l’IA que vous avez dû vérifier. Comment l’avez-vous vérifiée ?', relance: 'Qu’auriez-vous fait si elle avait été fausse ?', attendus: 'Une vérification concrète : où le test intervient, ce que fait la ligne ; corriger le prompt plutôt que le code.'},
      {q: 'Montrez la ligne qui garantit que le test n’a servi qu’une fois.', relance: 'Que se passe-t-il si l’on choisit C sur le test ?', attendus: 'Une seule évaluation après GridSearchCV ; choisir C sur le test le rend optimiste et le consomme.'}
    ]},
    {face: 6, name: 'Révision du TD 1', questions: [
      {q: 'Rappelez les trois erreurs du notebook de l’IA au TD 1. Laquelle votre code SVM aurait-il pu commettre ?', relance: 'Comment l’avez-vous évitée ?', attendus: 'Sélection avant le découpage, C choisi sur le test, KFold sans mélange ; ici, standardiser avant le découpage serait la même fuite.'},
      {q: 'Pourquoi la MSE de validation ne descend-elle pas sous σ² ?', relance: 'Quel est l’équivalent pour une classification ?', attendus: 'Le bruit est irréductible : même le vrai modèle le subit. En classification, des classes qui se recouvrent imposent un taux d’erreur minimal.'},
      {q: 'Pourquoi choisir un hyperparamètre par validation croisée plutôt que sur l’erreur d’apprentissage ?', relance: 'Que choisirait l’erreur d’apprentissage pour C ?', attendus: 'L’erreur d’apprentissage favorise le modèle le plus souple ; ici elle choisirait un grand C (accuracy d’apprentissage 1,000).'}
    ]}
  ]);
  const sheet = td.sheets.lineaires;
  if (!sheet.exercises.some(ex => ex.n === 'oral')) {
    sheet.duration = '1 h 30';
    sheet.exercises.push({n: 'oral', label: 'Fin de séance', title: 'Mini-oral au dé', lesson: '', minutes: 20, parts: [
      {widget: 'oral-td2'}
    ]});
  }
})(typeof window !== 'undefined' ? window : globalThis);
