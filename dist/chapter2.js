window.SID34_CHAPTER_2 = {
  "id": "lineaires",
  "number": "02",
  "title": "Algorithmes linéaires",
  "subtitle": "Linéarité, modèles supervisés et construction des Support Vector Machines.",
  "duration": 90,
  "lessons": [
    {
      "id": "geometrie",
      "title": "Linéarité et modèles",
      "duration": 15,
      "intro": "Une approximation linéaire sert à ajuster, séparer ou représenter des données.",
      "objective": "Définir un hyperplan et interpréter son vecteur normal, son biais et le signe d’un score.",
      "blocks": [
        {
          "type": "prose",
          "title": "L’idée générale",
          "html": "<p>Beaucoup d’algorithmes reposent sur une <strong>approximation linéaire</strong> :</p><ul><li>avec \\(Y\\) : combinaison des caractéristiques approchant \\(Y\\) ;</li><li>sans \\(Y\\) : représentation linéaire des données.</li></ul>"
        },
        {
          "type": "formula",
          "tex": "y\\approx w\\cdot x+b",
          "explanation": "\\(w\\) pondère les caractéristiques de \\(x\\) ; \\(b\\) est le terme constant."
        },
        {
          "type": "table",
          "headers": [
            "Cadre",
            "Intuition géométrique"
          ],
          "rows": [
            [
              "Régression",
              "Ajuster un hyperplan aux observations."
            ],
            [
              "Discrimination binaire",
              "Séparer deux classes par un hyperplan."
            ],
            [
              "Non supervisé",
              "Axes linéaires portant la variance."
            ]
          ]
        },
        {
          "type": "callout",
          "title": "Ce que permet la linéarité",
          "html": "<p>La linéarité simplifie l’apprentissage, mais restreint les relations représentables.</p>"
        },
        {
          "type": "prose",
          "title": "Hyperplan : définition",
          "html": "<p>Dans un espace \\(E\\) de dimension \\(n\\), un <strong>hyperplan</strong> est un sous-espace affine de dimension \\(n-1\\).</p>"
        },
        {
          "type": "formula",
          "tex": "H=\\{x\\in\\mathbb{R}^{n}:w\\cdot x+b=0\\},\\qquad w\\in\\mathbb{R}^{n}\\setminus\\{0\\},\\quad b\\in\\mathbb{R}",
          "explanation": "\\(w\\) : vecteur normal ; \\(b\\) : décalage. Si \\(b=0\\) : passage par l’origine (sous-espace vectoriel)."
        },
        {
          "type": "table",
          "headers": [
            "Espace",
            "Hyperplan affine",
            "Hyperplan vectoriel"
          ],
          "rows": [
            [
              "\\(\\mathbb{R}^{2}\\)",
              "Une droite.",
              "\\(\\operatorname{Vect}(a)\\), \\(a\\neq0\\)."
            ],
            [
              "\\(\\mathbb{R}^{3}\\)",
              "Un plan.",
              "\\(\\operatorname{Vect}(a,b)\\), \\(a\\) et \\(b\\) non colinéaires."
            ],
            [
              "\\(\\mathbb{R}^{1}\\)",
              "Un point.",
              "Le point \\(0\\)."
            ]
          ]
        },
        {
          "type": "prose",
          "title": "Lien avec les modèles linéaires",
          "html": "<ul><li>Apprendre : déterminer \\((w,b)\\).</li><li>\\(w\\) fixe l’<strong>orientation</strong>, \\(b\\) le <strong>positionnement</strong>.</li><li>En discrimination, le signe du score donne le côté.</li></ul>"
        },
        {
          "type": "formula",
          "tex": "\\begin{cases}w\\cdot x+b>0&\\text{un côté de l’hyperplan},\\\\w\\cdot x+b<0&\\text{l’autre côté},\\\\w\\cdot x+b=0&\\text{sur l’hyperplan}.\\end{cases}",
          "explanation": "À coefficients fixés, le signe donne une règle de discrimination binaire."
        },
        {
          "type": "figure",
          "src": "assets/lecture2/hyp.png",
          "alt": "Trois exemples : un seuil de fréquence cardiaque à 100 bpm, une droite de régression et un plan de régression.",
          "caption": "Seuil en dimension 1, droite et plan de régression."
        },
        {
          "type": "exercise",
          "title": "À faire — le vecteur normal",
          "question": "<p>Soit \\(w=(2,-1)\\) et un hyperplan passant par l’origine.</p><ol><li>Écrire l’équation de la droite.</li><li>De quel côté sont \\(x_1=(1,1)\\) et \\(x_2=(1,3)\\) ?</li><li>Interpréter le signe du score.</li></ol>",
          "answer": "<ol><li>Origine : \\(b=0\\). Droite : \\(2x_1-x_2=0\\), soit \\(x_2=2x_1\\).</li><li>Score en \\((1,1)\\) : \\(2-1=1\\) ; en \\((1,3)\\) : \\(2-3=-1\\).</li><li>Signes opposés : points de part et d’autre de la droite. Le vecteur \\((2,-1)\\) lui est perpendiculaire.</li></ol>"
        }
      ]
    },
    {
      "id": "supervises",
      "title": "Des hypothèses aux modèles supervisés",
      "duration": 12,
      "intro": "Pas de modèle sans hypothèses ; en supervisé, réponse et perte précisent le problème.",
      "objective": "Relier les hypothèses de linéarité à la régression, à la discrimination et à la minimisation des erreurs.",
      "blocks": [
        {
          "type": "prose",
          "title": "Théorème du No Free Lunch",
          "html": "<p>Tout modèle simplifie la réalité par des hypothèses. Hypothèse linéaire : réponse = combinaison linéaire des caractéristiques + résidus.</p>"
        },
        {
          "type": "callout",
          "title": "Wolpert, 1996 — message du No Free Lunch",
          "html": "<p><strong>Sans hypothèse sur les données, aucun modèle n’est universellement meilleur qu’un autre.</strong> Chaque modèle est utile dans un contexte.</p><p>Le théorème ne dit pas que tous se valent sur un jeu de données précis.</p>"
        },
        {
          "type": "prose",
          "title": "Modèles linéaires supervisés",
          "html": "<p>On prédit \\(Y\\) à partir de \\(X\\) par une combinaison linéaire ; la méthode dépend de la réponse et de l’objectif.</p>"
        },
        {
          "type": "formula",
          "tex": "Y\\approx\\beta_0+\\beta_1X_1+\\cdots+\\beta_dX_d",
          "explanation": "Deux écritures des mêmes coefficients : \\(\\beta_0=b\\) et \\(\\beta_j=w_j\\)."
        },
        {
          "type": "table",
          "headers": [
            "Méthode",
            "Réponse / objectif"
          ],
          "rows": [
            [
              "Régression linéaire",
              "\\(Y\\) réelle."
            ],
            [
              "Régression logistique",
              "\\(Y\\in\\{0,1\\}\\) ; log-odds linéaires."
            ],
            [
              "SVM linéaire",
              "Marge maximale, relâchée si nécessaire."
            ]
          ]
        },
        {
          "type": "prose",
          "title": "Régression",
          "html": "<p><strong>Prévision affine</strong> \\(f_\\beta(x)\\). L’apprentissage donne \\(\\hat\\beta\\), puis le prédicteur \\(\\hat f=f_{\\hat\\beta}\\).</p>"
        },
        {
          "type": "formula",
          "tex": "\\begin{aligned}\\hat\\beta&\\in\\operatorname*{argmin}_{\\beta}\\frac1n\\sum_{i=1}^{n}\\ell(y_i,f_\\beta(x_i)),\\\\ \\hat f(x)&=f_{\\hat\\beta}(x)=\\hat\\beta_0+\\sum_{j=1}^{d}\\hat\\beta_jx_j,\\\\ \\hat y&=\\hat f(x).\\end{aligned}",
          "explanation": "\\(\\beta\\) : coefficients candidats ; \\(\\hat\\beta\\) : coefficients appris ; \\(\\hat y\\) : prévision numérique."
        },
        {
          "type": "prose",
          "title": "Discrimination binaire",
          "html": "<p>On apprend une <strong>fonction de décision linéaire</strong> ; son signe donne la classe prédite.</p>"
        },
        {
          "type": "formula",
          "tex": "g(x)=w\\cdot x+b,\\qquad\\hat y=\\operatorname{sign}(g(x))",
          "explanation": "\\(g(x)\\) : score réel ; décision \\(\\hat y\\in\\{-1,+1\\}\\), \\(+1\\) à score nul ; \\(y\\) : classe observée."
        },
        {
          "type": "table",
          "headers": [
            "Ce qui distingue les méthodes",
            "Exemples"
          ],
          "rows": [
            [
              "Fonction de perte",
              "Perte logistique, hinge loss."
            ],
            [
              "Régularisation",
              "Pénalité L1 ou L2 (norme, marge)."
            ]
          ]
        },
        {
          "type": "prose",
          "title": "Minimiser les erreurs",
          "html": "<p><strong>Régression linéaire sous perte quadratique</strong> : minimiser la somme des résidus au carré, dont la moyenne est la MSE.</p>"
        },
        {
          "type": "formula",
          "tex": "\\begin{aligned}f_\\beta(x)&=\\beta_0+\\sum_{j=1}^{d}\\beta_jx_j,\\\\ \\hat\\beta&\\in\\operatorname*{argmin}_{\\beta}\\sum_{i=1}^{n}(y_i-f_\\beta(x_i))^2,\\\\ \\hat y_i&=f_{\\hat\\beta}(x_i),\\quad\\operatorname{MSE}=\\frac1n\\sum_{i=1}^{n}(y_i-\\hat y_i)^2.\\end{aligned}",
          "explanation": "\\(\\hat y_i\\) utilise \\(\\hat\\beta\\) ; diviser l’objectif par \\(n\\) ne change pas les minimiseurs."
        },
        {
          "type": "figure",
          "src": "assets/lecture2/reglin.png",
          "alt": "Ventes en fonction de TV : coefficients estimés, droite ajustée et résidus, courbes de niveau et surface de la somme des carrés des résidus RSS.",
          "caption": "Ventes–TV : ajustement, coefficients et objectif RSS. Source : James et al., An Introduction to Statistical Learning, 2013."
        },
        {
          "type": "demo",
          "kind": "risk",
          "preset": {
            "lossScale": 1
          },
          "title": "Exploration facultative — déplacer la droite",
          "caption": "Exemple synthétique complémentaire. Déplacez une droite pour voir les résidus et leur MSE ; la figure de régression du cours reste le point de référence."
        }
      ]
    },
    {
      "id": "svm-geometrie",
      "title": "Support Vector Machines",
      "duration": 12,
      "intro": "Les SVM raisonnent sur la distance des observations à la frontière : calculons-la.",
      "objective": "Distinguer SVC et SVR, puis calculer la distance d’un point à une droite.",
      "blocks": [
        {
          "type": "prose",
          "title": "L’idée des SVM",
          "html": "<p>Les <strong>Support Vector Machines</strong> apprennent une frontière linéaire qui maximise une marge.</p>"
        },
        {
          "type": "formula",
          "tex": "g(x)=w\\cdot x+b,\\qquad \\hat y=\\operatorname{sign}(g(x))",
          "explanation": "\\(g\\) : score réel, pas une probabilité. Frontière \\(g(x)=0\\) ; on prédit \\(+1\\) si \\(g(x)\\ge0\\), \\(-1\\) sinon."
        },
        {
          "type": "table",
          "headers": [
            "Variante",
            "Problème"
          ],
          "rows": [
            [
              "SVC — discrimination",
              "Séparer deux classes \\(Y\\in\\{-1,+1\\}\\)."
            ],
            [
              "SVR — régression",
              "Approcher une réponse numérique à une tolérance près."
            ]
          ]
        },
        {
          "type": "prose",
          "title": "Principe géométrique du SVM linéaire",
          "html": "<p>La distance d’un point à une droite se mesure perpendiculairement : valeur absolue du score divisée par la norme du vecteur normal.</p>"
        },
        {
          "type": "formula",
          "tex": "\\begin{aligned}ax+by+c&=0,\\\\d\\bigl((x_0,y_0),H\\bigr)&=\\frac{|ax_0+by_0+c|}{\\sqrt{a^2+b^2}}.\\end{aligned}",
          "explanation": "\\(a\\) et \\(b\\) non tous deux nuls ; \\(b\\) : coefficient de \\(y\\) (pas le biais) ; \\(c\\) : terme constant."
        },
        {
          "type": "figure",
          "src": "assets/lecture2/hyperp.png",
          "alt": "Droite x₂ = −2x₁ passant par l’origine, vecteur normal w et observations de part et d’autre, dont le point A.",
          "caption": "Droite \\(x_2=-2x_1\\), vecteur normal \\((2,1)\\) ; calcul ci-dessous pour \\(A=(3,4)\\)."
        },
        {
          "type": "prose",
          "title": "Exemple — la droite \\(y=-2x\\)",
          "html": "<p>Forme \\(2x+y=0\\) : \\(a=2\\), \\(b=1\\), \\(c=0\\). Point \\(A=(3,4)\\).</p>"
        },
        {
          "type": "formula",
          "tex": "d(A,H)=\\frac{|2(3)+1(4)+0|}{\\sqrt{2^2+1^2}}=\\frac{10}{\\sqrt5}=2\\sqrt5",
          "explanation": "Distance du seul point \\(A\\) : pas encore la marge de l’échantillon."
        }
      ]
    },
    {
      "id": "marge-dure",
      "title": "Marge maximale et formulation du problème",
      "duration": 12,
      "intro": "Distance, normalisation du score, optimisation : six étapes relient formules et géométrie.",
      "objective": "Relier distance minimale, frontières de marge et problème primal à marge dure.",
      "blocks": [
        {
          "type": "prose",
          "title": "Notion de marge",
          "html": "<p>Pour une frontière séparatrice, la <strong>marge symétrique</strong> vaut deux fois la plus petite distance à la frontière. En marge dure, cette bande est vide.</p>"
        },
        {
          "type": "formula",
          "tex": "d_{\\min}=\\min_i d(x_i,H),\\qquad m=2d_{\\min}",
          "explanation": "Le minimum est essentiel : doubler la distance d’un point quelconque ne suffit pas."
        },
        {
          "type": "figure",
          "src": "assets/lecture2/margin.png",
          "alt": "Une droite centrale rouge, deux bords bleus parallèles et un segment violet M₁ représentant la largeur de la bande dans la direction normale.",
          "caption": "\\(A=(3,4)\\) et \\(B=(2,6)\\) sont les plus proches : \\(d_{\\min}=2\\sqrt5\\), largeur de bande \\(4\\sqrt5\\), mesurée perpendiculairement."
        },
        {
          "type": "prose",
          "title": "Exemple du cours : quand \\(d=2\\sqrt5\\)",
          "html": "<p>Si \\(2\\sqrt5\\) est la <strong>distance minimale</strong>, on obtient la largeur ci-dessous, pas forcément maximale.</p>"
        },
        {
          "type": "formula",
          "tex": "m=2\\times2\\sqrt5=4\\sqrt5",
          "explanation": "Valable seulement si ce point est parmi les plus proches de la frontière."
        },
        {
          "type": "prose",
          "title": "Marge maximale dans les SVM",
          "html": "<ul><li>\\((w,b)\\) multiplié par un réel positif : même frontière, autres scores.</li><li>Séparation stricte : on fixe \\(\\min_i y_i\\,g(x_i)=1\\).</li><li>Niveaux \\(+1\\) et \\(-1\\) : bords de la marge.</li></ul>"
        },
        {
          "type": "formula",
          "tex": "\\begin{aligned}H_1&:\\ w\\cdot x+b=1,\\\\H_2&:\\ w\\cdot x+b=-1,\\\\m&=\\frac{2}{\\|w\\|}.\\end{aligned}",
          "explanation": "Après normalisation, maximiser \\(m\\) revient à minimiser la norme de \\(w\\)."
        },
        {
          "type": "figure",
          "src": "assets/lecture2/dis.png",
          "alt": "Deux droites parallèles vertes, un segment perpendiculaire rouge de longueur d et une formule de distance utilisant leurs termes constants.",
          "caption": "Droites parallèles de mêmes coefficients normaux \\((a,b)\\). Bords du SVM : niveaux distants de \\(2\\)."
        },
        {
          "type": "prose",
          "title": "Formulation du problème — données séparables",
          "html": "<p>Avec \\(y_i\\in\\{-1,+1\\}\\), la contrainte \\(y_i\\,g(x_i)\\ge1\\) impose la bonne classe et une distance d’au moins \\(1/\\|w\\|\\). Sans séparation linéaire stricte : problème <strong>irréalisable</strong>.</p>"
        },
        {
          "type": "formula",
          "tex": "\\begin{aligned}\\min_{w,b}\\quad&\\frac12\\|w\\|^2\\\\\\text{sous les contraintes}\\quad&y_i(w\\cdot x_i+b)\\ge1,\\qquad\\forall i.\\end{aligned}",
          "explanation": "Primal à marge dure : maximiser la marge équivaut à cet objectif quadratique."
        },
        {
          "type": "callout",
          "title": "Convexité et solution",
          "html": "<p>Problème quadratique convexe. Données linéairement séparables, deux classes présentes : solution primale \\((w,b)\\) unique.</p>"
        },
        {
          "type": "svm-story",
          "title": "Comprendre le SVM pas à pas"
        }
      ]
    },
    {
      "id": "marge-souple",
      "title": "Cas non parfaitement séparables",
      "duration": 12,
      "intro": "Bruit ou classes qui se recouvrent : pas de séparation parfaite. Des relâchements mesurent et pénalisent les violations.",
      "objective": "Lire les contraintes de marge souple et expliquer le rôle des variables ξ et du paramètre C.",
      "blocks": [
        {
          "type": "prose",
          "title": "Données bruitées ou non linéaires",
          "html": "<p>Chaque observation reçoit une variable de relâchement \\(\\xi_i\\ge0\\), qui l’autorise à violer la marge.</p>"
        },
        {
          "type": "formula",
          "tex": "y_i(w\\cdot x_i+b)\\ge1-\\xi_i,\\qquad\\xi_i\\ge0",
          "explanation": "Si \\(\\xi_i=0\\) : contrainte de marge dure. Une valeur positive la relâche."
        },
        {
          "type": "prose",
          "title": "Problème régularisé — SVM souple",
          "html": "<p>\\(C\\) pondère violations et norme. À \\(w\\) et \\(b\\) fixés, le relâchement minimal est la <strong>perte charnière</strong> : \\(\\xi_i=\\max(0,\\,1-y_i\\,g(x_i))\\).</p>"
        },
        {
          "type": "formula",
          "tex": "\\begin{aligned}\\min_{w,b,\\xi}\\quad&\\frac12\\|w\\|^2+C\\sum_{i=1}^{n}\\xi_i\\\\\\text{sous les contraintes}\\quad&y_i(w\\cdot x_i+b)\\ge1-\\xi_i,\\\\&\\xi_i\\ge0,\\qquad\\forall i,\\qquad C>0.\\end{aligned}",
          "explanation": "Grand \\(C\\) : violations coûteuses. Petit \\(C\\) : priorité à la minimisation de la norme."
        },
        {
          "type": "callout",
          "title": "Une violation de marge n’est pas toujours une erreur",
          "html": "<ul><li>Bon côté, mais dans la marge : bien classé, relâchement positif.</li><li>Mauvais côté : relâchement minimal supérieur à 1.</li></ul>"
        },
        {
          "type": "formula",
          "tex": "\\xi_i^{\\min}=\\max\\!\\left(0,\\;1-y_i(w\\cdot x_i+b)\\right)",
          "explanation": "À \\(w\\) et \\(b\\) fixés, relâchement minimal = hinge loss du score continu, pas de la classe prédite."
        },
        {
          "type": "table",
          "headers": [
            "Marge signée \\(y_i\\,g(x_i)\\)",
            "Position",
            "Relâchement minimal \\(\\xi_i\\)"
          ],
          "rows": [
            [
              "Au moins 1",
              "Bien classé, sur le bord ou au-delà.",
              "0"
            ],
            [
              "Entre 0 et 1",
              "Bien classé, dans la marge.",
              "Entre 0 et 1"
            ],
            [
              "0",
              "Sur la frontière.",
              "1"
            ],
            [
              "Négative",
              "Mal classé.",
              "Supérieur à 1"
            ]
          ]
        },
        {
          "type": "exercise",
          "title": "Vérification facultative — lire un relâchement",
          "question": "<p>Un point de label \\(+1\\) a pour score \\(0{,}4\\).</p><ol><li>Est-il bien classé ?</li><li>Respecte-t-il la marge dure ?</li><li>Quel est le plus petit relâchement compatible ?</li></ol>",
          "answer": "<ol><li>Score positif : bien classé.</li><li>Marge signée \\(0{,}4&lt;1\\) : il viole la marge dure.</li><li>\\(\\xi\\ge1-0{,}4=0{,}6\\) : relâchement minimal \\(0{,}6\\).</li></ol>"
        },
        {
          "type": "prose",
          "title": "Du relâchement à la perte charnière",
          "html": "<ul><li>Comme \\(C&gt;0\\), minimiser en \\(\\xi\\) rend chaque relâchement minimal.</li><li>D’où un problème équivalent : somme des pertes charnières + pénalité quadratique sur \\(w\\).</li><li>Remplacer \\(g(x)\\) par \\(\\operatorname{sign}(g(x))\\) effacerait l’information de marge.</li><li>Perte charnière : convexe, non dérivable en \\(y_i\\,g(x_i)=1\\).</li></ul>"
        },
        {
          "type": "formula",
          "tex": "\\min_{w,b}\\;\\frac12\\|w\\|^2+C\\sum_i\\max(0,1-y_i g(x_i))",
          "explanation": "Objectif sans \\(\\xi\\). Le biais \\(b\\) est libre, non pénalisé."
        },
        {
          "type": "callout",
          "title": "Choisir \\(C\\) sans fuite d’information",
          "html": "<ul><li>Mise à l’échelle apprise sur l’apprentissage seul ; \\(C\\) par validation croisée ; test final pour l’évaluation.</li><li>\\(C\\) dépend de l’échelle et de la convention (somme ou moyenne des pertes) : avec \\(\\tfrac{\\lambda}{2}\\|w\\|^{2}+\\text{moyenne des pertes}\\), même solution si \\(\\lambda=1/(nC)\\).</li><li>Un grand \\(C\\) ne garantit ni zéro erreur ni meilleure généralisation.</li></ul>"
        }
      ]
    },
    {
      "id": "dualite",
      "title": "Vecteurs de support et solution duale",
      "duration": 12,
      "intro": "Le dual écrit le vecteur normal avec quelques observations : les vecteurs de support.",
      "objective": "Suivre le passage du Lagrangien au dual et interpréter les multiplicateurs α.",
      "blocks": [
        {
          "type": "prose",
          "title": "Principe du Lagrangien",
          "html": "<p>En <strong>marge dure</strong>, un multiplicateur \\(\\alpha_i\\ge0\\) par contrainte ; le Lagrangien combine objectif et contraintes.</p>"
        },
        {
          "type": "formula",
          "tex": "\\begin{aligned}L(w,b,\\alpha)=\\frac12\\|w\\|^2-\\sum_{i=1}^{n}\\alpha_i\\bigl[y_i(w\\cdot x_i+b)-1\\bigr],\\\\\\alpha_i\\ge0,\\qquad i=1,\\ldots,n.\\end{aligned}",
          "explanation": "Signe « − » : contraintes \\(y_i(w\\cdot x_i+b)\\ge1\\). Dual : minimiser en \\(w\\) et \\(b\\), puis maximiser en \\(\\alpha\\)."
        },
        {
          "type": "prose",
          "title": "Pourquoi les observations apparaissent dans \\(w\\)",
          "html": "<p>Stationnarité en \\(w\\) et \\(b\\) : \\(w\\) devient une combinaison d’observations, et les multiplicateurs s’équilibrent.</p>"
        },
        {
          "type": "formula",
          "tex": "\\begin{aligned}\\nabla_w L&=w-\\sum_i\\alpha_i y_i x_i=0,\\\\\\frac{\\partial L}{\\partial b}&=-\\sum_i\\alpha_i y_i=0,\\\\\\Longrightarrow\\quad w&=\\sum_i\\alpha_i y_i x_i,\\qquad\\sum_i\\alpha_i y_i=0.\\end{aligned}",
          "explanation": "Valable pour un score affine, à biais \\(b\\) libre."
        },
        {
          "type": "prose",
          "title": "Problème dual",
          "html": "<p>On substitue \\(w\\) dans le Lagrangien : objectif en \\(\\alpha\\), avec les produits scalaires entre observations.</p>"
        },
        {
          "type": "formula",
          "tex": "\\begin{aligned}\\max_{\\alpha}\\quad&\\sum_i\\alpha_i-\\frac12\\sum_{i,j}\\alpha_i\\alpha_jy_i y_j(x_i\\cdot x_j)\\\\\\text{sous les contraintes}\\quad&\\alpha_i\\ge0,\\qquad\\forall i,\\\\&\\sum_i\\alpha_i y_i=0.\\end{aligned}",
          "explanation": "Dual de la marge dure : aucune borne supérieure \\(C\\) sur les multiplicateurs."
        },
        {
          "type": "formula",
          "tex": "w=\\sum_i\\alpha_i y_i x_i",
          "explanation": "Seules les observations avec \\(\\alpha_i>0\\) contribuent : les vecteurs de support."
        },
        {
          "type": "callout",
          "title": "Interpréter les vecteurs de support",
          "html": "<ul><li>Marge dure : supports sur les bords.</li><li>Multiplicateur nul : aucune contribution à \\(w\\).</li><li>Le score s’écrit avec les supports et \\(b\\), via des produits scalaires.</li></ul>"
        },
        {
          "type": "formula",
          "tex": "g(x)=\\sum_i\\alpha_i y_i(x_i\\cdot x)+b",
          "explanation": "Même score linéaire, écrit avec les observations de support."
        },
        {
          "type": "callout",
          "title": "Justification facultative — complémentarité",
          "html": "<p>Complémentarité : un multiplicateur positif impose une contrainte de marge active. En marge souple, en plus \\(\\alpha_i\\le C\\).</p>"
        },
        {
          "type": "formula",
          "tex": "\\begin{aligned}\\text{Marge dure :}\\quad&\\alpha_i\\bigl[y_i(w\\cdot x_i+b)-1\\bigr]=0,\\\\\\alpha_i>0\\quad&\\Longrightarrow\\quad y_i(w\\cdot x_i+b)=1,\\\\\\text{Marge souple :}\\quad&0\\le\\alpha_i\\le C.\\end{aligned}",
          "explanation": "Support : sur un bord en marge dure ; en marge souple, aussi dans la marge ou mal classé."
        },
        {
          "type": "prose",
          "title": "Pourquoi \\(\\alpha\\) est borné par \\(C\\) en marge souple",
          "html": "<ul><li>Multiplicateurs \\(\\mu_i\\ge0\\) pour les contraintes \\(\\xi_i\\ge0\\).</li><li>Stationnarité en \\(\\xi_i\\) : \\(C-\\alpha_i-\\mu_i=0\\), donc \\(0\\le\\alpha_i\\le C\\).</li><li>Même objectif dual, avec \\(\\sum_i\\alpha_iy_i=0\\).</li></ul>"
        },
        {
          "type": "formula",
          "tex": "\\begin{aligned}\\alpha_i[y_i g(x_i)-1+\\xi_i]&=0,\\\\(C-\\alpha_i)\\xi_i&=0.\\end{aligned}",
          "explanation": "Complémentarité en marge souple, \\(\\xi_i\\) minimal. Si \\(0<\\alpha_i<C\\), alors \\(\\xi_i=0\\) et \\(y_i\\,g(x_i)=1\\)."
        },
        {
          "type": "table",
          "headers": [
            "Multiplicateur",
            "À l’optimum"
          ],
          "rows": [
            [
              "\\(\\alpha_i=0\\)",
              "\\(y_i\\,g(x_i)\\ge1\\) : pas de contribution à \\(w\\)."
            ],
            [
              "\\(0<\\alpha_i<C\\)",
              "\\(y_i\\,g(x_i)=1\\) : support sur un bord."
            ],
            [
              "\\(\\alpha_i=C\\)",
              "\\(y_i\\,g(x_i)\\le1\\) : sur le bord, dans la marge ou mal classé."
            ]
          ]
        },
        {
          "type": "callout",
          "title": "Retrouver le biais \\(b\\)",
          "html": "<ul><li>Marge dure : un support \\(\\alpha_s&gt;0\\) donne \\(b=y_s-w\\cdot x_s\\).</li><li>Marge souple : <strong>support libre</strong> requis, \\(0&lt;\\alpha_s&lt;C\\) ; moyenner sur plusieurs.</li><li>Aucun support libre : les inégalités KKT encadrent seulement \\(b\\) ; ne pas utiliser un support quelconque.</li><li>Le \\(w\\) optimal est unique ; en marge souple, \\(b\\) et les multiplicateurs peuvent ne pas l’être.</li></ul>"
        }
      ]
    },
    {
      "id": "hard-soft",
      "title": "Hard margin vs. Soft Margin",
      "duration": 10,
      "intro": "Même objectif géométrique ; la marge souple autorise des violations et les pénalise.",
      "objective": "Comparer les contraintes des deux problèmes et interpréter le compromis contrôlé par C.",
      "blocks": [
        {
          "type": "prose",
          "title": "Ce qui détermine la frontière",
          "html": "<p>Le SVM s’exprime à partir des <strong>vecteurs de support</strong>. Maximiser la marge normalisée revient à minimiser la norme du vecteur normal, ce qui contrôle la complexité du score.</p>"
        },
        {
          "type": "table",
          "headers": [
            "Formulation",
            "Contraintes",
            "Situation"
          ],
          "rows": [
            [
              "Hard margin",
              "Aucune violation de marge.",
              "Données linéairement séparables."
            ],
            [
              "Soft margin",
              "Relâchées par des \\(\\xi_i\\ge0\\).",
              "Violations autorisées et pénalisées."
            ]
          ]
        },
        {
          "type": "formula",
          "tex": "\\begin{aligned}\\text{Hard margin SVM :}\\quad&\\min_{w,b}\\frac12\\|w\\|^2\\\\&\\text{sous }y_i(w\\cdot x_i+b)\\ge1,\\quad\\forall i.\\end{aligned}",
          "explanation": "Pas de relâchement : aucune observation dans la marge."
        },
        {
          "type": "formula",
          "tex": "\\begin{aligned}\\text{Soft margin SVM :}\\quad&\\min_{w,b,\\xi}\\frac12\\|w\\|^2+C\\sum_{i=1}^{n}\\xi_i\\\\&\\text{sous }y_i(w\\cdot x_i+b)\\ge1-\\xi_i,\\\\&\\xi_i\\ge0,\\quad\\forall i.\\end{aligned}",
          "explanation": "Violations mises en balance avec la norme de \\(w\\) : points possibles dans la marge ou mal classés."
        },
        {
          "type": "prose",
          "title": "Le paramètre \\(C\\) règle le compromis",
          "html": "<ul><li><strong>Grand C</strong> : violations coûteuses, marge plus étroite.</li><li><strong>Petit C</strong> : relâchements tolérés pour réduire la norme de w, marge plus large.</li></ul><p>Tendance, sans garantie de performance.</p>"
        },
        {
          "type": "callout",
          "title": "Et si on a plusieurs classes ?",
          "html": "<p>Plus de deux classes : combiner des problèmes binaires, un contre tous ou un contre un.</p>"
        }
      ]
    },
    {
      "id": "multiclasses",
      "title": "SVMs pour la discrimination multi-class",
      "duration": 5,
      "intro": "Deux stratégies ramènent K classes à plusieurs problèmes binaires.",
      "objective": "Compter les modèles OvR et OvO et expliquer comment leurs décisions sont combinées.",
      "blocks": [
        {
          "type": "figure",
          "src": "assets/lecture2/types.png",
          "alt": "Figure historique des décisions binaires OvR et OvO : les points d’interrogation signalent les ambiguïtés d’une combinaison des signes, avant application de la règle finale.",
          "caption": "Figure historique : les signes seuls laissent des zones ambiguës ; en OvR, le plus grand score tranche."
        },
        {
          "type": "prose",
          "title": "One vs Rest — OvR",
          "html": "<p>Pour chaque classe \\(k\\), un SVM sépare <strong>la classe \\(k\\) de toutes les autres</strong>. On prédit le plus grand des \\(K\\) scores.</p>"
        },
        {
          "type": "formula",
          "tex": "N_{\\mathrm{OvR}}=K,\\qquad\\hat y(x)=\\operatorname*{argmax}_{k\\in\\{1,\\ldots,K\\}}g_k(x)",
          "explanation": "Score du classifieur « classe \\(k\\) contre les autres » ; convention en cas d’égalité."
        },
        {
          "type": "prose",
          "title": "One vs One — OvO",
          "html": "<p>Un SVM par paire \\((k,l)\\), comme un duel. Vote : on retient la classe qui gagne le plus de duels.</p>"
        },
        {
          "type": "formula",
          "tex": "N_{\\mathrm{OvO}}=\\binom K2=\\frac{K(K-1)}2",
          "explanation": "Un modèle par paire non ordonnée. Pour \\(K=4\\) : \\(4\\) modèles en OvR, \\(6\\) en OvO."
        },
        {
          "type": "references",
          "links": [
            {
              "label": "Stanford CS229 · SVM, Lagrangien et dual (PDF)",
              "url": "https://cs229.stanford.edu/main_notes.pdf"
            },
            {
              "label": "Cornell 2026 · SVM, géométrie et optimisation (PDF)",
              "url": "https://www.cs.cornell.edu/courses/cs3780/2026sp/slides/lec13.pdf"
            }
          ]
        }
      ]
    }
  ]
};
