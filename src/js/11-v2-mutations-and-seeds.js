/* ---------- groups, clause mutations, revisions ---------- */
function wSampleGroups(short){return [
 {id:'grp-'+rid(),type:'base',name:`${short} · Employees`,descriptor:'All permanent employees on payroll',evidence:'Annexure 2 · p. 4, 9',conf:94,status:'draft',seen:false},
 {id:'grp-'+rid(),type:'member',name:`${short} · Parents / PIL`,descriptor:'Parents and parents-in-law, opt-in',evidence:'Annexure 2 · p. 10',conf:78,status:'draft',seen:false}
];}
function wDropTemplates(p,gids){
 gids.forEach(gid=>{
  p.plans=p.plans.filter(x=>{const t=p.templates.find(q=>q.id===x.templateId);return !(t&&t.groupId===gid)});
  p.templates=p.templates.filter(t=>t.groupId!==gid);
  p.clauses.forEach(c=>{if(c.groupId===gid){c.groupId=null;c.componentKey=null;c.variantId=null;c.build=null;c.verified=false;c.termId=undefined;c.mappedBy='system';c.wasUnplaced=true}});
 });
}
function wGroupImpact(p,gids){
 return {cl:p.clauses.filter(c=>gids.includes(c.groupId)&&!c.na).length,pl:p.plans.filter(x=>{const t=p.templates.find(q=>q.id===x.templateId);return t&&gids.includes(t.groupId)}).length};
}
function wMerge(p,srcId,tgtId,newName){
 const st=wTplOf(p,srcId),tt=wTplOf(p,tgtId);
 p.plans=p.plans.filter(x=>x.templateId!==st.id);
 p.clauses.filter(c=>c.groupId===srcId).forEach(c=>{
  if(c.componentKey&&c.variantId){
   const v=wVars(st,c.componentKey).find(x=>x.id===c.variantId);
   if(c.variantId===ALL){if(!wVars(tt,c.componentKey).some(x=>!x.isBlank)&&wVars(st,c.componentKey).find(x=>!x.isBlank))wEnsureVariant(tt,c.componentKey,wVars(st,c.componentKey).find(x=>!x.isBlank).name,false)}
   else if(v)c.variantId=wEnsureVariant(tt,c.componentKey,v.name,v.isGroupVariant);
  }
  c.groupId=tgtId;c.verified=false;
 });
 p.groups=p.groups.filter(g=>g.id!==srcId);p.templates=p.templates.filter(t=>t.id!==st.id);
 const tg=p.groups.find(g=>g.id===tgtId);tg.name=newName;tt.displayName=`${newName} · Template`;tt.name=`${newName.replace(/\s*·\s*/g,' ').toUpperCase()} TEMPLATE`;
 wRefreshPlans(p,tt.id);
}
function wMapClause(p,cid,groupId,comp,by){
 const c=p.clauses.find(x=>x.id===cid);const oldT=c.groupId&&wTplOf(p,c.groupId);
 c.groupId=groupId;c.componentKey=comp||null;c.verified=false;c.na=false;c.naReason=undefined;c.naNote=undefined;c.mappedBy=by||'operator';c.termId=undefined;c.attributeRequested=false;
 if(groupId&&comp){
  c.build=buildClause(c.text,comp);const t=wTplOf(p,groupId);const g=p.groups.find(x=>x.id===groupId);
  if(c.build.status!=='no_attribute'){
   if(!wVars(t,comp).some(v=>!v.isBlank))wEnsureVariant(t,comp,suggestVariant(comp,c.build,g.type),false);
   c.variantId=ALL;
  }else c.variantId=null;
 }else{c.build=null;c.variantId=null}
 const ids=[oldT&&oldT.id,groupId&&wTplOf(p,groupId)&&wTplOf(p,groupId).id].filter(Boolean);
 [...new Set(ids)].forEach(id=>wRefreshPlans(p,id));
 wTouch(p);wRecompute(p);
}
function wSetAside(p,cid,reason,note){const c=p.clauses.find(x=>x.id===cid);c.na=true;c.naReason=reason;c.naNote=note||'';c.verified=false;if(c.groupId){const t=wTplOf(p,c.groupId);if(t)wRefreshPlans(p,t.id)}wTouch(p);wRecompute(p)}
function wRestore(p,cid){const c=p.clauses.find(x=>x.id===cid);c.na=false;c.naReason=undefined;c.naNote=undefined;if(c.groupId){const t=wTplOf(p,c.groupId);if(t)wRefreshPlans(p,t.id)}wTouch(p);wRecompute(p)}
function wMakeDifferent(p,c){
 const t=wTplOf(p,c.groupId);const vs=wVars(t,c.componentKey).filter(v=>!v.isBlank);const term='term-'+rid();const idx=p.clauses.indexOf(c);
 const sibs=vs.map((v,i)=>({...c,id:i===0?c.id:'cl-'+rid(),termId:term,variantId:v.id,build:JSON.parse(JSON.stringify(c.build)),verified:false}));
 p.clauses.splice(idx,1,...sibs);
}
function wMakeShared(p,c){
 const sibs=p.clauses.filter(x=>wTermOf(x)===wTermOf(c));const keep=sibs.find(x=>x.id===c.id)||sibs[0];
 keep.variantId=ALL;keep.termId=undefined;keep.verified=false;p.clauses=p.clauses.filter(x=>!(sibs.includes(x)&&x!==keep));
}
function wRevBlock(p){
 if(p.status==='packaged')return 'it belongs to a published package';
 if(p.status==='parsing')return 'it is still parsing';
 if(wPending(p).length)return `${wPending(p).length} revision ${wPending(p).length>1?'changes are':'change is'} still waiting for a decision`;
 if(p.revisionChanges.some(c=>c.resolution==='accepted')&&p.templates.some(t=>t.reopened))return 'accepted changes still need template review and regeneration';
 return null;
}
function wImpactRows(p,ch){
 if(!ch.impacts.length)return [];
 return p.plans.filter(x=>ch.impacts.some(im=>{const t=p.templates.find(q=>q.id===x.templateId);if(!t||t.groupId!==ch.groupId)return false;const sel=x.selection[im.componentKey];return sel&&!wVars(t,im.componentKey).find(v=>v.id===sel&&v.isBlank)}));
}
function wDiff(p){
 const rr=p.clauses.find(c=>c.componentKey==='room_rent_icu'&&c.groupId&&!c.na);
 const mat=p.clauses.find(c=>c.componentKey==='maternity'&&c.groupId&&!c.na);
 const ch=[];
 const mk=(c,next)=>{const t=wTplOf(p,c.groupId),g=p.groups.find(x=>x.id===c.groupId);const v=wVars(t,c.componentKey).find(x=>!x.isBlank);
  return {id:'rc-'+rid(),version:p.version,kind:'clause_changed',groupId:c.groupId,groupName:g.name,clauseId:c.id,label:clabel(c.componentKey),previous:c.text,next,resolution:'pending',
   impacts:[{type:'component_edited',componentKey:c.componentKey,componentLabel:clabel(c.componentKey),variantName:v?v.name:null,reason:`${clabel(c.componentKey)} changed${v?` for ${v.name}`:''}`}]}};
 if(rr)ch.push(mk(rr,rr.text.replace('2% of sum insured per day','1.5% of sum insured per day')));
 if(mat)ch.push(mk(mat,mat.text.replace('₹50,000','₹60,000').replace('₹75,000','₹90,000')));
 if(!p.groups.some(g=>g.type==='add_on'))ch.push({id:'rc-'+rid(),version:p.version,kind:'group_added',groupId:'new',groupName:'Add-on · OPD',clauseId:null,label:'New group detected',previous:'',next:'New group Add-on · OPD: Outpatient (OPD) cover of ₹10,000 per family per policy year (Annexure 6, p. 14). Its term arrives as an unplaced term.',resolution:'pending',impacts:[]});
 p.revisionChanges=[...p.revisionChanges,...ch];
}

/* ---------- seeds ---------- */
function wMake(o){
 const p={id:'pr-'+rid(),ref:o.ref,partnerId:o.partner,name:o.name,file:o.file,fileSize:o.size||'2.2 MB',pages:14,masterId:o.master,master:wMasterName(o.master),status:'group_review',progress:100,failure:null,mode:o.mode||'clean',
  attempts:[{number:1,at:wNow(),outcome:'succeeded',detail:'Initial parse'}],groups:[],clauses:[],templates:[],plans:[],createdAt:wNow(),updatedAt:o.at||wNow(),version:1,versions:[],revisionChanges:[],revisionParse:false};
 p.groups=wSampleGroups(o.short);wExtract(p);p.loReview=wUnplaced(p).length>0;return p;
}
function wAdvance(p,lv){
 if(lv>=1)p.loReview=false;
 if(lv>=1)p.groups.forEach(g=>{g.status='confirmed';g.seen=true});
 if(lv>=2){
  p.clauses.forEach(c=>{
   if(c.groupId===null){c.na=true;c.naReason=/TPA/.test(c.text)?'master_policy':/top-up/i.test(c.text)?'commercial':'process';return}
   if(c.componentKey===null){c.componentKey='pre_post_hospitalisation';c.build=buildClause(c.text,c.componentKey);c.variantId=ALL;c.mappedBy='operator';const t=wTplOf(p,c.groupId);if(!wVars(t,c.componentKey).length)wEnsureVariant(t,c.componentKey,suggestVariant(c.componentKey,c.build,'base'),false)}
   if(c.build&&c.build.status==='no_attribute'){c.na=true;c.naReason='other';c.naNote='Wellness points are not part of the plan form yet';return}
   if(c.build&&c.build.status==='failed'){c.na=true;c.naReason='master_policy';return}
   c.verified=true;
  });
 }
 if(lv>=3){wEnsurePlans(p);p.plans.forEach(x=>{x.pricingSchema='PRC-GMC-26';x.reviewStatus='confirmed';x.generated=true;x.generatedVersion=p.version;x.generatedAt=wNow()})}
 wRecompute(p);
}
function wSeed(){
 const ago=h=>new Date(Date.now()-h*3600000).toISOString();
 const out=[];
 let p=wMake({ref:'PR-0150',partner:'ayurs',short:'Ayurs',name:'Ayurs infotech GMC 2025–26',file:'ayurs-gmc-2025-26.pdf',size:'2.2 MB',master:'mp-ay-gmc',at:ago(70)});wAdvance(p,3);p.status='packaged';out.push(p);
 const pk1={id:'pkg-seed',partnerId:'ayurs',name:'Ayurs · Package 1',proposalIds:[p.id],documentsConfirmed:true,documentsConfirmedBy:'Riya Kulkarni',validated:true,published:true,publishedAt:ago(60)};
 p=wMake({ref:'PR-0149',partner:'ayurs',short:'Ayurs',name:'Ayurs infotech top-up 2026',file:'ayurs-topup-2026.pdf',size:'1.9 MB',master:'mp-ay-gmc',at:ago(5)});wAdvance(p,3);out.push(p);
 p=wMake({ref:'PR-0148',partner:'ayurs',short:'Ayurs',name:'Ayurs infotech GPA 2026–27',file:'ayurs-gpa-2026-27.pdf',size:'2.0 MB',master:'mp-ay-gpa',at:ago(26)});wAdvance(p,1);
 p.clauses.filter(c=>['sum_insured','family_construct','waiting_periods','tpa'].includes(c.componentKey)&&c.groupId&&c.build&&c.build.status!=='failed').forEach(c=>{c.verified=true});wRecompute(p);out.push(p);
 p=wMake({ref:'PR-0147',partner:'ayurs',short:'Ayurs',name:'Ayurs infotech GMC 2026–27',file:'ayurs-gmc-2026-27-v2.pdf',size:'2.5 MB',master:'mp-ay-gmc',at:ago(2)});
 wAdvance(p,3);p.version=2;p.versions=[{number:1,file:'ayurs-gmc-2026-27.pdf',pages:14,at:ago(40),note:'Initial upload'}];wDiff(p);out.push(p);
 p=wMake({ref:'PR-0146',partner:'ayurs',short:'Ayurs',name:'Ayurs infotech GPA 3L',file:'ayurs-gpa-3l.pdf',size:'1.8 MB',master:null,at:ago(50)});p.status='draft';p.groups=[];p.clauses=[];p.templates=[];p.progress=0;p.attempts=[];out.push(p);
 p=wMake({ref:'PR-0143',partner:'ayurs',short:'Ayurs',name:'Ayurs infotech 2L (scanned)',file:'ayurs-2l-scanned.pdf',size:'3.4 MB',master:'mp-ay-gmc',mode:'fail',at:ago(96)});
 p.status='failed';p.progress=55;p.groups=[];p.clauses=[];p.templates=[];
 p.failure='Pages 3 to 14 could not be read. The file looks scanned or password protected, so the text layer is missing.';
 p.attempts=[{number:1,at:ago(96),outcome:'failed',detail:'Stopped at 55% · text layer missing on pages 3–14'}];out.push(p);
 p=wMake({ref:'PR-0145',partner:'north',short:'Northwind',name:'Northwind logistics GMC 10L',file:'northwind-gmc-10l.pdf',size:'2.1 MB',master:'mp-no-gmc',at:ago(8)});out.push(p);
 p=wMake({ref:'PR-0144',partner:'kestrel',short:'Kestrel',name:'Kestrel foods GMC 3L',file:'kestrel-gmc-3l.pdf',size:'1.7 MB',master:'mp-ke-gmc',at:ago(20)});wAdvance(p,3);out.push(p);
 W.packages=[pk1];
 return out;
}
function wInit(){
 if(W.seedDone)return;W.seedDone=true;W.proposals=wSeed();
 W.audit=[
  {id:'a1',label:'Package published',detail:'Ayurs · Package 1 · 1 proposal now live',user:'Riya Kulkarni',role:'operator',at:new Date(Date.now()-60*3600000).toISOString()},
  {id:'a2',label:'Plans generated',detail:'Ayurs infotech top-up 2026 · 4 rows',user:'Riya Kulkarni',role:'operator',at:new Date(Date.now()-5*3600000).toISOString()},
  {id:'a3',label:'Revised PF ingested',detail:'Ayurs infotech GMC 2026–27 · v2 · 3 changes to review',user:'Riya Kulkarni',role:'operator',at:new Date(Date.now()-2*3600000).toISOString()},
  {id:'a4',label:'Workspace initialised',detail:'Sample partner data loaded',user:'system',role:'system',at:new Date(Date.now()-100*3600000).toISOString()}
 ];
}
