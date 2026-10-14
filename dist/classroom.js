(function () {
  'use strict';
  // A 90-minute route through the existing slides. Reading mode keeps every source
  // slide and its number; focused panels share that number rather than renumbering it.
  const chapters = [window.SID34_CHAPTER_1, window.SID34_CHAPTER_2].filter(chapter => chapter && !chapter.comingSoon);
  const stories = {'svm-story':'SVMStory','logistic-story':'LogisticStory','animal-split-story':'AnimalSplitStory','logit-svm-story':'LogitSVMStory','bias-variance-story':'BiasVarianceStory','cv-story':'CVStory','multiclass-story':'MulticlassStory','supervise-story':'SuperviseStory','loss-story':'LossStory','risk-story':'RiskStory','geometrie-story':'GeometryStory','distance-story':'DistanceStory','slack-story':'SlackStory','dual-story':'DualStory'};
  const route = {
    fondements: [
      {id:'introduction-generale-8'}, {id:'introduction-generale-9'},
      {id:'regression-discrimination-n3'}, {id:'regression-discrimination-4'}, {id:'regression-discrimination-5'},
      {id:'fonction-perte-1', panels:[
        {title:'Ce que mesure une perte', indices:[0,1]},
        {title:'Perte absolue et perte quadratique', indices:[3,4]},
        {title:'Perte de classification', indices:[5]}
      ]},
      {id:'risque-1'},
      {id:'risque-2', panels:[
        {title:'Le meilleur prédicteur théorique', indices:[0,1]},
        {title:'Pourquoi il faut des données', indices:[2,3]}
      ]},
      {id:'risque-3'},
      {id:'biais-variance-n4', stages:[0,1,2,3,4], formulas:{3:{
        tex:String.raw`\begin{aligned}\mathbb E[(Y-\hat f(x_0))^2]&=\operatorname{biais}^2\\&\quad+\operatorname{variance}+\sigma^2.\end{aligned}`,
        html:String.raw`<p>Nouvelle sortie \(Y\), indépendante de l’apprentissage ; bruit centré, de variance \(\sigma^2\).</p>`
      }}},
      {id:'estimation-risque-2', panels:[
        {title:'Apprendre puis valider', indices:[0,1]},
        {title:'Choisir le modèle sur la validation', indices:[2,3]}
      ]},
      {id:'estimation-risque-n6', stages:[0,1,3,4]},
      {id:'categorisation-6'}
    ],
    lineaires: [
      {id:'geometrie-2'}, {id:'geometrie-3'}, {id:'geometrie-4',panels:[{title:'À faire · le vecteur normal',indices:[1]}]},
      {id:'supervises-3'}, {id:'supervises-5'},
      {id:'logistique-n2', stages:[0,1,2,4,5], formulas:{
        2:{tex:String.raw`\hat p(x)=\sigma(g(x))`,html:'<p>Probabilité estimée d’être un chien.</p>'},
        5:{tex:String.raw`\begin{aligned}\ell(y,\hat p)&=-y\log\hat p\\&\quad-(1-y)\log(1-\hat p),\\\min_{w,b}\quad&\tfrac12\|w\|^2+C\sum_i\ell(y_i,\hat p_i).\end{aligned}`,html:String.raw`<p>On apprend \(w,b\) ; on choisit \(C\) sur la validation. Le biais et le seuil ne sont pas pénalisés.</p>`}
      }},
      {id:'logistique-n1'},
      {id:'logistique-n3', stages:[0,1,2,3]},
      {id:'svm-geometrie-n2'},
      {id:'svm-geometrie-3', panels:[{title:'Du score à la distance',indices:[0,1,2]}]},
      {id:'marge-dure-4', stages:[0]},
      {id:'marge-dure-2'}, {id:'marge-dure-3'},
      {id:'marge-souple-1', panels:[
        {title:'Autoriser des violations de marge',indices:[0,1,4]},
        {title:'Pénaliser les violations',indices:[2,3]}
      ]},
      {id:'dualite-1', panels:[
        {title:'Du Lagrangien à la stationnarité',indices:[0,1],overrides:{1:{tex:String.raw`L(w,b,\alpha)=\tfrac12\|w\|^2+\sum_i\alpha_i\bigl(1-y_i g(x_i)\bigr)`}},formula:{tex:String.raw`\begin{aligned}\nabla_w L=0&\ \Longrightarrow\ w=\sum_i\alpha_i y_i x_i,\\\partial_b L=0&\ \Longrightarrow\ \sum_i\alpha_i y_i=0.\end{aligned}`}},
        {title:'Le dual et les vecteurs de support',indices:[2,3,5],overrides:{3:{tex:String.raw`\begin{gathered}\max_{\alpha\ge0}\ \sum_i\alpha_i-\tfrac12\sum_{i,j}\alpha_i\alpha_jy_iy_j(x_i\cdot x_j),\\\text{sous }\sum_i\alpha_i y_i=0.\end{gathered}`}}}
      ]},
      {id:'hard-soft-n2', stages:[2,3]},
      {id:'multiclasses-n2', stages:[0,2,4]}
    ]
  };
  const lessons = {
    'introduction-generale':[10,'Reconnaître un apprentissage supervisé.', 'Quel est le rôle de l’étiquette dans un apprentissage supervisé ?'],
    'regression-discrimination':[12,'Distinguer entrée, sortie et prévision.', 'Prédire le poids ou prédire l’espèce : quelle différence ?'],
    'fonction-perte':[15,'Mesurer une erreur avec la bonne perte.', 'Si l’erreur est doublée, comment changent la perte absolue et la perte quadratique ?'],
    risque:[15,'Distinguer la vraie relation du modèle appris.', 'Pourquoi le meilleur prédicteur théorique ne peut-il pas être calculé directement ?'],
    'biais-variance':[18,'Expliquer biais, variance et bruit.', 'Que change un nouveau tirage des données d’apprentissage ?'],
    'estimation-risque':[15,'Choisir un modèle sans utiliser le test.', 'Peut-on choisir le degré sur le test, puis annoncer son erreur sur ce même test ?'],
    categorisation:[5,'Situer les modèles linéaires dans le programme.', 'Pourquoi commencer par un modèle simple ?'],
    geometrie:[10,'Lire un score et sa frontière.', 'Que devient la frontière si on multiplie le score par un nombre positif ?'],
    supervises:[8,'Relier paramètres appris et erreur minimisée.', 'Que signifie « linéaire » dans une régression polynomiale ?'],
    logistique:[20,'Distinguer score, probabilité et classe.', 'Si on change le seuil, faut-il réapprendre le modèle ?'],
    'svm-geometrie':[6,'Passer du score à une distance.', 'Pourquoi diviser le score par la norme du vecteur normal ?'],
    'marge-dure':[12,'Relier marge maximale et problème primal.', 'Pourquoi fixer la plus petite marge fonctionnelle à 1 ?'],
    'marge-souple':[10,'Interpréter les violations et le paramètre C.', 'Une violation de marge est-elle forcément une erreur de classification ?'],
    dualite:[10,'Expliquer pourquoi certains points définissent le SVM.', 'Que signifie un multiplicateur strictement positif en marge dure ?'],
    'hard-soft':[5,'Comparer probabilité, marge et régularisation.', 'Un score SVM est-il une probabilité ?'],
    multiclasses:[9,'Combiner les modèles OvR et OvO.', 'Avec quatre classes, combien de modèles faut-il pour OvR et pour OvO ?']
  };
  const all = chapters.flatMap(chapter=>chapter.lessons.flatMap(lesson=>lesson.slides.map(slide=>({lesson,slide}))));
  const lookup = id=>{const entry=all.find(entry=>entry.slide.id===id);if(!entry)throw Error('Unknown classroom slide: '+id);return entry;};
  function entries(chapter) {
    return route[chapter.id].flatMap(spec=>{
      const {lesson,slide}=lookup(spec.id);
      const base={...slide,extra:false,sourceId:slide.id};
      if(spec.panels)return spec.panels.map((panel,index)=>{
        const blocks=panel.indices.map(i=>panel.overrides?.[i]?{...slide.blocks[i],...panel.overrides[i]}:slide.blocks[i]);
        if(panel.from)blocks.push(...panel.from.indices.map(i=>lookup(panel.from.id).slide.blocks[i]));
        if(panel.formula)blocks.push({type:'formula',...panel.formula});
        if(blocks.some(block=>!block))throw Error('Unknown classroom block: '+spec.id);
        return {lesson,slide:{...base,id:slide.id+'-focus'+index,title:panel.title,blocks,columns:null,presentationColumns:null,comparison:null,focusIndex:index+1,focusTotal:spec.panels.length}};
      });
      if(spec.stages){
        const block=slide.blocks.find(block=>stories[block.type]);
        const story=window[stories[block?.type]];
        return spec.stages.map(index=>{
          if(!story?.stages[index])throw Error('Unknown classroom stage: '+spec.id+'/'+index);
          return {lesson,slide:{...base,id:slide.id+'-step'+index,storyId:slide.id,title:story.stages[index].title,blocks:[{...block,stage:index,classroomFormula:spec.formulas?.[index]}]}};
        });
      }
      return [{lesson,slide:base}];
    });
  }
  for(const chapter of chapters){
    for(const lesson of chapter.lessons){const [duration,outcome,exitQuestion]=lessons[lesson.id];Object.assign(lesson,{duration,outcome,exitQuestion});}
    if(chapter.lessons.reduce((sum,lesson)=>sum+lesson.duration,0)!==90)throw Error('Classroom time budget must be 90 minutes');
    entries(chapter);
  }
  // Let students encounter score → probability → decision before the log-odds
  // assumption. Keep stable IDs, original slide numbers and source blocks intact.
  const logistic=chapters.find(chapter=>chapter.id==='lineaires')?.lessons.find(lesson=>lesson.id==='logistique');
  if(logistic){const story=logistic.slides.find(slide=>slide.id==='logistique-n2');
  logistic.slides.splice(logistic.slides.indexOf(story),1);logistic.slides.unshift(story);}
  window.SID34_CLASSROOM={entries};
})();
