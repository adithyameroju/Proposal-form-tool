/* ================= overview ================= */
function counts(){
 const P=S.props;
 return {drafts:P.filter(p=>p.status==='draft').length,prog:P.filter(p=>['parsing','saved'].includes(p.status)).length,done:P.filter(p=>p.status==='completed').length,
  att:P.filter(p=>p.status==='failed'||(p.reqs&&p.reqs.length&&p.status!=='completed')).length};
}
function filtered(){
 const q=S.hq.trim().toLowerCase();
 return S.props.filter(p=>{
  const t=S.tab;
  const okTab=t==='all'||(t==='draft'&&p.status==='draft')||(t==='prog'&&['parsing','saved'].includes(p.status))||(t==='done'&&p.status==='completed')||(t==='fail'&&p.status==='failed');
  return okTab&&(!q||(p.name+p.id+(p.file||'')).toLowerCase().includes(q));
 });
}
function progress(p){
 const n=STEPS.length;let cells='',lbl='';
 const mk=i=>{
  if(p.status==='completed')return '<i class="d"></i>';
  if(p.status==='draft')return '<i></i>';
  if(p.status==='failed')return i===0?'<i class="f"></i>':'<i></i>';
  if(p.status==='parsing')return i===0?`<i class="c"><b data-pbar="${p.id}" style="--w:${Math.round(p.pct||0)}%"></b></i>`:'<i></i>';
  return i<p.step?'<i class="d"></i>':i===p.step?'<i class="c"><b style="--w:55%"></b></i>':'<i></i>';
 };
 for(let i=0;i<n;i++)cells+=mk(i);
 if(p.status==='draft')lbl=p.draft&&p.draft.file?'File added · not parsed':'Not started';
 else if(p.status==='parsing')lbl=`Parsing · <span data-ppct="${p.id}">${Math.round(p.pct||0)}</span>%`;
 else if(p.status==='failed')lbl='Stopped while parsing';
 else if(p.status==='completed')lbl='Submitted';
 else lbl=`Step ${p.step+1} of 4 · ${STEPS[p.step].t}`;
 return `<div class="trk" aria-hidden="true">${cells}</div><div class="trl">${lbl}</div>`;
}
const rowCta=p=>({draft:'Resume',parsing:'View',saved:'Resume',failed:'Retry',completed:'View'}[p.status]);
function histRows(){
 if(!S.props.length)return `<div class="empty-t"><div class="ring">${ic('file',24)}</div><h3>No proposals yet</h3><p>Start with a new proposal. Drafts and finished work will show up here.</p><button class="btn btn-p" data-act="newProposal">${ic('plus',18)}New proposal</button></div>`;
 const rows=filtered();
 if(!rows.length)return `<div class="empty-t">No proposals match this view.</div>`;
 return rows.map(p=>`
  <div class="tr rw" data-act="openProp" data-id="${p.id}" tabindex="0" role="button" aria-label="${esc(p.name)}, ${ST[p.status].l}">
   <div style="min-width:0"><div class="pn">${esc(p.name)}</div><div class="pi">${p.id} · ${p.file?esc(p.file):'No file yet'}</div></div>
   <div class="hm" style="min-width:0">${p.master?`<div class="pn" style="font-weight:600;font-size:14px">${esc(p.master.split(' · ')[0])}</div><div class="pi">${esc(p.master.split(' · ')[1]||'')}</div>`:'<span class="pm" style="color:var(--ink-3)">Not chosen</span>'}</div>
   <div>${spill(p.status)}</div>
   <div class="hs">${progress(p)}</div>
   <div class="hm pm">${esc(p.updated)}</div>
   <div class="ac">${p.status==='draft'?`<button class="icon-btn" data-act="discardDraft" data-id="${p.id}" aria-label="Discard draft ${esc(p.name)}" title="Discard draft">${ic('x',18)}</button>`:''}<button class="btn btn-sm" tabindex="-1">${rowCta(p)}</button></div>
  </div>`).join('');
}
function historyCard(){
 const P=S.props;
 const cnt=t=>P.filter(p=>t==='all'||(t==='draft'&&p.status==='draft')||(t==='prog'&&['parsing','saved'].includes(p.status))||(t==='done'&&p.status==='completed')||(t==='fail'&&p.status==='failed')).length;
 const tab=(k2,l)=>`<button role="tab" aria-selected="${S.tab===k2}" data-act="tab" data-t="${k2}">${l}<span>${cnt(k2)}</span></button>`;
 return `<section class="card">
   <div class="card-h"><div><h2>Proposal history</h2><p>Pick up where you left off, or look back at what you submitted.</p></div></div>
   <div class="tbar"><div class="tabs" role="tablist">${tab('all','All')}${tab('draft','Drafts')}${tab('prog','In progress')}${tab('done','Completed')}${tab('fail','Failed')}</div>
    <div class="hsearch">${ic('search',16)}<input id="hq" type="search" value="${esc(S.hq)}" placeholder="Search by name or ID" aria-label="Search proposals"></div></div>
   <div class="tr hd"><span>Proposal</span><span class="hm">Master policy</span><span>Status</span><span class="hs">Progress</span><span class="hm">Updated</span><span></span></div>
   <div id="hrows">${histRows()}</div>
  </section>`;
}
function viewOverview(){
 const c=counts();
 const k=(ico,tone,v,l,s)=>`<div class="card kpi"><span class="ib ${tone}">${ic(ico,22)}</span><div><div class="v">${v}</div><div class="k">${l}</div><div class="s">${s}</div></div></div>`;
 return `
  <div class="ph"><div><h1>Overview</h1><p>History and saved states of your proposal forms.</p></div>
   <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap"><button class="btn btn-lg" data-act="startTour">${ic('spark',17)}Take the tour</button><button class="btn btn-p btn-lg" data-act="newProposal">${ic('plus',18)}New proposal</button></div></div>
  <div class="kpis">
   ${k('filePen','n',c.drafts,'Drafts','Saved, not parsed yet')}
   ${k('clock','a',c.prog,'In progress','Parsing or saved mid-way')}
   ${k('cc','g',c.done,'Completed','Submitted')}
   ${k('alert','b',c.att,'Needs attention','Failed, or a request is open')}
  </div>
  ${historyCard()}`;
}
function viewProposals1(){
 return `
  <div class="ph"><div><h1>Proposals</h1><p>Upload a proposal form to start, or pick up an earlier one.</p></div>
   <button class="btn btn-p btn-lg" data-act="newProposal">${ic('plus',18)}New proposal</button></div>
  <section class="card ingress ing2"><label class="drop" data-dropopen><div class="ring">${ic('upload',24)}</div><div class="dt"><b>Drop a proposal PDF here, or browse</b><span>PDF up to 25 MB. Scans are accepted but may read less accurately.</span></div><span class="btn btn-p bd-btn">${ic('upload',16)}Browse files</span><input id="fi2" class="sr" type="file" accept="application/pdf,.pdf"></label>
   <div class="ing-s"><span>Or try a sample</span>${SAMPLES.map((x,i)=>`<button class="btn btn-xs" data-act="startSample" data-i="${i}">${x.label}</button>`).join('')}</div></section>
  ${historyCard()}`;
}

/* ================= new proposal (a page inside the app shell) ================= */
function nfReady(){const n=S.nf;return !!n.file&&!n.err&&!!n.master&&(n.master!=='new'||n.newName.trim().length>0)}
function refreshNf(){renderBar()}
function bigDrop(attr,id,multiple){
 return `<label class="drop bigdrop" ${attr}><div class="ring">${ic('upload',30)}</div><div><b>Drop ${multiple?'proposal PDFs':'a proposal PDF'} here</b><span>or choose ${multiple?'files':'a file'} from your computer · PDF up to 25 MB</span></div><span class="btn btn-p bd-btn">${ic('upload',16)}Browse files</span><input id="${id}" class="sr" type="file" accept="application/pdf,.pdf" ${multiple?'multiple':''}></label>`;
}
function intakeBody(){
 const n=S.nf;
 return `<div class="fpg"><section class="card"><div class="card-h"><div><h3>Proposal document</h3><p>PDF only, up to 25 MB. Scans are accepted but may read less accurately.</p></div></div><div class="card-b">
   ${n.err?`<div class="alert a-bad" role="alert">${ic('alert',18)}<div><b>${esc(n.err.t)}</b> ${esc(n.err.d)}</div></div>`:''}
   ${n.file&&!n.err?`<div class="filecard bigfile"><div class="fi">PDF</div><div style="flex:1;min-width:0"><div class="fn">${esc(n.file.name)}</div><div class="fm">${n.file.size} · ready to parse</div></div><button class="btn btn-sm" data-act="clearFile">${ic('x',15)}Remove</button></div>`:bigDrop('data-drop','fi',false)}
   <div class="samples" style="margin-top:12px"><span>Try a sample:</span>${SAMPLES.map((x,i)=>`<button class="btn btn-sm" data-act="useSample" data-i="${i}">${x.label}</button>`).join('')}</div></div></section>
  <section class="card"><div class="card-h"><div><h3>Details</h3><p>The parser needs a master policy to map groups and variables.</p></div></div><div class="card-b">
   <div class="fld" style="margin-top:0"><label for="nf-name">Proposal name <span class="note">(optional)</span></label><input class="in" id="nf-name" data-inp="nfName" value="${esc(n.name)}" placeholder="Uses the file name if empty"></div>
   <div class="fld"><label for="nf-m">Master policy</label>
    <select class="in" id="nf-m" data-chg="nfMaster"><option value="">Choose a master policy</option>
     ${S.masters.map(m=>`<option value="${m.id}" ${n.master===m.id?'selected':''} ${m.status==='Expired'?'disabled':''}>${m.id} · ${esc(m.name)}${m.note?' (suggested)':''}${m.status==='Expired'?' (expired)':''}</option>`).join('')}
     <option value="new" ${n.master==='new'?'selected':''}>+ Create a new master policy…</option></select>
    <small>Expired master policies can\u2019t take new proposals.</small></div>
   ${n.master==='new'?`<div class="row2"><div class="fld"><label for="nf-n">New master policy name</label><input class="in" id="nf-n" data-inp="nfNew" value="${esc(n.newName)}" placeholder="e.g. Group Health 2026–27"></div>
    <div class="fld"><label for="nf-i">Insurer</label><select class="in" id="nf-i" data-chg="nfIns">${['Northstar General','Harbor Mutual','Redwood Assurance'].map(x=>`<option ${n.insurer===x?'selected':''}>${x}</option>`).join('')}</select></div></div>
    <p class="note">Maternity cover and limits are prefilled from the proposal. You can adjust them later.</p>`:''}</div></section></div>`;
}
function intakeBar(){
 const ok=nfReady();
 return `<div class="bar-in"><button class="btn" data-act="back">Cancel</button><div class="m"><b>${ok?'Ready to parse':'Add a PDF and choose a master policy'}</b><span>${ok?'Parsing starts when you continue. Nothing is final until you confirm each step.':'Parsing starts once both are set. You can also save a draft.'}</span></div>
  <div style="display:flex;gap:10px"><button class="btn" id="nfdraft" data-act="saveDraft">${ic('save',16)}Save as draft</button><button class="btn btn-p btn-lg" id="nfgo" data-act="startParse" ${ok?'':'disabled'}>${ic('spark',17)}Start parsing</button></div></div>`;
}
function newPageV1(){
 return `<div class="crumbs"><button class="back" data-act="back" aria-label="Go back">${ic('left',17)}</button><nav aria-label="Breadcrumb"><ol><li><a href="#" data-act="toProposals">Proposals</a>${ic('right',14)}</li><li aria-current="page">New proposal</li></ol></nav></div>
  <div class="ph"><div><h1>${S.nfid?'Resume draft':'New proposal'}</h1><p>Upload the proposal form and choose the master policy it belongs to.</p></div></div>${intakeBody()}`;
}
function openIntake(){
 S.menu=null;if(S.view!=='new')S.fromNew=S.view;S.intake='v1';S.view='new';S.sb=false;render(true);
}
function refreshIntake(){
 if(!S.intake)return;renderPage();renderBar();
}
