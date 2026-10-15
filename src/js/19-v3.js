/* ================= V3 ("Production-grade") =================
   Everything in V2 (idealistic) plus: notification inbox, background upload
   tray, pre-flight checks, problems list, four-eyes approval, ownership and
   ageing, term comments, offline state, and a stronger data grid.
   Internal id is "v5"; V3X() is true only there. */

W.people=['Riya Kulkarni','Prakash V.','Meera S.'];
W.notifs=[];

/* ---------- ownership + ageing ---------- */
function wSeedOwners(){W.proposals.forEach((p,i)=>{if(p.owner===undefined)p.owner=i%4===3?null:W.people[i%4]||null})}
function wOwnerTxt(p){
 if(p.owner===undefined)wSeedOwners();
 if(!p.owner)return '<span class="own-t un">Unassigned</span>';
 const n=p.owner.split(' ');return `<span class="own-t">${esc(n[0]+(n[1]?' '+n[1][0]+'.':''))}</span>`;
}
function wOwnerSel(p){
 if(p.owner===undefined)wSeedOwners();
 return `<label class="own"><span>Owner</span><select class="in fsel" data-wc="owner" aria-label="Owner"><option value="">Unassigned</option>${W.people.map(n=>`<option ${p.owner===n?'selected':''}>${esc(n)}</option>`).join('')}</select></label>`;
}
function wAgeChip(p){
 const needs=p.status==='failed'||wPending(p).length||['group_review','templates','templates_done','plans_generated'].includes(p.status);
 if(!needs)return '';
 const h=(Date.now()-new Date(p.updatedAt))/3.6e6;if(h<24)return '';
 return ` <span class="chip ${h>=48?'b':'w'} age" title="No activity for ${Math.floor(h)} hours" style="margin-left:4px">Waiting ${Math.floor(h/24)}d</span>`;
}
function wInsights(){
 const P=wProps();
 const needs=P.filter(p=>p.status==='failed'||wPending(p).length||['group_review','templates','templates_done','plans_generated'].includes(p.status));
 const oldest=needs.slice().sort((a,b)=>new Date(a.updatedAt)-new Date(b.updatedAt))[0];
 const cl=P.filter(p=>!['draft','parsing','failed'].includes(p.status)).flatMap(p=>p.clauses);
 const auto=cl.length?Math.round(cl.filter(c=>c.build&&c.build.status==='built'&&c.mappedBy!=='operator').length/cl.length*100):0;
 const open=P.reduce((n,p)=>n+p.templates.reduce((m,t)=>m+wTplStats(p,t).open,0),0);
 const age=oldest?Math.max(1,Math.round((Date.now()-new Date(oldest.updatedAt))/3.6e6)):0;
 return `<div class="insights"><span><b>${needs.length}</b> need you</span><span><b>${open}</b> terms open</span><span><b>${auto}%</b> auto-matched</span>${oldest?`<span class="ins-old">Oldest waiting <b>${age>=48?Math.round(age/24)+'d':age+'h'}</b> · ${esc(oldest.name)}</span>`:''}</div>`;
}

/* ---------- notifications ---------- */
function wNotify(kind,text,pid,err){
 W.notifs.unshift({id:'n'+rid(),at:wNow(),kind:err?'error':kind,text:String(text).replace(/<[^>]+>/g,''),pid,read:false});
 if(W.notifs.length>30)W.notifs.pop();
 if(V3X()&&S.menu!=='bell')renderTop();
}
function wSeedNotifs(){
 if(W.notifSeeded||!W.proposals.length)return;W.notifSeeded=true;
 W.proposals.forEach(p=>{
  if(p.status==='failed')W.notifs.push({id:'n'+rid(),at:p.updatedAt,kind:'error',text:`Parsing failed for ${p.name}`,pid:p.id,read:false});
  else if(wPending(p).length)W.notifs.push({id:'n'+rid(),at:p.updatedAt,kind:'info',text:`${p.name}: ${wPending(p).length} revision changes need a decision`,pid:p.id,read:false});
  else if(p.status==='group_review')W.notifs.push({id:'n'+rid(),at:p.updatedAt,kind:'ok',text:`${p.name} is ready for review`,pid:p.id,read:true});
 });
 W.notifs.sort((a,b)=>new Date(b.at)-new Date(a.at));
}
function wBell(){
 wSeedNotifs();
 const un=W.notifs.filter(n=>!n.read).length,open=S.menu==='bell';
 const ico={error:'alert',ok:'check',info:'info',approval:'shield'};
 return `<div class="bell-w"><button class="icon-btn" data-act="toggleBell" aria-haspopup="true" aria-expanded="${open}" aria-label="Notifications, ${un} unread">${ic('bell',20)}${un?`<span class="dot num">${un>9?'9+':un}</span>`:''}</button>
  ${open?`<div class="pop bell-pop" role="menu"><div class="bp-h"><b>Notifications</b>${un?'<button class="btn btn-xs btn-t" data-act="notifReadAll">Mark all read</button>':''}</div>
   <div class="bp-l">${W.notifs.length?W.notifs.slice(0,12).map(n=>`<button class="bp-i ${n.read?'':'un'}" data-act="notifOpen" data-id="${n.id}"><span class="bp-ic ${n.kind}">${ic(ico[n.kind]||'info',14)}</span><span class="bp-t">${esc(n.text)}<em>${wAgo(n.at)}</em></span></button>`).join(''):'<div class="bp-none">You are all caught up.</div>'}</div></div>`:''}</div>`;
}

/* ---------- background upload tray ---------- */
function wTray(){
 let d=$id('tray');
 const run=V3X()&&!W.trayOff?wProps().filter(p=>p.status==='parsing'):[];
 if(!run.length){if(d)d.remove();if(!V3X()||!wProps().some(p=>p.status==='parsing'))W.trayOff=false;return}
 if(!d){d=document.createElement('div');d.id='tray';d.setAttribute('role','status');document.body.appendChild(d)}
 d.innerHTML=`<div class="tray-h"><b>${run.length} ${run.length>1?'files':'file'} being read</b><button class="icon-btn" data-act="trayHide" aria-label="Hide">${ic('x',14)}</button></div>${run.map(p=>`<button class="tray-i" data-act="w_open" data-id="${p.id}"><span>${esc(p.name)}</span><i><b style="width:${Math.round(p.progress)}%"></b></i><em>${Math.round(p.progress)}%</em></button>`).join('')}<div class="tray-f">You can keep working. We will notify you when each one is ready.</div>`;
}
setInterval(()=>{if(V3X())wTray();else{const d=$id('tray');if(d)d.remove()}},700);

/* ---------- offline state ---------- */
function wOfflinePaint(){
 let b=$id('offline');
 if(V3X()&&W.offline){
  if(!b){b=document.createElement('div');b.id='offline';b.setAttribute('role','alert');document.body.appendChild(b)}
  b.innerHTML=`${ic('alert',16)}<span><b>You are offline.</b> Your changes stay in this tab and will be kept when the connection returns.</span>`;
 }else if(b)b.remove();
 const t=$id('savedtx');if(t)t.textContent=W.offline?'Offline · changes kept':wSavedText();
}
window.addEventListener('offline',()=>{W.offline=true;wOfflinePaint()});
window.addEventListener('online',()=>{W.offline=false;wOfflinePaint();if(V3X())toast('Back online. Everything is saved.')});

/* ---------- problems list ---------- */
const WPLAN_ERR={name:'Plan name is empty',duplicate:'Another row has the same plan name',display:'Display name is empty',pricing:'Pricing schema is empty',selection:'A section has no valid variant'};
function wProblems(p){
 const out=[];
 if(W.stage==='templates'){
  const un=wUnplaced(p).length;
  if(un)out.push({t:`${un} unplaced ${un>1?'terms':'term'}`,d:'Place or set aside in Left overs',stage:'leftovers'});
  p.groups.map(g=>wTplOf(p,g.id)).filter(Boolean).forEach(t=>{
   if(wTplLocked(p,t.id))return;const gn=wGroupOfTpl(p,t).name;
   const us=wClausesOf(p,t.groupId).filter(c=>c.componentKey===null&&!c.na).length;
   if(us)out.push({t:`${gn} · needs a section`,d:`${us} ${us>1?'terms':'term'} without a plan-form section`,tpl:t.id,comp:'__unsec'});
   wUsedComps(p,t).forEach(k=>{const s=wCompStats(p,t,k);if(s.resolved<s.total)out.push({t:`${gn} · ${clabel(k)}`,d:`${s.total-s.resolved} to confirm${s.blocked?' · blocked':''}`,tpl:t.id,comp:k})});
  });
 }else if(W.stage==='plans'){
  p.plans.filter(x=>!(x.generated&&!x.needsGeneration)).forEach(x=>{
   wPlanValid(p,x).forEach(e=>out.push({t:x.name||'Unnamed row',d:WPLAN_ERR[e]||e,plan:x.id,tpl:x.templateId,f:e==='name'||e==='duplicate'?'name':e==='display'?'displayName':e==='pricing'?'pricingSchema':null}));
   if(x.reviewStatus!=='confirmed'&&!wPlanValid(p,x).length)out.push({t:x.name,d:'Not confirmed yet',plan:x.id,tpl:x.templateId,f:'name'});
  });
 }
 return out;
}
function wProbBtn(p){
 const l=wProblems(p);if(!l.length)return '';
 const open=!!W.probOpen;
 return `<div class="probw"><button class="btn" data-act="toggleProbs" aria-expanded="${open}">${ic('alert',15)}${l.length} ${l.length===1?'issue':'issues'}</button>
  ${open?`<div id="probs" role="dialog" aria-label="Issues to resolve"><div class="pb-h"><b>To resolve before continuing</b><span>${l.length}</span></div><div class="pb-l">${l.slice(0,14).map((x,i)=>`<button class="pb-i" data-act="probGo" data-i="${i}"><b>${esc(x.t)}</b><span>${esc(x.d)}</span>${ic('right',14)}</button>`).join('')}${l.length>14?`<div class="pb-more">and ${l.length-14} more</div>`:''}</div></div>`:''}</div>`;
}

/* ---------- pre-flight checks (upload) ---------- */
function wPreflight(f){
 const it=[],ok=t=>it.push(['ok',t]),wn=t=>it.push(['warn',t]),bd=t=>it.push(['bad',t]);
 ok('PDF format');
 parseFloat(f.size)<=25?ok(`Size ${f.size}`):bd(`Size ${f.size} is over 25 MB`);
 if(f.warn)bd('Text not readable');else if(f.mode==='partial')wn('Scanned pages, accuracy may drop');else ok('Text readable');
 if(f.hashing)it.push(['wait','Checking for duplicates']);
 else if(f.match){const m=f.match;m.identical?bd(`Already ingested as ${m.p.ref}`):f.asRev?wn(`New version of ${m.p.ref}`):wn(`Similar to ${m.p.ref}`)}
 else ok('No duplicate or earlier version');
 f.partner&&f.partner!==S.co.id?bd(`Looks like a ${WPARTNERS[f.partner]||f.partner} file`):ok(`Belongs to ${S.co.short}`);
 (f.match&&f.asRev)||f.policyId?ok('Master policy set'):wn('Choose a master policy');
 return `<ul class="pf" aria-label="Pre-flight checks">${it.map(([k,t])=>`<li class="${k}">${ic(k==='ok'?'check':k==='wait'?'refresh':'alert',12,k==='ok'?3:2)}${esc(t)}</li>`).join('')}</ul>`;
}

/* ---------- hooks that run after each page render ---------- */
(function(){
 const prev=window.wAfterHook;
 window.wAfterHook=function(){
  if(prev)prev();
  if(V3X()){wSeedOwners();wTray();wOfflinePaint()}
 };
})();

/* ---------- grid: paste a range from Excel ---------- */
document.addEventListener('paste',e=>{
 if(!IDEAL()||W.view!=='proposal'||W.stage!=='plans')return;
 const el=e.target;if(!(el&&el.matches&&el.matches('.xin')))return;
 const text=(e.clipboardData||window.clipboardData).getData('text');
 if(!/[\t\n]/.test(text.replace(/\n+$/,'')))return;
 e.preventDefault();
 const grid=text.replace(/\r/g,'').replace(/\n+$/,'').split('\n').map(r=>r.split('\t'));
 const p=wcur(),td=el.closest('td'),tr=td.parentElement,tb=tr.parentElement;
 const trs=[...tb.children].filter(r=>r.tagName==='TR'&&!r.classList.contains('det'));
 const r0=trs.indexOf(tr),c0=[...tr.children].indexOf(td);let n=0;
 grid.forEach((vals,dr)=>{
  const row=trs[r0+dr];if(!row)return;
  vals.forEach((val,dc)=>{
   const cell=row.children[c0+dc],inp=cell&&cell.querySelector('.xin');if(!inp)return;
   const x=p.plans.find(q=>q.id===inp.dataset.id);if(!x)return;
   if(inp.dataset.wc==='planField'){x[inp.dataset.f]=val.trim();x.touched={...(x.touched||{}),[inp.dataset.f]:true};x.reviewStatus='pending';n++}
   else if(inp.dataset.wc==='planSel'){
    const opt=[...inp.options].find(o=>o.text.trim().toLowerCase()===val.trim().toLowerCase());
    if(opt){x.selection[inp.dataset.k]=opt.value;x.values=wPlanValues(p,p.templates.find(q=>q.id===x.templateId),x.selection);x.touched={...(x.touched||{}),[inp.dataset.k]:true};x.reviewStatus='pending';n++}
   }
  });
 });
 wTouch(p);renderPage();renderBar();
 toast(n?`Pasted ${n} ${n>1?'cells':'cell'}`:'Nothing was pasted. Check that the columns match.',n?{}:{err:1});
});

/* ---------- actions ---------- */
Object.assign(ACT,{
 toggleBell(){S.menu=S.menu==='bell'?null:'bell';renderTop()},
 notifReadAll(){W.notifs.forEach(n=>n.read=true);renderTop()},
 notifOpen(t){
  const n=W.notifs.find(x=>x.id===t.dataset.id);if(!n)return;n.read=true;S.menu=null;
  if(n.pid&&W.proposals.some(p=>p.id===n.pid))ACT.w_open({dataset:{id:n.pid}});else renderTop();
 },
 trayHide(){W.trayOff=true;wTray()},
 toggleProbs(){W.probOpen=!W.probOpen;renderBar()},
 probGo(t){
  const p=wcur(),x=wProblems(p)[+t.dataset.i];if(!x)return;W.probOpen=false;
  if(x.stage){W.stage=x.stage;render(true);return}
  if(W.stage==='templates'){
   W.ui.tpl=x.tpl;W.ui.comp=x.comp;W.ui.vid=null;W.ui.edit=null;if(W.ui.tri==='auto')W.ui.tri='attn';renderPage();renderBar();
   const f=document.querySelector('.tmain');if(f)f.scrollIntoView({block:'start',behavior:'smooth'});return;
  }
  W.ui.planTab=x.tpl;renderPage();renderBar();
  setTimeout(()=>{const c=document.querySelector(`.xin[data-id="${x.plan}"]${x.f?`[data-f="${x.f}"]`:''}`)||document.querySelector(`.xt [data-id="${x.plan}"]`);if(c){c.scrollIntoView({block:'center',inline:'center'});if(c.focus)c.focus()}},40);
 },
 w_submitAppr(){
  const p=wcur();if(!p)return;
  p.approval={status:'pending',by:'Riya Kulkarni',at:wNow()};wTouch(p);
  wAudit('Approval requested',`${p.name} · ${p.plans.filter(x=>!(x.generated&&!x.needsGeneration)).length} rows`);
  wNotify('approval',`Approval requested for ${p.name}`,p.id);
  renderBar();renderPage();toast('Sent for approval. An admin can approve and generate.');
 },
 w_cmt(t){W.ui.cmt=W.ui.cmt===t.dataset.id?null:t.dataset.id;renderPage();const b=$id('cmtbox');if(b)b.focus()},
 w_cmtPost(t){
  const p=wcur(),c=p&&p.clauses.find(x=>x.id===t.dataset.id),b=$id('cmtbox');if(!c||!b)return;
  const v=b.value.trim();if(!v){toast('Write something first.',{err:1});return}
  (c.comments=c.comments||[]).push({by:'Riya Kulkarni',at:wNow(),text:v});wTouch(p);wAudit('Comment added',`${c.ref} · ${p.name}`);renderPage();
 },
 w_gdiff(){W.ui.gdiff=!W.ui.gdiff;renderPage()},
 w_cols(){W.ui.colsOpen=!W.ui.colsOpen;renderPage()},
 w_colsAll(){W.ui.hideCols=[];renderPage()},
 w_exportPlans(t){
  const p=wcur(),tp=p.templates.find(x=>x.id===t.dataset.t);if(!tp)return;
  const comps=wSelComps(p,tp),q=s=>'"'+String(s==null?'':s).replace(/"/g,'""')+'"';
  const rows=p.plans.filter(x=>x.templateId===tp.id);
  const head=['Plan name','Display name','Pricing schema','Default','Status',...comps.map(clabel)];
  const body=rows.map(x=>[x.name,x.displayName,x.pricingSchema,x.isDefault?'Yes':'No',x.generated&&!x.needsGeneration?'Generated':x.reviewStatus,...comps.map(k=>{const v=x.values.find(q=>q.componentKey===k);return v?v.variantName:''})]);
  const csv=[head,...body].map(r=>r.map(q).join(',')).join('\n');
  const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv'}));a.download=`${wGroupOfTpl(p,tp).name.replace(/[^\w]+/g,'-')}-plans.csv`;document.body.appendChild(a);a.click();a.remove();
  toast(`${rows.length} ${rows.length>1?'rows':'row'} exported`);
 }
});
Object.assign(WCH,{
 owner(el){const p=wcur();if(!p)return;p.owner=el.value||null;wTouch(p);wAudit('Owner changed',`${p.name} · ${p.owner||'Unassigned'}`);renderPage();toast(p.owner?`Assigned to ${esc(p.owner)}`:'Unassigned')},
 colTog(el){const h=W.ui.hideCols=W.ui.hideCols||[],i=h.indexOf(el.dataset.k);if(!el.checked&&i<0)h.push(el.dataset.k);else if(el.checked&&i>-1)h.splice(i,1);renderPage()}
});
WIN.gfind=function(el){
 const pos=el.selectionStart;W.ui.gfind=el.value;renderPage();
 const n=$id('gfind');if(n){n.focus();try{n.setSelectionRange(pos,pos)}catch(e){}}
};
