window.SID34_CHAPTER_1 = {
  "id": "fondements",
  "number": "01",
  "title": "Fondements de l’apprentissage statistique",
  "subtitle": "Introduction générale, cadre mathématique de l’apprentissage statistique supervisé et catégorisation des méthodes.",
  "duration": 90,
  "lessons": [
    {
      "id": "introduction-generale",
      "title": "Introduction générale",
      "duration": 20,
      "intro": "Contexte, problématiques et notations : situer l’apprentissage statistique avant de construire son cadre mathématique.",
      "objective": "Distinguer les objectifs et les cadres d’apprentissage, puis reconnaître les objets et les notations du cours.",
      "blocks": [
        {
          "type": "table",
          "title": "Vue d’ensemble SID34",
          "headers": [
            "Chapitre",
            "Contenu"
          ],
          "rows": [
            [
              "1",
              "Fondements de l’apprentissage statistique"
            ],
            [
              "2",
              "Algorithmes linéaires"
            ],
            [
              "3",
              "Algorithmes non linéaires"
            ],
            [
              "4",
              "Agrégation"
            ],
            [
              "5",
              "Cycle ML & Métriques d’évaluation"
            ]
          ]
        },
        {
          "type": "prose",
          "title": "Plan du cours",
          "html": "<ol><li><strong>Introduction générale :</strong> contexte, problématiques et vocabulaire.</li><li><strong>Cadre mathématique de l’apprentissage statistique supervisé :</strong> régression et discrimination, perte, risque, décomposition de l’erreur et estimation du risque.</li><li><strong>Catégorisation :</strong> organiser les méthodes et comprendre la progression du cours.</li></ol>"
        },
        {
          "type": "prose",
          "title": "Contexte",
          "html": "<p>L’<strong>apprentissage statistique</strong> (<em>statistical learning</em>) étudie comment estimer des dépendances à partir d’un ensemble de données et comment modéliser ou comprendre des jeux de données complexes.</p><blockquote><p>« … explores way of estimating functional dependency from a given collection of data » — Vapnik, 2000.</p><p>« … a set of tools for modelling and understanding complex datasets » — James et al., 2013.</p></blockquote>"
        },
        {
          "type": "prose",
          "title": "Deux approches",
          "html": "<p>Selon l’objectif, on peut privilégier un <strong>modèle interprétable</strong>, avec une complexité maîtrisée, ou une <strong>bonne précision prédictive</strong>, quitte à employer un modèle plus complexe.</p><p>Ces perspectives sont complémentaires : l’interprétation des modèles peut s’appuyer sur des scores d’importance des variables, et un algorithme de prévision doit aussi être étudié à travers ses propriétés statistiques — biais, variance, convergence.</p>"
        },
        {
          "type": "callout",
          "title": "Précision sur le support",
          "html": "<p>Bien expliquer une relation ne garantit pas, à lui seul, une bonne prédiction sur de nouvelles données. L’explication et la prévision sont des objectifs complémentaires dont la qualité doit être évaluée séparément.</p>"
        },
        {
          "type": "prose",
          "title": "Apprentissage Statistique vs Machine Learning",
          "html": "<p>Le <strong>machine learning</strong> s’est développé au sein de l’intelligence artificielle ; l’<strong>apprentissage statistique</strong> au sein de la statistique. Les deux domaines se recouvrent largement et traitent des problèmes supervisés et non supervisés.</p><ul><li>Le machine learning met souvent l’accent sur les applications à grande échelle et la précision prédictive.</li><li>L’apprentissage statistique met souvent l’accent sur les modèles, leur interprétabilité et leur précision.</li></ul><p>La frontière est devenue floue et les interactions sont fortes. Le terme « machine learning » bénéficie également d’une forte visibilité.</p>"
        },
        {
          "type": "table",
          "title": "Problématiques associées à l’apprentissage",
          "headers": [
            "Problématique",
            "Objectif"
          ],
          "rows": [
            [
              "Apprentissage supervisé",
              "Prédire une sortie à partir d’entrées."
            ],
            [
              "Apprentissage non supervisé",
              "Établir une typologie des observations."
            ],
            [
              "Règles d’association",
              "Identifier des liens entre produits ou événements."
            ],
            [
              "Systèmes de recommandation",
              "Prédire les produits susceptibles d’intéresser un utilisateur."
            ]
          ]
        },
        {
          "type": "table",
          "title": "Notations et significations",
          "headers": [
            "Notation",
            "Signification"
          ],
          "rows": [
            [
              "\\(\\mathcal{X}\\)",
              "Espace des entrées : features, prédicteurs."
            ],
            [
              "\\(\\mathcal{Y}\\)",
              "Espace des sorties : réponse, étiquette."
            ],
            [
              "\\(X,\\ Y\\)",
              "Variables aléatoires prenant leurs valeurs dans \\(\\mathcal{X}\\) et \\(\\mathcal{Y}\\)."
            ],
            [
              "\\((X,Y)\\)",
              "Couple aléatoire décrivant un individu observé."
            ],
            [
              "\\(D_n\\)",
              "Échantillon aléatoire d’apprentissage de \\(n\\) couples."
            ],
            [
              "\\((x_i,y_i)\\)",
              "Réalisation observée du couple \\((X_i,Y_i)\\)."
            ],
            [
              "\\(f\\)",
              "Fonction de prévision candidate ; \\(\\hat f\\) désigne celle apprise sur les données."
            ],
            [
              "\\(y_i,\\ \\hat y_i\\)",
              "Sortie observée et sortie prédite : \\(\\hat y_i=\\hat f(x_i)\\)."
            ],
            [
              "\\(g(x)\\)",
              "Score réel d’un classifieur ; une règle de décision le transforme en classe \\(\\hat y\\)."
            ],
            [
              "\\(\\ell\\)",
              "Fonction de perte : mesure le coût d’une erreur de prévision."
            ],
            [
              "\\(\\mathcal{R}(f)\\)",
              "Risque : perte moyenne sur la population."
            ]
          ]
        },
        {
          "type": "formula",
          "tex": "\\begin{gathered}X\\in\\mathcal{X},\\qquad Y\\in\\mathcal{Y},\\\\ D_n=\\{(X_1,Y_1),\\ldots,(X_n,Y_n)\\},\\\\ f:\\mathcal{X}\\longrightarrow\\mathcal{Y},\\\\ \\mathcal{R}(f)=\\mathbb{E}[\\ell(Y,f(X))].\\end{gathered}",
          "explanation": "Les majuscules désignent les variables aléatoires. Les minuscules désignent leurs valeurs observées. Le cadre de départ suppose les couples de \\(D_n\\) indépendants et identiquement distribués."
        },
        {
          "type": "prose",
          "title": "Problème d’apprentissage supervisé",
          "html": "<p>On dispose d’une variable de sortie — <strong>variable dépendante, réponse ou cible</strong> — et d’un vecteur de <strong>\\(p\\) variables explicatives</strong>, également appelées entrées, prédicteurs, covariables ou features.</p><ul><li>En <strong>régression</strong>, la cible est quantitative : un prix ou une tension artérielle, par exemple.</li><li>En <strong>discrimination</strong>, elle prend des valeurs dans un ensemble fini et non ordonné : survie/mort, chiffre de \\(0\\) à \\(9\\), classe de tissu.</li></ul><p>Les couples entrée–sortie disponibles sont les observations, exemples ou instances à partir desquels l’algorithme apprend.</p>"
        },
        {
          "type": "prose",
          "title": "Apprentissage non supervisé",
          "html": "<p>Il n’y a pas de variable de sortie fournie : seules les mesures ou caractéristiques des observations sont disponibles. L’objectif est exploratoire.</p><ul><li>Trouver des groupes d’observations qui se ressemblent.</li><li>Trouver des variables qui se comportent de manière similaire.</li><li>Trouver des combinaisons linéaires de variables capturant une grande part de la variance.</li></ul><p>L’absence de vérité terrain rend l’évaluation plus difficile. Une méthode non supervisée peut aussi servir de prétraitement, par exemple une réduction de dimension avant une classification supervisée.</p>"
        },
        {
          "type": "prose",
          "title": "Le prix Netflix",
          "html": "<p>La compétition commence en <strong>octobre 2006</strong>. Netflix fournit environ <strong>100 millions de notes</strong>, de <strong>480 000 clients</strong> pour près de <strong>18 000 films</strong>. Les notes vont de <strong>1 à 5</strong> ; près de <strong>99 %</strong> des cases de la matrice client–film sont vides.</p><p>Les participants prédisent environ <strong>3 millions de notes réservées</strong> : une moitié sert au classement public, l’autre au <strong>test final</strong>.</p><p>L’erreur de prédiction de Netflix sur le test vaut <strong>0,9525</strong>. La réduire de <strong>10 %</strong> permet de remporter <strong>un million de dollars</strong>.</p>"
        },
        {
          "type": "exercise",
          "title": "Le prix Netflix · question du cours",
          "question": "<p><strong>S’agit-il d’un problème supervisé ou non supervisé ?</strong> Identifier les entrées, la sortie et les exemples observés.</p>",
          "answer": "<p>La tâche de prédiction des notes est <strong>supervisée</strong> : chaque note connue fournit une sortie observée associée à un couple client–film. Les entrées décrivent le client et le film ; la sortie est une note numérique. On peut donc la traiter comme une tâche de régression. Le grand nombre de couples sans note ne transforme pas cette tâche en apprentissage non supervisé.</p>"
        },
        {
          "type": "callout",
          "title": "Précision sur le support",
          "html": "<p>Sources : <a href=\"https://www.cs.uic.edu/~liub/KDD-cup-2007/proceedings/The-Netflix-Prize-Bennett.pdf\" target=\"_blank\" rel=\"noopener\">Bennett et Lanning, Netflix, 2007</a> ; <a href=\"https://arxiv.org/pdf/1207.5649\" target=\"_blank\" rel=\"noopener\">analyse statistique du concours</a>.</p>"
        }
      ]
    },
    {
      "id": "regression-discrimination",
      "title": "Régression vs Discrimination",
      "duration": 12,
      "intro": "Premier volet du cadre mathématique de l’apprentissage statistique supervisé : données, objectifs, vocabulaire et fonction de prévision.",
      "objective": "Formaliser un problème entrée–sortie et distinguer la nature de la cible de celle des entrées.",
      "blocks": [
        {
          "type": "formula",
          "tex": "\\begin{gathered}d_n=\\{(x_1,y_1),\\ldots,(x_n,y_n)\\},\\\\ x_i\\in\\mathcal{X},\\qquad y_i\\in\\mathcal{Y}.\\end{gathered}",
          "explanation": "\\(d_n\\) désigne les données observées. \\(n\\) est le nombre d’exemples disponibles ; chaque entrée \\(x_i\\) est associée à une sortie \\(y_i\\)."
        },
        {
          "type": "figure",
          "src": "assets/lecture1/rec.png",
          "alt": "Six images de chiffres manuscrits associées aux étiquettes 9, 6, 6, 5, 4 et 0 ; des flèches identifient l’image et sa sortie.",
          "caption": "Reconnaissance de caractères : l’image est l’entrée, le chiffre identifié est la sortie."
        },
        {
          "type": "prose",
          "title": "Objectifs",
          "html": "<ol><li><strong>Expliquer</strong> les mécanismes liant les entrées aux sorties.</li><li><strong>Prédire « au mieux »</strong> la sortie associée à une nouvelle entrée.</li></ol><p>Une fonction de prévision est choisie en fonction d’un critère de qualité. Ce critère sera formalisé par une fonction de perte.</p>"
        },
        {
          "type": "prose",
          "title": "Vocabulaire",
          "html": "<p>Lorsque la variable à expliquer est <strong>quantitative</strong>, on parle de <strong>régression</strong>. Lorsqu’elle est qualitative, avec un ensemble fini de classes, on parle de <strong>discrimination</strong> ou de <strong>classification supervisée</strong> (<em>classification</em>).</p><p>La nature des entrées peut être variée : quantitative, qualitative, ordinale, image ou autre représentation. C’est la nature de la <strong>sortie</strong> qui détermine cette distinction.</p>"
        },
        {
          "type": "table",
          "headers": [
            "Sortie \\(y_i\\)",
            "Entrée \\(x_i\\)",
            "Problème"
          ],
          "rows": [
            [
              "Chiffre",
              "Image",
              "Discrimination"
            ],
            [
              "Prix de voiture",
              "Caractéristiques du véhicule",
              "Régression"
            ]
          ]
        },
        {
          "type": "prose",
          "title": "Un début de formalisation mathématique",
          "html": "<p>Les données observées sont une réalisation d’un <strong>\\(n\\)-échantillon</strong> de loi inconnue. Le plus souvent, nous supposerons les couples indépendants et identiquement distribués selon une même loi, notée \\(\\mathbb{P}\\).</p><p>À partir de ces observations, on cherche une fonction qui relie les entrées aux sorties. Il faut ensuite préciser un critère permettant de comparer les fonctions de prévision : une <strong>fonction de perte</strong>.</p>"
        },
        {
          "type": "formula",
          "tex": "\\begin{gathered}D_n=\\{(X_i,Y_i):i=1,\\ldots,n\\},\\\\ (X_i,Y_i)\\overset{\\mathrm{i.i.d.}}{\\sim}\\mathbb{P},\\\\ f:\\mathcal{X}\\longrightarrow\\mathcal{Y},\\qquad f(x_i)\\approx y_i.\\end{gathered}",
          "explanation": "La loi \\(\\mathbb{P}\\) est inconnue. L’ajustement sur les exemples observés est une première exigence ; la généralisation à de nouvelles observations reste l’objectif."
        },
        {
          "type": "prose",
          "title": "En outre…",
          "html": "<p>Une fonction de prévision dépend des paramètres du modèle, notés \\(\\theta\\). Dans les <strong>exemples affines ci-dessous</strong>, \\(\\theta=(w,b)\\) : coefficients et terme constant.</p>"
        },
        {
          "type": "formula",
          "tex": "\\hat y=\\hat f(x),\\qquad\\hat f=f_\\theta,\\quad\\theta=(w,b)",
          "explanation": "Dans ces modèles affines, \\(w\\) contient les coefficients et \\(b\\) le terme constant ; l’apprentissage les détermine. Pour la décision SVM, on prend \\(\\hat y=+1\\) lorsque \\(g(x)=0\\)."
        },
        {
          "type": "table",
          "headers": [
            "Modèle",
            "Fonction de prévision",
            "Paramètres"
          ],
          "rows": [
            [
              "Régression linéaire",
              "\\(\\hat y=w^{\\top}x+b\\)",
              "\\(\\theta=(w,b)\\)"
            ],
            [
              "SVM binaire",
              "\\(\\hat y=\\operatorname{sign}(g(x)),\\quad g(x)=w^{\\top}x+b\\) ; à score nul, choisir \\(+1\\).",
              "\\(\\theta=(w,b)\\)"
            ]
          ]
        }
      ]
    },
    {
      "id": "fonction-perte",
      "title": "Fonction de perte",
      "duration": 12,
      "intro": "Définir un coût pour une prévision : pertes Lᵖ en régression, perte 0–1 en discrimination et choix de la fonction de perte.",
      "objective": "Reconnaître le domaine et la convention d’une perte, puis distinguer décision et score dans le SVM.",
      "blocks": [
        {
          "type": "prose",
          "title": "Définition",
          "html": "<p>Une <strong>fonction de perte</strong> mesure le coût d’une prévision. Elle est mesurable, non négative et, dans les exemples suivants, nulle lorsque la prévision est exacte.</p>"
        },
        {
          "type": "formula",
          "tex": "\\begin{gathered}\\ell:\\mathcal{Y}\\times\\mathcal{Y}\\longrightarrow\\mathbb{R}^{+},\\\\ \\ell(y,y)=0,\\qquad \\ell(y,\\hat y)>0\\ \\text{si }y\\ne\\hat y.\\end{gathered}",
          "explanation": "\\(y\\) est observé ; \\(\\hat y\\) est prédit. Ici la perte compare deux sorties ; la perte charnière du SVM compare l’étiquette au score réel \\(g(x)\\)."
        },
        {
          "type": "callout",
          "title": "Précision sur le support",
          "html": "<p>Dans la définition, la première égalité est \\(\\ell(y,y)=0\\). Elle ne dit pas que toutes les paires cible–prévision ont une perte nulle.</p>"
        },
        {
          "type": "formula",
          "tex": "\\ell_p(y,\\hat y)=\\frac1p|y-\\hat y|^p,\\qquad p\\geq1",
          "explanation": "En régression réelle, le support introduit les pertes \\(L^{p}\\) avec le facteur \\(1/p\\). Ce facteur est conservé pour les cas particuliers ci-dessous."
        },
        {
          "type": "table",
          "headers": [
            "Valeur de \\(p\\)",
            "Perte",
            "Expression"
          ],
          "rows": [
            [
              "\\(p=1\\)",
              "Perte absolue",
              "\\(|y-\\hat y|\\)"
            ],
            [
              "\\(p=2\\)",
              "Perte quadratique",
              "\\(\\tfrac12(y-\\hat y)^{2}\\)"
            ]
          ]
        },
        {
          "type": "formula",
          "tex": "\\mathcal{Y}=\\{-1,+1\\},\\qquad\\ell(y,\\hat y)=\\mathbf{1}_{\\{y\\ne\\hat y\\}}",
          "explanation": "En discrimination binaire, la perte 0–1 vaut 0 si la classe est correcte et 1 si elle est incorrecte."
        },
        {
          "type": "table",
          "title": "Choix de la fonction de perte",
          "headers": [
            "Modèle",
            "Prévision ou décision",
            "Perte d’entraînement"
          ],
          "rows": [
            [
              "Régression linéaire",
              "\\(\\hat y=w^{\\top}x+b\\)",
              "\\(\\tfrac12(y-\\hat y)^{2}\\)"
            ],
            [
              "SVM",
              "Classe : \\(\\operatorname{sign}(g(x))\\) ; score : \\(g(x)=w^{\\top}x+b\\)",
              "\\(\\max(0,\\,1-y\\,g(x))\\)"
            ]
          ]
        },
        {
          "type": "formula",
          "tex": "\\begin{gathered}g(x)=w^\\top x+b,\\qquad\\hat y=\\operatorname{sign}(g(x)),\\\\ \\ell_{\\mathrm{hinge}}(y,g(x))=\\max(0,1-y\\,g(x)).\\end{gathered}",
          "explanation": "\\(y\\) est observé ; \\(g(x)\\) est le score ; \\(\\hat y\\in\\{-1,+1\\}\\) est prédit. On choisit \\(+1\\) lorsque le score est nul : c’est notre convention pour la décision par signe."
        },
        {
          "type": "callout",
          "title": "Précision sur le support",
          "html": "<p>Dans la ligne SVM, le score \\(g(x)\\) entre dans la perte charnière ; le signe sert à décider la classe. Utiliser uniquement la classe ferait disparaître l’information de marge.</p>"
        },
        {
          "type": "figure",
          "src": "assets/lecture1/lossff.png",
          "alt": "Comparaison de la perte quadratique, une parabole centrée sur la cible, et de la perte charnière pour les classes −1 et +1.",
          "caption": "À gauche : la demi-perte quadratique. Dans la partie SVM, y′ sur l’axe désigne le score continu, pas la classe prédite."
        },
        {
          "type": "demo",
          "kind": "risk",
          "title": "Complément visuel · la perte quadratique",
          "preset": {
            "lossScale": 0.5
          },
          "caption": "Données synthétiques. Déplacer la droite pour observer les résidus et leur coût moyen. La perte quadratique de cette partie utilise le facteur \\(\\tfrac12\\) ; la MSE usuelle, lorsqu’elle est affichée séparément, utilise les carrés sans ce facteur."
        }
      ]
    },
    {
      "id": "risque",
      "title": "Risque",
      "duration": 16,
      "intro": "Du comportement moyen de la perte à la fonction de prévision optimale, puis à la fonction de régression et à l’objectif d’apprentissage.",
      "objective": "Définir le risque, comprendre l’oracle et expliquer pourquoi le prédicteur appris dépend de l’échantillon.",
      "blocks": [
        {
          "type": "prose",
          "title": "Risque",
          "html": "<p>On s’intéresse au <strong>comportement moyen</strong> de la fonction de perte. Pour une fonction de prévision fixée, sa performance est mesurée par l’espérance de la perte sur un couple entrée–sortie de la population cible.</p>"
        },
        {
          "type": "formula",
          "tex": "\\mathcal{R}(f)=\\mathbb{E}\\bigl[\\ell(Y,f(X))\\bigr]",
          "explanation": "\\(\\mathcal{R}(f)\\) est appelé risque ou erreur de généralisation. Le couple futur \\((X,Y)\\) suit la même loi \\(\\mathbb{P}\\) que les données d’apprentissage et est indépendant de cet échantillon."
        },
        {
          "type": "prose",
          "title": "Fonction de prévision optimale",
          "html": "<p><strong>Aspect théorique :</strong> pour une perte donnée, chercher la fonction ayant le plus petit risque. Une telle fonction, si elle existe, est une fonction de prévision optimale.</p>"
        },
        {
          "type": "formula",
          "tex": "\\begin{gathered}f^*\\in\\underset{f}{\\arg\\min}\\;\\mathcal{R}(f),\\\\ \\mathcal{R}(f^*)\\leq\\mathcal{R}(f)\\quad\\text{pour toute }f.\\end{gathered}",
          "explanation": "Le choix optimal dépend de la perte et, le plus souvent, de la loi inconnue \\(\\mathbb{P}\\). Il constitue une référence théorique."
        },
        {
          "type": "prose",
          "title": "Aspect pratique",
          "html": "<p>La loi étant inconnue, nous ne pouvons généralement pas calculer directement la fonction optimale. Nous cherchons un estimateur construit à partir des données dont le risque est proche de celui de l’oracle.</p>"
        },
        {
          "type": "formula",
          "tex": "\\begin{gathered}\\hat f=\\hat f(\\cdot;D_n),\\\\ \\mathcal{R}(\\hat f)\\approx\\mathcal{R}(f^*).\\end{gathered}",
          "explanation": "\\(\\hat f\\) est apprise sur \\(D_n\\) ; \\(f^*\\) est la référence optimale. Un autre échantillon peut donner une autre \\(\\hat f\\)."
        },
        {
          "type": "figure",
          "title": "Intuition",
          "src": "assets/lecture1/regression.png",
          "alt": "Nuage de points autour d’une courbe rouge ; une verticale à x = 4 met en évidence la dispersion des sorties à entrée fixée.",
          "caption": "À une entrée fixée, plusieurs valeurs de la sortie sont possibles ; la courbe rouge illustre la fonction de régression."
        },
        {
          "type": "prose",
          "title": "Intuition",
          "html": "<p>À une valeur d’entrée fixée, plusieurs valeurs de la sortie peuvent être observées. Quelle prévision représente alors une bonne valeur ? Pour la perte quadratique, la réponse est la <strong>moyenne conditionnelle</strong> de la sortie sachant cette entrée.</p>"
        },
        {
          "type": "formula",
          "tex": "m^*(x)=\\mathbb{E}[Y\\mid X=x]",
          "explanation": "L’espérance conditionnelle est la valeur moyenne de \\(Y\\) lorsque \\(X=x\\). Elle est optimale sous perte quadratique ; cette propriété dépend du choix de la perte."
        },
        {
          "type": "figure",
          "title": "Cas de la régression",
          "src": "assets/lecture1/ols.png",
          "alt": "Points bleus et droite noire ; des carrés rouges représentent les carrés des écarts verticaux entre les observations et la droite.",
          "caption": "Les carrés rouges représentent les résidus au carré : l’ajustement quadratique cherche à réduire leur somme."
        },
        {
          "type": "formula",
          "tex": "\\begin{gathered}\\mathcal{Y}=\\mathbb{R},\\qquad f:\\mathcal{X}\\longrightarrow\\mathbb{R},\\\\ \\mathcal{R}(f)=\\mathbb{E}[(Y-f(X))^2],\\\\ m^*(x)=\\mathbb{E}[Y\\mid X=x].\\end{gathered}",
          "explanation": "\\(f\\) est une fonction candidate ; sous perte quadratique, l’optimum \\(f^*\\) est \\(m^*\\), la moyenne conditionnelle généralement inconnue. On suppose des moments d’ordre deux finis."
        },
        {
          "type": "callout",
          "title": "Précision sur le support",
          "html": "<p>Cette partie écrit le risque quadratique <strong>sans le facteur \\(\\tfrac12\\)</strong>. Multiplier toute la perte par une constante positive change les valeurs du risque, mais pas le prédicteur qui le minimise.</p>"
        },
        {
          "type": "callout",
          "title": "Question du cours",
          "html": "<p><strong>Comment écrire le risque en discrimination ?</strong> Utiliser la perte 0–1.</p><details class=\"as-theory\"><summary>Réponse</summary><div><p>La perte vaut 1 si la classe est incorrecte, 0 sinon :</p>\\[\\mathcal R(f)=\\mathbb E[\\mathbf 1_{\\{f(X)\\ne Y\\}}]=\\mathbb P(f(X)\\ne Y).\\]<p>Le prédicteur optimal choisit une classe de probabilité conditionnelle maximale :</p>\\[f^*(x)\\in\\operatorname*{argmax}_{k\\in\\mathcal Y}\\mathbb P(Y=k\\mid X=x).\\]<p>En cas d’égalité, on fixe une convention de départage.</p></div></details>"
        },
        {
          "type": "table",
          "title": "Recap",
          "headers": [
            "Objet",
            "Rôle"
          ],
          "rows": [
            [
              "Données \\(d_n\\)",
              "Observations issues d’un échantillon i.i.d. de loi inconnue \\(\\mathbb{P}\\)."
            ],
            [
              "Prédicteur \\(f\\)",
              "Transformer une entrée en prévision."
            ],
            [
              "Coût \\(\\ell(Y,f(X))\\)",
              "Mesurer la perte sur un couple entrée–sortie."
            ],
            [
              "Risque \\(\\mathcal{R}(f)\\)",
              "Moyenner ce coût sur la population."
            ],
            [
              "Oracle f*",
              "Minimiser le risque ; dépend de la loi inconnue."
            ]
          ]
        },
        {
          "type": "prose",
          "title": "Objectif",
          "html": "<p>Construire un algorithme de prévision qui <strong>généralise bien sur de nouvelles données</strong> : le risque du prédicteur appris doit se rapprocher du risque optimal.</p><p>Ses performances dépendent du <strong>choix du modèle et de sa complexité</strong>, de la <strong>quantité de données disponibles</strong> et du <strong>compromis biais–variance</strong>.</p>"
        }
      ]
    },
    {
      "id": "biais-variance",
      "title": "Décomposition de l’erreur et compromis biais–variance",
      "duration": 12,
      "intro": "Décomposer l’erreur quadratique en biais, variance et bruit, puis relier ces termes au choix de la complexité.",
      "objective": "Interpréter les trois termes de l’erreur et distinguer variation des données et bruit de la réponse.",
      "blocks": [
        {
          "type": "prose",
          "title": "Décomposition de l’erreur : biais, variance et bruit",
          "html": "<p>Pour une entrée fixée, l’erreur quadratique attendue se décompose en <strong>biais au carré</strong>, <strong>variance</strong> et <strong>bruit</strong>.</p><p>\\(m^*\\) est la vraie moyenne conditionnelle ; \\(\\hat f\\) est le prédicteur appris. On suppose un bruit de variance constante, des moments d’ordre deux finis et une cible future indépendante de l’apprentissage.</p>"
        },
        {
          "type": "formula",
          "tex": "\\begin{gathered}m^*(x)=\\mathbb{E}[Y\\mid X=x],\\\\ Y=m^*(X)+\\varepsilon,\\qquad\\mathbb{E}[\\varepsilon\\mid X]=0.\\end{gathered}",
          "explanation": "\\(Y\\) est une sortie aléatoire, \\(m^*(x)\\) une moyenne théorique et \\(\\hat f(x)\\) une prédiction apprise."
        },
        {
          "type": "formula",
          "tex": "\\begin{aligned}\\mathbb{E}\\!\\left[(Y-\\widehat f(X))^2\\mid X=x\\right]&=\\underbrace{\\left(m^*(x)-\\mathbb{E}[\\widehat f(x)]\\right)^2}_{\\text{biais au carré}}\\\\ &\\quad+\\underbrace{\\mathbb{E}\\!\\left[(\\widehat f(x)-\\mathbb{E}[\\widehat f(x)])^2\\right]}_{\\text{variance}}\\\\ &\\quad+\\underbrace{\\operatorname{Var}(\\varepsilon)}_{\\text{bruit}}.\\end{aligned}",
          "explanation": "Les espérances impliquant \\(\\hat f\\) portent sur les échantillons d’apprentissage possibles. La variance du bruit est supposée constante."
        },
        {
          "type": "callout",
          "title": "Précision sur le support",
          "html": "<p>Si la variance du bruit dépend de l’entrée, le terme de bruit au point considéré est \\(\\operatorname{Var}(Y\\mid X=x)\\). La formule avec \\(\\operatorname{Var}(\\varepsilon)\\) correspond au cas d’une variance conditionnelle constante.</p>"
        },
        {
          "type": "prose",
          "title": "Compromis Bias-Variance · Biais",
          "html": "<p>Le <strong>biais</strong> est la différence entre la prévision moyenne du modèle et la valeur réelle qu’il cherche à estimer. Un modèle trop restrictif peut garder un décalage systématique même lorsque l’on répète l’apprentissage.</p>"
        },
        {
          "type": "figure",
          "src": "assets/lecture1/jackpot.png",
          "alt": "Deux cibles : les impacts sont groupés près du centre pour le biais faible, et groupés à côté du centre pour le biais élevé.",
          "caption": "Biais faible ou élevé : comparer la position moyenne des impacts au centre de la cible."
        },
        {
          "type": "prose",
          "title": "Compromis Bias-Variance · Variance",
          "html": "<p>La <strong>variance</strong> mesure à quel point les prévisions changent lorsque les données d’apprentissage changent. On compare des modèles appris sur différents échantillons provenant du même problème.</p>"
        },
        {
          "type": "figure",
          "src": "assets/lecture1/jacknot.png",
          "alt": "Deux cibles : les impacts sont regroupés pour une faible variance et dispersés pour une forte variance.",
          "caption": "Variance faible ou élevée : comparer la dispersion des impacts, indépendamment de leur centrage."
        },
        {
          "type": "figure",
          "src": "assets/lecture1/trade.png",
          "alt": "Tableau comparant sous-ajustement, ajustement approprié et sur-ajustement : symptômes, cibles, exemples de régression et classification, courbes de perte et pistes de correction.",
          "caption": "Sous-ajustement, ajustement approprié et sur-ajustement : symptômes, géométrie, évolution des pertes pendant l’entraînement et pistes de correction."
        },
        {
          "type": "demo",
          "kind": "bias",
          "title": "Complément visuel · répéter l’apprentissage",
          "caption": "Simulation synthétique où la vraie relation est connue. Les courbes sont apprises sur plusieurs échantillons ; comparer leur moyenne et leur dispersion aux illustrations du support."
        },
        {
          "type": "demo",
          "kind": "generalization",
          "title": "Complément visuel · faire varier la complexité",
          "caption": "Données synthétiques. Comparer l’erreur d’apprentissage et l’erreur de validation lorsque le degré change. Le jeu utilisé pour comparer les degrés sert à la validation, pas au test final."
        },
        {
          "type": "callout",
          "title": "À retenir pour le complément visuel",
          "html": "<p>Les erreurs obtenues en faisant varier le degré dépendent de cet échantillon synthétique. Une baisse de l’erreur d’apprentissage n’implique pas une baisse de l’erreur de validation. L’allure de cette dernière, parfois en U, n’est pas universelle.</p>"
        }
      ]
    },
    {
      "id": "estimation-risque",
      "title": "Estimation du risque",
      "duration": 13,
      "intro": "Risque empirique, validation ou hold-out, validation croisée K-blocs et Leave-One-Out : estimer l’erreur sur des observations tenues à l’écart.",
      "objective": "Décrire les algorithmes de validation et identifier les données utilisées pour apprendre ou évaluer chaque prévision.",
      "blocks": [
        {
          "type": "prose",
          "title": "Estimation du risque",
          "html": "<p>La loi du couple entrée–sortie étant inconnue, on ne peut pas calculer directement le risque du prédicteur appris. Une première approche consiste à remplacer l’espérance par une moyenne sur les observations : le <strong>risque empirique</strong>.</p>"
        },
        {
          "type": "formula",
          "tex": "\\mathcal{R}_n(\\hat f)=\\frac1n\\sum_{i=1}^{n}\\ell(y_i,\\hat f(x_i))",
          "explanation": "\\(D_n\\) a déjà servi à construire \\(\\hat f\\). L’erreur sur ce même échantillon peut être trop optimiste pour mesurer la généralisation."
        },
        {
          "type": "callout",
          "title": "Solution",
          "html": "<p>Évaluer les prévisions sur des observations qui n’ont pas servi à ajuster le modèle. La validation simple et la validation croisée mettent en œuvre ce principe.</p>"
        },
        {
          "type": "prose",
          "title": "Validation ou hold out",
          "html": "<p>On sépare les données : <strong>apprentissage</strong> pour ajuster, <strong>validation</strong> pour comparer. Les indices sont notés \\(\\mathcal A\\) et \\(\\mathcal V\\).</p><p>Les prétraitements sont appris sur l’apprentissage seulement. Pour des observations liées par sujet ou par date, le découpage doit respecter ces groupes ou l’ordre du temps.</p>"
        },
        {
          "type": "formula",
          "tex": "\\begin{gathered}\\mathcal{A}\\cap\\mathcal{V}=\\varnothing,\\\\ \\mathcal{A}\\cup\\mathcal{V}=\\{1,\\ldots,n\\},\\\\ \\mathcal{D}_{\\mathrm{app}}=\\{(x_i,y_i):i\\in\\mathcal{A}\\},\\\\ \\mathcal{D}_{\\mathrm{valid}}=\\{(x_i,y_i):i\\in\\mathcal{V}\\}.\\end{gathered}",
          "explanation": "\\(\\mathcal V\\) désigne la validation, \\(\\mathcal A\\) l’apprentissage. Ils sont disjoints ; le test final reste réservé à l’évaluation."
        },
        {
          "type": "prose",
          "title": "Algorithme · Validation ou Hold-Out",
          "html": "<ol><li><strong>Ajuster le modèle et les prétraitements</strong> sur l’apprentissage seulement.</li><li>Noter le prédicteur appris \\(\\hat f_{\\mathrm{app}}=\\hat f(\\cdot;\\mathcal D_{\\mathrm{app}})\\).</li><li><strong>Prédire</strong> les observations de validation avec ces prétraitements et ce modèle fixes.</li><li><strong>Calculer</strong> leur perte moyenne.</li></ol>"
        },
        {
          "type": "formula",
          "tex": "\\widehat{\\mathcal{R}}_{\\mathrm{valid}}=\\frac1{|\\mathcal{V}|}\\sum_{i\\in\\mathcal{V}}\\ell\\bigl(y_i,\\hat f_{\\mathrm{app}}(x_i)\\bigr).",
          "explanation": "Chaque terme utilise une prévision obtenue sans la réponse de validation correspondante. La taille de la partie de validation détermine aussi la précision de cette estimation."
        },
        {
          "type": "figure",
          "title": "Illustration",
          "src": "assets/lecture1/split.png",
          "alt": "Une bande de données répartie en trois parties : Train en bleu, Validation en orange et Test en vert.",
          "caption": "Apprentissage : ajuster ; validation : choisir ; test final : évaluer. \\(\\mathcal V\\) désigne les indices de validation."
        },
        {
          "type": "callout",
          "title": "Commentaires",
          "html": "<p>Il faut suffisamment d’observations dans la partie d’apprentissage pour ajuster le modèle, et dans la partie de validation pour estimer convenablement son erreur. Ces deux besoins se partagent un même nombre total d’observations.</p>"
        },
        {
          "type": "prose",
          "title": "Validation croisée K-blocs",
          "html": "<p>À chaque pli, apprendre sur les autres blocs, puis prédire et mesurer la perte sur le bloc exclu. On moyenne les \\(K\\) pertes.</p><p><strong>Réapprendre aussi les prétraitements dans chaque pli</strong> : les apprendre avant le découpage provoquerait une fuite d’information.</p>"
        },
        {
          "type": "formula",
          "tex": "\\begin{gathered}\\{B_1,\\ldots,B_K\\}\\text{ partitionne }\\{1,\\ldots,n\\},\\\\ \\mathcal{B}_k=\\{(x_i,y_i):i\\notin B_k\\},\\\\ \\hat f^{(-k)}=\\hat f(\\cdot;\\mathcal{B}_k).\\end{gathered}",
          "explanation": "\\(\\hat f^{(-k)}\\) est appris sans le bloc \\(B_k\\), puis évalué sur ce bloc. L’exposant \\((-k)\\) indique les données exclues."
        },
        {
          "type": "formula",
          "tex": "\\begin{gathered}\\widehat{\\mathcal{R}}_k=\\frac1{|B_k|}\\sum_{i\\in B_k}\\ell(y_i,\\hat f^{(-k)}(x_i)),\\\\ \\widehat{\\mathcal{R}}_{\\mathrm{CV}}=\\frac1K\\sum_{k=1}^{K}\\widehat{\\mathcal{R}}_k.\\end{gathered}",
          "explanation": "La formule du support accorde le même poids à chaque bloc. Si les blocs ont la même taille, elle revient aussi à moyenner les pertes des observations, chacune ayant été prédite hors de son apprentissage."
        },
        {
          "type": "figure",
          "src": "assets/lecture1/k-block.png",
          "alt": "Trois configurations mettent successivement à l’écart les blocs B₁, B₂ et B₃ ; des flèches regroupent leurs résultats de validation.",
          "caption": "Illustration à trois blocs : apprendre sans \\(B_1\\), puis sans \\(B_2\\), puis sans \\(B_3\\), et agréger les pertes obtenues."
        },
        {
          "type": "prose",
          "title": "Commentaires",
          "html": "<ul><li>Le choix de \\(K\\) appartient à l’utilisateur ; le support cite notamment \\(K=10\\).</li><li>La répétition évite de dépendre d’une unique séparation apprentissage–validation.</li><li>Elle demande davantage de <strong>temps de calcul</strong>, car le modèle doit être réajusté pour chaque bloc.</li></ul>"
        },
        {
          "type": "callout",
          "title": "Précision sur le support",
          "html": "<p>La validation croisée n’est pas toujours plus stable ou plus précise qu’une séparation simple : cela dépend notamment de \\(K\\), des données et de l’algorithme. Si elle sert à choisir un modèle, le score du candidat retenu ne remplace pas une évaluation finale réservée.</p>"
        },
        {
          "type": "demo",
          "kind": "folds",
          "title": "Complément visuel · parcourir les blocs",
          "caption": "Exemple synthétique à cinq blocs de même taille. Changer le bloc tenu à l’écart et observer le modèle appris sur les quatre autres. Chaque observation est évaluée une fois hors apprentissage."
        },
        {
          "type": "prose",
          "title": "Leave-One-Out",
          "html": "<p>Lorsque \\(K=n\\), chaque bloc contient une seule observation : c’est la validation croisée <strong>leave one out</strong> (LOO). Pour chaque indice, on apprend sur l’échantillon amputé de l’observation correspondante et on évalue cette observation.</p>"
        },
        {
          "type": "formula",
          "tex": "\\begin{gathered}K=n,\\qquad D_n^{(-i)}=D_n\\setminus\\{(x_i,y_i)\\},\\\\ \\hat f^{(-i)}=\\hat f(\\cdot;D_n^{(-i)}),\\\\ \\widehat{\\mathcal{R}}_{\\mathrm{LOO}}=\\frac1n\\sum_{i=1}^{n}\\ell(y_i,\\hat f^{(-i)}(x_i)).\\end{gathered}",
          "explanation": "\\(\\hat f^{(-i)}\\) est appris sans l’observation \\(i\\). Le calcul demande \\(n\\) ajustements ; il est surtout adapté aux petits échantillons."
        }
      ]
    },
    {
      "id": "categorisation",
      "title": "Catégorisation",
      "duration": 5,
      "intro": "Organiser les méthodes et expliciter notre perspective : des algorithmes linéaires aux méthodes non linéaires, puis à l’agrégation.",
      "objective": "Situer la progression SID34 et justifier le choix d’un premier modèle simple.",
      "blocks": [
        {
          "type": "figure",
          "title": "Catégorisation",
          "src": "assets/lecture1/categ.png",
          "alt": "Carte des méthodes suivant trois axes : supervision, paramétrisation et linéarité ; elle distingue notamment apprentissage supervisé, non supervisé et semi-supervisé.",
          "caption": "Trois axes de catégorisation : supervision, paramétrisation et linéarité."
        },
        {
          "type": "figure",
          "title": "Notre perspective",
          "src": "assets/lecture1/here.png",
          "alt": "La même carte des méthodes, avec l’axe linéarité et ses branches Linear et Nonlinear entourés en rouge.",
          "caption": "Notre perspective : organiser l’étude des modèles selon l’axe linéaire / non linéaire."
        },
        {
          "type": "callout",
          "title": "Précision sur le support",
          "html": "<p><strong>Paramétrique</strong> désigne un modèle décrit par un nombre fixé de paramètres ; cela n’impose pas une loi gaussienne. <strong>Non paramétrique</strong> ne signifie pas sans hypothèses, ni moins puissant par principe. Un <strong>modèle linéaire</strong> n’exige pas une séparation parfaite des classes.</p>"
        },
        {
          "type": "prose",
          "title": "Pourquoi ce choix ?",
          "html": "<p>Le classement <strong>linéaire / non linéaire</strong> aide à comprendre le compromis biais–variance et à choisir une complexité appropriée à la taille et à la structure des données.</p><p>Il permet une démarche progressive : commencer par un <strong>modèle linéaire simple</strong> pour poser les bases, puis aller vers un <strong>modèle non linéaire</strong> si les données le justifient.</p>"
        },
        {
          "type": "figure",
          "title": "Guide selon Scikit-learn",
          "src": "assets/lecture1/sci.png",
          "alt": "Arbre d’orientation scikit-learn répartissant les méthodes entre classification, régression, clustering et réduction de dimension.",
          "caption": "Guide repris du support : situer les familles de méthodes selon la tâche et les données, puis confronter le choix à la validation."
        },
        {
          "type": "prose",
          "title": "Références",
          "html": "<ul><li><strong>James, G., Witten, D., Hastie, T., Tibshirani, R., Taylor, J.</strong> <em>An Introduction to Statistical Learning: with Applications in Python</em>, Springer, 2023. <a href=\"https://www.statlearning.com/\" target=\"_blank\" rel=\"noopener\">Site des auteurs et PDF</a>.</li><li><strong>Afshine Amidi et Shervine Amidi.</strong> <em>CS229 — fiches de machine learning</em>, Fall 2018.</li><li><strong>Laurent Rouvière.</strong> <em>Introduction au machine learning</em>, Université Rennes 2, 2021.</li><li><strong>Trevor Hastie, Robert Tibshirani, Jerome Friedman.</strong> <em>The Elements of Statistical Learning</em>, Springer, 2001.</li></ul>"
        },
        {
          "type": "references",
          "links": [
            {
              "label": "ISL avec Python · édition 2023, site des auteurs et PDF",
              "url": "https://www.statlearning.com/"
            },
            {
              "label": "The Illustrated Machine Learning website",
              "url": "https://illustrated-machine-learning.github.io"
            }
          ]
        },
        {
          "type": "callout",
          "title": "Next : Algorithmes linéaires",
          "html": "<p>Le chapitre suivant reprend ces notions pour étudier les <strong>algorithmes linéaires</strong> : leur géométrie, leurs fonctions de prévision et les critères utilisés pour apprendre.</p>"
        }
      ]
    }
  ]
};
