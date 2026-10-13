/* ================= render ================= */
function renderPage(){
 if((VER!=='v1'?W.view:S.view)==='feedback'){$('#page').innerHTML=feedbackPage();return}
 if(VER!=='v1'){const sl=[...document.querySelectorAll('.xwrap')].map(e=>e.scrollLeft);$('#page').innerHTML=wPage();document.querySelectorAll('.xwrap').forEach((e,i)=>{if(sl[i])e.scrollLeft=sl[i]});wAfterPage();return}
 let body='';
 if(S.view==='overview')body=viewOverview();
 else if(S.view==='proposals')body=viewProposals1();
 else if(S.view==='new')body=newPageV1();
 else{const p=cur();body=`<div class="crumbs"><button class="back" data-act="back" aria-label="Go back">${ic('left',17)}</button><nav aria-label="Breadcrumb"><ol>${crumbs()}</ol></nav></div>`+flowPage(p)}
 $('#page').innerHTML=body;
 if(S.view==='proposal'){const p=cur();if(p.status==='parsing')paintParse(p)}
}
function renderBar(){
 const b=$('#bar');let h='';
 if(VER!=='v1'){h=W.view==='new'?wIntakeBar():wBar(W.view==='proposal'?wcur():null)}
 else if(S.view==='new')h=intakeBar();
 else if(S.view==='proposal'){const p=cur();if(p.status!=='parsing'&&p.status!=='failed'){if(p.step===1)h=barGroups(p);else if(p.step===2)h=barVars(p);else if(p.step===3)h=barReview(p)}}
 if(h){b.style.display='';b.innerHTML=h;document.body.classList.add('hasbar')}else{b.style.display='none';b.innerHTML='';document.body.classList.remove('hasbar')}
}
function render(top){document.body.dataset.ver=VER;if(S.intake&&((VER!=='v1'?W.view:S.view)!=='new')){S.intake=false;W.intake=null}renderSb();renderTop();renderPage();renderBar();renderTour();if(top)window.scrollTo({top:0})}

/* ================= overlays ================= */
function openOv(kind,{title,sub,body,foot,wide,mount}){
 lastFocus=document.activeElement;
 $('#overlay').innerHTML=`<div class="scrim" data-act="closeOv"></div><div class="${kind}${wide?' wide':''}" role="dialog" aria-modal="true" aria-labelledby="ovt"><div class="ov-h"><div><h3 id="ovt">${title}</h3>${sub?`<p>${sub}</p>`:''}</div><button class="icon-btn" data-act="closeOv" aria-label="Close">${ic('x',20)}</button></div><div class="ov-b">${body}</div>${foot?`<div class="ov-f">${foot}</div>`:''}</div>`;
 $('#overlay').classList.add('open');
 if(mount)mount();
 const f=$('#overlay').querySelector('input:not([type=radio]):not([type=checkbox]):not([readonly]),select,textarea')||$('#overlay').querySelector('.ov-f .btn-p,.ov-f .btn');
 if(f)f.focus();
}
function closeOv(){const wasIntake=S.intake;S.intake=false;if(wasIntake){if(wasIntake==='w'){W.view=W.fromNew||'overview'}else{S.view=S.fromNew||'overview'};W.intake=null;render(true)}$('#overlay').classList.remove('open');$('#overlay').innerHTML='';renderTour();if(lastFocus&&lastFocus.focus&&document.contains(lastFocus))lastFocus.focus()}
function confirmDlg({title,body,label,danger,onOk}){
 pendingConfirm=onOk;
 openOv('modal',{title,body:`<p style="margin:0;color:var(--ink-2)">${body}</p>`,foot:`<button class="btn" data-act="closeOv">Cancel</button><button class="btn ${danger?'btn-d':'btn-p'}" data-act="confirmOk">${label}</button>`});
}
function toast(msg,o={}){
 const el=document.createElement('div');el.className='toast'+(o.err?' err':'');
 el.innerHTML=`<span>${msg}</span>${o.undo?`<button data-act="undoRemove">Undo</button>`:''}${o.open?`<button data-act="openProp" data-id="${o.open}">Open</button>`:''}${o.wopen?`<button data-act="w_open" data-id="${o.wopen}">Open</button>`:''}${o.wundo?`<button data-act="w_undoPrefill">Undo</button>`:''}${o.uundo?`<button data-act="w_undoLast">Undo</button>`:''}`;
 const box=$('#toasts');if(box.lastChild&&box.lastChild.textContent===el.textContent)box.lastChild.remove();while(box.children.length>=2)box.firstChild.remove();box.appendChild(el);setTimeout(()=>el.remove(),o.undo||o.open||o.wopen||o.wundo||o.uundo?7000:3000);
}

/* ---------- group forms ---------- */
const readType=()=>{const r=document.querySelector('input[name="f-type"]:checked');return r?r.value:'MEMBER'};
function groupForm(g,adding){
 return `
  <div class="fld"><label for="f-name">Group name</label><input class="in" id="f-name" value="${esc(g.name||'')}" placeholder="e.g. Ayurs · Siblings"></div>
  <div class="fld"><span class="lb" id="lb-t">Group type</span><div class="seg" role="radiogroup" aria-labelledby="lb-t"><label><input type="radio" name="f-type" value="BASE" ${g.type==='BASE'?'checked':''}><span>Base</span></label><label><input type="radio" name="f-type" value="MEMBER" ${g.type!=='BASE'?'checked':''}><span>Member</span></label></div>
   <small>Base is the primary insured member. Each proposal needs one.</small></div>
  <div class="fld"><label for="f-rel">Relationship covered</label><select class="in" id="f-rel">${REL.map(r=>`<option ${g.rel===r?'selected':''}>${r}</option>`).join('')}</select></div>
  ${adding?'':`<div class="row2"><div class="fld"><label for="f-si">Sum insured</label><input class="in" id="f-si" type="number" min="0" step="10000" value="${g.si}"></div><div class="fld"><label for="f-mem">Members</label><input class="in" id="f-mem" value="${esc(g.members||'')}" placeholder="e.g. ~1,240"></div></div>
  <div class="row2"><div class="fld"><label for="f-amin">Age from</label><input class="in" id="f-amin" type="number" min="0" value="${g.ageMin}"></div><div class="fld"><label for="f-amax">Age to</label><input class="in" id="f-amax" type="number" min="0" value="${g.ageMax}"></div></div>
  <label class="sw"><span><b>Maternity cover</b><span>Applies to members in this group</span></span><input type="checkbox" id="f-mat" ${g.mat?'checked':''}></label>`}`;
}
function showEvidence(title,sub,pages,pg,text,tabAct,idAttr){
 const html=esc(text).replace(/\{([^}]*)\}/g,'<mark>$1</mark>');
 openOv('modal',{title,sub:esc(sub),wide:1,
  body:`${pages.length>1?`<div class="tabs2" role="tablist">${pages.map(x=>`<button role="tab" aria-selected="${x===pg}" data-act="${tabAct}" data-id="${idAttr}" data-p="${x}">Page ${x}</button>`).join('')}</div>`:''}
   <div class="paper"><div class="ph2"><span>${esc(cur().file)}</span><span>Page ${pg} of ${cur().meta.pages}</span></div><div class="ln" style="width:40%"></div><div class="ln" style="width:72%"></div><p>${html}</p><div class="ln" style="width:86%"></div><div class="ln" style="width:60%"></div></div>
   <p class="note" style="margin-top:12px">Highlighted text is what the parser used.</p>`,
  foot:`<button class="btn btn-p" data-act="closeOv">Done</button>`});
}
function showGEv(g,pg){g.seen=true;showEvidence('Source evidence',g.name,g.pages,pg,g.ev[pg]||`Page ${pg} describes {${g.name}}.`,'evTab',g.id);renderPage();renderBar()}

/* ---------- variable drawer & requests ---------- */
function catOptions(sel,withNone){
 return (withNone?`<option value="">Don\u2019t map this term</option>`:`<option value="">Choose a variable</option>`)+
  ['Policy basics','Coverage & limits','Waiting periods','Members'].map(s=>`<optgroup label="${s}">${CAT.filter(c=>c.s===s).map(c=>`<option value="${c.k}" ${c.k===sel?'selected':''}>${esc(c.l)}</option>`).join('')}</optgroup>`).join('');
}
function varDrawer(v,mode){
 const title=mode==='edit'?'Edit mapping':mode==='map'?'Map to a variable':'Add manually';
 const sel=mode==='map'?(v.sug?v.sug.key:''):(v.key||'');
 const sub=mode==='manual'?'Enter the value yourself and pick the variable it belongs to.':mode==='map'?'Pick the variable this term should map to.':'Change the variable, or fix the value we read.';
 openOv('modal',{title,sub,
  body:`<div class="ev-strip"><span><b>${esc(v.label)}</b></span><span class="chip">${ic('file',13)}p. ${v.page}</span></div>
   ${mode==='map'&&v.sug?`<div class="alert a-info">${ic('spark',18)}<div>Closest match is <b>${esc(CATD[v.sug.key].l)}</b> (${v.sug.score}%). Check it before you save.</div></div>`:''}
   <div class="fld"><label for="vd-key">Maps to variable</label><select class="in" id="vd-key">${catOptions(sel,mode==='edit')}</select></div>
   <div class="fld"><label for="vd-val">Value</label><input class="in" id="vd-val" value="${esc(v.val||'')}" ${mode==='map'?'readonly':''} placeholder="${mode==='manual'?'e.g. 31 Mar 2027':''}">${mode==='map'?'<small>This is the value we read from the document.</small>':''}</div>
   <div class="paper"><div class="ph2"><span>What the document says</span><span>Page ${v.page}</span></div><p>${esc(v.ev).replace(/\{([^}]*)\}/g,'<mark>$1</mark>')}</p></div>`,
  foot:`<button class="btn" data-act="closeOv">Cancel</button><button class="btn btn-p" data-act="saveVar" data-id="${v.id}" data-mode="${mode}">${mode==='manual'?'Save value':'Save & confirm'}</button>`});
}
function openRequest(kind,id){
 const p=cur();const it=kind==='var'?p.vars.find(x=>x.id===id):kind==='left'?p.left.find(x=>x.id===id):null;
 const title=it?(it.label||it.title):'Document';
 const types=kind==='doc'?[['parser','The parser couldn\u2019t read this file'],['other','Something else']]:[['new','We need a new variable for this'],['wrong','The suggested mapping looks wrong'],['parser','The parser couldn\u2019t read this term']];
 openOv('modal',{title:'Raise a request',sub:'The product team picks these up, usually within one working day. You can carry on meanwhile.',
  body:`<div class="fld"><span class="lb" id="rq-l">What\u2019s the problem?</span><div class="opt-list" role="radiogroup" aria-labelledby="rq-l">${types.map((t,i)=>`<label class="opt"><input type="radio" name="rq-t" value="${t[0]}" ${i===0?'checked':''}><span><b>${t[1]}</b></span></label>`).join('')}</div></div>
   <div class="fld"><label for="rq-n">${kind==='doc'?'Subject':'Name of the variable or term'}</label><input class="in" id="rq-n" value="${esc(title)}"></div>
   <div class="fld"><label for="rq-d">Details for the team</label><textarea class="in" id="rq-d" placeholder="What should it map to, and why?"></textarea></div>`,
  foot:`<button class="btn" data-act="closeOv">Cancel</button><button class="btn btn-p" data-act="submitReq" data-kind="${kind}" data-id="${id||''}">${ic('msgPlus',16)}Raise request</button>`});
}
