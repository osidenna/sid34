(function () {
  'use strict';

  const chapters = [window.SID34_CHAPTER_1, window.SID34_CHAPTER_2].filter(Boolean);
  // Chapitres publiés et chapitres annoncés « à venir » (copie étudiants : chapitre 2 sans contenu).
  const ready = chapters.filter(chapter => !chapter.comingSoon), soon = chapters.filter(chapter => chapter.comingSoon);
  // Date de la séance de chaque chapitre annoncé (sinon « À venir »).
  const SESSION_DATES = {'02': '22 octobre', '03': '29 octobre', '04': '12 novembre', '05': '10 décembre'};
  const soonBadge = chapter => '<span class="soon-badge">' + (SESSION_DATES[chapter.number] || 'À venir') + '</span>';
  // Chapitres suivants du programme, annoncés dans le menu et le plan.
  const announced = [...soon, {number: '03', title: 'Algorithmes non linéaires'}, {number: '04', title: 'Agrégation'}, {number: '05', title: 'Cycle ML & Métriques d’évaluation'}];
  const main = document.getElementById('main');
  const sidebar = document.getElementById('sidebar');
  const backdrop = document.getElementById('sidebar-backdrop');
  const menuButton = document.getElementById('menu-button');
  const presentation = document.getElementById('presentation');
  const printRoot = document.getElementById('print-root');
  const allLessons = chapters.flatMap(chapter => chapter.lessons.map(lesson => ({chapter, lesson})));
  let current = null;
  let slides = [];
  let slideIndex = 0;
  let presentationChapter = null;
  let previousFocus = null;
  let savedOverflow = '';
  let includeExtras = false;
  let imageZoom = 1;
  let imagePreviousFocus = null;
  let tdTarget = '';
  const imageViewer = document.getElementById('image-viewer');
  const icon=(name)=>window.CourseIcons.icon(name);
  const storyNames = {'svm-story':'SVMStory','regression-story':'RegressionStory','split-story':'SplitStory','logistic-story':'LogisticStory','animal-split-story':'AnimalSplitStory','logit-svm-story':'LogitSVMStory','bias-variance-story':'BiasVarianceStory','cv-story':'CVStory','multiclass-story':'MulticlassStory','supervise-story':'SuperviseStory','loss-story':'LossStory','risk-story':'RiskStory','geometrie-story':'GeometryStory','distance-story':'DistanceStory','slack-story':'SlackStory','dual-story':'DualStory'};
  const plain = value => window.SID34Math ? window.SID34Math.plain(value) : String(value || '');
  const mathIn = root => { if (window.SID34Math) window.SID34Math.render(root); return root; };
  const mathLive = root => { if (window.SID34Math) { window.SID34Math.render(root); window.SID34Math.observe(root); } return root; };
  const mascot = kind => window.Animals ? window.Animals.mascot(kind) : '';
  const freshBadge = '<span class="fresh-badge">Nouveau</span>';
  const storyFor = block => window[storyNames[block.type]];
  function cleanupStories(scope) { Object.values(storyNames).forEach(name => window[name]?.cleanup(scope)); }
  document.querySelector('.site-header .brand').innerHTML=window.CourseIcons.brand();
  menuButton.innerHTML=icon('menu');

  function escape(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, char => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[char]));
  }

  function chapterPDF(chapter, mode='notes') {
    return 'pdfs/apprentissage-statistique-' + (mode==='slides'?'diaporama':'chapitre') + '-' + chapter.number + '.pdf';
  }

  function lessonURL(chapter, lesson) {
    return '#' + chapter.id + '/' + lesson.id;
  }

  function closeMenu() {
    sidebar.classList.remove('open');
    backdrop.classList.remove('open');
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Ouvrir le plan du cours');
    sidebar.inert = true; main.inert = false;
  }

  function openMenu(search) {
    sidebar.classList.add('open'); backdrop.classList.add('open');
    sidebar.inert = false; main.inert = true;
    menuButton.setAttribute('aria-expanded', 'true');
    const focus = sidebar.querySelector('[data-sid34-action="close-menu"]');
    if (focus) focus.focus();
  }

  function renderSidebar() {
    const tdHash = (() => { try { return decodeURIComponent(window.location.hash.slice(1)); } catch (_) { return ''; } })();
    const active = current ? current.chapter.id + '/' + current.lesson.id : tdHash.startsWith('td/') ? tdHash.split('/').slice(0, 2).join('/') : '';
    sidebar.innerHTML = '<div class="drawer-header"><a class="brand" href="#">' + window.CourseIcons.brand() + '</a><button class="icon-button" data-sid34-action="close-menu" aria-label="Fermer le plan du cours">×</button></div><p class="drawer-label"><span>Apprentissage statistique</span></p><p class="drawer-intro">2e année du cycle ingénieur</p>' + ready.map(chapter =>
      '<details class="chapter-nav"' + (!current ? (!active || active === 'td/' + chapter.id ? ' open' : '') : current.chapter.id === chapter.id ? ' open' : '') + '><summary class="chapter-nav-title"><span class="chapter-number">' + escape(chapter.number) + '</span><span>' + escape(chapter.title) + '</span></summary>' +
      chapter.lessons.map(lesson => {
        const key = chapter.id + '/' + lesson.id;
        const status = window.SID34Progress ? window.SID34Progress.status(key) : 'new';
        return '<a class="lesson-link' + (key === active ? ' active' : '') + '" href="' + lessonURL(chapter, lesson) + '"' + (key === active ? ' aria-current="page"' : '') + '><span class="lesson-dot is-' + status + '" aria-hidden="true"></span><span>' + escape(lesson.title) + (lesson.fresh ? ' ' + freshBadge : '') + '</span></a>';
      }).join('') + (window.SID34Teaching?.td[chapter.id] ? '<a class="lesson-link td-nav' + (active === 'td/' + chapter.id ? ' active' : '') + '" href="#td/' + chapter.id + '"><span class="lesson-dot" aria-hidden="true"></span><span>TD</span></a>' : '') + '</details>'
    ).join('') + announced.map(chapter => '<div class="chapter-nav is-soon"><span class="chapter-nav-title"><span class="chapter-number">' + escape(chapter.number) + '</span><span>' + escape(chapter.title) + '</span>' + soonBadge(chapter) + '</span></div>').join('') + '<div class="drawer-links"><a href="#cours">Vue d’ensemble du cours</a><a href="#ressources">Ressources et PDF</a></div>';
    if (!sidebar.classList.contains('open')) sidebar.inert = true;
  }

  function footer() {
    return '<footer class="footer">Oumoukelthoum Sidenna · Apprentissage statistique · 2026–2027</footer>';
  }

  function renderHome() {
    current = null;
    document.title = 'Vue d’ensemble · Apprentissage statistique';
    const teaching = window.SID34Teaching;
    const experiments = lesson => lesson.slides.flatMap(slide => slide.blocks).filter(block => block.type === 'demo' || storyNames[block.type]).length;
    const plural = (n, word) => n + ' ' + word + (n > 1 ? 's' : '');
    const total = {lessons: allLessons.length, slides: chapters.reduce((s, c) => s + c.slideCount, 0), experiments: allLessons.reduce((s, x) => s + experiments(x.lesson), 0), quiz: allLessons.reduce((s, x) => s + (teaching ? teaching.pitfallCount(x.chapter.id + '/' + x.lesson.id) : 0), 0), td: teaching ? Object.values(teaching.td).flat().length : 0};
    main.innerHTML = '<div class="content"><header class="lesson-header"><div class="eyebrow">Apprentissage statistique · 2026–2027</div><h1>Le plan du cours</h1></header>' + resumeCard() +
      ready.map(chapter => '<section class="plan-chapter"><div class="plan-chapter-head"><span class="chapter-number">' + escape(chapter.number) + '</span><div><h2><a href="' + lessonURL(chapter, chapter.lessons[0]) + '">' + escape(chapter.title) + '</a></h2><p>' + escape(chapter.subtitle) + '</p><p class="lesson-count">' + chapter.lessons.length + ' parties · ' + chapter.duration + ' min · <a class="text-button" href="' + chapterPDF(chapter) + '" download>Notes PDF</a>' + (teaching?.td[chapter.id] ? ' · <a class="text-button" href="#td/' + chapter.id + '">TD</a>' : '') + '</p></div></div>' +
        '<ol class="plan-lessons">' + chapter.lessons.map((lesson, i) => {
          const key = chapter.id + '/' + lesson.id, n = experiments(lesson), q = teaching ? teaching.pitfallCount(key) : 0;
          const count=window.SID34_CLASSROOM.entries(chapter).filter(entry=>entry.lesson===lesson).length;
          const tags = [lesson.duration + ' min'];
          return '<li><a href="' + lessonURL(chapter, lesson) + '">' + progressNode(chapter, lesson, i + 1) + '<span class="plan-title">' + escape(lesson.title) + (lesson.fresh ? ' ' + freshBadge : '') + '</span><span class="plan-tags">' + tags.join(' · ') + '</span></a></li>';
        }).join('') + '</ol></section>').join('') +
      announced.map(chapter => '<section class="plan-chapter is-soon"><div class="plan-chapter-head"><span class="chapter-number">' + escape(chapter.number) + '</span><div><h2>' + escape(chapter.title) + ' ' + soonBadge(chapter) + '</h2></div></div></section>').join('') +
      (window.SID34Progress?.any() ? '<p class="progress-note">Votre progression reste sur cet appareil. <button type="button" class="text-button" data-sid34-action="reset-progress">Effacer ma progression</button></p>' : '') + footer() + '</div>';
    renderSidebar();
  }

  function resumeCard() {
    const last = window.SID34Progress?.last(); if (!last) return '';
    const [chapterId, lessonId] = last.split('/');
    const chapter = chapters.find(c => c.id === chapterId), lesson = chapter?.lessons.find(l => l.id === lessonId);
    if (!lesson) return '';
    return '<a class="resume-card" href="' + lessonURL(chapter, lesson) + '">' + catGlyph(40) + '<span><span class="resume-label">Reprendre</span><strong>' + escape(lesson.title) + '</strong></span><span class="resume-arrow" aria-hidden="true">→</span></a>';
  }

  function tdLink(kind) {
    const target = window.SID34Teaching?.tdFor(kind);
    if (!target) return '';
    return '<a class="td-link" href="#td/' + target.chapter + '/' + target.ex.id.replace('.', '-') + '"><span>Refaire ce calcul en Python</span><strong>' + escape(target.ex.title) + ' →</strong></a>';
  }

  function decorateDemo(host, kind, isStatic) {
    if (isStatic) return;
    const formulae = {
      risk: String.raw`\widehat{R}_n(f)=\frac{1}{2n}\sum_{i=1}^{n}(y_i-f(x_i))^2`,
      generalization: String.raw`\hat f_d(x)=\sum_{j=0}^{d}\hat\beta_jx^j`,
      bias: String.raw`\text{Erreur}=\text{biais}^2+\text{variance}+\text{bruit}`,
      folds: String.raw`\begin{gathered}\widehat{\mathcal R}_k=\frac1{|B_k|}\sum_{i\in B_k}\ell(y_i,\hat f^{(-k)}(x_i)),\\\widehat{\mathcal R}_{\mathrm{CV}}=\frac1K\sum_{k=1}^{K}\widehat{\mathcal R}_k.\end{gathered}`,
      svm: String.raw`\min_{w,b}\frac12\|w\|^2`
    };
    const controls = host.querySelector('.demo-controls');
    if (!controls) return;
    const explanation = document.createElement('div'); explanation.className = 'experiment-formula';
    explanation.innerHTML = '<span class="experiment-label">MODÈLE → OBSERVATION</span><div class="math"></div><p>Prédisez l’effet d’un changement, puis manipulez les paramètres.</p>';
    if (window.katex && formulae[kind]) window.katex.render(formulae[kind], explanation.querySelector('.math'), {displayMode:true,throwOnError:false});
    controls.prepend(explanation);
  }

  function renderBlock(block, options) {
    const settings = options || {};
    const section = document.createElement('section');
    section.className = 'block ' + escape(block.type);
    if (block.type === 'prose') {
      section.innerHTML = (block.title ? '<h2>' + escape(block.title) + '</h2>' : '') + block.html;
    } else if (block.type === 'formula') {
      section.classList.add('formula-block');
      const math = document.createElement('div');
      math.className = 'math';
      math.setAttribute('aria-label', plain(block.explanation) || 'Formule');
      if (window.katex) {
        try {
          window.katex.render(block.tex, math, {displayMode: true, throwOnError: false, strict: false, trust: false});
        } catch (_) { math.textContent = block.tex; }
      } else { math.textContent = block.tex; }
      section.appendChild(math);
      const anatomy = !settings.static && !settings.presentation && window.SID34Teaching?.findAnatomy(block.tex);
      if (anatomy) window.SID34Teaching.renderAnatomy(section, math, anatomy);
      const explanation = document.createElement('p');
      explanation.textContent = block.explanation || '';
      const note = document.createElement('details'); note.className = 'formula-note'; note.innerHTML = '<summary>Lire la formule</summary>'; note.appendChild(explanation); section.appendChild(note);
    } else if (block.type === 'demo') {
      section.innerHTML = (block.title ? '<h2>' + escape(block.title) + '</h2>' : '') + '<div class="demo-host" data-demo-kind="' + escape(block.kind) + '"></div>' + (block.caption ? '<p class="demo-caption">' + escape(block.caption) + '</p>' : '');
      const host = section.querySelector('.demo-host');
      if (window.SID34Demos && typeof window.SID34Demos.mount === 'function') {
        window.SID34Demos.mount(host, block.kind, {static: !!settings.static, preset: settings.preset || block.preset});
        decorateDemo(host, block.kind, !!settings.static);
        if (!settings.static && !settings.presentation) section.insertAdjacentHTML('beforeend', tdLink(block.kind));
      } else {
        host.innerHTML = '<p class="callout">Cette expérience est disponible dans la version interactive du cours.</p>';
      }
    } else if (block.type === 'svm-story') {
      window.SVMStory.mount(section,{static:!!settings.static,presentation:!!settings.presentation,stage:block.stage,preset:block.preset});
      if (!settings.static && !settings.presentation) section.insertAdjacentHTML('beforeend', tdLink('svm'));
    } else if (storyFor(block)) {
      const host=storyFor(block).create(block, settings);
      addClassroomFormula(host,block);
      return mathLive(host);
    } else if (block.type === 'glossary') {
      section.classList.add('glossary');
      section.innerHTML = (block.title ? '<h2>' + escape(block.title) + '</h2>' : '') + '<table class="course-table glossary-table"><thead><tr><th scope="col">Symbole</th><th scope="col">Signification</th></tr></thead><tbody>' + block.rows.map(row => '<tr><td>' + escape(row[0]) + '</td><td>' + escape(row[1]) + '</td></tr>').join('') + '</tbody></table>';
    } else if (block.type === 'animal-intro') {
      return window.AnimalFigures ? window.AnimalFigures.intro() : section;
    } else if (block.type === 'exercise') {
      section.classList.add('exercise');
      section.innerHTML = '<div class="exercise-label">' + (mascot('dog') || icon('exercise')) + 'À vous de jouer</div><h3>' + escape(block.title || 'Exercice') + '</h3><div class="question">' + block.question + '</div><details' + (settings.answersOpen ? ' open' : '') + '><summary>' + icon('solution') + (settings.answersOpen ? 'Solution commentée' : 'Afficher la solution') + '</summary><div class="answer">' + block.answer + '</div></details>';
      // Lecture : étapes vérifiées et indices (practice.js) ; projection et PDF gardent l'énoncé seul.
      if (!settings.static && !settings.presentation && window.SID34Practice) window.SID34Practice.exercise(section, block);
      const answer = section.querySelector('details');
      if (answer.open) section.classList.add('revealed');
      answer.addEventListener('toggle', () => section.classList.toggle('revealed', answer.open));
    } else if (block.type === 'callout') {
      section.classList.add('callout');
      if (block.title === 'Précision sur le support') {
        section.classList.add('clarification');
        // Lion : correction importante apportée au support d'origine.
        section.innerHTML = '<details><summary>' + (settings.presentation ? '' : mascot('lion')) + 'Précision</summary>' + block.html + '</details>';
      } else {
        const trap = /piège|attention|erreur/i.test(block.title || ''), question = /question/i.test(block.title || '');
        // Fantôme : piège ; chat curieux : « À votre avis ? ».
        const who = trap ? 'ghost' : question ? 'cat' : '';
        section.classList.add(trap ? 'callout-trap' : 'callout-tip');
        if (who && window.Animals) section.classList.add('has-mascot');
        section.innerHTML = (who && window.Animals ? mascot(who) : icon(trap ? 'pitfall' : 'tip')) + '<div>' + (question ? '<p class="callout-kicker">À votre avis ?</p>' : '') + (block.title ? '<h3>' + escape(block.title) + '</h3>' : '') + block.html + '</div>';
      }
    } else if (block.type === 'table') {
      if (block.title) { const title = document.createElement('h2'); title.textContent = block.title; section.appendChild(title); }
      const table = document.createElement('table');
      table.className = 'course-table';
      table.innerHTML = '<thead><tr>' + block.headers.map(header => '<th scope="col">' + escape(header) + '</th>').join('') + '</tr></thead><tbody>' + block.rows.map(row => '<tr>' + row.map(cell => '<td>' + escape(cell) + '</td>').join('') + '</tr>').join('') + '</tbody>';
      section.style.overflowX = 'auto';
      section.appendChild(table);
    } else if (block.type === 'figure' || block.type === 'figures') {
      if (block.title) { const title = document.createElement('h2'); title.textContent = block.title; section.appendChild(title); }
      const items = block.type === 'figure' ? [block] : block.items;
      const gallery = document.createElement('div'); gallery.className = items.length > 1 ? 'figure-pair' : 'figure-single';
      items.forEach(item => {
        const figure = document.createElement('figure'); figure.className = 'source-figure';
        if (/(?:categ|here|sci|trade|hyp|reglin|types)\.(?:png|svg)$/.test(item.src)) section.classList.add('detailed-figure');
        const img='<img src="' + escape(item.src) + '" alt="' + escape(item.alt || '') + '" loading="eager">';
        const picture=item.mobileSrc&&!settings.print?'<picture><source media="(max-width:600px)" srcset="'+escape(item.mobileSrc)+'">'+img+'</picture>':img;
        figure.innerHTML = '<button class="figure-open" data-sid34-action="zoom-image" data-image-src="' + escape(item.src) + '" data-image-alt="' + escape(item.alt || '') + '" aria-label="Agrandir l’illustration">'+picture+'<span class="figure-zoom-label">Agrandir ↗</span></button>' + (item.caption ? '<figcaption>' + escape(item.caption) + '</figcaption>' : '') + (item.referenceSrc&&!settings.presentation&&!settings.print?'<details class="figure-reference"><summary>Figure du support d’origine</summary><a href="'+escape(item.referenceSrc)+'" target="_blank" rel="noopener">Consulter l’image d’origine ↗</a></details>':'');
        gallery.appendChild(figure);
      });
      section.appendChild(gallery);
    } else if (block.type === 'references') {
      section.classList.add('references');
      section.innerHTML = '<h3>Pour approfondir</h3>' + block.links.map(link => '<a href="' + escape(link.url) + '" target="_blank" rel="noopener noreferrer">' + escape(link.label) + ' ↗</a>').join('');
    }
    return block.type === 'demo' || block.type === 'svm-story' ? mathLive(section) : section;
  }

  // Long display formulas shrink to the column instead of being cut off on narrow screens.
  function fitFormulas(root) {
    (root || main).querySelectorAll('.formula-block .math, .classroom-formula .math, .story-math, .regression-math, .experiment-formula .math, .td-math, .as-theory .math-display').forEach(el => {
      el.style.fontSize = '';
      if (!el.clientWidth || el.scrollWidth <= el.clientWidth + 1) return;
      const size = parseFloat(getComputedStyle(el).fontSize);
      el.style.fontSize = Math.max(11, size * el.clientWidth / el.scrollWidth * .97) + 'px';
    });
  }

  function highlightKeyTerms(panel) {
    const terms = /^(apprentissage|validation|d’apprentissage|de validation|frontière linéaire optimale|maximisant la marge|modèle interprétable|bonne précision prédictive|moyenne conditionnelle|biais|variance|bruit|biais au carré|fonction de perte|risque|vecteurs de support|marge|marge symétrique|échantillon d’apprentissage|échantillon de validation|modèle linéaire simple|modèle non linéaire|score continu|paramétrique|non paramétrique|linéaire)$/i;
    let count = 0;
    panel.querySelectorAll('.prose strong,.question strong,.callout strong').forEach(strong => {
      if (count < 3 && terms.test(strong.textContent.trim())) { const mark = document.createElement('mark'); while(strong.firstChild) mark.appendChild(strong.firstChild); strong.appendChild(mark); count++; }
    });
  }

  function addClassroomFormula(host,block){
    if(!block.classroomFormula)return;
    const formula=document.createElement('div');formula.className='classroom-formula';
    formula.innerHTML='<div class="math"></div>'+(block.classroomFormula.html||'');
    window.katex.render(block.classroomFormula.tex,formula.querySelector('.math'),{displayMode:true,throwOnError:false});
    (host.querySelector('.as-step.active')||host).appendChild(formula);
  }

  function renderSlide(slide, options={}) {
    const panel = document.createElement('section'); panel.className='slide-panel' + (slide.extra?' supplementary':''); panel.dataset.slideId=slide.id;
    if(slide.focusTotal>1)panel.classList.add('focused-panel');
    const kinds=slide.blocks.map(b=>b.type);const kind=kinds.some(t=>t==='demo'||storyNames[t])?['experiment','Expérience']:kinds.includes('exercise')?['exercise','Exercice']:kinds.includes('formula')?['formula','Formule']:['definition','Notion'];
    if(slide.fresh)panel.classList.add('fresh-slide');
    panel.innerHTML='<header class="slide-panel-header"><span class="slide-label">'+icon(kind[0])+(slide.fresh?freshBadge:'')+(slide.extra?'Complément · ':slide.number==null?'':'Diapo '+String(slide.number).padStart(2,'0')+' · ')+kind[1]+(slide.focusTotal>1?' · '+slide.focusIndex+'/'+slide.focusTotal:'')+'</span><h2>'+escape(slide.title)+'</h2>'+(options.presentation||options.print?'':'<button class="text-button slide-present" data-sid34-action="present-slide" data-slide-id="'+escape(slide.id)+'" aria-label="Présenter '+escape(plain(slide.title))+'">'+icon('present')+'Présenter</button>')+'</header><div class="slide-body"></div>';
    const body=panel.querySelector('.slide-body');
    const normalize=value=>(value||'').toLocaleLowerCase('fr').replace(/[^a-zà-ÿ0-9]+/g,' ').trim();
    function append(parent,block){
      const repeatedTitle = normalize(block.title)===normalize(slide.title) || (block.title || '').startsWith(slide.title + ' —');
      const title = (repeatedTitle||block.type==='demo'||(block.type==='figure'&&slide.blocks.length===1))?'':block.title;
      const rendered=options.print ? renderPrintBlock({...block,title},options) : renderBlock({...block,title},options);
      if(block.optionalNote){const note=document.createElement('details');note.className='frame-note';note.innerHTML='<summary>'+escape(block.optionalNote)+'</summary>';note.appendChild(rendered);parent.appendChild(note);}
      else parent.appendChild(rendered);
    }
    const columns=(options.presentation||options.print)?slide.presentationColumns:slide.columns;
    if(columns){
      body.classList.add('slide-columns');
      if(slide.visualColumns) body.classList.add('visual-columns');
      columns.forEach(column=>{const col=document.createElement('div');col.className='slide-column';column.forEach(block=>append(col,block));body.appendChild(col);});
      const assigned=new Set(columns.flat());slide.blocks.filter(block=>!assigned.has(block)).forEach(block=>append(body,block));
    }
    else {
      let comparison=null;
      slide.blocks.forEach(block=>{
        if(slide.comparison?.includes(block)){
          if(!comparison){comparison=document.createElement('div');comparison.className='formula-comparison';body.appendChild(comparison);}
          append(comparison,block);
        }else append(body,block);
      });
    }
    // Une mascotte au plus par diapositive, hors récits interactifs.
    // Priorité : question (chat), piège (fantôme), exemple (chien), puis correction (lion).
    const rank=m=>['cat','ghost','dog','lion'].findIndex(k=>m.classList.contains('mascot-'+k));
    const mascots=[...panel.querySelectorAll('.slide-body .mascot')].filter(m=>!m.closest('.animal-story')).sort((a,b)=>rank(a)-rank(b));
    mascots.slice(1).forEach(m=>{const callout=m.closest('.has-mascot');if(callout){callout.classList.remove('has-mascot');m.insertAdjacentHTML('afterend',icon(callout.classList.contains('callout-trap')?'pitfall':'tip'));}m.remove();});
    highlightKeyTerms(panel); mathIn(panel); return panel;
  }

  function renderLesson(chapter, lesson) {
    current = {chapter, lesson};
    const index = chapter.lessons.indexOf(lesson);
    const flatIndex = allLessons.findIndex(item => item.chapter.id === chapter.id && item.lesson.id === lesson.id);
    const previous = allLessons[flatIndex - 1];
    const next = allLessons[flatIndex + 1];
    const key = chapter.id + '/' + lesson.id;
    document.title = lesson.title + ' · Apprentissage statistique';
    const teaching = window.SID34Teaching;
    const quizCount = teaching ? teaching.pitfallCount(key) : 0;
    const extras = lesson.slides.filter(slide => slide.extra);
    const planItems = lesson.slides.filter(slide => !slide.extra).map(slide => '<li><button type="button" data-plan="' + escape(slide.id) + '"><span class="plan-n' + (slide.fresh ? ' plan-fresh' : '') + '">' + (slide.fresh ? 'N' : String(slide.number).padStart(2, '0')) + '</span><span>' + escape(slide.title) + '</span></button></li>').join('') +
      (extras.length ? '<li><button type="button" data-plan="complements"><span class="plan-n plan-extra">+</span><span>Expériences et approfondissements</span></button></li>' : '') +
      (quizCount ? '<li><button type="button" data-plan="pieges"><span class="plan-n plan-quiz">' + quizCount + '</span><span>Pièges à éviter</span></button></li>' : '');
    const prevCard = previous
      ? '<a class="lesson-nav-card" href="' + lessonURL(previous.chapter, previous.lesson) + '"><span class="lesson-nav-label">' + icon('prev') + 'Partie précédente</span><strong>' + escape(previous.lesson.title) + '</strong></a>'
      : '<a class="lesson-nav-card" href="#cours"><span class="lesson-nav-label">' + icon('prev') + 'Début du cours</span><strong>Le plan du cours</strong></a>';
    const nextCard = next
      ? '<a class="lesson-nav-card is-next" href="' + lessonURL(next.chapter, next.lesson) + '"><span class="lesson-nav-label">' + (next.chapter.id === chapter.id ? 'Partie suivante' : 'Chapitre suivant') + icon('next') + '</span><strong>' + escape(next.lesson.title) + '</strong></a>'
      : '<a class="lesson-nav-card is-next" href="#cours"><span class="lesson-nav-label">Fin des chapitres disponibles' + icon('next') + '</span><strong>Revenir au plan du cours</strong></a>';
    const tdHref = teaching && teaching.td[chapter.id] ? '#td/' + chapter.id : '';
    main.innerHTML = '<article class="content"><nav class="breadcrumb" aria-label="Fil d’Ariane"><a href="#cours">Le cours</a><span aria-hidden="true">/</span><a href="' + lessonURL(chapter, chapter.lessons[0]) + '">' + escape(chapter.title) + '</a><span aria-hidden="true">/</span><span>Partie ' + (index + 1) + '</span></nav>' +
      '<header class="lesson-header"><div class="eyebrow">CHAPITRE ' + escape(chapter.number) + ' · PARTIE ' + (index + 1) + ' / ' + chapter.lessons.length + (lesson.fresh ? ' ' + freshBadge : '') + '</div><h1>' + escape(lesson.title) + '</h1><p class="lead">' + escape(lesson.intro) + '</p><p class="lesson-outcome"><strong>À retenir</strong> '+escape(lesson.outcome)+'</p><div class="lesson-meta"><span class="reading-time">' + icon('clock') + lesson.duration + ' min</span><div class="tools"><button class="tool-button" data-sid34-action="present">' + icon('present') + 'Présenter</button><a class="tool-button" href="' + chapterPDF(chapter) + '" download>' + icon('download') + 'Notes PDF</a>' + (tdHref ? '<a class="tool-button" href="' + tdHref + '">' + icon('code') + 'TD</a>' : '') + '</div></div></header>' +
      '<details class="lesson-plan"><summary>Dans cette partie<span class="optional-count">' + lesson.slides.filter(slide=>!slide.extra).length + ' diapositives</span></summary><nav aria-label="Plan de la partie"><ol>' + planItems + '</ol></nav></details>' +
      '<div class="lesson-blocks"></div><div class="lesson-quiz"></div>' +
      '<div class="lesson-end"><details class="exit-question"><summary>Une question pour vérifier</summary><p>'+escape(lesson.exitQuestion)+'</p></details>' + (tdHref ? '<a class="text-button" href="' + tdHref + '">TD du chapitre</a>' : '') + '<nav aria-label="Parties voisines" class="lesson-nav">' + prevCard + nextCard + '</nav></div>' + footer() + '</article>';
    const blocks = main.querySelector('.lesson-blocks');
    lesson.slides.filter(slide => !slide.extra).forEach(slide => blocks.appendChild(renderSlide(slide)));
    if (extras.length) {
      const group = document.createElement('details'); group.className='lesson-extras'; group.id='complements';
      group.innerHTML='<summary>'+icon('experiment')+'<span>Expériences et approfondissements</span><span class="optional-count">'+extras.length+' à explorer</span></summary><div class="extra-list"></div>';
      extras.forEach(slide => {
        const details=document.createElement('details');details.className='extra-slide';
        details.innerHTML='<summary>'+escape(slide.title)+'</summary>';details.appendChild(renderSlide(slide));group.querySelector('.extra-list').appendChild(details);
      });
      blocks.appendChild(group);
    }
    const quiz = teaching && teaching.renderPitfalls(key, main);
    if (quiz) {
      const drawer=document.createElement('details');drawer.className='quiz-drawer';
      drawer.innerHTML='<summary>'+icon('quiz')+'<span>Pièges à éviter</span><span class="optional-count">'+quizCount+' questions</span></summary>';drawer.appendChild(quiz);main.querySelector('.lesson-quiz').appendChild(drawer);
    }
    main.querySelectorAll('[data-plan]').forEach(button => button.addEventListener('click', () => {
      const id = button.dataset.plan, target = id === 'pieges' ? main.querySelector('#pieges') : id === 'complements' ? main.querySelector('#complements') : main.querySelector('[data-slide-id="' + id + '"]');
      if (!target) return;
      const details = target.closest('details'); if (details) details.open = true;
      const group = target.closest('.lesson-extras'); if (group) group.open = true;
      (details || target).scrollIntoView({behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start'});
    }));
    // Fin de partie : trois questions vérifiées (practice.js) à la place de la question ouverte.
    window.SID34Practice?.check(main.querySelector('.exit-question'), chapter, lesson);
    trackLesson(key);
    renderSidebar();
  }

  // Progression légère (progress.js) : rien n'est compté, tout reste sur l'appareil.
  let endObserver = null;
  function trackLesson(key) {
    const progress = window.SID34Progress; if (!progress) return;
    progress.visit(key);
    endObserver?.disconnect();
    const end = main.querySelector('.lesson-end');
    if (!end || !('IntersectionObserver' in window)) return;
    endObserver = new IntersectionObserver(entries => { if (entries.some(e => e.isIntersecting)) { progress.finish(key); endObserver.disconnect(); } }, {threshold: .1});
    endObserver.observe(end);
  }
  const partQuestions = lesson => lesson.blocks.filter(block => storyFor(block)).flatMap(block => storyFor(block).stages.map(stage => stage.qid).filter(Boolean));
  const catGlyph = size => '<svg viewBox="-16 -18 32 34" width="' + size + '" height="' + size + '" aria-hidden="true">' + window.Animals.head('chat') + '</svg>';
  function progressNode(chapter, lesson, n) {
    const progress = window.SID34Progress, key = chapter.id + '/' + lesson.id, status = progress ? progress.status(key) : 'new';
    // Badge : les 3 questions de fin de partie réussies du premier coup (practice.js),
    // ou, à défaut de ces questions, toutes les « À votre avis ? » de la partie.
    const questions = partQuestions(lesson), checked = !!progress?.solved('verif-' + key),
      allSolved = checked || (!window.SID34Practice?.CHECKS[lesson.id] && questions.length && progress && questions.every(q => progress.solved(q)));
    const label = {done: 'terminée', started: 'commencée', new: 'pas encore ouverte'}[status];
    return '<span class="plan-node is-' + status + '" role="img" aria-label="Partie ' + n + ' ' + label + (allSolved ? ', vérification réussie' : '') + '">' + (status === 'done' ? '✓' : n) +
      (allSolved ? '<span class="plan-node-badge" title="Vérification de fin de partie réussie">' + catGlyph(18) + '</span>' : '') + '</span>';
  }

  function renderTD(chapter, exerciseId) {
    current = null;
    const sheet = window.SID34TD.sheets[chapter.id];
    document.title = 'TD · Chapitre ' + chapter.number + ' · Apprentissage statistique';
    main.innerHTML = '<div class="content"><nav class="breadcrumb" aria-label="Fil d’Ariane"><a href="#cours">Le cours</a><span aria-hidden="true">/</span><a href="' + lessonURL(chapter, chapter.lessons[0]) + '">' + escape(chapter.title) + '</a><span aria-hidden="true">/</span><span>TD</span></nav>' +
      '<header class="lesson-header"><div class="eyebrow">CHAPITRE ' + escape(chapter.number) + ' · TRAVAUX DIRIGÉS</div><h1>' + escape(sheet.title) + '</h1><p class="lead">' + escape(sheet.lead) + '</p></header><div class="td-root"></div>' + footer() + '</div>';
    main.querySelector('.td-root').appendChild(window.SID34TD.render(chapter, main));
    renderSidebar();
    if (exerciseId) setTimeout(() => {
      const target = main.querySelector('#td-' + exerciseId) || main.querySelector('#exercice-' + exerciseId);
      const details = target?.closest('details'); if (details) details.open = true;
      target?.scrollIntoView({block: 'start'});
    }, 60);
  }


  function renderResources() {
    current = null; document.title = 'Ressources · Apprentissage statistique';
    const originals = ready.map(chapter => ({label: 'Support original 2025–2026 · Chapitre ' + chapter.number, url: 'originaux/lecture' + Number(chapter.number) + '-2025-2026.pdf'}));
    const bibliography = [{label:'Bibliographie complète · chapitre 1',url:'#fondements/categorisation'}, ...chapters[0].lessons.flatMap(lesson => lesson.blocks.filter(block => block.type === 'references').flatMap(block => block.links))];
    const groups = [
      
      {title: 'Notes de cours 2026–2027', description: 'Toutes les diapositives, les détails mathématiques et les états fixes des expériences, au format lecture.', links: ready.map(chapter => ({label:'Chapitre '+chapter.number+' · '+chapter.title, url:chapterPDF(chapter)}))},
      {title: 'Supports de l’année précédente', description: 'Les PDF d’origine, pour retrouver le cours avant son adaptation au web.', links:originals},
      {title: 'Bibliographie du cours', description: 'Les références du support du cours.', links:bibliography},
      {title: 'Inspirations de ce site', description: 'Les récits au défilement s’inspirent de MLU Explain (Amazon Machine Learning University) ; les leçons courtes, les notions surlignées et la mise en page du cours de Yan Holtz. Textes, données, figures et personnages sont propres à ce cours.', links:[
        {label:'MLU Explain · régression linéaire',url:'https://mlu-explain.github.io/linear-regression/'},
        {label:'MLU Explain · apprentissage, validation et test',url:'https://mlu-explain.github.io/train-test-validation/'},
        {label:'MLU Explain · biais et variance',url:'https://mlu-explain.github.io/bias-variance/'},
        {label:'MLU Explain · validation croisée',url:'https://mlu-explain.github.io/cross-validation/'},
        {label:'MLU Explain · régression logistique',url:'https://mlu-explain.github.io/logistic-regression/'},
        {label:'Yan Holtz · cours React Graph Gallery (éléments HTML)',url:'https://www.react-graph-gallery.com/course/webdev/html-elements'}
      ]},
      {title: 'Compléments facultatifs', description: 'À explorer après les notions du cours.', links:[
        {label:'SVM · formulation mathématique (scikit-learn)',url:'https://scikit-learn.org/stable/modules/svm.html#mathematical-formulation'}
      ]}
    ];
    main.innerHTML = '<div class="content"><header class="lesson-header"><div class="eyebrow">Apprentissage statistique</div><h1>Ressources</h1><p class="lead">Les supports PDF et les références pour réviser le cours.</p></header>' + groups.map(group => '<section class="resource-group"><h2>'+escape(group.title)+'</h2><p>'+escape(group.description)+'</p>'+group.links.map(link => '<a href="'+escape(link.url)+'"'+(link.url.startsWith('#')?'':link.url.endsWith('.pdf')?' download':' target="_blank" rel="noopener"')+'>'+escape(link.label)+' ↗</a>').join('')+'</section>').join('') + (window.SID34_NEW ? '<section class="resource-group" id="notations"><h2>Notations du fil rouge</h2><p>Les symboles des parties sur la régression logistique et les SVM, avec leur signification.</p></section>' : '') + footer() + '</div>';
    const notations = main.querySelector('#notations'); if (notations) notations.appendChild(renderBlock({...window.SID34_NEW.glossary, title: ''}, {}));
    mathIn(main); renderSidebar();
  }

  // Teaching aids that are not in the original slides, listed for review.
  function additions() {
    const t = window.SID34Teaching; if (!t) return '';
    const where = key => { const [c, l] = key.split('/'); const chapter = chapters.find(x => x.id === c); const lesson = chapter?.lessons.find(x => x.id === l); return lesson ? '<a href="#' + key + '">' + escape(lesson.title) + '</a>' : escape(key); };
    const formulaLessons = chapters.flatMap(chapter => chapter.lessons.filter(lesson => lesson.blocks.some(block => block.type === 'formula' && t.findAnatomy(block.tex))).map(lesson => chapter.id + '/' + lesson.id));
    return '<h2>Ajouts pédagogiques à relire</h2><p>Ces aides ne figurent pas dans les diapositives d’origine ; elles sont absentes des PDF et du mode présentation.</p>' +
      '<section class="block"><h3>Lecture guidée de formules (' + t.anatomy.length + ')</h3><p>Chaque formule est découpée en parties numérotées, surlignées au survol. Parties : ' + [...new Set(formulaLessons)].map(where).join(', ') + '.</p></section>' +
      '<section class="block"><h3>Pièges à éviter (' + Object.values(t.pitfalls).flat().length + ')</h3><ul>' + Object.entries(t.pitfalls).map(([key, list]) => '<li>' + where(key) + ' : ' + list.map(p => escape(p.title)).join(' ; ') + '</li>').join('') + '</ul></section>' +
      '<section class="block"><h3>Travaux dirigés</h3><ul>' + Object.entries(window.SID34TD?.sheets || {}).map(([c, sheet]) => '<li><a href="#td/' + c + '">' + escape(sheet.title) + '</a> : exercices ' + sheet.exercises.filter(ex => typeof ex.n === 'number').map(ex => ex.n).join(', ') + '</li>').join('') + '</ul></section>' +
      '<section class="block"><h3>Codes des expériences (' + Object.values(t.td).flat().length + ')</h3><ul>' + Object.entries(t.td).map(([c, list]) => list.map(ex => '<li><a href="#td/' + c + '/' + ex.id.replace('.', '-') + '">' + escape(ex.title) + '</a></li>').join('')).join('') + '</ul><p>Les sorties attendues sont vérifiées par <code>scripts/check-labs.cjs</code> et <code>scripts/check-td.cjs</code> avec scikit-learn.</p></section>';
  }

  function renderAdaptation() {
    current = null; document.title = 'Notes d’adaptation · Apprentissage statistique';
    const ledger = window.SID34_ADAPTATION;
    main.innerHTML = '<div class="content"><header class="lesson-header"><h1>'+escape(ledger.title)+'</h1><p class="lead">Les précisions apportées au support original sont consignées ici.</p></header>'+ledger.changes.map(change => '<section class="block"><h2>'+escape(change.chapter)+'</h2><p><strong>Support original.</strong> '+escape(change.original)+'</p><p><strong>Adaptation.</strong> '+escape(change.updated)+'</p><p>'+escape(change.reason)+'</p></section>').join('')+'<h2>Contenu rétabli</h2><ul>'+ledger.omissionsResolved.map(item => '<li>'+escape(item)+'</li>').join('')+'</ul>'+additions()+footer()+'</div>'; renderSidebar();
  }

  function route() {
    cleanupStories(main);
    if (!presentation.hidden) closePresentation();
    closeMenu();
    let hash;
    try { hash = decodeURIComponent(window.location.hash.slice(1)); } catch (_) { hash = ''; }
    const aliases = {'fondements/probleme-et-donnees':'fondements/introduction-generale','fondements/prevision-et-perte':'fondements/fonction-perte','fondements/risque-et-oracle':'fondements/risque','fondements/risque-empirique':'fondements/risque','fondements/biais-et-variance':'fondements/biais-variance','fondements/validation':'fondements/estimation-risque','lineaires/moindres-carres':'lineaires/supervises','lineaires/svm':'lineaires/marge-dure','lineaires/regularisation':'adaptation','lineaires/pca':'adaptation'};
    hash = aliases[hash] || hash;
    if (hash === 'main') { main.focus({preventScroll: true}); return; }
    if (!hash) {
      renderLesson(chapters[0], chapters[0].lessons[0]);
    } else if (hash === 'cours') {
      renderHome();
    } else if (hash === 'ressources') {
      renderResources();
    } else if (hash === 'adaptation') {
      renderAdaptation();
    } else if (hash.startsWith('td/') && window.SID34TD) {
      const [, chapterId, exerciseId] = hash.split('/');
      const chapter = chapters.find(item => item.id === chapterId);
      if (chapter && window.SID34TD.sheets[chapter.id]) { renderTD(chapter, exerciseId); tdTarget = exerciseId || ''; }
      else { current = null; main.innerHTML = '<div class="content"><h1>Page introuvable</h1><a class="primary-button" href="#">Revenir au cours →</a></div>'; renderSidebar(); }
    } else {
      const [chapterId, lessonId] = hash.split('/');
      const chapter = chapters.find(item => item.id === chapterId);
      const lesson = chapter && (lessonId ? chapter.lessons.find(item => item.id === lessonId) : chapter.lessons[0]);
      if (chapter && lesson) {
        if (!lessonId) history.replaceState(null, '', lessonURL(chapter, lesson));
        renderLesson(chapter, lesson);
      } else {
        current = null;
        main.innerHTML = '<div class="content"><h1>Partie introuvable</h1><p>Ce lien ne correspond à aucune partie du parcours.</p><a class="primary-button" href="#">Revenir au cours →</a></div>';
        renderSidebar();
      }
    }
    if (!tdTarget) window.scrollTo({top: 0, behavior: 'instant'});
    tdTarget = '';
    main.focus({preventScroll: true});
    if (current) window.SID34Teaching?.consumePending(main);
    mathIn(main);
    if (current) window.SID34Practice?.notations(main);
    requestAnimationFrame(() => fitFormulas(main));
    document.fonts?.ready.then(() => fitFormulas(main));
  }

  function chapterSlides(chapter, extras) {
    if(!extras&&window.SID34_CLASSROOM)return window.SID34_CLASSROOM.entries(chapter);
    return chapter.lessons.flatMap(lesson=>lesson.slides.filter(slide=>extras||!slide.extra).flatMap(slide=>{
      const block = slide.blocks.find(b=>storyFor(b));
      if(block)return storyFor(block).stages.map((stage,i)=>({lesson,slide:{...slide,id:slide.id+'-step'+i,storyId:slide.id,title:stage.title,blocks:[{...block,stage:i}]}}));
      return [{lesson,slide}];
    }));
  }

  function presentationSlide() {
    const entry=slides[slideIndex]; if(!entry)return;
    cleanupStories(presentation);
    presentation.innerHTML='<div class="presentation-header"><span>Apprentissage statistique · Chapitre '+escape(presentationChapter.number)+'</span><button class="secondary-button" data-sid34-action="close-present">Fermer · Échap</button></div><div class="presentation-content"></div><div class="presentation-controls"><span>'+ (slideIndex+1)+' / '+slides.length+'</span><label class="extras-toggle"><input type="checkbox" data-sid34-action="toggle-extras"'+(includeExtras?' checked':'')+'> Tout le support</label><div><button class="secondary-button" data-sid34-action="previous-slide"'+(slideIndex===0?' disabled':'')+'>← Précédente</button><button class="primary-button" data-sid34-action="next-slide"'+(slideIndex===slides.length-1?' disabled':'')+'>Suivante →</button></div></div>';
    const stage=document.createElement('div');stage.className='presentation-stage';
    const panel=renderSlide(entry.slide,{presentation:true}),body=panel.querySelector('.slide-body');
    // Le corps est enveloppé : le titre reste en haut, le contenu est centré et réduit s'il déborde.
    const fit=document.createElement('div');fit.className='slide-fit';
    for(const c of ['slide-columns','visual-columns'])if(body.classList.contains(c)){body.classList.remove(c);fit.classList.add(c);}
    fit.append(...body.childNodes);body.appendChild(fit);
    stage.appendChild(panel);presentation.querySelector('.presentation-content').appendChild(stage);
    presentation.insertAdjacentHTML('beforeend','<div class="presentation-progress" aria-hidden="true" style="width:'+((slideIndex+1)/slides.length*100).toFixed(2)+'%"></div>');
    presentation.scrollTop=0;
    fitPresentation();
    presentation.querySelectorAll('img').forEach(img=>{ if(!img.complete) img.addEventListener('load',fitPresentation,{once:true}); });
  }

  // Grand écran : chaque vue est une toile 16:9 de 1280 × 720, agrandie ou réduite d'un seul
  // facteur ; le titre garde donc la même place et la même taille d'une vue à l'autre.
  const STAGE={w:1280,h:720};
  function fitPresentation() {
    if(presentation.hidden)return;
    const panel=presentation.querySelector('.slide-panel');if(!panel)return;
    const content=presentation.querySelector('.presentation-content'),stage=presentation.querySelector('.presentation-stage'),fit=panel.querySelector('.slide-fit');
    panel.classList.remove('compact-slide');content.classList.remove('is-sparse');
    if(fit)fit.style.zoom=1;
    const staged=window.innerWidth>=760&&window.innerHeight>=480;
    presentation.classList.toggle('is-staged',staged);
    stage.style.zoom=1;
    if(!staged){fitFormulas(presentation);return;}
    stage.style.zoom=Math.min(content.clientWidth/STAGE.w,content.clientHeight/STAGE.h);
    fitFormulas(presentation);
    const body=panel.querySelector('.slide-body'),ratio=()=>body.getBoundingClientRect().height/fit.getBoundingClientRect().height;
    let zoom=1,r=ratio();
    if(r<.82){panel.classList.add('compact-slide');fitFormulas(presentation);r=ratio();}
    // Quelques passes : une réduction élargit le texte, qui se replie alors sur moins de lignes.
    for(let pass=0;pass<4&&r<.999;pass++){zoom=Math.max(.5,zoom*r*.99);fit.style.zoom=zoom;r=ratio();}
  }

  // Projection : barres du haut et du bas masquées après 2,5 s sans mouvement de souris.
  let chromeTimer=0;
  function wakeChrome(){presentation.classList.remove('chrome-idle');clearTimeout(chromeTimer);chromeTimer=setTimeout(()=>presentation.classList.add('chrome-idle'),2500);}
  presentation.addEventListener('mousemove',wakeChrome);
  presentation.addEventListener('keydown',event=>{if(event.key==='Tab')wakeChrome();});

  function openPresentation(chapterId, lessonId, slideId) {
    const chapter=chapters.find(item=>item.id===chapterId)||(current&&current.chapter)||chapters[0];if(!chapter)return;
    presentationChapter=chapter;
    const requested=chapter.lessons.flatMap(lesson=>lesson.slides).find(slide=>slide.id===slideId);
    includeExtras=!!requested&&!chapterSlides(chapter,false).some(entry=>entry.slide.sourceId===requested.id||entry.slide.id===requested.id);
    slides=chapterSlides(chapter,includeExtras);
    const startLesson=lessonId||(current&&current.chapter.id===chapter.id?current.lesson.id:chapter.lessons[0].id);
    slideIndex=Math.max(0,slides.findIndex(entry=>slideId?entry.slide.id===slideId||entry.slide.storyId===slideId||entry.slide.sourceId===slideId:entry.lesson.id===startLesson));
    previousFocus=document.activeElement;savedOverflow=document.body.style.overflow;document.body.style.overflow='hidden';presentation.hidden=false;
    document.querySelector('.site-header').inert=true;main.inert=true;sidebar.inert=true;
    presentationSlide();presentation.querySelector('[data-sid34-action="close-present"]').focus();wakeChrome();
  }

  function openImage(button) {
    imagePreviousFocus=document.activeElement;imageZoom=1;
    imageViewer.innerHTML='<header><span>'+escape(button.dataset.imageAlt)+'</span><div><button class="secondary-button" data-sid34-action="image-minus" aria-label="Réduire l’illustration">−</button><button class="secondary-button" data-sid34-action="image-plus" aria-label="Agrandir davantage l’illustration">+</button><button class="secondary-button" data-sid34-action="close-image">Fermer · Échap</button></div></header><div class="image-viewport"><img src="'+escape(button.dataset.imageSrc)+'" alt="'+escape(button.dataset.imageAlt)+'"></div>';
    imageViewer.hidden=false;presentation.inert=true;main.inert=true;document.querySelector('.site-header').inert=true;
    imageViewer.querySelector('[data-sid34-action="close-image"]').focus();
  }

  function closeImage() {
    imageViewer.hidden=true;imageViewer.innerHTML='';presentation.inert=false;
    main.inert=!presentation.hidden;document.querySelector('.site-header').inert=!presentation.hidden;
    if(imagePreviousFocus?.isConnected)imagePreviousFocus.focus({preventScroll:true});
  }

  function closePresentation() {
    cleanupStories(presentation);
    clearTimeout(chromeTimer);
    presentation.classList.remove('chrome-idle', 'is-staged');
    presentation.hidden = true;
    presentation.innerHTML = '';
    document.body.style.overflow = savedOverflow;
    document.querySelector('.site-header').inert = false;
    main.inert = false;
    sidebar.inert = !sidebar.classList.contains('open');
    if (previousFocus && previousFocus.isConnected) previousFocus.focus({preventScroll: true});
  }

  // Étape suivante du même récit : on garde le graphique pour que les points glissent.
  function storyInPlace(previous, entry) {
    if (!previous?.slide.storyId || previous.slide.storyId !== entry?.slide.storyId) return false;
    const block = entry.slide.blocks.find(b => storyFor(b)), host = presentation.querySelector('.animal-story');
    if (!block || !host?.sid34Select) return false;
    host.querySelector('.classroom-formula')?.remove();
    host.sid34Select(block.stage);
    addClassroomFormula(host, block); mathIn(host);
    const panel = presentation.querySelector('.slide-panel'), title = panel.querySelector('.slide-panel-header h2');
    panel.dataset.slideId = entry.slide.id; title.textContent = entry.slide.title; mathIn(title);
    presentation.querySelector('.presentation-controls > span').textContent = (slideIndex + 1) + ' / ' + slides.length;
    const progress = presentation.querySelector('.presentation-progress'); if (progress) progress.style.width = ((slideIndex + 1) / slides.length * 100).toFixed(2) + '%';
    presentation.querySelector('[data-sid34-action="previous-slide"]').disabled = slideIndex === 0;
    presentation.querySelector('[data-sid34-action="next-slide"]').disabled = slideIndex === slides.length - 1;
    fitPresentation();
    return true;
  }

  function advanceSlide(direction) {
    const next = Math.max(0, Math.min(slides.length - 1, slideIndex + direction));
    if (next === slideIndex) return;
    const focusedAction = document.activeElement && document.activeElement.dataset.sid34Action;
    const previous = slides[slideIndex];
    slideIndex = next;
    if (!storyInPlace(previous, slides[next])) presentationSlide();
    // Flèches, télécommande ou clic sur la vue : le focus reste sur la présentation (barres masquables).
    if (focusedAction !== 'previous-slide' && focusedAction !== 'next-slide') { presentation.tabIndex = -1; presentation.focus({preventScroll: true}); return; }
    const focusTarget = presentation.querySelector('[data-sid34-action="' + focusedAction + '"]:not(:disabled)') || presentation.querySelector('[data-sid34-action="' + (focusedAction === 'previous-slide' ? 'next-slide' : 'previous-slide') + '"]:not(:disabled)') || presentation.querySelector('[data-sid34-action="close-present"]');
    focusTarget.focus({preventScroll: true});
  }

  function renderPrintBlock(block, options={}) {
    const comparisons = {
      generalization: [{label: 'Degré 1', preset: {degree: 1}}, {label: 'Degré 9', preset: {degree: 9}}],
      bias: [{label: 'Degré 1', preset: {degree: 1}}, {label: 'Degré 7', preset: {degree: 7}}],
      folds: [{label: 'Pli 1 · degré 3', preset: {fold: 1, degree: 3}}, {label: 'Pli 5 · degré 3', preset: {fold: 5, degree: 3}}],
      ridge: [{label: 'Ridge · λ = 0', preset: {method: 'ridge', lambda: 0}}, {label: 'Ridge · λ = 1', preset: {method: 'ridge', lambda: 1}}],
      logistic: [{label: 'Seuil de décision 0,5', preset: {threshold: .5}}, {label: 'Seuil de décision 0,8', preset: {threshold: .8}}]
    };
    const pair = block.type === 'demo' && comparisons[block.kind];
    if (!pair || !window.SID34Demos) return renderBlock(block, {static: true, print:true, answersOpen:options.mode!=='slides'});
    const section = document.createElement('section');
    section.className = 'block demo';
    section.innerHTML = '<h2>' + escape(block.title) + '</h2><p class="demo-caption">' + escape(block.caption || '') + '</p><div class="print-comparison"></div>';
    const comparison = section.querySelector('.print-comparison');
    pair.forEach(state => {
      const panel = document.createElement('div');
      panel.innerHTML = '<p class="intro-label" style="margin:0 0 7pt;font-size:9pt">' + escape(state.label) + '</p><div class="demo-host" data-demo-kind="' + escape(block.kind) + '"></div>';
      window.SID34Demos.mount(panel.querySelector('.demo-host'), block.kind, {static: true, preset: state.preset});
      comparison.appendChild(panel);
    });
    const commonLegend = comparison.querySelector('.demo-legend');
    if (commonLegend) {
      const legend = commonLegend.cloneNode(true);
      legend.style.marginTop = '10pt';
      section.appendChild(legend);
    }
    return section;
  }

  function preparePrint(chapterId, mode='notes') {
    const chapter=chapters.find(item=>item.id===chapterId)||(current&&current.chapter)||chapters[0];if(!chapter)return printRoot;
    cleanupStories(printRoot);printRoot.replaceChildren();printRoot.dataset.chapter=chapter.id;
    mode=mode==='slides'?'slides':'notes';printRoot.className='print-root print-'+mode;document.body.dataset.printMode=mode;
    const cover=document.createElement('section');cover.className='print-page print-cover';
    const count=chapterSlides(chapter,false).length;
    cover.innerHTML='<div class="print-slide-inner"><div class="eyebrow">Apprentissage statistique · 2026–2027</div><h1>'+escape(chapter.title)+'</h1><p>Oumoukelthoum Sidenna</p><p>2e année du cycle ingénieur · '+chapter.duration+' min · '+(mode==='slides'?count+' vues en classe':'Notes de cours complètes')+'</p><h3>Plan du chapitre</h3><ol>'+chapter.lessons.map(lesson=>'<li>'+escape(lesson.title)+' · '+lesson.duration+' min</li>').join('')+'</ol></div>';
    printRoot.appendChild(cover);
    const entries=chapterSlides(chapter,mode==='notes');
    const ordered=mode==='slides'?entries:[...entries.filter(entry=>!entry.slide.extra),...entries.filter(entry=>entry.slide.extra)];
    ordered.forEach(entry=>{
      const page=document.createElement('section');page.className='print-page';
      const inner=document.createElement('div');inner.className='print-slide-inner';
      const context=document.createElement('div');context.className='print-context';context.textContent='Chapitre '+chapter.number+' · '+entry.lesson.title;inner.appendChild(context);
      inner.appendChild(renderSlide(entry.slide,{print:true,static:true,mode}));
      inner.querySelectorAll('details').forEach(details=>{details.open=mode==='notes';});
      if(mode==='notes'){
        // Put the graph first in the document itself. Natural block layout lets
        // full-width explanations paginate without CSS flex-order blank space.
        for(const [layoutSelector,figureSelector] of [['.as-layout','.as-sticky'],['.svm-story-grid','.svm-sticky'],['.regression-layout','.regression-figure'],['.split-layout','.split-sticky']]){
          inner.querySelectorAll(layoutSelector).forEach(layout=>{const figure=layout.querySelector(figureSelector);if(figure)layout.prepend(figure);});
        }
      }
      page.appendChild(inner);printRoot.appendChild(page);
    });
    return printRoot;
  }

  // Run in print media, so browser printing and generated PDFs use the same fit.
  function fitPrintPages() {
    if(printRoot.classList.contains('print-notes')){fitFormulas(printRoot);return;}
    printRoot.querySelectorAll('.print-page').forEach(page => {
      const inner = page.querySelector('.print-slide-inner');
      if (!inner || !page.clientHeight) return;
      inner.style.zoom = 1; inner.classList.remove('compact-print');
      fitFormulas(inner);
      let scale = Math.min(1, (page.clientHeight - 8) / inner.scrollHeight);
      if (scale < .82) { inner.classList.add('compact-print'); fitFormulas(inner); scale = Math.min(1, (page.clientHeight - 8) / inner.scrollHeight); }
      inner.style.zoom = scale;
    });
  }

  document.addEventListener('click', event => {
    const button = event.target.closest('[data-sid34-action]');
    if (!button) return;
    const action = button.dataset.sid34Action;
    if(action==='zoom-image'){openImage(button);return;}
    if(action==='close-image'){closeImage();return;}
    if(action==='image-plus'||action==='image-minus'){imageZoom=Math.max(1,Math.min(3,imageZoom+(action==='image-plus'?.25:-.25)));const img=imageViewer.querySelector('img');img.style.maxWidth='none';img.style.maxHeight='none';img.style.width=(imageZoom*90)+'vw';return;}
    if(action==='present-slide'){openPresentation(current?.chapter.id,current?.lesson.id,button.dataset.slideId);return;}
    if(action==='toggle-extras'){const oldEntry=slides[slideIndex],previous=oldEntry.slide,source=previous.sourceId||previous.storyId||previous.id;includeExtras=button.checked;slides=chapterSlides(presentationChapter,includeExtras);let target=slides.findIndex(entry=>entry.slide.id===previous.id);if(target<0)target=slides.findIndex(entry=>(entry.slide.sourceId||entry.slide.storyId||entry.slide.id)===source);if(target<0)target=slides.findIndex(entry=>entry.lesson.id===oldEntry.lesson.id);slideIndex=Math.max(0,target);presentationSlide();return;}
    if (action === 'reset-progress') { if (window.confirm('Effacer la progression enregistrée sur cet appareil ?')) { window.SID34Progress?.reset(); renderHome(); } return; }
    if (action === 'close-menu') { closeMenu(); menuButton.focus(); } else if (action === 'present') {
      openPresentation(current && current.chapter.id, current && current.lesson.id);
    } else if (action === 'close-present') {
      closePresentation();
    } else if (action === 'previous-slide') {
      advanceSlide(-1);
    } else if (action === 'next-slide') {
      advanceSlide(1);
    } else if (action === 'print') {
      preparePrint(current && current.chapter.id);
      window.print();
    }
  });

  document.addEventListener('keydown', event => {
    if(!imageViewer.hidden){if(event.key==='Escape'){event.preventDefault();closeImage();}return;}
    if (presentation.hidden) {
      if (event.key === 'Escape' && sidebar.classList.contains('open')) { closeMenu(); menuButton.focus(); }
      return;
    }
    if (event.key === 'Escape') { event.preventDefault(); closePresentation(); return; }
    if (event.key === 'Tab') {
      const focusable = [...presentation.querySelectorAll('a[href],button:not(:disabled),input:not(:disabled),select:not(:disabled),summary,[tabindex="0"]')].filter(element => !element.hidden && element.getClientRects().length);
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      return;
    }
    if (event.target.matches('input,textarea,select,[contenteditable="true"]') || event.target.closest('[data-keyboard-local]')) return;
    if (event.key === 'ArrowRight' || event.key === 'PageDown') { event.preventDefault(); advanceSlide(1); }
    else if (event.key === 'ArrowLeft' || event.key === 'PageUp') { event.preventDefault(); advanceSlide(-1); }
  });

  // Diaporama : un clic avance d'une vue (Maj + clic recule), comme une télécommande.
  // Les contrôles, les animaux à déplacer et les zones cliquables gardent leur propre comportement.
  let pressAt = null;
  presentation.addEventListener('pointerdown', event => { pressAt = [event.clientX, event.clientY]; });
  presentation.addEventListener('click', event => {
    if (event.button !== 0 || !pressAt) return;
    const moved = Math.hypot(event.clientX - pressAt[0], event.clientY - pressAt[1]) > 6; pressAt = null;
    if (moved || String(window.getSelection())) return;
    const target = event.target;
    if (target.closest('a,button,input,select,textarea,label,summary,details[open] > :not(summary),[role="button"],[role="slider"],[tabindex],[data-keyboard-local],.presentation-header,.presentation-controls')) return;
    for (let el = target; el && el !== presentation; el = el.parentElement) if (/pointer|grab|move/.test(getComputedStyle(el).cursor)) return;
    advanceSlide(event.shiftKey ? -1 : 1);
  });

  window.addEventListener('sid34-progress', () => { if (!sidebar.classList.contains('open')) renderSidebar(); });
  menuButton.addEventListener('click', () => sidebar.classList.contains('open') ? closeMenu() : openMenu(false));
  document.getElementById('lessons-button').addEventListener('click', () => openMenu(false));
  backdrop.addEventListener('click', closeMenu);
  window.addEventListener('hashchange', route);
  window.addEventListener('resize', fitPresentation);
  let fitTimer = 0;
  window.addEventListener('resize', () => { clearTimeout(fitTimer); fitTimer = setTimeout(() => fitFormulas(main), 150); });
  main.addEventListener('toggle', event => fitFormulas(event.target), true);
  presentation.addEventListener('toggle',fitPresentation,true);
  document.fonts?.ready.then(fitPresentation);
  window.addEventListener('beforeprint', () => {
    if (!printRoot.children.length) preparePrint(current && current.chapter.id);
    fitPrintPages();
  });
  window.addEventListener('afterprint', () => { cleanupStories(printRoot); printRoot.replaceChildren(); });

  window.ApprentissageStatistique = window.SID34 = {
    chapters,
    preparePrint,
    fitPrintPages,
    present: openPresentation,
    closePresentation,
    renderBlock
  };
  if (chapters.length) route();
})();
