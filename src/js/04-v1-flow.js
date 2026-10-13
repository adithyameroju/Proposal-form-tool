/* ================= flow shell ================= */
function stepperHtml(p){
 const st=p.step;
 const failed=p.status==='failed';
 const state=i=>failed&&i===0?'err':(st>=4||i<st)?'done':i===st?'cur':'todo';
 const sub=i=>{
  if(i===0)return p.status==='parsing'?`${Math.round(p.pct)}% read`:failed?'Failed':p.meta&&p.meta.warn.length?'Parsed · warnings':'Parsed';
  if(i===1)return p.g?`${p.g.length} found`:'Waiting';
  if(i===2){if(!p.vars||p.max<2)return 'Waiting';const t=p.vars.length,r=p.vars.filter(vres).length;return `${r} of ${t} resolved`}
  return 'Check & submit';
 };
 const can=i=>p.status!=='parsing'&&p.status!=='failed'&&i<=p.max&&i!==st&&st<4;
 return `<nav class="stepper" aria-label="Progress"><ol>${STEPS.map((s,i)=>`<li class="${state(i)}"><button class="st" ${can(i)?`data-act="stageGo" data-i="${i}"`:'disabled'} ${i===st?'aria-current="step"':''}><span class="n">${state(i)==='done'?ic('check',16,3):state(i)==='err'?ic('x',16,3):i+1}</span><span class="l"><b>${s.t}</b><span>${sub(i)}</span></span></button></li>`).join('')}</ol>
  <div class="stepper-m"><div class="t"><b>${st>=4?'Submitted':`Step ${st+1} of 4 · ${STEPS[st].t}`}</b><span style="color:var(--ink-3)">${st>=4?'':sub(st)}</span></div><div class="s">${STEPS.map((_,i)=>`<i class="${st>=4||i<=st?'on':''}"></i>`).join('')}</div></div></nav>`;
}
function flowPage(p){
 let body;
 if(p.status==='parsing')body=viewParsing(p);
 else if(p.status==='failed')body=viewFailed(p);
 else body=[viewParsed,viewGroups,viewVars,viewReview,viewDone][p.step](p);
 const showSave=p.status!=='completed'&&p.status!=='parsing';
 return `
  <div class="ph"><div><h1>${p.step>=4?'Proposal submitted':'Parse a proposal'}</h1><p>${esc(p.file||p.name)} · ${esc(p.master||'No master policy')}</p></div>
   <div class="r">${p.savedAt&&showSave?`<span class="saved"><i></i>Saved at ${p.savedAt}</span>`:''}${showSave?`<button class="btn" data-act="saveExit">${ic('save',16)}Save &amp; exit</button>`:''}</div></div>
  ${stepperHtml(p)}${body}`;
}

/* ================= parsing (kept) ================= */
const PH=['Reading the document','Extracting tables and member rules','Detecting member groups','Matching groups to the master policy'];
const phIdx=q=>q>=85?3:q>=58?2:q>=25?1:0;
function metrics(p){const q=p.pct;return {pages:Math.min(14,Math.round(14*q/100*1.2)),tables:Math.min(6,Math.floor(q/15)),terms:Math.min(38,Math.round(38*q/100)),groups:q>=88?2:q>=62?1:0}}
function phHtml(p){const k=phIdx(p.pct);return PH.map((t,i)=>`<li class="${i<k?'ok':i===k?'on':''}"><span class="pd">${i<k?ic('check',12,3.5):''}</span>${t}</li>`).join('')}
function viewParsing(p){
 const m=metrics(p);
 return `<div class="pgrid">
  <section class="card"><div class="card-h"><div><h3>Document</h3><p>${esc(p.file)}</p></div></div>
   <div class="sheetwrap"><div class="sheet" aria-hidden="true">
    <div class="scan"></div><div class="ln h"></div><div class="ln" style="width:82%"></div><div class="ln" style="width:70%"></div>
    <div class="hl" data-th="20"><em>Policy terms</em><div class="ln" style="width:92%"></div><div class="ln" style="width:76%"></div></div>
    <div class="hl" data-th="45"><em>Member table</em><div class="tbl"><i class="hd"></i><i class="hd"></i><i class="hd"></i><i></i><i></i><i></i><i></i><i></i><i></i></div></div>
    <div class="ln" style="width:88%"></div>
    <div class="hl" data-th="70"><em>Group found</em><div class="ln" style="width:64%"></div><div class="ln" style="width:84%"></div></div>
    <div class="hl" data-th="88"><em>Group found</em><div class="tbl"><i class="hd"></i><i class="hd"></i><i class="hd"></i><i></i><i></i><i></i></div></div>
   </div></div></section>
  <section class="card"><div class="pstat">
   <div style="padding-top:20px"><h2>Parsing the proposal</h2><p>Reading against ${esc(p.master)}. You can leave this page; parsing continues.</p></div>
   <div class="bar" role="progressbar" aria-valuemin="0" aria-valuemax="100"><i id="pbar" style="width:${p.pct}%"></i></div>
   <div class="bar-l"><span id="ppc">${Math.round(p.pct)}%</span><span id="peta">About ${Math.max(1,Math.ceil((100-p.pct)/22))} s left</span></div>
   <div class="mx"><div><b id="m-pages">${m.pages}</b><span>Pages read of 14</span></div><div><b id="m-tables">${m.tables}</b><span>Tables found</span></div><div><b id="m-terms">${m.terms}</b><span>Terms extracted</span></div><div><b id="m-groups">${m.groups}</b><span>Groups detected</span></div></div>
   <ul class="phs" id="phs">${phHtml(p)}</ul>
   <div class="pfoot"><button class="btn" data-act="toOverview">Continue in background</button><button class="btn btn-t" data-act="cancelParse">Cancel parsing</button></div>
  </div></section></div>`;
}
function paintParse(p){
 if(S.view==='overview'){document.querySelectorAll(`[data-pbar="${p.id}"]`).forEach(e=>e.style.setProperty('--w',Math.round(p.pct)+'%'));document.querySelectorAll(`[data-ppct="${p.id}"]`).forEach(e=>e.textContent=Math.round(p.pct));return}
 if(S.view==='proposal'&&S.pid===p.id&&p.status==='parsing'){
  const m=metrics(p),set=(id,v)=>{const e=$id(id);if(e)e.textContent=v};
  const b=$id('pbar');if(b)b.style.width=p.pct+'%';
  set('ppc',Math.round(p.pct)+'%');set('peta',`About ${Math.max(1,Math.ceil((100-p.pct)/22))} s left`);
  set('m-pages',m.pages);set('m-tables',m.tables);set('m-terms',m.terms);set('m-groups',m.groups);
  const ph=$id('phs');if(ph&&ph.dataset.k!==String(phIdx(p.pct))){ph.dataset.k=String(phIdx(p.pct));ph.innerHTML=phHtml(p)}
  document.querySelectorAll('.hl').forEach(h=>h.classList.toggle('on',p.pct>=+h.dataset.th));
  document.querySelectorAll('.stepper li.cur .l span').forEach(e=>e.textContent=Math.round(p.pct)+'% read');
 }
}
function ensureTimer(){if(!ptimer)ptimer=setInterval(tick,100)}
function tick(){
 const run=S.props.filter(p=>p.status==='parsing');
 if(!run.length){clearInterval(ptimer);ptimer=null;return}
 run.forEach(p=>{
  p.pct=Math.min(100,p.pct+1.1+Math.random()*2.2);
  if(p.mode==='fail'&&p.pct>=55)failParse(p);
  else if(p.pct>=100)finishParse(p);
  else paintParse(p);
 });
}
function finishParse(p){
 p.pct=100;p.status='saved';p.step=0;p.max=0;p.g=null;p.meta=null;
 const secs=(Date.now()-p.t0)/1000;hydrate(p);p.meta.secs=secs;mark(p);
 const here=S.view==='proposal'&&S.pid===p.id;
 if(here)render(true);else{render();toast(`Parsing finished for ${esc(p.name)}`,{open:p.id})}
}
function failParse(p){
 p.status='failed';p.pct=55;p.fail=true;mark(p);
 const here=S.view==='proposal'&&S.pid===p.id;
 if(here)render(true);else{render();toast(`Parsing failed for ${esc(p.name)}`,{err:1})}
}

/* ================= document status / failed ================= */
function viewFailed(p){
 return `<section class="card narrow">
  <div class="ptop"><div class="hero"><div class="ring b">${ic('xCircle',26)}</div><div><h2>We couldn\u2019t finish parsing</h2><p>${esc(p.file)} · stopped while reading</p></div></div></div>
  <div class="found"><h3>What went wrong</h3><ul class="why">
   <li>${ic('alert',16)}<span>Pages 3 to 14 could not be read. The file looks corrupted or is password protected.</span></li>
   <li>${ic('info',16)}<span>No groups or variables were extracted, so nothing needs your review yet.</span></li>
   <li>${ic('save',16)}<span>Your upload is saved. You can come back to it from the proposal history.</span></li></ul></div>
  <div class="cta"><button class="btn" data-act="raiseDoc">${ic('msgPlus',17)}Raise a request</button>
   <div style="display:flex;gap:10px;flex-wrap:wrap"><button class="btn" data-act="retryParse">${ic('refresh',17)}Retry parsing</button><button class="btn btn-p" data-act="uploadAnother">${ic('upload',17)}Upload another file</button></div></div>
 </section>`;
}
function viewParsed(p){
 const g=p.g,m=p.meta,partial=m.warn.length,lf=p.left.length,att=g.filter(needsAtt).length;
 return `<section class="card narrow">
  <div class="ptop">
  <div class="hero"><div class="ring ${partial?'w':'g'}">${ic(partial?'alert':'check',26,2.5)}</div><div><h2>${partial?'Parsing finished with warnings':'Parsing complete'}</h2>
   <p>${esc(p.file)} was read in ${m.secs.toFixed(1)} s and checked against ${esc(p.masterObj.id)}.</p></div></div>
  <div class="stat4"><div><b>${m.read}<small style="font-size:14px;color:var(--ink-3);font-weight:500"> / ${m.pages}</small></b><span>Pages read</span></div><div><b>${p.vars.length}</b><span>Variables found</span></div><div><b>${g.length}</b><span>Groups found</span></div><div><b>${lf}</b><span>Left over to place</span></div></div>
  </div>
  ${partial?`<div class="alert a-warn" role="alert" style="margin:16px 28px 0">${ic('alert',18)}<div><b>${partial} pages were hard to read (pages ${m.warn.join(' and ')}).</b> Some groups or variables may be missing. You can carry on and add them by hand, or upload a clearer copy.</div><div class="ax"><button class="btn btn-sm" data-act="uploadAnother">Upload a clearer copy</button></div></div>`:''}
  ${att?`<div class="alert a-warn" style="margin:16px 28px 0">${ic('alert',18)}<div><b>${att} group${att>1?'s need':' needs'} attention.</b> The parser was less sure about ${att>1?'them':'it'}. You can check the source evidence in the next step.</div></div>`:''}
  <div class="found"><h3>Groups found</h3>${g.map(x=>`<div class="fr">${tag(x,1)}<span class="nm">${esc(x.name)}</span><span class="pg">${pgs(x.pages)}</span>${pill(x)}</div>`).join('')}</div>
  <div class="nextline"><b>Next</b><span class="s">Review groups${ic('right',14)}</span><span class="s">Map variables${ic('right',14)}</span><span class="s">Check &amp; submit</span></div>
  <div class="cta"><p>Nothing is final until you confirm each step. Your progress is saved as you go.</p>
   <button class="btn btn-p btn-lg" data-act="reviewGroups">Review groups${ic('arrow',18)}</button></div>
 </section>`;
}

/* ================= groups ================= */
function groupRow(p,x){
 const g=p.g;const rail=x.manual||x.conf==null?'rm':x.conf>=95?'rg':x.conf>=85?'rw2':'rb';
 return `<div class="grow ${rail}">
  <div style="min-width:0">
   <div class="l1">${tag(x)}<span class="gname">${esc(x.name)}</span>${pill(x)}</div>
   <div class="l2">Source evidence · ${x.pages.length?`<span>p. ${x.pages.map(n=>`<button class="pg" data-act="evidence" data-id="${x.id}" data-p="${n}">${n}</button>`).join(', ')}</span>`:'<span>added manually</span>'}
    ${x.seen||x.edited?`<span class="rvd">${ic('check',13,3)}Reviewed</span>`:''}${x.edited?'<em class="edd">Edited</em>':''}${x.extras.length?`<em class="edd">+${x.extras.length} assigned term${x.extras.length>1?'s':''}</em>`:''}</div>
  </div>
  <dl class="gdet"><div><dt>Sum insured</dt><dd>${inr(x.si)}</dd></div><div><dt>Age</dt><dd>${x.ageMin}–${x.ageMax}</dd></div><div><dt>Maternity</dt><dd>${x.mat?'Covered':'Not covered'}</dd></div><div><dt>Members</dt><dd>${x.members?esc(x.members):'—'}</dd></div></dl>
  <div class="gacts"><button class="btn" data-act="editG" data-id="${x.id}">${ic('squarePen',17)}Edit</button>
   <div class="kb"><button class="kbb" data-act="toggleGm" data-id="${x.id}" aria-haspopup="true" aria-expanded="${S.gm===x.id}" aria-label="More actions for ${esc(x.name)}">${ic('more',18)}</button>
    ${S.gm===x.id?`<div class="kpop" role="menu"><button role="menuitem" data-act="mergeG" data-id="${x.id}" ${g.length<2?'disabled':''}>${ic('combine',17)}Merge with…</button><button role="menuitem" data-act="splitG" data-id="${x.id}" ${x.segs.length<2?'disabled':''}>${ic('split',17)}Split into sub-groups</button><hr><button class="dg" role="menuitem" data-act="removeG" data-id="${x.id}">${ic('xCircle',17)}Remove group</button></div>`:''}</div></div>
 </div>`;
}
function leftRow(p,l){
 if(l.res){
  const r=l.res;const g=r.gid&&p.g.find(x=>x.id===r.gid);
  const txt=r.type==='assigned'?`Assigned to ${esc(g?g.name:'a group')}`:r.type==='created'?`Created the group ${esc(g?g.name:l.gname)}`:r.type==='request'?`Request ${r.req} raised`:'Ignored. It won\u2019t be part of any group';
  return `<div class="lrow res"><div><div class="t1"><b>${esc(l.title)}</b><span class="chip">${l.kind}</span></div><div class="lres">${ic('cc',16)}${txt}<button class="link" style="font-weight:500" data-act="undoL" data-id="${l.id}">Undo</button></div></div><div></div></div>`;
 }
 const sg=l.sug&&p.g.find(x=>x.rel===l.sug.rel);
 return `<div class="lrow"><div>
   <div class="t1"><b>${esc(l.title)}</b><span class="chip">${l.kind}</span>${l.faint?`<span class="chip w">${ic('alert',13)}Hard to read</span>`:''}</div>
   <div class="q">${esc(l.text)}</div>
   <div class="m"><span>Source evidence · p. ${l.pages.join(', ')}</span><span>·</span>${sg?`<span class="sug">${ic('spark',14)}Closest group: ${esc(sg.name)} (${l.sug.score}%)</span>`:'<span>No close group found</span>'}</div></div>
  <div class="lacts"><button class="btn btn-sm" data-act="assignL" data-id="${l.id}">${ic('swap',15)}Assign to group</button><button class="btn btn-sm" data-act="createL" data-id="${l.id}">${ic('userPlus',15)}Create group</button>
   <div class="kb"><button class="kbb" style="width:34px;height:34px" data-act="toggleLm" data-id="${l.id}" aria-haspopup="true" aria-expanded="${S.lm===l.id}" aria-label="More actions for ${esc(l.title)}">${ic('more',16)}</button>
   ${S.lm===l.id?`<div class="kpop" role="menu"><button role="menuitem" data-act="requestL" data-id="${l.id}">${ic('msgPlus',17)}Raise a request</button><button role="menuitem" data-act="ignoreL" data-id="${l.id}">${ic('x',17)}Ignore this term</button></div>`:''}</div></div></div>`;
}
function viewGroups(p){
 const g=p.g,bases=g.filter(x=>x.type==='BASE').length,hasBase=bases>0;
 const flagged=g.filter(needsAtt).length,open=p.left.filter(l=>!l.res).length,done=p.left.length-open;
 const dot=(c)=>`<i style="background:${c}"></i>`;
 return `
  <div class="introrow"><div class="intro"><div class="st2">Step 2 of 4 · Groups</div><h2>Is this how the proposal splits its members?</h2>
   <p>The parser found <b>${g.length} group${g.length!==1?'s':''}</b> in ${esc(p.file)}. Each becomes one template, so get the structure right first: edit, merge, split, remove or add groups, place any left-over terms, then confirm once.</p></div>
  <div class="sumstrip"><span class="chip">${dot('var(--accent)')}${g.length} group${g.length!==1?'s':''}</span><span class="chip">${dot(hasBase?'var(--good)':'var(--bad)')}${bases} base</span><span class="chip">${dot(flagged?'var(--warn)':'var(--good)')}${flagged} flagged</span><span class="chip">${dot(open?'var(--bad)':'var(--good)')}${open} left over</span></div></div>
  ${!hasBase?`<div class="alert a-bad" role="alert">${ic('alert',18)}<div><b>No base group.</b> Set one group as Base. It defines the primary insured member.</div></div>`:''}
  <div class="col2">
   <section class="card">
    <div class="gc-h"><div><div class="eyebrow">${esc(p.file)}</div><h2>Groups detected in the proposal</h2></div><button class="btn" data-act="addGroup">${ic('userPlus',17)}Add group</button></div>
    ${g.length?g.map(x=>groupRow(p,x)).join(''):`<div class="empty"><div class="ring">${ic('users',22)}</div><h3>No groups found</h3><p>The parser didn\u2019t detect any groups. Add one by hand, or upload a clearer copy of the proposal.</p><div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap"><button class="btn btn-p" data-act="addGroup">${ic('userPlus',17)}Add group</button><button class="btn" data-act="uploadAnother">${ic('upload',17)}Upload another file</button></div></div>`}
   </section>
   <section class="card">
    <div class="lhead"><span class="ib ${open?'w':'g'}" style="${open?'background:var(--warn-bg);color:var(--warn-ink)':'background:var(--good-bg);color:var(--good-ink)'}">${ic(open?'unlink':'cc',20)}</span>
     <div style="flex:1"><h3>${p.left.length?`Left over from the document`:'Nothing left over'}${p.left.length?` <span class="chip ${open?'w':'g'}" style="vertical-align:middle;margin-left:6px">${open?`${open} to place`:'All placed'}</span>`:''}</h3>
      <p>${p.left.length?'The parser found these terms but couldn\u2019t attach them to any group. Place each one before you confirm.':'Every term the parser found was attached to a group.'}</p></div></div>
    ${p.left.map(l=>leftRow(p,l)).join('')}
    ${p.left.length&&!open?`<div class="lrow res" style="color:var(--ink-3);font-size:13.5px">${done} of ${p.left.length} resolved.</div>`:''}
   </section>
  </div>
  </div>`;
}
function barGroups(p){
 const g=p.g,ok=g.some(x=>x.type==='BASE'),open=p.left.filter(l=>!l.res).length,blocked=!ok||open>0;
 const msg=!ok?['bad','No base group yet','Set one group as Base before you can confirm.']:open?['warn',`${open} left-over item${open>1?'s':''} to place`,'Place each left-over term, or ignore it, to continue.']:[ '',`${g.length} group${g.length!==1?'s':''} · structure not confirmed yet`,'Confirming opens variable mapping. You can come back and change a group until you submit.'];
 return `<div class="bar-in"><button class="btn" data-act="back">${ic('left',17)}Document</button>
  <div class="m ${msg[0]}"><b>${msg[1]}</b><span>${msg[2]}</span></div>
  <button class="btn btn-p btn-lg" data-act="confirmGroups" ${blocked?'disabled':''}>Confirm ${g.length} group${g.length!==1?'s':''} &amp; continue${ic('arrow',18)}</button></div>`;
}

/* ================= variables ================= */
function vstat(p){
 const v=p.vars;return {t:v.length,r:v.filter(vres).length,pend:v.filter(x=>x.state==='pending').length,un:v.filter(x=>x.state==='unmapped').length,
  bulk:v.filter(x=>x.state==='pending'&&!x.conflict&&x.conf>=90).length};
}
function vstatePill(v){
 if(v.state==='confirmed')return `<span class="pill p-good">${ic('check',12,3)} Confirmed</span>`;
 if(v.state==='edited')return `<span class="pill p-info">${v.how==='map'?'Mapped by you':'Edited by you'}</span>`;
 if(v.state==='manual')return `<span class="pill p-info">Added manually</span>`;
 if(v.state==='requested')return `<span class="pill p-info">${ic('msgPlus',12)} Request ${v.rq} raised</span>`;
 if(v.state==='ignored')return `<span class="pill p-none">Left out</span>`;
 return '';
}
function varRow(p,v){
 const cat=v.key&&CATD[v.key];const un=v.state==='unmapped';
 const rail=un?'rb':v.state==='requested'?'rm':vres(v)?'rg':v.conflict?'rw2':v.conf>=90?'rn':'rw2';
 const dst=cat?`<div class="vn">${esc(cat.l)}</div><div class="vk">${v.key}</div>`
  :v.state==='ignored'?`<div class="vn" style="color:var(--ink-3)">Not mapped</div><div class="vk">Left out of this proposal</div>`
  :`<div class="nomap"><b>${v.miss?'Value not found':'No matching variable'}</b><small>${v.miss?esc(v.note):v.sug?`Closest match: ${esc(CATD[v.sug.key].l)} (${v.sug.score}%)`:'Nothing in the master policy looks like this term.'}</small></div>`;
 const pil=cat&&v.state==='pending'?(v.conf>=95?`<span class="pill p-good"><b>${v.conf}%</b> Looks good</span>`:v.conf>=85?`<span class="pill p-warn"><b>${v.conf}%</b> Review recommended</span>`:`<span class="pill p-bad"><b>${v.conf}%</b> Attention required</span>`):vstatePill(v);
 let acts='';
 if(v.state==='pending')acts=`<button class="btn btn-ok btn-sm" data-act="confirmVar" data-id="${v.id}" ${v.conflict?'disabled title="Resolve the conflict first"':''}>${ic('cc',16)}Confirm</button><button class="btn btn-sm" data-act="editVar" data-id="${v.id}">${ic('squarePen',15)}Edit</button>`;
 else if(un)acts=`<button class="btn btn-sm" data-act="mapVar" data-id="${v.id}">${ic('swap',15)}Map to variable</button><button class="btn btn-sm" data-act="manualVar" data-id="${v.id}">${ic('keyboard',15)}Add manually</button><button class="btn btn-sm" data-act="requestV" data-id="${v.id}">${ic('msgPlus',15)}Raise request</button>`;
 else if(v.state==='ignored')acts=`<button class="btn btn-sm" data-act="undoVar" data-id="${v.id}">Undo</button>`;
 else acts=`<button class="btn btn-sm btn-t" data-act="editVar" data-id="${v.id}">${ic('squarePen',15)}Edit</button>`;
 const conf=v.conflict&&v.state==='pending'?`<div class="vconf">${ic('alert',18)}<div class="sp"><b>Differs from ${esc(p.masterObj.id)}.</b> The proposal says ${esc(v.val)}; the master policy has ${esc(v.conflict.mv)}.</div><div class="vb"><button class="btn btn-sm" data-act="useProposal" data-id="${v.id}">Use proposal value</button><button class="btn btn-sm" data-act="keepMaster" data-id="${v.id}">Keep master value</button></div></div>`:'';
 return `<div class="vrow ${rail}">
  <div style="min-width:0"><div class="vl">${esc(v.label)}</div><div class="vv"><span class="val ${v.miss&&!v.val?'miss':''}">${v.val?esc(v.val):'Not found'}</span><button class="pg" data-act="varEv" data-id="${v.id}">p. ${v.page}</button>${isReq(v)?'<span class="chip b">Required</span>':''}</div></div>
  <div class="varr">${ic('arrow',18)}</div>
  <div class="vdst">${dst}${pil?`<div class="row">${pil}${v.note&&vres(v)?`<span class="note">${esc(v.note)}</span>`:''}</div>`:''}${un&&!isReq(v)?`<div class="vmore"><button data-act="ignoreVar" data-id="${v.id}">Leave this term out</button></div>`:''}</div>
  <div class="vact">${acts}</div>${conf}</div>`;
}
function varSections(p){
 const q=S.vq.trim().toLowerCase(),t=S.vtab;
 const list=p.vars.filter(v=>{
  const ok=t==='all'||(t==='pend'&&v.state==='pending')||(t==='un'&&v.state==='unmapped')||(t==='res'&&vres(v));
  return ok&&(!q||(v.label+(v.val||'')+(v.key||'')).toLowerCase().includes(q));
 });
 if(!list.length)return `<section class="card"><div class="empty-t">No variables match this view.</div></section>`;
 return SECS.map(s=>{const rows=list.filter(v=>v.sec===s);if(!rows.length)return '';
  const done=rows.filter(vres).length;
  return `<section class="card vsec"><div class="card-h"><div><h3>${s}</h3><p>${done} of ${rows.length} resolved</p></div></div>${rows.map(v=>varRow(p,v)).join('')}</section>`}).join('');
}
function viewVars(p){
 const s=vstat(p),pct=Math.round(s.r/s.t*100);
 const tab=(k,l,n)=>`<button role="tab" aria-selected="${S.vtab===k}" data-act="vtab" data-t="${k}">${l}<em>${n}</em></button>`;
 return `
  <div class="intro"><div class="st2">Step 3 of 4 · Variables</div><h2>Do these terms match your system variables?</h2>
   <p>We matched each term in the proposal to a variable on the master policy. Confirm the ones that look right and edit the ones that don\u2019t. For anything we couldn\u2019t map, map it to another variable, add it by hand or raise a request.</p></div>
  <section class="card vtool">
   <div class="vprog"><b>${s.r} of ${s.t} resolved</b><div class="bar" role="progressbar" aria-valuemin="0" aria-valuemax="${s.t}" aria-valuenow="${s.r}"><i style="width:${pct}%"></i></div><span class="note">${s.un?`${s.un} unmapped`:'All mapped'}</span></div>
   <div class="vctl"><div class="seg" role="tablist">${tab('all','All',s.t)}${tab('pend','To confirm',s.pend)}${tab('un','Unmapped',s.un)}${tab('res','Resolved',s.r)}</div>
    <div class="r"><div class="hsearch" style="margin:0">${ic('search',16)}<input id="vq" type="search" value="${esc(S.vq)}" placeholder="Search terms" aria-label="Search terms"></div>
     <button class="btn" data-act="confirmAll" ${s.bulk?'':'disabled'}>${ic('cc',16)}Confirm ${s.bulk} high-confidence</button></div></div>
  </section>
  <div id="vsecs">${varSections(p)}</div>`;
}
function barVars(p){
 const s=vstat(p),left=s.t-s.r,blocked=left>0;
 const un=s.un;
 return `<div class="bar-in"><button class="btn" data-act="back">${ic('left',17)}Groups</button>
  <div class="m ${blocked?'warn':''}"><b>${blocked?`${left} variable${left>1?'s':''} still need a decision`:'All variables resolved'}</b><span>${blocked?(un?`${un} unmapped. Map it, add it by hand, raise a request or leave it out.`:'Confirm or edit each term to continue.'):'Continue to review everything before you submit.'}</span></div>
  <button class="btn btn-p btn-lg" data-act="toReview" ${blocked?'disabled':''}>Continue to review${ic('arrow',18)}</button></div>`;
}

/* ================= review & done ================= */
function summary(p){
 const v=p.vars,c=st=>v.filter(x=>x.state===st).length;
 const l=p.left;return {vc:c('confirmed'),ve:c('edited'),vm:c('manual'),vr:c('requested'),vi:c('ignored'),
  la:l.filter(x=>x.res&&x.res.type==='assigned').length,lc:l.filter(x=>x.res&&x.res.type==='created').length,li:l.filter(x=>x.res&&x.res.type==='ignored').length,lr:l.filter(x=>x.res&&x.res.type==='request').length};
}
function viewReview(p){
 const s=summary(p),open=p.reqs.length;
 return `
  <div class="intro"><div class="st2">Step 4 of 4 · Review</div><h2>Check everything before you submit</h2>
   <p>This is what will be saved to ${esc(p.masterObj.id)}. You can go back and change any step.</p></div>
  ${open?`<div class="alert a-warn">${ic('msgPlus',18)}<div><b>${open} request${open>1?'s are':' is'} still open.</b> You can submit now. The ${open>1?'items':'item'} will be added once the request${open>1?'s are':' is'} picked up (${p.reqs.map(r=>r.id).join(', ')}).</div></div>`:''}
  <div class="rgrid">
   <section class="card rc"><div class="hd"><h3>Groups</h3><button class="btn btn-sm btn-t" data-act="stageGo" data-i="1">Edit</button></div><div class="big">${p.g.length}</div><div class="sub">confirmed</div>
    <ul>${p.g.map(g=>`<li><span>${esc(g.name)}</span><b>${g.type==='BASE'?'Base':'Member'}</b></li>`).join('')}</ul></section>
   <section class="card rc"><div class="hd"><h3>Variables</h3><button class="btn btn-sm btn-t" data-act="stageGo" data-i="2">Edit</button></div><div class="big">${p.vars.length}</div><div class="sub">terms handled</div>
    <ul><li><span>Confirmed</span><b>${s.vc}</b></li><li><span>Edited or mapped by you</span><b>${s.ve}</b></li><li><span>Added manually</span><b>${s.vm}</b></li><li><span>Request raised</span><b>${s.vr}</b></li><li><span>Left out</span><b>${s.vi}</b></li></ul></section>
   <section class="card rc"><div class="hd"><h3>Left over</h3><button class="btn btn-sm btn-t" data-act="stageGo" data-i="1">Edit</button></div><div class="big">${p.left.length}</div><div class="sub">terms placed</div>
    <ul><li><span>Assigned to a group</span><b>${s.la}</b></li><li><span>Created a group</span><b>${s.lc}</b></li><li><span>Request raised</span><b>${s.lr}</b></li><li><span>Ignored</span><b>${s.li}</b></li></ul></section>
  </div>`;
}
function barReview(p){
 return `<div class="bar-in"><button class="btn" data-act="back">${ic('left',17)}Variables</button>
  <div class="m"><b>Ready to submit</b><span>Submitting saves this proposal to your history as completed.</span></div>
  <button class="btn btn-p btn-lg" data-act="submit">${ic('check',18,2.5)}Submit proposal</button></div>`;
}
function viewDone(p){
 const s=summary(p);
 return `<section class="card narrow"><div class="ptop"><div class="hero"><div class="ring g">${ic('check',26,2.5)}</div><div><h2>Proposal submitted</h2><p>${esc(p.name)} is saved to ${esc(p.masterObj.id)} and added to your history as completed.</p></div></div>
  <div class="stat4"><div><b>${p.g.length}</b><span>Groups confirmed</span></div><div><b>${p.vars.length}</b><span>Variables handled</span></div><div><b>${p.left.length}</b><span>Left-over terms placed</span></div><div><b>${p.reqs.length}</b><span>Open requests</span></div></div></div>
  <div class="found"><h3>Groups</h3>${p.g.map(x=>`<div class="fr">${tag(x,1)}<span class="nm">${esc(x.name)}</span><span class="pg">${inr(x.si)} · Age ${x.ageMin}–${x.ageMax}</span></div>`).join('')}</div>
  <div class="cta"><button class="btn" data-act="toOverview">Back to proposals</button><button class="btn btn-p btn-lg" data-act="newProposal">${ic('plus',18)}New proposal</button></div></section>`;
}
