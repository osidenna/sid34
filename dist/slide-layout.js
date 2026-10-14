(function () {
  'use strict';
  const specs = {
    fondements: {
      'introduction-generale': [
        ['Vue d’ensemble du cours',[0]], ['Plan du cours',[1]], ['Contexte',[3]], ['Deux approches',[4,5]],
        ['Apprentissage statistique et machine learning',[6]], ['Problématiques associées à l’apprentissage',[7]],
        ['Notations et significations',[8,9]], ['Problème d’apprentissage supervisé',[10]], ['Apprentissage non supervisé',[11]], ['Le prix Netflix',[12,15,13,14]]
      ],
      'regression-discrimination': [['Régression vs discrimination · données et objectifs',[0,1,2]],['Régression vs discrimination · vocabulaire',[3,4]],['Un début de formalisation mathématique',[5,6]],['Fonction de prévision et paramètres',[7,8,9]]],
      'fonction-perte': [['Fonction de perte',[0,1,2,3,4,5]],['Choix de la fonction de perte',[6,7,8,9]],['Manipuler la perte quadratique',[10],{extra:true}]],
      risque: [['Risque',[0,1]],['Fonction de prévision optimale',[2,3,4,5]],['Intuition',[6,7,8]],['Cas de la régression',[9,10,11,12]],['Récapitulatif',[13]],['Objectif d’apprentissage',[14]]],
      'biais-variance': [['Décomposition de l’erreur : biais, variance et bruit',[0,1,2,3]],['Compromis biais–variance',[4,5,6,7],{columns:[[4,5],[6,7]]}],['Sous-ajustement et sur-ajustement',[8]],['Répéter l’apprentissage',[9],{extra:true}],['Faire varier la complexité',[10,11],{extra:true}]],
      'estimation-risque': [['Estimation du risque',[0,1,2]],['Validation ou hold-out',[3,4,5,6]],['Illustration de la séparation des données',[7,8]],['Validation croisée K-blocs',[9,10,11]],['Illustration et choix de K',[12,13,14]],['Parcourir les blocs',[15],{extra:true}],['Leave-One-Out',[16,17]]],
      categorisation: [['Catégorisation',[0]],['Notre perspective',[1,2]],['Pourquoi ce choix ?',[3]],['Guide selon scikit-learn',[4]],['Références',[5,6]],['Algorithmes linéaires : la suite',[7]]]
    },
    lineaires: {
      geometrie: [['Linéarité et modèles',[0,1,2,3]],['Hyperplan · définition',[4,5,6]],['Hyperplan · score et décision',[7,8]],['À faire · le vecteur normal',[9,10]]],
      supervises: [['Théorème du No Free Lunch',[0,1]],['Modèles linéaires supervisés',[2,3,4]],['Régression',[5,6]],['Discrimination binaire',[7,8,9]],['Minimiser les erreurs',[10,11]],['Exemple · ventes et publicité TV',[12]],['Déplacer la droite',[13],{extra:true}]],
      'svm-geometrie': [['Support Vector Machines',[0,1,2]],['Principe géométrique du SVM linéaire',[3,4,5,6,7]]],
      'marge-dure': [['Notion de marge',[0,1,2,3,4]],['Marge maximale dans les SVM',[5,6,7]],['Formulation du problème',[8,9,10]],['Comprendre le SVM pas à pas',[11],{extra:true}]],
      'marge-souple': [['Cas non parfaitement séparables',[0,1,2,3,4]],['Lire les variables de relâchement',[5,6,7],{extra:true}],['Du relâchement à la perte charnière',[8,9,10],{extra:true}]],
      dualite: [['Vecteurs de support et solution duale',[0,1,4,5,6,7]],['Détails de la solution duale',[2,3,8,9,10],{extra:true}],['Marge souple · conditions KKT et biais',[11,12,13,14],{extra:true}]],
      'hard-soft': [['Hard margin vs. soft margin',[0,1,2,3,4,5]]],
      multiclasses: [['SVMs pour la discrimination multiclasse',[0,1,2,3,4]],['Pour approfondir les SVM',[5],{extra:true}]]
    }
  };
  const redrawnAlts = {
    rec:'Six chiffres manuscrits avec leurs étiquettes 9, 6, 6, 5, 4 et 0 ; la dernière image est encadrée comme entrée xᵢ, son étiquette 0 comme sortie yᵢ.',
    regression:'Illustration synthétique : courbe de moyenne conditionnelle, observations dispersées et plusieurs sorties possibles à la même entrée x₀ = 4 ; le point sur la courbe marque la moyenne conditionnelle −0,08.',
    lossff:'Comparaison de la demi-perte quadratique et de la perte charnière appliquée au score continu g, pour les labels −1 et +1.',
    ols:'Illustration schématique : observations, droite de prévision et carrés représentant les résidus verticaux au carré.',
    jackpot:'Deux cibles comparant des impacts centrés en moyenne et des impacts systématiquement décalés : biais faible et biais élevé.',
    jacknot:'Deux cibles comparant des impacts groupés et dispersés : variance faible et variance élevée.',
    split:'Trois ensembles distincts : apprentissage pour construire le modèle, validation pour sélectionner, test final réservé pour évaluer.',
    'k-block':'Trois ajustements : chaque bloc sert une fois à la validation, les deux autres à l’apprentissage ; les erreurs sont ensuite moyennées.',
    hyperp:'Hyperplan 2x₁ + x₂ = 0, normale w = (2, 1), observations du cours et distance perpendiculaire du point A = (3, 4).',
    margin:'Frontière 2x₁ + x₂ = 0 et bords parallèles de niveaux −10 et +10 ; un segment perpendiculaire illustre la largeur 4√5.',
    dis:'Deux droites parallèles écrites avec le même vecteur normal, leur distance perpendiculaire et la formule |c − c′| / √(a² + b²).',
    categ:'Carte des méthodes selon la supervision, la paramétrisation et la linéarité, avec des définitions et exemples précisés.',
    here:'Carte des trois axes de classement, avec l’axe linéarité mis en évidence par un cadre mauve.',
    trade:'Trois ajustements polynomiaux sur les mêmes observations synthétiques, avec les erreurs d’apprentissage et de validation.',
    reglin:'Exemple synthétique de moindres carrés : droite apprise, résidus verticaux et courbes d’égale RSS dans l’espace des paramètres.'
  };
  const redrawn = new Set(['regression','lossff','ols','jackpot','jacknot','split','k-block','hyperp','margin','dis','categ','here','trade','reglin','rec']);
  for (const chapter of [window.SID34_CHAPTER_1,window.SID34_CHAPTER_2]) {
    let originalNumber = 0;
    for (const lesson of chapter.lessons) {
      const original = lesson.blocks;
      // Nouveautés 2026–2027 (logistic-lesson.js) : diapositives « Nouveau », non numérotées,
      // insérées sans décaler la numérotation des diapositives d'origine.
      const added = window.SID34_NEW?.slides?.[chapter.id]?.[lesson.id];
      let lessonSpec = added?.replace || specs[chapter.id][lesson.id];
      // Une insertion { after, slides } ou plusieurs (inserts), repérées sur la liste d'origine.
      const inserts = added?.inserts || (added?.slides ? [added] : []);
      for (const ins of [...inserts].sort((a, b) => b.after - a.after)) lessonSpec = [...lessonSpec.slice(0, ins.after + 1), ...ins.slides, ...lessonSpec.slice(ins.after + 1)];
      let position = 0; // les diapositives à identifiant fixe (options.id) ne décalent pas les autres
      lesson.slides = lessonSpec.map(([title,indices,options={}]) => {
        const index = options.id ? null : position++;
        const blocks = indices.map(i => original[chapter.id==='fondements'&&lesson.id==='introduction-generale'&&i>=3?i-1:i]);
        if (blocks.some(b=>!b)) throw new Error('Missing slide block: '+lesson.id);
        const slide = {title,blocks,extra:!!options.extra,fresh:!!options.fresh,open:!!options.open,id:options.id||lesson.id+'-'+(options.fresh?'n':'')+(index+1),number: options.extra || options.fresh ? null : ++originalNumber};
        if (options.columns) slide.presentationColumns = options.columns.map(column=>column.map(i=>original[i]));
        return slide;
      });
      if(chapter.id==='lineaires'&&lesson.id==='hard-soft'){
        original[1].optionalNote='Tableau de comparaison';
        original[2].title='Hard margin'; original[2].tex=original[2].tex.replace(String.raw`\text{Hard margin SVM :}\quad&`, '&');
        original[3].title='Soft margin'; original[3].tex=original[3].tex.replace(String.raw`\text{Soft margin SVM :}\quad&`, '&');
        original[4].html='<p><strong>Grand \\(C\\)</strong> : violations plus coûteuses. <strong>Petit \\(C\\)</strong> : davantage de relâchement toléré pour réduire la norme de \\(w\\). Ce compromis ne garantit pas une meilleure généralisation.</p>';
        original[5].html='<p>Pour plusieurs classes : combiner des problèmes binaires avec <strong>OvR</strong> ou <strong>OvO</strong>.</p>';
        lesson.slides[0].comparison=[original[2],original[3]];
      }
      if(chapter.id==='fondements'&&lesson.id==='estimation-risque') lesson.slides[1].presentationColumns=[[original[3],original[4]],[original[5],original[6]]];
      if(chapter.id==='lineaires'&&lesson.id==='marge-dure') {
        original[0].html='<p>Pour une séparation correcte, la <strong>marge symétrique</strong> vaut deux fois la <strong>distance minimale</strong> des observations à la frontière. En marge dure, cette bande est vide.</p>';
        original[3].html='<p>Si \\(2\\sqrt5\\) est la <strong>distance minimale</strong>, la bande a la largeur ci-dessous. Cela ne prouve pas que la marge est maximale.</p>';
        original[2].caption='\\(A=(3,4)\\) et \\(B=(2,6)\\) sont les plus proches : distance minimale \\(2\\sqrt5\\), largeur de bande \\(4\\sqrt5\\). La mesure est perpendiculaire aux droites.';
      }
      if(chapter.id==='lineaires'&&lesson.id==='multiclasses') lesson.slides[0].presentationColumns=[[original[1],original[2]],[original[3],original[4]]];
      // Keep each original frame; put the figure beside its explanation when projecting.
      for (const slide of lesson.slides) {
        const figures = slide.blocks.filter(block => block.type === 'figure' || block.type === 'figures');
        const text = slide.blocks.filter(block => !figures.includes(block));
        if (!slide.extra && !slide.presentationColumns && figures.length === 1 && text.length >= 2) {
          slide.presentationColumns = [text, figures];
          slide.visualColumns = true;
        }
      }
      if(chapter.id==='lineaires'&&lesson.id==='dualite'){
        lesson.slides[0].presentationColumns=[[original[0],original[1]],[original[4],original[5]]];
        original[1].tex=String.raw`\begin{aligned}L(w,b,\alpha)&=\frac12\|w\|^2\\&\quad-\sum_{i=1}^{n}\alpha_i[y_i(w\cdot x_i+b)-1],\\&\alpha_i\ge0.\end{aligned}`;

        original[0].html='<p>En marge dure, on associe un multiplicateur \\(\\alpha_i\\ge0\\) à chaque contrainte.</p>';
        original[4].html='<p>Le dual dépend des multiplicateurs \\(\\alpha\\) et des produits scalaires entre observations.</p>';
        original[7].html='<p>Seuls les points avec \\(\\alpha_i&gt;0\\) interviennent dans \\(w\\) : ce sont les <strong>vecteurs de support</strong>, situés sur les bords en marge dure.</p>';
      }
      if (chapter.id === 'fondements' && lesson.id === 'fonction-perte') {
        lesson.slides.push({id:'fonction-perte-recit',title:'De la droite à la perte quadratique',extra:true,number:null,blocks:[{type:'regression-story'}]});
      }
      if (chapter.id === 'fondements' && lesson.id === 'estimation-risque') {
        lesson.slides.push({id:'estimation-risque-recit',title:'Apprendre, choisir, puis tester',extra:true,number:null,blocks:[{type:'split-story'}]});
      }
      lesson.blocks = lesson.slides.flatMap(slide=>slide.blocks);
      for (const block of lesson.blocks) {
        if (block.title?.includes('SID34')) block.title=block.title.replace('SID34','du cours');
        const items = block.type==='figure' ? [block] : block.type==='figures' ? block.items : [];
        for(const item of items){const name=item.src?.split('/').pop()?.replace('.png',''); if(redrawn.has(name)){item.originalSrc=item.src;item.src='assets/redrawn/'+name+'.svg';item.redrawn=true; item.alt=redrawnAlts[name]; if(name==='lossff') item.caption='Demi-perte quadratique en régression et perte charnière appliquée au score continu \\(g\\) du SVM.'; if(name==='ols') item.caption='Schéma illustratif redessiné : chaque carré représente le carré d’un résidu vertical.'; if(name==='hyperp') item.caption='Même exemple du cours : \\(A=(3,4)\\), normale \\(w=(2,1)\\), distance à l’hyperplan \\(2\\sqrt5\\).'; if(name==='categ'||name==='here') item.caption='Carte redessinée d’après le support et The Illustrated Machine Learning (2023), avec les définitions précisées.';}}
        for (const item of items) if (item.src === 'assets/redrawn/regression.svg') item.caption = 'Illustration synthétique redessinée : à \\(x_0=4\\), plusieurs sorties sont possibles. La courbe mauve représente \\(m^{*}(x)=\\mathbb{E}[Y\\mid X=x]\\), optimale sous perte quadratique.';
        for (const item of items) {
          if(item.src==='assets/redrawn/trade.svg'){
            item.mobileSrc='assets/redrawn/trade-mobile.svg';item.referenceSrc=item.originalSrc;
            item.caption='Exemple synthétique : trois polynômes appris sur les mêmes données. La validation retient ici le degré 2 ; une faible erreur d’apprentissage ne suffit pas.';
          }
          if(item.src==='assets/redrawn/reglin.svg'){
            item.mobileSrc='assets/redrawn/reglin-mobile.svg';item.referenceSrc=item.originalSrc;
            item.caption=String.raw`Illustration synthétique des moindres carrés : droite apprise, résidus verticaux et courbes d’égale RSS. Minimum en \(\hat\beta=(1\,;\,0{,}8)\), avec RSS \(=6{,}24\).`;
            lesson.slides.find(slide=>slide.blocks.includes(block)).title='Moindres carrés · droite, résidus et objectif';
          }
        }
      }
    }
    chapter.slideCount=originalNumber;
  }
  const first=window.SID34_CHAPTER_1.lessons[0];
  first.intro=first.intro.replace('Motivation, ','');
  first.blocks.find(b=>b.title==='Plan du cours').html=first.blocks.find(b=>b.title==='Plan du cours').html.replace('motivation, ','');
})();
