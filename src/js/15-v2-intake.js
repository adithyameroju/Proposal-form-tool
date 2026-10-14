/* ---------- intake (V2: batch, fingerprint, revision detection) ---------- */
const WSAMPLES=[
 {label:'Clean proposal',name:'Ayurs infotech 5L with maternity.pdf',size:'2.4 MB',mode:'clean'},
 {label:'Partly scanned',name:'Ayurs infotech 3L (scanned).pdf',size:'3.1 MB',mode:'partial'},
 {label:'Unreadable file',name:'Ayurs infotech GPA (corrupted).pdf',size:'1.2 MB',mode:'fail'},
 {label:'Revised PF',name:'ayurs-topup-2026 (revised).pdf',size:'2.0 MB',mode:'clean'},
 {label:'Revision of a packaged one',name:'ayurs-gmc-2025-26 (revised).pdf',size:'2.3 MB',mode:'clean'},
 {label:'Already ingested',name:'ayurs-gmc-2025-26.pdf',size:'2.2 MB',mode:'clean'},
 {label:'Password-protected',name:'Ayurs infotech GMC (password protected).pdf',size:'1.8 MB',mode:'clean'},
 {label:'Over 25 MB',name:'Ayurs infotech scans bundle.pdf',size:'32.0 MB',mode:'clean'},
 {label:'Another partner\u2019s file',name:'Northwind logistics GMC.pdf',size:'2.0 MB',mode:'clean'}
];
const wBase=n=>String(n).toLowerCase().replace(/\.pdf$/,'').replace(/\(revised\)|\(\d+\)/g,'').replace(/[-_ ]*v\d+$/,'').replace(/[-_ ]*(final|revised)$/,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
function wMatch(f){
 const pp=wProps();
 const same=pp.find(p=>p.file===f.name&&p.fileSize===f.size);if(same)return {p:same,identical:true,sim:1};
 const b=wBase(f.name),near=pp.find(p=>wBase(p.file)===b);
 return near?{p:near,identical:false,sim:.87}:null;
}
const wDetectPartner=name=>{const h=name.toLowerCase();for(const [id,tok] of Object.entries({north:'northwind',kestrel:'kestrel',blue:'bluepine',ayurs:'ayurs'}))if(h.includes(tok))return id;return null};
function wNewIntake(){return {files:[],err:'',mk:false,mkName:'',draftId:null,reviseId:null}}
function wAttachFile(f){
 const I=W.intake;
 if(!/\.pdf$/i.test(f.name)){I.err=`${f.name} was skipped: only PDF files are supported.`;return false}
 if(I.files.some(x=>x.name===f.name)){I.err=`${f.name} is already attached.`;return false}
 const mb=parseFloat(f.size);
 if(mb>25){I.err=`${f.name} is ${f.size}. Files must be 25 MB or smaller. Compress the PDF or split it, then try again.`;return false}
 let warn=null;
 if(String(f.size).startsWith('0.0'))warn={t:'empty',m:'This file looks empty, so there is nothing to read.'};
 else if(/password|protected|encrypted/i.test(f.name))warn={t:'locked',m:'This file is password-protected, so its text can\u2019t be read.'};
 else if(/corrupt|broken|fail|unreadable/i.test(f.name))warn={t:'corrupt',m:'This file looks damaged or unreadable.'};
 const row={key:'f'+rid(),name:f.name,size:f.size,mode:warn?'fail':(f.mode||(/corrupt|broken|fail/i.test(f.name)?'fail':/scan/i.test(f.name)?'partial':'clean')),hashing:true,policyId:'',match:null,asRev:false,partner:wDetectPartner(f.name),blob:f.blob||null,warn};
 const pm=W.masters.filter(m=>m.partnerId===S.co.id);if(pm.length===1)row.policyId=pm[0].id;
 I.files.push(row);I.err='';
 setTimeout(()=>{const r=W.intake&&W.intake.files.find(x=>x.key===row.key);if(!r)return;r.hashing=false;r.match=wMatch(r);
  r.asRev=!!r.match&&!r.match.identical&&!wRevBlock(r.match.p);if(r.match&&r.asRev&&r.match.p.masterId)r.policyId=r.match.p.masterId;refreshIntake()},650);
 return true;
}
function wFileNote(f){
 if(f.hashing)return `<div class="fnote">${ic('refresh',12)}Checking contents against existing proposals…</div>`;
 const out=[];
 if(f.warn)out.push(`<div class="fnote bad">${ic('alert',13)}<span><b>Heads up: this document isn\u2019t readable.</b> ${f.warn.m} You can continue as is. Parsing will likely stop or find no terms, and you can then replace the file and retry.</span></div>`);
 if(f.partner&&f.partner!==S.co.id)out.push(`<div class="fnote bad">${ic('alert',13)}Looks like a ${esc(WPARTNERS[f.partner]||f.partner)} file. Every file in a batch must belong to ${esc(S.co.name)}.</div>`);
 if(f.match){
  const m=f.match,blk=wRevBlock(m.p);
  if(m.identical)out.push(`<div class="fnote bad">${ic('alert',13)}Identical to ${m.p.ref} v${m.p.version} (${esc(m.p.name)}). Already ingested, nothing new to parse. Remove this file.</div>`);
  else if(blk)out.push(`<div class="fnote warn">${ic('info',13)}Matches ${m.p.ref} (${Math.round(m.sim*100)}% similar), but ${esc(blk)}, so it can't take a new version. It will be created as a separate proposal.</div>`);
  else out.push(`<div class="revbox"><div><b>${ic('branch',13)} Looks like a new version of ${m.p.ref} · ${esc(m.p.name)} (now v${m.p.version})</b><small>Matched by file name · content ${Math.round(m.sim*100)}% similar</small></div>
   <label><input type="radio" name="m-${f.key}" ${f.asRev?'checked':''} data-act="w_mode" data-k="${f.key}" data-m="rev"> Ingest as v${m.p.version+1}. Keep groups, templates and plans; flag what changed</label>
   <label><input type="radio" name="m-${f.key}" ${!f.asRev?'checked':''} data-act="w_mode" data-k="${f.key}" data-m="new"> Treat as a separate proposal</label></div>`);
 }
 return out.join('');
}
function wIntakeBody(){
 const I=W.intake,pm=W.masters.filter(m=>m.partnerId===S.co.id);
 const files=I.files.map(f=>{
  const rev=f.match&&f.asRev&&!f.match.identical&&!wRevBlock(f.match.p);
  return `<div class="ifile"><div class="ifh"><div class="fi">PDF</div><div style="min-width:0"><div class="fn">${esc(f.name)}</div><div class="fm">${f.size} · ${f.mode==='partial'?'scanned pages':f.mode==='fail'?'may not be readable':'text readable'}</div></div>
   ${rev?`<div class="ifm note">Uses ${esc(wMasterName(f.match.p.masterId))} from the proposal it revises</div>`:`<div class="ifm"><label class="sr" for="mp-${f.key}">Master policy</label><select class="in" id="mp-${f.key}" data-wc="filePolicy" data-k="${f.key}"><option value="">Choose a ${esc(S.co.short)} master policy</option>${pm.map(m=>`<option value="${m.id}" ${f.policyId===m.id?'selected':''}>${esc(m.name)}</option>`).join('')}</select></div>`}
   <button class="icon-btn" data-act="w_rmFile" data-k="${f.key}" aria-label="Remove ${esc(f.name)}">${ic('x',16)}</button></div>${wFileNote(f)}</div>`;
 }).join('');
 return `<div class="fpg2"><section class="card"><div class="card-h"><div><h3>Add proposal PDFs</h3><p>Drop several at once. Each file is checked for duplicates and revisions.</p></div></div><div class="card-b">
   ${I.err?`<div class="alert a-bad" role="alert">${ic('alert',16)}<div>${esc(I.err)}</div></div>`:''}
   ${bigDrop('data-wdrop','wfi',true)}
   <div class="samples" style="margin-top:12px"><span>Try a sample:</span>${WSAMPLES.map((s,i)=>`<button class="btn btn-sm" data-act="w_pickS" data-i="${i}">${s.label}</button>`).join('')}</div>
   <div class="mk" style="margin-top:14px">${I.mk?`<div class="fld" style="margin:0"><label for="wmk">New master policy name</label><div class="inl"><input class="in" id="wmk" data-wi="mkName" value="${esc(I.mkName)}" placeholder="e.g. GMC 2027–28 · Master policy"><button class="btn btn-sm btn-p" data-act="w_addMk">Create</button><button class="btn btn-sm" data-act="w_togMk">Cancel</button></div><small>Owned by ${esc(S.co.name)}. A proposal can only use its own partner's master policy.</small></div>`:`<button class="link" data-act="w_togMk">+ Create a master policy for ${esc(S.co.short)}</button>`}</div></div></section>
  <section class="card"><div class="card-h"><div><h3>Files to process</h3><p>${I.files.length?`${I.files.length} ${I.files.length>1?'files':'file'} attached. One PDF becomes one proposal.`:'Nothing attached yet'}</p></div></div><div class="card-b">${I.files.length?files:`<div class="empty-t" style="padding:32px 10px"><div class="ring">${ic('file',22)}</div><h3>No files yet</h3><p>Add PDFs on the left. You will pick a master policy for each one here.</p></div>`}</div></section></div>`;
}
function wIntakeReady(){
 const I=W.intake;const live=I.files.filter(f=>!(f.match&&f.match.identical));
 return I.files.length>0&&!I.files.some(f=>f.hashing)&&I.files.every(f=>!(f.match&&f.match.identical)&&!(f.partner&&f.partner!==S.co.id)&&((f.match&&f.asRev&&!wRevBlock(f.match.p))||f.policyId))&&live.length>0;
}
function wIntakeFoot(){
 const I=W.intake,n=I.files.length;
 return `<button class="btn" data-act="closeOv">Cancel</button>${I.reviseId?'':`<button class="btn" data-act="w_draft" ${n?'':'disabled'}>${ic('save',15)}Save as draft</button>`}<button class="btn btn-p" id="wgo" data-act="w_ingest" ${wIntakeReady()?'':'disabled'}>${ic('spark',15)}Start parsing${n>1?` ${n} proposals`:''}</button>`;
}
function wOpenIntake(opts){
 W.intake=Object.assign(wNewIntake(),opts||{});S.intake='w';S.menu=null;if(W.view!=='new')W.fromNew=W.view;W.view='new';S.sb=false;render(true);
}
function wIntakeBar(){
 const I=W.intake||wNewIntake(),n=I.files.length,ok=wIntakeReady();
 const m=!n?['Add one or more proposal PDFs','Each PDF becomes its own proposal, processed against one master policy.']:ok?[`Ready to parse ${n} ${n>1?'proposals':'proposal'}`,'Parsing starts when you continue. Nothing is final until you confirm each step.']:['Fix the highlighted files to continue','Choose a master policy for each file, and remove duplicates or files from another partner.'];
 return `<div class="bar-in"><button class="btn" data-act="back">Cancel</button><div class="m ${n&&!ok?'warn':''}"><b>${m[0]}</b><span>${m[1]}</span></div>
  <div style="display:flex;gap:10px">${I.reviseId?'':`<button class="btn" data-act="w_draft" ${n?'':'disabled'}>${ic('save',15)}Save as draft</button>`}<button class="btn btn-p btn-lg" id="wgo" data-act="w_ingest" ${ok?'':'disabled'}>${ic('spark',16)}Start parsing${n>1?` ${n} proposals`:''}</button></div></div>`;
}
function wNewPage(){
 const I=W.intake||wNewIntake();
 return `<div class="crumbs"><button class="back" data-act="back" aria-label="Go back">${ic('left',17)}</button><nav aria-label="Breadcrumb"><ol><li><a href="#" data-act="w_nav" data-v="proposals">Proposals</a>${ic('right',14)}</li><li aria-current="page">${I.reviseId?'Upload revised PF':'New proposal'}</li></ol></nav></div>
  <div class="ph"><div><h1>${I.reviseId?'Upload a revised PF':'New proposal'}</h1><p>${esc(S.co.name)} · one PDF becomes one proposal, processed against one master policy.</p></div></div>${wIntakeBody()}`;
}
