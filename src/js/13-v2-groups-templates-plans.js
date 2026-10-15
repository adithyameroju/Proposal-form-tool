/* ---------- groups stage ---------- */
const wGroupLocked=(p,g)=>{const t=wTplOf(p,g.id);return p.status==='packaged'||(!!t&&p.plans.some(x=>x.templateId===t.id&&x.generated&&!x.needsGeneration&&!t.reopened))};
function wGroupRow(p,g){
 const t=wTplOf(p,g.id),n=wClausesOf(p,g.id).filter(c=>!c.na).length,locked=wGroupLocked(p,g),st=t?wTplStats(p,t):{resolved:0,total:0};
 const rail=g.conf>=95?'rg':g.conf>=85?'rw2':'rb';
 return `<div class="grow ${rail}"><div style="min-width:0"><div class="l1">${wTag(g)}<span class="gname">${esc(g.name)}</span>${wConfPill(g.conf)}${g.status==='confirmed'?'<span class="pill p-good">Confirmed</span>':''}</div>
  <div class="l2">${esc(g.descriptor)} · Source evidence · ${esc(g.evidence)}${g.seen?`<span class="rvd">${ic('check',13,3)}Reviewed</span>`:''}${g.edited?'<em class="edd">Edited</em>':''}</div></div>
  <dl class="gdet" style="grid-template-columns:repeat(3,minmax(0,1fr))"><div><dt>Terms mapped</dt><dd>${n}</dd></div><div><dt>Template</dt><dd>${t?`${st.resolved}/${st.total} resolved`:'None'}</dd></div><div><dt>Plan type</dt><dd>${t?t.planType:'—'}</dd></div></dl>
  <div class="gacts">${locked?`<span class="pill p-none">${ic('lock',12)} Locked · plans generated</span>`:`<button class="btn" data-act="w_gEdit" data-id="${g.id}">${ic('squarePen',17)}Edit</button><div class="kb"><button class="kbb" data-act="w_gm" data-id="${g.id}" aria-haspopup="true" aria-expanded="${W.gm===g.id}" aria-label="More actions for ${esc(g.name)}">${ic('more',18)}</button>${W.gm===g.id?`<div class="kpop" role="menu"><button role="menuitem" data-act="w_gMerge" data-id="${g.id}" ${p.groups.length<2?'disabled':''}>${ic('combine',17)}Merge with…</button><button role="menuitem" data-act="w_gSplit" data-id="${g.id}">${ic('split',17)}Split into two</button><hr><button class="dg" role="menuitem" data-act="w_gRemove" data-id="${g.id}">${ic('xCircle',17)}Remove group</button></div>`:''}</div>`}</div></div>`;
}
const wInfo=(n,title,desc,chips)=>SMART()?`<details class="info v3"><summary><span class="stp"><b>${n}</b>/${WSTAGES.length}</span><h2>${title}</h2><span class="sumstrip">${chips||''}</span><span class="ichev" title="About this step" aria-label="About this step">${ic('info',17)}</span></summary><p>${desc}</p></details>`:`<details class="info"><summary><span class="st2">Step ${n} of ${WSTAGES.length}</span><h2>${title}</h2><span class="sumstrip">${chips||''}</span><span class="ichev" title="About this step" aria-label="About this step">${ic('info',17)}</span></summary><p>${desc}</p></details>`;
const wDot=c=>`<i style="background:${c}"></i>`;
function wGroups(p){
 const hasBase=p.groups.some(g=>g.type==='base'),flag=p.groups.filter(g=>g.conf<85&&!g.seen&&g.status!=='confirmed').length,locked=p.status==='packaged';
 return `${wInfo(2,'Is this how the proposal splits its members?',`The parser found <b>${p.groups.length} group${p.groups.length!==1?'s':''}</b> in ${esc(p.file)}. Each becomes one template, so get the structure right first: edit, merge, split, remove or add groups, then confirm. Left-over terms are placed in the next step.`,`<span class="chip">${wDot('var(--accent)')}${p.groups.length} groups</span><span class="chip">${wDot(flag?'var(--warn)':'var(--good)')}${flag} flagged</span>`)}
  ${locked?`<div class="alert a-warn">${ic('lock',18)}<div>This proposal is part of a published package. Groups, templates and plans are locked and shown read-only.</div></div>`:''}
  ${!hasBase&&p.groups.length?`<div class="alert a-bad" role="alert">${ic('alert',18)}<div><b>No base group.</b> Edit a group and set its type to Base.</div></div>`:''}
  <section class="card"><div class="gc-h"><div><div class="eyebrow">${esc(p.file)}</div><h2>Groups detected in the proposal</h2></div>${locked?'':`<button class="btn" data-act="w_gAdd">${ic('userPlus',17)}Add group</button>`}</div>
   ${p.groups.length?p.groups.map(g=>wGroupRow(p,g)).join(''):`<div class="empty"><div class="ring">${ic('users',22)}</div><h3>No groups left</h3><p>Add a group, or upload a clearer copy as a revision.</p><button class="btn btn-p" data-act="w_gAdd">${ic('userPlus',17)}Add group</button></div>`}</section>`;
}
function wLeftovers(p){
 const un=wUnplaced(p).length,items=p.clauses.filter(c=>c.wasUnplaced);
 return `${wInfo(3,'Place the left-over terms',`The parser found these terms but couldn\u2019t attach them to a group. Assign each one to a group, or set it aside with a reason.`,`<span class="chip">${wDot(un?'var(--warn)':'var(--good)')}${un} to place</span><span class="chip">${items.length} total</span>`)}
  ${wLeftCard(p)}`;
}
function wBarGroups(p){
 const ok=wGroupsOk(p),hasBase=p.groups.some(g=>g.type==='base'),locked=p.status==='packaged',n=p.groups.length;
 const msg=!hasBase?['bad','No base group yet','Set one group as Base before you can confirm.']
  :ok?['',`Structure confirmed · ${n} ${n>1?'groups':'group'}`,'You can still change a group until its plans are generated.']
  :['',`${n} ${n>1?'groups':'group'} · structure not confirmed yet`,'Confirming creates one template per group.'];
 return `<div class="bar-in"><button class="btn" data-act="w_stage" data-s="document">${ic('left',17)}Document</button><div class="m ${msg[0]}"><b>${msg[1]}</b><span>${msg[2]}</span></div>
  <div class="bar-r"><button class="btn" data-act="w_saveExit" title="${IDEAL()?'Everything is saved automatically':'Save and leave'}">${IDEAL()?'Exit':'Save &amp; exit'}</button>
  ${ok?`<button class="btn btn-p btn-lg" data-act="w_stage" data-s="leftovers">Continue${ic('arrow',18)}</button>`:`<button class="btn btn-p btn-lg" data-act="w_gConfirm" ${hasBase&&!locked?'':'disabled'}>Confirm ${n} ${n>1?'groups':'group'}${ic('arrow',18)}</button>`}</div></div>`;
}
function wBarLeftovers(p){
 const un=wUnplaced(p).length;
 const msg=un?['warn',`${un} left-over ${un>1?'terms':'term'} to place`,'Place each one, or set it aside with a reason.']:p.loReview?['','All left-over terms handled','Approving makes the placements final.']:['','Left-over terms placed','Nothing else to do here.'];
 return `<div class="bar-in"><button class="btn" data-act="w_stage" data-s="groups">${ic('left',17)}Groups</button><div class="m ${un?'warn':''}"><b>${msg[1]}</b><span>${msg[2]}</span></div>
  <div class="bar-r"><button class="btn" data-act="w_saveExit" title="${IDEAL()?'Everything is saved automatically':'Save and leave'}">${IDEAL()?'Exit':'Save &amp; exit'}</button><button class="btn btn-p btn-lg" data-act="${p.loReview?'w_approveLeft':'w_stage'}" data-s="templates" ${un?'disabled':''}>Continue to templates${ic('arrow',18)}</button></div></div>`;
}

/* ---------- unplaced terms stage ---------- */
function wSuggest(p,c){
 const t=c.text,base=p.groups.find(g=>g.type==='base'),top=p.groups.find(g=>g.type==='topup');
 if(/top-?up|deductible/i.test(t))return {g:top||null,comp:'deductibles',why:top?'Reads like a top-up term.':'Reads like a top-up. Add a Top-up group to hold it.'};
 const addon=p.groups.find(g=>g.type==='add_on');
 if(/outpatient|\bOPD\b/i.test(t))return {g:addon||null,comp:'sub_limits',why:addon?'An OPD limit belongs with the new Add-on group.':'Reads like an add-on. Add an Add-on group to hold it.'};
 if(/TPA/.test(t))return {g:base,comp:'tpa',why:'TPA terms belong with the base group.'};
 if(/domiciliary/i.test(t))return {g:base,comp:'sub_limits',why:'A percentage limit. Sublimit fits.'};
 return {g:null,comp:null,why:''};
}
function wLeftRow(p,c){
 const s=wSuggest(p,c);
 const head=`<div class="t1"><b>${esc(c.ref)}</b><span class="chip">p. ${c.page}</span>`;
 if(c.na)return `<div class="lrow res"><div>${head}<span class="chip">Set aside</span></div><div class="q">${esc(c.text)}</div><div class="lres">${ic('cc',16)}Set aside · ${esc(asideLabel(c.naReason))}${c.naNote?` · ${esc(c.naNote)}`:''}</div></div><div class="lacts"><button class="btn btn-sm" data-act="w_restore" data-id="${c.id}">Undo</button></div></div>`;
 if(c.groupId!==null){
  const g=p.groups.find(x=>x.id===c.groupId);
  return `<div class="lrow res"><div>${head}<span class="chip g">${ic('check',12,3)}Assigned</span></div><div class="q">${esc(c.text)}</div><div class="lres">${ic('cc',16)}Assigned to <b>${esc(g?g.name:'a group')}</b>${c.componentKey?` · ${clabel(c.componentKey)}`:' · section decided in Templates'}</div></div><div class="lacts"><button class="btn btn-sm" data-act="w_assign" data-id="${c.id}">Change</button><button class="btn btn-sm btn-t" data-act="w_unassign" data-id="${c.id}">Undo</button></div></div>`;
 }
 return `<div class="lrow"><div>${head}<span class="chip">Clause</span></div><div class="q lg">${esc(c.text)}</div>
  <div class="m"><button class="lnk" data-act="w_ev" data-id="${c.id}">View in document</button>${s.g?`<span>·</span><span class="sug">${ic('spark',14)}Suggested: ${esc(s.g.name)}${s.comp?` → ${clabel(s.comp)}`:''}</span>`:`<span>·</span><span>${esc(s.why||'No group clearly fits.')}</span>`}</div></div>
  <div class="lacts"><button class="btn btn-sm btn-p" data-act="w_assign" data-id="${c.id}">${ic('swap',15)}Assign to group</button><button class="btn btn-sm" data-act="w_aside" data-id="${c.id}">Set aside…</button></div></div>`;
}
function wLeftCard(p){
 const items=p.clauses.filter(c=>c.wasUnplaced),open=items.filter(c=>c.groupId===null&&!c.na).length;
 if(!items.length)return `<section class="card"><div class="lhead"><span class="ib g" style="background:var(--good-bg);color:var(--good-ink)">${ic('cc',20)}</span><div><h3>Nothing left over</h3><p>Every term the parser found is already tied to a group.</p></div></div></section>`;
 return `<section class="card"><div class="lhead"><span class="ib" style="${open?'background:var(--warn-bg);color:var(--warn-ink)':'background:var(--good-bg);color:var(--good-ink)'}">${ic(open?'unlink':'cc',20)}</span>
  <div style="flex:1"><h3>Left over from the document <span class="chip ${open?'w':'g'}" style="vertical-align:middle;margin-left:6px">${open?`${open} to place`:'All placed'}</span></h3><p>${open?'The parser found these terms but couldn\u2019t attach them to a group. Place each one before you continue.':`${items.length} ${items.length>1?'terms were':'term was'} placed. `}</p></div></div>
  ${items.map(c=>wLeftRow(p,c)).join('')}</section>`;
}

/* ---------- smart matching + workbench ---------- */
const wBand=n=>n>=90?['hi','High match']:n>=80?['mid','Check']:['lo','Low match'];
const wMatchChip=n=>n==null?'':IDEAL()?`<span class="mchip ${wBand(n)[0]}" title="${n}% match rate"><i></i>${wBand(n)[1]}</span>`:`<span class="mchip ${n>=95?'hi':n>=85?'mid':'lo'}" title="How closely the extracted values match the wording"><b>${n}%</b> match rate</span>`;
const wAuto=c=>!c.na&&!c.verified&&c.componentKey!==null&&c.groupId!==null&&wCase(c)==='review'&&!!c.build&&c.build.status==='built'&&!(c.build.missing&&c.build.missing.length)&&!c.build.reason&&c.mappedBy!=='operator'&&!c.prefilled;
const wAutoList=(p,t)=>wClausesOf(p,t.groupId).filter(wAuto);
const wAttnOf=(p,t,k)=>wClausesOf(p,t.groupId).filter(c=>c.componentKey===k&&!c.na&&!wResolved(c)&&!wAuto(c)).length;
function wWbRow(p,t,c,i,n,real,locked){
 const k=wCase(c),on=c.variantId===ALL,showAll=real>1&&!locked&&k!=='na'&&c.build&&c.build.status!=='no_attribute';
 const badge=n>1?`<span class="wbn">${i+1}</span>`:'';
 const foc=IDEAL()&&W.ui.focusCl===c.id?' foc':'';
 const nc=(c.comments||[]).length,cmtB=V3X()&&k!=='na'?`<button class="btn btn-xs btn-t cmt ${nc?'has':''}" data-act="w_cmt" data-id="${c.id}" aria-expanded="${W.ui.cmt===c.id}" title="Comments">${ic('msg',13)}${nc?nc:'Comment'}</button>`:'';
 const thread=V3X()&&W.ui.cmt===c.id?`<div class="thread">${(c.comments||[]).map(m=>`<div class="cm"><b>${esc(m.by)}</b><em>${wAgo(m.at)}</em><p>${esc(m.text)}</p></div>`).join('')||'<div class="cm none">No comments yet. Add context for the next reviewer.</div>'}<div class="cmnew"><textarea id="cmtbox" class="in" rows="2" placeholder="Write a comment"></textarea><button class="btn btn-xs btn-p" data-act="w_cmtPost" data-id="${c.id}">Post</button></div></div>`:'';
 const v4=IDEAL()&&k!=='na'&&c.build?`${wMatchChip(wConf(c))}`:'';
 const why=IDEAL()&&k!=='na'&&k!=='verified'?`<div class="why">${esc(wWhy(c))}</div>`:'';
 return `<div class="wbq${foc}" data-cl="${c.id}">${badge}<div><blockquote>${esc(c.text)}</blockquote><button class="lnk" data-act="w_ev" data-id="${c.id}">${esc(c.ref)} · p. ${c.page}</button></div></div>
  <div class="wbe${foc}"><div class="wbeh">${badge}<span class="pill ${CASE_TONE[k]}">${CASE_L[k]}</span>${v4}${cmtB}${showAll?wApplyAll(c,on,locked):''}</div>${why}${wEntryHtml(p,t,c,locked)}${thread}</div>`;
}
function wWorkbench(p,t,cur,vs,v,cl,allCl,locked){
 const real=vs.filter(x=>!x.isBlank);
 const tabsOn=real.length>1&&allCl.some(c=>c.variantId!==ALL);
 const resolvedIn=x=>{const l=allCl.filter(c=>c.variantId===x.id);return l.length>0&&l.every(wResolved)};
 const tabs=tabsOn?`<div class="vseg" role="tablist" aria-label="Variants">${vs.map(x=>`<button class="vs" role="tab" aria-selected="${x.id===(v&&v.id)}" data-act="w_var" data-v="${x.id}">${x.isBlank?'<i>Empty Option</i>':esc(x.name)}${resolvedIn(x)?`<span class="ok">${ic('check',11,3)}</span>`:''}</button>`).join('')}</div>`:`<span class="wbl">Plan form entry</span>`;
 const body=v&&v.isBlank?`<div class="wbmsg">${ic('info',14)}<span>Empty Option means plans can choose to have no ${clabel(cur).toLowerCase()}. Shared terms never apply to it.</span></div>`
  :cl.length?cl.map((c,i)=>wWbRow(p,t,c,i,cl.length,real.length,locked)).join(''):`<div class="wbmsg">${ic('info',14)}<span>No terms apply to this variant yet.</span></div>`;
 const rm=tabsOn&&v&&!v.isBlank&&!locked&&real.length>2?`<div class="wbfoot"><button class="btn btn-xs btn-t" data-act="w_delVar" data-v="${v.id}">Remove variant \u201c${esc(v.name)}\u201d</button></div>`:'';
 return `<div class="wb"><div class="wbh"><span class="wbl">From the document</span></div><div class="wbh r">${tabs}</div>${body}</div>${rm}`;
}
/* ---------- templates stage ---------- */
const wUsedComps=(p,t)=>COMP_ORDER.filter(k=>wClausesOf(p,t.groupId).some(c=>c.componentKey===k)||wVars(t,k).length);
function wCompStats(p,t,k){
 const by=new Map();wClausesOf(p,t.groupId).filter(c=>c.componentKey===k).forEach(c=>by.set(wTermOf(c),[...(by.get(wTermOf(c))||[]),c]));
 const terms=[...by.values()];return {total:terms.length,resolved:terms.filter(x=>x.every(wResolved)).length,blocked:terms.some(x=>x.some(c=>['build_failed','no_attribute'].includes(wCase(c))))};
}
function wTplCtx(p){
 const tpls=p.groups.map(g=>wTplOf(p,g.id)).filter(Boolean);
 if(!W.ui.tpl||!tpls.some(t=>t.id===W.ui.tpl))W.ui.tpl=tpls[0]&&tpls[0].id;
 const t=tpls.find(x=>x.id===W.ui.tpl);if(!t)return {tpls,t:null};
 const comps=wUsedComps(p,t);const unsec=wClausesOf(p,t.groupId).filter(c=>c.componentKey===null&&!c.na);
 if(W.ui.comp==='__unsec'&&!unsec.length)W.ui.comp=null;
 if(W.ui.comp!=='__unsec'&&(!W.ui.comp||!comps.includes(W.ui.comp)))W.ui.comp=unsec.length?'__unsec':(comps.find(k=>wCompStats(p,t,k).resolved<wCompStats(p,t,k).total)||comps[0]||null);
 const vs=W.ui.comp&&W.ui.comp!=='__unsec'?wVars(t,W.ui.comp):[];
 if(vs.length&&!vs.some(v=>v.id===W.ui.vid))W.ui.vid=(vs.find(v=>!v.isBlank)||vs[0]).id;
 return {tpls,t,comps,unsec,vs};
}
function wRowsHtml(c){
 const rows=c.build?c.build.rows:[];
 return rows.map(r=>`<div class="arow">${wRowCells(c.componentKey,r).map(x=>`<div class="acell ${x.miss?'miss':''}"><span>${esc(x.l)}</span><b>${x.s!=null?esc(x.s):'Missing'}</b></div>`).join('')}</div>`).join('');
}
function wInlineEditor(c){
 return `<div class="ied"><div class="ieh"><b>Edit values</b><span class="note">Required fields are marked *. Dictionary values only.</span></div><div id="rowsEd">${wEditHtml(c,wEditState.rows)}</div><div class="tact"><button class="btn btn-sm btn-p" data-act="w_saveEdit">Save values</button><button class="btn btn-sm" data-act="w_cancelEdit">Cancel</button><button class="btn btn-sm btn-t" data-act="w_rowAdd">${ic('plusC',14)}Add row</button></div></div>`;
}
function wEntryHtml(p,t,c,locked){
 const k=wCase(c);
 return (()=>{
  if(W.ui.edit===c.id&&wEditState&&wEditState.cid===c.id)return wInlineEditor(c);
  if(k==='na')return `<div class="sg">${ic('info',14)}<span>Set aside · ${esc(asideLabel(c.naReason))}${c.naNote?` · ${esc(c.naNote)}`:''}</span></div>${locked?'':`<div class="tact"><button class="btn btn-sm" data-act="w_restore" data-id="${c.id}">Restore</button></div>`}`;
  if(k==='no_attribute')return `<div class="sg bad">${ic('alert',14)}<span>${esc(c.build.reason)}</span></div>${locked?'':`<div class="tact">${c.attributeRequested?`<span class="pill p-info">${ic('msgPlus',12)} Request raised</span>`:`<button class="btn btn-sm btn-p" data-act="w_reqAttr" data-id="${c.id}">${ic('msgPlus',15)}Raise a request</button>`}<button class="btn btn-sm" data-act="w_remap" data-id="${c.id}">Change section</button><button class="btn btn-sm" data-act="w_aside" data-id="${c.id}">Set aside…</button></div>`}`;
  if(k==='build_failed')return `<div class="sg bad">${ic('alert',14)}<span>Couldn\u2019t build values. ${esc(c.build.reason||'')}</span></div>${locked?'':`<div class="tact"><button class="btn btn-sm btn-p" data-act="w_edit" data-id="${c.id}">${ic('keyboard',15)}Fill in manually</button><button class="btn btn-sm" data-act="w_remap" data-id="${c.id}">Change section</button><button class="btn btn-sm" data-act="w_aside" data-id="${c.id}">Set aside…</button></div>`}`;
  const hint=c.componentKey==='coverages'&&c.build&&c.build.reason?`<div class="sg warn">${ic('alert',14)}<span>${esc(c.build.reason)}</span>${locked?'':`<button class="btn btn-sm" data-act="w_move" data-id="${c.id}" data-to="sub_limits">Move to Sublimit</button>`}</div>`:'';
  return `${hint}${wRowsHtml(c)}${c.build&&c.build.missing.length?`<div class="sg warn">${ic('alert',14)}<span>Missing: ${c.build.missing.map(m=>esc((ATTR[m]||{l:m}).l)).join(', ')}. Fill them in before verifying.</span></div>`:''}
   ${locked?'':`<div class="tact">${k==='verified'?`<span class="pill p-good">${ic('check',12,3)} Confirmed</span><button class="btn btn-sm" data-act="w_unverify" data-id="${c.id}">Reopen</button>`:`<button class="btn btn-sm btn-p" data-act="w_verify" data-id="${c.id}" ${k==='incomplete'?'disabled title="Fill the missing values first"':''}>${ic('cc',15)}Confirm values</button>`}<button class="btn btn-sm" data-act="w_edit" data-id="${c.id}">${ic('squarePen',15)}Edit values</button><button class="btn btn-sm" data-act="w_remap" data-id="${c.id}">Change section</button><button class="btn btn-sm btn-t" data-act="w_aside" data-id="${c.id}">Set aside…</button></div>`}`;
 })();
}
const wTierSibs=(p,c)=>{const t=wTplOf(p,c.groupId),vs=wVars(t,c.componentKey);return wClausesOf(p,c.groupId).filter(x=>x.componentKey===c.componentKey&&!x.na&&x.termId&&x.termId===c.termId&&x.variantId!==ALL).sort((a,b)=>vs.findIndex(v=>v.id===a.variantId)-vs.findIndex(v=>v.id===b.variantId))};
const wApplyAll=(c,on,locked)=>locked?'':`<button class="applyall ${on?'on':''}" role="checkbox" aria-checked="${on}" data-act="w_scope" data-id="${c.id}" data-m="${on?'diff':'shared'}"><i>${on?ic('check',12,3.5):''}</i>Apply to all variants</button>`;
const wQuote=c=>`<div class="tpre"><div class="tqh"><b class="tqt">From the document</b><button class="lnk" data-act="w_ev" data-id="${c.id}">${esc(c.ref)} · p. ${c.page}</button></div><blockquote>${esc(c.text)}</blockquote></div>`;
function wTierCard(p,t,sibs,locked){
 const vs=wVars(t,sibs[0].componentKey);
 const cur=sibs.find(x=>x.variantId===W.ui.vid)||sibs.find(x=>!wResolved(x))||sibs[0];
 const vn=x=>(vs.find(v=>v.id===x.variantId)||{name:'Variant'}).name;
 const done=sibs.filter(wResolved).length,k=wCase(cur);
 return `<article class="term tier ${k}"><div class="tq">${wQuote(cur)}</div>
  <div class="te"><div class="tierh"><div class="vseg" role="tablist" aria-label="Variants">${sibs.map(x=>`<button class="vs" role="tab" aria-selected="${x===cur}" data-act="w_var" data-v="${x.variantId}">${esc(vn(x))}${wResolved(x)?`<span class="ok">${ic('check',11,3)}</span>`:''}</button>`).join('')}</div><span class="note">${done}/${sibs.length} confirmed</span></div>
   ${wApplyAll(cur,false,locked)}
   <div class="tent">${wEntryHtml(p,t,cur,locked)}</div></div></article>`;
}
function wSharedCard(p,t,c,locked){
 const k=wCase(c);
 return `<article class="term tier ${k}"><div class="tq">${wQuote(c)}</div>
  <div class="te">${wApplyAll(c,true,locked)}<div class="tent">${wEntryHtml(p,t,c,locked)}</div></div></article>`;
}
function wTermCard(p,t,c,v,locked){
 const k=wCase(c),conf=wConf(c),sibs=c.termId?p.clauses.filter(x=>wTermOf(x)===c.termId):[c],vs=wVars(t,c.componentKey).filter(x=>!x.isBlank);
 const can=!locked&&vs.length>1&&k!=='na'&&c.build&&c.build.status!=='no_attribute';
 const shared=c.variantId===ALL;
 const entry=wEntryHtml(p,t,c,locked);
 return `<article class="term ${k}"><div class="tq"><div class="tqh"><span class="pill ${CASE_TONE[k]}">${CASE_L[k]}</span>${c.prefilled?'<span class="chip a">Demo values</span>':''}<button class="lnk" data-act="w_ev" data-id="${c.id}">${esc(c.ref)} · p. ${c.page}</button></div><blockquote>${esc(c.text)}</blockquote>
  ${can?`<div class="applies"><span class="note">Applies to</span><div class="seg" role="group" aria-label="Variant scope"><button aria-selected="${shared}" data-act="w_scope" data-id="${c.id}" data-m="shared">All variants</button><button aria-selected="${!shared}" data-act="w_scope" data-id="${c.id}" data-m="diff">Different per variant</button></div>${!shared?`<span class="note">${sibs.length} versions of this term</span>`:''}</div>`:`<div class="applies"><span class="note">Applies to ${shared?'all variants':esc((wVars(t,c.componentKey).find(x=>x.id===c.variantId)||{name:'one variant'}).name)}</span></div>`}</div>
  <div class="te">${entry}</div></article>`;
}
const wNextTpl=(p,tpls,t)=>{const i=tpls.findIndex(x=>x.id===t.id);return [...tpls.slice(i+1),...tpls.slice(0,i)].find(x=>!wTplComplete(p,x))||null};
function wTemplates(p){
 const {tpls,t,comps,unsec,vs}=wTplCtx(p);
 if(!t)return `<section class="card"><div class="empty" style="border-top:0"><div class="ring">${ic('list',22)}</div><h3>No templates yet</h3><p>Confirm the groups first. One template is created per group.</p></div></section>`;
 const locked=wTplLocked(p,t.id),un=wUnplaced(p).length,stats=wTplStats(p,t);
 const smart=SMART(),autoList=wAutoList(p,t),attnN=comps.reduce((n,k)=>n+wAttnOf(p,t,k),0)+unsec.length;
 if(smart&&!W.ui.tri)W.ui.tri=attnN?'attn':autoList.length?'auto':'all';
 const tri=smart?W.ui.tri:'all';
 const vcomps=tri==='attn'?comps.filter(k=>wAttnOf(p,t,k)>0||k===W.ui.comp&&0):tri==='auto'?[]:comps;
 if(tri==='attn'&&W.ui.comp!=='__unsec'&&!vcomps.includes(W.ui.comp))W.ui.comp=unsec.length?'__unsec':vcomps[0]||null;
 const rail=sec=>{const list=vcomps.filter(k=>COMPS[k].sec===sec);return list.length?`<div class="rsec"><h4>${SECLAB[sec]}</h4>${list.map(k=>{const s=wCompStats(p,t,k);return `<button class="ri" aria-current="${W.ui.comp===k}" data-act="w_comp" data-k="${k}"><span class="dt ${s.total&&s.resolved===s.total?'ok':s.blocked?'er':'wn'}"></span><span class="lb">${clabel(k)}</span><span class="ct">${tri==='attn'?wAttnOf(p,t,k):`${s.resolved}/${s.total}`}</span></button>`}).join('')}</div>`:''};
 const cur=tri==='auto'?'__auto':W.ui.comp;
 let main='';
 if(cur==='__auto'){
  const off=W.ui.autoOff||[],pick=autoList.filter(c=>!off.includes(c.id));
  main=`<div class="mh"><div><h3>Matched automatically</h3><p>${autoList.length} ${autoList.length===1?'term was':'terms were'} mapped with high confidence. Untick anything you want to check yourself.</p></div>${locked||!autoList.length?'':`<div class="mact"><button class="btn btn-sm btn-p" data-act="w_acceptAuto" ${pick.length?'':'disabled'}>${ic('cc',15)}Accept ${pick.length}</button></div>`}</div>
   ${autoList.length?`<div class="alist">${autoList.map(c=>{const vn=(wVars(t,c.componentKey).find(x=>x.id===c.variantId)||{}).name;return `<label class="arow2"><input type="checkbox" data-wc="autoPick" data-id="${c.id}" ${off.includes(c.id)?'':'checked'} ${locked?'disabled':''}><div class="at"><span class="ak">${clabel(c.componentKey)}${vn&&c.variantId!==ALL?` · ${esc(vn)}`:''}</span><b>${esc(c.text)}</b><span class="avs">${esc(wSummarize([c]))}</span></div>${wMatchChip(wConf(c))}<button class="btn btn-xs btn-t" data-act="w_triOpen" data-id="${c.id}">Open</button></label>`}).join('')}</div>`:`<div class="wbmsg" style="margin:14px 20px">${ic('check',14)}<span>Nothing waiting. Every auto-matched term has been accepted.</span></div>`}`;
 }else if(cur==='__unsec'){
  main=`<div class="mh"><div><h3>Needs a section</h3><p>The group is known, but the parser could not tell which plan-form section holds these terms.</p></div></div><div class="uwrap">${unsec.map(c=>`<article class="term unmapped_component"><div class="tq"><div class="tqh"><span class="pill p-bad">${CASE_L.unmapped_component}</span><button class="lnk" data-act="w_ev" data-id="${c.id}">${esc(c.ref)} · p. ${c.page}</button></div><blockquote>${esc(c.text)}</blockquote></div>
   <div class="te"><div class="sg">${ic('info',14)}<span>Pick the plan-form section. Values are built from the text and never guessed.</span></div>${locked?'':`<div class="tact"><button class="btn btn-sm btn-p" data-act="w_remap" data-id="${c.id}">Choose a section</button><button class="btn btn-sm" data-act="w_aside" data-id="${c.id}">Set aside…</button></div>`}</div></article>`).join('')}</div>`;
 }else if(cur){
  const v=vs.find(x=>x.id===W.ui.vid);
  const allCl=wClausesOf(p,t.groupId).filter(c=>c.componentKey===cur&&!c.na&&!(tri==='attn'&&wAuto(c)));
  const cl=allCl.filter(c=>!v||(!v.isBlank&&(c.variantId==null||wApplies(c,v.id))));
  const asd=wClausesOf(p,t.groupId).filter(c=>c.componentKey===cur&&c.na);
  const hasBlank=vs.some(x=>x.isBlank),cs=wCompStats(p,t,cur);
  main=`<div class="mh"><div><h3>${clabel(cur)}</h3><p>${cs.total} ${cs.total===1?'term':'terms'} · ${vs.filter(x=>!x.isBlank).length} ${vs.filter(x=>!x.isBlank).length===1?'variant':'variants'}</p></div>
   ${locked?'':`<div class="mact"><button class="btn btn-xs" data-act="w_addVar" data-k="${cur}">${ic('plusC',14)}Add variant</button>${COMPS[cur].opt&&!hasBlank?`<button class="btn btn-xs" data-act="w_addBlank" data-k="${cur}">Allow \u201cno ${clabel(cur).toLowerCase()}\u201d</button>`:''}</div>`}</div>
   ${wWorkbench(p,t,cur,vs,v,cl,allCl,locked)}
   ${asd.length?`<h4 class="sub">Set aside in this section</h4>${asd.map(c=>wTermCard(p,t,c,v,locked)).join('')}`:''}`;
 }else if(tri==='attn'){
  main=`<div class="empty" style="border-top:0"><div class="ring" style="background:var(--good-bg);color:var(--good-ink)">${ic('check',22,2.5)}</div><h3>Nothing needs your attention</h3><p>${autoList.length?`${autoList.length} auto-matched ${autoList.length===1?'term is':'terms are'} waiting for you to accept.`:'Every term in this template is handled.'}</p>${autoList.length&&!locked?`<button class="btn btn-p" data-act="w_tri" data-m="auto">Review auto-matched</button>`:''}</div>`;
 }else main=`<div class="empty" style="border-top:0"><div class="ring">${ic('list',22)}</div><h3>No terms in this template yet</h3><p>Assign terms to this group from the Groups step.</p></div>`;
 const open=stats.open;
 return `${wInfo(4,'Check each term against the plan form',`One template per group. The proposal wording is on the left, the plan-form entry on the right. Values come only from the text, so anything it doesn\u2019t state stays a visible gap.`,`<span class="chip">${wDot(p.templates.every(x=>wTplComplete(p,x))?'var(--good)':'var(--warn)')}${p.templates.filter(x=>wTplComplete(p,x)).length}/${p.templates.length} templates complete</span><span class="chip">${wDot(open?'var(--warn)':'var(--good)')}${open} ${open===1?'term':'terms'} to resolve</span>`)}
  <div class="tbar2"><div class="gtabs" role="tablist" aria-label="Templates">${tpls.map(x=>{const s=wTplStats(p,x),g=wGroupOfTpl(p,x),dn=wTplComplete(p,x);return `<button class="gt" role="tab" aria-selected="${x.id===t.id}" data-act="w_tpl" data-t="${x.id}">${esc(g.name)}<span class="cnt ${dn?'ok':''}">${dn?`${ic('check',11,3)}Done`:`${s.resolved}/${s.total}`}</span>${wTplLocked(p,x.id)?ic('lock',12):''}</button>`}).join('')}</div>
   <div class="tbact">${open&&!locked&&!smart?`<button class="btn btn-sm" data-act="w_verifyAll">${ic('cc',14)}Confirm all clean terms</button>`:''}</div></div>
  ${smart?`<div class="smart"><span class="sico">${ic('spark',17)}</span><div class="stx"><b>${autoList.length+stats.resolved>0?`${autoList.length+wClausesOf(p,t.groupId).filter(c=>c.verified&&!c.na).length} of ${wClausesOf(p,t.groupId).filter(c=>!c.na).length} terms matched with high confidence`:'No confident matches in this template'}</b><span>${attnN?`${attnN} ${attnN===1?'needs':'need'} your attention`:'Nothing needs your attention'}</span></div><button class="btn btn-xs btn-t sp-how" data-act="spotAI" title="How smart review works">${ic('info',14)}How it works</button><div class="seg tri" role="tablist" aria-label="Review filter"><button role="tab" aria-selected="${tri==='attn'}" data-act="w_tri" data-m="attn">Needs attention <b>${attnN}</b></button><button role="tab" aria-selected="${tri==='auto'}" data-act="w_tri" data-m="auto">Auto-matched <b>${autoList.length}</b></button><button role="tab" aria-selected="${tri==='all'}" data-act="w_tri" data-m="all">All terms <b>${wClausesOf(p,t.groupId).filter(c=>!c.na).length}</b></button></div></div>`:''}
  ${IDEAL()&&tri!=='auto'?wRvStrip(p,t):''}
  ${(()=>{const nx=wNextTpl(p,tpls,t);return wTplComplete(p,t)&&!locked&&nx?`<div class="alert a-ok nextg">${ic('check',18,2.5)}<div><b>${esc(wGroupOfTpl(p,t).name)} is complete.</b> ${tpls.filter(x=>!wTplComplete(p,x)).length} ${tpls.filter(x=>!wTplComplete(p,x)).length>1?'groups':'group'} left to check. Up next: ${esc(wGroupOfTpl(p,nx).name)}.</div><div class="ax"><button class="btn btn-sm btn-p" data-act="w_tpl" data-t="${nx.id}">Next group: ${esc(wGroupOfTpl(p,nx).name)}${ic('arrow',15)}</button></div></div>`:''})()}
  ${un>0?`<div class="alert a-warn">${ic('alert',18)}<div><b>${un} term${un>1?'s are':' is'} still unplaced.</b> No template can finish until every term is in a group or set aside.</div><div class="ax"><button class="btn btn-sm" data-act="w_stage" data-s="leftovers">Place terms</button></div></div>`:''}
  ${locked?`<div class="alert a-ok">${ic('lock',18)}<div>${p.status==='packaged'?'This proposal is in a published package.':'Plans were generated from this template.'} It is view-only. Changes arrive through a revised PF.</div></div>`:''}
  ${t.reopened?`<div class="alert a-warn">${ic('history',18)}<div><b>Reopened by a revision.</b> Confirm the changed terms, then regenerate only the affected plan rows.</div></div>`:''}
  <div class="tbg"><aside class="rail card"><div class="rsec"><h4>Template</h4><div class="rname">${esc(t.displayName)}<small>${t.planType} · ${stats.resolved}/${stats.total} terms resolved</small></div><div class="bar" style="margin-top:8px"><i style="width:${stats.total?stats.resolved/stats.total*100:0}%"></i></div></div>
   ${unsec.length?`<div class="rsec"><h4>Needs attention</h4><button class="ri" aria-current="${cur==='__unsec'}" data-act="w_comp" data-k="__unsec"><span class="dt er"></span><span class="lb">Needs a section</span><span class="ct">${unsec.length}</span></button></div>`:''}
   ${rail('plan_details')}${rail('covers')}
   <div class="rsec"><h4>Pricing</h4><div class="ri off"><span class="dt"></span><span class="lb">Pricing grids</span><span class="ct">Plans</span></div><small class="note" style="padding:0 12px">Entered per plan in the next step, not mapped from terms.</small></div></aside>
  <section class="card tmain">${main}</section></div>`;
}
function wBarTemplates(p){
 const done=wTplDone(p),un=wUnplaced(p).length,open=p.templates.reduce((n,t)=>n+wTplStats(p,t).open,0);
 return `<div class="bar-in"><button class="btn" data-act="w_stage" data-s="groups">${ic('left',17)}Groups</button><div class="m ${done?'':'warn'}"><b>${done?'All templates complete':un?`${un} unplaced ${un>1?'terms':'term'} and ${open} to resolve`:`${open} ${open===1?'term':'terms'} left to resolve`}</b><span>${done?'Plan combinations can now be proposed from the variants.':'Confirm each term, or set it aside with a reason. Plans unlock when every template is complete.'}</span></div>
  ${(()=>{const tpls=p.groups.map(g=>wTplOf(p,g.id)).filter(Boolean),t=tpls.find(x=>x.id===W.ui.tpl),nx=t&&!done&&wTplComplete(p,t)?wNextTpl(p,tpls,t):null;return `<div class="bar-r">${V3X()?wProbBtn(p):''}<button class="btn" data-act="w_saveExit" title="${IDEAL()?'Everything is saved automatically':'Save and leave'}">${IDEAL()?'Exit':'Save &amp; exit'}</button>${nx?`<button class="btn btn-p btn-lg" data-act="w_tpl" data-t="${nx.id}">Next group${ic('arrow',18)}</button>`:`<button class="btn btn-p btn-lg" data-act="w_stage" data-s="plans" ${done?'':'disabled'}>Continue to plans${ic('arrow',18)}</button>`}</div>`})()}</div>`;
}

/* ---------- plans stage ---------- */
function wPlanSection(p,t,n){
 const rows=p.plans.filter(x=>x.templateId===t.id),g=wGroupOfTpl(p,t);
 const pend=wPending(p).length,blockedRev=pend>0,packaged=p.status==='packaged';
 const term=x=>x.generated&&!x.needsGeneration;
 const allComps=wSelComps(p,t),hid=V3X()?(W.ui.hideCols||[]):[],comps=allComps.filter(k=>!hid.includes(k));
 const fq=V3X()?(W.ui.gfind||'').trim().toLowerCase():'';
 const vrows=fq?rows.filter(x=>(x.name+' '+x.displayName+' '+x.pricingSchema).toLowerCase().includes(fq)):rows;
 const diffOf=(k,x)=>V3X()&&W.ui.gdiff&&rows[0]&&x!==rows[0]&&x.selection[k]!==rows[0].selection[k];
 const ready=rows.filter(x=>!term(x));
 const allConf=ready.length>0&&ready.every(x=>x.reviewStatus==='confirmed'&&!wPlanValid(p,x).length);
 const nConf=rows.filter(x=>term(x)||x.reviewStatus==='confirmed').length;
 const tgen=wTplLocked(p,t.id);
 const ro0=tgen||packaged;
 const sel=(W.ui.sel||[]).filter(id=>rows.some(x=>x.id===id));
 const row=(x,i)=>{
  const errs=wPlanValid(p,x),tm=term(x),ro=tm||packaged;
  const cell=(f,ph,bad)=>ro?`<span class="pcell">${esc(x[f])||'—'}</span>`:`<input class="xin ${bad?'bad':''}${x.touched&&x.touched[f]?' chg':''}" data-wc="planField" data-id="${x.id}" data-f="${f}" value="${esc(x[f])}" placeholder="${ph}" aria-label="${ph}">`;
  const vcell=k=>{
   const vs=wVars(t,k);const v=x.values.find(q=>q.componentKey===k);const showSum=k==='sum_insured';
   const sum=showSum&&v&&v.summary?`<small class="xsum" title="${esc(v.summary)}">${esc(v.summary)}</small>`:'';
   return `<td class="xv${diffOf(k,x)?' xd':''}">${ro?`<span class="pcell" title="${esc(v?v.summary:'')}">${esc(v?v.variantName:'—')}</span>`:`<select class="xin${x.touched&&x.touched[k]?' chg':''}" data-wc="planSel" data-id="${x.id}" data-k="${k}" aria-label="${clabel(k)}" title="${esc(v?v.summary:'')}">${vs.map(o=>`<option value="${o.id}" ${x.selection[k]===o.id?'selected':''}>${o.isBlank?'Empty Option':esc(o.name)}</option>`).join('')}</select>`}${sum}</td>`;
  };
  const state=tm?`<span class="pill p-good">${ic('lock',11)} Active · v${x.generatedVersion}</span>`:x.needsGeneration?'<span class="pill p-warn">Needs regeneration</span>':x.reviewStatus==='confirmed'?'<span class="pill p-info">Confirmed</span>':'';
  return `<tr class="${tm?'gen':''}"><td class="xn xl1"><label class="xsel"><input type="checkbox" data-wc="rowSel" data-id="${x.id}" ${(W.ui.sel||[]).includes(x.id)?'checked':''} ${ro?'disabled':''} aria-label="Select row ${i+1}"><span>${i+1}</span></label></td>
   <td class="xl2">${cell('name','Plan name',errs.includes('name')||errs.includes('duplicate'))}</td>
   <td>${cell('displayName','Display name',errs.includes('display'))}</td><td>${cell('pricingSchema','Pricing schema',errs.includes('pricing'))}</td>
   <td class="c"><input type="radio" name="def-${t.id}" ${x.isDefault?'checked':''} ${ro?'disabled':''} data-act="w_default" data-id="${x.id}" aria-label="Make ${esc(x.name)} the default plan"></td>
   ${comps.map(vcell).join('')}
   <td class="xr"><div class="rbtns">${state}${x.impact&&x.impact.length&&!tm?x.impact.map(r=>`<span class="imp">${esc(r)}</span>`).join(''):''}${ro?'':(x.reviewStatus==='confirmed'?`<button class="btn btn-xs" data-act="w_unconf" data-id="${x.id}">Reopen</button>`:`<button class="btn btn-xs btn-p" data-act="w_conf" data-id="${x.id}" ${errs.length?`disabled title="Needs ${errs.join(', ')}"`:''}>Confirm row</button>`)}${ro?'':`<button class="icon-btn" data-act="w_delPlan" data-id="${x.id}" aria-label="Delete ${esc(x.name)}" title="Delete row">${ic('trash',15)}</button>`}</div></td></tr>`;
 };
 return `<section class="card xsec" id="xs-${t.id}"><div class="card-h"><div><h3>${esc(g.name)} · Template</h3><p>${rows.length} plan ${rows.length===1?'combination':'combinations'}${tgen?' · Generated, read-only':''}</p></div>
   <div class="mact"><span class="pill ${nConf===rows.length&&rows.length?'p-good':'p-warn'}">${nConf}/${rows.length} rows confirmed</span>
   ${tgen||packaged?'':`<div class="inl"><input class="in xp" id="wprice-${t.id}" placeholder="Pricing schema" aria-label="Pricing schema for all rows"><button class="btn btn-xs" data-act="w_priceAll" data-t="${t.id}">Apply to all</button></div><button class="btn btn-xs" data-act="w_addPlan" data-t="${t.id}">${ic('plusC',14)}Add row</button><button class="btn btn-xs" data-act="w_confAll" data-t="${t.id}">${ic('cc',13)}Confirm all</button>`}</div></div>
  ${V3X()?`<div class="xtools3"><div class="xfind">${ic('search',14)}<input id="gfind" data-wi="gfind" type="search" value="${esc(W.ui.gfind||'')}" placeholder="Find in table" aria-label="Find in table"></div><button class="btn btn-xs ${W.ui.gdiff?'btn-on':''}" data-act="w_gdiff" aria-pressed="${!!W.ui.gdiff}" title="Shade cells that differ from the first row">${ic('layers',13)}Highlight differences</button><div class="xcolsw"><button class="btn btn-xs" data-act="w_cols" aria-expanded="${!!W.ui.colsOpen}">${ic('sliders',13)}Columns${hid.length?` <b class="xn2">${allComps.length-hid.length}/${allComps.length}</b>`:''}</button>${W.ui.colsOpen?`<div class="xcols" role="menu">${allComps.map(k=>`<label><input type="checkbox" data-wc="colTog" data-k="${k}" ${hid.includes(k)?'':'checked'}>${clabel(k)}</label>`).join('')}<button class="btn btn-xs btn-t" data-act="w_colsAll">Show all</button></div>`:''}</div><button class="btn btn-xs" data-act="w_exportPlans" data-t="${t.id}">${ic('download',13)}Export CSV</button><span class="xhint">Tip: paste a range from Excel into any cell</span></div>`:''}
  ${sel.length?`<div class="xbulk"><b>${sel.length} selected</b><button class="btn btn-xs" data-act="w_confSel">${ic('cc',13)}Confirm</button><button class="btn btn-xs" data-act="w_dupSel">${ic('plusC',13)}Duplicate</button><button class="btn btn-xs btn-d" data-act="w_delSel">${ic('trash',13)}Delete</button><button class="btn btn-xs btn-t" data-act="w_clearSel">Clear</button></div>`:''}
  <div class="pscroll xwrap" tabindex="0" role="region" aria-label="${esc(g.name)} plan rows, scroll sideways for more fields"><table class="pt xt"><thead>
   <tr class="xg"><th class="xl1"></th><th class="xl2 gp">Plan info</th><th class="gp" colspan="3"></th><th class="gt2" colspan="${Math.max(1,comps.length)}">Template details</th><th class="xr"></th></tr>
   <tr><th class="xl1"><label class="xsel">${ro0?'':`<input type="checkbox" data-wc="rowSelAll" data-t="${t.id}" ${ready.length&&ready.every(x=>(W.ui.sel||[]).includes(x.id))?'checked':''} aria-label="Select all rows">`}<span>#</span></label></th><th class="xl2">Plan name</th><th>Display name</th><th>Pricing schema</th><th class="c">Default</th>${comps.map(k=>`<th>${clabel(k)}</th>`).join('')}<th class="xr">Status</th></tr></thead>
   <tbody>${vrows.map(x=>row(x,rows.indexOf(x))).join('')}</tbody></table></div>
  ${rows.length&&!vrows.length?`<div class="empty-t">No rows match \u201c${esc(W.ui.gfind)}\u201d.</div>`:''}
  ${!rows.length?`<div class="empty-t">No plan rows. Add one to start.</div>`:''}</section>`;
}
function wPlans(p){
 wEnsurePlans(p);
 const tpls=p.groups.map(g=>wTplOf(p,g.id)).filter(Boolean);
 if(!tpls.length)return '';
 const pend=wPending(p).length,packaged=p.status==='packaged';
 const term=x=>x.generated&&!x.needsGeneration;
 if(!W.ui.planTab||!tpls.some(x=>x.id===W.ui.planTab))W.ui.planTab=tpls[0].id;
 const cur=tpls.find(x=>x.id===W.ui.planTab);
 return `${wInfo(5,'Review the plan combinations, then generate',`One row per Sum Insured variant is prefilled. Each row picks one variant per section. Scroll sideways to see every field, confirm each row, then generate. Generation is final for a template version and makes its rows read-only.`,`<span class="chip">${wDot('var(--good)')}${p.plans.filter(term).length}/${p.plans.length} rows active</span>`)}
  ${pend?`<div class="alert a-warn">${ic('alert',18)}<div><b>${pend} revision ${pend>1?'changes are':'change is'} waiting for a decision.</b> Plans can't be generated until they are accepted or kept.</div><div class="ax"><button class="btn btn-sm" data-act="w_stage" data-s="document">Review changes</button></div></div>`:''}
  ${packaged?`<div class="alert a-ok">${ic('lock',18)}<div>This proposal is in a published package. Plans are locked.</div></div>`:''}
  ${packaged||tpls.every(t=>wTplLocked(p,t.id))?'':`<div class="xtop"><span>${tpls.length} ${tpls.length>1?'templates':'template'} · Confirm every valid row in one go</span><button class="btn btn-xs" data-act="w_confEvery">${ic('cc',13)}Confirm all rows</button></div>`}
  ${tpls.length>1?`<div class="tbar2"><div class="gtabs" role="tablist" aria-label="Templates">${tpls.map(x=>{const rs=p.plans.filter(q=>q.templateId===x.id),dn=rs.length>0&&rs.every(q=>term(q)||q.reviewStatus==='confirmed');return `<button class="gt" role="tab" aria-selected="${x.id===cur.id}" data-act="w_ptab" data-t="${x.id}">${esc(wGroupOfTpl(p,x).name)}<span class="cnt ${dn?'ok':''}">${dn?`${ic('check',11,3)}`:''}${rs.filter(q=>term(q)||q.reviewStatus==='confirmed').length}/${rs.length}</span></button>`}).join('')}</div></div>`:''}
  ${wPlanSection(p,cur,0)}`;
}
function wBarPlans(p){
 const all=p.status==='plans_active'||p.status==='packaged';
 const open=p.plans.filter(x=>!(x.generated&&!x.needsGeneration));
 const conf=open.filter(x=>x.reviewStatus==='confirmed'&&!wPlanValid(p,x).length).length;
 const ready=open.length>0&&conf===open.length&&!wPending(p).length;
 const msg=all?['','All plans generated']:ready?['',`${open.length} ${open.length>1?'rows':'row'} confirmed`]:['warn',`${conf}/${open.length} rows confirmed`,'Confirm every row, then generate. Nothing is submitted until you do.'];
 const ap=p.approval&&p.approval.status;
 let primary;
 if(all)primary=`<button class="btn btn-p btn-lg" data-act="w_nav" data-v="packages">${p.status==='packaged'?'View package':'Continue to packages'}${ic('arrow',18)}</button>`;
 else if(V3X()&&W.role!=='admin'){
  primary=ap==='pending'?`<button class="btn btn-t" data-act="w_role">Switch to admin (demo)</button><button class="btn btn-p btn-lg" disabled>${ic('clock',16)}Awaiting approval</button>`
   :`<button class="btn btn-p btn-lg" data-act="w_submitAppr" ${ready?'':'disabled'}>${ic('shield',16)}Submit for approval</button>`;
  if(ap==='pending'){msg[0]='';msg[1]='Waiting for an admin to approve';delete msg[2]}
 }else primary=`<button class="btn btn-p btn-lg" data-act="w_generateAll" ${ready?'':'disabled'}>${ic('lock',16)}${V3X()&&ap==='pending'?'Approve &amp; generate':'Generate'} ${open.length} ${open.length>1?'plans':'plan'}</button>`;
 return `<div class="bar-in"><button class="btn" data-act="w_stage" data-s="templates">${ic('left',17)}Templates</button><div class="m ${msg[0]}"><b>${msg[1]}</b>${msg[2]?`<span>${msg[2]}</span>`:''}</div>
  <div class="bar-r">${V3X()?wProbBtn(p):''}<button class="btn" data-act="w_saveExit" title="${IDEAL()?'Everything is saved automatically':'Save and leave'}">${IDEAL()?'Exit':'Save &amp; exit'}</button>${primary}</div></div>`;
}
function wBarDocument(p){
 const cur=wCurStage(p),go=cur==='document'?'groups':cur,pend=wPending(p).length;
 return `<div class="bar-in"><button class="btn" data-act="w_back">${ic('left',17)}Back</button><div class="m"><b>${pend?`${pend} revision ${pend>1?'changes':'change'} to decide`:'Document parsed'}</b></div><div class="bar-r"><button class="btn" data-act="w_saveExit" title="${IDEAL()?'Everything is saved automatically':'Save and leave'}">${IDEAL()?'Exit':'Save &amp; exit'}</button><button class="btn btn-p btn-lg" data-act="w_stage" data-s="${go}" ${pend?'disabled':''}>Continue${ic('arrow',18)}</button></div></div>`;
}
function wBar(p){
 if(!p||p.status==='parsing'||p.status==='failed'||p.status==='draft')return '';
 return ({document:wBarDocument,groups:wBarGroups,leftovers:wBarLeftovers,templates:wBarTemplates,plans:wBarPlans}[W.stage]||(()=>''))(p);
}
