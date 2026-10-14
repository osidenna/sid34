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
      "intro": "Contexte, problématiques et notations, avant le cadre mathématique.",
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
          "html": "<ol><li><strong>Introduction générale :</strong> contexte, vocabulaire.</li><li><strong>Cadre mathématique de l’apprentissage statistique supervisé :</strong> perte, risque, biais–variance, estimation du risque.</li><li><strong>Catégorisation :</strong> organiser les méthodes.</li></ol>"
        },
        {
          "type": "prose",
          "title": "Contexte",
          "html": "<p>L’<strong>apprentissage statistique</strong> (<em>statistical learning</em>) : estimer des dépendances, modéliser et comprendre des données complexes.</p><blockquote><p>« … explores way of estimating functional dependency from a given collection of data » — Vapnik, 2000.</p><p>« … a set of tools for modelling and understanding complex datasets » — James et al., 2013.</p></blockquote>"
        },
        {
          "type": "prose",
          "title": "Deux approches",
          "html": "<ul><li>Un <strong>modèle interprétable</strong> : complexité maîtrisée.</li><li>Une <strong>bonne précision prédictive</strong> : modèle plus complexe si besoin.</li></ul><p>Approches complémentaires : importance des variables pour interpréter ; biais, variance, convergence pour étudier un prédicteur.</p>"
        },
        {
          "type": "callout",
          "title": "Précision sur le support",
          "html": "<p>Bien expliquer ne garantit pas de bien prédire de nouvelles données : évaluer les deux séparément.</p>"
        },
        {
          "type": "prose",
          "title": "Apprentissage Statistique vs Machine Learning",
          "html": "<ul><li>Le <strong>machine learning</strong> (issu de l’IA) : grande échelle, précision prédictive.</li><li>L’<strong>apprentissage statistique</strong> (issu de la statistique) : modèles, interprétabilité, précision.</li></ul><p>Mêmes problèmes ; la frontière est devenue floue.</p>"
        },
        {
          "type": "table",
          "title": "Problématiques associées à l’apprentissage",
          "headers": [
            "Type",
            "Problématique",
            "Objectif"
          ],
          "rows": [
            [
              "Supervisé",
              "Régression",
              "Prédire une sortie numérique à partir d’entrées."
            ],
            [
              "Supervisé",
              "Discrimination",
              "Prédire une classe à partir d’entrées."
            ],
            [
              "Non supervisé",
              "Typologie (clustering)",
              "Regrouper des observations semblables."
            ],
            [
              "Non supervisé",
              "Règles d’association",
              "Relier produits ou événements."
            ],
            [
              "Non supervisé",
              "Systèmes de recommandation",
              "Compléter une matrice de notes ou suggérer des produits souvent associés."
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
              "Espace des entrées (features)."
            ],
            [
              "\\(\\mathcal{Y}\\)",
              "Espace des sorties (étiquettes)."
            ],
            [
              "\\(X,\\ Y\\)",
              "Variables aléatoires à valeurs dans \\(\\mathcal{X}\\) et \\(\\mathcal{Y}\\)."
            ],
            [
              "\\((X,Y)\\)",
              "Couple aléatoire : un individu."
            ],
            [
              "\\(D_n\\)",
              "Échantillon d’apprentissage de \\(n\\) couples."
            ],
            [
              "\\((x_i,y_i)\\)",
              "Réalisation du couple \\((X_i,Y_i)\\)."
            ],
            [
              "\\(f\\)",
              "Prévision candidate ; \\(\\hat f\\) : apprise sur les données."
            ],
            [
              "\\(y_i,\\ \\hat y_i\\)",
              "Sortie observée, sortie prédite \\(\\hat y_i=\\hat f(x_i)\\)."
            ],
            [
              "\\(g(x)\\)",
              "Score d’un classifieur, converti en classe \\(\\hat y\\)."
            ],
            [
              "\\(\\ell\\)",
              "Perte : coût d’une erreur."
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
          "explanation": "Majuscules : aléatoires ; minuscules : observées. Couples de \\(D_n\\) i.i.d."
        },
        {
          "type": "prose",
          "title": "Problème d’apprentissage supervisé",
          "html": "<p>On observe des couples <strong>entrée</strong> \\(x\\) (\\(p\\) variables explicatives) et <strong>sortie</strong> \\(y\\) (la cible). But : prédire \\(y\\) pour une nouvelle entrée.</p><ul><li><strong>Régression</strong> : \\(y\\) quantitative (prix, tension artérielle).</li><li><strong>Discrimination</strong> : \\(y\\) parmi des classes (survie/mort, chiffre de \\(0\\) à \\(9\\)).</li></ul>"
        },
        {
          "type": "prose",
          "title": "Apprentissage non supervisé",
          "html": "<p>Seulement des entrées \\(x\\), <strong>sans sortie</strong> : on explore.</p><ul><li><strong>Regrouper</strong> les observations semblables (clustering).</li><li><strong>Résumer</strong> les variables redondantes (réduction de dimension).</li></ul><p>Sans vérité terrain, l’évaluation est plus difficile.</p>"
        },
        {
          "type": "prose",
          "title": "Le prix Netflix",
          "html": "<ul><li>Lancement : <strong>octobre 2006</strong>.</li><li>Environ <strong>100 millions de notes</strong> (de <strong>1 à 5</strong>), <strong>480 000 clients</strong>, près de <strong>18 000 films</strong> ; matrice vide à près de <strong>99 %</strong>.</li><li>À prédire : environ <strong>3 millions de notes réservées</strong>, moitié classement public, moitié <strong>test final</strong>.</li><li>Réduire de <strong>10 %</strong> l’erreur de Netflix (<strong>0,9525</strong>) : <strong>un million de dollars</strong>.</li></ul>"
        },
        {
          "type": "exercise",
          "title": "Le prix Netflix · question du cours",
          "question": "<p><strong>S’agit-il d’un problème supervisé ou non supervisé ?</strong> Identifier les entrées, la sortie et les exemples observés.</p>",
          "answer": "<p><strong>Non supervisé</strong> : aucune variable de sortie n’est distincte des entrées. Toutes les cases sont des notes de même nature ; on complète la matrice clients × films en exploitant sa structure (<strong>complétion de matrice</strong>).</p><p>Observations : les notes connues. À prédire : les cases vides.</p>"
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
      "intro": "Données, objectifs, vocabulaire, fonction de prévision.",
      "objective": "Formaliser un problème entrée–sortie et distinguer la nature de la cible de celle des entrées.",
      "blocks": [
        {
          "type": "formula",
          "tex": "\\begin{gathered}d_n=\\{(x_1,y_1),\\ldots,(x_n,y_n)\\},\\\\ x_i\\in\\mathcal{X},\\qquad y_i\\in\\mathcal{Y}.\\end{gathered}",
          "explanation": "\\(d_n\\) : \\(n\\) exemples observés, chaque entrée \\(x_i\\) avec sa sortie \\(y_i\\)."
        },
        {
          "type": "figure",
          "src": "assets/lecture1/rec.png",
          "alt": "Six images de chiffres manuscrits associées aux étiquettes 9, 6, 6, 5, 4 et 0 ; des flèches identifient l’image et sa sortie.",
          "caption": "Reconnaissance de caractères : image en entrée, chiffre en sortie."
        },
        {
          "type": "prose",
          "title": "Objectifs",
          "html": "<ol><li><strong>Expliquer</strong> le lien entrées–sorties.</li><li><strong>Prédire « au mieux »</strong> la sortie d’une nouvelle entrée.</li></ol><p>« Au mieux » : selon une fonction de perte.</p>"
        },
        {
          "type": "prose",
          "title": "Vocabulaire",
          "html": "<ul><li>Sortie <strong>quantitative</strong> : <strong>régression</strong>.</li><li>Sortie <strong>qualitative</strong> (classes en nombre fini) : <strong>discrimination</strong> ou <strong>classification supervisée</strong>.</li></ul><p>Entrées de toute nature ; c’est la <strong>sortie</strong> qui décide.</p>"
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
          "html": "<p>Données : réalisation d’un <strong>\\(n\\)-échantillon</strong>, en général i.i.d. de loi inconnue \\(\\mathbb{P}\\).</p><p>On compare les fonctions candidates avec une <strong>fonction de perte</strong>.</p>"
        },
        {
          "type": "formula",
          "tex": "\\begin{gathered}D_n=\\{(X_i,Y_i):i=1,\\ldots,n\\},\\\\ (X_i,Y_i)\\overset{\\mathrm{i.i.d.}}{\\sim}\\mathbb{P},\\\\ f:\\mathcal{X}\\longrightarrow\\mathcal{Y},\\qquad f(x_i)\\approx y_i.\\end{gathered}",
          "explanation": "\\(\\mathbb{P}\\) est inconnue. Ajuster les exemples ne suffit pas : l’objectif est de généraliser."
        },
        {
          "type": "prose",
          "title": "En outre…",
          "html": "<p>Une prévision dépend de paramètres \\(\\theta\\) ; dans les <strong>exemples affines ci-dessous</strong>, \\(\\theta=(w,b)\\).</p>"
        },
        {
          "type": "formula",
          "tex": "\\hat y=\\hat f(x),\\qquad\\hat f=f_\\theta,\\quad\\theta=(w,b)",
          "explanation": "\\(w\\) : coefficients ; \\(b\\) : terme constant. SVM : \\(\\hat y=+1\\) si \\(g(x)=0\\)."
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
              "\\(\\hat y=\\operatorname{sign}(g(x)),\\quad g(x)=w^{\\top}x+b\\) ; score nul : \\(+1\\).",
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
      "intro": "Pertes Lᵖ en régression, perte 0–1 en discrimination, choix de la perte.",
      "objective": "Reconnaître le domaine et la convention d’une perte, puis distinguer décision et score dans le SVM.",
      "blocks": [
        {
          "type": "prose",
          "title": "Définition",
          "html": "<p>Une <strong>fonction de perte</strong> mesure le coût d’une prévision : mesurable, non négative, ici nulle si la prévision est exacte.</p>"
        },
        {
          "type": "formula",
          "tex": "\\begin{gathered}\\ell:\\mathcal{Y}\\times\\mathcal{Y}\\longrightarrow\\mathbb{R}^{+},\\\\ \\ell(y,y)=0,\\qquad \\ell(y,\\hat y)>0\\ \\text{si }y\\ne\\hat y.\\end{gathered}",
          "explanation": "\\(y\\) observé, \\(\\hat y\\) prédit. La perte charnière, elle, compare l’étiquette au score \\(g(x)\\)."
        },
        {
          "type": "callout",
          "title": "Précision sur le support",
          "html": "<p>\\(\\ell(y,y)=0\\) : perte nulle pour une prévision exacte, pas pour toute paire.</p>"
        },
        {
          "type": "formula",
          "tex": "\\ell_p(y,\\hat y)=\\frac1p|y-\\hat y|^p,\\qquad p\\geq1",
          "explanation": "Régression : pertes \\(L^{p}\\), facteur \\(1/p\\) conservé ci-dessous."
        },
        {
          "type": "table",
          "headers": [
            "Perte",
            "Expression",
            "Tâche"
          ],
          "rows": [
            [
              "Perte absolue (\\(p=1\\))",
              "\\(|y-\\hat y|\\)",
              "Régression"
            ],
            [
              "Perte quadratique (\\(p=2\\))",
              "\\(\\tfrac12(y-\\hat y)^{2}\\)",
              "Régression"
            ],
            [
              "Perte 0-1",
              "\\(\\mathbf{1}_{\\{y\\ne\\hat y\\}}\\)",
              "Discrimination"
            ]
          ]
        },
        {
          "type": "formula",
          "tex": "\\mathcal{Y}=\\{-1,+1\\},\\qquad\\ell_{0\\text{-}1}(y,\\hat y)=\\mathbf{1}_{\\{y\\ne\\hat y\\}}",
          "explanation": "Perte 0-1, en discrimination binaire : 0 si la classe est correcte, 1 sinon."
        },
        {
          "type": "table",
          "title": "Choix de la fonction de perte",
          "headers": [
            "Modèle",
            "Prévision à partir du score \\(g(x)=w^{\\top}x+b\\)",
            "Perte d’entraînement",
            "Tâche"
          ],
          "rows": [
            [
              "Régression linéaire",
              "\\(\\hat y=g(x)\\)",
              "\\(\\tfrac12\\big(y-g(x)\\big)^{2}\\)",
              "Régression"
            ],
            [
              "Régression logistique (chapitre 2), \\(y\\in\\{0,1\\}\\)",
              "\\(\\hat p=\\sigma(g(x))\\), \\(\\hat y=\\mathbf{1}_{\\{\\hat p\\ge t\\}}\\)",
              "\\(-y\\log\\hat p-(1-y)\\log(1-\\hat p)\\)",
              "Discrimination"
            ],
            [
              "SVM, \\(y\\in\\{-1,+1\\}\\)",
              "\\(\\hat y=\\operatorname{sign}(g(x))\\)",
              "\\(\\max(0,\\,1-y\\,g(x))\\)",
              "Discrimination"
            ]
          ]
        },
        {
          "type": "formula",
          "tex": "\\begin{gathered}g(x)=w^\\top x+b,\\qquad\\hat y=\\operatorname{sign}(g(x)),\\\\ \\ell_{\\mathrm{hinge}}(y,g(x))=\\max(0,1-y\\,g(x)).\\end{gathered}",
          "explanation": "\\(g(x)\\) : score ; \\(\\hat y\\in\\{-1,+1\\}\\) : prédiction, \\(+1\\) si le score est nul."
        },
        {
          "type": "callout",
          "title": "Précision sur le support",
          "html": "<p>Chaque perte du tableau utilise le score \\(g(x)\\) ; la prévision \\(\\hat y\\) en découle : identité, seuil sur la probabilité logistique ou signe.</p>"
        },
        {
          "type": "figure",
          "src": "assets/lecture1/lossff.png",
          "alt": "Comparaison de la perte quadratique, une parabole centrée sur la cible, et de la perte charnière pour les classes −1 et +1.",
          "caption": "Demi-perte quadratique ; côté SVM, y′ est le score continu, pas la classe."
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
      "intro": "Perte moyenne, prédicteur optimal, fonction de régression, objectif d’apprentissage.",
      "objective": "Définir le risque, comprendre l’oracle et expliquer pourquoi le prédicteur appris dépend de l’échantillon.",
      "blocks": [
        {
          "type": "prose",
          "title": "Risque",
          "html": "<p>Le <strong>comportement moyen</strong> de la perte, pour une prévision fixée : son espérance sur la population.</p>"
        },
        {
          "type": "formula",
          "tex": "\\mathcal{R}(f)=\\mathbb{E}\\bigl[\\ell(Y,f(X))\\bigr]",
          "explanation": "Risque, ou erreur de généralisation. Couple futur \\((X,Y)\\) : même loi \\(\\mathbb{P}\\), indépendant de l’échantillon."
        },
        {
          "type": "prose",
          "title": "Fonction de prévision optimale",
          "html": "<p><strong>Aspect théorique :</strong> à perte donnée, la fonction de risque minimal, si elle existe, est optimale.</p>"
        },
        {
          "type": "formula",
          "tex": "\\begin{gathered}f^*\\in\\underset{f}{\\arg\\min}\\;\\mathcal{R}(f),\\\\ \\mathcal{R}(f^*)\\leq\\mathcal{R}(f)\\quad\\text{pour toute }f.\\end{gathered}",
          "explanation": "Dépend de la perte et, souvent, de la loi inconnue \\(\\mathbb{P}\\) : référence théorique."
        },
        {
          "type": "prose",
          "title": "Aspect pratique",
          "html": "<p>Loi inconnue : l’optimum n’est en général pas calculable directement. On cherche, à partir des données, un estimateur de risque proche de l’oracle.</p>"
        },
        {
          "type": "formula",
          "tex": "\\begin{gathered}\\hat f=\\hat f(\\cdot;D_n),\\\\ \\mathcal{R}(\\hat f)\\approx\\mathcal{R}(f^*).\\end{gathered}",
          "explanation": "\\(\\hat f\\) : apprise sur \\(D_n\\) ; \\(f^*\\) : référence. Autre échantillon, autre \\(\\hat f\\)."
        },
        {
          "type": "figure",
          "title": "Intuition",
          "src": "assets/lecture1/regression.png",
          "alt": "Nuage de points autour d’une courbe rouge ; une verticale à x = 4 met en évidence la dispersion des sorties à entrée fixée.",
          "caption": "À entrée fixée, plusieurs sorties possibles ; courbe rouge : fonction de régression."
        },
        {
          "type": "prose",
          "title": "Intuition",
          "html": "<p>À entrée fixée, plusieurs sorties possibles : laquelle prédire ? Sous perte quadratique, la <strong>moyenne conditionnelle</strong>.</p>"
        },
        {
          "type": "formula",
          "tex": "m^*(x)=\\mathbb{E}[Y\\mid X=x]",
          "explanation": "Moyenne de \\(Y\\) sachant \\(X=x\\) : optimale sous perte quadratique, pas pour toute perte."
        },
        {
          "type": "figure",
          "title": "Cas de la régression",
          "src": "assets/lecture1/ols.png",
          "alt": "Points bleus et droite noire ; des carrés rouges représentent les carrés des écarts verticaux entre les observations et la droite.",
          "caption": "Carrés rouges : résidus au carré ; l’ajustement quadratique réduit leur somme."
        },
        {
          "type": "formula",
          "tex": "\\begin{gathered}\\mathcal{Y}=\\mathbb{R},\\qquad f:\\mathcal{X}\\longrightarrow\\mathbb{R},\\\\ \\mathcal{R}(f)=\\mathbb{E}[(Y-f(X))^2],\\\\ m^*(x)=\\mathbb{E}[Y\\mid X=x].\\end{gathered}",
          "explanation": "Sous perte quadratique, l’optimum \\(f^*\\) est \\(m^*\\), en général inconnue. Moments d’ordre deux finis."
        },
        {
          "type": "callout",
          "title": "Précision sur le support",
          "html": "<p>Risque quadratique écrit <strong>sans le facteur \\(\\tfrac12\\)</strong> : une constante positive change le risque, pas son minimiseur.</p>"
        },
        {
          "type": "callout",
          "title": "Question du cours",
          "html": "<p><strong>Comment écrire le risque en discrimination ?</strong> Utiliser la perte 0–1.</p><details class=\"as-theory\"><summary>Réponse</summary><div><p>Avec la perte 0–1 :</p>\\[\\mathcal R(f)=\\mathbb E[\\mathbf 1_{\\{f(X)\\ne Y\\}}]=\\mathbb P(f(X)\\ne Y).\\]<p>Optimum : une classe de probabilité conditionnelle maximale :</p>\\[f^*(x)\\in\\operatorname*{argmax}_{k\\in\\mathcal Y}\\mathbb P(Y=k\\mid X=x).\\]<p>Égalité : convention de départage.</p></div></details>"
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
              "Observations i.i.d. de loi inconnue \\(\\mathbb{P}\\)."
            ],
            [
              "Prédicteur \\(f\\)",
              "Transformer une entrée en prévision."
            ],
            [
              "Coût \\(\\ell(Y,f(X))\\)",
              "Mesurer la perte sur un couple."
            ],
            [
              "Risque \\(\\mathcal{R}(f)\\)",
              "Moyenner ce coût sur la population."
            ],
            [
              "Oracle f*",
              "Minimiser le risque ; dépend de \\(\\mathbb{P}\\)."
            ]
          ]
        },
        {
          "type": "prose",
          "title": "Objectif",
          "html": "<p>Objectif : un algorithme qui <strong>généralise bien sur de nouvelles données</strong>, de risque proche de l’optimum.</p><p>Facteurs : <strong>choix du modèle et de sa complexité</strong>, <strong>quantité de données disponibles</strong>, <strong>compromis biais–variance</strong>.</p>"
        }
      ]
    },
    {
      "id": "biais-variance",
      "title": "Décomposition de l’erreur et compromis biais–variance",
      "duration": 12,
      "intro": "Biais, variance, bruit : décomposer l’erreur pour choisir la complexité.",
      "objective": "Interpréter les trois termes de l’erreur et distinguer variation des données et bruit de la réponse.",
      "blocks": [
        {
          "type": "prose",
          "title": "Décomposition de l’erreur : biais, variance et bruit",
          "html": "<p>À entrée fixée, l’erreur quadratique attendue se décompose en <strong>biais au carré</strong>, <strong>variance</strong> et <strong>bruit</strong>.</p><p>Hypothèses : bruit de variance constante, moments d’ordre deux finis, cible future indépendante de l’apprentissage.</p>"
        },
        {
          "type": "formula",
          "tex": "\\begin{gathered}m^*(x)=\\mathbb{E}[Y\\mid X=x],\\\\ Y=m^*(X)+\\varepsilon,\\qquad\\mathbb{E}[\\varepsilon\\mid X]=0.\\end{gathered}",
          "explanation": "\\(Y\\) : sortie aléatoire ; \\(m^*(x)\\) : moyenne théorique ; \\(\\hat f(x)\\) : prédiction apprise."
        },
        {
          "type": "formula",
          "tex": "\\begin{aligned}\\mathbb{E}\\!\\left[(Y-\\widehat f(X))^2\\mid X=x\\right]&=\\underbrace{\\left(m^*(x)-\\mathbb{E}[\\widehat f(x)]\\right)^2}_{\\text{biais au carré}}\\\\ &\\quad+\\underbrace{\\mathbb{E}\\!\\left[(\\widehat f(x)-\\mathbb{E}[\\widehat f(x)])^2\\right]}_{\\text{variance}}\\\\ &\\quad+\\underbrace{\\operatorname{Var}(\\varepsilon)}_{\\text{bruit}}.\\end{aligned}",
          "explanation": "Espérances en \\(\\hat f\\) : sur les échantillons d’apprentissage possibles."
        },
        {
          "type": "callout",
          "title": "Précision sur le support",
          "html": "<p>Bruit dépendant de l’entrée : le terme vaut \\(\\operatorname{Var}(Y\\mid X=x)\\) ; \\(\\operatorname{Var}(\\varepsilon)\\) suppose une variance constante.</p>"
        },
        {
          "type": "prose",
          "title": "Compromis Bias-Variance · Biais",
          "html": "<p>Le <strong>biais</strong> : écart entre prévision moyenne et vraie valeur. Un modèle trop restrictif peut le garder, même en répétant l’apprentissage.</p>"
        },
        {
          "type": "figure",
          "src": "assets/lecture1/jackpot.png",
          "alt": "Deux cibles : les impacts sont groupés près du centre pour le biais faible, et groupés à côté du centre pour le biais élevé.",
          "caption": "Biais : position moyenne des impacts par rapport au centre."
        },
        {
          "type": "prose",
          "title": "Compromis Bias-Variance · Variance",
          "html": "<p>La <strong>variance</strong> : combien les prévisions changent quand l’échantillon d’apprentissage change.</p>"
        },
        {
          "type": "figure",
          "src": "assets/lecture1/jacknot.png",
          "alt": "Deux cibles : les impacts sont regroupés pour une faible variance et dispersés pour une forte variance.",
          "caption": "Variance : dispersion des impacts, quel que soit le centrage."
        },
        {
          "type": "figure",
          "src": "assets/lecture1/trade.png",
          "alt": "Tableau comparant sous-ajustement, ajustement approprié et sur-ajustement : symptômes, cibles, exemples de régression et classification, courbes de perte et pistes de correction.",
          "caption": "Sous-ajustement, bon ajustement, sur-ajustement : symptômes, géométrie, courbes de perte, corrections."
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
          "html": "<ul><li>Erreurs propres à cet échantillon synthétique.</li><li>Moins d’erreur d’apprentissage n’implique pas moins d’erreur de validation.</li><li>Validation parfois en U, pas toujours.</li></ul>"
        }
      ]
    },
    {
      "id": "estimation-risque",
      "title": "Estimation du risque",
      "duration": 13,
      "intro": "Risque empirique, hold-out, validation croisée, Leave-One-Out : estimer l’erreur hors apprentissage.",
      "objective": "Décrire les algorithmes de validation et identifier les données utilisées pour apprendre ou évaluer chaque prévision.",
      "blocks": [
        {
          "type": "prose",
          "title": "Estimation du risque",
          "html": "<p>Loi inconnue : on remplace l’espérance par une moyenne sur les observations, le <strong>risque empirique</strong>.</p>"
        },
        {
          "type": "formula",
          "tex": "\\mathcal{R}_n(\\hat f)=\\frac1n\\sum_{i=1}^{n}\\ell(y_i,\\hat f(x_i))",
          "explanation": "Sur \\(D_n\\), qui a servi à construire \\(\\hat f\\), l’erreur peut être trop optimiste."
        },
        {
          "type": "callout",
          "title": "Solution",
          "html": "<p>Évaluer sur des observations non utilisées pour l’ajustement : principe de la validation simple et croisée.</p>"
        },
        {
          "type": "prose",
          "title": "Validation ou hold out",
          "html": "<p>On sépare : <strong>apprentissage</strong> \\(\\mathcal A\\) pour ajuster, <strong>validation</strong> \\(\\mathcal V\\) pour comparer.</p><ul><li>Prétraitements appris sur l’apprentissage seulement.</li><li>Données liées (sujet, date) : découper par groupe ou dans le temps.</li></ul>"
        },
        {
          "type": "formula",
          "tex": "\\begin{gathered}\\mathcal{A}\\cap\\mathcal{V}=\\varnothing,\\\\ \\mathcal{A}\\cup\\mathcal{V}=\\{1,\\ldots,n\\},\\\\ \\mathcal{D}_{\\mathrm{app}}=\\{(x_i,y_i):i\\in\\mathcal{A}\\},\\\\ \\mathcal{D}_{\\mathrm{valid}}=\\{(x_i,y_i):i\\in\\mathcal{V}\\}.\\end{gathered}",
          "explanation": "Parties disjointes. Le test final reste réservé à l’évaluation."
        },
        {
          "type": "prose",
          "title": "Algorithme · Validation ou Hold-Out",
          "html": "<ol><li><strong>Ajuster le modèle et les prétraitements</strong> sur l’apprentissage : \\(\\hat f_{\\mathrm{app}}=\\hat f(\\cdot;\\mathcal D_{\\mathrm{app}})\\).</li><li><strong>Prédire</strong> la validation, modèle et prétraitements fixés.</li><li><strong>Calculer</strong> la perte moyenne.</li></ol>"
        },
        {
          "type": "formula",
          "tex": "\\widehat{\\mathcal{R}}_{\\mathrm{valid}}=\\frac1{|\\mathcal{V}|}\\sum_{i\\in\\mathcal{V}}\\ell\\bigl(y_i,\\hat f_{\\mathrm{app}}(x_i)\\bigr).",
          "explanation": "Prévisions faites sans les réponses de validation. Précision liée à la taille de la validation."
        },
        {
          "type": "figure",
          "title": "Illustration",
          "src": "assets/lecture1/split.png",
          "alt": "Une bande de données répartie en trois parties : Train en bleu, Validation en orange et Test en vert.",
          "caption": "Apprentissage : ajuster ; validation : choisir ; test final : évaluer."
        },
        {
          "type": "callout",
          "title": "Commentaires",
          "html": "<p>Assez de données pour ajuster, assez pour estimer l’erreur, sur un même total.</p>"
        },
        {
          "type": "prose",
          "title": "Validation croisée K-blocs",
          "html": "<p>À chaque pli : apprendre sans un bloc, mesurer la perte sur ce bloc. Moyenner les \\(K\\) pertes.</p><p><strong>Réapprendre aussi les prétraitements dans chaque pli</strong>, sinon fuite d’information.</p>"
        },
        {
          "type": "formula",
          "tex": "\\begin{gathered}\\{B_1,\\ldots,B_K\\}\\text{ partitionne }\\{1,\\ldots,n\\},\\\\ \\mathcal{B}_k=\\{(x_i,y_i):i\\notin B_k\\},\\\\ \\hat f^{(-k)}=\\hat f(\\cdot;\\mathcal{B}_k).\\end{gathered}",
          "explanation": "\\(\\hat f^{(-k)}\\) : appris sans \\(B_k\\) (exposant \\((-k)\\)), évalué sur \\(B_k\\)."
        },
        {
          "type": "formula",
          "tex": "\\begin{gathered}\\widehat{\\mathcal{R}}_k=\\frac1{|B_k|}\\sum_{i\\in B_k}\\ell(y_i,\\hat f^{(-k)}(x_i)),\\\\ \\widehat{\\mathcal{R}}_{\\mathrm{CV}}=\\frac1K\\sum_{k=1}^{K}\\widehat{\\mathcal{R}}_k.\\end{gathered}",
          "explanation": "Même poids par bloc. Blocs de même taille : moyenne des pertes de toutes les observations, chacune prédite hors apprentissage."
        },
        {
          "type": "figure",
          "src": "assets/lecture1/k-block.png",
          "alt": "Trois configurations mettent successivement à l’écart les blocs B₁, B₂ et B₃ ; des flèches regroupent leurs résultats de validation.",
          "caption": "Apprendre sans \\(B_1\\), puis sans \\(B_2\\), puis sans \\(B_3\\) ; agréger les pertes."
        },
        {
          "type": "prose",
          "title": "Commentaires",
          "html": "<ul><li>\\(K\\) au choix, par exemple \\(K=10\\).</li><li>Ne dépend pas d’une seule séparation.</li><li>Plus de <strong>temps de calcul</strong> : un ajustement par bloc.</li></ul>"
        },
        {
          "type": "callout",
          "title": "Précision sur le support",
          "html": "<p>Pas toujours plus stable ni plus précise qu’une séparation simple : cela dépend de \\(K\\), des données, de l’algorithme.</p><p>Si elle sert à choisir, son score ne remplace pas un test final réservé.</p>"
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
          "html": "<p>\\(K=n\\) : validation croisée <strong>leave one out</strong> (LOO). Chaque observation est prédite par un modèle appris sans elle.</p>"
        },
        {
          "type": "formula",
          "tex": "\\begin{gathered}K=n,\\qquad D_n^{(-i)}=D_n\\setminus\\{(x_i,y_i)\\},\\\\ \\hat f^{(-i)}=\\hat f(\\cdot;D_n^{(-i)}),\\\\ \\widehat{\\mathcal{R}}_{\\mathrm{LOO}}=\\frac1n\\sum_{i=1}^{n}\\ell(y_i,\\hat f^{(-i)}(x_i)).\\end{gathered}",
          "explanation": "\\(\\hat f^{(-i)}\\) : appris sans l’observation \\(i\\). \\(n\\) ajustements : pour petits échantillons."
        }
      ]
    },
    {
      "id": "categorisation",
      "title": "Catégorisation",
      "duration": 5,
      "intro": "Du linéaire au non linéaire, puis à l’agrégation.",
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
          "caption": "Notre perspective : l’axe linéaire / non linéaire."
        },
        {
          "type": "callout",
          "title": "Précision sur le support",
          "html": "<ul><li><strong>Paramétrique</strong> : nombre fixé de paramètres, pas forcément gaussien.</li><li><strong>Non paramétrique</strong> : ni sans hypothèses, ni moins puissant par principe.</li><li>Un <strong>modèle linéaire</strong> n’exige pas une séparation parfaite.</li></ul>"
        },
        {
          "type": "prose",
          "title": "Pourquoi ce choix ?",
          "html": "<p>L’axe <strong>linéaire / non linéaire</strong> éclaire le compromis biais–variance et le choix d’une complexité adaptée aux données.</p><p>Commencer par un <strong>modèle linéaire simple</strong> ; passer à un <strong>modèle non linéaire</strong> si les données le justifient.</p>"
        },
        {
          "type": "figure",
          "title": "Guide selon Scikit-learn",
          "src": "assets/lecture1/sci.png",
          "alt": "Arbre d’orientation scikit-learn répartissant les méthodes entre classification, régression, clustering et réduction de dimension.",
          "caption": "Familles de méthodes selon la tâche et les données ; valider ensuite le choix."
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
          "html": "<p>Chapitre suivant : les <strong>algorithmes linéaires</strong> (géométrie, prévision, critères d’apprentissage).</p>"
        }
      ]
    }
  ]
};
