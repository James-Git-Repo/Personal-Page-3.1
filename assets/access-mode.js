/*! Access / View Mode controller — auth-gated editor */
(function(){
  const MODE_KEY = 'tsn_mode';
  const setMode = m => {
    const val = (m === 'editor' ? 'editor' : (m === 'user' ? 'user' : 'viewer'));
    document.documentElement.setAttribute('data-mode', val);
    try { localStorage.setItem(MODE_KEY, val) } catch(_) {}
  };

  // --- viewer hardening & allow-lists ---
  function disableInteractive(el){
    if (el.matches?.('[data-view-allowed]') || el.closest?.('[data-view-allowed]')) return;
    const t = (el.tagName||'').toLowerCase();
    if (['input','select','textarea','button'].includes(t)) {
      try{ el.disabled = true }catch(_){}
      el.setAttribute('data-locked','true');
    }
    if (el.getAttribute && el.getAttribute('contenteditable') === 'true') {
      el.setAttribute('contenteditable','false');
      el.classList?.remove('edit-outline','editable');
    }
    const attrs = el.getAttributeNames ? el.getAttributeNames() : [];
    attrs.forEach((name)=>{
      if (/^on(click|input|keydown|keyup|submit|change|drag|drop)/i.test(name) &&
          !el.matches('[data-view-allowed]') &&
          !el.closest('[data-view-allowed]')) {
        el.removeAttribute(name);
      }
    });
  }
  function blockEvents(root){
    const blockSel=':is(button, input, select, textarea, [contenteditable], [role="button"], .btn, .button, .switch, .toggle, .editable, .editor, .toolbar, .controls)';
    ['click','input','change','keydown','keyup','submit','dragstart','drop'].forEach((ev)=>{
      root.addEventListener(ev, function(e){
        if (e.target.closest?.('[data-view-allowed]')) return;
        const t = e.target.closest ? e.target.closest(blockSel) : null;
        if (t) { e.stopImmediatePropagation(); e.preventDefault(); }
      }, true);
    });
  }
  function disableAnchors(){
    document.querySelectorAll('a[data-view-block], a[data-lockable]').forEach((a)=>{
      if (a.closest('[data-view-allowed]')) return;
      a.addEventListener('click',(e)=>{ e.preventDefault(); e.stopImmediatePropagation(); }, {capture:true});
      a.setAttribute('aria-disabled','true'); a.style.pointerEvents='none'; a.style.opacity='0.6';
    });
  }
  function applyViewer(){
    document.documentElement.setAttribute('data-mode','viewer');
    document.querySelectorAll('*').forEach(disableInteractive);
    const killers='[data-editor-only],.editor-only,.only-editor,.edit-toolbar,.edit-controls,.admin-only,[data-admin],.debug-panel,.dev-only,.editable,.editor,.toolbar,.controls,.customize,.customise,.edit-button,.uploader,.upload,.file-upload,.dropzone,.cms,.admin,.editor-panel,.editor-area,.editor-tools,.editor-actions,[data-edit],[data-upload],[data-customize]';
    document.querySelectorAll(killers).forEach((el)=>el.remove());
    blockEvents(document);
    document.querySelectorAll('form:not([data-view-allowed])').forEach((f)=>{
      f.addEventListener('submit', (e)=>{ if (!e.target.closest('[data-view-allowed]')) { e.preventDefault(); } }, true);
    });
    disableAnchors();
  }
  function applyEditor(){
    document.documentElement.setAttribute('data-mode','editor');
    if (!document.getElementById('tsn-editor-badge')) {
      const b = document.createElement('div'); b.id='tsn-editor-badge'; b.textContent='EDITOR MODE';
      Object.assign(b.style,{position:'fixed',zIndex:'9999',bottom:'16px',right:'16px',padding:'8px 12px',background:'rgba(31,74,255,.9)',color:'#fff',font:'600 12px/1 Inter, system-ui, sans-serif',borderRadius:'999px',boxShadow:'0 8px 24px rgba(0,0,0,.2)',letterSpacing:'0.4px',userSelect:'none',pointerEvents:'none'});
      document.addEventListener('DOMContentLoaded', ()=>document.body.appendChild(b));
    }
  }

  // public helpers used by editor-tray
  async function enterEditorIfAuthed(){
    const sb = window.$sb;
    if (!sb) { setMode('viewer'); applyViewer(); return alert('Auth not ready'); }
    const { data } = await sb.auth.getUser();
    if (data?.user) { setMode('editor'); applyEditor(); }
    else { alert('Please log in first.'); }
  }
  function exitEditor(){ setMode('viewer'); applyViewer(); }
  window.TSN_View = { enterEditorIfAuthed, exitEditor };

  // Init: default viewer; auto-upgrade to editor if a session exists
  function waitForSB(cb){
    if (window.$sb && window.$sb.auth) return cb(window.$sb);
    setTimeout(()=>waitForSB(cb), 50);
  }
  document.addEventListener('DOMContentLoaded', ()=>{
    setMode('viewer'); applyViewer();
    waitForSB((sb)=>{
      sb.auth.getUser().then(({data})=>{
        if (data?.user) { setMode('editor'); applyEditor(); }
      });
      sb.auth.onAuthStateChange((_evt, session)=>{
        if (session?.user) { setMode('editor'); applyEditor(); }
        else { setMode('viewer'); applyViewer(); }
      });
    });
  });
})();
