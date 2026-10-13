/* ================= events ================= */
document.addEventListener('click',e=>{
 if(S.menu&&!e.target.closest('.co,.ver,.me-w')){S.menu=null;renderTop()}
 if((S.gm||S.lm||W.gm)&&!e.target.closest('.kb')){S.gm=null;S.lm=null;W.gm=null;renderPage()}
 const t=e.target.closest('[data-act]');if(!t||t.disabled)return;
 if(t.tagName==='INPUT')return;
 const f=ACT[t.dataset.act];if(f)f(t,e);
});
document.addEventListener('change',e=>{
 const t=e.target;
 if(t.dataset&&t.dataset.wc&&WCH[t.dataset.wc]){WCH[t.dataset.wc](t);return}
 if(t.id==='fi'&&t.files[0]){setFile(t.files[0]);return}
 if(t.id==='fi2'&&t.files[0]){startIntakeWithFile(t.files[0]);t.value='';return}
 if(t.id==='wfi'&&t.files.length){[...t.files].forEach(f=>wAttachFile({name:f.name,size:(f.size/1048576).toFixed(1)+' MB',blob:f}));refreshIntake();return}
 if(t.id==='wfi2'&&t.files.length){wOpenIntake();[...t.files].forEach(f=>wAttachFile({name:f.name,size:(f.size/1048576).toFixed(1)+' MB',blob:f}));refreshIntake();t.value='';return}
 if(t.id==='wrep'&&t.files[0]){const p=wcur();p.replacement={name:t.files[0].name,mode:/corrupt|broken|fail/i.test(t.files[0].name)?'fail':'clean'};renderPage();return}
 const c=t.dataset&&t.dataset.chg;
 if(c==='nfMaster'){S.nf.master=t.value;refreshIntake()}
 if(c==='nfIns')S.nf.insurer=t.value;
});
document.addEventListener('input',e=>{
 const t=e.target;const i=t.dataset&&t.dataset.inp;
 if(t.dataset&&t.dataset.wi&&WIN[t.dataset.wi]){WIN[t.dataset.wi](t);return}
 if(t.id==='wdq'){W.docQ=t.value;const pos=t.selectionStart;wDocDrawer();const n=$id('wdq');if(n){n.focus();n.setSelectionRange(pos,pos)}return}
 if(t.id==='whq'){W.hq=t.value;W.pg=1;$id('wrows').innerHTML=wRows();$id('wpager').innerHTML=wPager();return}
 if(i==='nfName')S.nf.name=t.value;
 if(i==='nfNew'){S.nf.newName=t.value;refreshNf()}
 if(t.id==='hq'){S.hq=t.value;$id('hrows').innerHTML=histRows()}
 if(t.id==='vq'){S.vq=t.value;$id('vsecs').innerHTML=varSections(cur())}
});
document.addEventListener('keydown',e=>{
 if(e.key==='Escape'){if($('#overlay').classList.contains('open'))closeOv();else if(S.gm||S.lm||W.gm){S.gm=S.lm=W.gm=null;renderPage()}else if(S.menu){S.menu=null;renderTop()}else if(S.sb){S.sb=false;renderSb()}}
 if((e.key==='Enter'||e.key===' ')&&e.target.classList&&e.target.classList.contains('rw')){e.preventDefault();const a=ACT[e.target.dataset.act];if(a)a(e.target,e)}
 if(e.key==='Tab'&&$('#overlay').classList.contains('open')){
  const f=[...$('#overlay').querySelectorAll('button,input,select,textarea,[href]')].filter(x=>!x.disabled&&x.offsetParent!==null);
  if(!f.length)return;const a=f[0],z=f[f.length-1];
  if(e.shiftKey&&document.activeElement===a){e.preventDefault();z.focus()}else if(!e.shiftKey&&document.activeElement===z){e.preventDefault();a.focus()}
 }
});
const DZ='[data-drop],[data-wdrop],[data-dropopen]';
document.addEventListener('dragover',e=>{const d=e.target.closest(DZ);if(d){e.preventDefault();d.classList.add('over')}});
document.addEventListener('dragleave',e=>{const d=e.target.closest(DZ);if(d)d.classList.remove('over')});
document.addEventListener('drop',e=>{
 const d=e.target.closest(DZ);if(!d)return;e.preventDefault();d.classList.remove('over');const fl=[...e.dataTransfer.files];if(!fl.length)return;
 if(d.hasAttribute('data-drop'))setFile(fl[0]);
 else if(d.hasAttribute('data-dropopen'))startIntakeWithFile(fl[0]);
 else{if(!W.intake)wOpenIntake();fl.forEach(f=>wAttachFile({name:f.name,size:(f.size/1048576).toFixed(1)+' MB',blob:f}));refreshIntake()}
});
window.addEventListener('resize',()=>{if(VER!=='v1')wFit()});
render();
