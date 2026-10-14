(function () {
  'use strict';
  /* Progression légère, propre à chaque navigateur : rien n'est envoyé, rien n'est compté.
     - « commencée » : la partie a été ouverte ;
     - « terminée »  : la fin de la partie a été atteinte ;
     - questions « À votre avis ? » réussies, par identifiant (récit-étape).
     Le stockage peut être indisponible (navigation privée) : le site fonctionne alors sans. */
  const KEY = 'sid34-progress-v1';
  let state = {visited: {}, seen: {}, solved: {}, last: null};
  try {
    const saved = JSON.parse(window.localStorage.getItem(KEY) || 'null');
    if (saved && typeof saved === 'object') state = {...state, ...saved};
  } catch (_) { /* stockage bloqué */ }
  const save = () => {
    try { window.localStorage.setItem(KEY, JSON.stringify(state)); } catch (_) { /* stockage bloqué */ }
    window.dispatchEvent(new CustomEvent('sid34-progress'));
  };
  window.SID34Progress = {
    visit(part) { if (state.visited[part] && state.last === part) return; state.visited[part] = 1; state.last = part; save(); },
    finish(part) { if (state.seen[part]) return; state.seen[part] = 1; state.visited[part] = 1; save(); },
    solve(qid) { if (state.solved[qid]) return; state.solved[qid] = 1; save(); },
    status(part) { return state.seen[part] ? 'done' : state.visited[part] ? 'started' : 'new'; },
    solved(qid) { return !!state.solved[qid]; },
    last() { return state.last; },
    any() { return Object.keys(state.visited).length > 0; },
    reset() { state = {visited: {}, seen: {}, solved: {}, last: null}; save(); }
  };
})();
