/* ================================================================== */
/* V2 · full policy-ingestion journey                                  */
/* Document → Groups → Unplaced terms → Templates → Plans → Packages   */
/* ================================================================== */
Object.assign(IC,{
 box:'<path d="M21 8 12 3 3 8v8l9 5 9-5z"/><path d="m3 8 9 5 9-5M12 13v8"/>',
 msg:'<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
 lock:'<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
 history:'<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5M12 7v5l3 2"/>',
 branch:'<circle cx="6" cy="5" r="2.5"/><circle cx="6" cy="19" r="2.5"/><circle cx="18" cy="8" r="2.5"/><path d="M6 7.5v9M18 10.5c0 4-6 3-12 6"/>',
 eye:'<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>',
 list:'<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',
 plusC:'<circle cx="12" cy="12" r="10"/><path d="M12 8v8M8 12h8"/>',
 chevD:'<path d="m6 9 6 6 6-6"/>',
 table:'<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M3 15h18M9 3v18"/>',
 verified:'<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>',
 download:'<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>'
});
const SECLAB={plan_details:'Plan details',covers:'Cover details',pricing:'Pricing'};
const COMPS={
 sum_insured:{l:'Sum Insured Info',sec:'plan_details'},
 family_construct:{l:'Family Info',sec:'plan_details'},
 copays:{l:'Copay',sec:'plan_details',opt:1,grp:1},
 sub_limits:{l:'Sublimit',sec:'plan_details',opt:1},
 corporate_buffers:{l:'Corporate Buffer',sec:'plan_details',opt:1},
 deductibles:{l:'Deductible',sec:'plan_details',opt:1},
 waiting_periods:{l:'Waiting Period',sec:'plan_details'},
 coverages:{l:'Additional Conditions',sec:'plan_details',opt:1},
 restore_grid:{l:'Restore SI',sec:'plan_details',opt:1},
 tpa:{l:'TPA',sec:'plan_details'},
 room_rent_icu:{l:'Room Rent ICU',sec:'covers'},
 maternity:{l:'Maternity',sec:'covers',opt:1},
 ambulance:{l:'Ambulance',sec:'covers',opt:1},
 pre_post_hospitalisation:{l:'Pre & Post Hospitalisation',sec:'covers'}
};
const clabel=k=>COMPS[k]?COMPS[k].l:k;
const ITEMS=['Room rent expenses','ICU room expenses','Cataract','Dialysis','Chemotherapy','Day care procedures','Normal delivery','C-section','Congenital (internal)','Congenital (external, life-threatening)','Domiciliary hospitalisation','Critical illness','Outpatient (OPD)'];
const ATTR={
 sum_insured_basis:{l:'Sum insured basis',t:'single',o:['Individual','Family floater','Individual + floater']},
 sum_insured:{l:'Sum insured',t:'num',m:1},
 sum_insured_unit:{l:'Unit',t:'single',o:['INR']},
 relationship:{l:'Relationship',t:'multi',o:['Self','Spouse','Child','Parent','Parent-in-law','Sibling']},
 min_age:{l:'Min age',t:'num'},max_age:{l:'Max age',t:'num'},max_count:{l:'Max members',t:'num'},
 copay_value:{l:'Copay %',t:'num',pc:1},
 relation:{l:'Applies to',t:'multi',o:['Self','Spouse','Child','Parent','Parent-in-law']},
 copay_cap:{l:'Copay cap',t:'single',o:['Standalone','Overall']},
 sub_limit_base:{l:'Limit base',t:'single',o:['Sum insured','Absolute amount']},
 sub_limit_value:{l:'Limit value',t:'num'},
 unit:{l:'Unit',t:'single',o:['INR','%']},
 sub_limit_factor:{l:'Applies',t:'single',o:['Per day','Per eye','Per policy period','Per family','Per event','Per claim']},
 covered_items:{l:'Covered items',t:'multi',o:ITEMS},
 coverage_type:{l:'Coverage type',t:'single',o:['Inclusion','Exclusion']},
 covered_conditions:{l:'Conditions',t:'multi',o:ITEMS},
 corporate_buffer_value:{l:'Buffer amount',t:'num',m:1},
 corporate_buffer_factor:{l:'Buffer basis',t:'single',o:['Overall','Per family','Per member']},
 waiting_period_type:{l:'Waiting period',t:'single',o:['Initial','Pre-existing disease','Specific illness','Maternity']},
 waiting_period_days:{l:'Days',t:'num'},
 waived:{l:'Waived',t:'bool'},
 restore_frequency:{l:'Frequency',t:'single',o:['Once per policy year','Unlimited']},
 restore_condition:{l:'Condition',t:'single',o:['Different ailment','Any ailment']},
 maternity_factor:{l:'Applies to',t:'single',o:['First two living children','All children']},
 tpa_name:{l:'TPA',t:'single',o:['FHPL','MediAssist','Paramount','Vidal']},
 pre_days:{l:'Pre-hospitalisation days',t:'num'},post_days:{l:'Post-hospitalisation days',t:'num'}
};
const ATTRS_FOR={
 sum_insured:['sum_insured_basis','sum_insured','sum_insured_unit'],
 family_construct:['relationship','min_age','max_age','max_count'],
 copays:['copay_value','relation','copay_cap'],
 sub_limits:['sub_limit_base','sub_limit_value','unit','sub_limit_factor','covered_items'],
 corporate_buffers:['corporate_buffer_value','corporate_buffer_factor','covered_conditions'],
 deductibles:['sub_limit_value','unit','sub_limit_factor'],
 waiting_periods:['waiting_period_type','waiting_period_days','waived'],
 coverages:['coverage_type','covered_conditions'],
 restore_grid:['restore_frequency','restore_condition'],
 tpa:['tpa_name'],
 room_rent_icu:['sub_limit_base','sub_limit_value','unit','sub_limit_factor','covered_items'],
 maternity:['sub_limit_value','unit','covered_items','maternity_factor'],
 ambulance:['sub_limit_value','unit'],
 pre_post_hospitalisation:['pre_days','post_days']
};
const REQ={
 sum_insured:['sum_insured_basis','sum_insured','sum_insured_unit'],family_construct:['relationship','min_age','max_age'],
 copays:['copay_value','relation','copay_cap'],sub_limits:['sub_limit_base','sub_limit_value','unit','covered_items'],
 corporate_buffers:['corporate_buffer_value','corporate_buffer_factor'],deductibles:['sub_limit_value','unit'],
 waiting_periods:['waiting_period_type'],coverages:['coverage_type','covered_conditions'],restore_grid:['restore_frequency','restore_condition'],
 tpa:['tpa_name'],room_rent_icu:['sub_limit_base','sub_limit_value','unit'],maternity:['sub_limit_value','unit'],ambulance:['sub_limit_value','unit'],
 pre_post_hospitalisation:['pre_days','post_days']
};
const SET_ASIDE=[
 {value:'process',label:'Operational / process wording',hint:'Claims procedure, intimation windows, documentation. Nothing to configure.'},
 {value:'commercial',label:'Pricing or commercial term',hint:'Premium, rates, payment terms. Handled in pricing, not the template.'},
 {value:'master_policy',label:'Already the master-policy default',hint:'The proposal restates something the master policy already fixes.'},
 {value:'duplicate',label:'Duplicate of another term',hint:'Another extracted term already captures this condition.'},
 {value:'other',label:'Other (note required)',hint:''}
];
const asideLabel=r=>(SET_ASIDE.find(x=>x.value===r)||{label:'Reason not recorded'}).label;
const CASE_L={unmapped_group:'Not mapped to a group',unmapped_component:'Section not identified',no_attribute:'Needs a new attribute',build_failed:'Could not build',incomplete:'Values missing',review:'Check values',verified:'Confirmed',na:'Set aside'};
const CASE_TONE={unmapped_group:'p-bad',unmapped_component:'p-bad',no_attribute:'p-bad',build_failed:'p-bad',incomplete:'p-warn',review:'p-warn',verified:'p-good',na:'p-none'};
const GTYPE={base:'Base',member:'Member',add_on:'Add-on',topup:'Top-up'};
const FEEDBACK=[['wrong_name','Parser named it wrongly'],['wrong_type','Parser chose the wrong type'],['merge_split','Groups should be merged or split'],['other','Something else']];

/* ---------- deterministic builder: text → attribute rows (never invents values) ---------- */
const wAmt=t=>[...t.matchAll(/₹\s*([\d,]+)/g)].map(m=>+m[1].replace(/,/g,''));
const wPct=t=>[...t.matchAll(/(\d+(?:\.\d+)?)\s*%/g)].map(m=>+m[1]);
const wDays=t=>[...t.matchAll(/(\d+)\s*days?/gi)].map(m=>+m[1]);
const lakh=n=>n>=100000?(Math.round(n/10000)/10)+'Lac':(n/1000)+'K';
const mkRow=(part,values)=>({id:'r'+rid(),part,values});
const isEmpty=v=>v==null||v===''||(Array.isArray(v)&&!v.length);
const wMissing=(comp,row)=>(REQ[comp]||[]).filter(k=>isEmpty(row.values[k]));
function finalize(comp,rows,reason){
 const missing=[...new Set(rows.flatMap(r=>wMissing(comp,r)))];
 return {status:!rows.length?'failed':missing.length?'partial':'built',rows,missing,reason:reason||null};
}
const kw=(t,list)=>list.filter(([re])=>re.test(t)).map(([,v])=>v);
const ITEM_KW=[[/room rent/i,'Room rent expenses'],[/\bICU\b/,'ICU room expenses'],[/cataract/i,'Cataract'],[/dialysis/i,'Dialysis'],[/chemotherapy/i,'Chemotherapy'],[/day ?care/i,'Day care procedures'],[/domiciliary/i,'Domiciliary hospitalisation'],[/outpatient|\bOPD\b/i,'Outpatient (OPD)'],[/critical illness/i,'Critical illness'],[/internal congenital/i,'Congenital (internal)'],[/external congenital/i,'Congenital (external, life-threatening)']];
function buildClause(text,comp){
 const T=text,a=wAmt(T),p=wPct(T),d=wDays(T);
 if(/wellness|reward points/i.test(T))return {status:'no_attribute',rows:[],missing:[],reason:'No attribute on the plan form can hold reward points. Suggested new attribute: wellness_reward_points.'};
 switch(comp){
  case 'sum_insured':return finalize(comp,a.length?[mkRow('row',{sum_insured_basis:/floater/i.test(T)?'Family floater':/individual/i.test(T)?'Individual':null,sum_insured:a[0],sum_insured_unit:'INR'})]:[]);
  case 'family_construct':{
   const ranges=[...T.matchAll(/(\d+)\s*to\s*(\d+)\s*years/g)].map(m=>[+m[1],+m[2]]);
   const two=/up to (one|two|three|\d)\s+(?:dependent\s+)?(children|parents)/i.exec(T);const n={one:1,two:2,three:3}[(two&&two[1]||'').toLowerCase()]||(two?+two[1]:null);
   const rows=[];const hasChild=/child/i.test(T);
   const adult=hasChild&&ranges.length>1?ranges[1]:ranges[0],kid=hasChild&&ranges.length>1?ranges[0]:ranges[0];
   if(/employee/i.test(T))rows.push(mkRow('row',{relationship:['Self'],min_age:adult?adult[0]:null,max_age:adult?adult[1]:null,max_count:1}));
   if(/spouse/i.test(T))rows.push(mkRow('row',{relationship:['Spouse'],min_age:adult?adult[0]:null,max_age:adult?adult[1]:null,max_count:1}));
   if(hasChild)rows.push(mkRow('row',{relationship:['Child'],min_age:kid?kid[0]:null,max_age:kid?kid[1]:null,max_count:n}));
   const par=[];if(/parents(?!-in)/i.test(T.replace(/parents-in-law/ig,'')))par.push('Parent');if(/parents-in-law/i.test(T))par.push('Parent-in-law');
   if(par.length)rows.push(mkRow('row',{relationship:par,min_age:adult?adult[0]:null,max_age:adult?adult[1]:null,max_count:n}));
   return finalize(comp,rows);
  }
  case 'copays':{
   const rel=[];if(/parents(?!-in)/i.test(T.replace(/parents-in-law/ig,'')))rel.push('Parent');if(/parents-in-law|PIL/i.test(T))rel.push('Parent-in-law');
   return finalize(comp,p.length?[mkRow('row',{copay_value:p[0],relation:rel,copay_cap:/not applicable for ailments with other limits/i.test(T)?'Standalone':null})]:[]);
  }
  case 'sub_limits':case 'deductibles':{
   if(!p.length&&!a.length)return finalize(comp,[]);
   const pc=p.length&&/sum insured/i.test(T);
   const factor=/per eye/i.test(T)?'Per eye':/per day/i.test(T)?'Per day':/per policy period/i.test(T)?'Per policy period':/per family/i.test(T)?'Per family':null;
   const val=comp==='deductibles'?(a[1]??a[0]):pc?p[0]:a[0];
   return finalize(comp,[mkRow('row',{sub_limit_base:comp==='deductibles'?undefined:(pc?'Sum insured':'Absolute amount'),sub_limit_value:val,unit:pc?'%':'INR',sub_limit_factor:factor,covered_items:kw(T,ITEM_KW)})]);
  }
  case 'corporate_buffers':return finalize(comp,a.length?[mkRow('row',{corporate_buffer_value:a[0],corporate_buffer_factor:/overall/i.test(T)?'Overall':/per family/i.test(T)?'Per family':null,covered_conditions:kw(T,ITEM_KW)})]:[]);
  case 'waiting_periods':{
   const rows=[];const w=/waived/i.test(T);
   if(/initial/i.test(T))rows.push(mkRow('row',{waiting_period_type:'Initial',waiting_period_days:d[0]??null,waived:w}));
   if(/pre-?existing/i.test(T))rows.push(mkRow('row',{waiting_period_type:'Pre-existing disease',waiting_period_days:null,waived:w}));
   if(/specific illness/i.test(T))rows.push(mkRow('row',{waiting_period_type:'Specific illness',waiting_period_days:null,waived:w}));
   return finalize(comp,rows);
  }
  case 'coverages':{
   const rows=T.split(/(?<=\.)\s+/).filter(s=>s.trim()).map(s=>mkRow('coverages',{coverage_type:/not covered|excluded/i.test(s)?'Exclusion':/covered/i.test(s)?'Inclusion':null,covered_conditions:kw(s,ITEM_KW)}));
   const note=/₹|%/.test(T)?'This text states a limit that Additional Conditions cannot hold. It reads like a sublimit.':null;
   return finalize(comp,rows,note);
  }
  case 'restore_grid':return finalize(comp,[mkRow('row',{restore_frequency:/once/i.test(T)?'Once per policy year':null,restore_condition:/different ailment/i.test(T)?'Different ailment':null})]);
  case 'room_rent_icu':{
   const rows=[];if(/room rent/i.test(T)&&p[0]!=null)rows.push(mkRow('sub_limits',{sub_limit_base:'Sum insured',sub_limit_value:p[0],unit:'%',sub_limit_factor:/per day/i.test(T)?'Per day':null,covered_items:['Room rent expenses']}));
   if(/\bICU\b/.test(T)&&p[1]!=null)rows.push(mkRow('sub_limits',{sub_limit_base:'Sum insured',sub_limit_value:p[1],unit:'%',sub_limit_factor:/per day/i.test(T)?'Per day':null,covered_items:['ICU room expenses']}));
   return finalize(comp,rows);
  }
  case 'maternity':{
   const f=/first two/i.test(T)?'First two living children':null;const rows=[];
   if(a[0]!=null)rows.push(mkRow('sub_limits',{sub_limit_value:a[0],unit:'INR',covered_items:['Normal delivery'],maternity_factor:f}));
   if(a[1]!=null)rows.push(mkRow('sub_limits',{sub_limit_value:a[1],unit:'INR',covered_items:['C-section'],maternity_factor:f}));
   return finalize(comp,rows);
  }
  case 'ambulance':return a.length?finalize(comp,[mkRow('row',{sub_limit_value:a[0],unit:'INR'})]):{status:'failed',rows:[],missing:[],reason:'The text gives no amount: the limit sits in the policy schedule.'};
  case 'tpa':{const m=/FHPL|MediAssist|Paramount|Vidal/i.exec(T);return finalize(comp,m?[mkRow('row',{tpa_name:{fhpl:'FHPL',mediassist:'MediAssist',paramount:'Paramount',vidal:'Vidal'}[m[0].toLowerCase()]})]:[])}
  case 'pre_post_hospitalisation':{const pre=/pre-?hospitali[sz]ation\s*(\d+)/i.exec(T),post=/post-?hospitali[sz]ation\s*(\d+)/i.exec(T);return finalize(comp,pre||post?[mkRow('row',{pre_days:pre?+pre[1]:null,post_days:post?+post[1]:null})]:[])}
 }
 return {status:'failed',rows:[],missing:[],reason:'This section has no builder.'};
}
function suggestVariant(comp,build,gtype){
 const r=build&&build.rows[0]?build.rows[0].values:{};
 switch(comp){
  case 'sum_insured':return `SI${lakh(r.sum_insured)}`;
  case 'family_construct':return build.rows.map(x=>({Self:'E',Spouse:'S',Child:`${x.values.max_count??''}C`,Parent:`${x.values.max_count??''}P`,'Parent-in-law':'PIL'}[(x.values.relationship||[])[0]]||'')).join('').replace('PPIL','P/PIL')||'Family Variant 1';
  case 'copays':return `Copay ${r.copay_value??''}% ${(r.relation||[]).map(x=>x==='Parent'?'P':x==='Parent-in-law'?'PIL':x).join('/')}`.trim();
  case 'corporate_buffers':return `Corporate Buffer ${r.corporate_buffer_value?lakh(r.corporate_buffer_value):'1'}`;
  case 'maternity':return `Maternity ${r.sub_limit_value?lakh(Math.max(...build.rows.map(x=>x.values.sub_limit_value||0))):'1'}`;
  case 'room_rent_icu':return `Room Rent ICU ${r.sub_limit_value??''}${r.unit==='%'?'%':''}`;
 }
 return `${clabel(comp)} Variant 1`;
}

/* ---------- clause + template model ---------- */
const ALL='*';
const wTermOf=c=>c.termId||c.id;
function wCase(c){
 if(c.na)return 'na';if(c.groupId===null)return 'unmapped_group';if(c.componentKey===null)return 'unmapped_component';
 if(c.build&&c.build.status==='no_attribute')return 'no_attribute';if(c.build&&c.build.status==='failed')return 'build_failed';
 if(c.verified)return 'verified';if(c.build&&c.build.status==='partial')return 'incomplete';return 'review';
}
const wResolved=c=>{const k=wCase(c);return k==='verified'||k==='na'};
const wConf=c=>{if(c.na||!c.build)return null;if(c.verified)return 100;if(c.build.status==='built')return c.mappedBy==='operator'?85:90;if(c.build.status==='partial')return 70;return null};
const wVars=(t,comp)=>t.components[comp]||[];
function wEnsureVariant(t,comp,name,isGroup){
 const ex=wVars(t,comp).find(v=>v.name===name);if(ex)return ex.id;
 const id=`var-${t.id}-${comp}-${wVars(t,comp).length+1}-${rid()}`;
 t.components[comp]=[...wVars(t,comp),{id,name,isBlank:false,isGroupVariant:!!isGroup}];return id;
}
function wNewTemplate(g,pid){return {id:`tpl-${pid}-${g.id}`,groupId:g.id,name:`${g.name.replace(/\s*·\s*/g,' ').toUpperCase()} TEMPLATE`,displayName:`${g.name} · Template`,planType:g.type==='topup'?'Topup':'Base',components:{},reopened:false}}

const WSEEDS=[
 ['Annexure 2 · Benefit table · Row 1',4,'Sum insured: ₹3,00,000 family floater for Grade E.','base','sum_insured','SI3Lac'],
 ['Annexure 2 · Benefit table · Row 1',4,'Sum insured: ₹5,00,000 family floater for Grades D and C.','base','sum_insured','SI5Lac'],
 ['Annexure 2 · Benefit table · Row 1',4,'Sum insured: ₹7,50,000 family floater for Grades B and A.','base','sum_insured','SI7.5Lac'],
 ['Annexure 2 · Benefit table · Row 2',4,'Family definition: Employee, spouse and up to two dependent children (children 0 to 25 years). Employee and spouse 18 to 90 years.','base','family_construct','ES2C'],
 ['Annexure 2 · Benefit table · Row 5',5,'Room rent: 2% of sum insured per day; ICU 100% of sum insured per day. Proportionate deduction applicable on higher room category.','base','room_rent_icu','Room Rent ICU 2%'],
 ['Annexure 2 · Benefit table · Row 8',5,'Maternity: normal delivery ₹50,000 and C-section ₹75,000, limited to first two living children. Nine months waiting period waived.','base','maternity','Maternity 75K'],
 ['Annexure 2 · Benefit table · Row 11',6,'Cataract treatment limited to ₹40,000 per eye.','base','sub_limits','Sublimit Variant 1'],
 ['Annexure 3 · Day care list · Note',9,'All listed day care procedures are covered up to 10% of sum insured per policy period, including dialysis and chemotherapy sessions.','base','coverages'],
 ['Annexure 2 · Conditions · Bullet 3',7,'Internal congenital diseases are covered. External congenital diseases are covered only in life-threatening cases.','base','coverages','Coverages Variant 1'],
 ['Annexure 2 · Benefit table · Row 14',6,'Corporate buffer of ₹25,00,000 overall for the policy, to be used for critical illness cases with CHRO approval.','base','corporate_buffers','Corporate Buffer 25Lac'],
 ['Annexure 2 · Conditions · Bullet 1',7,'Initial 30 days waiting period, pre-existing disease and specific illness waiting periods are waived.','base','waiting_periods','Waiting Period Variant 1'],
 ['Annexure 2 · Conditions · Bullet 6',8,'Restoration of sum insured once in the policy year for a different ailment; not applicable for the same person and same ailment.','base','restore_grid','Restore SI Variant 1'],
 ['Annexure 2 · Benefit table · Row 16',6,'Ambulance charges payable as per the limits in the policy schedule.','base','ambulance','Ambulance Variant 1'],
 ['Annexure 4 · Wellness · Bullet 2',11,'Employees earn wellness reward points (500 per annum) redeemable against gym memberships.','base','coverages'],
 ['Annexure 2 · Conditions · Bullet 9',8,'Pre-hospitalisation 30 days and post-hospitalisation 60 days covered.','base',null],
 ['Annexure 2 · Parental cover · Row 1',10,'Parents and parents-in-law: sum insured ₹3,00,000 family floater; cross-selection of parents or parents-in-law allowed.','member','sum_insured','SI3Lac'],
 ['Annexure 2 · Parental cover · Row 2',10,'A 20% copay applies to all claims made by parents and parents-in-law. This copay is not applicable for ailments with other limits or caps.','member','copays','Copay 20% P/PIL'],
 ['Annexure 2 · Parental cover · Row 3',10,'Up to two parents or parents-in-law, 30 to 90 years.','member','family_construct','2P/PIL'],
 ['Annexure 2 · Conditions · Bullet 12',8,'Domiciliary hospitalisation covered up to 10% of sum insured per family.',null,null],
 ['Annexure 5 · Top-up · Row 1',13,'Optional top-up of ₹10,00,000 over a deductible of ₹5,00,000 per family for top-up plans.',null,null],
 ['Cover letter · Para 4',1,'TPA services will be provided by FHPL for cashless and reimbursement claims.',null,null]
];
function wExtract(p){
 const base=p.groups.find(g=>g.type==='base'),member=p.groups.find(g=>g.type==='member');
 p.templates=p.groups.map(g=>wNewTemplate(g,p.id));
 p.clauses=WSEEDS.map((s,i)=>{
  const [ref,page,text,gk,comp,vname]=s;
  const g=gk==='base'?base:gk==='member'?member:null;
  const t=g?p.templates.find(x=>x.groupId===g.id):null;
  const build=g&&comp?buildClause(text,comp):null;
  const tiered=comp==='sum_insured'&&gk==='base';
  let vid=null;
  if(t&&comp&&build&&build.status!=='no_attribute'){const id=wEnsureVariant(t,comp,vname||suggestVariant(comp,build,g.type),gk==='member'&&comp==='copays');vid=tiered?id:ALL}
  return {id:`cl-${p.id}-${i+1}`,ref,page,text,termId:tiered?`term-${p.id}-si`:undefined,groupId:g?g.id:null,componentKey:g?comp:null,variantId:vid,build,verified:false,na:false,attributeRequested:false,mappedBy:'system',wasUnplaced:!g};
 });
 const mt=member&&p.templates.find(x=>x.groupId===member.id);
 if(mt&&mt.components.copays)mt.components.copays.push({id:`var-${mt.id}-copays-empty`,name:'Empty Option',isBlank:true,isGroupVariant:false});
}

/* ---------- state ---------- */
const WPARTNERS={ayurs:'Ayurs',north:'Northwind',kestrel:'Kestrel',blue:'Bluepine'};
const wBaseVars=(participation)=>[
 {key:'plan',label:'Plan type',extracted:'Vanilla',confirmed:'Vanilla',evidence:'Orion p.5 · Riverbed p.4',aligned:true},
 {key:'grades',label:'Grade structure',extracted:'G1 · G2 · G3 · G4',confirmed:'G1 · G2 · G3 · G4',evidence:'Orion p.5 · PTC p.3',aligned:true},
 {key:'participation',label:'Minimum participation',extracted:'10% vs not stated',confirmed:participation,evidence:'Orion p.7 · PTC p.6',aligned:!!participation},
 {key:'wallet',label:'Wallet issued',extracted:'No',confirmed:'No',evidence:'Riverbed p.8 · PTC p.4',aligned:true}
];
const W={view:'overview',pg:1,pgSize:6,pid:null,stage:null,tab:'all',hq:'',role:'operator',seq:151,reqSeq:231,proposals:[],packages:[],audit:[],corrections:[],requests:[],
 masters:[
  {id:'mp-ay-gmc',partnerId:'ayurs',name:'GMC 2026–27 · Master policy',note:'Active · updated 14 Feb 2026'},
  {id:'mp-ay-gpa',partnerId:'ayurs',name:'GPA 2026–27 · Master policy',note:'Active · updated 02 Jan 2026'},
  {id:'mp-no-gmc',partnerId:'north',name:'Northwind GMC · Master policy',note:'Active'},
  {id:'mp-ke-gmc',partnerId:'kestrel',name:'Kestrel GMC · Master policy',note:'Active'},
  {id:'mp-bl-gmc',partnerId:'blue',name:'Bluepine GMC · Master policy',note:'Active'}
 ],
 partners:{ayurs:{frozen:false,by:null,at:null,vars:wBaseVars('')},north:{frozen:true,by:'Admin · Prakash V',at:new Date().toISOString(),vars:wBaseVars('15%')},kestrel:{frozen:false,by:null,at:null,vars:wBaseVars('')},blue:{frozen:false,by:null,at:null,vars:wBaseVars('')}},
 intake:null,ui:{tpl:null,comp:null,vid:null,planTab:null,open:null,pricing:''},gm:null,seedDone:false};
const WST={draft:{l:'Draft',c:'p-none'},parsing:{l:'Parsing',c:'p-info'},failed:{l:'Parsing failed',c:'p-bad'},group_review:{l:'Group review',c:'p-warn'},templates:{l:'Templates in progress',c:'p-info'},templates_done:{l:'Templates complete',c:'p-good'},plans_generated:{l:'Plans generated',c:'p-info'},plans_active:{l:'Plans active',c:'p-good'},packaged:{l:'Packaged',c:'p-good'}};
const wspill=s=>`<span class="pill ${WST[s].c}"><span class="d"></span>${WST[s].l}</span>`;
const wcur=()=>W.proposals.find(p=>p.id===W.pid);
const wProps=()=>W.proposals.filter(p=>p.partnerId===S.co.id);
const wTplOf=(p,gid)=>p.templates.find(t=>t.groupId===gid);
const wGroupOfTpl=(p,t)=>p.groups.find(g=>g.id===t.groupId);
const wClausesOf=(p,gid)=>p.clauses.filter(c=>c.groupId===gid);
const wNow=()=>new Date().toISOString();
const wTime=iso=>new Date(iso).toLocaleTimeString('en-IN',{hour:'numeric',minute:'2-digit'});
const wDay=iso=>new Date(iso).toLocaleDateString('en-IN',{day:'2-digit',month:'short'});
const wAgo=iso=>{const m=Math.round((Date.now()-new Date(iso))/60000);return m<1?'Just now':m<60?m+' min ago':m<1440?Math.round(m/60)+' h ago':Math.round(m/1440)+' d ago'};
function wAudit(label,detail){W.audit.unshift({id:'a'+rid(),label,detail,user:'Riya Kulkarni',role:W.role,at:wNow()})}
const SMART=()=>VER==='v3'||VER==='v4';
const wTouch=p=>{p.updatedAt=wNow();W.savedAt=Date.now();if(typeof wSavedPaint==='function')wSavedPaint()};
const wMasterName=id=>{const m=W.masters.find(x=>x.id===id);return m?m.name:'No master policy'};

/* stage gates (zip: a stage unlocks once the previous one is done) */
const WSTAGES=['document','groups','leftovers','templates','plans'];
const WSTAGE_L={document:'Document',groups:'Groups',leftovers:'Left overs',templates:'Templates',plans:'Plans'};
const wParsed=p=>!['draft','parsing','failed'].includes(p.status);
const wGroupsOk=p=>p.groups.length>0&&p.groups.every(g=>g.status==='confirmed');
const wUnplaced=p=>p.clauses.filter(c=>c.groupId===null&&!c.na);
const wAsides=p=>p.clauses.filter(c=>c.na);
function wTplStats(p,t){
 const by=new Map();wClausesOf(p,t.groupId).forEach(c=>by.set(wTermOf(c),[...(by.get(wTermOf(c))||[]),c]));
 const terms=[...by.values()];const resolved=terms.filter(x=>x.every(wResolved)).length;
 const live=terms.filter(x=>x.some(c=>!c.na)).length;
 return {total:terms.length,resolved,open:terms.length-resolved,live};
}
const wTplComplete=(p,t)=>{const s=wTplStats(p,t);return s.total>0&&s.open===0&&s.live>0};
const wTplDone=p=>wGroupsOk(p)&&wUnplaced(p).length===0&&!p.loReview&&p.groups.every(g=>{const t=wTplOf(p,g.id);return t&&wTplComplete(p,t)});
const wPending=p=>p.revisionChanges.filter(c=>c.resolution==='pending');
function wReach(p){const r=['document'];if(wParsed(p)&&p.groups.length)r.push('groups');if(wGroupsOk(p))r.push('leftovers');if(wGroupsOk(p)&&wUnplaced(p).length===0&&!p.loReview)r.push('templates');if(wTplDone(p)||p.status==='packaged')r.push('plans');return r}
function wCurStage(p){
 if(p.status==='packaged')return 'plans';
 const r=wReach(p);if(!r.includes('groups'))return 'document';if(!r.includes('leftovers'))return 'groups';if(!r.includes('templates'))return 'leftovers';
 if(!r.includes('plans'))return 'templates';return 'plans';
}
function wTplLocked(p,tid){
 if(p.status==='packaged')return true;
 const t=p.templates.find(x=>x.id===tid);if(t&&t.reopened)return false;
 return p.plans.some(x=>x.templateId===tid&&x.generated&&!x.needsGeneration);
}
function wRecompute(p){
 if(['draft','parsing','failed','packaged'].includes(p.status))return;
 if(!wGroupsOk(p)){p.status='group_review';return}
 const tpls=p.groups.map(g=>wTplOf(p,g.id)).filter(Boolean);
 const genT=t=>{const rows=p.plans.filter(x=>x.templateId===t.id);return rows.length>0&&rows.every(x=>x.generated&&!x.needsGeneration)};
 if(tpls.length&&tpls.every(genT))p.status='plans_active';
 else if(p.plans.some(x=>x.generated&&!x.needsGeneration))p.status='plans_generated';
 else if(wTplDone(p))p.status='templates_done';
 else p.status='templates';
}

/* ---------- plans ---------- */
const wSelComps=(p,t)=>COMP_ORDER.filter(k=>wVars(t,k).length&&clausesIn(p,t,k));
const COMP_ORDER=Object.keys(COMPS);
const clausesIn=(p,t,k)=>wClausesOf(p,t.groupId).some(c=>c.componentKey===k&&!c.na)||wVars(t,k).length>0;
function wApplies(c,vid){return c.variantId===ALL||c.variantId===vid}
function wSummarize(clauses){
 const parts=[];
 clauses.forEach(c=>{(c.build?c.build.rows:[]).forEach(r=>{
  const cells=wRowCells(c.componentKey,r).filter(x=>x.s!=null).map(x=>x.s);if(cells.length)parts.push(cells.join(' · '));
 })});
 return parts.length?parts.join(' | '):'No values';
}
function wPlanValues(p,t,sel){
 return Object.keys(sel).map(k=>{
  const v=wVars(t,k).find(x=>x.id===sel[k]);if(!v)return {componentKey:k,componentLabel:clabel(k),variantId:sel[k],variantName:'Missing',summary:'Variant no longer exists',confidence:null};
  if(v.isBlank)return {componentKey:k,componentLabel:clabel(k),variantId:v.id,variantName:v.name,summary:'Not applicable for this plan',confidence:null};
  const cl=wClausesOf(p,t.groupId).filter(c=>c.componentKey===k&&!c.na&&wApplies(c,v.id));
  const cs=cl.map(wConf).filter(x=>x!=null);
  return {componentKey:k,componentLabel:clabel(k),variantId:v.id,variantName:v.name,summary:wSummarize(cl),confidence:cs.length?Math.min(...cs):null};
 });
}
function wDefaultPlans(p,t){
 const comps=wSelComps(p,t);const first=k=>{const v=wVars(t,k).find(x=>!x.isBlank)||wVars(t,k)[0];return v&&v.id};
 const base={};comps.forEach(k=>{base[k]=first(k)});
 const sis=wVars(t,'sum_insured').filter(v=>!v.isBlank);
 const mk=(name,sel,def)=>({id:'plan-'+rid(),templateId:t.id,name,displayName:name,pricingSchema:'',isDefault:def,selection:sel,generated:false,active:false,reviewStatus:'pending',needsGeneration:false,values:[],agent:true,impact:[]});
 const rows=(sis.length?sis:[null]).map((v,i)=>{const sel={...base};if(v)sel.sum_insured=v.id;return mk(v?`${wGroupOfTpl(p,t).name} · ${v.name}`:wGroupOfTpl(p,t).name,sel,i===0)});
 rows.forEach(r=>{r.values=wPlanValues(p,t,r.selection)});return rows;
}
function wEnsurePlans(p){p.templates.forEach(t=>{if(!p.plans.some(x=>x.templateId===t.id)&&wTplComplete(p,t))p.plans.push(...wDefaultPlans(p,t))})}
function wRefreshPlans(p,tid){ // template values changed: refresh values of non-terminal rows and reset their confirmation
 p.plans.filter(x=>x.templateId===tid&&!(x.generated&&!x.needsGeneration)).forEach(x=>{
  const t=p.templates.find(q=>q.id===tid);
  Object.keys(x.selection).forEach(k=>{if(!wVars(t,k).some(v=>v.id===x.selection[k])){const f=wVars(t,k).find(v=>!v.isBlank)||wVars(t,k)[0];if(f)x.selection[k]=f.id;else delete x.selection[k]}});
  x.values=wPlanValues(p,t,x.selection);x.reviewStatus='pending';
 });
}
const wPlanValid=(p,x)=>{
 const t=p.templates.find(q=>q.id===x.templateId);const errs=[];
 if(!x.name.trim())errs.push('name');else if(p.plans.some(q=>q!==x&&q.templateId===x.templateId&&q.name.trim().toLowerCase()===x.name.trim().toLowerCase()))errs.push('duplicate');if(!x.displayName.trim())errs.push('display');if(!x.pricingSchema.trim())errs.push('pricing');
 if(!Object.keys(x.selection).every(k=>wVars(t,k).some(v=>v.id===x.selection[k])))errs.push('selection');
 return errs;
};
