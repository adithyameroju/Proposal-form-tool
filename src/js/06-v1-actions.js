/* ================= actions ================= */
const reconcile=p=>{p.left.forEach(l=>{if(l.res&&(l.res.type==='assigned'||l.res.type==='created')&&!p.g.find(x=>x.id===l.res.gid))l.res=null})};
const ACT={
 demo(t,e){e.preventDefault();toast('This link is outside the prototype.')},
 toggleSb(){S.sb=!S.sb;renderSb()},closeSb(){S.sb=false;renderSb()},
 toggleCol(){S.col=!S.col;try{localStorage.setItem('sbc',S.col?'1':'0')}catch(e){}renderSb()},
 toggleCo(){S.menu=S.menu==='co'?null:'co';renderTop()},
 pickCo(t){const c=COMPANIES.find(x=>x.id===t.dataset.id);S.menu=null;if(c.id===S.co.id){renderTop();return}
  if(S.view==='proposal'){const p=cur();if(p.status!=='completed'&&p.status!=='parsing')mark(p)}
  S.co=c;S.view='overview';W.view='overview';W.pid=null;W.pkg={ack:false,name:'',sel:[],err:''};S.sb=false;render(true);toast(`Switched to ${esc(c.name)}. Your progress was saved.`)},
 toOverview(t,e){e&&e.preventDefault&&e.preventDefault();if(VER!=='v1'){W.view='overview';W.pid=null;W.gm=null;S.sb=false;render(true);return}if(S.view==='proposal'){const p=cur();if(p&&!['completed','parsing','failed'].includes(p.status))mark(p)}S.view='overview';S.sb=false;render(true)},
 tab(t){S.tab=t.dataset.t;renderPage()},
 /* new proposal */
 newProposal(){if(VER!=='v1'){ACT.w_intake();return}S.nf=blankNf();S.nfid=null;openIntake()},
 toProposals(t,e){e&&e.preventDefault&&e.preventDefault();if(VER!=='v1'){W.view='proposals';W.pid=null;W.gm=null;S.sb=false;render(true);return}if(S.view==='proposal'){const p=cur();if(p&&!['completed','parsing','failed'].includes(p.status))mark(p)}S.view='proposals';S.sb=false;render(true)},
 startSample(t){S.nf=blankNf();S.nfid=null;openIntake();ACT.useSample(t)},
 useSample(t){const s=SAMPLES[+t.dataset.i];S.nf.file={name:s.name,size:'2.4 MB',mode:s.mode};S.nf.err=null;if(!S.nf.master)S.nf.master='MP-2041';refreshIntake()},
 clearFile(){S.nf.file=null;S.nf.err=null;refreshIntake()},
 saveDraft(){
  const n=S.nf;if(!n.name.trim()&&!n.file)return toast('Add a name or a file first.',{err:1});
  const name=n.name.trim()||n.file.name.replace(/\.pdf$/i,'');
  const m=n.master&&n.master!=='new'?S.masters.find(x=>x.id===n.master):null;
  const obj={name,file:n.file&&!n.err?n.file.name:null,master:m?`${m.id} · ${m.name}`:null,status:'draft',updated:'Just now',draft:{file:n.err?null:n.file,master:n.master,newName:n.newName,insurer:n.insurer}};
  if(S.nfid){Object.assign(S.props.find(x=>x.id===S.nfid),obj)}else S.props.unshift({id:'PR-0'+S.seq++,...obj});
  closeOv();S.nf=blankNf();S.nfid=null;S.tab='draft';render();toast('Draft saved');
 },
 discardDraft(t){const p=S.props.find(x=>x.id===t.dataset.id);confirmDlg({title:`Discard ${esc(p.name)}?`,body:'This draft is deleted. Parsed and submitted proposals are never affected.',label:'Discard draft',danger:1,onOk:()=>{S.props=S.props.filter(x=>x.id!==p.id);render();toast('Draft discarded')}})},
 startParse(){
  if(!nfReady())return;const n=S.nf;let m;
  if(n.master==='new'){m={id:'MP-'+(2300+S.masters.length-MASTERS.length+1),name:n.newName.trim(),insurer:n.insurer,status:'Active',maternity:true,matLimit:75000};S.masters.push(m)}
  else m=S.masters.find(x=>x.id===n.master);
  const name=n.name.trim()||n.file.name.replace(/\.pdf$/i,'');
  const base={name,file:n.file.name,master:`${m.id} · ${m.name}`,masterObj:m,mode:n.file.mode||'clean',status:'parsing',step:0,max:0,pct:0,t0:Date.now(),updated:'Just now',g:null,draft:null,fail:false};
  let p;
  if(S.nfid){p=S.props.find(x=>x.id===S.nfid);Object.assign(p,base)}else{p={id:'PR-0'+S.seq++,...base};S.props.unshift(p)}
  closeOv();S.nfid=null;S.nf=blankNf();S.from=S.view;S.view='proposal';S.pid=p.id;render(true);ensureTimer();
 },
 /* open */
 openProp(t){
  const p=S.props.find(x=>x.id===t.dataset.id);if(!p)return;
  if(p.status==='draft'){S.nf={name:p.name,file:p.draft&&p.draft.file||null,master:p.draft&&p.draft.master||'',newName:p.draft&&p.draft.newName||'',insurer:p.draft&&p.draft.insurer||'Northstar General',err:null};S.nfid=p.id;openIntake();return}
  if(p.status==='failed'&&!p.retried&&p.seedRetry!==false){}
  if(p.status!=='parsing'&&p.status!=='failed')hydrate(p);
  S.from=S.view==='proposals'?'proposals':'overview';S.view='proposal';S.pid=p.id;render(true);
 },
 back(){
  if(S.intake){if(VER!=='v1'&&W.intake&&W.intake.files.length&&!W.intake.reviseId){confirmDlg({title:`Leave without starting?`,body:`${W.intake.files.length} attached ${W.intake.files.length>1?'files are':'file is'} not saved yet. Use Save as draft to keep ${W.intake.files.length>1?'them':'it'}, or discard to leave.`,label:'Discard files',danger:1,onOk:()=>closeOv()});return}closeOv();return}
  const p=cur();if(p.status==='parsing'||p.status==='failed'||p.step===0||p.step>=4){S.from==='overview'?ACT.toOverview():ACT.toProposals();return}
  p.step--;render(true);
 },
 stageGo(t){const p=cur();const i=+t.dataset.i;if(i>p.max)return;p.step=i;mark(p);render(true)},
 saveExit(){const p=cur();mark(p);S.view='overview';render(true);toast('Progress saved. Resume it from your history.')},
 cancelParse(){confirmDlg({title:'Cancel parsing?',body:'The upload is discarded and nothing is saved.',label:'Cancel parsing',danger:1,onOk:()=>{S.props=S.props.filter(x=>x.id!==S.pid);S.view='overview';render(true);toast('Parsing cancelled')}})},
 retryParse(){const p=cur();p.status='parsing';p.pct=0;p.t0=Date.now();p.step=0;render(true);ensureTimer()},
 uploadAnother(){const p=cur();S.nf={name:p.name,file:null,master:p.masterObj&&p.masterObj.status!=='Expired'&&S.masters.includes(p.masterObj)?p.masterObj.id:'',newName:'',insurer:'Northstar General',err:null};
  S.props=S.props.filter(x=>x.id!==p.id);S.nfid=null;S.view='proposals';render(true);openIntake()},
 raiseDoc(){openRequest('doc')},
 reviewGroups(){const p=cur();p.step=1;p.max=Math.max(p.max,1);mark(p);render(true)},
 /* groups */
 evidence(t){const g=cur().g.find(x=>x.id===t.dataset.id);showGEv(g,+t.dataset.p)},
 evTab(t){const g=cur().g.find(x=>x.id===t.dataset.id);showGEv(g,+t.dataset.p)},
 toggleGm(t){S.gm=S.gm===t.dataset.id?null:t.dataset.id;S.lm=null;renderPage()},
 toggleLm(t){S.lm=S.lm===t.dataset.id?null:t.dataset.id;S.gm=null;renderPage()},
 addGroup(){openOv('modal',{title:'Add a group',sub:'Use this when the proposal has a group the parser missed.',body:groupForm({name:'',type:'MEMBER',rel:'Siblings'},true),foot:`<button class="btn" data-act="closeOv">Cancel</button><button class="btn btn-p" data-act="saveAdd">Add group</button>`})},
 saveAdd(){const name=val('f-name').trim();if(!name)return toast('Give the group a name.',{err:1});
  const p=cur();p.g.push(G({name,type:readType(),conf:null,manual:true,rel:val('f-rel'),segs:[]}));mark(p);closeOv();render();toast(`${esc(name)} added`)},
 editG(t){const g=cur().g.find(x=>x.id===t.dataset.id);S.gm=null;openOv('modal',{title:'Edit group',sub:esc(g.name),body:`<div class="ev-strip">${pill(g)}<span>${pgs(g.pages)}</span></div>${groupForm(g,false)}`,foot:`<button class="btn" data-act="closeOv">Cancel</button><button class="btn btn-p" data-act="saveEdit" data-id="${g.id}">Save changes</button>`})},
 saveEdit(t){const p=cur();const g=p.g.find(x=>x.id===t.dataset.id);const name=val('f-name').trim();if(!name)return toast('Give the group a name.',{err:1});
  Object.assign(g,{name,type:readType(),rel:val('f-rel'),si:+val('f-si')||0,members:val('f-mem').trim(),ageMin:+val('f-amin')||0,ageMax:+val('f-amax')||0,mat:$id('f-mat').checked,edited:true,seen:true});
  mark(p);closeOv();render();toast('Changes saved')},
 mergeG(t){S.gm=null;const p=cur();const g=p.g.find(x=>x.id===t.dataset.id);const o=p.g.filter(x=>x.id!==g.id);
  openOv('modal',{title:'Merge group',sub:`Merge \u201c${esc(g.name)}\u201d into another group.`,
   body:`<div class="opt-list" role="radiogroup" aria-label="Merge into">${o.map((x,i)=>`<label class="opt"><input type="radio" name="mg" value="${x.id}" ${i===0?'checked':''}><span><b>${esc(x.name)}</b><span>${x.type==='BASE'?'Base':'Member'} · ${pgs(x.pages)}</span></span></label>`).join('')}</div>
    <div class="fld" style="margin-top:16px"><label for="mg-name">Name of the merged group</label><input class="in" id="mg-name" value="${esc(o[0].name)}"><small>Source evidence from both groups is kept. The merged group takes the lower confidence.</small></div>`,
   foot:`<button class="btn" data-act="closeOv">Cancel</button><button class="btn btn-p" data-act="doMerge" data-id="${g.id}">Merge groups</button>`,
   mount(){document.querySelectorAll('input[name="mg"]').forEach(r=>r.addEventListener('change',()=>{$id('mg-name').value=p.g.find(x=>x.id===r.value).name}))}})},
 doMerge(t){const p=cur();const g=p.g.find(x=>x.id===t.dataset.id);const r=document.querySelector('input[name="mg"]:checked');if(!r)return;
  const o=p.g.find(x=>x.id===r.value);const name=val('mg-name').trim()||o.name;
  o.name=name;o.pages=[...new Set([...o.pages,...g.pages])].sort((a,b)=>a-b);o.segs=[...new Set([...o.segs,...g.segs])];o.ev={...g.ev,...o.ev};o.extras=[...o.extras,...g.extras];
  o.conf=o.conf!=null&&g.conf!=null?Math.min(o.conf,g.conf):(o.conf??g.conf);if(g.type==='BASE')o.type='BASE';o.edited=true;o.seen=true;
  p.left.forEach(l=>{if(l.res&&l.res.gid===g.id)l.res.gid=o.id});
  p.g=p.g.filter(x=>x.id!==g.id);reconcile(p);mark(p);closeOv();render();toast(`Merged into ${esc(name)}`)},
 splitG(t){S.gm=null;const g=cur().g.find(x=>x.id===t.dataset.id);const pre=g.name.includes(' · ')?g.name.split(' · ')[0]+' · ':'';
  openOv('modal',{title:'Split group',sub:`We found these sub-groups inside \u201c${esc(g.name)}\u201d.`,
   body:`<div class="opt-list">${g.segs.map(s=>`<label class="opt"><input type="checkbox" name="sp" value="${esc(s)}" checked><span><b>${esc(pre+s)}</b><span>Becomes its own ${g.type==='BASE'?'base':'member'} group</span></span></label>`).join('')}</div><p class="note" style="margin-top:14px">Select at least two. Each new group keeps the source evidence.</p>`,
   foot:`<button class="btn" data-act="closeOv">Cancel</button><button class="btn btn-p" data-act="doSplit" data-id="${g.id}">Split group</button>`})},
 doSplit(t){const p=cur();const g=p.g.find(x=>x.id===t.dataset.id);const pre=g.name.includes(' · ')?g.name.split(' · ')[0]+' · ':'';
  const sel=[...document.querySelectorAll('input[name="sp"]:checked')].map(x=>x.value);if(sel.length<2)return toast('Select at least two sub-groups to split.',{err:1});
  const i=p.g.findIndex(x=>x.id===g.id);
  const parts=sel.map((s,k)=>G({...g,id:'g'+rid(),name:pre+s,segs:[s],pages:[...g.pages],conf:Math.max(40,(g.conf??60)-8),edited:true,seen:false,members:'',extras:k===0?g.extras:[]}));
  p.left.forEach(l=>{if(l.res&&l.res.gid===g.id)l.res.gid=parts[0].id});
  p.g.splice(i,1,...parts);reconcile(p);mark(p);closeOv();render();toast(`Split into ${parts.length} groups`)},
 removeG(t){S.gm=null;const p=cur();const g=p.g.find(x=>x.id===t.dataset.id);
  confirmDlg({title:`Remove ${esc(g.name)}?`,body:'The group is taken out of this proposal. Any left-over terms assigned to it come back to be placed again. You can undo this right after.',label:'Remove group',danger:1,onOk:()=>{
   const i=p.g.findIndex(x=>x.id===g.id);S.removed={pid:p.id,g,i};p.g.splice(i,1);reconcile(p);mark(p);render();toast(`${esc(g.name)} removed`,{undo:1})}})},
 undoRemove(t){const r=S.removed;if(!r)return;const p=S.props.find(x=>x.id===r.pid);p.g.splice(r.i,0,r.g);S.removed=null;t.closest('.toast').remove();render()},
 /* leftover */
 assignL(t){const p=cur();const l=p.left.find(x=>x.id===t.dataset.id);const sg=l.sug&&p.g.find(x=>x.rel===l.sug.rel);
  if(!p.g.length)return toast('There are no groups to assign to. Create a group instead.',{err:1});
  openOv('modal',{title:'Assign to a group',sub:`Attach \u201c${esc(l.title)}\u201d to an existing group.`,
   body:`<div class="opt-list" role="radiogroup" aria-label="Group">${p.g.map(x=>`<label class="opt"><input type="radio" name="as" value="${x.id}" ${sg&&sg.id===x.id?'checked':''}><span><b>${esc(x.name)}</b><span>${x.type==='BASE'?'Base':'Member'}${sg&&sg.id===x.id?` · Suggested (${l.sug.score}%)`:''}</span></span></label>`).join('')}</div>`,
   foot:`<button class="btn" data-act="closeOv">Cancel</button><button class="btn btn-p" data-act="doAssign" data-id="${l.id}">Assign</button>`})},
 doAssign(t){const p=cur();const l=p.left.find(x=>x.id===t.dataset.id);const r=document.querySelector('input[name="as"]:checked');if(!r)return toast('Choose a group.',{err:1});
  const g=p.g.find(x=>x.id===r.value);g.extras.push(l.title);l.res={type:'assigned',gid:g.id};mark(p);closeOv();render();toast(`Assigned to ${esc(g.name)}`)},
 createL(t){const p=cur();const l=p.left.find(x=>x.id===t.dataset.id);
  openOv('modal',{title:'Create a group',sub:`Turn \u201c${esc(l.title)}\u201d into its own group.`,body:groupForm({name:l.gname,type:'MEMBER',rel:l.rel},true),foot:`<button class="btn" data-act="closeOv">Cancel</button><button class="btn btn-p" data-act="doCreateL" data-id="${l.id}">Create group</button>`})},
 doCreateL(t){const p=cur();const l=p.left.find(x=>x.id===t.dataset.id);const name=val('f-name').trim();if(!name)return toast('Give the group a name.',{err:1});
  const ev={};l.pages.forEach(pg=>ev[pg]=`${l.title}. {${l.text}}`);
  const g=G({name,type:readType(),conf:null,manual:true,rel:val('f-rel'),pages:[...l.pages],ev});p.g.push(g);l.res={type:'created',gid:g.id};mark(p);closeOv();render();toast(`${esc(name)} created`)},
 ignoreL(t){S.lm=null;const p=cur();const l=p.left.find(x=>x.id===t.dataset.id);
  confirmDlg({title:'Ignore this term?',body:`\u201c${esc(l.title)}\u201d won\u2019t be part of any group. You can undo this later in this step.`,label:'Ignore term',onOk:()=>{l.res={type:'ignored'};mark(p);render();toast('Term ignored')}})},
 requestL(t){S.lm=null;renderPage();openRequest('left',t.dataset.id)},
 undoL(t){const p=cur();const l=p.left.find(x=>x.id===t.dataset.id);
  if(l.res&&l.res.type==='assigned'){const g=p.g.find(x=>x.id===l.res.gid);if(g){const i=g.extras.indexOf(l.title);if(i>-1)g.extras.splice(i,1)}}
  if(l.res&&l.res.type==='created'){p.g=p.g.filter(x=>x.id!==l.res.gid)}
  if(l.res&&l.res.type==='request'){p.reqs=p.reqs.filter(r=>r.id!==l.res.req)}
  l.res=null;mark(p);render()},
 confirmGroups(){
  const p=cur();if(!p.g.some(x=>x.type==='BASE')||p.left.some(l=>!l.res))return;
  const att=p.g.filter(needsAtt);
  const go=()=>{p.step=2;p.max=Math.max(p.max,2);mark(p);render(true);toast('Groups confirmed')};
  if(att.length)confirmDlg({title:`${att.length} group${att.length>1?'s are':' is'} still flagged`,body:`${esc(att.map(x=>x.name).join(', '))} ${att.length>1?'have':'has'} low confidence and ${att.length>1?'haven\u2019t':'hasn\u2019t'} been reviewed. Confirm anyway?`,label:'Confirm anyway',onOk:go});
  else go();
 },
 /* variables */
 vtab(t){S.vtab=t.dataset.t;renderPage()},
 confirmVar(t){const p=cur();const v=p.vars.find(x=>x.id===t.dataset.id);if(v.conflict)return;v.state='confirmed';mark(p);render()},
 confirmAll(){const p=cur();let n=0;p.vars.forEach(v=>{if(v.state==='pending'&&!v.conflict&&v.conf>=90){v.state='confirmed';n++}});mark(p);render();toast(`${n} variable${n!==1?'s':''} confirmed`)},
 editVar(t){varDrawer(cur().vars.find(x=>x.id===t.dataset.id),'edit')},
 mapVar(t){varDrawer(cur().vars.find(x=>x.id===t.dataset.id),'map')},
 manualVar(t){varDrawer(cur().vars.find(x=>x.id===t.dataset.id),'manual')},
 saveVar(t){
  const p=cur();const v=p.vars.find(x=>x.id===t.dataset.id);const mode=t.dataset.mode;const key=val('vd-key'),value=val('vd-val').trim();
  if(mode==='edit'&&!key){if(isReq(v))return toast('This variable is required. Pick a variable or add a value.',{err:1});v.prev=v.state;v.state='ignored';v.key=null;mark(p);closeOv();render();toast('Term left out');return}
  if(!key)return toast('Choose a variable.',{err:1});
  if(mode==='manual'&&!value)return toast('Enter a value.',{err:1});
  const dup=p.vars.find(x=>x.id!==v.id&&x.key===key&&['pending','confirmed','edited','manual'].includes(x.state));
  if(dup)return toast(`${esc(CATD[key].l)} is already mapped to \u201c${esc(dup.label)}\u201d. Pick another variable or change that row first.`,{err:1});
  v.key=key;if(mode!=='map'&&value)v.val=value;v.state=mode==='manual'?'manual':'edited';v.how=mode==='map'?'map':mode;v.conflict=null;v.miss=false;v.note=null;
  mark(p);closeOv();render();toast('Mapping saved')},
 useProposal(t){const p=cur();const v=p.vars.find(x=>x.id===t.dataset.id);v.state='confirmed';v.note='Overrides the master policy';mark(p);render();toast('Using the proposal value')},
 keepMaster(t){const p=cur();const v=p.vars.find(x=>x.id===t.dataset.id);v.val=v.conflict.mv;v.state='edited';v.how='edit';v.note='Kept the master policy value';v.conflict=null;mark(p);render();toast('Kept the master policy value')},
 ignoreVar(t){const p=cur();const v=p.vars.find(x=>x.id===t.dataset.id);if(isReq(v))return toast('This variable is required. Add a value or raise a request.',{err:1});v.prev='unmapped';v.state='ignored';mark(p);render()},
 undoVar(t){const p=cur();const v=p.vars.find(x=>x.id===t.dataset.id);v.state=v.prev||(v.key?'pending':'unmapped');mark(p);render()},
 requestV(t){openRequest('var',t.dataset.id)},
 submitReq(t){
  const p=cur();const kind=t.dataset.kind,id=t.dataset.id;const name=val('rq-n').trim();if(!name)return toast('Add a name for the request.',{err:1});
  const req={id:'REQ-0'+S.reqSeq++,title:name,type:(document.querySelector('input[name="rq-t"]:checked')||{}).value,kind};
  p.reqs.push(req);
  if(kind==='var'){const v=p.vars.find(x=>x.id===id);v.state='requested';v.rq=req.id}
  else if(kind==='left'){const l=p.left.find(x=>x.id===id);l.res={type:'request',req:req.id}}
  mark(p);closeOv();render();toast(`Request ${req.id} raised. We\u2019ll let you know when it\u2019s picked up.`)},
 varEv(t){const p=cur();const v=p.vars.find(x=>x.id===t.dataset.id);showEvidence('Source evidence',v.label,[v.page],v.page,v.ev,'evTab','')},
 toReview(){const p=cur();const s=vstat(p);if(s.r<s.t)return;p.step=3;p.max=Math.max(p.max,3);mark(p);render(true)},
 submit(){const p=cur();p.status='completed';p.step=4;p.max=4;p.updated='Just now';render(true);toast('Proposal submitted')},
 closeOv(){closeOv()},
 confirmOk(){const f=pendingConfirm;pendingConfirm=null;closeOv();f&&f()}
};
function setFile(f){
 const mb=f.size/1048576;let err=null;
 if(!/\.pdf$/i.test(f.name)&&f.type!=='application/pdf')err={t:'Only PDF files are supported.',d:'Convert the proposal to PDF and try again.'};
 else if(mb>25)err={t:'This file is larger than 25 MB.',d:'Compress it or split it into parts, then upload again.'};
 const mode=/corrupt|broken|fail/i.test(f.name)?'fail':/scan/i.test(f.name)?'partial':'clean';
 S.nf.file=err?null:{name:f.name,size:mb.toFixed(1)+' MB',mode};S.nf.err=err;
 if(!err&&!S.nf.master)S.nf.master='MP-2041';
 refreshIntake();
}
function startIntakeWithFile(f){S.nf=blankNf();S.nfid=null;openIntake();setFile(f)}
