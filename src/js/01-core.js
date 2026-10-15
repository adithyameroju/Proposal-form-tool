/* ================= icons ================= */
const IC={
squarePen:'<path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.4 2.6a1.9 1.9 0 0 1 3 3l-9 9a2 2 0 0 1-.9.5l-2.9.8a.5.5 0 0 1-.6-.6l.8-2.9a2 2 0 0 1 .5-.9z"/>',
combine:'<rect x="3" y="3" width="8" height="8" rx="1.5"/><rect x="13" y="13" width="8" height="8" rx="1.5"/><path d="M14 10h3a2 2 0 0 0 2-2V5M10 14H7a2 2 0 0 0-2 2v3"/>',
split:'<path d="M16 3h5v5M8 3H3v5M12 22v-8.3a4 4 0 0 0-1.2-2.9L3 3M15 9l6-6"/>',
xCircle:'<circle cx="12" cy="12" r="10"/><path d="m15 9-6 6M9 9l6 6"/>',
userPlus:'<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M19 8v6M22 11h-6"/>',
braces:'<path d="M8 3H7a2 2 0 0 0-2 2v5a2 2 0 0 1-2 2 2 2 0 0 1 2 2v5c0 1.1.9 2 2 2h1M16 21h1a2 2 0 0 0 2-2v-5c0-1.1.9-2 2-2a2 2 0 0 1-2-2V5a2 2 0 0 0-2-2h-1"/>',
keyboard:'<rect x="2" y="4" width="20" height="16" rx="2"/><path d="M6 8h.01M10 8h.01M14 8h.01M18 8h.01M8 12h.01M12 12h.01M16 12h.01M7 16h10"/>',
msgPlus:'<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><path d="M12 7v6M9 10h6"/>',
swap:'<path d="M8 3 4 7l4 4M4 7h16M16 21l4-4-4-4M20 17H4"/>',
unlink:'<path d="m18.8 12.3 1.7-1.7a5 5 0 0 0-7.1-7.1l-1.7 1.7M5.2 11.7l-1.7 1.7a5 5 0 0 0 7.1 7.1l1.7-1.7M8 2v3M2 8h3M16 22v-3M22 16h-3"/>',
more:'<circle cx="12" cy="5" r="1.2"/><circle cx="12" cy="12" r="1.2"/><circle cx="12" cy="19" r="1.2"/>',
panelClose:'<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18M16 15l-3-3 3-3"/>',
panelOpen:'<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18M14 9l3 3-3 3"/>',
filePen:'<path d="M12.5 22H18a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v9.5"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M13.4 15.6a1 1 0 1 0-3-3l-5 5a2 2 0 0 0-.5.9l-.8 2.9a.5.5 0 0 0 .6.6l2.9-.8a2 2 0 0 0 .9-.5z"/>',
plus:'<path d="M12 5v14M5 12h14"/>',
down:'<path d="m6 9 6 6 6-6"/>',
right:'<path d="m9 18 6-6-6-6"/>',
left:'<path d="m12 19-7-7 7-7M19 12H5"/>',
arrow:'<path d="M5 12h14M12 5l7 7-7 7"/>',
check:'<path d="M20 6 9 17l-5-5"/>',
cc:'<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>',
upload:'<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/>',
file:'<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/>',
dash:'<path d="M3 3h7v9H3zM14 3h7v5h-7zM14 12h7v9h-7zM3 16h7v5H3z"/>',
shield:'<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
users:'<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"/>',
layers:'<path d="m12 2 10 5-10 5L2 7zM2 17l10 5 10-5M2 12l10 5 10-5"/>',
sliders:'<path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6"/>',
bell:'<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10.3 21a2 2 0 0 0 3.4 0"/>',
search:'<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
x:'<path d="M18 6 6 18M6 6l12 12"/>',
trash:'<path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M10 11v6M14 11v6"/>',
alert:'<path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0zM12 9v4M12 17h.01"/>',
info:'<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>',
spark:'<path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z"/>',
help:'<circle cx="12" cy="12" r="10"/><path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3M12 17h.01"/>',
menu:'<path d="M3 12h18M3 6h18M3 18h18"/>',
clock:'<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
save:'<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><path d="M17 21v-8H7v8M7 3v5h8"/>',
heart:'<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21l7.8-7.5 1-1.1a5.5 5.5 0 0 0 0-7.8z"/>',
cal:'<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
refresh:'<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/>',
building:'<path d="M3 21h18M6 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16M9 8h1M14 8h1M9 12h1M14 12h1M10 21v-4h4v4"/>'
};
const ic=(n,s=18,sw=2)=>`<svg class="i" width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${IC[n]}</svg>`;

/* ================= helpers & data ================= */
const $=s=>document.querySelector(s),$id=id=>document.getElementById(id);
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const inr=n=>'₹'+Number(n).toLocaleString('en-IN');
const val=id=>{const e=$id(id);return e?e.value:''};
const nowT=()=>new Date().toLocaleTimeString('en-IN',{hour:'numeric',minute:'2-digit'});
const pgs=a=>a&&a.length?'p. '+a.join(', '):'Added manually';
const rid=()=>Math.random().toString(36).slice(2,8);

const COMPANIES=[
 {id:'ayurs',name:'Ayurs Infotech Pvt Ltd',short:'Ayurs',cid:'CL-20418',industry:'IT services',emp:'1,240',renewal:'01 Apr 2027',am:'Meera Iyer',color:'#5435C0'},
 {id:'north',name:'Northwind Logistics',short:'Northwind',cid:'CL-18802',industry:'Logistics',emp:'3,860',renewal:'01 Jul 2027',am:'Arjun Rao',color:'#0E7C86'},
 {id:'kestrel',name:'Kestrel Foods Ltd',short:'Kestrel',cid:'CL-19377',industry:'FMCG',emp:'920',renewal:'01 Oct 2026',am:'Sana Qureshi',color:'#B4531F'},
 {id:'blue',name:'Bluepine Health',short:'Bluepine',cid:'CL-21045',industry:'Healthcare',emp:'610',renewal:'01 Jan 2027',am:'Meera Iyer',color:'#2B6CB0'}
];
const MASTERS=[
 {id:'MP-2041',name:'Group Health 2026–27',insurer:'Northstar General',status:'Active',maternity:true,matLimit:50000,note:'Suggested'},
 {id:'MP-2210',name:'Group Health Top-up',insurer:'Harbor Mutual',status:'Active',maternity:false,matLimit:0},
 {id:'MP-1988',name:'Group Health 2025–26',insurer:'Northstar General',status:'Expired',maternity:true,matLimit:50000}
];
const REL=['Employee','Spouse & children','Parents','Parents-in-law','Domestic partner','Siblings','Other'];
const STEPS=[{t:'Document',s:'Upload & parse'},{t:'Groups',s:'Confirm structure'},{t:'Variables',s:'Map the terms'},{t:'Review',s:'Check & submit'}];
const ST={draft:{l:'Draft',c:'p-none'},parsing:{l:'Parsing',c:'p-info'},saved:{l:'Saved',c:'p-warn'},failed:{l:'Failed',c:'p-bad'},completed:{l:'Completed',c:'p-good'}};
const SAMPLES=[
 {name:'Ayurs infotech 5L with maternity.pdf',mode:'clean',label:'Clean proposal'},
 {name:'Ayurs infotech 5L (scanned).pdf',mode:'partial',label:'Partly scanned'},
 {name:'Ayurs infotech 5L (corrupted).pdf',mode:'fail',label:'Unreadable file'}
];
const CAT=[
 {k:'policy.start_date',l:'Policy start date',s:'Policy basics',req:1},
 {k:'policy.end_date',l:'Policy end date',s:'Policy basics',req:1},
 {k:'policy.sum_insured',l:'Base sum insured',s:'Policy basics',req:1},
 {k:'policy.premium_basis',l:'Premium basis',s:'Policy basics'},
 {k:'cover.maternity.enabled',l:'Maternity cover',s:'Coverage & limits'},
 {k:'cover.maternity.limit',l:'Maternity limit',s:'Coverage & limits'},
 {k:'cover.room_rent',l:'Room rent limit',s:'Coverage & limits'},
 {k:'cover.copay_pct',l:'Co-pay (%)',s:'Coverage & limits'},
 {k:'cover.ambulance',l:'Ambulance cover limit',s:'Coverage & limits'},
 {k:'cover.daycare',l:'Day-care procedures',s:'Coverage & limits'},
 {k:'cover.opd',l:'OPD cover',s:'Coverage & limits'},
 {k:'waiting.initial_days',l:'Initial waiting period',s:'Waiting periods'},
 {k:'waiting.ped_months',l:'Pre-existing disease waiting',s:'Waiting periods'},
 {k:'waiting.maternity_months',l:'Maternity waiting',s:'Waiting periods'},
 {k:'members.child_max_age',l:'Dependent child max age',s:'Members'},
 {k:'members.parents_optin',l:'Parents cover opt-in',s:'Members'}
];
const CATD=Object.fromEntries(CAT.map(c=>[c.k,c]));
const SECS=['Policy basics','Coverage & limits','Waiting periods','Other terms found'];

/* ---------- builders ---------- */
function G(o){return {id:'g'+rid(),type:'MEMBER',conf:90,pages:[],rel:'Other',si:500000,ageMin:18,ageMax:65,mat:false,members:'',segs:[],ev:{},manual:false,edited:false,seen:false,extras:[],...o}}
function sampleGroups(s,l){return [
 G({name:`${s} · Employees`,type:'BASE',conf:94,pages:[4,9],rel:'Employee',si:500000,ageMin:18,ageMax:65,mat:true,members:'~1,240',segs:['Permanent employees','Contract employees'],
  ev:{4:`3.1 Eligible employees. {All permanent, full-time employees of ${l} on payroll}, aged 18 to 65 years, are covered from the date of joining. Sum insured: ₹5,00,000 per employee.`,9:'Annexure B, member census. {1,240 employees}; average age 31. Maternity benefit applies to all female employees and spouses of male employees.'}}),
 G({name:`${s} · Parents`,type:'MEMBER',conf:78,pages:[6,11],rel:'Parents',si:300000,ageMin:45,ageMax:80,mat:false,members:'~412',segs:['Father','Mother'],
  ev:{6:'3.3 Parents. Employees may opt to cover natural or adoptive parents. {Sum insured ₹3,00,000.} Parents\u2019 cover is voluntary and the premium is shared.',11:'Annexure D, parents opt-in. {412 employees} (preliminary figure, to be confirmed at enrolment).'}})
];}
function sampleLeft(s,partial){return [
 {id:'l1',title:'Spouse\u2019s parents (opt-in)',kind:'Clause',text:'Parents of the employee\u2019s spouse may be covered on an opt-in basis, subject to underwriting.',pages:[6,12],sug:{rel:'Parents',score:64},gname:`${s} · Spouse\u2019s parents`,rel:'Parents-in-law',res:null},
 {id:'l2',title:'Domestic partner declaration',kind:'Clause',text:partial?'This part of page 7 was too faint to read reliably. Check the original page before you decide.':'Domestic partners may be covered where the employee submits a declaration of cohabitation.',pages:[7],sug:null,gname:`${s} · Domestic partner`,rel:'Domestic partner',res:null,faint:partial},
 {id:'l3',title:'Rate table E-2',kind:'Table',text:'Rates for spouse-side dependants are quoted separately and don\u2019t match any group above.',pages:[12],sug:null,gname:`${s} · Spouse-side rates`,rel:'Other',res:null}
];}
function V(o){return {state:o.key?'pending':'unmapped',conf:null,how:null,note:null,req:null,rq:null,conflict:null,sug:null,miss:false,...o}}
function makeVars(p){
 const m=p.masterObj||MASTERS[0];
 const v=[
  V({id:'v1',label:'Policy commencement date',val:'01 Apr 2026',page:2,key:'policy.start_date',conf:98,sec:'Policy basics'}),
  V({id:'v2',label:'Policy expiry date',val:'31 Mar 2027',page:2,key:'policy.end_date',conf:98,sec:'Policy basics'}),
  V({id:'v3',label:'Sum insured per employee',val:'₹5,00,000',page:2,key:'policy.sum_insured',conf:97,sec:'Policy basics'}),
  V({id:'v4',label:'Premium calculation',val:'Per life',page:3,key:'policy.premium_basis',conf:82,sec:'Policy basics'}),
  V({id:'v5',label:'Maternity benefit',val:'Covered',page:8,key:'cover.maternity.enabled',conf:96,sec:'Coverage & limits'}),
  V({id:'v6',label:'Maternity limit',val:'₹75,000',page:8,key:'cover.maternity.limit',conf:93,sec:'Coverage & limits'}),
  V({id:'v7',label:'Room rent per day',val:'1% of sum insured',page:9,key:'cover.room_rent',conf:88,sec:'Coverage & limits'}),
  V({id:'v8',label:'Co-payment on parents',val:'10%',page:11,key:'cover.copay_pct',conf:74,sec:'Coverage & limits'}),
  V({id:'v9',label:'Initial waiting period',val:'30 days',page:10,key:'waiting.initial_days',conf:99,sec:'Waiting periods'}),
  V({id:'v10',label:'Pre-existing diseases covered after',val:'24 months',page:10,key:'waiting.ped_months',conf:91,sec:'Waiting periods'}),
  V({id:'v11',label:'Maternity waiting',val:'9 months',page:8,key:'waiting.maternity_months',conf:95,sec:'Waiting periods'}),
  V({id:'v12',label:'Ambulance cover',val:'Up to ₹3,000 per event',page:9,key:null,sug:{key:'cover.ambulance',score:46},sec:'Other terms found'}),
  V({id:'v13',label:'Corporate floater buffer',val:'₹5,00,000',page:13,key:null,sec:'Other terms found'}),
  V({id:'v14',label:'Wellness programme',val:'Annual health check-up',page:14,key:null,sec:'Other terms found'})
 ];
 if(p.mode==='partial'){const x=v[1];x.val=null;x.key=null;x.conf=null;x.state='unmapped';x.miss=true;x.req=true;x.note='We couldn\u2019t find this value. Page 2 was hard to read.'}
 const f=id=>v.find(x=>x.id===id);
 if(!m.maternity){f('v5').conflict={mv:'Not covered'};f('v6').conflict={mv:'Not covered'}}
 else if(m.matLimit!==75000){f('v6').conflict={mv:inr(m.matLimit)}}
 v.forEach(x=>{x.ev=x.miss?'The text on this page is too faint to read. Check the original document.':`The proposal states: {${x.label}: ${x.val}}.`});
 return v;
}
const RES=['confirmed','edited','manual','requested','ignored'];
const vres=v=>RES.includes(v.state);
const isReq=v=>!!(v.req||(v.key&&CATD[v.key]&&CATD[v.key].req));
const needsAtt=g=>!g.manual&&g.conf!=null&&g.conf<85&&!g.seen&&!g.edited;
function masterByLabel(l){return l?MASTERS.find(m=>l.startsWith(m.id))||null:null}

function hydrate(p){
 if(p.g)return;
 const short=(p.name.split(' ')[0]||'Client').replace(/^./,c=>c.toUpperCase());
 p.short=short;p.long=short==='Ayurs'?'Ayurs Infotech Pvt Ltd':short+' Pvt Ltd';
 p.masterObj=p.masterObj||masterByLabel(p.master)||MASTERS[0];
 p.g=sampleGroups(short,p.long);p.left=sampleLeft(short,p.mode==='partial');p.reqs=p.reqs||[];
 p.meta=p.meta||{pages:14,read:p.mode==='partial'?12:14,warn:p.mode==='partial'?[7,12]:[],secs:6.4};
 p.vars=makeVars(p);
 if(p.step>=2){p.left.forEach(l=>l.res={type:'ignored'})}
 if(p.step>=3){p.vars.forEach(v=>{if(v.state==='pending')v.state='confirmed';else if(v.state==='unmapped')v.state='ignored'})}
}

/* ---------- seeds / state ---------- */
const seed=()=>[
 {id:'PR-0150',name:'Northwind logistics 10L floater',file:'northwind-10L.pdf',master:'MP-2041 · Group Health 2026–27',status:'completed',step:4,max:4,updated:'2 h ago',mode:'clean'},
 {id:'PR-0149',name:'Kestrel foods 3L',file:'kestrel-3L.pdf',master:'MP-2210 · Group Health Top-up',status:'saved',step:2,max:2,updated:'5 h ago',mode:'clean'},
 {id:'PR-0148',name:'Bluepine health top-up',file:'bluepine-topup.pdf',master:'MP-2210 · Group Health Top-up',status:'saved',step:1,max:1,updated:'Yesterday',mode:'clean'},
 {id:'PR-0147',name:'Orbit labs 5L with OPD',file:'orbit-5L-opd (scanned).pdf',master:'MP-2041 · Group Health 2026–27',status:'saved',step:0,max:0,updated:'Yesterday',mode:'partial'},
 {id:'PR-0146',name:'Halcyon retail 2L',file:'halcyon-2L.pdf',master:null,status:'draft',updated:'2 days ago',draft:{file:{name:'halcyon-2L.pdf',size:'1.8 MB',mode:'clean'},master:''}},
 {id:'PR-0145',name:'Zenith pharma 3L',file:null,master:null,status:'draft',updated:'3 days ago',draft:{file:null,master:''}},
 {id:'PR-0144',name:'Meridian textiles 7.5L',file:'meridian-7-5L.pdf',master:'MP-2041 · Group Health 2026–27',status:'completed',step:4,max:4,updated:'3 days ago',mode:'clean'},
 {id:'PR-0143',name:'Quill studios 2L',file:'quill-2L (corrupted).pdf',master:'MP-2210 · Group Health Top-up',status:'failed',step:0,max:0,updated:'4 days ago',mode:'fail',pct:55,fail:true}
];
const blankNf=()=>({name:'',file:null,master:'',newName:'',insurer:'Northstar General',err:null});
const S={view:'overview',pid:null,co:COMPANIES[0],menu:null,gm:null,lm:null,sb:false,col:false,tab:'all',hq:'',vtab:'all',vq:'',seq:151,reqSeq:231,
 props:seed(),masters:[...MASTERS],nf:blankNf(),nfid:null,removed:null};
try{S.col=localStorage.getItem('sbc')==='1'}catch(e){}
S.intake=false;S.from='overview';
/* Two versions are shipped: internal v3 is shown as V1 (smart review), v4 as V2 (idealistic). */
const VLAB={v3:'V1',v4:'V2',v5:'V3'};
let VER='v3';try{VER=['v3','v4','v5'].includes(localStorage.getItem('ver'))?localStorage.getItem('ver'):'v3'}catch(e){}
let ptimer=null,pendingConfirm=null,lastFocus=null;
const cur=()=>S.props.find(p=>p.id===S.pid);

/* ---------- small renderers ---------- */
function pill(g){
 if(g.manual||g.conf==null) return `<span class="pill p-info"><b>Added manually</b></span>`;
 if(g.conf>=95) return `<span class="pill p-good"><b>${g.conf}%</b> Looks good</span>`;
 if(g.conf>=85) return `<span class="pill p-warn"><b>${g.conf}%</b> Review recommended</span>`;
 return `<span class="pill p-bad"><b>${g.conf}%</b> Attention required</span>`;
}
const tag=(g,sm)=>`<span class="tag ${sm?'sm':''}">${g.type==='BASE'?'Base':'Member'}</span>`;
const spill=s=>`<span class="pill ${ST[s].c}"><span class="d"></span>${ST[s].l}</span>`;
const mark=p=>{p.updated='Just now';p.savedAt=nowT()};
