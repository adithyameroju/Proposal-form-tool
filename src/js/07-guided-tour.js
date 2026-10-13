/* ================= guided tour ================= */
function tourLeft(){
 const p=cur();const par=p.g.find(g=>g.rel==='Parents');
 const l1=p.left.find(l=>l.id==='l1');par.extras.push(l1.title);l1.res={type:'assigned',gid:par.id};
 const l2=p.left.find(l=>l.id==='l2');const ev={};l2.pages.forEach(n=>ev[n]=`${l2.title}. {${l2.text}}`);
 const ng=G({name:l2.gname,type:'MEMBER',conf:null,manual:true,rel:l2.rel,pages:[...l2.pages],ev});p.g.push(ng);l2.res={type:'created',gid:ng.id};
 const l3=p.left.find(l=>l.id==='l3');const rq={id:'REQ-0'+S.reqSeq++,title:l3.title,type:'new',kind:'left'};p.reqs.push(rq);l3.res={type:'request',req:rq.id};
 mark(p);render();
}
function tourVars(){
 const p=cur();const f=id=>p.vars.find(v=>v.id===id);
 p.vars.forEach(v=>{if(v.state==='pending'&&!v.conflict)v.state='confirmed'});
 const v6=f('v6');v6.state='confirmed';v6.note='Overrides the master policy';
 const v12=f('v12');v12.key='cover.ambulance';v12.state='edited';v12.how='map';
 const v13=f('v13');const rq={id:'REQ-0'+S.reqSeq++,title:v13.label,type:'new',kind:'var'};p.reqs.push(rq);v13.state='requested';v13.rq=rq.id;
 f('v14').state='ignored';
 mark(p);render();
}
const TOUR=[
 {t:'Your proposal history',x:'Drafts, saved states and completed work live here as simple numbers and a searchable table. New proposal is the one primary action.',run(){S.tab='all';S.hq='';S.view='overview';render(true)},focus:'.kpis'},
 {t:'Start a new proposal in place',x:'New proposal opens right on the page you are on. Upload the PDF and map it to a master policy. Parsing only starts once both are set, and you can save it as a draft instead.',run(){ACT.newProposal();ACT.useSample({dataset:{i:0}})},focus:'.fpg'},
 {t:'Parsing the document',x:'The page is read in four phases with live counters. You can leave and come back; parsing continues in the background.',run(){ACT.startParse()},wait:()=>{const p=cur();return p&&p.status==='saved'},waitMsg:'Parsing…'},
 {t:'Parsing status',x:'A summary of what was found: pages read, variables, groups and the left-over terms to place. Review groups is the next step.',run(){},focus:'.stat4'},
 {t:'Groups detected',x:'Edit a group, or use the menu to merge, split or remove it. Page links open the source evidence the parser used.',run(){ACT.reviewGroups()},focus:'.rv'},
 {t:'Left over from the document',x:'Terms the parser couldn\u2019t attach to a group are listed here. You can\u2019t confirm the structure until each one is placed.',run(){},focus:'.lhead'},
 {t:'Placing the left-over terms',x:'Here one was assigned to Parents, one became its own group, and one raised a request. Ignoring a term is also an option.',run(){tourLeft()},focus:'.lhead'},
 {t:'Confirm the groups',x:'Once everything is placed, the confirm button unlocks. A flagged group asks for a second look first, then variable mapping opens.',run(){cur().g.forEach(g=>g.seen=true);ACT.confirmGroups()},focus:'.intro'},
 {t:'Map the variables',x:'Every term in the proposal is matched to a system variable with a confidence score. Confirm, edit, or deal with the ones that did not map.',run(){},focus:'.vtool'},
 {t:'Resolving the variables',x:'High-confidence rows were confirmed, the maternity limit used the proposal value, one term was mapped by hand, one raised a request, one was left out.',run(){tourVars()},focus:'.vtool'},
 {t:'Review and submit',x:'A last summary of groups, variables and left-over terms. Open requests are flagged but don\u2019t block you.',run(){ACT.toReview()},focus:'.rgrid'},
 {t:'Submitted',x:'The proposal now sits in your history as Completed. That\u2019s the whole flow.',run(){ACT.submit()},focus:'.narrow'}
];
function renderTour(){
 const el=$('#tour');if(!S.tour||VER!=='v1'){el.innerHTML='';el.style.display='none';return}
 const i=S.tour.i,s=TOUR[i];const blocked=s.wait&&!s.wait();
 el.style.display='block';
 el.innerHTML=`<div class="tp"><div class="tm">Guided tour · ${i+1} of ${TOUR.length}</div><h3>${s.t}</h3><p>${s.x}</p>
  <div class="dots" aria-hidden="true">${TOUR.map((_,k)=>`<i class="${k<=i?'on':''}"></i>`).join('')}</div>
  <div class="tb"><button class="btn btn-sm btn-t" data-act="tourExit">Exit tour</button><button class="btn btn-sm btn-p" data-act="tourNext" ${blocked?'disabled':''}>${blocked?s.waitMsg:i===TOUR.length-1?'Finish':'Next'}</button></div></div>`;
}
function tourDock(){
 const el=$('#tour');if(!el||!S.tour)return;
 const f=TOUR[S.tour.i].focus&&document.querySelector(TOUR[S.tour.i].focus);
 if(!f){el.classList.remove('top');return}
 const r=f.getBoundingClientRect();const mid=r.top+r.height/2;
 el.classList.toggle('top',mid>window.innerHeight*0.55);
}
function tourFocus(s){
 const el=$('#tour');el&&el.classList.remove('top');
 if(!s.focus)return;
 setTimeout(()=>{const f=document.querySelector(s.focus);if(!f)return;f.scrollIntoView({block:'center',behavior:'smooth'});f.classList.add('tour-hl');setTimeout(()=>f.classList.remove('tour-hl'),2400);setTimeout(tourDock,650)},150);
}
Object.assign(ACT,{
 startTour(){S.tour={i:0};TOUR[0].run();renderTour();tourFocus(TOUR[0])},
 tourNext(){
  if(!S.tour)return;
  if(S.tour.i>=TOUR.length-1){ACT.tourExit();return}
  S.tour.i++;const s=TOUR[S.tour.i];s.run();renderTour();tourFocus(s);
 },
 tourExit(){S.tour=null;renderTour()}
});
