/* ---------- V2 views ---------- */
function wRowCells(comp,row){
 return (ATTRS_FOR[comp]||[]).map(k=>{
  const a=ATTR[k]||{l:k,t:'text'};const v=row.values[k];const req=(REQ[comp]||[]).includes(k);const empty=isEmpty(v);let s=null;
  if(!empty){
   if(Array.isArray(v))s=v.join(', ');
   else if(a.t==='bool')s=v?'Yes':'No';
   else if(a.t==='num'){
    if(a.m||(k==='sub_limit_value'&&row.values.unit==='INR'))s=inr(v);
    else if(a.pc||(k==='sub_limit_value'&&row.values.unit==='%'))s=v+'%';
    else s=String(v);
   }else s=String(v);
  }
  return {k,l:a.l,s,miss:empty&&req,opt:empty&&!req};
 }).filter(c=>!c.opt&&!(c.k==='unit'&&row.values.sub_limit_value!=null)&&!(c.k==='sum_insured_unit'&&row.values.sum_insured!=null));
}
const wConfPill=n=>n==null?'':n>=95?`<span class="pill p-good"><b>${n}%</b> Looks good</span>`:n>=85?`<span class="pill p-warn"><b>${n}%</b> Review recommended</span>`:`<span class="pill p-bad"><b>${n}%</b> Attention required</span>`;
const wTag=g=>`<span class="tag">${GTYPE[g.type]||g.type}</span>`;

function wCounts(P){
 return {active:P.filter(p=>!['draft','packaged'].includes(p.status)).length,
  review:P.filter(p=>['group_review','templates','templates_done','plans_generated'].includes(p.status)).length,
  att:P.filter(p=>p.status==='failed'||wPending(p).length>0).length,
  pack:P.filter(p=>p.status==='packaged').length};
}
function wTrack(p){
 const st=p.status,ci=WSTAGES.indexOf(wCurStage(p));let cells='';
 for(let i=0;i<WSTAGES.length;i++){
  let c='';
  if(st==='failed')c=i===0?'f':'';else if(st==='parsing')c=i===0?'c':'';else if(st==='packaged'||st==='plans_active')c='d';else if(st==='draft')c='';else c=i<ci?'d':i===ci?'c':'';
  cells+=c==='c'?`<i class="c"><b ${st==='parsing'?`data-wbar="${p.id}"`:''} style="--w:${st==='parsing'?Math.round(p.progress):55}%"></b></i>`:`<i class="${c}"></i>`;
 }
 const lbl=st==='parsing'?`Parsing · <span data-wpct="${p.id}">${Math.round(p.progress)}</span>%`:'';
 return `<div class="trk" aria-hidden="true">${cells}</div>${lbl?`<div class="trd">${lbl}</div>`:''}`;
}
function wCta(p){
 const pend=wPending(p).length,un=wUnplaced(p).length;
 if(p.status==='parsing')return {l:'View',pri:false};
 if(p.status==='failed')return {l:'Retry',pri:true};
 if(p.status==='draft')return {l:'Start',pri:true};
 if(pend)return {l:'Review',pri:true,t:`Review ${pend} ${pend>1?'changes':'change'}`};
 return ({group_review:{l:'Review',pri:true,t:'Review groups'},templates:{l:un?'Place':'Continue',pri:true,t:un?`Place ${un} ${un>1?'terms':'term'}`:'Continue templates'},templates_done:{l:'Review',pri:true,t:'Review plans'},plans_generated:{l:'Continue',pri:true,t:'Continue plans'},plans_active:{l:'Package',pri:true,t:'Create package'},packaged:{l:'View',pri:false,t:'View package'}})[p.status];
}
function wFilter(){
 const q=W.hq.trim().toLowerCase(),t=W.tab;
 const rank=p=>p.status==='failed'||wPending(p).length?0:['group_review','templates','templates_done','plans_generated'].includes(p.status)?1:p.status==='plans_active'?2:p.status==='parsing'?3:p.status==='draft'?4:5;
 return wProps().filter(p=>{
  const ok=t==='all'||(t==='prog'&&['parsing','group_review','templates','templates_done','plans_generated'].includes(p.status))||(t==='ready'&&p.status==='plans_active')||(t==='att'&&(p.status==='failed'||wPending(p).length>0))||(t==='done'&&p.status==='packaged')||(t==='draft'&&p.status==='draft');
  return ok&&(!q||(p.name+p.ref+p.file).toLowerCase().includes(q));
 }).map((p,i)=>[p,i]).sort((a,b)=>rank(a[0])-rank(b[0])||a[1]-b[1]).map(x=>x[0]);
}
function wRows(){
 const all=wFilter(),size=W.pgSize||6,pages=Math.max(1,Math.ceil(all.length/size));
 if(W.pg>pages)W.pg=pages;if(W.pg<1)W.pg=1;
 const rows=all.slice((W.pg-1)*size,W.pg*size);
 if(!wProps().length)return `<div class="empty-t"><div class="ring">${ic('file',24)}</div><h3>No proposals yet</h3><p>Upload a proposal PDF to start ingestion for ${esc(S.co.name)}.</p><button class="btn btn-p" data-act="w_intake">${ic('plus',16)}New proposal</button></div>`;
 if(!rows.length)return `<div class="empty-t"><h3>${W.hq.trim()?`No results for \u201c${esc(W.hq.trim())}\u201d`:'Nothing here yet'}</h3><p>${W.hq.trim()||W.tab!=='all'?'Try a different search or view.':''}</p>${W.hq.trim()||W.tab!=='all'?`<button class="btn btn-sm" data-act="w_clearF">Clear filters</button>`:''}</div>`;
 return rows.map(p=>{
  const c=wCta(p),pend=wPending(p).length;
  const v4=IDEAL();
  return `<div class="tr w2 rw${v4?' v4':''}" data-act="w_open" data-id="${p.id}" tabindex="0" role="button" aria-label="${esc(p.name)}, ${WST[p.status].l}">
   ${v4?`<label class="rsel" data-act="noop"><input type="checkbox" data-wc="rowPick" data-id="${p.id}" ${(W.rsel||[]).includes(p.id)?'checked':''} aria-label="Select ${esc(p.name)}"></label>`:''}<div style="min-width:0"><div class="pn">${esc(p.name)}${p.version>1?` <span class="chip a" style="margin-left:6px">v${p.version}</span>`:''}${pend?` <span class="chip w" style="margin-left:4px">${pend} to review</span>`:''}${V3X()?wAgeChip(p):''}</div><div class="pi" title="${esc(p.file)}">${p.ref} · ${wAgo(p.updatedAt)}${V3X()?` · ${wOwnerTxt(p)}`:''}${p.masterId?'':' · master policy needed'}</div></div>
   <div>${wspill(p.status)}</div><div class="hs">${wTrack(p)}</div>
   <div class="tdt"><b>${wDay(p.updatedAt)} ${new Date(p.updatedAt).getFullYear()}</b><span>${wTime(p.updatedAt)}</span></div>
   <div class="ac">${p.status==='draft'?`<button class="icon-btn" data-act="w_discard" data-id="${p.id}" aria-label="Discard draft ${esc(p.name)}" title="Discard draft">${ic('x',18)}</button>`:''}<button class="btn btn-sm cta-s" tabindex="-1" title="${esc(c.t||c.l)}">${c.l}</button></div></div>`;
 }).join('');
}
function wPager(){
 const n=wFilter().length,size=W.pgSize||6,pages=Math.max(1,Math.ceil(n/size)),pg=Math.min(W.pg,pages);
 if(!n)return '';
 const a=(pg-1)*size+1,b=Math.min(n,pg*size);
 return `<span>Showing ${a}–${b} of ${n}</span><div class="pgbtns"><button class="btn btn-sm" data-act="w_pg" data-d="-1" ${pg<=1?'disabled':''} aria-label="Previous page">${ic('left',15)}</button><b>${pg} / ${pages}</b><button class="btn btn-sm" data-act="w_pg" data-d="1" ${pg>=pages?'disabled':''} aria-label="Next page">${ic('right',15)}</button></div>`;
}
function wFit(){
 const box=$id('wrows');if(!box||!box.closest('.fitpage'))return;
 const first=box.querySelector('.rw'),rh=(first&&first.offsetHeight)||62,h=box.clientHeight,n=Math.max(6,Math.floor(h/rh));
 if(n!==W.pgSize){W.pgSize=n;box.innerHTML=wRows();const pg=$id('wpager');if(pg)pg.innerHTML=wPager()}
}
function wHistory(full){
 const P=wProps();const cnt=t=>{const s=W.tab;W.tab=t;const n=wFilter().length;W.tab=s;return n};
 const tab=(k,l)=>`<button role="tab" aria-selected="${W.tab===k}" data-act="w_tab" data-t="${k}">${l}<span>${cnt(k)}</span></button>`;
 return `<section class="card"><div class="card-h"><div><h2>Proposals</h2></div></div>
  <div class="tbar"><div class="tabs" role="tablist">${tab('all','All')}${tab('prog','In progress')}${full?`${tab('att','Needs attention')}${tab('ready','Ready to package')}${tab('done','Packaged')}`:''}</div>
   <div class="hsearch">${ic('search',16)}<input id="whq" type="search" value="${esc(W.hq)}" placeholder="Search by name or ID" aria-label="Search proposals">${IDEAL()?'<kbd class="slash">/</kbd>':''}</div>${IDEAL()?`<button class="btn btn-xs dens" data-act="w_dens" title="Row density">${ic('list',14)}${W.dens==='comfortable'?'Comfortable':'Compact'}</button>`:''}</div>
  ${IDEAL()?`<div id="wbulk" class="xbulk bulk">${typeof wBulk==='function'?wBulk():''}</div>`:''}
  <div class="tr w2 hd${IDEAL()?' v4':''}">${IDEAL()?`<label class="rsel" data-act="noop"><input type="checkbox" data-wc="rowPickAll" aria-label="Select all"></label>`:''}<span>Proposal</span><span>Status</span><span class="hs">Progress</span><span>Updated</span><span></span></div>
  <div id="wrows" class="rowsbox">${wRows()}</div><div id="wpager" class="pager">${wPager()}</div></section>`;
}
function wActivityCard(n){
 const items=W.audit.slice(0,n);
 return `<section class="card"><div class="card-h"><div><h3>Recent activity</h3><p>Every decision keeps who, when and why.</p></div><button class="btn btn-sm btn-t" data-act="w_nav" data-v="activity">View all</button></div>
  <ul class="feed">${items.map(a=>`<li><b>${esc(a.label)}</b><span>${esc(a.detail)}</span><em>${esc(a.user)} · ${wAgo(a.at)}</em></li>`).join('')}</ul></section>`;
}
function wOverview(){
 if(IDEAL())return wQueue();
 const P=wProps(),c=wCounts(P);
 const k=(ico,tone,v,l,s)=>`<div class="card kpi"><span class="ib ${tone}">${ic(ico,22)}</span><div><div class="v">${v}</div><div class="k">${l}</div><div class="s">${s}</div></div></div>`;
 const pk=W.packages.filter(x=>x.partnerId===S.co.id);
 return `<div class="ph"><div><h1>Overview</h1><p>One PDF, one master policy, one traceable path to a published package.</p></div>
  <button class="btn btn-p btn-lg" data-act="w_intake">${ic('plus',18)}New proposal</button></div>
  <div class="kpis">${k('layers','a',c.active,'Active proposals','In ingestion right now')}${k('clock','w',c.review,'Awaiting your review','Groups, terms, templates or plans')}${k('alert','b',c.att,'Needs attention','Failed or revision changes pending')}${k('box','g',c.pack,'Packaged','In a published package')}</div>
  <div class="wgrid fitgrid"><div class="histcol">${wHistory(true)}</div><aside class="col2">${wActivityCard(4)}
   <section class="card"><div class="card-h"><div><h3>Packages</h3><p>${pk.filter(x=>x.published).length} published · ${pk.filter(x=>!x.published).length} in draft</p></div><button class="btn btn-sm" data-act="w_nav" data-v="packages">Open</button></div>
    <div class="card-b"><p class="note">Only proposals with active plans and no pending revision work can be packaged.</p></div></section></aside></div>`;
}
function wProposalsPage(){
 return `${wSubnav('proposals')}<div class="ph"><h1>Proposals</h1></div>
  <section class="card ingress ing2"><label class="drop" data-wdrop><div class="ring">${ic('upload',24)}</div><div class="dt"><b>Drop proposal PDFs here, or browse</b><span>PDF up to 25 MB. Several files start a batch, one proposal per file.</span></div><span class="btn btn-p bd-btn">${ic('upload',16)}Browse files</span><input id="wfi2" class="sr" type="file" accept="application/pdf,.pdf" multiple></label>
   <div class="ing-s"><span>Or try a sample</span>${WSAMPLES.slice(0,5).map((x,i)=>`<button class="btn btn-xs" data-act="w_pickS2" data-i="${i}">${x.label}</button>`).join('')}<button class="btn btn-xs btn-t" data-act="w_intake">More options</button></div></section>
  <div class="histcol">${wHistory(true)}</div>`;
}

/* ---------- proposal shell ---------- */
function wStepper(p){
 const reach=wReach(p),cur=wCurStage(p),st=W.stage;
 const state=s=>p.status==='failed'&&s==='document'?'err':s===st?'cur':WSTAGES.indexOf(s)<WSTAGES.indexOf(cur)||(s==='plans'&&p.status==='packaged')||(s==='document'&&wParsed(p))?'done':'todo';
 const un=wUnplaced(p).length,gs=p.groups.filter(g=>g.status==='confirmed').length;
 const sub=s=>({document:p.status==='parsing'?`${Math.round(p.progress)}% read`:p.status==='failed'?'Failed':wParsed(p)?(p.version>1?`Parsed · v${p.version}`:'Parsed'):'Waiting',
  groups:p.groups.length?(wGroupsOk(p)?`${gs} confirmed`:`${p.groups.length} found`):'Waiting',
  leftovers:wGroupsOk(p)?(un?`${un} to place`:p.loReview?'Ready to approve':'Done'):'Waiting',
  templates:wGroupsOk(p)?`${p.templates.filter(t=>wTplComplete(p,t)).length}/${p.groups.length} complete`:'Waiting',
  plans:p.plans.length?`${p.plans.filter(x=>x.generated&&!x.needsGeneration).length}/${p.plans.length} active`:'Waiting'})[s];
 const n=WSTAGES.indexOf(st);
 return `<nav class="stepper" aria-label="Progress"><ol>${WSTAGES.map((s,i)=>{const sv=state(s),can=reach.includes(s)&&s!==st&&p.status!=='parsing';
  const warn=s==='leftovers'&&un>0&&wGroupsOk(p);
  return `<li class="${sv}"><button class="st" ${can?`data-act="w_stage" data-s="${s}"`:'disabled'} ${s===st?'aria-current="step"':''} ${!reach.includes(s)?'title="Finish the previous step first"':''}><span class="n" ${warn?'style="border-color:var(--bad);color:var(--bad-ink)"':''}>${sv==='done'?ic('check',16,3):sv==='err'?ic('x',16,3):i+1}</span><span class="l"><b>${WSTAGE_L[s]}</b><span ${warn?'style="color:var(--bad-ink)"':''}>${sub(s)}</span></span></button></li>`}).join('')}</ol>
  <div class="stepper-m"><div class="t"><b>Step ${n+1} of ${WSTAGES.length} · ${WSTAGE_L[st]}</b><span style="color:var(--ink-3)">${sub(st)}</span></div><div class="s">${WSTAGES.map((s,i)=>`<i class="${i<=n?'on':''}"></i>`).join('')}</div></div></nav>`;
}
function wProposalPage(p){
 if(!W.stage||!wReach(p).includes(W.stage))W.stage=wCurStage(p);
 if(p.status==='parsing'||p.status==='failed')W.stage='document';
 const st=W.stage;
 const body={document:wDocument,groups:wGroups,leftovers:wLeftovers,templates:wTemplates,plans:wPlans}[st](p);
 const blk=wRevBlock(p);
 const prefill=st==='templates'&&p.status!=='packaged'?`<button class="btn btn-sm crumb-act" data-act="w_prefill" title="Fill every gap with demo values and confirm all templates">${ic('spark',15)}Prefill data</button>`:'';
 return `<div class="crumbs"><button class="back" data-act="w_back" aria-label="Go back">${ic('left',17)}</button><nav aria-label="Breadcrumb"><ol>
  <li><a href="#" data-act="w_nav" data-v="proposals">Proposals</a>${ic('right',14)}</li><li><span class="t">${esc(p.name)}</span>${ic('right',14)}</li><li aria-current="page">${WSTAGE_L[st]}</li></ol></nav>${prefill}</div>
  <div class="ph"><div><h1>${esc(p.name)}</h1>${V3X()?`<p class="meta3">${p.ref} · ${p.version>1?`v${p.version} · `:''}${esc(p.file)} · ${esc((p.master||'No master policy').replace(/ · Master policy$/,''))}</p>`:`<p><span class="chip">${p.ref}</span> ${p.version>1?`<span class="chip a">v${p.version}</span> `:''}<span class="chip">${ic('file',12)}${esc(p.file)}</span> <span class="chip">${ic('shield',12)}${esc(p.master||'No master policy')}</span></p>`}</div>
   <div class="r">${V3X()?wOwnerSel(p):''}${wspill(p.status)}${['draft','parsing','failed'].includes(p.status)?'':`<button class="btn" data-act="w_doc" aria-pressed="${!!W.docOpen}">${ic('file',16)}Proposal document</button><button class="btn btn-t" data-act="w_revise" ${blk?`title="Can't take a new version: ${esc(blk)}"`:''}>${ic('branch',16)}Revised PF</button>`}</div></div>
  ${wStepper(p)}${body}`;
}

/* ---------- document stage ---------- */
function wParsingView(p){
 return viewParsing({...p,pct:p.progress,master:p.master||''}).replace('data-act="toProposals"','data-act="w_nav" data-v="proposals"').replace('data-act="cancelParse"','data-act="w_cancelParse"').replace(/Parsing the proposal/,p.revisionParse?`Re-parsing v${p.version}`:'Parsing the proposal');
}
function wPaint(p){
 const q=p.progress;
 if(W.view==='overview'||W.view==='proposals'){document.querySelectorAll(`[data-wbar="${p.id}"]`).forEach(e=>e.style.setProperty('--w',Math.round(q)+'%'));document.querySelectorAll(`[data-wpct="${p.id}"]`).forEach(e=>e.textContent=Math.round(q));return}
 if(W.view==='proposal'&&W.pid===p.id&&p.status==='parsing'){
  const m=metrics({pct:q}),set=(id,v)=>{const e=$id(id);if(e)e.textContent=v};
  const b=$id('pbar');if(b)b.style.width=q+'%';set('ppc',Math.round(q)+'%');set('peta',`About ${Math.max(1,Math.ceil((100-q)/22))} s left`);
  set('m-pages',m.pages);set('m-tables',m.tables);set('m-terms',m.terms);set('m-groups',m.groups);
  const ph=$id('phs');if(ph&&ph.dataset.k!==String(phIdx(q))){ph.dataset.k=String(phIdx(q));ph.innerHTML=phHtml({pct:q})}
  document.querySelectorAll('.hl').forEach(h=>h.classList.toggle('on',q>=+h.dataset.th));
  document.querySelectorAll('.stepper li.cur .l span').forEach(e=>e.textContent=Math.round(q)+'% read');
 }
}
function wFailedView(p){
 const rep=p.replacement;
 return `<div class="wgrid"><section class="card"><div class="ptop"><div class="hero"><div class="ring b">${ic('xCircle',26)}</div><div><h2>The document could not be fully parsed</h2><p>${esc(p.file)} · attempt ${p.attempts.length} stopped at ${p.progress}%</p></div></div></div>
  <div class="found"><h3>What went wrong</h3><ul class="why"><li>${ic('alert',16)}<span id="wfail">${esc(p.failure||'The parser stopped before finishing.')}</span></li>
   <li>${ic('info',16)}<span>No groups or terms were extracted, so there is nothing to review yet.</span></li><li>${ic('save',16)}<span>Every attempt is kept in the history. You can replace the PDF and retry as often as needed.</span></li></ul>
   ${rep?`<div class="filecard" style="margin-top:14px"><div class="fi">PDF</div><div style="flex:1;min-width:0"><div class="fn">${esc(rep.name)}</div><div class="fm">Replacement file · ready to retry</div></div><button class="btn btn-sm" data-act="w_clearRep">${ic('x',14)}Remove</button></div>`:''}</div>
  <div class="cta"><button class="btn" data-act="w_raiseDoc">${ic('msgPlus',17)}Raise a request</button><div style="display:flex;gap:10px;flex-wrap:wrap">
   <label class="btn"><input class="sr" id="wrep" type="file" accept="application/pdf,.pdf">${ic('upload',16)}${rep?'Choose a different file':'Replace / sanitize PDF'}</label>
   <button class="btn" data-act="w_repSample">Use a sanitized sample</button><button class="btn btn-p" data-act="w_retry">${ic('refresh',16)}Retry parsing</button></div></div></section>
  <section class="card"><div class="card-h"><div><h3>Attempt history</h3><p>Retained across retries</p></div></div><ul class="feed">${[...p.attempts].reverse().map(a=>`<li><b>Attempt ${a.number} <span class="pill ${a.outcome==='succeeded'?'p-good':a.outcome==='running'?'p-info':'p-bad'}" style="margin-left:6px">${a.outcome}</span></b><span>${esc(a.detail)}</span><em>${wAgo(a.at)}</em></li>`).join('')}</ul></section></div>`;
}
function wVersionPanel(p){
 const all=[...p.versions,{number:p.version,file:p.file,pages:p.pages,at:p.updatedAt,note:p.version>1?'Current version':'Initial upload',cur:true}].reverse();
 return `<section class="card"><div class="card-h"><div><h3>Versions</h3><p>A revised PF keeps the same proposal, templates and plan IDs.</p></div></div>
  <ul class="feed">${all.map(v=>`<li><b>v${v.number}${v.cur?` <span class="chip g" style="margin-left:6px">Current</span>`:''}</b><span>${esc(v.file)} · ${v.pages} pages</span><em>${esc(v.note)} · ${wAgo(v.at)}</em></li>`).join('')}</ul></section>`;
}
function wRevisionPanel(p){
 const ch=p.revisionChanges;if(!ch.length)return '';const pend=wPending(p);
 return `<section class="card" id="revpanel"><div class="card-h"><div><h3>Revision changes</h3><p>${pend.length?`${pend.length} to decide. Accept the new wording or keep what you already reviewed.`:'All changes decided.'}</p></div></div>
  ${ch.map(c=>{
   const rows=wImpactRows(p,c);
   return `<div class="rcr ${c.resolution}"><div class="rch"><b>${esc(c.label)}</b><span class="chip">${esc(c.groupName)}</span>${c.resolution==='pending'?'<span class="pill p-warn">Needs a decision</span>':c.resolution==='accepted'?'<span class="pill p-good">Accepted</span>':'<span class="pill p-none">Kept current</span>'}</div>
    ${c.kind==='clause_changed'?`<div class="diff"><div><em>v${p.version-1} · current</em><p>${esc(c.previous)}</p></div><div class="nx2"><em>v${p.version} · proposed</em><p>${esc(c.next)}</p></div></div>`:`<div class="diff one"><div class="nx2"><em>New in v${p.version}</em><p>${esc(c.next)}</p></div></div>`}
    <div class="rci">${c.kind==='clause_changed'?(rows.length?`${ic('alert',14)} Affects ${rows.length} plan ${rows.length>1?'rows':'row'}: ${rows.slice(0,3).map(r=>esc(r.name)).join(', ')}${rows.length>3?` and ${rows.length-3} more`:''}. They reopen for review and regeneration.`:`${ic('check',14)} No plan row uses this variant. Nothing reopens.`):`${ic('info',14)} Adds a group. Existing plans are untouched.`}</div>
    ${c.resolution==='pending'?`<div class="rca"><button class="btn btn-sm btn-p" data-act="w_revAccept" data-id="${c.id}">Accept new wording</button><button class="btn btn-sm" data-act="w_revKeep" data-id="${c.id}">Keep current</button></div>`:''}</div>`;}).join('')}
  ${!pend.length&&(p.templates.some(t=>t.reopened)||wUnplaced(p).length)?`<div class="cta"><p>${wUnplaced(p).length?`A new group arrived with ${wUnplaced(p).length} term to place. `:''}${p.templates.some(t=>t.reopened)?`Accepted changes reopened ${p.templates.filter(t=>t.reopened).length>1?'templates':'a template'} for review. `:''}Place and confirm them, then regenerate only the affected plan rows.</p><button class="btn btn-p" data-act="w_stage" data-s="${wUnplaced(p).length?'leftovers':'templates'}">${wUnplaced(p).length?'Place the new term':'Review template changes'}${ic('arrow',16)}</button></div>`:''}</section>`;
}
function wParsedView(p){
 const un=wUnplaced(p).length,partial=p.mode==='partial';const cur=wCurStage(p);const pend=wPending(p);const rev=p.version>1;
 const label={groups:'Review groups',leftovers:`Place ${un} ${un>1?'terms':'term'}`,templates:'Continue templates',plans:'Go to plans',document:'Review groups'}[cur];
 const shortM=(p.master||'no master policy').replace(/ · Master policy$/,'');
 const summary=`<section class="card"><div class="ptop"><div class="hero"><div class="ring ${partial?'w':'g'}">${ic(partial?'alert':'check',26,2.5)}</div><div><h2>${rev?`Revision v${p.version} parsed`:partial?'Extraction finished with warnings':'Extraction finished'}</h2><p class="hl2"><span>${esc(p.file)}</span><span>v${p.version} · checked against ${esc(shortM)}</span></p></div></div>
   <div class="stat4"><div><b>${p.pages}</b><span>Pages processed</span></div><div><b>${p.groups.length}</b><span>Groups identified</span></div><div><b>${p.clauses.length}</b><span>Terms extracted</span></div><div><b>${un}</b><span>Unplaced terms</span></div></div></div>
   ${partial?`<div class="alert a-warn" style="margin:12px 28px 0">${ic('alert',18)}<div><b>Pages 7 and 12 were hard to read.</b> Some terms may be missing. Review the extracted terms carefully, or upload a clearer copy as a revision.</div></div>`:''}
   <div class="found"><h3>Groups identified</h3>${p.groups.map(g=>`<div class="fr">${wTag(g)}<span class="nm">${esc(g.name)}</span><span class="pg">${esc(g.evidence)}</span>${wConfPill(g.conf)}</div>`).join('')}</div>
   <div class="cta"><p>${pend.length?`Decide the ${pend.length} revision ${pend.length>1?'changes':'change'} above first. Nothing else changes until you do.`:'Extraction finished successfully. Confirm the identified groups before creating templates.'}</p><button class="btn btn-p btn-lg" data-act="w_stage" data-s="${cur==='document'?'groups':cur}" ${pend.length?'disabled':''}>${pend.length?'Decide the changes first':label}${ic('arrow',18)}</button></div></section>`;
 return `${pend.length?`<div class="alert a-warn" id="revbanner">${ic('history',18)}<div><b>v${p.version} changed ${pend.length} ${pend.length>1?'things':'thing'} you had already reviewed.</b> Accept the new wording or keep what you have, one by one. Plan rows that use a changed variant reopen for review and regeneration. Everything else stays as it is.</div></div>`:''}
  <div class="wgrid"><div class="col2">${pend.length?wRevisionPanel(p)+summary:summary+wRevisionPanel(p)}</div><aside class="col2">${wVersionPanel(p)}<section class="card"><div class="card-h"><div><h3>Master policy</h3></div></div><div class="card-b"><div class="chip">${ic('shield',13)}${esc(p.master||'Not linked')}</div><p class="note" style="margin-top:8px">Each proposal is processed against exactly one partner-owned master policy.</p></div></section></aside></div>`;
}
function wDocument(p){return p.status==='parsing'?wParsingView(p):p.status==='failed'?wFailedView(p):wParsedView(p)}
