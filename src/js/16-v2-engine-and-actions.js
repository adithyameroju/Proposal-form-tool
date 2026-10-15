/* ---------- engine ---------- */
let wtimer=null;
function wEnsureTimer(){if(!wtimer)wtimer=setInterval(wtick,100)}
function wtick(){
 const run=W.proposals.filter(p=>p.status==='parsing');
 if(!run.length){clearInterval(wtimer);wtimer=null;return}
 run.forEach(p=>{
  p.progress=Math.min(100,p.progress+1.1+Math.random()*2.2);
  if(p.mode==='fail'&&!p.replacement&&p.progress>=55)wFail(p);
  else if(p.progress>=100)wFinish(p);
  else wPaint(p);
 });
}
function wRerender(p,msg,err){
 if(VER==='v1')return;
 if(typeof wNotify==='function'&&V3X())wNotify(err?'error':'ok',msg,p.id,err);
 if(W.view==='proposal'&&W.pid===p.id){W.stage='document';render(true)}else{render();toast(msg,{err:err?1:undefined,wopen:p.id})}
}
function wFail(p){
 p.status='failed';p.progress=55;p.failure='Pages 3 to 14 could not be read. The file looks corrupted or password protected, so no text could be extracted.';
 const a=p.attempts[p.attempts.length-1];if(a){a.outcome='failed';a.detail=`${a.detail} · stopped at 55%`}
 wTouch(p);wAudit('Parsing failed',`${p.name} · attempt ${p.attempts.length}`);wRerender(p,`Parsing failed for ${p.name}`,true);
}
function wFinish(p){
 p.progress=100;const a=p.attempts[p.attempts.length-1];if(a)a.outcome='succeeded';
 if(p.revisionParse){p.revisionParse=false;p.status=p.prevStatus||'templates';wDiff(p);wRecompute(p);wAudit('Revised PF ingested',`${p.name} · v${p.version} · ${wPending(p).length} changes to review`)}
 else{p.groups=wSampleGroups(WPARTNERS[p.partnerId]||'Partner');wExtract(p);p.loReview=wUnplaced(p).length>0;p.plans=[];p.status='group_review';p.replacement=null;wAudit('Parsing finished',`${p.name} · ${p.groups.length} groups · ${p.clauses.length} terms`)}
 wTouch(p);wRerender(p,`Parsing finished for ${p.name}`);
}

/* ---------- page + shell hooks ---------- */
function wPage(){
 if(W.view==='new')return wNewPage();
 if(W.ui&&W.ui.edit&&$id('rowsEd')&&wEditState)wEditState.rows=wReadRows();
 if(W.view==='overview')return wOverview();
 if(W.view==='proposals')return wProposalsPage();
 if(W.view==='packages')return wPackages();
 if(W.view==='partners')return wPartners();
 if(W.view==='activity')return wActivity();
 const p=wcur();if(!p){W.view='overview';return wOverview()}
 return wProposalPage(p);
}
function wAdvanceComp(p,c){
 const tp=wTplOf(p,c.groupId);if(!tp||!c.componentKey)return;
 const st=wCompStats(p,tp,c.componentKey);if(st.resolved<st.total)return;
 const comps=wUsedComps(p,tp),i=comps.indexOf(c.componentKey);
 const open=k=>wCompStats(p,tp,k).resolved<wCompStats(p,tp,k).total;
 const nx=[...comps.slice(i+1),...comps.slice(0,i)].find(open);
 W.ui.edit=null;
 if(nx){W.ui.comp=nx;W.ui.vid=null;return}
 const tpls=p.groups.map(g=>wTplOf(p,g.id)).filter(Boolean),nt=wNextTpl(p,tpls,tp);
 if(nt&&wTplComplete(p,tp)){W.ui.tpl=nt.id;W.ui.tri=null;W.ui.comp=null;W.ui.vid=null;W.ui.autoOff=[];toast(`${esc(wGroupOfTpl(p,tp).name)} complete. Moved to ${esc(wGroupOfTpl(p,nt).name)}.`)}
}
function wPush(){const h=W.hist=W.hist||[],cur={view:W.view,pid:W.pid,stage:W.stage},top=h[h.length-1];if(W.view==='new')return;if(!top||top.view!==cur.view||top.pid!==cur.pid||top.stage!==cur.stage)h.push(cur);if(h.length>30)h.shift()}
function wDocDrawer(){
 let d=$id('docdrawer');if(!d){d=document.createElement('aside');d.id='docdrawer';d.setAttribute('aria-label','Proposal document');document.body.appendChild(d)}
 const p=W.view==='proposal'?wcur():null;
 if(!W.docOpen||!p||['draft','parsing','failed'].includes(p.status)){d.classList.remove('open');d.dataset.sig='';d.innerHTML='';document.body.classList.remove('docopen');return}
 const sig=[p.id,W.docView,W.docQ||'',W.docFocus||'',p.clauses.length,p.version,p.blobUrl||''].join('|');
 if(d.classList.contains('open')&&d.dataset.sig===sig)return;
 d.dataset.sig=sig;const oldTop=(d.querySelector('.dd-b')||{}).scrollTop||0;
 const q=(W.docQ||'').trim().toLowerCase(),by={},paper=W.docView==='paper';
 p.clauses.forEach(c=>{if(!q||(c.text+c.ref).toLowerCase().includes(q))(by[c.page]=by[c.page]||[]).push(c)});
 const pages=Object.keys(by).map(Number).sort((a,b)=>a-b);
 const mk=t=>{const e=esc(t);if(!q)return e;const i=e.toLowerCase().indexOf(q);return i<0?e:e.slice(0,i)+'<mark>'+e.slice(i,i+q.length)+'</mark>'+e.slice(i+q.length)};
 const none='<p class="note" style="padding:16px">Nothing matches.</p>';
 const textV=pages.length?pages.map(n=>`<section class="dd-p"><h4>Page ${n}</h4>${by[n].map(c=>`<p class="${c.id===W.docFocus?'foc':''}"><em>${esc(c.ref)}</em>${esc(c.text)}</p>`).join('')}</section>`).join(''):none;
 const paperV=pages.length?pages.map(n=>`<div class="sheetp"><div class="sph"><span>${esc(p.file)}</span><span>${esc(p.master||'')}</span></div>${n===1?'<h5>Group health insurance · Proposal form</h5><div class="spl" style="width:70%"></div>':''}${by[n].map(c=>`<div class="spc ${c.id===W.docFocus?'foc':''}"><h6>${esc(c.ref)}</h6><p>${mk(c.text)}</p></div><div class="spl" style="width:${60+(c.text.length%35)}%"></div><div class="spl" style="width:${40+(c.text.length%45)}%"></div>`).join('')}<div class="spf">Page ${n} of ${p.pages}</div></div>`).join(''):none;
 d.innerHTML=`<div class="dd-h"><div><b>${esc(p.file)}</b><span>v${p.version} · ${p.pages} pages</span></div><button class="icon-btn" data-act="w_doc" aria-label="Close document">${ic('x',18)}</button></div><div class="dd-tabs" role="tablist" aria-label="Document view"><button role="tab" aria-selected="${!paper}" data-act="w_docView" data-v="text">Text</button><button role="tab" aria-selected="${paper}" data-act="w_docView" data-v="paper">Original</button></div><div class="dd-s">${ic('search',15)}<input id="wdq" type="search" value="${esc(W.docQ||'')}" placeholder="Search the document" aria-label="Search the document"></div><div class="dd-b ${paper?'pview':''}">${paper?(p.blobUrl?`<iframe class="pdfv" src="${p.blobUrl}" title="${esc(p.file)}"></iframe>`:paperV+'<p class="dd-note">Sample file: pages are simulated from the extracted text. An uploaded PDF shows here as-is.</p>'):textV}</div>`;
 d.classList.add('open');document.body.classList.add('docopen');
 const fb=d.querySelector('.foc'),bd=d.querySelector('.dd-b');
 if(fb&&W.docFocusScrolled!==W.docFocus){W.docFocusScrolled=W.docFocus;fb.scrollIntoView({block:'center',behavior:'smooth'})}else if(bd)bd.scrollTop=oldTop;
}
function wAfterPage(){wDocDrawer();if(typeof wAfterHook==='function')wAfterHook();const fit=(VER!=='v1'&&(W.view==='overview'||W.view==='proposals'));$id('page').classList.toggle('fitpage',fit);document.body.classList.toggle('fitbody',fit);if(fit)wFit();if(W.view==='proposal'){const p=wcur();if(p&&p.status==='parsing')wPaint(p)}}
function wSbNav(){
 const n=(ico,t,cur,cnt,v)=>`<a href="#" data-tip="${t}" ${cur?'aria-current="page"':''} data-act="w_nav" data-v="${v}">${ic(ico,20)}<span class="lbl">${t}</span>${cnt?`<span class="count">${cnt}</span>`:''}</a>`;
 const v=W.view,pk=W.packages.filter(k=>k.partnerId===S.co.id).length;
 return `${n('dash','Overview',v==='overview','','overview')}${n('file','Proposals',v==='proposals'||v==='proposal',wProps().length,'proposals')}${n('box','Packages',v==='packages',pk||'','packages')}${n('sliders','Partner variables',v==='partners',W.partners[S.co.id].frozen?'':'!','partners')}${n('history','Activity',v==='activity','','activity')}`;
}
function wAudit2(label,detail){wAudit(label,detail)}

/* ---------- evidence + shared form bits ---------- */
function wEvidence(c){
 const p=wcur();
 openOv('modal',{title:'Source evidence',sub:esc(c.ref),wide:1,body:`<div class="paper"><div class="ph2"><span>${esc(p.file)} · v${p.version}</span><span>Page ${c.page} of ${p.pages}</span></div><div class="ln" style="width:40%"></div><div class="ln" style="width:72%"></div><p><mark>${esc(c.text)}</mark></p><div class="ln" style="width:86%"></div><div class="ln" style="width:60%"></div></div><p class="note" style="margin-top:12px">Highlighted text is the verbatim clause the parser extracted.</p>`,foot:`<button class="btn btn-p" data-act="closeOv">Done</button>`});
}
function compOptions(sel,withNone){
 return ['plan_details','covers'].map(sec=>`<optgroup label="${SECLAB[sec]}">${COMP_ORDER.filter(k=>COMPS[k].sec===sec).map(k=>`<option value="${k}" ${k===sel?'selected':''}>${clabel(k)}</option>`).join('')}</optgroup>`).join('');
}
function wFieldHtml(r,i,comp,k){
 const a=ATTR[k]||{l:k,t:'text',o:[]};const v=r.values[k];const req=(REQ[comp]||[]).includes(k);const id=`f-${i}-${k}`;let inp;
 if(a.t==='num')inp=`<input class="in" id="${id}" type="number" step="any" data-r="${i}" data-k="${k}" value="${v==null?'':v}">`;
 else if(a.t==='single')inp=`<select class="in" id="${id}" data-r="${i}" data-k="${k}"><option value="">Choose…</option>${a.o.map(o=>`<option ${v===o?'selected':''}>${esc(o)}</option>`).join('')}</select>`;
 else if(a.t==='bool')inp=`<label class="sw" style="margin:0"><span><b>${a.l}</b></span><input type="checkbox" id="${id}" data-r="${i}" data-k="${k}" ${v?'checked':''}></label>`;
 else inp=`<div class="mgrid" id="${id}">${a.o.map(o=>`<label class="mchk"><input type="checkbox" data-r="${i}" data-k="${k}" data-mv="${esc(o)}" ${Array.isArray(v)&&v.includes(o)?'checked':''}>${esc(o)}</label>`).join('')}</div>`;
 return `<div class="fld ${a.t==='multi'?'full':''}"><label for="${id}">${a.l}${req?' <span class="req">*</span>':''}</label>${inp}</div>`;
}
function wEditHtml(c,rows){
 return rows.map((r,i)=>`<div class="rowbox"><div class="rbh"><b>Row ${i+1}</b>${rows.length>1?`<button class="btn btn-sm btn-t" data-act="w_rowDel" data-i="${i}">Remove row</button>`:''}</div><div class="eg">${(ATTRS_FOR[c.componentKey]||[]).map(k=>wFieldHtml(r,i,c.componentKey,k)).join('')}</div></div>`).join('');
}
let wEditState=null;
function wReadRows(){
 const rows=wEditState.rows.map(r=>({...r,values:{...r.values}}));
 rows.forEach((r,i)=>{(ATTRS_FOR[wEditState.comp]||[]).forEach(k=>{
  const a=ATTR[k]||{t:'text'};
  if(a.t==='multi'){r.values[k]=[...document.querySelectorAll(`[data-r="${i}"][data-k="${k}"]`)].filter(x=>x.checked).map(x=>x.dataset.mv)}
  else{const el=document.querySelector(`[data-r="${i}"][data-k="${k}"]`);if(!el)return;
   if(a.t==='num')r.values[k]=el.value===''?null:parseFloat(el.value);else if(a.t==='bool')r.values[k]=el.checked;else r.values[k]=el.value||null;}
 })});
 return rows;
}
function wGuard(p,c){const t=c.groupId&&wTplOf(p,c.groupId);if(t&&wTplLocked(p,t.id)){toast('This template is locked. Changes arrive through a revised PF.',{err:1});return true}return false}
const wOpenCl=id=>{const p=wcur();return [p,p.clauses.find(x=>x.id===id)]};
function wDoneRender(msg){render();if(msg)toast(msg)}

/* ---------- actions ---------- */
Object.assign(ACT,{
 toggleVer(){S.menu=S.menu==='ver'?null:'ver';renderTop()},
 toggleMe(){S.menu=S.menu==='me'?null:'me';renderTop()},
 pickVer(t){const v=t.dataset.v;S.menu=null;if(v===VER){renderTop();return}closeOv();VER=v;try{localStorage.setItem('ver',v)}catch(e){}S.sb=false;S.gm=S.lm=W.gm=null;render(true);toast(`Switched to ${VLAB[v]}${v==='v4'?': idealistic':': smart review'}`)},
 resetVer(){
  S.menu=null;closeOv();try{localStorage.removeItem('spot_ai');localStorage.removeItem('tour_w')}catch(e){}W.dens='compact';W.rsel=[];W.docTouched=false;
  if(VER!=='v1'){clearInterval(wtimer);wtimer=null;W.seedDone=false;W.proposals=[];W.packages=[];W.corrections=[];W.requests=[];W.audit=[];Object.keys(W.partners).forEach(k=>{W.partners[k]={frozen:k==='north',by:k==='north'?'Admin · Prakash V':null,at:k==='north'?wNow():null,vars:wBaseVars(k==='north'?'15%':'')}});W.view='overview';W.pid=null;W.stage=null;W.role='operator';W.pkg={ack:false,name:'',sel:[],err:''};W.pv={value:'',reason:''};wInit()}
  else{clearInterval(ptimer);ptimer=null;Object.assign(S,{view:'overview',pid:null,tab:'all',hq:'',seq:151,props:seed(),masters:[...MASTERS],nf:blankNf(),nfid:null})}
  render(true);toast(`${VLAB[VER]} demo data reset`);
 },
 w_role(){W.role=W.role==='admin'?'operator':'admin';S.menu=null;render();toast(`Now acting as ${W.role==='admin'?'an administrator (demo)':'an operator'}`)},
 w_nav(t,e){e&&e.preventDefault&&e.preventDefault();if(W.view!==t.dataset.v||W.pid)wPush();W.view=t.dataset.v;W.pid=null;W.gm=null;S.sb=false;render(true)},
 w_open(t){
  wPush();
  const p=W.proposals.find(x=>x.id===t.dataset.id);if(!p)return;
  if(p.status==='draft'){wOpenIntake({draftId:p.id});wAttachFile({name:p.file,size:p.fileSize,mode:'clean'});const r=W.intake.files[0];if(r&&p.masterId)r.policyId=p.masterId;refreshIntake();return}
  S.co.id!==p.partnerId&&0;
  W.pid=p.id;W.view='proposal';W.ui={tpl:null,comp:null,vid:null,planTab:null,open:null,pricing:''};
  if(IDEAL()&&!W.docTouched&&innerWidth>=1300){W.docOpen=true;W.docView='paper'}
  W.stage=(p.status==='parsing'||p.status==='failed'||wPending(p).length)?'document':wCurStage(p);
  S.sb=false;render(true);
 },
 w_back(){if(S.intake){ACT.back();return}const h=W.hist||[];let prev=null;while(h.length){const x=h.pop();if(x.view==='proposal'&&!W.proposals.some(q=>q.id===x.pid))continue;if(x.view!==W.view||x.pid!==W.pid||x.stage!==W.stage){prev=x;break}}if(!prev)prev={view:'proposals',pid:null,stage:null};W.view=prev.view;W.pid=prev.pid;if(prev.stage)W.stage=prev.stage;W.gm=null;render(true)},
 w_stage(t){const p=wcur();const s=t.dataset.s;if(!p||!wReach(p).includes(s)){toast('Finish the previous step first.',{err:1});return}wPush();W.stage=s;W.gm=null;render(true)},
 w_approveLeft(){const p=wcur();if(wUnplaced(p).length)return;confirmDlg({title:'Continue to templates?',body:'These placements can\u2019t be undone once you continue. Terms go into their group\u2019s template; set-aside terms are left out of the plan form.',label:'Yes, continue',onOk:()=>{p.loReview=false;wTouch(p);wRecompute(p);wAudit('Left-overs approved',p.name);W.stage='templates';render(true);toast('Placements approved. Templates are ready.')}})},
 w_doc(){W.docOpen=!W.docOpen;W.docTouched=true;wDocDrawer();renderPage()},
 w_clearF(){W.hq='';W.tab='all';W.pg=1;renderPage()},
 w_pickS2(t){const x=WSAMPLES[+t.dataset.i];wOpenIntake();wAttachFile({name:x.name,size:x.size,mode:x.mode});refreshIntake()},
 w_clearSel(){W.ui.sel=[];renderPage()},
 w_confSel(){const p=wcur();let n=0;p.plans.filter(x=>(W.ui.sel||[]).includes(x.id)).forEach(x=>{if(!wPlanValid(p,x).length&&x.reviewStatus!=='confirmed'){x.reviewStatus='confirmed';n++}});W.ui.sel=[];renderPage();renderBar();toast(n?`${n} ${n>1?'rows':'row'} confirmed`:'Nothing to confirm. Check names and pricing schemas.',n?{}:{err:1})},
 w_dupSel(){const p=wcur();const src=p.plans.filter(x=>(W.ui.sel||[]).includes(x.id));src.forEach(x=>{p.plans.push({...x,id:'plan-'+rid(),name:x.name+' copy',displayName:x.displayName+' copy',isDefault:false,generated:false,active:false,reviewStatus:'pending',needsGeneration:false,selection:{...x.selection},values:x.values.map(v=>({...v})),agent:false,impact:[]})});W.ui.sel=[];wRecompute(p);renderPage();renderBar();toast(`${src.length} ${src.length>1?'rows':'row'} duplicated`)},
 w_delSel(){const p=wcur();const ids=(W.ui.sel||[]);const rows=p.plans.filter(x=>ids.includes(x.id)&&!(x.generated&&!x.needsGeneration));if(!rows.length)return;confirmDlg({title:`Delete ${rows.length} ${rows.length>1?'rows':'row'}?`,body:'These plan rows are removed before generation. Nothing downstream is affected.',label:'Delete',danger:1,onOk:()=>{p.plans=p.plans.filter(q=>!rows.includes(q));p.templates.forEach(t=>{const r=p.plans.filter(q=>q.templateId===t.id);if(r.length&&!r.some(q=>q.isDefault))r[0].isDefault=true});W.ui.sel=[];wRecompute(p);render();toast(`${rows.length} ${rows.length>1?'rows':'row'} deleted`)}})},
 w_saveExit(){const p=wcur();if(p)wTouch(p);W.view='proposals';W.pid=null;W.hist=[];render(true);toast('Progress saved. Pick it up from the Proposals list.')},
 w_docView(t){W.docView=t.dataset.v;wDocDrawer()},
 w_useSug(t){const g=document.querySelector(`input[name="as-g"][value="${t.dataset.g}"]`);if(g){g.checked=true;g.dispatchEvent(new Event('change',{bubbles:true}))}const sc=$id('as-c');if(sc&&t.dataset.k)sc.value=t.dataset.k;const go=$id('as-go');if(go)go.disabled=false},
 w_tab(t){W.tab=t.dataset.t;W.pg=1;renderPage()},
 w_pg(t){W.pg+=+t.dataset.d;$id('wrows').innerHTML=wRows();$id('wpager').innerHTML=wPager()},
 w_discard(t){const p=W.proposals.find(x=>x.id===t.dataset.id);confirmDlg({title:`Discard ${esc(p.name)}?`,body:'This draft is deleted. Parsed proposals are never affected.',label:'Discard draft',danger:1,onOk:()=>{W.proposals=W.proposals.filter(x=>x.id!==p.id);wAudit('Draft discarded',p.name);render();toast('Draft discarded')}})},
 w_gm(t){W.gm=W.gm===t.dataset.id?null:t.dataset.id;renderPage()},
 /* intake */
 w_intake(){wOpenIntake()},
 w_pickS(t){const s=WSAMPLES[+t.dataset.i];if(wAttachFile({name:s.name,size:s.size,mode:s.mode}))refreshIntake();else refreshIntake()},
 w_rmFile(t){W.intake.files=W.intake.files.filter(f=>f.key!==t.dataset.k);W.intake.err='';refreshIntake()},
 w_mode(t){const f=W.intake.files.find(x=>x.key===t.dataset.k);f.asRev=t.dataset.m==='rev';if(f.asRev&&f.match&&f.match.p.masterId)f.policyId=f.match.p.masterId;refreshIntake()},
 w_togMk(){W.intake.mk=!W.intake.mk;W.intake.mkName='';refreshIntake()},
 w_addMk(){
  const n=(W.intake.mkName||'').trim();if(!n)return toast('Name the master policy.',{err:1});
  const m={id:'mp-'+rid(),partnerId:S.co.id,name:n,note:'New'};W.masters.push(m);W.intake.files.forEach(f=>{if(!f.policyId&&!(f.match&&f.asRev))f.policyId=m.id});W.intake.mk=false;W.intake.mkName='';
  wAudit('Master policy created',`${n} · ${S.co.name}`);refreshIntake();toast('Master policy created');
 },
 w_draft(){
  const I=W.intake;I.files.filter(f=>!(f.match&&f.match.identical)).forEach(f=>{
   const base={blobUrl:f.blob?URL.createObjectURL(f.blob):null,name:f.name.replace(/\.pdf$/i,''),file:f.name,fileSize:f.size,masterId:f.policyId||null,master:f.policyId?wMasterName(f.policyId):null,mode:f.mode,status:'draft',updatedAt:wNow()};
   if(I.draftId){Object.assign(W.proposals.find(p=>p.id===I.draftId),base)}
   else{const maxRef=W.proposals.reduce((m,p)=>Math.max(m,Number(p.ref.replace(/\D/g,''))||0),150);W.proposals.unshift({id:'pr-'+rid(),ref:'PR-'+String(maxRef+1).padStart(4,'0'),partnerId:S.co.id,pages:14,progress:0,failure:null,attempts:[],groups:[],clauses:[],templates:[],plans:[],createdAt:wNow(),version:1,versions:[],revisionChanges:[],...base})}
  });
  closeOv();W.view='proposals';W.tab='all';render(true);toast('Draft saved');
 },
 w_ingest(){
  const I=W.intake;if(!wIntakeReady())return;
  const revs=I.files.filter(f=>f.match&&f.asRev&&!f.match.identical&&!wRevBlock(f.match.p));
  const tg=revs.map(f=>f.match.p.id);const rep=tg.find((x,i)=>tg.indexOf(x)!==i);
  if(rep){I.err='Only one new version per proposal per upload. Keep one file as the revision and mark the others as separate proposals.';refreshIntake();return}
  const at=wNow();const made=[];
  let maxRef=W.proposals.reduce((m,p)=>Math.max(m,Number(p.ref.replace(/\D/g,''))||0),150);
  I.files.forEach(f=>{
   if(revs.includes(f)){
    const p=f.match.p;p.versions.push({number:p.version,file:p.file,pages:p.pages,at:p.updatedAt,note:'Superseded'});p.version++;p.file=f.name;p.fileSize=f.size;p.blobUrl=f.blob?URL.createObjectURL(f.blob):p.blobUrl;p.prevStatus=p.status;p.status='parsing';p.progress=0;p.revisionParse=true;p.mode=f.mode;p.replacement=null;
    p.attempts.push({number:p.attempts.length+1,at,outcome:'running',detail:`Revision v${p.version}`});wAudit('Revised PF uploaded',`${p.name} · v${p.version} · ${f.name}`);made.push(p);return;
   }
   const base={name:f.name.replace(/\.pdf$/i,''),file:f.name,fileSize:f.size,masterId:f.policyId,master:wMasterName(f.policyId),mode:f.mode,status:'parsing',progress:0,failure:null,attempts:[{number:1,at,outcome:'running',detail:'Initial parse'}],groups:[],clauses:[],templates:[],plans:[],updatedAt:at,version:1,versions:[],revisionChanges:[],revisionParse:false};
   let p;if(I.draftId&&!made.some(m=>m.id===I.draftId)){p=W.proposals.find(x=>x.id===I.draftId);Object.assign(p,base)}
   else{maxRef++;p={id:'pr-'+rid(),ref:'PR-'+String(maxRef).padStart(4,'0'),partnerId:S.co.id,pages:14,createdAt:at,...base};W.proposals.unshift(p)}
   wAudit('Proposal uploaded',`${p.name} · ${wMasterName(f.policyId)}`);made.push(p);
  });
  closeOv();W.tab='all';
  if(made.length===1){W.pid=made[0].id;W.view='proposal';W.stage='document';W.ui={tpl:null,comp:null,vid:null,planTab:null,open:null,pricing:''}}else{W.view='proposals'}
  render(true);wEnsureTimer();if(made.length>1)toast(`${made.length} proposals are parsing in parallel`);
 },
 /* document */
 w_cancelParse(){const p=wcur();confirmDlg({title:'Cancel parsing?',body:p.revisionParse?'The revised file is discarded and the previous version stays as it was.':'The upload is discarded and nothing is saved.',label:'Cancel parsing',danger:1,onOk:()=>{
  if(p.revisionParse){const v=p.versions.pop();p.version=v.number;p.file=v.file;p.status=p.prevStatus||'templates';p.revisionParse=false;p.attempts.pop();wTouch(p);W.stage=null;render(true)}
  else{W.proposals=W.proposals.filter(x=>x.id!==p.id);W.view='proposals';W.pid=null;render(true)}
  toast('Parsing cancelled')}})},
 w_clearRep(){wcur().replacement=null;renderPage()},
 w_repSample(){wcur().replacement={name:'sanitized-copy.pdf',mode:'clean'};renderPage()},
 w_retry(){
  const p=wcur();const r=p.replacement;
  p.status='parsing';p.progress=0;p.failure=null;if(r){p.file=r.name;p.mode=r.mode}
  p.attempts.push({number:p.attempts.length+1,at:wNow(),outcome:'running',detail:r?`Retry with replaced file ${r.name}`:'Retry with the same file'});
  wAudit('Parsing retried',`${p.name} · attempt ${p.attempts.length}`);render(true);wEnsureTimer();
 },
 w_raiseDoc(){const p=wcur();W.requests.unshift({id:'REQ-0'+W.reqSeq++,partnerId:S.co.id,title:`Parser could not read ${p.file}`,detail:p.name,at:wNow()});wAudit('Request raised',`Parser issue · ${p.name}`);toast('Request raised. The platform team will pick it up.')},
 w_revise(){const p=wcur();const blk=wRevBlock(p);if(blk){toast(`This proposal can't take a new version: ${blk}.`,{err:1});return}
  wOpenIntake({reviseId:p.id});wAttachFile({name:p.file.replace(/\.pdf$/i,'')+' (revised).pdf',size:'2.6 MB',mode:'clean'})},
 w_revAccept(t){
  const p=wcur();const ch=p.revisionChanges.find(x=>x.id===t.dataset.id);
  if(ch.kind==='clause_changed'){
   const c=p.clauses.find(x=>x.id===ch.clauseId);const tp=wTplOf(p,c.groupId);const rows=wImpactRows(p,ch);
   c.text=ch.next;c.build=buildClause(c.text,c.componentKey);c.verified=false;c.mappedBy='system';tp.reopened=true;
   rows.forEach(x=>{x.reviewStatus='pending';x.needsGeneration=x.generated||x.needsGeneration;x.impact=[...(x.impact||[]),`v${p.version}: ${ch.impacts[0].reason}`]});
   wRefreshPlans(p,tp.id);rows.forEach(x=>{x.reviewStatus='pending'});
  }else{
   const g={id:'grp-'+rid(),type:'add_on',name:ch.groupName,descriptor:'Outpatient add-on',evidence:'Annexure 6 · p. 14',conf:80,status:'confirmed',seen:false};p.groups.push(g);p.templates.push(wNewTemplate(g,p.id));
   p.clauses.push({id:'cl-'+rid(),ref:'Annexure 6 · OPD · Row 1',page:14,text:'Outpatient (OPD) cover of ₹10,000 per family per policy year.',groupId:null,componentKey:null,variantId:null,build:null,verified:false,na:false,attributeRequested:false,mappedBy:'system',wasUnplaced:true});
  }
  ch.resolution='accepted';wTouch(p);wRecompute(p);wAudit('Revision change accepted',`${p.name} · ${ch.label}`);render();toast('Accepted. Affected plan rows reopened for review.');
 },
 w_revKeep(t){const p=wcur();const ch=p.revisionChanges.find(x=>x.id===t.dataset.id);ch.resolution='kept';wTouch(p);wRecompute(p);wAudit('Revision change kept',`${p.name} · ${ch.label}`);render();toast('Kept the current wording.')},
 /* groups */
 w_gEdit(t){
  const p=wcur(),g=p.groups.find(x=>x.id===t.dataset.id);W.gm=null;
  openOv('modal',{title:'Edit group',sub:esc(g.name),body:`<div class="ev-strip">${wConfPill(g.conf)}<span>${esc(g.evidence)}</span></div>
   <div class="fld"><label for="ge-name">Group name</label><input class="in" id="ge-name" value="${esc(g.name)}"></div>
   <div class="fld"><label for="ge-type">Group type</label><select class="in" id="ge-type">${Object.entries(GTYPE).map(([k,l])=>`<option value="${k}" ${g.type===k?'selected':''}>${l}</option>`).join('')}</select><small>Base is the primary insured member. Each proposal needs one.</small></div>
   <div class="fld"><label for="ge-desc">Who is in this group</label><input class="in" id="ge-desc" value="${esc(g.descriptor)}"></div>
   <div class="fb"><b>Teach the parser</b><p class="note">If you changed the name or type, tell us why. This is kept as structured feedback.</p>
    <div class="fld"><label for="ge-why">Reason</label><select class="in" id="ge-why"><option value="">Choose a reason</option>${FEEDBACK.map(([v,l])=>`<option value="${v}">${l}</option>`).join('')}</select></div>
    <div class="fld" style="margin:0"><label for="ge-note">Note (optional)</label><input class="in" id="ge-note" placeholder="What did the document actually say?"></div></div>`,
   foot:`<button class="btn" data-act="closeOv">Cancel</button><button class="btn btn-p" data-act="w_gSave" data-id="${g.id}">Save changes</button>`});
 },
 w_gSave(t){
  const p=wcur(),g=p.groups.find(x=>x.id===t.dataset.id);const name=val('ge-name').trim(),type=val('ge-type'),desc=val('ge-desc').trim(),why=val('ge-why');
  if(!name)return toast('Give the group a name.',{err:1});
  const changed=name!==g.name||type!==g.type;
  if(changed&&!why)return toast('Choose a reason so the correction can teach the parser.',{err:1});
  if(changed)W.corrections.unshift({id:'c'+rid(),scope:`group:${g.name}`,original:`${g.name} (${GTYPE[g.type]})`,corrected:`${name} (${GTYPE[type]})`,reason:(FEEDBACK.find(f=>f[0]===why)||[,'Edited'])[1],note:val('ge-note').trim(),user:'Riya Kulkarni',at:wNow()});
  const old=g.name;Object.assign(g,{name,type,descriptor:desc||g.descriptor,edited:true,seen:true});
  const tp=wTplOf(p,g.id);if(tp){tp.planType=type==='topup'?'Topup':'Base';tp.displayName=`${name} · Template`;tp.name=`${name.replace(/\s*·\s*/g,' ').toUpperCase()} TEMPLATE`}
  wTouch(p);wAudit('Group edited',`${old}${changed?` → ${name} (${GTYPE[type]})`:''} · ${p.name}`);closeOv();wDoneRender('Changes saved');
 },
 w_gAdd(){
  openOv('modal',{title:'Add a group',sub:'Use this when the proposal has a group the parser missed.',body:`<div class="fld"><label for="ga-name">Group name</label><input class="in" id="ga-name" placeholder="e.g. Ayurs · Top-up"></div><div class="fld"><label for="ga-type">Group type</label><select class="in" id="ga-type">${Object.entries(GTYPE).map(([k,l])=>`<option value="${k}" ${k==='topup'?'selected':''}>${l}</option>`).join('')}</select></div>`,foot:`<button class="btn" data-act="closeOv">Cancel</button><button class="btn btn-p" data-act="w_gSaveAdd">Add group</button>`});
 },
 w_gSaveAdd(){
  const p=wcur();const name=val('ga-name').trim();if(!name)return toast('Give the group a name.',{err:1});
  const g={id:'grp-'+rid(),type:val('ga-type'),name,descriptor:'Added by an operator',evidence:'Added manually',conf:null,status:wGroupsOk(p)?'confirmed':'draft',seen:true,edited:true};
  p.groups.push(g);p.templates.push(wNewTemplate(g,p.id));wTouch(p);wRecompute(p);wAudit('Group added',`${name} · ${p.name}`);closeOv();wDoneRender(`${name} added`);
 },
 w_gMerge(t){
  const p=wcur(),g=p.groups.find(x=>x.id===t.dataset.id),o=p.groups.filter(x=>x.id!==g.id);W.gm=null;
  openOv('modal',{title:'Merge group',sub:`Merge \u201c${esc(g.name)}\u201d into another group.`,body:`<div class="opt-list" role="radiogroup">${o.map((x,i)=>`<label class="opt"><input type="radio" name="gm" value="${x.id}" ${i===0?'checked':''}><span><b>${esc(x.name)}</b><span>${GTYPE[x.type]} · ${wClausesOf(p,x.id).filter(c=>!c.na).length} terms</span></span></label>`).join('')}</div>
   <div class="fld" style="margin-top:14px"><label for="gm-name">Name of the merged group</label><input class="in" id="gm-name" value="${esc(o[0].name)}"><small>Terms and variants of both groups are kept. Generated plans of the merged-away template are removed.</small></div>`,
   foot:`<button class="btn" data-act="closeOv">Cancel</button><button class="btn btn-p" data-act="w_gDoMerge" data-id="${g.id}">Merge groups</button>`,
   mount(){document.querySelectorAll('input[name="gm"]').forEach(r=>r.addEventListener('change',()=>{$id('gm-name').value=p.groups.find(x=>x.id===r.value).name}))}});
 },
 w_gDoMerge(t){
  const p=wcur(),g=p.groups.find(x=>x.id===t.dataset.id),r=document.querySelector('input[name="gm"]:checked');if(!r)return;
  const tgt=p.groups.find(x=>x.id===r.value);const name=val('gm-name').trim()||tgt.name;const imp=wGroupImpact(p,[g.id]);
  const go=()=>{wMerge(p,g.id,tgt.id,name);tgt.edited=true;wTouch(p);wRecompute(p);wAudit('Groups merged',`${g.name} + ${tgt.name} · ${p.name}`);closeOv();wDoneRender(`Merged into ${name}`)};
  if(imp.pl>0){closeOv();confirmDlg({title:'Merging removes generated plans',body:`${g.name} has ${imp.pl} plan ${imp.pl>1?'rows':'row'} that will be removed. Continue?`,label:'Merge anyway',danger:1,onOk:go})}else go();
 },
 w_gSplit(t){
  const p=wcur(),g=p.groups.find(x=>x.id===t.dataset.id);W.gm=null;const imp=wGroupImpact(p,[g.id]);
  confirmDlg({title:`Split ${esc(g.name)}?`,body:`It becomes two groups. ${imp.cl?`Its ${imp.cl} mapped ${imp.cl>1?'terms':'term'} return to the left-over list so you can place them again`:'It has no mapped terms'}${imp.pl?`, and ${imp.pl} generated plan ${imp.pl>1?'rows are':'row is'} removed`:''}. You can undo nothing here, so check first.`,label:'Split group',danger:imp.cl>0,onOk:()=>{
   wDropTemplates(p,[g.id]);const i=p.groups.findIndex(x=>x.id===g.id);
   const mk=n=>({...g,id:'grp-'+rid(),name:`${g.name} (${n})`,status:g.status,edited:true});const a=mk(1),b=mk(2);
   p.groups.splice(i,1,a,b);p.templates.push(wNewTemplate(a,p.id),wNewTemplate(b,p.id));wTouch(p);wRecompute(p);wAudit('Group split',`${g.name} → 2 groups · ${p.name}`);wDoneRender('Group split in two')}});
 },
 w_gRemove(t){
  const p=wcur(),g=p.groups.find(x=>x.id===t.dataset.id);W.gm=null;const imp=wGroupImpact(p,[g.id]);
  confirmDlg({title:`Remove ${esc(g.name)}?`,body:`${imp.cl?`Its ${imp.cl} mapped ${imp.cl>1?'terms return':'term returns'} to the left-over list`:'It has no mapped terms'}${imp.pl?` and ${imp.pl} generated plan ${imp.pl>1?'rows are':'row is'} removed`:''}. Its template is deleted.`,label:'Remove group',danger:1,onOk:()=>{
   wDropTemplates(p,[g.id]);p.groups=p.groups.filter(x=>x.id!==g.id);wTouch(p);wRecompute(p);wAudit('Group removed',`${g.name} · ${p.name}`);wDoneRender(`${g.name} removed`)}});
 },
 w_gConfirm(){
  const p=wcur();if(!p.groups.some(g=>g.type==='base'))return;
  const flag=p.groups.filter(g=>g.conf!=null&&g.conf<85&&!g.seen);
  const go=()=>{p.groups.forEach(g=>{g.status='confirmed';g.seen=true});p.status='templates';wTouch(p);wRecompute(p);wAudit('Groups confirmed',`${p.name} · ${p.groups.length} groups · templates created`);W.stage=wUnplaced(p).length||p.loReview?'leftovers':'templates';render(true);toast('Groups confirmed. One template per group is ready.')};
  if(flag.length)confirmDlg({title:`${flag.length} group${flag.length>1?'s are':' is'} still flagged`,body:`${esc(flag.map(g=>g.name).join(', '))} ${flag.length>1?'have':'has'} low confidence and ${flag.length>1?'haven\u2019t':'hasn\u2019t'} been reviewed. Confirm anyway?`,label:'Confirm anyway',onOk:go});else go();
 },
 /* unplaced terms */
 w_ev(t){const c=wcur().clauses.find(x=>x.id===t.dataset.id);wEvidence(c)},
 w_assign(t){
  const [p,c]=wOpenCl(t.dataset.id);const s=wSuggest(p,c);const cur=c.groupId&&p.groups.find(g=>g.id===c.groupId);
  const pre=cur?cur.id:(s.g?s.g.id:(/top-?up/i.test(c.text)?'__new':''));const sec=cur?c.componentKey:(s.comp||'');
  openOv('modal',{title:cur?'Change the group':'Assign to a group',sub:'Choose the group this term belongs to.',body:`
   <div class="focusq"><span class="fl">Term to place</span><blockquote>${esc(c.text)}</blockquote><span class="fs">${esc(c.ref)} · page ${c.page}</span></div>
   ${cur?'':s.g?`<div class="sugbox">${ic('spark',16)}<div><b>Suggested: ${esc(s.g.name)}${s.comp?` \u2192 ${clabel(s.comp)}`:''}</b><span>${esc(s.why)}</span></div><button class="btn btn-xs btn-p" data-act="w_useSug" data-g="${s.g.id}" data-k="${s.comp||''}">Use suggestion</button></div>`:`<div class="sugbox none">${ic('info',16)}<div><b>No clear suggestion</b><span>${esc(s.why||'No group clearly fits. Pick one below, or add a new group.')}</span></div></div>`}
   <div class="opt-list" role="radiogroup" aria-label="Group">${p.groups.map(g=>`<label class="opt"><input type="radio" name="as-g" value="${g.id}" ${pre===g.id?'checked':''} data-wc="asgPick"><span><b>${esc(g.name)}</b><span>${GTYPE[g.type]}${s.g&&s.g.id===g.id&&!cur?' · Suggested':''}${cur&&cur.id===g.id?' · Current':''}</span></span></label>`).join('')}
    <label class="opt"><input type="radio" name="as-g" value="__new" ${pre==='__new'?'checked':''} data-wc="asgPick"><span><b>Add a new group</b><span>For terms that belong to a group the parser missed</span></span></label></div>
   <div id="as-new" class="row2" style="margin-top:14px" ${pre==='__new'?'':'hidden'}><div class="fld" style="margin:0"><label for="as-gn">New group name</label><input class="in" id="as-gn" placeholder="e.g. ${esc(S.co.short)} · Top-up" value="${/top-?up/i.test(c.text)?esc(S.co.short)+' · Top-up':''}"></div><div class="fld" style="margin:0"><label for="as-gt">Type</label><select class="in" id="as-gt">${Object.entries(GTYPE).map(([k,l])=>`<option value="${k}" ${k==='topup'?'selected':''}>${l}</option>`).join('')}</select></div></div>
   <div id="as-sec" class="fld" style="margin-top:14px" ${pre?'':'hidden'}><label for="as-c">Plan-form section</label><select class="in" id="as-c"><option value="">Decide later, in Templates</option>${compOptions(sec)}</select><small>Values are built from the wording and never guessed.</small></div>`,
   foot:`<button class="btn" data-act="closeOv">Cancel</button><button class="btn btn-p" id="as-go" data-act="w_doAssign" data-id="${c.id}" ${pre?'':'disabled'}>${cur?'Save':'Assign'}</button>`});
 },
 w_doAssign(t){
  const [p,c]=wOpenCl(t.dataset.id);const r=document.querySelector('input[name="as-g"]:checked');if(!r)return toast('Choose a group.',{err:1});
  let gid=r.value;
  if(gid==='__new'){const n=val('as-gn').trim();if(!n)return toast('Name the new group.',{err:1});const g={id:'grp-'+rid(),type:val('as-gt'),name:n,descriptor:'Added from a left-over term',evidence:`${c.ref}`,conf:null,status:wGroupsOk(p)?'confirmed':'draft',seen:true,edited:true};p.groups.push(g);p.templates.push(wNewTemplate(g,p.id));gid=g.id}
  const comp=val('as-c')||null;wMapClause(p,c.id,gid,comp);const g=p.groups.find(x=>x.id===gid);wAudit('Term assigned',`${c.ref} → ${g.name}${comp?` · ${clabel(comp)}`:''}`);closeOv();wDoneRender(`Assigned to ${g.name}`);
 },
 w_unassign(t){const [p,c]=wOpenCl(t.dataset.id);wMapClause(p,c.id,null,null);wAudit('Term unassigned',c.ref);wDoneRender('Term returned to the left-over list')},
 w_aside(t){
  const [p,c]=wOpenCl(t.dataset.id);
  openOv('modal',{title:'Set this term aside',sub:'Nothing on the plan form holds it. It stays on the proposal and can be restored.',body:`<div class="focusq"><span class="fl">Term to set aside</span><blockquote>${esc(c.text)}</blockquote><span class="fs">${esc(c.ref)} · page ${c.page}</span></div><div class="opt-list" role="radiogroup" aria-label="Reason">${SET_ASIDE.map((r,i)=>`<label class="opt"><input type="radio" name="sa" value="${r.value}" ${i===0?'checked':''}><span><b>${r.label}</b>${r.hint?`<span>${r.hint}</span>`:''}</span></label>`).join('')}</div><div class="fld" style="margin-top:12px"><label for="sa-n">Note <span class="note">(required for \u201cOther\u201d)</span></label><input class="in" id="sa-n" placeholder="Why does this not belong on the plan form?"></div>`,
   foot:`<button class="btn" data-act="closeOv">Cancel</button><button class="btn btn-p" data-act="w_doAside" data-id="${c.id}">Set aside</button>`});
 },
 w_doAside(t){
  const [p,c]=wOpenCl(t.dataset.id);const r=document.querySelector('input[name="sa"]:checked').value,n=val('sa-n').trim();
  if(r==='other'&&!n)return toast('Add a note when the reason is \u201cOther\u201d.',{err:1});
  if(wGuard(p,c))return;wSetAside(p,c.id,r,n);wAudit('Term set aside',`${c.ref} · ${asideLabel(r)}`);closeOv();wDoneRender('Term set aside');
 },
 w_restore(t){const [p,c]=wOpenCl(t.dataset.id);if(wGuard(p,c))return;wRestore(p,c.id);wAudit('Term restored',c.ref);wDoneRender('Term restored')},
 /* templates */
 w_tpl(t){W.ui.tpl=t.dataset.t;W.ui.tri=null;W.ui.autoOff=[];W.ui.edit=null;W.ui.comp=null;W.ui.vid=null;renderPage();renderBar()},
 w_comp(t){W.ui.comp=t.dataset.k;W.ui.edit=null;W.ui.vid=null;renderPage()},
 w_tri(t){W.ui.tri=t.dataset.m;W.ui.comp=null;W.ui.vid=null;W.ui.edit=null;renderPage()},
 w_triOpen(t){const [p,c]=wOpenCl(t.dataset.id);W.ui.tri='all';W.ui.comp=c.componentKey;W.ui.vid=c.variantId===ALL?null:c.variantId;W.ui.edit=null;renderPage()},
 w_acceptAuto(){
  const p=wcur(),tp=p.templates.find(x=>x.id===W.ui.tpl);if(!tp||wTplLocked(p,tp.id))return;const off=W.ui.autoOff||[],list=wAutoList(p,tp).filter(c=>!off.includes(c.id));if(!list.length)return;
  confirmDlg({title:`Accept ${list.length} automatic ${list.length>1?'matches':'match'}?`,body:'These terms were mapped with high confidence and have every required value. You can still reopen any of them from All terms.',label:`Accept ${list.length}`,onOk:()=>{list.forEach(c=>{c.verified=true});wRefreshPlans(p,tp.id);wTouch(p);wRecompute(p);wAudit('Auto-matches accepted',`${list.length} terms · ${p.name}`);W.ui.tri='attn';W.ui.comp=null;W.ui.autoOff=[];if(IDEAL())W.undoFn=()=>{list.forEach(c=>{c.verified=false});wRefreshPlans(p,tp.id);wTouch(p);wRecompute(p);W.ui.tri='auto';render()};render();toast(`${list.length} ${list.length>1?'terms':'term'} accepted. ${wTplComplete(p,tp)?'This template is complete.':'Only the items that need you are left.'}`,IDEAL()?{uundo:1}:{})}});
 },
 w_var(t){W.ui.vid=t.dataset.v;W.ui.edit=null;renderPage()},
 w_addVar(t){
  const p=wcur(),tp=p.templates.find(x=>x.id===W.ui.tpl),k=t.dataset.k;
  openOv('modal',{title:'Add a variant',sub:`A named option inside ${clabel(k)}. Plans pick one variant per section.`,body:`<div class="fld"><label for="av-n">Variant name</label><input class="in" id="av-n" value="${esc(clabel(k))} Variant ${wVars(tp,k).length+1}"><small>Use a business-meaningful name, like SI5Lac or Copay 10% parent.</small></div>`,foot:`<button class="btn" data-act="closeOv">Cancel</button><button class="btn btn-p" data-act="w_doAddVar" data-k="${k}">Add variant</button>`});
 },
 w_doAddVar(t){
  const p=wcur(),tp=p.templates.find(x=>x.id===W.ui.tpl),k=t.dataset.k,n=val('av-n').trim();if(!n)return toast('Name the variant.',{err:1});
  if(wVars(tp,k).some(v=>v.name.toLowerCase()===n.toLowerCase()))return toast('A variant with that name already exists.',{err:1});
  W.ui.vid=wEnsureVariant(tp,k,n,false);wRefreshPlans(p,tp.id);wTouch(p);wAudit('Variant added',`${n} · ${clabel(k)} · ${p.name}`);closeOv();wDoneRender(`Variant ${n} added`);
 },
 w_addBlank(t){const p=wcur(),tp=p.templates.find(x=>x.id===W.ui.tpl),k=t.dataset.k;tp.components[k]=[...wVars(tp,k),{id:`var-${tp.id}-${k}-empty`,name:'Empty Option',isBlank:true,isGroupVariant:false}];wTouch(p);wAudit('Empty Option added',`${clabel(k)} · ${p.name}`);wDoneRender('Plans can now skip this section.')},
 w_delVar(t){
  const p=wcur(),tp=p.templates.find(x=>x.id===W.ui.tpl),k=W.ui.comp,v=wVars(tp,k).find(x=>x.id===t.dataset.v);
  const pinned=p.clauses.filter(c=>c.groupId===tp.groupId&&c.componentKey===k&&c.variantId===v.id);
  if(wVars(tp,k).filter(x=>!x.isBlank).length<2)return toast('A section needs at least one variant.',{err:1});
  if(pinned.length)return toast(`${v.name} holds ${pinned.length} variant-specific ${pinned.length>1?'terms':'term'}. Move or set them aside first.`,{err:1});
  confirmDlg({title:`Remove variant ${esc(v.name)}?`,body:'Plan rows that selected it switch to another variant and return to pending review.',label:'Remove variant',danger:1,onOk:()=>{tp.components[k]=wVars(tp,k).filter(x=>x.id!==v.id);W.ui.vid=null;wRefreshPlans(p,tp.id);wTouch(p);wAudit('Variant removed',`${v.name} · ${p.name}`);wDoneRender('Variant removed')}});
 },
 w_scope(t){
  const [p,c]=wOpenCl(t.dataset.id);if(wGuard(p,c))return;const tp=wTplOf(p,c.groupId);
  if(t.dataset.m==='diff'&&c.variantId===ALL){wMakeDifferent(p,c);wAudit('Term split by variant',`${c.ref}`)}
  else if(t.dataset.m==='shared'&&c.variantId!==ALL){wMakeShared(p,c);wAudit('Term made shared',`${c.ref}`)}
  wRefreshPlans(p,tp.id);wTouch(p);wRecompute(p);render();
 },
 w_verify(t){const [p,c]=wOpenCl(t.dataset.id);if(wGuard(p,c))return;if(c.build&&c.build.missing.length)return toast('Fill the missing values first.',{err:1});c.verified=true;wRefreshPlans(p,wTplOf(p,c.groupId).id);wTouch(p);wRecompute(p);wAudit('Term confirmed',`${c.ref}`);if(c.termId&&c.variantId!==ALL){const sibs=wTierSibs(p,c),i=sibs.indexOf(c),nx=[...sibs.slice(i+1),...sibs.slice(0,i)].find(x=>!wResolved(x));if(nx){W.ui.vid=nx.variantId;W.ui.edit=null}}wAdvanceComp(p,c);if(IDEAL())wV4AfterVerify(p,c);render()},
 w_unverify(t){const [p,c]=wOpenCl(t.dataset.id);if(wGuard(p,c))return;c.verified=false;wRefreshPlans(p,wTplOf(p,c.groupId).id);wTouch(p);wRecompute(p);render()},
 w_prefill(){
  const p=wcur();if(!p||p.status==='packaged')return;
  const snap=JSON.stringify({clauses:p.clauses,templates:p.templates,plans:p.plans,groups:p.groups,status:p.status});
  const n={placed:0,filled:0,aside:0,confirmed:0};
  p.groups.forEach(g=>{
   const tp=wTplOf(p,g.id);if(!tp||wTplLocked(p,tp.id))return;
   wClausesOf(p,g.id).forEach(c=>{
    if(c.na)return;
    if(c.componentKey===null){wMapClause(p,c.id,g.id,wGuessComp(c.text),'operator');n.placed++}
    if(c.build&&c.build.status==='no_attribute'){wSetAside(p,c.id,'other','Prefilled demo: this attribute is not on the plan form yet');n.aside++;return}
    if(c.build&&(c.build.status==='failed'||c.build.status==='partial')){
     const rows=(c.build.rows.length?c.build.rows:[mkRow('row',{})]).map(r=>wDummyRow(c.componentKey,r));
     c.build=finalize(c.componentKey,rows,null);c.prefilled=true;n.filled++;
     if(!wVars(tp,c.componentKey).some(v=>!v.isBlank))wEnsureVariant(tp,c.componentKey,suggestVariant(c.componentKey,c.build,g.type),false);
     if(c.variantId==null)c.variantId=ALL;
    }
    if(c.build&&c.build.missing.length===0){c.verified=true;n.confirmed++}
   });
   wRefreshPlans(p,tp.id);
  });
  W.ui.edit=null;wEditState=null;wTouch(p);wRecompute(p);
  if(!n.confirmed&&!n.placed&&!n.aside){toast('Nothing to prefill. Every term is already confirmed.');render();return}
  W.prefillUndo={pid:p.id,snap};
  wAudit('Template data prefilled',`${p.name} · ${n.confirmed} terms confirmed · ${n.filled} filled with demo values`);
  render();toast(`Prefilled and confirmed ${n.confirmed} ${n.confirmed===1?'term':'terms'} across ${p.templates.length} templates${n.filled?`, ${n.filled} with demo values`:''}.`,{wundo:1});
 },
 w_undoPrefill(t){
  const u=W.prefillUndo;if(!u)return;const p=W.proposals.find(x=>x.id===u.pid);const s=JSON.parse(u.snap);
  p.clauses=s.clauses;p.templates=s.templates;p.plans=s.plans;p.groups=s.groups;p.status=s.status;W.prefillUndo=null;wRecompute(p);
  if(t&&t.closest)t.closest('.toast').remove();render();toast('Prefill undone.');
 },
 w_verifyAll(){
  const p=wcur(),tp=p.templates.find(x=>x.id===W.ui.tpl);if(wTplLocked(p,tp.id))return;
  const cl=wClausesOf(p,tp.groupId).filter(c=>wCase(c)==='review');cl.forEach(c=>{c.verified=true});wRefreshPlans(p,tp.id);wTouch(p);wRecompute(p);wAudit('Terms confirmed',`${cl.length} terms · ${p.name}`);render();toast(`${cl.length} clean ${cl.length===1?'term':'terms'} confirmed. Anything incomplete stays open.`);
 },
 w_edit(t){
  const [p,c]=wOpenCl(t.dataset.id);if(wGuard(p,c))return;
  const rows=c.build&&c.build.rows.length?c.build.rows.map(r=>({...r,values:{...r.values}})):[mkRow('row',{})];
  wEditState={cid:c.id,comp:c.componentKey,rows};W.ui.edit=c.id;render();
  setTimeout(()=>{const e=$id('rowsEd');if(e)e.scrollIntoView({block:'center',behavior:'smooth'})},40);
 },
 w_cancelEdit(){W.ui.edit=null;wEditState=null;render()},
 w_rowAdd(){wEditState.rows=wReadRows();wEditState.rows.push(mkRow('row',{}));$id('rowsEd').innerHTML=wEditHtml({componentKey:wEditState.comp},wEditState.rows)},
 w_rowDel(t){wEditState.rows=wReadRows();wEditState.rows.splice(+t.dataset.i,1);$id('rowsEd').innerHTML=wEditHtml({componentKey:wEditState.comp},wEditState.rows)},
 w_saveEdit(){
  const p=wcur(),c=p.clauses.find(x=>x.id===wEditState.cid);const rows=wReadRows().filter(r=>Object.values(r.values).some(v=>!isEmpty(v)&&v!==false)||true);
  const b=finalize(c.componentKey,rows,null);c.build=b;c.verified=false;c.mappedBy='operator';
  if(!wVars(wTplOf(p,c.groupId),c.componentKey).some(v=>!v.isBlank))wEnsureVariant(wTplOf(p,c.groupId),c.componentKey,suggestVariant(c.componentKey,b,'base'),false);
  if(c.variantId==null)c.variantId=ALL;
  wRefreshPlans(p,wTplOf(p,c.groupId).id);wTouch(p);wRecompute(p);c.prefilled=false;W.ui.edit=null;wEditState=null;wAudit('Values edited',`${c.ref} · ${clabel(c.componentKey)}`);wDoneRender(b.missing.length?'Saved. Some required values are still missing.':'Saved. Verify the values when you are happy.');
 },
 w_remap(t){
  const [p,c]=wOpenCl(t.dataset.id);if(wGuard(p,c))return;
  openOv('modal',{title:'Choose the plan-form section',sub:'The term is rebuilt from its wording. Verification is dropped and open plan rows return to pending.',body:`<div class="focusq"><span class="fl">Term</span><blockquote>${esc(c.text)}</blockquote><span class="fs">${esc(c.ref)} · page ${c.page}</span></div><div class="fld"><label for="rm-c">Section</label><select class="in" id="rm-c"><option value="">Choose a section</option>${compOptions(c.componentKey)}</select></div>`,foot:`<button class="btn" data-act="closeOv">Cancel</button><button class="btn btn-p" data-act="w_doRemap" data-id="${c.id}">Apply</button>`});
 },
 w_doRemap(t){const [p,c]=wOpenCl(t.dataset.id);const k=val('rm-c');if(!k)return toast('Choose a section.',{err:1});const gid=c.groupId;wMapClause(p,c.id,gid,k);W.ui.comp=k;W.ui.vid=null;wAudit('Term remapped',`${c.ref} → ${clabel(k)}`);closeOv();wDoneRender(`Moved to ${clabel(k)}`)},
 w_move(t){const [p,c]=wOpenCl(t.dataset.id);if(wGuard(p,c))return;const k=t.dataset.to;wMapClause(p,c.id,c.groupId,k);W.ui.comp=k;W.ui.vid=null;wAudit('Term remapped',`${c.ref} → ${clabel(k)}`);wDoneRender(`Moved to ${clabel(k)}`)},
 w_reqAttr(t){const [p,c]=wOpenCl(t.dataset.id);c.attributeRequested=true;W.requests.unshift({id:'REQ-0'+W.reqSeq++,partnerId:S.co.id,title:'New attribute: wellness_reward_points',detail:`${c.ref} · ${p.name}`,at:wNow()});wAudit('Attribute requested',`wellness_reward_points · ${p.name}`);render();toast('Request raised. You can set the term aside meanwhile.')},
 /* plans */
 w_ptab(t){W.ui.planTab=t.dataset.t;W.ui.open=null;renderPage()},
 w_open2(t){W.ui.open=W.ui.open===t.dataset.id?null:t.dataset.id;renderPage()},
 w_conf(t){const p=wcur(),x=p.plans.find(q=>q.id===t.dataset.id);if(wPlanValid(p,x).length)return;x.reviewStatus='confirmed';renderPage();renderBar()},
 w_unconf(t){const p=wcur(),x=p.plans.find(q=>q.id===t.dataset.id);x.reviewStatus='pending';renderPage();renderBar()},
 w_confEvery(){const p=wcur();let n=0;p.plans.filter(x=>!(x.generated&&!x.needsGeneration)).forEach(x=>{if(!wPlanValid(p,x).length&&x.reviewStatus!=='confirmed'){x.reviewStatus='confirmed';n++}});renderPage();renderBar();toast(n?`${n} ${n>1?'rows':'row'} confirmed`:'Nothing to confirm. Check names, duplicates and pricing schemas.',n?{}:{err:1})},
 w_confAll(t){const p=wcur();let n=0;p.plans.filter(x=>x.templateId===t.dataset.t&&!(x.generated&&!x.needsGeneration)).forEach(x=>{if(!wPlanValid(p,x).length&&x.reviewStatus!=='confirmed'){x.reviewStatus='confirmed';n++}});renderPage();renderBar();toast(n?`${n} ${n>1?'rows':'row'} confirmed`:'Nothing to confirm. Check names and pricing schemas.')},
 w_addPlan(t){
  const p=wcur(),tp=p.templates.find(x=>x.id===t.dataset.t),rows=p.plans.filter(x=>x.templateId===tp.id);const first=rows[0];
  const sel=first?{...first.selection}:{};const g=wGroupOfTpl(p,tp);const name=`${g.name} · Plan ${rows.length+1}`;
  p.plans.push({id:'plan-'+rid(),templateId:tp.id,name,displayName:name,pricingSchema:'',isDefault:!rows.length,selection:sel,generated:false,active:false,reviewStatus:'pending',needsGeneration:false,values:wPlanValues(p,tp,sel),agent:false,impact:[]});wRecompute(p);renderPage();renderBar();
 },
 w_delPlan(t){const p=wcur(),x=p.plans.find(q=>q.id===t.dataset.id);confirmDlg({title:`Delete ${esc(x.name)}?`,body:'This plan row is removed before generation. Nothing downstream is affected.',label:'Delete row',danger:1,onOk:()=>{p.plans=p.plans.filter(q=>q.id!==x.id);const rest=p.plans.filter(q=>q.templateId===x.templateId);if(x.isDefault&&rest[0])rest[0].isDefault=true;wRecompute(p);render()}})},
 w_default(t){const p=wcur(),x=p.plans.find(q=>q.id===t.dataset.id);p.plans.filter(q=>q.templateId===x.templateId).forEach(q=>{if(!(q.generated&&!q.needsGeneration)&&(q.isDefault||q.id===x.id)){q.reviewStatus='pending'}q.isDefault=q.id===x.id});renderPage();renderBar()},
 w_priceAll(t){const p=wcur();const i=$id('wprice-'+t.dataset.t);const v=(i?i.value:'').trim();if(!v)return toast('Enter a pricing schema first.',{err:1});p.plans.filter(x=>x.templateId===t.dataset.t&&!(x.generated&&!x.needsGeneration)).forEach(x=>{x.pricingSchema=v;x.reviewStatus='pending'});renderPage();renderBar()},
 w_generateAll(){
  const p=wcur(),rows=p.plans.filter(x=>!(x.generated&&!x.needsGeneration));if(!rows.length)return;
  const dlg=IDEAL()?(o=>{pendingConfirm=o.onOk;openOv('modal',{title:o.title,body:`<p style="margin:0 0 12px;color:var(--ink-2)">${o.body}</p><ul class="locklist"><li>${rows.length} ${rows.length>1?'plan rows':'plan row'} become active and read-only</li><li>${p.templates.length} ${p.templates.length>1?'templates and groups':'template and group'} become view-only</li><li>Only a revised PF can reopen them</li></ul><div class="fld" style="margin-top:14px"><label for="gtype">Type GENERATE to confirm</label><input class="in" id="gtype" autocomplete="off" placeholder="GENERATE"></div>`,foot:`<button class="btn" data-act="closeOv">Cancel</button><button class="btn btn-p" id="gok" data-act="confirmOk" disabled>${o.label}</button>`})}):confirmDlg;
  dlg({title:`Generate ${rows.length} ${rows.length>1?'plans':'plan'}?`,body:'Generation is final for this version. The rows become active and read-only, and their templates and groups become view-only. Only a revised PF can reopen them.',label:'Generate plans',onOk:()=>{
   rows.forEach(x=>{x.generated=true;x.needsGeneration=false;x.active=true;x.generatedVersion=p.version;x.generatedAt=wNow();x.impact=[];x.reviewStatus='confirmed';x.agent=false});p.templates.forEach(t=>{t.reopened=false});
   wTouch(p);wRecompute(p);wAudit('Plans generated',`${p.name} · ${rows.length} ${rows.length>1?'rows':'row'} · v${p.version}`);if(p.approval){wAudit('Approved',`${p.name} · approved by ${W.role==='admin'?'Administrator':'Operator'}`);p.approval=null}if(typeof wNotify==='function'&&V3X())wNotify('ok',`${p.name}: plans generated`,p.id);W.view='proposals';W.pid=null;W.hist=[];render(true);toast(`${esc(p.name)}: ${rows.length} ${rows.length>1?'plans':'plan'} generated`,{wopen:p.id})}});
 },
 w_generate(t){
  const p=wcur(),tp=p.templates.find(x=>x.id===t.dataset.t);const rows=p.plans.filter(x=>x.templateId===tp.id&&!(x.generated&&!x.needsGeneration));
  confirmDlg({title:`Generate ${rows.length} plan ${rows.length>1?'rows':'row'}?`,body:'Generation is an ingestion boundary, not a draft action. The rows become active, versioned and read-only, and the template and its group become view-only. Only a revised PF can reopen affected rows.',label:'Generate plans',onOk:()=>{
   rows.forEach(x=>{x.generated=true;x.needsGeneration=false;x.active=true;x.generatedVersion=p.version;x.generatedAt=wNow();x.impact=[];x.reviewStatus='confirmed';x.agent=false});tp.reopened=false;
   wTouch(p);wRecompute(p);wAudit('Plans generated',`${p.name} · ${rows.length} ${rows.length>1?'rows':'row'} · v${p.version}`);if(p.status==='plans_active'){W.view='proposals';W.pid=null;W.hist=[];render(true);toast(`${esc(p.name)}: all plans generated. Ready to package.`,{wopen:p.id})}else{render();toast('Plans generated for this template.')}}});
 },
 /* packages */
 w_compose(){
  const k=W.pkg,ref=new Set(W.packages.flatMap(x=>x.proposalIds));
  const ok=wProps().filter(p=>p.status==='plans_active'&&!ref.has(p.id)&&!wPending(p).length).map(p=>p.id);
  if(!k.ack){k.err='The document-completeness gate must pass before composing a package.';return renderPage()}
  if(!k.sel.length){k.err='Select at least one proposal.';return renderPage()}
  if(!k.sel.every(id=>ok.includes(id))){k.err='Every proposal in a package must belong to this partner and have active plans.';k.sel=k.sel.filter(id=>ok.includes(id));return renderPage()}
  const n=W.packages.filter(x=>x.partnerId===S.co.id).length;const name=k.name.trim()||`${S.co.short} · Package ${n+1}`;
  W.packages.push({id:'pkg-'+rid(),partnerId:S.co.id,name,proposalIds:[...k.sel],documentsConfirmed:true,documentsConfirmedBy:'Riya Kulkarni',validated:false,published:false,publishedAt:null});
  wAudit('Package composed',`${name} · ${k.sel.length} proposals · completeness confirmed by Riya Kulkarni`);W.pkg={ack:false,name:'',sel:[],err:''};render();toast('Package composed. Validate it next.');
 },
 w_validate(t){const k=W.packages.find(x=>x.id===t.dataset.id);k.validated=true;wAudit('Package validated',k.name);render();toast('Package validated. Publishing is a separate step.')},
 w_publish(t){
  const k=W.packages.find(x=>x.id===t.dataset.id);
  confirmDlg({title:`Publish ${esc(k.name)}?`,body:'Publishing makes the package and its proposals immutable. A packaged proposal cannot take another PF revision.',label:'Publish package',onOk:()=>{k.published=true;k.publishedAt=wNow();W.proposals.forEach(p=>{if(k.proposalIds.includes(p.id))p.status='packaged'});wAudit('Package published',`${k.name} · ${k.proposalIds.length} proposals now live`);render();toast('Package published.')}});
 },
 /* partner variables */
 w_pvEv(t){const pt=W.partners[S.co.id],v=pt.vars.find(x=>x.key===t.dataset.k);openOv('modal',{title:v.label,sub:'Evidence across the partner\u2019s proposals',body:`<div class="paper"><div class="ph2"><span>${esc(v.evidence)}</span></div><p>Extracted value: <mark>${esc(v.extracted)}</mark></p></div>`,foot:`<button class="btn btn-p" data-act="closeOv">Done</button>`})},
 w_pvResolve(){
  const pt=W.partners[S.co.id],v=pt.vars.find(x=>!x.aligned);if(!v)return;
  if(!W.pv.value)return toast('Choose the confirmed value.',{err:1});if((W.pv.reason||'').trim().length<8)return toast('Add a reason of at least a few words.',{err:1});
  W.corrections.unshift({id:'c'+rid(),scope:`partner-variable:${v.key}`,original:v.extracted,corrected:W.pv.value,reason:W.pv.reason.trim(),note:'',evidence:v.evidence,user:'Riya Kulkarni',at:wNow()});
  v.confirmed=W.pv.value;v.aligned=true;wAudit('Partner variable resolved',`${v.label}: ${v.extracted} → ${W.pv.value}`);W.pv={value:'',reason:''};render();toast('Conflict resolved and recorded.');
 },
 w_freeze(){
  if(W.role!=='admin')return toast('Only an administrator can freeze.',{err:1});
  confirmDlg({title:'Freeze partner variables?',body:`This is a point of no return for ${esc(S.co.name)}. After the freeze, only an administrator can change them, and changes are audit-only.`,label:'Freeze variables',danger:1,onOk:()=>{const pt=W.partners[S.co.id];pt.frozen=true;pt.by='Admin · Riya Kulkarni (demo)';pt.at=wNow();wAudit('Partner variables frozen',S.co.name);render();toast('Variables frozen.')}});
 }
});
function wGuessComp(t){
 if(/pre-?hospitali/i.test(t))return 'pre_post_hospitalisation';if(/deductible|top-?up/i.test(t))return 'deductibles';if(/\bTPA\b/.test(t))return 'tpa';
 if(/ambulance/i.test(t))return 'ambulance';if(/maternity/i.test(t))return 'maternity';if(/room rent/i.test(t))return 'room_rent_icu';
 if(/waiting/i.test(t))return 'waiting_periods';if(/co-?pay/i.test(t))return 'copays';return 'sub_limits';
}
const DUMMY_NUM={sub_limit_value:3000,sum_insured:300000,corporate_buffer_value:500000,copay_value:10,min_age:18,max_age:65,waiting_period_days:30,pre_days:30,post_days:60,max_count:2};
function wDummyRow(comp,row){
 const v={...row.values};
 (REQ[comp]||[]).forEach(k=>{
  if(!isEmpty(v[k]))return;const a=ATTR[k];if(!a)return;
  if(a.t==='num')v[k]=DUMMY_NUM[k]!=null?DUMMY_NUM[k]:1;else if(a.t==='single')v[k]=a.o[0];else if(a.t==='multi')v[k]=[a.o[0]];else if(a.t==='bool')v[k]=false;
 });
 return {...row,values:v};
}
const WCH={
 asgPick(){const v=document.querySelector('input[name="as-g"]:checked');const nw=$id('as-new'),sc=$id('as-sec'),b=$id('as-go');if(nw)nw.hidden=!(v&&v.value==='__new');if(sc)sc.hidden=!v;if(b)b.disabled=!v},
 autoPick(el){const o=W.ui.autoOff=W.ui.autoOff||[];const i=o.indexOf(el.dataset.id);if(el.checked&&i>-1)o.splice(i,1);else if(!el.checked&&i<0)o.push(el.dataset.id);renderPage()},
 rowSel(el){const s=W.ui.sel=W.ui.sel||[],i=s.indexOf(el.dataset.id);if(el.checked&&i<0)s.push(el.dataset.id);else if(!el.checked&&i>-1)s.splice(i,1);renderPage()},
 rowSelAll(el){const p=wcur(),ids=p.plans.filter(x=>x.templateId===el.dataset.t&&!(x.generated&&!x.needsGeneration)).map(x=>x.id);const s=(W.ui.sel||[]).filter(id=>!ids.includes(id));W.ui.sel=el.checked?[...s,...ids]:s;renderPage()},
 planField(el){const p=wcur(),x=p.plans.find(q=>q.id===el.dataset.id);x[el.dataset.f]=el.value;x.reviewStatus='pending';renderPage();renderBar()},
 planSel(el){const p=wcur(),x=p.plans.find(q=>q.id===el.dataset.id),tp=p.templates.find(q=>q.id===x.templateId);x.selection[el.dataset.k]=el.value;x.values=wPlanValues(p,tp,x.selection);x.reviewStatus='pending';renderPage();renderBar()},
 pricing(el){W.ui.pricing=el.value},
 ack(el){W.pkg.ack=el.checked;W.pkg.err='';renderPage()},
 pkgSel(el){const id=el.dataset.id;W.pkg.sel=el.checked?[...W.pkg.sel,id]:W.pkg.sel.filter(x=>x!==id);W.pkg.err='';renderPage()},
 pvPick(el){W.pv.value=el.value},
 filePolicy(el){const f=W.intake.files.find(x=>x.key===el.dataset.k);f.policyId=el.value;refreshIntake()}
};
const WIN={pkgName(el){W.pkg.name=el.value},pvReason(el){W.pv.reason=el.value},mkName(el){W.intake.mkName=el.value}};
