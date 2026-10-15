/* ================= tour, spotlight and V4 ("Idealistic") =================
   Loaded after the V2 engine. V3 and V4 share the smart-review model; V4 adds
   a work queue, keyboard flow, command palette, docked source pane, autosave
   state, a faster data grid, bulk actions and safer confirmations. */

/* ---------- autosave state ---------- */
const wSavedText=()=>{const s=W.savedAt;if(!s)return 'All changes saved';const m=Math.floor((Date.now()-s)/60000);return m<1?'Saved just now':`Saved ${m} min ago`};
function wSavedPaint(){const e=document.getElementById('savedtx');if(e)e.textContent=wSavedText()}
setInterval(()=>{if(IDEAL())wSavedPaint()},20000);

/* ---------- spotlight engine ---------- */
const SPOT={on:false,steps:[],i:0,key:null,sample:false};
function spotEl(){let d=document.getElementById('spot');if(!d){d=document.createElement('div');d.id='spot';document.body.appendChild(d)}return d}
function spotStart(steps,o={}){
 SPOT.steps=steps;SPOT.i=0;SPOT.key=o.key||null;SPOT.sample=!!o.sample;SPOT.on=true;
 S.menu=null;
 spotEl().innerHTML='<div class="sp-catch"></div><div class="sp-ring"></div><div class="sp-pop" role="dialog" aria-live="polite"></div>';
 spotShow();
}
function spotShow(){
 const s=SPOT.steps[SPOT.i];if(!s){spotEnd(true);return}
 if(s.run)s.run();
 requestAnimationFrame(()=>requestAnimationFrame(()=>{
  let el=s.sel?document.querySelector(s.sel):null;
  if(el&&!el.getClientRects().length)el=null;
  if(el)el.scrollIntoView({block:s.block||'center',inline:'nearest'});
  setTimeout(()=>spotPlace(s,el),el?160:0);
 }));
}
function spotPlace(s,el){
 const d=document.getElementById('spot');if(!d||!SPOT.on)return;
 const ring=d.querySelector('.sp-ring'),pop=d.querySelector('.sp-pop');
 const n=SPOT.steps.length,i=SPOT.i,last=i===n-1;
 pop.innerHTML=`<div class="sp-top"><span class="sp-step">${i+1} / ${n}</span><button class="sp-x" data-act="spotEnd" aria-label="Close tour">${ic('x',16)}</button></div><h4>${s.title}</h4><p>${s.text}</p>${s.tip?`<div class="sp-tip">${s.tip}</div>`:''}
  <div class="sp-foot"><div class="sp-dots">${SPOT.steps.map((_,k)=>`<i class="${k===i?'on':''}"></i>`).join('')}</div><div class="sp-btns">${i>0?'<button class="btn btn-sm" data-act="spotBack">Back</button>':''}<button class="btn btn-sm btn-p" data-act="spotNext">${last?'Done':'Next'}</button></div></div>`;
 const vw=innerWidth,vh=innerHeight,pw=Math.min(360,vw-24);pop.style.width=pw+'px';
 if(el){
  const r=el.getBoundingClientRect(),pad=6;
  Object.assign(ring.style,{display:'block',left:(r.left-pad)+'px',top:(r.top-pad)+'px',width:(r.width+pad*2)+'px',height:(r.height+pad*2)+'px'});
  const ph=pop.offsetHeight;let top,left=Math.min(Math.max(12,r.left),vw-pw-12);
  if(r.bottom+ph+24<vh)top=r.bottom+pad+12;
  else if(r.top-ph-24>0)top=r.top-pad-12-ph;
  else{top=Math.max(12,Math.min(vh-ph-12,r.top+12));left=r.left>vw/2?Math.max(12,r.left-pw-18):Math.min(vw-pw-12,r.right+18)}
  pop.style.top=top+'px';pop.style.left=left+'px';pop.style.transform='none';
 }else{
  Object.assign(ring.style,{display:'block',left:'50%',top:'50%',width:'0px',height:'0px'});
  pop.style.top='50%';pop.style.left='50%';pop.style.transform='translate(-50%,-50%)';
 }
 pop.classList.add('show');
 const b=pop.querySelector('.btn-p');if(b)b.focus({preventScroll:true});
}
function spotEnd(done){
 const d=document.getElementById('spot');if(d)d.remove();
 const was=SPOT.on;SPOT.on=false;
 if(SPOT.key){try{localStorage.setItem(SPOT.key,'1')}catch(e){}}
 if(SPOT.sample){
  SPOT.sample=false;const had=W.proposals.some(x=>x.tour);W.proposals=W.proposals.filter(x=>!x.tour);
  if(had){W.view='overview';W.pid=null;W.hist=[];W.stage=null;render(true)}
 }
 if(was&&done&&SPOT.key==='tour_w')toast('Tour finished. Replay it any time from the ? button.');
}
window.addEventListener('resize',()=>{if(SPOT.on)spotShow()});
document.addEventListener('keydown',e=>{
 if(!SPOT.on)return;
 if(e.key==='Escape'){e.preventDefault();e.stopPropagation();spotEnd()}
 else if(e.key==='ArrowRight'||e.key==='Enter'){e.preventDefault();e.stopPropagation();ACT.spotNext()}
 else if(e.key==='ArrowLeft'){e.preventDefault();e.stopPropagation();ACT.spotBack()}
},true);

/* ---------- tour sample (never touches real proposals) ---------- */
function wTourSample(){
 let p=W.proposals.find(x=>x.tour);
 if(!p){
  const m=W.masters.find(x=>x.partnerId===S.co.id);
  p=wMake({ref:'PR-DEMO',partner:S.co.id,short:S.co.short,name:'Tour sample · GMC 2026–27',file:'tour-sample.pdf',size:'2.0 MB',master:m?m.id:null,at:wNow()});
  p.tour=true;W.proposals.unshift(p);
 }
 return p;
}
function wTourGo(stage){
 const p=wTourSample();W.hist=[];W.pid=p.id;W.view='proposal';W.stage=stage;W.gm=null;
 W.ui={tpl:null,comp:null,vid:null,planTab:null,open:null,pricing:'',tri:null};render(true);
}
function wTourSteps(){
 const v4=IDEAL(),S_=[];
 S_.push({title:'Welcome to the review flow',text:'A one-minute walkthrough of how a proposal goes from PDF to plans. It uses a throw-away sample, so nothing here is saved.',run:()=>{W.view='overview';W.pid=null;W.hist=[];W.stage=null;render(true)}});
 if(v4)S_.push({sel:'.nextup',title:'Start with what needs you',text:'Your queue puts the most urgent proposal first. One button takes you straight to the next thing to do.',tip:'Press <kbd>Enter</kbd> on this page to open it.'});
 S_.push({sel:'#wrows',title:'One row per proposal',text:'Status, progress and last update at a glance. The short button on the right is always the next step.'});
 if(v4)S_.push({sel:'.cmdk-btn',title:'Jump anywhere',text:'Open the command palette to find a proposal, switch page or start an upload without leaving the keyboard.',tip:'<kbd>⌘</kbd><kbd>K</kbd>'});
 S_.push({sel:'[data-act="w_intake"]',title:'Add proposals',text:'Drop one or more PDFs. Each file becomes its own proposal, checked for duplicates and revisions.'});
 S_.push({sel:'.stepper',title:'Five steps, one at a time',text:'Document, Groups, Left overs, Templates, Plans. A step unlocks when the previous one is done.',run:()=>wTourGo('groups')});
 S_.push({sel:'.page .card',title:'Check the groups',text:'The parser splits members into groups. Each group becomes one template, so fix the structure here first.',block:'start'});
 S_.push({sel:'.lhead',title:'Place the left-overs',text:'Terms the parser could not attach to a group. Assign each one, or set it aside with a reason. You will get a final warning before continuing.',run:()=>{const p=wTourSample();p.groups.forEach(g=>{g.status='confirmed';g.seen=true});wRecompute(p);W.stage='leftovers';render(true)},block:'start'});
 S_.push({sel:'.smart',title:'Smart review',text:'Every term the system is confident about is matched for you. You only decide what needs attention.',run:()=>{const p=wTourSample();p.clauses.filter(c=>c.groupId===null&&!c.na).forEach(c=>{c.na=true;c.naReason='other'});p.loReview=false;wRecompute(p);W.stage='templates';W.ui.tpl=null;W.ui.tri=null;W.ui.comp=null;render(true)},block:'start'});
 S_.push({sel:'.seg.tri',title:'Three views',text:'Needs attention is where you work. Auto-matched lets you accept the confident ones in one go. All terms shows everything.'});
 if(v4)S_.push({sel:'.rvstrip',title:'Review one term at a time',text:'Step through only the terms that need you, with a progress count. Confirming moves you to the next one.',tip:'<kbd>J</kbd> next · <kbd>K</kbd> previous · <kbd>↵</kbd> confirm · <kbd>E</kbd> edit'});
 S_.push({sel:'.tmain',title:'Document on the left, values on the right',text:'Confirm or edit the values, switch variants, and choose Apply to all variants. The wording on the left is read-only.',block:'start'});
 S_.push({sel:'[data-act="w_doc"]',title:'The document is always one click away',text:v4?'Open it docked beside your work. The selected term is highlighted in the original, so you can verify at a glance.':'Open it any time as Text or as the Original pages.',block:'start'});
 S_.push({sel:'#bar',title:'One action bar',text:'The main action is always bottom right. Save & exit keeps your place.'+(v4?' In this version everything saves automatically.':'')});
 S_.push({title:'You are set',text:'Take the tour again from the ? button in the header. Switch versions from the Version menu to compare the flows.'});
 return S_;
}
function wSpotAISteps(){
 const v4=IDEAL();
 return [
  {sel:'.smart',title:'Meet smart review',text:'I read every term in this template and matched the ones I am confident about, so you only decide what needs you.',block:'start'},
  {sel:'.seg.tri',title:'Three ways to look',text:'Needs attention is your to-do list. Auto-matched lets you accept the confident terms in one go. All terms shows everything.'}
 ].concat(v4?[{sel:'.rvstrip',title:'Work through it quickly',text:'Step through the open terms one by one.',tip:'<kbd>J</kbd> next · <kbd>K</kbd> previous · <kbd>↵</kbd> confirm'}]:[]);
}
function wAfterHook(){
 document.body.dataset.dens=W.dens||'compact';
 if(IDEAL()&&W.view==='proposal'){
  const f=document.querySelector('.wbq.foc')||document.querySelector('.wb .wbq');const id=f&&f.dataset.cl;
  if(id&&W.docFocus!==id){W.docFocus=id;if(W.docOpen)wDocDrawer()}
 }
 if(SMART()&&W.view==='proposal'&&W.stage==='templates'&&!SPOT.on&&!W.spotQueued&&document.querySelector('.smart')){
  let seen=false;try{seen=!!localStorage.getItem('spot_ai')}catch(e){}
  if(!seen){W.spotQueued=true;setTimeout(()=>{if(!SPOT.on&&document.querySelector('.smart'))spotStart(wSpotAISteps(),{key:'spot_ai'});W.spotQueued=false},600)}
 }
}

/* ---------- V4: queue overview ---------- */
function wQueue(){
 const sT=W.tab,sQ=W.hq;W.tab='all';W.hq='';const all=wFilter();W.tab=sT;W.hq=sQ;
 const nxt=all.find(p=>p.status==='failed'||wPending(p).length||['group_review','templates','templates_done','plans_generated'].includes(p.status));
 const hero=nxt?(()=>{const c=wCta(nxt);return `<section class="nextup"><div class="nu-l"><span class="eyebrow">Next up</span><h2>${esc(nxt.name)}</h2><p>${esc(WST[nxt.status].l)}${wPending(nxt).length?` · ${wPending(nxt).length} to review`:''} · ${wAgo(nxt.updatedAt)}</p></div><div class="nu-r"><button class="btn btn-p btn-lg" data-act="w_open" data-id="${nxt.id}" data-nextup="1">${esc(c.t||c.l)}${ic('arrow',17)}</button><span class="kbhint"><kbd>↵</kbd> to open</span></div></section>`})()
  :`<section class="nextup done"><div class="nu-l"><span class="eyebrow">Next up</span><h2>You are all caught up</h2><p>Nothing needs you right now. Upload a proposal to start the next one.</p></div><div class="nu-r"><button class="btn btn-p btn-lg" data-act="w_intake">${ic('plus',17)}New proposal</button></div></section>`;
 return `<div class="ph"><h1>Your queue</h1><div class="phr"><button class="btn" data-act="startTourW">Take the tour</button><button class="btn btn-p btn-lg" data-act="w_intake">${ic('plus',18)}New proposal</button></div></div>
  ${hero}${V3X()?wInsights():''}<div class="histcol">${wHistory(true)}</div>`;
}
function wBulk(){
 const n=(W.rsel||[]).filter(id=>W.proposals.some(p=>p.id===id)).length;
 return n?`<b>${n} selected</b><button class="btn btn-xs" data-act="w_exportCsv">Export CSV</button><button class="btn btn-xs btn-t" data-act="w_clearRsel">Clear</button>`:'';
}
function wBulkPaint(){const b=document.getElementById('wbulk');if(b)b.innerHTML=wBulk();const a=document.querySelector('[data-wc="rowPickAll"]');if(a){const v=wFilter().map(p=>p.id);a.checked=v.length>0&&v.every(id=>(W.rsel||[]).includes(id))}}

/* ---------- V4: why + review queue ---------- */
function wWhy(c){
 if(!c.build)return 'No values were built from this wording.';
 if(c.build.missing&&c.build.missing.length)return `Missing ${c.build.missing.map(m=>(ATTR[m]||{l:m}).l.toLowerCase()).join(', ')}.`;
 if(c.build.reason)return c.build.reason;
 if(c.build.status==='partial')return 'Only some values were found in the wording.';
 if(c.mappedBy==='operator')return 'You chose this section.';
 if(wAuto(c))return 'Every required value was found in the text.';
 return 'Check the values against the wording.';
}
function wRvQueue(p,t){
 const out=[];wUsedComps(p,t).forEach(k=>{wClausesOf(p,t.groupId).filter(c=>c.componentKey===k&&!c.na&&!wResolved(c)&&!wAuto(c)).forEach(c=>out.push(c))});
 return out;
}
function wRvStrip(p,t){
 const q=wRvQueue(p,t);if(!q.length||wTplLocked(p,t.id))return '';
 let i=q.findIndex(c=>c.id===W.ui.focusCl);if(i<0){i=0;W.ui.focusCl=q[0].id}
 const c=q[i],ok=wCase(c)==='review';
 return `<div class="rvstrip"><span class="rvt">Reviewing <b>${i+1}</b> of ${q.length}</span><div class="rvbar"><i style="width:${(i+1)/q.length*100}%"></i></div>
  <div class="rvb"><button class="btn btn-xs" data-act="w_rv" data-d="-1">${ic('left',13)}Prev <kbd>K</kbd></button><button class="btn btn-xs" data-act="w_rv" data-d="1">Next <kbd>J</kbd>${ic('right',13)}</button><button class="btn btn-xs btn-p" data-act="w_rvConfirm" ${ok?'':'disabled title="Fill the missing values first"'}>${ic('cc',13)}Confirm <kbd>↵</kbd></button></div></div>`;
}
function wFocus(c,quiet){
 W.ui.focusCl=c.id;W.ui.comp=c.componentKey;if(c.variantId!==ALL)W.ui.vid=c.variantId;W.ui.edit=null;W.docFocus=c.id;
 if(quiet)return;
 renderPage();renderBar();
 const f=document.querySelector('.wbq.foc');if(f)f.scrollIntoView({block:'center',behavior:'smooth'});
}
function wV4AfterVerify(p,c){
 const tp=wTplOf(p,c.groupId);if(!tp)return;
 W.undoFn=()=>{c.verified=false;wRefreshPlans(p,tp.id);wTouch(p);wRecompute(p);wFocus(c,true);render()};
 const comps=wUsedComps(p,tp),list=wClausesOf(p,c.groupId),rank=x=>comps.indexOf(x.componentKey)*1e4+list.indexOf(x);
 const q=wRvQueue(p,tp),nx=q.find(x=>rank(x)>rank(c))||q[0];
 if(nx)wFocus(nx,true);else W.ui.focusCl=null;
 toast('Term confirmed',{uundo:1});
}

/* ---------- command palette ---------- */
function cmdkItems(){
 const it=[];const go=(l,h,f)=>it.push({l,h,f});
 go('Go to Your queue','Page',()=>ACT.w_nav({dataset:{v:'overview'}}));
 go('Go to Proposals','Page',()=>ACT.w_nav({dataset:{v:'proposals'}}));
 go('Go to Packages','Page',()=>ACT.w_nav({dataset:{v:'packages'}}));
 go('Go to Partner variables','Page',()=>ACT.w_nav({dataset:{v:'partners'}}));
 go('Go to Activity','Page',()=>ACT.w_nav({dataset:{v:'activity'}}));
 go('New proposal','Action',()=>ACT.w_intake());
 wProps().forEach(p=>go(`Open ${p.name}`,`${p.ref} · ${WST[p.status].l}`,()=>ACT.w_open({dataset:{id:p.id}})));
 if(W.view==='proposal')go('Toggle proposal document','Action',()=>ACT.w_doc());
 go('Toggle row density','Action',()=>ACT.w_dens());
 go('Keyboard shortcuts','Help',()=>ACT.shortcuts());
 go('Take the tour','Help',()=>ACT.startTourW());
 go('Reset prototype','Action',()=>ACT.resetVer());
 return it;
}
let CMDK={on:false,i:0,q:''};
function cmdkClose(){const d=document.getElementById('cmdk');if(d)d.remove();CMDK.on=false}
function cmdkDraw(){
 const d=document.getElementById('cmdk');if(!d)return;
 const q=CMDK.q.trim().toLowerCase().split(/\s+/).filter(Boolean);
 const all=cmdkItems(),list=all.filter(x=>q.every(w=>(x.l+' '+x.h).toLowerCase().includes(w))).slice(0,9);
 if(CMDK.i>=list.length)CMDK.i=Math.max(0,list.length-1);
 CMDK.list=list;
 d.querySelector('.ck-list').innerHTML=list.length?list.map((x,i)=>`<button class="ck-i ${i===CMDK.i?'on':''}" data-act="cmdkRun" data-i="${i}"><span>${esc(x.l)}</span><em>${esc(x.h)}</em></button>`).join(''):'<div class="ck-none">No matches</div>';
}
function cmdkOpen(){
 if(CMDK.on){cmdkClose();return}
 CMDK={on:true,i:0,q:''};
 const d=document.createElement('div');d.id='cmdk';
 d.innerHTML=`<div class="ck-scrim" data-act="cmdkClose"></div><div class="ck-box" role="dialog" aria-label="Command palette"><div class="ck-in">${ic('search',17)}<input id="ckq" autocomplete="off" placeholder="Search proposals, pages and actions" aria-label="Search"><kbd>esc</kbd></div><div class="ck-list"></div><div class="ck-foot"><span><kbd>↑</kbd><kbd>↓</kbd> move</span><span><kbd>↵</kbd> open</span></div></div>`;
 document.body.appendChild(d);cmdkDraw();$id('ckq').focus();
 $id('ckq').addEventListener('input',e=>{CMDK.q=e.target.value;CMDK.i=0;cmdkDraw()});
 $id('ckq').addEventListener('keydown',e=>{
  if(e.key==='ArrowDown'){e.preventDefault();CMDK.i=Math.min((CMDK.list||[]).length-1,CMDK.i+1);cmdkDraw()}
  else if(e.key==='ArrowUp'){e.preventDefault();CMDK.i=Math.max(0,CMDK.i-1);cmdkDraw()}
  else if(e.key==='Enter'){e.preventDefault();ACT.cmdkRun({dataset:{i:CMDK.i}})}
  else if(e.key==='Escape'){e.preventDefault();e.stopPropagation();cmdkClose()}
 });
}

/* ---------- V4: data grid (keyboard, fill-down, undo) ---------- */
W.undoS=[];W.redoS=[];
function wGridPush(a){W.undoS.push(a);if(W.undoS.length>60)W.undoS.shift();W.redoS=[]}
function wKeepFocus(run){
 setTimeout(()=>{
  const a=document.activeElement;
  const key=a&&a.matches&&a.matches('.xin')?{wc:a.dataset.wc,id:a.dataset.id,f:a.dataset.f,k:a.dataset.k}:null;
  run();
  if(key){const q=`.xin[data-wc="${key.wc}"][data-id="${key.id}"]${key.f?`[data-f="${key.f}"]`:''}${key.k?`[data-k="${key.k}"]`:''}`;const n=document.querySelector(q);if(n)n.focus()}
 },0);
}
(function(){
 const pf=WCH.planField,ps=WCH.planSel;
 WCH.planField=function(el){
  if(!IDEAL())return pf(el);
  const p=wcur(),x=p&&p.plans.find(q=>q.id===el.dataset.id);if(!x)return pf(el);
  wGridPush({id:x.id,f:el.dataset.f,old:x[el.dataset.f],nw:el.value});x.touched={...(x.touched||{}),[el.dataset.f]:true};
  wKeepFocus(()=>pf(el));
 };
 WCH.planSel=function(el){
  if(!IDEAL())return ps(el);
  const p=wcur(),x=p&&p.plans.find(q=>q.id===el.dataset.id);if(!x)return ps(el);
  wGridPush({id:x.id,k:el.dataset.k,old:x.selection[el.dataset.k],nw:el.value});x.touched={...(x.touched||{}),[el.dataset.k]:true};
  wKeepFocus(()=>ps(el));
 };
 Object.assign(WCH,{
  rowPick(el){const s=W.rsel=W.rsel||[],i=s.indexOf(el.dataset.id);if(el.checked&&i<0)s.push(el.dataset.id);else if(!el.checked&&i>-1)s.splice(i,1);wBulkPaint()},
  rowPickAll(el){const ids=wFilter().map(p=>p.id);W.rsel=el.checked?[...new Set([...(W.rsel||[]),...ids])]:(W.rsel||[]).filter(id=>!ids.includes(id));document.querySelectorAll('[data-wc="rowPick"]').forEach(c=>{c.checked=(W.rsel||[]).includes(c.dataset.id)});wBulkPaint()}
 });
})();
function wGridUndo(redo){
 const from=redo?W.redoS:W.undoS,to=redo?W.undoS:W.redoS,a=from.pop();
 if(!a){toast(redo?'Nothing to redo':'Nothing to undo');return}
 const p=wcur(),x=p&&p.plans.find(q=>q.id===a.id);if(!x)return;
 const val=redo?a.nw:a.old;
 if(a.f)x[a.f]=val;else{x.selection[a.k]=val;x.values=wPlanValues(p,p.templates.find(q=>q.id===x.templateId),x.selection)}
 x.reviewStatus='pending';to.push(a);wTouch(p);renderPage();renderBar();
}
function wGridMove(el,dr,dc){
 const td=el.closest('td'),tr=td&&td.parentElement,tb=tr&&tr.parentElement;if(!tb)return false;
 const rows=[...tb.children].filter(r=>r.tagName==='TR'&&!r.classList.contains('det'));
 let ri=rows.indexOf(tr)+dr,ci=[...tr.children].indexOf(td);
 if(ri<0||ri>=rows.length)return false;
 let n=null;
 if(dc===0){n=rows[ri].children[ci]&&rows[ri].children[ci].querySelector('.xin')}
 else{const cells=[...rows[ri].children];ci+=dc;while(ci>=0&&ci<cells.length&&!(n=cells[ci].querySelector('.xin')))ci+=dc}
 if(n){n.focus();if(n.select)try{n.select()}catch(e){}return true}
 return false;
}
function wGridKey(e){
 const el=e.target,mod=e.metaKey||e.ctrlKey;
 if(mod&&e.key.toLowerCase()==='d'){
  e.preventDefault();const td=el.closest('td'),tr=td.parentElement,prev=tr.previousElementSibling;if(!prev)return;
  const src=prev.children[[...tr.children].indexOf(td)].querySelector('.xin');if(!src)return;
  el.value=src.value;el.dispatchEvent(new Event('change',{bubbles:true}));return;
 }
 if(e.key==='ArrowDown'||(e.key==='Enter'&&!e.shiftKey)){if(wGridMove(el,1,0))e.preventDefault()}
 else if(e.key==='ArrowUp'||(e.key==='Enter'&&e.shiftKey)){if(wGridMove(el,-1,0))e.preventDefault()}
 else if(e.key==='ArrowRight'&&(el.tagName==='SELECT'||el.selectionStart===el.value.length)){if(wGridMove(el,0,1))e.preventDefault()}
 else if(e.key==='ArrowLeft'&&(el.tagName==='SELECT'||el.selectionStart===0)){if(wGridMove(el,0,-1))e.preventDefault()}
 else if(e.key==='Escape'){el.blur()}
}

/* ---------- V4: global keyboard ---------- */
document.addEventListener('keydown',e=>{
 if(!IDEAL()||SPOT.on)return;
 const el=e.target,typing=!!el&&(/^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName)||el.isContentEditable),mod=e.metaKey||e.ctrlKey;
 if(mod&&e.key.toLowerCase()==='k'){e.preventDefault();cmdkOpen();return}
 if(CMDK.on)return;
 if(el&&el.classList&&el.classList.contains('xin')){
  if(mod&&e.key.toLowerCase()==='z'){e.preventDefault();wGridUndo(e.shiftKey);return}
  wGridKey(e);return;
 }
 if(mod&&e.key.toLowerCase()==='z'&&W.view==='proposal'&&W.stage==='plans'&&!typing){e.preventDefault();wGridUndo(e.shiftKey);return}
 if(typing||mod||e.altKey||$('#overlay').classList.contains('open'))return;
 if(el&&/^(BUTTON|A)$/.test(el.tagName)&&e.key==='Enter')return;
 const k=e.key;
 if(k==='?'){e.preventDefault();ACT.shortcuts();return}
 if(W.view==='overview'||W.view==='proposals'){
  if(k==='/'){const q=$id('whq');if(q){e.preventDefault();q.focus()}}
  else if(k==='Enter'&&W.view==='overview'){const b=document.querySelector('[data-nextup]');if(b){e.preventDefault();b.click()}}
  return;
 }
 if(W.view!=='proposal')return;
 if(k==='d'){e.preventDefault();ACT.w_doc();return}
 if(W.stage!=='templates')return;
 const p=wcur(),t=p&&p.templates.find(x=>x.id===W.ui.tpl);if(!t||wTplLocked(p,t.id))return;
 if(k==='j'||k==='k'){e.preventDefault();ACT.w_rv({dataset:{d:k==='j'?1:-1}})}
 else if(k==='Enter'){e.preventDefault();ACT.w_rvConfirm()}
 else if(k==='e'){const c=(W.ui.focusCl&&p.clauses.find(x=>x.id===W.ui.focusCl));if(c){e.preventDefault();ACT.w_edit({dataset:{id:c.id}})}}
 else if(k==='a'){if(wAutoList(p,t).length){e.preventDefault();ACT.w_acceptAuto()}}
});

/* ---------- actions ---------- */
Object.assign(ACT,{
 noop(){},
 startTourW(){spotStart(wTourSteps(),{key:'tour_w',sample:true})},
 spotAI(){if(W.view==='proposal'&&W.stage==='templates')spotStart(wSpotAISteps(),{key:'spot_ai'})},
 spotNext(){if(SPOT.i>=SPOT.steps.length-1){spotEnd(true);return}SPOT.i++;spotShow()},
 spotBack(){if(SPOT.i>0){SPOT.i--;spotShow()}},
 spotEnd(){spotEnd(false)},
 cmdk(){cmdkOpen()},
 cmdkClose(){cmdkClose()},
 cmdkRun(t){const x=(CMDK.list||[])[+t.dataset.i];cmdkClose();if(x)x.f()},
 w_dens(){W.dens=W.dens==='comfortable'?'compact':'comfortable';render()},
 w_clearRsel(){W.rsel=[];document.querySelectorAll('[data-wc="rowPick"]').forEach(c=>c.checked=false);wBulkPaint()},
 w_exportCsv(){
  const rows=W.proposals.filter(p=>(W.rsel||[]).includes(p.id));if(!rows.length)return;
  const q=s=>'"'+String(s==null?'':s).replace(/"/g,'""')+'"';
  const csv=['Reference,Name,File,Status,Version,Master policy,Updated'].concat(rows.map(p=>[p.ref,p.name,p.file,WST[p.status].l,'v'+p.version,wMasterName(p.masterId),new Date(p.updatedAt).toISOString()].map(q).join(','))).join('\n');
  const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv'}));a.download='proposals.csv';document.body.appendChild(a);a.click();a.remove();
  toast(`${rows.length} ${rows.length>1?'proposals':'proposal'} exported`);
 },
 w_rv(t){
  const p=wcur(),tp=p&&p.templates.find(x=>x.id===W.ui.tpl);if(!tp)return;
  const q=wRvQueue(p,tp);if(!q.length)return;
  let i=q.findIndex(c=>c.id===W.ui.focusCl);if(i<0)i=0;else i=(i+(+t.dataset.d)+q.length)%q.length;
  wFocus(q[i]);
 },
 w_rvConfirm(){
  const p=wcur(),c=p&&p.clauses.find(x=>x.id===W.ui.focusCl);if(!c)return;
  if(wCase(c)!=='review')return toast('Fill the missing values first.',{err:1});
  ACT.w_verify({dataset:{id:c.id}});
 },
 w_undoLast(t){const f=W.undoFn;W.undoFn=null;const tt=t&&t.closest&&t.closest('.toast');if(tt)tt.remove();if(f)f()},
 shortcuts(){
  const row=(k,d)=>`<tr><td>${k.split(' ').map(x=>`<kbd>${x}</kbd>`).join(' ')}</td><td>${d}</td></tr>`;
  openOv('modal',{title:'Keyboard shortcuts',sub:'Available in the Idealistic version',body:`<table class="kbt"><tbody>
   ${row('⌘ K','Command palette: jump to any proposal, page or action')}${row('?','Show this list')}${row('/','Focus search on the list')}${row('↵','Open the next-up proposal (queue)')}
   ${row('J','Next term to review')}${row('K','Previous term to review')}${row('↵','Confirm the highlighted term')}${row('E','Edit values of the highlighted term')}${row('A','Accept all auto-matched terms')}${row('D','Show or hide the proposal document')}
   ${row('↑ ↓ ← →','Move between cells in the plans grid')}${row('⌘ D','Fill the cell down from the one above')}${row('⌘ Z','Undo a grid edit')}${row('⌘ ⇧ Z','Redo')}</tbody></table>`,foot:`<button class="btn btn-p" data-act="closeOv">Done</button>`});
 }
});
const _w_comp=ACT.w_comp;
ACT.w_comp=function(t){
 _w_comp(t);
 if(IDEAL()){const p=wcur(),tp=p&&p.templates.find(x=>x.id===W.ui.tpl);if(tp){const c=wRvQueue(p,tp).find(x=>x.componentKey===W.ui.comp);if(c){W.ui.focusCl=c.id;renderPage()}}}
};
document.addEventListener('input',e=>{
 if(e.target.id==='gtype'){const b=$id('gok');if(b)b.disabled=e.target.value.trim().toUpperCase()!=='GENERATE'}
});
