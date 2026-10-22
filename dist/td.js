(function (root) {
  'use strict';

  // « TD » : les TD 1 et 2, refondus en 2026–2027 à partir de ceux de 2025–2026 (kel-teaches,
  // branche td1) : 5 exercices au lieu de 8, chacun en phases dont l'usage de l'IA est explicite,
  // plus un mini-oral au dé en fin de TD 1 (questions et dé : td-oral.js).
  // Cellules notebook exécutées dans la page (Pyodide). L'exercice 2 adapte Neuromatch Academy
  // (W1D2, tutoriels 5 et 6).

  // ---------- content ----------
  const NEUROMATCH_HELPERS = String.raw`import numpy as np
import matplotlib.pyplot as plt


def ordinary_least_squares(x, y):
    """Moindres carrés sans inverser XᵀX explicitement."""
    return np.linalg.lstsq(x, y, rcond=None)[0]


def make_design_matrix(x, order):
    """Matrice de design [1, x, x², …, x^order]."""
    if x.ndim == 1:
        x = x[:, None]
    design_matrix = np.ones((x.shape[0], 1))
    for degree in range(1, order + 1):
        design_matrix = np.hstack((design_matrix, x**degree))
    return design_matrix


def solve_poly_reg(x, y, max_order):
    """Ajuste les régressions polynomiales de degré 0 à max_order."""
    theta_hats = {}
    for order in range(max_order + 1):
        X = make_design_matrix(x, order)
        theta_hats[order] = ordinary_least_squares(X, y)
    return theta_hats


def evaluate_poly_reg(x, y, theta_hats, max_order):
    """MSE de chaque modèle polynomial sur (x, y)."""
    mse = np.zeros((max_order + 1))
    for order in range(0, max_order + 1):
        X_design = make_design_matrix(x, order)
        y_hat = np.dot(X_design, theta_hats[order])
        residuals = y - y_hat
        mse[order] = np.mean(residuals ** 2)
    return mse`;

  const DATA = String.raw`# Données d’apprentissage
np.random.seed(0)
n_train_samples = 50
x_train = np.random.uniform(-2, 2.5, n_train_samples)
noise = np.random.randn(n_train_samples)
y_train = x_train**2 - x_train - 2 + noise

# Données de validation : même loi d’entrée que l’apprentissage
n_valid_samples = 20
x_valid = np.random.uniform(-2, 2.5, n_valid_samples)
noise = np.random.randn(n_valid_samples)
y_valid = x_valid**2 - x_valid - 2 + noise
# Le test final reste réservé : il sera généré après le choix du degré.`;

  // TD 2026–2027 : moins d’exercices, chacun en phases (prédire, construire, auditer, justifier).
  // Chaque exercice dit si l’IA est permise : {ai: 'off' | 'hint' | 'on' | 'mixed', text} ; le badge
  // donne la règle, le texte l’explique sans la répéter.
  const TUTOR_PROMPT = 'Tu es mon tuteur pour un TD d’apprentissage statistique. Ne me donne jamais de code complet ni la réponse. Pose-moi une question à la fois, donne au plus un indice par message, et demande-moi d’expliquer mon raisonnement avant de continuer.';

  const sheets = {
    fondements: {
      title: 'TD 1 · Fondements de l’apprentissage statistique',
      lead: 'Pertes, courbe en U et validation croisée, audit d’un code écrit par une IA.',
      duration: '1 h 30',
      notebook: 'sid34-td1-fondements.ipynb',
      exercises: [
        {
          n: 1, title: 'Choisir une perte', lesson: 'fonction-perte', minutes: 25,
          parts: [
            {ai: 'off'},
            {h: '1 · De mémoire (5 min)'},
            {p: 'Sans notes, en une ligne chacune :'},
            {ol: [
              String.raw`Définir le risque quadratique $\mathcal{R}(f)$ d’un prédicteur $f$.`,
              String.raw`Écrire la perte hinge d’un score $g(x)$ pour une étiquette $y\in\{-1,+1\}$.`,
              'Perte quadratique ou perte absolue : laquelle est la plus sensible à une grosse erreur isolée ?'
            ]},
            {h: '2 · La preuve, guidée (10 min)'},
            {p: String.raw`Soit $(X,Y)$ un couple aléatoire à valeurs dans $\mathbb{R}^d \times \mathbb{R}$, avec $\mathbb{E}[Y^2]<\infty$. Ici, la perte quadratique est $(y-\hat y)^2$, sans facteur $\tfrac12$.`},
            {p: String.raw`Montrer que la fonction de régression $m^\star(x) = \mathbb{E}[Y \mid X = x]$ minimise le risque quadratique.`},
            {h: '3 · Prédire, puis vérifier (10 min)'},
            {p: String.raw`On considère le score $g(x) = w^\top x + b$ d’un classifieur linéaire, avec $w^\top = (1, -1)$ et $b = 0$, et les trois points :`},
            {math: String.raw`x_1 = (2,1),\ y_1 = 1, \qquad x_2 = (1,3),\ y_2 = -1, \qquad x_3 = (0,2),\ y_3 = -1.`},
            {ol: [
              String.raw`Calculer à la main les marges signées $m_i = y_i\, g(x_i)$.`,
              String.raw`**Avant d’exécuter**, classer les risques empiriques des pertes hinge $\max(0, 1-m)$, logistique $\log(1+e^{-m})$ et 0-1 $\mathbf{1}_{m<0}$, du plus petit au plus grand. Écrire ce classement.`,
              'Exécuter la cellule. Votre classement était-il juste ? Sinon, quelle propriété d’une des pertes avez-vous oubliée ?',
              String.raw`Pour une marge $m=0{,}2$, puis $m=-0{,}5$, comparer la hinge et la perte 0-1. Que voit la hinge que la perte 0-1 ignore ?`
            ]},
            {cell: {id: 'verif', code: String.raw`import numpy as np

X = np.array([[2,1],[1,3],[0,2]])
y = np.array([1,-1,-1])

w = np.array([1,-1])
b = 0

margins = y*(X.dot(w) + b)
print("Margins:", margins)

hinge = np.maximum(0, 1-margins)
logistic = np.logaddexp(0, -margins)
zero_one = (margins<0).astype(int)

print(f"Hinge R: {hinge.mean():.3f}")
print(f"Logistic R: {logistic.mean():.3f}")
print(f"0-1 R: {zero_one.mean():.3f}")`, expected: 'Margins: [1 2 2]\nHinge R: 0.000\nLogistic R: 0.189\n0-1 R: 0.000'}}
          ],
          hint: [
            {p: String.raw`Preuve : écrire $Y - f(X) = \big(Y - m^\star(X)\big) + \big(m^\star(X) - f(X)\big)$, développer le carré, puis conditionner par $X$ pour traiter le terme croisé.`},
            {p: String.raw`Classement : la perte logistique $\log(1+e^{-m})$ s’annule-t-elle pour une marge positive ?`}
          ]},
        {
          n: 2, title: 'Prédire la courbe en U', lesson: 'biais-variance', minutes: 30,
          parts: [
            {ai: 'hint', text: 'Prédictions à la main.'},
            {prompt: TUTOR_PROMPT},
            {p: String.raw`On compare des régressions polynomiales de degré $k \in \{0, \dots, 5\}$, apprises par moindres carrés sur des données générées selon`},
            {math: 'y = x^2 - x - 2 + \\varepsilon.'},
            {p: 'Les fonctions `make_design_matrix`, `solve_poly_reg` et `evaluate_poly_reg` sont fournies.'},
            {cell: {id: 'helpers2', setup: true, label: 'Fonctions fournies', code: NEUROMATCH_HELPERS + String.raw`


from sklearn.model_selection import KFold


def plot_MSE_poly_fits(mse_train, mse_valid, max_order):
    fig, ax = plt.subplots()
    width = .35
    ax.bar(np.arange(max_order + 1) - width / 2, mse_train, width, label="MSE d’entraînement")
    ax.bar(np.arange(max_order + 1) + width / 2, mse_valid, width, label="MSE de validation")
    ax.legend()
    ax.set(xlabel="Degré du polynôme", ylabel="MSE", title="Comparaison des ajustements polynomiaux")
    plt.show()


def plot_cross_validate_MSE(mse_all):
    """Boîtes à moustaches des MSE de validation, une par degré."""
    plt.figure()
    plt.boxplot(mse_all)
    plt.xticks(range(1, mse_all.shape[1] + 1), range(mse_all.shape[1]))
    plt.xlabel("Degré du polynôme")
    plt.ylabel("MSE de validation")
    plt.title(f"MSE de validation sur {mse_all.shape[0]} blocs")
    plt.show()`}},
            {h: '1 · Prédire (5 min, sans IA)'},
            {p: 'Sur papier, tracez à main levée la MSE d’apprentissage et la MSE de validation en fonction du degré, de 0 à 5. Quel degré choisiriez-vous ? Pourquoi les deux courbes ne se ressemblent-elles pas ?'},
            {h: '2 · Exécuter et comparer à votre croquis'},
            {cell: {id: 'data2', code: DATA + String.raw`

fig, ax = plt.subplots()
plt.title("Données d’entraînement et de validation")
plt.plot(x_train, y_train, '.', markersize=15, label="Entraînement")
plt.plot(x_valid, y_valid, 'g+', markersize=15, label="Validation")
plt.legend()
plt.xlabel('x')
plt.ylabel('y')
plt.show()`}},
            {cell: {id: 'fit2', code: String.raw`max_order = 5
theta_hats = solve_poly_reg(x_train, y_train, max_order)
mse_train = evaluate_poly_reg(x_train, y_train, theta_hats, max_order)
mse_valid = evaluate_poly_reg(x_valid, y_valid, theta_hats, max_order)
plot_MSE_poly_fits(mse_train, mse_valid, max_order)`}},
            {p: 'Où votre croquis était-il juste ? Où vous êtes-vous trompé ?'},
            {h: '3 · Faire varier n et le bruit (6 min)'},
            {p: String.raw`Pour chaque cas, **prédisez d’abord** l’écart entre les deux courbes, puis exécutez : (a) $n=12$, (b) $n=500$, (c) $\sigma=0{,}1$, (d) $\sigma=3$. Vers quelle valeur tend la MSE de validation au meilleur degré ? Comparez-la à $\sigma^2$.`},
            {cell: {id: 'explore2', code: String.raw`def experience(n, sigma, graine=1):
    """Apprend les degrés 0 à 5 sur n points ; évalue sur 500 nouveaux points."""
    rng = np.random.default_rng(graine)
    x_a = rng.uniform(-2, 2.5, n)
    y_a = x_a**2 - x_a - 2 + sigma * rng.normal(size=n)
    x_v = rng.uniform(-2, 2.5, 500)
    y_v = x_v**2 - x_v - 2 + sigma * rng.normal(size=500)
    theta = solve_poly_reg(x_a, y_a, 5)
    return evaluate_poly_reg(x_a, y_a, theta, 5), evaluate_poly_reg(x_v, y_v, theta, 5)


# Prédisez d’abord, puis changez ces deux valeurs : n = 12 ou 500 ; sigma = 0.1 ou 3
n, sigma = 12, 1.0
mse_a, mse_v = experience(n, sigma)
print("MSE d’apprentissage :", np.round(mse_a, 2))
print("MSE de validation   :", np.round(mse_v, 2))
plot_MSE_poly_fits(mse_a, mse_v, 5)`}},
            {h: '4 · Écrire la validation croisée (10 min, IA : indices seulement)'},
            {p: 'On choisit maintenant le degré par validation croisée à $k = 10$ blocs, sur l’apprentissage seul. Compléter `cross_validate` afin de :'},
            {ul: ['diviser les données en $k$ blocs avec `KFold` ;', 'apprendre les modèles sur $k-1$ blocs ;', 'calculer leur MSE sur le bloc tenu à l’écart ;', 'stocker, pour chaque degré, la MSE de chaque bloc.']},
            {cell: {id: 'cv2', todo: true, code: String.raw`def cross_validate(x_train, y_train, max_order, n_splits):
    """MSE de validation, de forme (n_splits, max_order + 1)."""
    kfold_iterator = KFold(n_splits)
    mse_all = np.zeros((n_splits, max_order + 1))

    for i_split, (train_indices, val_indices) in enumerate(kfold_iterator.split(x_train)):
        # À compléter : séparer les données, ajuster, évaluer
        ...

    return mse_all`}},
            {cell: {id: 'run2', code: String.raw`n_splits = 10
mse_all = cross_validate(x_train, y_train, max_order, n_splits)
plot_cross_validate_MSE(mse_all)`}},
            {h: '5 · Un seul test final'},
            {p: 'On fixe le degré avec la moyenne des MSE de validation croisée, puis on réapprend sur les 50 observations d’apprentissage. Les nouvelles données de test ne servent qu’à cette évaluation : ne pas modifier le choix après les avoir vues.'},
            {cell: {id: 'test2', code: String.raw`degre_choisi = int(np.argmin(mse_all.mean(axis=0)))
theta_final = solve_poly_reg(x_train, y_train, degre_choisi)[degre_choisi]

# Test indépendant, de même loi, généré après le choix
rng_test = np.random.default_rng(42)
x_test = rng_test.uniform(-2, 2.5, 20)
y_test = x_test**2 - x_test - 2 + rng_test.normal(size=20)
y_pred = make_design_matrix(x_test, degre_choisi) @ theta_final

print("Degré choisi par CV :", degre_choisi)
print(f"MSE de test finale : {np.mean((y_test - y_pred)**2):.3f}")`}},
            {credit: 'Crédit : Neuromatch Academy, W1D2, <a href="https://compneuro.neuromatch.io/tutorials/W1D2_ModelFitting/student/W1D2_Tutorial5.html" target="_blank" rel="noopener">tutoriel 5</a> et <a href="https://compneuro.neuromatch.io/tutorials/W1D2_ModelFitting/student/W1D2_Tutorial6.html" target="_blank" rel="noopener">tutoriel 6</a>.'}
          ],
          hint: [{p: 'Dans la boucle, extraire `x_train[train_indices]` et `x_train[val_indices]` (de même pour `y_train`), appeler `solve_poly_reg` sur la partie d’apprentissage, puis `evaluate_poly_reg` sur la partie de validation.'}]},
        {
          n: 3, title: 'Auditer un notebook écrit par une IA', lesson: 'estimation-risque', minutes: 20,
          parts: [
            {ai: 'mixed', text: 'Audit sans IA, correction avec IA.'},
            {p: 'Un étudiant a demandé à une IA : « Entraîne un SVM linéaire sur ces données et donne-moi son accuracy. » Le code ci-dessous est la réponse obtenue. Il s’exécute sans erreur et contient **trois erreurs de méthode**.'},
            {cell: {id: 'data3', code: String.raw`import numpy as np

rng = np.random.default_rng(0)
n, p = 120, 2000
X = rng.normal(size=(n, p))        # 2000 variables de bruit pur
y = np.repeat([0, 1], n // 2)      # étiquettes, triées par classe`}},
            {h: '1 · Prédire (3 min)'},
            {p: 'Les 2000 variables sont du bruit, indépendant des étiquettes, et chaque classe compte 60 individus. Quelle accuracy un classifieur peut-il espérer sur de nouvelles données ?'},
            {h: '2 · Trouver les trois erreurs (8 min, sans IA)'},
            {cell: {id: 'ia3', label: 'Réponse de l’IA', code: String.raw`# Réponse de l’IA (à auditer)
from sklearn.preprocessing import StandardScaler
from sklearn.feature_selection import SelectKBest, f_classif
from sklearn.svm import SVC
from sklearn.model_selection import train_test_split, KFold, cross_val_score

# Standardiser, puis garder les 20 variables les plus liées à y
X_scaled = StandardScaler().fit_transform(X)
X_sel = SelectKBest(f_classif, k=20).fit_transform(X_scaled, y)

X_train, X_test, y_train, y_test = train_test_split(
    X_sel, y, test_size=0.25, random_state=0, stratify=y)

# Choisir le meilleur C
best_C, best_score = None, 0
for C in [0.01, 0.1, 1, 10]:
    model = SVC(kernel="linear", C=C).fit(X_train, y_train)
    score = model.score(X_test, y_test)
    if score > best_score:
        best_C, best_score = C, score

# Confirmer par validation croisée
scores = cross_val_score(SVC(kernel="linear", C=best_C), X_sel, y, cv=KFold(5))
print(f"C choisi : {best_C}")
print(f"Accuracy de test : {best_score:.3f}")
print(f"Accuracy en validation croisée : {scores.mean():.3f}")`}},
            {p: 'Exécutez la cellule. Le score annoncé est-il compatible avec votre prédiction ? Repérez les trois erreurs et écrivez pour chacune, en une phrase, pourquoi elle rend le score trop optimiste ou peu fiable.'},
            {h: '3 · Corriger (7 min, IA autorisée)'},
            {p: 'Réécrire l’évaluation : mettre le test de côté **avant** toute transformation ; placer la standardisation et la sélection des variables dans une `Pipeline` ; choisir $C$ par validation croisée stratifiée et mélangée sur l’apprentissage seul ; évaluer **une seule fois** sur le test.'},
            {cell: {id: 'fix3', todo: true, code: String.raw`from sklearn.pipeline import make_pipeline
from sklearn.model_selection import GridSearchCV, StratifiedKFold

# À vous : découper d’abord, puis Pipeline + GridSearchCV sur l’apprentissage seul,
# puis une seule évaluation sur le test.
`}},
            {h: '4 · Justifier (2 min, sans IA)'},
            {p: 'En deux lignes : qu’avez-vous vérifié vous-même, et pourquoi faites-vous confiance au nouveau score ?'},
            {credit: 'Pour aller plus loin : <a href="https://reproducible.cs.princeton.edu/" target="_blank" rel="noopener">Kapoor et Narayanan</a> ont recensé ces fuites de données dans 294 articles de 17 disciplines.'}
          ],
          hint: [{p: 'Cherchez où le test « voit » une information qu’il ne devrait pas voir : avant le découpage, pendant le choix de $C$, et dans l’ordre des données utilisé par `KFold`.'}]},
        {
          n: 'oral', label: 'Fin de séance', title: 'Mini-oral au dé', lesson: '', minutes: 15,
          parts: [
            {widget: 'oral-td1'}
          ]
        }
      ]
    },
    lineaires: {
      title: 'TD 2 · Algorithmes linéaires',
      lead: 'Trois problèmes sur papier, puis la vérification des hypothèses en Python.',
      duration: '1 h 20',
      notebook: 'sid34-td2-lineaires.ipynb',
      exercises: [
        {
          n: 4, title: 'Vérifier les hypothèses de la régression linéaire', lesson: 'logistique', minutes: 30,
          parts: [
            {ai: 'off'},
            {p: 'Quatre hypothèses : **linéarité**, **indépendance** des erreurs, **variance constante**, **normalité** des erreurs. On les vérifie avec un graphique chacune, puis un test.'},
            {cell: {id: 'hyp7data', code: String.raw`import numpy as np
from scipy import stats
import matplotlib.pyplot as plt

rng = np.random.default_rng(0)
n = 80
heures = rng.uniform(1, 10, n)
note = 6 + 1.2 * heures + rng.normal(0, 1.2, n)

b1, b0 = np.polyfit(heures, note, 1)
ajuste = b0 + b1 * heures
residus = note - ajuste
print(f"Droite : note = {b0:.2f} + {b1:.2f} × heures")`, expected: 'Droite : note = 6.27 + 1.15 × heures'}},
            {h: '1 · Un graphique par hypothèse'},
            {cell: {id: 'hyp7plots', code: String.raw`fig, ax = plt.subplots(2, 2, figsize=(9, 7))
ax[0, 0].scatter(heures, note, s=14); ax[0, 0].plot(np.sort(heures), b0 + b1 * np.sort(heures), color="purple")
ax[0, 0].set_title("Linéarité : nuage et droite")
ax[0, 1].scatter(ajuste, residus, s=14); ax[0, 1].axhline(0, color="gray")
ax[0, 1].set_title("Variance constante : résidus / valeurs ajustées")
stats.probplot(residus, plot=ax[1, 0]); ax[1, 0].set_title("Normalité : diagramme quantile-quantile")
ax[1, 1].plot(residus[np.argsort(heures)], marker="o", ms=3); ax[1, 1].axhline(0, color="gray")
ax[1, 1].set_title("Indépendance : résidus dans l’ordre des heures")
plt.tight_layout(); plt.show()`}},
            {ol: [
              'Nuage : les points suivent-ils une droite, ou une courbe ?',
              'Résidus / valeurs ajustées : voyez-vous une forme (courbe, entonnoir) ou un nuage sans structure autour de 0 ?',
              'Diagramme quantile-quantile : les points sont-ils proches de la droite ?',
              'Résidus dans l’ordre : y a-t-il de longues séries de même signe ?'
            ]},
            {h: '2 · Un test par hypothèse'},
            {cell: {id: 'hyp7tests', code: String.raw`def tests(x, r):
    _, p_sw = stats.shapiro(r)                       # normalité
    e2 = r**2                                        # Breusch-Pagan : variance constante
    c1, c0 = np.polyfit(x, e2, 1)
    r2 = 1 - np.sum((e2 - (c0 + c1 * x))**2) / np.sum((e2 - e2.mean())**2)
    p_bp = stats.chi2.sf(len(x) * r2, 1)
    ro = r[np.argsort(x)]                            # Durbin-Watson : indépendance
    dw = np.sum(np.diff(ro)**2) / np.sum(ro**2)
    print(f"Shapiro-Wilk (normalité) : p = {p_sw:.3f}")
    print(f"Breusch-Pagan (variance constante) : p = {p_bp:.3f}")
    print(f"Durbin-Watson (indépendance) : {dw:.2f}")

tests(heures, residus)`, expected: 'Shapiro-Wilk (normalité) : p = 0.609\nBreusch-Pagan (variance constante) : p = 0.380\nDurbin-Watson (indépendance) : 1.85'}},
            {box: {title: 'Lire un test', parts: [
              {ul: [
                'Hypothèse nulle $H_0$ : « l’hypothèse du modèle est respectée ».',
                'Si $p<0{,}05$, on rejette $H_0$ : l’hypothèse semble violée.',
                'Si $p\\ge0{,}05$, on ne la rejette pas : rien ne la contredit (ce n’est pas une preuve qu’elle est vraie).',
                'Durbin-Watson : proche de 2, pas d’autocorrélation ; vers 0 ou 4, des erreurs liées.'
              ]}
            ]}},
            {h: '3 · À vous : un deuxième jeu de données'},
            {p: 'Ici, l’écart des notes grandit avec les heures. Tracez le graphique des résidus contre les valeurs ajustées, lancez `tests`, et dites quelle hypothèse tombe.'},
            {cell: {id: 'hyp7jeu2', todo: true, code: String.raw`note2 = 6 + 1.2 * heures + rng.normal(0, 0.3 * heures, n)
# 1. Ajuster la droite, calculer ajuste2 et residus2
# 2. Graphique : residus2 en fonction de ajuste2
# 3. tests(heures, residus2)
`}},
            {ol: [
              'Quelle forme a le nuage des résidus ? Que dit Breusch-Pagan ?',
              'Les coefficients restent-ils utilisables ? Et les intervalles de confiance habituels ?'
            ]}
          ],
          hint: [{p: 'Résidus / valeurs ajustées : un entonnoir signale une variance qui change. Pour le jeu 2, reprendre exactement les lignes du jeu 1 avec `note2`.'}]},
        {
          n: 5, title: 'Régression logistique', lesson: 'logistique', minutes: 15,
          parts: [
            {ai: 'off'},
            {p: String.raw`Un modèle logistique a appris $w=(1{,}37\,;\,-0{,}22)$ et $b=-8{,}75$. Un animal pèse $8$ kg et son pelage mesure $3$ cm.`},
            {ol: [
              String.raw`Calculer le score $z$ et la probabilité $\hat p=\sigma(z)$ d’être un chien. On donne $\sigma(1{,}55)\approx0{,}825$.`,
              String.raw`Donner la classe prédite pour $t=0{,}5$ puis pour $t=0{,}9$.`,
              String.raw`Montrer que $\sigma(z)\ge t \iff z\ge\log\frac{t}{1-t}$. En déduire le score minimal pour être classé chien avec $t=0{,}7$.`,
              String.raw`L’animal est en fait un chat. Calculer sa perte d’entropie croisée.`
            ]}
          ],
          hint: [{p: String.raw`$\sigma$ est croissante. Pour un chat, $y=0$ et $\ell=-\log(1-\hat p)$.`}]},
        {
          n: 6, title: 'Un SVM à la main', lesson: 'marge-souple', minutes: 20,
          parts: [
            {ai: 'off'},
            {p: String.raw`Un SVM a appris $w=(1\,;\,-0{,}25)$ et $b=-5{,}5$, avec chat $y=-1$ et chien $y=+1$. On donne $\|w\|\approx1{,}031$.`},
            {table: {head: ['Animal', 'Espèce', 'Poids $x_1$', 'Pelage $x_2$'], rows: [
              ['A', 'chat', '4,6', '5,0'], ['B', 'chien', '9,0', '2,6'], ['C', 'chat', '6,0', '3,0'], ['D', 'chien', '5,8', '4,0']]}},
            {ol: [
              String.raw`Calculer $g(x)$ et $y\,g(x)$ pour les quatre animaux. Lesquels sont bien classés ?`,
              String.raw`Calculer la distance de A à la frontière et la largeur de la marge.`,
              String.raw`On multiplie $w$ et $b$ par $2$. Que deviennent $g(A)$, $\|w\|$ et la distance de A ?`,
              String.raw`Calculer $\xi=\max\big(0,1-y\,g(x)\big)$ pour chaque animal. Lesquels sont dans la marge ? du mauvais côté ?`
            ]}
          ],
          hint: [{p: String.raw`Pour A : $g=4{,}6-0{,}25\times5-5{,}5$. Un chat a $y=-1$, donc $y\,g(x)=-g(x)$.`}]},
        {
          n: 7, title: 'Le dual sur deux points', lesson: 'marge-souple', minutes: 15,
          parts: [
            {ai: 'off'},
            {p: String.raw`Deux observations : $x_1=(1,1)$ avec $y_1=+1$, et $x_2=(-1,-1)$ avec $y_2=-1$. On cherche le SVM à marge dure.`},
            {ol: [
              String.raw`À l’aide de $w=\sum_i\alpha_iy_ix_i$ et $\sum_i\alpha_iy_i=0$, exprimer $w$ en fonction d’un seul $\alpha$.`,
              String.raw`Les deux points sont des vecteurs de support : $y_i\,g(x_i)=1$. En déduire $\alpha$, $w$ et $b$.`,
              String.raw`Calculer la largeur de la marge $2/\|w\|$ et la comparer à la distance entre les deux points.`
            ]}
          ],
          hint: [{p: String.raw`$\alpha_1y_1+\alpha_2y_2=0$ donne $\alpha_1=\alpha_2$.`}]}
      ]
    }
  };

  // ---------- text rendering ($…$, $$…$$, **…**, *…*, `…`) ----------
  const escape = s => String(s).replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  function tex(src, display) {
    if (!root.katex) return escape(src);
    try { return root.katex.renderToString(src, {displayMode: display, throwOnError: false, strict: false}); } catch (_) { return escape(src); }
  }
  function inline(text) {
    const out = [];
    const re = /\$\$([^$]+)\$\$|\$([^$]+)\$|`([^`]+)`|\*\*([^*]+)\*\*|\*([^*]+)\*/g;
    let last = 0, m;
    while ((m = re.exec(text))) {
      out.push(escape(text.slice(last, m.index)));
      out.push(m[1] ? tex(m[1], true) : m[2] ? tex(m[2], false) : m[3] ? '<code class="td-code">' + escape(m[3]) + '</code>' : m[4] ? '<strong>' + inline(m[4]) + '</strong>' : '<em>' + inline(m[5]) + '</em>');
      last = re.lastIndex;
    }
    return out.join('') + escape(text.slice(last));
  }

  // ---------- Python kernel (Pyodide, loaded on first run) ----------
  const PYODIDE = 'https://cdn.jsdelivr.net/pyodide/v0.27.7/full/';
  let ready = null, executionCount = 0;
  // Package loading, namespace creation, stdout and figure capture share one runtime.
  let kernelTail = Promise.resolve();
  function kernelJob(job) {
    const result = kernelTail.then(job);
    kernelTail = result.catch(() => {});
    return result;
  }
  function load(status) {
    if (ready) return ready;
    ready = (async () => {
      status('Chargement de Python dans le navigateur… (une seule fois, environ 20 Mo)');
      if (!root.loadPyodide) await new Promise((resolve, reject) => { const s = document.createElement('script'); s.src = PYODIDE + 'pyodide.js'; s.onload = resolve; s.onerror = () => reject(new Error('Python n’a pas pu être chargé : vérifiez la connexion.')); document.head.appendChild(s); });
      const py = await root.loadPyodide({indexURL: PYODIDE});
      py.runPython("import os, warnings\nos.environ['MPLBACKEND'] = 'agg'\nwarnings.filterwarnings('ignore', message='.*non-GUI backend.*')\nwarnings.filterwarnings('ignore', message='.*non-interactive.*')");
      return py;
    })();
    ready.catch(() => { ready = null; });
    return ready;
  }
  const CAPTURE = "import sys as _s\n_imgs = []\nif 'matplotlib.pyplot' in _s.modules:\n    import io as _io, base64 as _b\n    _p = _s.modules['matplotlib.pyplot']\n    for _n in _p.get_fignums():\n        _f = _io.BytesIO(); _p.figure(_n).savefig(_f, format='png', dpi=110, bbox_inches='tight'); _imgs.append(_b.b64encode(_f.getvalue()).decode())\n    _p.close('all')\n_imgs";
  function run(code, options = {}) {
    return kernelJob(() => executePython(code, options));
  }
  async function executePython(code, {ns, files = {}, status = () => {}} = {}) {
    const py = await load(status);
    status('Chargement des bibliothèques…');
    await py.loadPackagesFromImports(code, {messageCallback: () => {}});
    for (const [name, text] of Object.entries(files)) py.FS.writeFile(name, text);
    status('Exécution…');
    let out = '';
    py.setStdout({batched: s => { out += s + '\n'; }});
    py.setStderr({batched: s => { out += s + '\n'; }});
    let ok = true, value = '';
    try {
      const result = await py.runPythonAsync(code, ns ? {globals: ns} : undefined);
      if (result !== undefined && result !== null) {
        if (typeof result === 'object' && result.toString) { value = py.globals.get('repr')(result); result.destroy?.(); }
        else value = typeof result === 'boolean' ? (result ? 'True' : 'False') : typeof result === 'string' ? "'" + result + "'" : String(result);
      }
    } catch (error) {
      ok = false;
      const lines = String(error.message || error).trim().split('\n'), start = lines.findIndex(l => l.includes('File "<exec>"'));
      out += (start >= 0 ? lines.slice(start) : lines.slice(-4)).join('\n');
    }
    let images = [];
    try { const proxy = py.runPython(CAPTURE); images = proxy.toJs(); proxy.destroy(); } catch (_) {}
    return {ok, out: out.trimEnd(), value, images, count: ++executionCount};
  }
  function namespace(status) {
    return kernelJob(async () => { const py = await load(status); return py.globals.get('dict')(); });
  }

  // ---------- notebook cells ----------
  function highlightCode(code) {
    const h = root.SID34Teaching?.highlight || escape;
    return code.split('\n').map(l => h(l) || ' ').join('\n') + '\n';
  }

  function cellHTML(cell) {
    return '<div class="nb-cell' + (cell.setup ? ' nb-setup' : '') + (cell.local ? ' nb-local' : '') + '" data-cell="' + escape(cell.id) + '">' +
      '<div class="nb-prompt" aria-hidden="true">In [ ]:</div><div class="nb-main">' +
      '<div class="nb-editor"><pre class="nb-highlight" aria-hidden="true"><code>' + highlightCode(cell.code) + '</code></pre><textarea class="nb-input" spellcheck="false" autocapitalize="off" autocomplete="off" aria-label="Cellule Python ' + escape(cell.id) + '" aria-description="Tab indente. Maj + Tab, ou Échap puis Tab, permet de quitter le code. Maj + Entrée exécute la cellule.">' + escape(cell.code) + '</textarea></div>' +
      '<div class="nb-actions">' + (cell.local ? '<span class="nb-local-note">À exécuter dans Jupyter ou Colab</span>' : '<button type="button" class="nb-run">' + window.CourseIcons.icon('run') + 'Exécuter</button>') +
      (cell.solution ? '<button type="button" class="text-button nb-solution">' + window.CourseIcons.icon('solution') + 'Afficher la solution</button>' : '') +
      '<button type="button" class="text-button nb-reset" hidden>Revenir au code initial</button><span class="nb-status" aria-live="polite"></span></div>' +
      '<div class="nb-output" hidden></div>' + (cell.expected ? '<details class="nb-expected"><summary>Sortie attendue</summary><pre>' + escape(cell.expected) + '</pre></details>' : '') + '</div></div>';
  }

  // Règle d'usage de l'IA pour l'exercice ou la phase.
  const AI_RULES = {off: ['Sans IA', 'is-off'], hint: ['IA : indices seulement', 'is-hint'], on: ['IA autorisée', 'is-on'], mixed: ['IA selon l’étape', 'is-hint']};
  function partsHTML(parts) {
    return parts.map(part => {
      if (part.ai) return '<p class="td-ai ' + AI_RULES[part.ai][1] + '"><span class="td-ai-badge">' + AI_RULES[part.ai][0] + '</span>' + (part.text ? '<span>' + inline(part.text) + '</span>' : '') + '</p>';
      if (part.prompt) return '<div class="td-prompt"><div class="td-prompt-head"><span>Consigne pour l’IA</span><button type="button" class="text-button td-copy">Copier</button></div><p>' + escape(part.prompt) + '</p></div>';
      if (part.widget) return '<div class="td-widget" data-widget="' + escape(part.widget) + '"></div>';
      if (part.p) return '<p>' + inline(part.p) + '</p>';
      if (part.h) return '<h3 class="td-step">' + inline(part.h) + '</h3>';
      if (part.math) return '<div class="td-math">' + tex(part.math, true) + '</div>';
      if (part.ol) return '<ol>' + part.ol.map(t => '<li>' + inline(t) + '</li>').join('') + '</ol>';
      if (part.ul) return '<ul>' + part.ul.map(t => '<li>' + inline(t) + '</li>').join('') + '</ul>';
      if (part.table) return '<table class="course-table td-table"><thead><tr>' + part.table.head.map(h => '<th>' + inline(h) + '</th>').join('') + '</tr></thead><tbody>' + part.table.rows.map(r => '<tr>' + r.map(c => '<td>' + inline(c) + '</td>').join('') + '</tr>').join('') + '</tbody></table>';
      if (part.note) return '<p class="td-note">' + inline(part.note) + '</p>';
      if (part.credit) return '<p class="td-credit">' + part.credit + '</p>';
      if (part.box) return '<aside class="td-box"><h3>' + inline(part.box.title) + '</h3>' + partsHTML(part.box.parts) + '</aside>';
      if (part.cell) return part.cell.setup ? '<details class="nb-setup-wrap"><summary>' + escape(part.cell.label || 'Code fourni') + ' · s’exécute automatiquement</summary>' + cellHTML(part.cell) + '</details>' : cellHTML(part.cell);
      return '';
    }).join('');
  }

  const storeKey = 'sid34-td-2026';
  const loadMarks = () => { try { return JSON.parse(localStorage.getItem(storeKey) || '{}') || {}; } catch (_) { return {}; } };
  const saveMarks = m => { try { localStorage.setItem(storeKey, JSON.stringify(m)); } catch (_) {} };
  const statusLabel = {todo: 'À faire', done: 'Fait', review: 'À revoir'};

  function bindEditorKeys(input, {changed = () => {}, run = () => {}} = {}) {
    let escapeTab = false;
    input.addEventListener('blur', () => { escapeTab = false; });
    input.addEventListener('keydown', event => {
      if (event.key === 'Escape') { escapeTab = true; return; }
      if (event.key === 'Tab') {
        if (event.shiftKey || escapeTab) { escapeTab = false; return; }
        event.preventDefault(); input.setRangeText('    ', input.selectionStart, input.selectionEnd, 'end'); changed(); return;
      }
      escapeTab = false;
      if (event.key === 'Enter' && (event.shiftKey || event.metaKey || event.ctrlKey)) { event.preventDefault(); run(); }
    });
  }

  function mountCells(scope, sheetCells) {
    const namespaces = new Map();
    const ran = new Set();
    const revisions = new Map();
    const requested = new Set();
    let chainTail = Promise.resolve();
    const ordered = [...scope.querySelectorAll('.nb-cell')];
    const cellData = id => sheetCells.find(c => c.id === id);
    function invalidate(el) {
      const group = el.closest('.td-ex');
      ordered.slice(ordered.indexOf(el)).filter(other => other.closest('.td-ex') === group).forEach(other => {
        const id = other.dataset.cell;
        if (ran.has(id)) other.querySelector('.nb-status').textContent = 'À réexécuter : une cellule a changé.';
        ran.delete(id); revisions.set(id, (revisions.get(id) || 0) + 1);
      });
    }
    ordered.forEach(el => {
      const cell = cellData(el.dataset.cell);
      const input = el.querySelector('.nb-input'), code = el.querySelector('.nb-highlight code'), pre = el.querySelector('.nb-highlight');
      const sync = () => {
        code.innerHTML = highlightCode(input.value);
        el.querySelector('.nb-reset').hidden = input.value === cell.code;
      };
      const changed = () => { invalidate(el); sync(); };
      input.addEventListener('input', changed);
      input.addEventListener('scroll', () => { pre.scrollLeft = input.scrollLeft; });
      bindEditorKeys(input, {changed, run: () => el.querySelector('.nb-run')?.click()});
      requestAnimationFrame(sync);
      el.querySelector('.nb-reset').addEventListener('click', () => { input.value = cell.code; changed(); if (solutionButton) solutionButton.hidden = false; });
      const solutionButton = el.querySelector('.nb-solution');
      if (solutionButton) solutionButton.addEventListener('click', () => { input.value = cell.solution; changed(); solutionButton.hidden = true; });
      const runButton = el.querySelector('.nb-run');
      if (!runButton) return;
      runButton.addEventListener('click', () => {
        if (requested.has(el)) return;
        requested.add(el); runButton.disabled = true;
        const result = chainTail.catch(() => {}).then(async () => {
          invalidate(el);
          // Compute prerequisites after earlier requests finish, using the latest edits.
          const group = el.closest('.td-ex');
          const before = ordered.slice(0, ordered.indexOf(el)).filter(other => other.closest('.td-ex') === group && !ran.has(other.dataset.cell) && other.querySelector('.nb-run'));
          for (const other of [...before, el]) {
            if (!await execute(other)) {
              if (other !== el) el.querySelector('.nb-status').textContent = 'Exécution arrêtée : corrigez la cellule ' + other.dataset.cell + ', puis réessayez.';
              break;
            }
          }
        });
        chainTail = result.catch(error => { el.querySelector('.nb-status').textContent = String(error.message || error); }).finally(() => { requested.delete(el); runButton.disabled = false; });
        return chainTail;
      });
    });
    async function execute(el) {
      const cell = cellData(el.dataset.cell), status = el.querySelector('.nb-status'), output = el.querySelector('.nb-output'), prompt = el.querySelector('.nb-prompt');
      const button = el.querySelector('.nb-run');
      const revision = revisions.get(cell.id) || 0;
      let ok = false;
      button.disabled = true; prompt.textContent = 'In [*]:'; el.classList.add('is-running'); el.classList.remove('has-error');
      try {
        const group = el.closest('.td-ex');
        if (!namespaces.has(group)) namespaces.set(group, await namespace(text => { status.textContent = text; }));
        const ns = namespaces.get(group);
        const result = await run(el.querySelector('.nb-input').value, {ns, status: text => { status.textContent = text; }});
        prompt.textContent = 'In [' + result.count + ']:';
        output.hidden = !(result.out || result.value || result.images.length);
        output.innerHTML = (result.out ? '<pre>' + escape(result.out) + '</pre>' : '') + (result.value ? '<pre class="nb-value"><span>Out[' + result.count + ']:</span> ' + escape(result.value) + '</pre>' : '') + result.images.map(b64 => '<img alt="Figure produite par la cellule" src="data:image/png;base64,' + b64 + '">').join('');
        el.classList.toggle('has-error', !result.ok);
        ok = result.ok && revision === (revisions.get(cell.id) || 0);
        if (ok) ran.add(cell.id); else ran.delete(cell.id);
        status.textContent = revision === (revisions.get(cell.id) || 0) ? '' : 'Cellule modifiée : exécutez à nouveau.';
      } catch (error) {
        prompt.textContent = 'In [ ]:'; status.textContent = error.message;
      }
      button.disabled = requested.has(el); el.classList.remove('is-running');
      return ok;
    }
  }

  function exerciseHTML(ex, chapter, marks) {
    const lesson = chapter.lessons.find(l => l.id === ex.lesson);
    const status = marks[chapter.id + '#' + ex.n] || 'todo';
    return '<article class="td-ex" id="exercice-' + ex.n + '" data-ex="' + ex.n + '" data-status="' + status + '">' +
      '<header class="td-ex-head"><span class="eyebrow">' + (ex.label || 'Exercice ' + ex.n) + (ex.minutes ? ' · ' + ex.minutes + ' min' : '') + '</span><h2>' + inline(ex.title) + '</h2>' + (lesson ? '<a class="td-ex-lesson" href="#' + chapter.id + '/' + lesson.id + '">Partie : ' + escape(lesson.title) + '</a>' : '') + '</header>' +
      '<div class="td-ex-body">' + partsHTML(ex.parts) + '</div>' +
      '<div class="td-reveals">' + (ex.hint?.length ? '<details class="td-reveal"><summary>' + window.CourseIcons.icon('hint') + 'Indice</summary>' + partsHTML(ex.hint) + '</details>' : '') + (ex.solution?.length ? '<details class="td-reveal td-solution"><summary>' + window.CourseIcons.icon('solution') + 'Solution</summary>' + partsHTML(ex.solution) + '</details>' : '') + '</div>' +
      '<footer class="td-ex-foot"><span class="td-ex-status">' + statusLabel[status] + '</span><button type="button" class="secondary-button" data-mark="review">À revoir</button><button type="button" class="primary-button" data-mark="done">Fait</button></footer></article>';
  }

  // ---------- notebook download ----------
  function markdown(parts) {
    return parts.map(part => part.ai ? '> **' + AI_RULES[part.ai][0] + '.**' + (part.text ? ' ' + part.text : '') : part.prompt ? '> Consigne pour l’assistant IA :\n>\n> ' + part.prompt : part.widget ? '' : part.table ? '| ' + part.table.head.join(' | ') + ' |\n|' + part.table.head.map(() => '---').join('|') + '|\n' + part.table.rows.map(r => '| ' + r.join(' | ') + ' |').join('\n') : part.p ? part.p : part.h ? '### ' + part.h : part.math ? '$$' + part.math + '$$' : part.ol ? part.ol.map((t, i) => (i + 1) + '. ' + t).join('\n') : part.ul ? part.ul.map(t => '- ' + t).join('\n') : part.note ? '> ' + part.note : part.credit ? part.credit.replace(/<a href="([^"]+)"[^>]*>([^<]+)<\/a>/g, '[$2]($1)') : part.box ? '> **' + part.box.title + '**\n>\n' + markdown(part.box.parts).split('\n').map(l => '> ' + l).join('\n') : '').filter(Boolean).join('\n\n');
  }
  function notebook(sheet) {
    const cells = [{cell_type: 'markdown', metadata: {}, source: ['# ' + sheet.title + '\n\nOumoukelthoum Sidenna · Apprentissage statistique · 2026–2027']}];
    for (const ex of sheet.exercises) {
      let buffer = ['## ' + (ex.label || 'Exercice ' + ex.n) + ' · ' + ex.title];
      const flush = () => { if (buffer.length) cells.push({cell_type: 'markdown', metadata: {}, source: [buffer.join('\n\n')]}); buffer = []; };
      for (const part of ex.parts) {
        if (part.cell) { flush(); cells.push({cell_type: 'code', metadata: {}, execution_count: null, outputs: [], source: [part.cell.code]}); }
        else buffer.push(markdown([part]));
      }
      flush();
    }
    return JSON.stringify({cells, metadata: {kernelspec: {display_name: 'Python 3', language: 'python', name: 'python3'}, language_info: {name: 'python'}}, nbformat: 4, nbformat_minor: 5}, null, 1);
  }

  // ---------- page ----------
  function render(chapter, scope) {
    const sheet = sheets[chapter.id];
    const marks = loadMarks();
    const teaching = root.SID34Teaching;
    const el = document.createElement('div');
    el.className = 'td-page';
    const cells = sheet.exercises.flatMap(ex => ex.parts.flatMap(p => p.cell ? [p.cell] : p.box ? [] : []));
    const quizLessons = chapter.lessons.filter(l => teaching?.pitfalls[chapter.id + '/' + l.id]);
    const labs = Object.values(teaching?.td[chapter.id] || []);
    el.innerHTML =
      '<p class="lesson-meta td-meta"><span>' + sheet.duration + '</span><button type="button" class="tool-button" data-notebook>' + window.CourseIcons.icon('download') + 'Notebook .ipynb</button><a class="tool-button" href="originaux/td1-2-2025-2026.pdf" download>' + window.CourseIcons.icon('download') + 'Ancien sujet 2025–2026 (PDF)</a></p>' +
      '<nav class="td-index" aria-label="Exercices">' + sheet.exercises.map(ex => '<a href="#exercice-' + ex.n + '" data-jump data-status="' + (marks[chapter.id + '#' + ex.n] || 'todo') + '"><span class="td-number">' + (ex.label || 'Exercice ' + ex.n) + '</span><span class="td-index-title">' + inline(ex.title) + '</span><span class="td-index-status">' + statusLabel[marks[chapter.id + '#' + ex.n] || 'todo'] + '</span></a>').join('') + '</nav>' +
      '<details class="td-setup"><summary>Comment exécuter le code ?</summary><div class="td-setup-grid"><div><h3>Dans la page</h3><p>« Exécuter » lance la cellule et celles qui la précèdent dans l’exercice. La première exécution charge Python puis les bibliothèques nécessaires ; elle demande une connexion Internet. Maj + Entrée exécute aussi la cellule. Tab indente ; Maj + Tab, ou Échap puis Tab, permet de quitter le code. Modifier une cellule impose de réexécuter les suivantes.</p></div><div><h3>Sur votre machine</h3><p>Téléchargez le notebook du TD, puis :</p><pre class="td-shell">pip install jupyter scikit-learn matplotlib pandas\njupyter notebook ' + escape(sheet.notebook) + '</pre></div></div></details>' +
      sheet.exercises.map(ex => exerciseHTML(ex, chapter, marks)).join('') +
      (quizLessons.length ? '<section class="td-quiz"><h2>Pièges à éviter</h2><p class="pitfalls-intro">Les pièges des parties du chapitre. « Aller à l’expérience » ouvre la partie au bon endroit.</p></section>' : '') +
      (labs.length ? '<section class="td-python"><h2>Pour aller plus loin : retrouver les expériences du cours</h2><p class="pitfalls-intro">Ces codes scikit-learn utilisent les données du cours. Les coefficients arrondis des calculs à la main peuvent donner de petits écarts.</p></section>' : '');
    mountCells(el, cells);
    el.querySelectorAll('.td-copy').forEach(button => button.addEventListener('click', () => {
      const text = button.closest('.td-prompt').querySelector('p').textContent;
      navigator.clipboard?.writeText(text).then(() => { button.textContent = 'Copié'; setTimeout(() => { button.textContent = 'Copier'; }, 1500); }, () => {});
    }));
    // Éléments interactifs fournis par d'autres fichiers (window.SID34TDWidgets[nom](élément)).
    el.querySelectorAll('[data-widget]').forEach(slot => root.SID34TDWidgets?.[slot.dataset.widget]?.(slot));
    el.querySelectorAll('.td-ex').forEach(article => {
      article.querySelectorAll('[data-mark]').forEach(button => button.addEventListener('click', () => {
        const all = loadMarks(), id = chapter.id + '#' + article.dataset.ex, value = button.dataset.mark;
        all[id] = all[id] === value ? 'todo' : value; saveMarks(all);
        article.dataset.status = all[id]; article.querySelector('.td-ex-status').textContent = statusLabel[all[id]];
        const link = el.querySelector('.td-index a[href="#exercice-' + article.dataset.ex + '"]');
        link.dataset.status = all[id]; link.querySelector('.td-index-status').textContent = statusLabel[all[id]];
      }));
    });
    el.querySelectorAll('[data-jump]').forEach(a => a.addEventListener('click', event => { event.preventDefault(); el.querySelector(a.getAttribute('href'))?.scrollIntoView({behavior: 'smooth', block: 'start'}); }));
    el.querySelector('[data-notebook]').addEventListener('click', () => {
      const url = URL.createObjectURL(new Blob([notebook(sheet)], {type: 'application/x-ipynb+json'}));
      const a = document.createElement('a'); a.href = url; a.download = sheet.notebook; document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    });
    const quiz = el.querySelector('.td-quiz');
    quizLessons.forEach(l => quiz.appendChild(teaching.renderPitfalls(chapter.id + '/' + l.id, scope, {external: true, heading: l.title})));
    const python = el.querySelector('.td-python');
    if (python) python.appendChild(teaching.renderLabs(chapter));
    return el;
  }

  root.SID34TD = {sheets, render, run, load, notebook, inline, bindEditorKeys};
  root.SID34Kernel = {run, load};
})(typeof window !== 'undefined' ? window : globalThis);
