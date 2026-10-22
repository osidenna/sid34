(function (root) {
  'use strict';

  // Teaching aids added around the course content:
  //  · formula anatomy: numbered parts of a key formula, highlighted on hover or tap;
  //  · pitfalls: short self-checked exercises built on the lesson's experiments;
  //  · labs: the scikit-learn code that reproduces each experiment's numbers, shown
  //    at the end of the chapter's TD page (td.js), runnable in the page.
  // scripts/check-labs.cjs runs every lab and compares it with `output`.

  const anatomy = [
    {
      match: String.raw`\mathcal{R}(f)=\mathbb{E}\bigl[\ell(Y,f(X))\bigr]`,
      tex: String.raw`\mathcal{R}(f)=\htmlClass{anat anat-2}{\mathbb{E}\bigl[}\htmlClass{anat anat-1}{\ell(Y,f(X))}\htmlClass{anat anat-2}{\bigr]}`,
      steps: [
        {label: String.raw`\ell(Y,f(X))`, text: 'La perte d’une prévision : l’écart entre la sortie \\(Y\\) et la prévision \\(f(X)\\) pour un couple \\((X,Y)\\).'},
        {label: String.raw`\mathbb{E}[\,\cdot\,]`, text: 'La moyenne de cette perte sur la loi \\(\\mathbb{P}\\) du couple, inconnue : le risque est l’erreur attendue sur de nouvelles données.'}
      ]
    },
    {
      match: String.raw`\mathcal{R}_n(\hat f)=\frac1n\sum_{i=1}^{n}\ell(y_i,\hat f(x_i))`,
      tex: String.raw`\mathcal{R}_n(\hat f)=\htmlClass{anat anat-3}{\frac1n}\htmlClass{anat anat-2}{\sum_{i=1}^{n}}\htmlClass{anat anat-1}{\ell(y_i,\hat f(x_i))}`,
      steps: [
        {label: String.raw`\ell(y_i,\hat f(x_i))`, text: 'La perte du prédicteur appris \\(\\hat f\\) sur l’observation \\(i\\).'},
        {label: String.raw`\sum_{i=1}^{n}`, text: 'La somme sur les \\(n\\) observations de l’échantillon \\(D_n\\).'},
        {label: String.raw`\tfrac1n`, text: 'Une moyenne sur les données d’apprentissage. Comme ces données ont servi à apprendre \\(\\hat f\\), cette erreur peut sous-estimer le risque sur de nouvelles observations.'}
      ]
    },
    {
      match: String.raw`\begin{gathered}\widehat{\mathcal{R}}_k=\frac1{|B_k|}\sum_{i\in B_k}\ell(y_i,\hat f^{(-k)}(x_i)),\\ \widehat{\mathcal{R}}_{\mathrm{CV}}=\frac1K\sum_{k=1}^{K}\widehat{\mathcal{R}}_k.\end{gathered}`,
      tex: String.raw`\begin{gathered}\htmlClass{anat anat-1}{\widehat{\mathcal{R}}_k=\frac1{|B_k|}\sum_{i\in B_k}\ell(y_i,\hat f^{(-k)}(x_i))},\\ \htmlClass{anat anat-2}{\widehat{\mathcal{R}}_{\mathrm{CV}}=\frac1K\sum_{k=1}^{K}\widehat{\mathcal{R}}_k}.\end{gathered}`,
      steps: [
        {label: String.raw`\widehat{\mathcal{R}}_k`, text: 'L’erreur du modèle \\(\\hat f^{(-k)}\\), appris sans le bloc \\(B_k\\), mesurée sur les seules observations de \\(B_k\\).'},
        {label: String.raw`\widehat{\mathcal{R}}_{\mathrm{CV}}`, text: 'La moyenne des \\(K\\) erreurs de blocs : chaque observation est prédite une fois, hors de son apprentissage.'}
      ]
    },
    {
      match: String.raw`\begin{aligned}f_\beta(x)&=\beta_0+\sum_{j=1}^{d}\beta_jx_j,\\ \hat\beta&\in\operatorname*{argmin}_{\beta}\sum_{i=1}^{n}(y_i-f_\beta(x_i))^2,\\ \hat y_i&=f_{\hat\beta}(x_i),\quad\operatorname{MSE}=\frac1n\sum_{i=1}^{n}(y_i-\hat y_i)^2.\end{aligned}`,
      tex: String.raw`\begin{aligned}\htmlClass{anat anat-1}{f_\beta(x)}&\htmlClass{anat anat-1}{=\beta_0+\sum_{j=1}^{d}\beta_jx_j},\\ \htmlClass{anat anat-2}{\hat\beta}&\htmlClass{anat anat-2}{\in\operatorname*{argmin}_{\beta}\sum_{i=1}^{n}(y_i-f_\beta(x_i))^2},\\ \htmlClass{anat anat-3}{\hat y_i}&\htmlClass{anat anat-3}{=f_{\hat\beta}(x_i),\quad\operatorname{MSE}=\frac1n\sum_{i=1}^{n}(y_i-\hat y_i)^2}.\end{aligned}`,
      steps: [
        {label: String.raw`f_\beta`, text: 'Une fonction candidate, définie par les coefficients \\(\\beta\\).'},
        {label: String.raw`\hat\beta`, text: 'Les coefficients appris minimisent la somme des résidus au carré.'},
        {label: String.raw`\hat y_i,\ \operatorname{MSE}`, text: 'La prévision utilise les coefficients appris ; la MSE moyenne leurs résidus au carré.'}
      ]
    },
    {
      match: String.raw`\begin{aligned}\min_{w,b}\quad&\frac12\|w\|^2\\\text{sous les contraintes}\quad&y_i(w\cdot x_i+b)\ge1,\qquad\forall i.\end{aligned}`,
      tex: String.raw`\begin{aligned}\min_{w,b}\quad&\htmlClass{anat anat-1}{\frac12\|w\|^2}\\\text{sous les contraintes}\quad&\htmlClass{anat anat-2}{y_i(w\cdot x_i+b)\ge1},\qquad\htmlClass{anat anat-3}{\forall i}.\end{aligned}`,
      steps: [
        {label: String.raw`\tfrac12\|w\|^2`, text: 'Minimiser \\(\\tfrac12\\|w\\|^{2}\\) revient à maximiser la largeur de marge \\(2/\\|w\\|\\).'},
        {label: String.raw`y_i(w\cdot x_i+b)\ge1`, text: 'Chaque observation est du bon côté et au-delà de son bord : son score signé vaut au moins \\(1\\).'},
        {label: String.raw`\forall i`, text: 'Une contrainte par observation : \\(n\\) contraintes au total.'}
      ]
    },
    {
      match: String.raw`\begin{aligned}\min_{w,b,\xi}\quad&\frac12\|w\|^2+C\sum_{i=1}^{n}\xi_i\\\text{sous les contraintes}\quad&y_i(w\cdot x_i+b)\ge1-\xi_i,\\&\xi_i\ge0,\qquad\forall i,\qquad C>0.\end{aligned}`,
      tex: String.raw`\begin{aligned}\min_{w,b,\xi}\quad&\htmlClass{anat anat-1}{\frac12\|w\|^2}+\htmlClass{anat anat-2}{C\sum_{i=1}^{n}\xi_i}\\\text{sous les contraintes}\quad&\htmlClass{anat anat-3}{y_i(w\cdot x_i+b)\ge1-\xi_i},\\&\htmlClass{anat anat-4}{\xi_i\ge0},\qquad\forall i,\qquad C>0.\end{aligned}`,
      steps: [
        {label: String.raw`\tfrac12\|w\|^2`, text: 'Le même terme qu’en marge dure : une petite norme, donc une marge large.'},
        {label: String.raw`C\sum\xi_i`, text: 'Le coût des violations : la somme des relâchements \\(\\xi_i\\), pondérée par \\(C\\).'},
        {label: String.raw`\ge 1-\xi_i`, text: 'La contrainte relâchée : un point peut entrer dans la marge, ou passer du mauvais côté, en payant \\(\\xi_i\\).'},
        {label: String.raw`\xi_i\ge0`, text: 'Un relâchement n’est jamais négatif : \\(\\xi_i=0\\) pour les points au-delà de leur bord.'}
      ]
    }
  ];

  const labs = {
    risk: {
      file: 'perte.py', data: 'perte.csv',
      intro: 'Les neuf observations de l’expérience, ajustées par scikit-learn. Le résultat correspond au bouton « Ajuster les moindres carrés ».',
      code: String.raw`import pandas as pd
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_squared_error

donnees = pd.read_csv("perte.csv")
X, y = donnees[["x"]], donnees["y"]

modele = LinearRegression().fit(X, y)
w, b = modele.coef_[0], modele.intercept_

mse = mean_squared_error(y, modele.predict(X))
print(f"w = {w:.2f}   b = {b:.2f}")
print(f"MSE = {mse:.3f}   risque empirique = {mse / 2:.3f}")`,
      steps: [
        {lines: [5, 6], text: 'Les neuf observations : une entrée x et une cible y.'},
        {lines: [8, 9], text: 'LinearRegression minimise la somme des carrés des résidus et renvoie la pente w et l’ordonnée b.'},
        {lines: [11, 11], text: 'mean_squared_error calcule la MSE, sans facteur \\(\\tfrac12\\).'},
        {lines: [12, 13], text: 'Le risque empirique du cours, avec la perte \\(\\tfrac12(y-f(x))^{2}\\), vaut \\(\\mathrm{MSE}/2\\).'}
      ],
      output: 'w = 1.11   b = 1.02\nMSE = 0.283   risque empirique = 0.141'
    },
    generalization: {
      file: 'complexite.py', data: 'complexite.csv',
      intro: 'Les mêmes 16 points d’apprentissage et 45 points de validation, pour les degrés 1 à 10.',
      code: String.raw`import pandas as pd
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import PolynomialFeatures
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_squared_error

donnees = pd.read_csv("complexite.csv")
app = donnees[donnees["ensemble"] == "apprentissage"]
val = donnees[donnees["ensemble"] == "validation"]

for degre in range(1, 11):
    modele = make_pipeline(PolynomialFeatures(degre), LinearRegression())
    modele.fit(app[["x"]], app["y"])
    mse_app = mean_squared_error(app["y"], modele.predict(app[["x"]]))
    mse_val = mean_squared_error(val["y"], modele.predict(val[["x"]]))
    print(f"degré {degre:2d}   apprentissage {mse_app:.3f}   validation {mse_val:.3f}")`,
      steps: [
        {lines: [7, 9], text: 'La colonne « ensemble » sépare les points d’apprentissage et de validation.'},
        {lines: [11, 13], text: 'Pour chaque degré \\(d\\), PolynomialFeatures crée \\(x, x^{2}, \\dots, x^{d}\\) ; la régression est apprise sur l’apprentissage seulement.'},
        {lines: [14, 16], text: 'Le même modèle est évalué deux fois : sur les points vus, puis sur les points tenus à l’écart.'}
      ],
      output: 'degré  1   apprentissage 0.297   validation 0.292\ndegré  2   apprentissage 0.288   validation 0.304\ndegré  3   apprentissage 0.064   validation 0.110\ndegré  4   apprentissage 0.061   validation 0.101\ndegré  5   apprentissage 0.030   validation 0.109\ndegré  6   apprentissage 0.027   validation 0.135\ndegré  7   apprentissage 0.025   validation 0.096\ndegré  8   apprentissage 0.023   validation 0.276\ndegré  9   apprentissage 0.023   validation 1.255\ndegré 10   apprentissage 0.017   validation 114.968'
    },
    bias: {
      file: 'tirages.py', data: 'tirages.csv',
      intro: 'Les 30 échantillons de l’expérience : un modèle par échantillon, puis \\(\\text{biais}^{2}\\) et variance au point \\(x=0{,}25\\).',
      code: String.raw`import numpy as np
import pandas as pd
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import PolynomialFeatures
from sklearn.linear_model import LinearRegression

donnees = pd.read_csv("tirages.csv")
x0, degre = 0.25, 1
m_star_x0 = 0.4 + 1.2 * x0 + 0.65 * np.sin(4 * x0)

predictions = []
for _, tirage in donnees.groupby("tirage"):
    modele = make_pipeline(PolynomialFeatures(degre), LinearRegression())
    modele.fit(tirage[["x"]], tirage["y"])
    predictions.append(modele.predict(pd.DataFrame({"x": [x0]}))[0])

predictions = np.array(predictions)
print(f"biais² = {(predictions.mean() - m_star_x0) ** 2:.3f}")
print(f"variance = {predictions.var():.3f}")`,
      steps: [
        {lines: [7, 9], text: 'Les 30 tirages de 28 points, et la vraie relation \\(m^*\\), connue ici car les données sont simulées.'},
        {lines: [11, 15], text: 'Un modèle par tirage ; on garde sa prévision au point \\(x_0=0{,}25\\).'},
        {lines: [17, 19], text: '\\(\\text{Biais}^{2}\\) : écart entre la prévision moyenne et \\(m^*(x_0)\\). Variance : dispersion des 30 prévisions, divisée par 30.'}
      ],
      output: 'biais² = 0.243\nvariance = 0.011'
    },
    folds: {
      file: 'plis.py', data: 'plis.csv',
      intro: 'Les 30 observations et leurs cinq plis : scikit-learn réapprend le polynôme cinq fois, comme l’expérience.',
      code: String.raw`import pandas as pd
from sklearn.model_selection import PredefinedSplit, cross_val_score
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import PolynomialFeatures
from sklearn.linear_model import LinearRegression

donnees = pd.read_csv("plis.csv")
X, y = donnees[["x"]], donnees["y"]
plis = PredefinedSplit(donnees["pli"])

modele = make_pipeline(PolynomialFeatures(3), LinearRegression())
mse = -cross_val_score(modele, X, y, cv=plis, scoring="neg_mean_squared_error")

print("MSE par pli :", "  ".join(f"{m:.3f}" for m in mse))
print(f"MSE CV moyenne : {mse.mean():.3f}")`,
      steps: [
        {lines: [7, 9], text: 'La colonne « pli » fixe les blocs : PredefinedSplit reproduit exactement les cinq blocs de l’expérience.'},
        {lines: [11, 11], text: 'Le modèle : un polynôme de degré 3 ajusté par moindres carrés.'},
        {lines: [12, 12], text: 'cross_val_score réapprend le modèle sans chaque bloc. scikit-learn renvoie l’opposé de la MSE, un score à maximiser : d’où le signe moins.'},
        {lines: [14, 15], text: 'Les cinq MSE de blocs, puis leur moyenne : la MSE CV.'}
      ],
      output: 'MSE par pli : 0.057  1.053  0.147  0.062  0.090\nMSE CV moyenne : 0.282'
    },
    logistic: {
      file: 'logistique.py', data: 'animaux.csv',
      intro: 'Les mêmes 40 chats et chiens : 24 pour apprendre, 8 pour choisir C, 8 pour le test. Même objectif et mêmes unités que le récit ; ici les calculs gardent les coefficients non arrondis.',
      code: String.raw`import numpy as np
import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import log_loss, accuracy_score

donnees = pd.read_csv("animaux.csv")
def ensemble(role):
    partie = donnees[donnees["role"] == role]
    return partie[["x1", "x2"]].to_numpy(), partie["y"].to_numpy()

X_app, y_app = ensemble("train")
X_val, y_val = ensemble("validation")
print("Effectifs : apprentissage 24, validation 8, test 8")

# Même objectif que le récit : ½‖w‖² + C Σ BCE, biais non pénalisé.
candidats = []
for C in [0.01, 0.1, 1, 10]:
    modele = LogisticRegression(C=C, solver="lbfgs", tol=1e-10, max_iter=10000)
    modele.fit(X_app, y_app)
    perte_val = log_loss(y_val, modele.predict_proba(X_val), labels=[0, 1])
    candidats.append((perte_val, C, modele))
    print(f"C={C:g} : BCE validation = {perte_val:.3f}")

_, C_choisi, modele = min(candidats, key=lambda ligne: ligne[0])
w, b = modele.coef_[0], modele.intercept_[0]
print(f"C choisi : {C_choisi:g}")
print(f"w = ({w[0]:.2f}, {w[1]:.2f})   b = {b:.2f}")

# Deux décisions pour une même probabilité ; pas de réapprentissage.
p = modele.predict_proba(np.array([[7.0, 2.0]]))[0, 1]
print(f"Animal (7 kg, 2 cm) : probabilité estimée chien = {p:.3f}")
for t in [0.5, 0.7]:
    print(f"t={t:g} : classe prédite = {int(p >= t)}")

# Seuil 0.5 fixé avant le test ; aucune nouvelle sélection sur ce score.
X_test, y_test = ensemble("test")
p_test = modele.predict_proba(X_test)[:, 1]
print(f"Test final : BCE = {log_loss(y_test, p_test, labels=[0, 1]):.3f}")
print(f"Test final : {int(accuracy_score(y_test, p_test >= 0.5)*len(y_test))}/8 corrects")`,
      steps: [
        {lines: [6, 13], text: 'Le CSV garde exactement les animaux et leurs rôles du récit ; aucune nouvelle séparation.'},
        {lines: [15, 22], text: 'Apprendre chaque modèle sur les 24 animaux d’apprentissage ; comparer C sur la BCE des 8 animaux de validation.'},
        {lines: [24, 27], text: 'Retenir le C choisi ; les coefficients \\(w,b\\) restent appris sur l’apprentissage.'},
        {lines: [29, 33], text: 'predict_proba estime une probabilité. Les seuils \\(0{,}5\\) et \\(0{,}7\\) peuvent donner deux classes sans changer le modèle.'},
        {lines: [35, 39], text: 'Évaluer une seule fois le modèle retenu, avec le seuil fixé avant le test. Avec 8 animaux, le score est très incertain.'}
      ],
      output: 'Effectifs : apprentissage 24, validation 8, test 8\nC=0.01 : BCE validation = 0.509\nC=0.1 : BCE validation = 0.248\nC=1 : BCE validation = 0.159\nC=10 : BCE validation = 0.206\nC choisi : 1\nw = (1.37, -0.22)   b = -8.75\nAnimal (7 kg, 2 cm) : probabilité estimée chien = 0.593\nt=0.5 : classe prédite = 1\nt=0.7 : classe prédite = 0\nTest final : BCE = 0.183\nTest final : 7/8 corrects'
    },
    svm: {
      file: 'svm.py', data: 'svm.csv',
      intro: 'Les points de l’étape 6, avec \\(A\\) en \\((-1{,}6\\,;\\,0{,}2)\\) et \\(C=1\\) : scikit-learn retrouve la même frontière.',
      code: String.raw`import numpy as np
import pandas as pd
from sklearn.svm import SVC

donnees = pd.read_csv("svm.csv")
X, y = donnees[["x1", "x2"]].to_numpy(), donnees["y"].to_numpy()

modele = SVC(kernel="linear", C=1.0, tol=1e-6).fit(X, y)
w, b = np.round(modele.coef_[0], 6) + 0.0, modele.intercept_[0]

xi = np.maximum(0, 1 - y * modele.decision_function(X))
print(f"w = ({w[0]:.3f}, {w[1]:.3f})   b = {b:.3f}")
print(f"½‖w‖² = {0.5 * w @ w:.2f}   Σξ = {xi.sum():.2f}")
print("vecteurs de support :", modele.support_)`,
      steps: [
        {lines: [5, 6], text: 'Neuf points : les huit du récit et le point A, de classe +1.'},
        {lines: [8, 9], text: 'SVC à noyau linéaire résout le même problème que le récit : perte charnière, pénalité \\(\\tfrac12\\|w\\|^{2}\\), biais libre.'},
        {lines: [11, 11], text: '\\(\\xi_i=\\max(0,\\,1-y_i\\,g(x_i))\\) se calcule à partir des scores \\(g(x_i)\\).'},
        {lines: [12, 14], text: 'Les valeurs de l’étape 6 : \\(\\tfrac12\\|w\\|^{2}=0{,}22\\) et \\(\\sum_i\\xi_i=2{,}40\\), avec cinq vecteurs de support (indices à partir de 0).'}
      ],
      output: 'w = (0.667, 0.000)   b = 0.333\n½‖w‖² = 0.22   Σξ = 2.40\nvecteurs de support : [1 2 3 4 8]'
    }
  };

  const pitfalls = {
    'fondements/fonction-perte': [
      {
        title: 'Attention au facteur \\(\\tfrac12\\)', target: {demo: 'risk'},
        steps: ['Cliquez sur « Ajuster les moindres carrés ».', 'Relevez la MSE et le risque empirique.'],
        question: 'Quel lien entre les deux valeurs ? Le facteur \\(\\tfrac12\\) change-t-il la droite apprise ?',
        why: 'Les bibliothèques n’utilisent pas toutes la même convention : scikit-learn renvoie la MSE, sans facteur \\(\\tfrac12\\). Comparer des pertes demande de vérifier cette convention.',
        solution: '\\(\\mathrm{MSE}=0{,}283\\) et risque empirique \\(=0{,}141\\) : avec la perte \\(\\tfrac12(y-f(x))^{2}\\), le risque empirique vaut la moitié de la MSE. Le facteur \\(\\tfrac12\\) change l’échelle de la perte, pas le minimiseur : la droite apprise est la même.'
      },
      {
        title: 'Un grand résidu pèse au carré', target: {demo: 'risk'},
        steps: ['Cliquez sur « Réinitialiser » (\\(w=0{,}55\\) et \\(b=1{,}40\\)).', 'Repérez les plus grands carrés.'],
        question: 'Si un résidu double, comment évolue sa contribution à la MSE ?',
        why: 'La perte quadratique donne beaucoup de poids aux points éloignés de la droite : quelques valeurs aberrantes peuvent déplacer l’ajustement.',
        solution: 'Sa contribution est multipliée par quatre. Ici, les points de droite (\\(x=6\\) à \\(8\\)) ont les plus grands résidus, jusqu’à 4,4 : leurs carrés dominent la somme.'
      }
    ],
    'fondements/biais-variance': [
      {
        title: 'Une erreur d’apprentissage faible ne prouve rien', target: {demo: 'generalization'},
        steps: ['Dans « Faire varier la complexité », placez le degré sur 3.', 'Passez ensuite au degré 9.'],
        question: 'Que deviennent la MSE d’apprentissage et la MSE de validation ?',
        why: 'Sur les mêmes données, les moindres carrés dans des familles polynomiales emboîtées ne peuvent pas augmenter la MSE d’apprentissage avec le degré. Cette propriété ne garantit pas une meilleure généralisation.',
        solution: 'La MSE d’apprentissage baisse (0,064 → 0,023) tandis que la MSE de validation explose (0,110 → 1,255). Le polynôme de degré 9 suit le bruit des 16 points : c’est du sur-ajustement.'
      },
      {
        title: 'La variance se lit entre les modèles', target: {demo: 'bias'},
        steps: ['Dans « Répéter l’apprentissage », passez du degré 1 au degré 7.', 'Observez la dispersion des 30 courbes au point \\(x=0{,}25\\).'],
        question: 'Lequel des deux termes augmente, lequel diminue ?',
        why: 'La variance ne mesure pas l’écart aux points d’un échantillon : elle mesure combien la prévision change quand l’échantillon change.',
        solution: 'Le \\(\\text{biais}^{2}\\) chute (\\(0{,}243\\to0{,}003\\)) car un polynôme de degré 7 peut suivre la vraie relation ; la variance augmente (\\(0{,}011\\to0{,}035\\)) car les 30 modèles, appris sur des échantillons différents, s’écartent davantage.'
      }
    ],
    'fondements/estimation-risque': [
      {
        title: 'Un seul bloc peut tromper', target: {demo: 'folds'},
        steps: ['Gardez le degré 3.', 'Cliquez sur les blocs 1 à 5 et relevez la MSE de chaque pli.'],
        question: 'Quel pli s’écarte des autres ? Que faut-il en retenir ?',
        why: 'Les scores varient d’un bloc à l’autre. La CV combine les évaluations hors apprentissage ; un seul découpage ne suffit pas à montrer combien l’estimation varierait sur d’autres découpages.',
        solution: 'Le pli 2 donne 1,053 alors que les autres restent entre 0,057 et 0,147. La moyenne des cinq plis vaut 0,282. Pour étudier sa dépendance au découpage, il faut répéter la CV sur d’autres partitions.'
      },
      {
        title: 'Choisir sur la validation, évaluer sur le test', target: {demo: 'folds'},
        steps: ['Faites varier le degré de 1 à 6.', 'Notez la MSE CV moyenne pour chaque degré.'],
        question: 'Quel degré choisir ? Peut-on annoncer cette MSE comme performance finale ?',
        why: 'Un score utilisé pour choisir un modèle peut être optimiste : on retient le candidat qui paraît le meilleur sur ces données.',
        solution: 'Le degré 5 minimise la MSE CV moyenne (0,146). Ce score a servi au choix et peut être optimiste. La performance finale s’évalue sur un jeu de test réservé, jamais utilisé pendant la sélection.'
      }
    ],
    'lineaires/marge-dure': [
      {
        title: 'Le score n’est pas une distance', target: {story: 1},
        steps: ['Ouvrez l’étape 2 du récit SVM.', 'Placez le curseur « Échelle du score » sur 3.'],
        question: 'Que deviennent le score de P et sa distance à la frontière ?',
        why: 'Le score \\(g(x)\\) dépend de l’échelle de \\((w,b)\\) ; la distance non. C’est pourquoi on fixe l’échelle avec \\(\\min_i y_i\\,g(x_i)=1\\) avant de maximiser la marge.',
        solution: 'Le score de P passe à 3, la distance reste 1. Multiplier (w, b) par un réel positif ne change ni la frontière, ni les classes prédites, ni les distances.'
      },
      {
        title: 'Seuls les vecteurs de support comptent', target: {story: 3},
        steps: ['Ouvrez l’étape 4 du récit SVM.', 'Décochez « Garder le point éloigné N1 », puis déplacez le support S de 1 à 1,9.'],
        question: 'Laquelle des deux actions modifie la frontière ?',
        why: 'La solution s’écrit \\(w=\\sum_i\\alpha_iy_ix_i\\) : les points avec \\(\\alpha_i=0\\) n’y contribuent pas. Ici, N1 est du bon côté, au-delà de la marge. En marge souple, un point mal classé peut être un vecteur de support même très loin de la frontière.',
        solution: 'Retirer N1 ne change rien (\\(b=0\\), largeur \\(2{,}00\\)) : N1 n’est pas un vecteur de support. Déplacer S élargit la marge jusqu’à \\(2{,}90\\) et décale la frontière (\\(b=-0{,}31\\)).'
      },
      {
        title: 'Violer la marge n’est pas mal classer', target: {story: 4},
        steps: ['Ouvrez l’étape 5 du récit SVM.', 'Faites glisser le score du point \\(A\\) de \\(2\\) à \\(-1{,}4\\).'],
        question: 'À partir de quel score \\(A\\) est-il mal classé ? Que vaut alors \\(\\xi\\) ?',
        why: 'La perte charnière pénalise aussi les points bien classés trop proches de la frontière : \\(\\xi>0\\) ne signifie pas une erreur de classe.',
        solution: '\\(A\\) est mal classé dès que \\(g(A)<0\\) ; \\(\\xi\\) dépasse alors \\(1\\). Entre \\(0\\) et \\(1\\), \\(A\\) est bien classé mais viole la marge (par exemple \\(g(A)=0{,}4\\) donne \\(\\xi=0{,}6\\)).'
      }
    ]
  };
  pitfalls['lineaires/svm-marge'] = pitfalls['lineaires/marge-dure'];

  // ---------- helpers ----------
  const escape = s => String(s).replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  const num = v => String(+v.toPrecision(15));
  function katexInline(tex) {
    if (!root.katex) return escape(tex);
    try { return root.katex.renderToString(tex, {throwOnError: false, strict: false}); } catch (_) { return escape(tex); }
  }

  function csv(name) {
    if (name === 'animaux.csv') return 'id,x1,x2,y,role\n' + root.Animals.animals.map(a => [a.id, a.x1, a.x2, a.y, a.role].join(',')).join('\n') + '\n';
    const c = root.SID34Demos?.compute;
    if (!c) return '';
    if (name === 'perte.csv') return 'x,y\n' + c.riskPoints.map(p => num(p.x) + ',' + num(p.y)).join('\n') + '\n';
    if (name === 'complexite.csv') return 'ensemble,x,y\n' + c.train.map(p => 'apprentissage,' + num(p.x) + ',' + num(p.y)).concat(c.validation.map(p => 'validation,' + num(p.x) + ',' + num(p.y))).join('\n') + '\n';
    if (name === 'tirages.csv') return 'tirage,x,y\n' + c.samples.flatMap((s, i) => s.map(p => (i + 1) + ',' + num(p.x) + ',' + num(p.y))).join('\n') + '\n';
    if (name === 'plis.csv') return 'pli,x,y\n' + c.cvData.map(p => (p.fold + 1) + ',' + num(p.x) + ',' + num(p.y)).join('\n') + '\n';
    if (name === 'svm.csv') { const pts = [...root.SVMStory.data(), {x: -1.6, z: .2, y: 1}]; return 'x1,x2,y\n' + pts.map(p => p.x + ',' + p.z + ',' + p.y).join('\n') + '\n'; }
    return '';
  }

  // Minimal Python highlighting: comments, strings, keywords, numbers, calls.
  const pyToken = /(#.*$)|(f?"(?:[^"\\]|\\.)*"|f?'(?:[^'\\]|\\.)*')|\b(import|from|as|for|in|if|else|elif|return|def|with|not|and|or|None|True|False)\b|\b(\d+(?:\.\d+)?(?:e-?\d+)?)\b|\b([A-Za-z_]\w*)(?=\()/g;
  function highlight(line) {
    let out = '', last = 0;
    line.replace(pyToken, (m, com, str, kw, n, fn, at) => {
      out += escape(line.slice(last, at));
      out += com ? '<span class="tok-com">' + escape(com) + '</span>' : str ? '<span class="tok-str">' + escape(str) + '</span>' : kw ? '<span class="tok-kw">' + kw + '</span>' : n ? '<span class="tok-num">' + n + '</span>' : '<span class="tok-fn">' + fn + '</span>';
      last = at + m.length; return m;
    });
    return out + escape(line.slice(last));
  }

  // ---------- formula anatomy ----------
  function findAnatomy(tex) { return anatomy.find(a => a.match === tex) || null; }
  function renderAnatomy(section, mathEl, entry) {
    if (!root.katex) return false;
    try { root.katex.render(entry.tex, mathEl, {displayMode: true, throwOnError: true, strict: false, trust: ctx => ctx.command === '\\htmlClass'}); }
    catch (_) { return false; }
    section.classList.add('has-anatomy');
    const list = document.createElement('ol'); list.className = 'anatomy';
    list.innerHTML = entry.steps.map((s, i) => '<li><button type="button" data-anat="' + (i + 1) + '" aria-pressed="false"><span class="step-n">' + (i + 1) + '</span><span class="anat-label">' + katexInline(s.label) + '</span><span class="anat-text">' + escape(s.text) + '</span></button></li>').join('');
    let pinned = 0;
    const show = n => {
      section.classList.toggle('anat-focus', !!n);
      mathEl.querySelectorAll('.anat').forEach(el => el.classList.toggle('is-on', !!n && el.classList.contains('anat-' + n)));
      list.querySelectorAll('button').forEach(b => b.classList.toggle('is-on', +b.dataset.anat === n));
    };
    list.querySelectorAll('button').forEach(b => {
      const n = +b.dataset.anat;
      b.addEventListener('mouseenter', () => show(n));
      b.addEventListener('mouseleave', () => show(pinned));
      b.addEventListener('focus', () => show(n));
      b.addEventListener('blur', () => show(pinned));
      b.addEventListener('click', () => { pinned = pinned === n ? 0 : n; list.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', String(+x.dataset.anat === pinned))); show(pinned); });
    });
    mathEl.after(list);
    return true;
  }

  // ---------- TD ----------
  // Python exercises per chapter. Each one runs a lab, then asks questions whose answers
  // were checked against scikit-learn (scripts/check-labs.cjs runs the reference code).
  const td = {
    fondements: [
      {id: '1.1', lab: 'risk', lesson: 'fonction-perte', title: 'Perte quadratique et moindres carrés', questions: [
        {q: 'Exécutez le code. Retrouvez-vous les valeurs affichées par le bouton « Ajuster les moindres carrés » ?', a: 'Oui : \\(w=1{,}11\\), \\(b=1{,}02\\), \\(\\mathrm{MSE}=0{,}283\\) et risque empirique \\(=0{,}141\\).'},
        {q: 'Ajoutez une ligne qui calcule la MSE de la droite de départ, \\(w=0{,}55\\) et \\(b=1{,}40\\).', a: 'mean_squared_error(y, 1.40 + 0.55 * donnees["x"]) donne 5,817, la valeur affichée par l’expérience après « Réinitialiser ». Les moindres carrés la divisent par plus de 20.'}
      ]},
      {id: '1.2', lab: 'generalization', lesson: 'biais-variance', title: 'Complexité et sur-ajustement', questions: [
        {q: 'Quel degré minimise la MSE de validation ? Et la MSE d’apprentissage ?', a: 'La validation est minimale au degré 7 (0,096) ; l’apprentissage ne cesse de baisser jusqu’au degré 10 (0,017). Le meilleur modèle sur l’apprentissage n’est pas le meilleur pour généraliser.'},
        {q: 'Pourquoi la MSE de validation du degré 10 dépasse-t-elle 100 ?', a: 'Avec 11 coefficients pour 16 points, le polynôme passe très près des points d’apprentissage et oscille fortement ailleurs, surtout près des bords de l’intervalle. Les points de validation situés dans ces zones reçoivent des prévisions très éloignées.'}
      ]},
      {id: '1.3', lab: 'bias', lesson: 'biais-variance', title: 'Biais et variance par simulation', questions: [
        {q: 'Remplacez degre = 1 par degre = 7. Que deviennent les deux termes ?', a: '\\(\\text{biais}^{2}=0{,}003\\) et variance \\(=0{,}035\\) : le biais chute, la variance augmente, comme dans l’expérience « Répéter l’apprentissage ».'},
        {q: 'predictions.var() divise par 30. Que changerait predictions.var(ddof=1) ?', a: 'Une division par 29, celle de l’estimateur sans biais de la variance : la valeur serait multipliée par 30/29. L’expérience divise par 30.'}
      ]},
      {id: '1.4', lab: 'folds', lesson: 'estimation-risque', title: 'Validation croisée à cinq blocs', questions: [
        {q: 'Remplacez PolynomialFeatures(3) par PolynomialFeatures(5).', a: 'La MSE CV moyenne descend à 0,146 : sur ces blocs, le degré 5 est le meilleur des degrés 1 à 6.'},
        {q: 'Remplacez PredefinedSplit(donnees["pli"]) par KFold(5, shuffle=True, random_state=0), en important KFold depuis sklearn.model_selection. Que devient la MSE CV moyenne ?', a: '0,133 au lieu de 0,282 : les blocs ont changé. Avec 30 observations, l’estimation dépend fortement du découpage ; répéter la validation croisée sur plusieurs découpages (RepeatedKFold) réduit cette dépendance.'}
      ]}
    ],
    lineaires: [
      {id: '2.2', lab: 'logistic', lesson: 'logistique', title: 'Chats et chiens : probabilité et décision', questions: [
        {q: 'Pour l’animal de 7 kg et 2 cm, pourquoi les deux seuils donnent-ils des classes différentes ?', a: 'La probabilité calculée avec les coefficients non arrondis vaut environ \\(0{,}593\\) ; le calcul à la main utilise des coefficients arrondis et donne environ \\(0{,}60\\). Dans les deux cas, elle dépasse \\(0{,}5\\), mais pas \\(0{,}7\\). La classe change, pas le modèle.'},
        {q: 'Où sont appris w et b ? Où est choisi C ? Le test sert-il à choisir le seuil ?', a: '\\(w,b\\) sont appris sur les 24 animaux d’apprentissage ; \\(C\\) est choisi sur les 8 animaux de validation. Le seuil \\(0{,}5\\) est fixé avant l’évaluation finale : le test ne sert pas à choisir le seuil.'}
      ]},
      {id: '2.1', lab: 'svm', lesson: 'marge-dure', title: 'SVM linéaire avec scikit-learn', questions: [
        {q: 'Remplacez C=1.0 par C=0.01. Que deviennent \\(\\tfrac12\\|w\\|^{2}\\), \\(\\sum_i\\xi_i\\) et le nombre de vecteurs de support ?', a: 'Sur ces données : \\(\\tfrac12\\|w\\|^{2}\\approx0{,}01\\), \\(\\sum_i\\xi_i=6{,}69\\) et 8 vecteurs de support sur 9. Un petit \\(C\\) donne plus de poids relatif à la norme. Aux solutions optimales sur les mêmes données, augmenter \\(C\\) fait décroître ou maintenir \\(\\sum_i\\xi_i\\) ; cela ne garantit aucune variation de chaque \\(\\xi_i\\), du nombre d’erreurs ou du nombre de vecteurs de support.'},
        {q: 'Gardez C=1.0 et placez A du bon côté : ajoutez X[8, 0] = 2.4 juste avant l’apprentissage. Combien reste-t-il de vecteurs de support ?', a: 'Deux, les indices 3 et 4 (N4 et P1) : \\(\\sum_i\\xi_i=0\\) et \\(\\tfrac12\\|w\\|^{2}=0{,}50\\). Les données redeviennent séparables et on retrouve la solution à marge dure du récit, \\(w=(1,0)\\) et \\(b=0\\).'}
      ]}
    ]
  };
  const tdFor = kind => { for (const [chapter, list] of Object.entries(td)) { const ex = list.find(e => e.lab === kind); if (ex) return {chapter, ex}; } return null; };

  // Runs on the shared in-page Python kernel defined in td.js.
  async function runPython(code, files, onStatus) {
    const result = await root.SID34Kernel.run(code, {files, status: onStatus});
    return {ok: result.ok, out: result.out};
  }

  function download(name, text, type) {
    const url = URL.createObjectURL(new Blob([text], {type}));
    const a = document.createElement('a'); a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function codeLines(code) { return code.split('\n').map((l, i) => '<span class="ln" data-l="' + (i + 1) + '">' + (highlight(l) || ' ') + '</span>').join(''); }

  function renderExercise(ex, chapterNumber, lessonTitle) {
    const lab = labs[ex.lab];
    const el = document.createElement('article');
    el.className = 'td-exercise'; el.id = 'td-' + ex.id.replace('.', '-');
    el.innerHTML =
      '<header class="td-head"><h2>' + escape(ex.title) + '</h2>' +
      '<p>' + escape(lab.intro) + ' <a href="#' + escape(chapterNumber) + '/' + escape(ex.lesson) + '">Partie : ' + escape(lessonTitle) + ' →</a></p></header>' +
      '<div class="code-lab"><div class="code-lab-body"><ol class="code-steps">' + lab.steps.map((s, i) => '<li><button type="button" data-lines="' + s.lines.join('-') + '"><span class="step-n">' + (i + 1) + '</span><span>' + escape(s.text) + '</span></button></li>').join('') + '</ol>' +
      '<div class="code-pane"><div class="code-file"><span>' + escape(lab.file) + '</span><span class="code-mode">lecture</span></div><pre class="code" tabindex="0"><code>' + codeLines(lab.code) + '</code></pre><textarea class="code-editor" spellcheck="false" autocapitalize="off" autocomplete="off" aria-label="Code Python modifiable" aria-description="Tab indente. Maj + Tab, ou Échap puis Tab, permet de quitter le code. Ctrl ou Cmd + Entrée exécute le code." hidden></textarea><p class="code-editor-help" hidden>Tab indente ; Maj + Tab, ou Échap puis Tab, permet de quitter le code. Ctrl ou Cmd + Entrée exécute le code.</p></div></div>' +
      '<div class="code-toolbar"><button type="button" class="primary-button" data-run>' + root.CourseIcons.icon('run') + '<span>Exécuter</span></button><button type="button" class="secondary-button" data-edit>Modifier le code</button><button type="button" class="secondary-button" data-reset hidden>Revenir au code initial</button>' +
      '<span class="code-toolbar-gap"></span><button type="button" class="text-button" data-copy>' + root.CourseIcons.icon('copy') + '<span>Copier</span></button><button type="button" class="text-button" data-get-py>' + escape(lab.file) + ' ↓</button><button type="button" class="text-button" data-get-csv>' + escape(lab.data) + ' ↓</button></div>' +
      '<div class="code-output"><div class="code-output-col"><span class="eyebrow">Votre sortie</span><pre class="run-output" aria-live="polite">Cliquez sur « Exécuter ».</pre></div><div class="code-output-col"><span class="eyebrow">Sortie attendue</span><pre>' + escape(lab.output) + '</pre></div></div></div>' +
      '<section class="td-questions"><h3>Questions</h3><ol>' + ex.questions.map(q => '<li><p>' + escape(q.q) + '</p><details><summary>Voir la réponse</summary><p>' + escape(q.a) + '</p></details></li>').join('') + '</ol></section>';

    const code = el.querySelector('code'), editor = el.querySelector('.code-editor'), pre = el.querySelector('pre.code');
    const mode = el.querySelector('.code-mode'), output = el.querySelector('.run-output'), runButton = el.querySelector('[data-run]');
    let editing = false;
    const current = () => editing ? editor.value : lab.code;
    const mark = (range, on) => { if (editing) return; const [a, b] = range.split('-').map(Number); code.querySelectorAll('.ln').forEach(l => { const n = +l.dataset.l; l.classList.toggle('is-on', on && n >= a && n <= b); }); el.classList.toggle('lines-focus', on); };
    el.querySelectorAll('.code-steps button').forEach(b => {
      ['mouseenter', 'focus'].forEach(t => b.addEventListener(t, () => mark(b.dataset.lines, true)));
      ['mouseleave', 'blur'].forEach(t => b.addEventListener(t, () => mark(b.dataset.lines, false)));
    });
    function setEditing(on) {
      editing = on; editor.hidden = !on; pre.hidden = on; mode.textContent = on ? 'modifiable' : 'lecture';
      el.querySelector('.code-editor-help').hidden = !on;
      el.querySelector('[data-edit]').hidden = on; el.querySelector('[data-reset]').hidden = !on;
      el.classList.toggle('is-editing', on);
      if (on) { editor.value = editor.value || lab.code; editor.style.height = (lab.code.split('\n').length * 1.6 + 2) + 'em'; editor.focus(); }
    }
    root.SID34TD.bindEditorKeys(editor, {run: () => runButton.click()});
    el.querySelector('[data-edit]').addEventListener('click', () => setEditing(true));
    el.querySelector('[data-reset]').addEventListener('click', () => { editor.value = lab.code; setEditing(false); });
    el.querySelector('[data-copy]').addEventListener('click', async event => {
      const b = event.currentTarget;
      try { await navigator.clipboard.writeText(current()); b.lastChild.textContent = 'Copié'; } catch (_) { b.lastChild.textContent = 'Copie impossible'; }
      setTimeout(() => { b.lastChild.textContent = 'Copier'; }, 1800);
    });
    el.querySelector('[data-get-py]').addEventListener('click', () => download(lab.file, current() + '\n', 'text/x-python'));
    el.querySelector('[data-get-csv]').addEventListener('click', () => download(lab.data, csv(lab.data), 'text/csv'));
    runButton.addEventListener('click', async () => {
      runButton.disabled = true; el.classList.remove('run-match', 'run-error');
      const result = await runPython(current(), {[lab.data]: csv(lab.data)}, text => { output.textContent = text; }).catch(error => ({ok: false, out: error.message}));
      output.textContent = result.out || '(aucune sortie)';
      el.classList.toggle('run-error', !result.ok);
      el.classList.toggle('run-match', result.ok && result.out.trim() === lab.output);
      runButton.disabled = false; runButton.lastChild.textContent = 'Exécuter à nouveau';
    });
    return el;
  }

  // The scikit-learn code behind each experiment, listed on the chapter's TD page.
  function renderLabs(chapter) {
    const wrap = document.createElement('div');
    wrap.className = 'lab-list';
    for (const ex of td[chapter.id] || []) {
      const lesson = chapter.lessons.find(l => l.id === ex.lesson);
      const details = document.createElement('details');
      details.className = 'lab-item';
      details.innerHTML = '<summary><span class="lab-title">' + escape(ex.title) + '</span><span class="lab-lesson">' + escape(lesson ? lesson.title : '') + '</span></summary>';
      details.appendChild(renderExercise(ex, chapter.id, lesson ? lesson.title : ''));
      wrap.appendChild(details);
    }
    return wrap;
  }

  // ---------- pitfalls ----------
  const storeKey = 'sid34-pitfalls-2026';
  function loadMarks() { try { return JSON.parse(localStorage.getItem(storeKey) || '{}') || {}; } catch (_) { return {}; } }
  function saveMarks(marks) { try { localStorage.setItem(storeKey, JSON.stringify(marks)); } catch (_) {} }
  const statusLabel = {todo: 'À faire', done: 'Réussi', review: 'À revoir'};

  function goTo(target, scope) {
    let el = null;
    if (target.demo) el = scope.querySelector('[data-demo-kind="' + target.demo + '"]');
    if (target.story !== undefined) el = scope.querySelector('.svm-story');
    if (!el) return;
    let details = el.closest('details');
    while (details) { details.open = true; details = details.parentElement?.closest('details'); }
    if (target.story !== undefined) {
      el.dispatchEvent(new CustomEvent('story:goto', {detail: target.story}));
      const step = el.querySelector('.svm-step[data-stage="' + target.story + '"]');
      (el.classList.contains('scroll-story') && step ? step : el).scrollIntoView({behavior: 'smooth', block: el.classList.contains('scroll-story') ? 'center' : 'start'});
    } else el.scrollIntoView({behavior: 'smooth', block: 'center'});
  }
  // A quiz opened from the TD page jumps to its lesson, then to the experiment.
  let pending = null;
  function consumePending(scope) { if (!pending) return; const target = pending; pending = null; setTimeout(() => goTo(target, scope), 350); }

  function renderPitfalls(key, scope, options = {}) {
    const items = pitfalls[key];
    if (!items) return null;
    const marks = loadMarks();
    const el = document.createElement('section');
    el.className = 'pitfalls' + (options.external ? ' pitfalls-compact' : '');
    if (!options.external) el.id = 'pieges';
    el.innerHTML = (options.external ? '<h3>' + escape(options.heading) + '</h3>' : '<h2 class="pitfalls-title">' + root.CourseIcons.icon('pitfall') + 'Pièges à éviter</h2><p class="pitfalls-intro">Des erreurs fréquentes, à vérifier vous-même avec les expériences de la partie. Votre suivi reste sur cet appareil.</p>') + '<ol class="pitfall-list">' +
      items.map((p, i) => {
        const id = key + '#' + (i + 1), status = marks[id] || 'todo';
        return '<li class="pitfall" data-id="' + escape(id) + '" data-status="' + status + '"><details><summary><span class="step-n">' + (i + 1) + '</span><span class="pitfall-title">' + escape(p.title) + '</span><span class="pitfall-status">' + statusLabel[status] + '</span></summary>' +
          '<div class="pitfall-body"><div class="pitfall-col"><h4>À faire</h4><ol class="pitfall-steps">' + p.steps.map(s => '<li>' + escape(s) + '</li>').join('') + '</ol>' +
          '<p class="pitfall-question">' + escape(p.question) + '</p><button type="button" class="text-button" data-goto>' + (p.target.story !== undefined ? 'Aller au récit SVM' : 'Aller à l’expérience') + (options.external ? ' →' : ' ↑') + '</button></div>' +
          '<div class="pitfall-col"><h4>Pourquoi c’est important</h4><p>' + escape(p.why) + '</p>' +
          '<details class="pitfall-solution"><summary>' + root.CourseIcons.icon('solution') + 'Voir la solution</summary><p>' + escape(p.solution) + '</p></details>' +
          '<div class="pitfall-actions"><button type="button" class="secondary-button" data-mark="review">À revoir</button><button type="button" class="primary-button" data-mark="done">Réussi</button></div></div></div></details></li>';
      }).join('') + '</ol>';
    el.querySelectorAll('.pitfall').forEach((li, i) => {
      li.querySelector('[data-goto]').addEventListener('click', () => {
        if (options.external) { pending = items[i].target; root.location.hash = key; }
        else goTo(items[i].target, scope);
      });
      li.querySelectorAll('[data-mark]').forEach(b => b.addEventListener('click', () => {
        const all = loadMarks(), id = li.dataset.id, value = b.dataset.mark;
        all[id] = all[id] === value ? 'todo' : value; saveMarks(all);
        li.dataset.status = all[id]; li.querySelector('.pitfall-status').textContent = statusLabel[all[id]];
      }));
    });
    return el;
  }

  const pitfallCount = key => (pitfalls[key] || []).length;

  root.SID34Teaching = {anatomy, labs, pitfalls, td, tdFor, findAnatomy, renderAnatomy, renderPitfalls, renderLabs, consumePending, pitfallCount, csv, highlight};
  if (typeof module !== 'undefined') module.exports = root.SID34Teaching;
})(typeof window !== 'undefined' ? window : globalThis);
