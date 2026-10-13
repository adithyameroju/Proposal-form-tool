/* ---------- feedback (both versions) + V2 section tabs ---------- */
const FBTYPES=['Idea','UX issue','Bug','Parser issue'];
const FB={seq:5,items:[
 {id:'FB-0004',type:'Idea',msg:'Let me compare two versions of a proposal side by side before I accept a revision.',ctx:'Proposal · Document',at:new Date(Date.now()-26*3600000).toISOString(),status:'In review'},
 {id:'FB-0003',type:'UX issue',msg:'The confidence pills are hard to tell apart for colour-blind users. Add an icon.',ctx:'Overview',at:new Date(Date.now()-90*3600000).toISOString(),status:'Received'}
],draft:{type:'Idea',msg:'',ctx:'Overview',follow:true,shot:true}};
function fbContext(){
 if(VER!=='v1'){const v=W.view;if(v==='proposal'){const p=wcur();return p?`${p.ref} · ${WSTAGE_L[W.stage]||'Proposal'}`:'Proposal'}return ({overview:'Overview',proposals:'Proposals',packages:'Packages',partners:'Partner variables',activity:'Activity',new:'New proposal',feedback:FB.draft.ctx||'Overview'})[v]||'Overview'}
 const v=S.view;if(v==='proposal'){const p=cur();return p?`${p.id} · ${pvLabel(p)}`:'Proposal'}return ({overview:'Overview',proposals:'Proposals',new:'New proposal',feedback:FB.draft.ctx||'Overview'})[v]||'Overview';
}
function fbRefresh(){
 const n=FB.draft.msg.trim().length,ok=n>=10;const b=$id('fbsend');if(b)b.disabled=!ok;
 const h=$id('fbhint');if(h)h.textContent=ok?'Looks good.':`A few more words please (${10-n} to go).`;
}
function feedbackPage(){
 const d=FB.draft,ok=d.msg.trim().length>=10;
 return `<div class="ph"><div><h1>Feedback</h1><p>Tell us what to fix or build. Your note is tied to the page you were on.</p></div></div>
  <div class="wgrid"><section class="card"><div class="card-h"><div><h3>Send feedback</h3><p>Specific beats long. What happened, and what did you expect?</p></div></div><div class="card-b">
   <div class="fld"><span class="lb" id="fbt">What kind of feedback?</span><div class="seg" role="radiogroup" aria-labelledby="fbt">${FBTYPES.map(t=>`<label><input type="radio" name="fbtype" value="${t}" ${d.type===t?'checked':''} data-wc="fbType"><span>${t}</span></label>`).join('')}</div></div>
   <div class="fld"><label for="fbctx">About</label><input class="in" id="fbctx" value="${esc(d.ctx)}" data-wi="fbCtx"><small>Captured from where you were. Edit it if your note is about something else.</small></div>
   <div class="fld"><label for="fbmsg">Your feedback</label><textarea class="in" id="fbmsg" rows="5" data-wi="fbMsg" placeholder="e.g. After confirming groups I expected to land on the first unplaced term…">${esc(d.msg)}</textarea><small id="fbhint">${ok?'Looks good.':`A few more words please (${10-d.msg.trim().length} to go).`}</small></div>
   <label class="chkrow"><input type="checkbox" data-wc="fbShot" ${d.shot?'checked':''}> Attach a snapshot of the page state (names, IDs and step. No document text.)</label>
   <label class="chkrow"><input type="checkbox" data-wc="fbFollow" ${d.follow?'checked':''}> The product team can contact me about this</label>
   <div style="display:flex;justify-content:flex-end;margin-top:14px"><button class="btn btn-p" id="fbsend" data-act="fbSend" ${ok?'':'disabled'}>${ic('arrow',16)}Send feedback</button></div></div></section>
   <aside class="col2"><section class="card"><div class="card-h"><div><h3>Your recent feedback</h3><p>${FB.items.length} sent</p></div></div>${FB.items.length?`<ul class="feed">${FB.items.map(i=>`<li><b>${i.id} <span class="chip" style="margin-left:4px">${esc(i.type)}</span> <span class="pill ${i.status==='In review'?'p-info':'p-none'}" style="margin-left:4px">${i.status}</span></b><span>${esc(i.msg)}</span><em>${esc(i.ctx)} · ${wAgo(i.at)}</em></li>`).join('')}</ul>`:'<div class="empty-t">Nothing sent yet.</div>'}</section></aside></div>`;
}
function wSubnav(active){
 const pk=W.packages.filter(k=>k.partnerId===S.co.id).length,fz=W.partners[S.co.id].frozen;
 const t=(v,l,x)=>`<button role="tab" aria-selected="${active===v}" data-act="w_nav" data-v="${v}">${l}${x?`<span>${x}</span>`:''}</button>`;
 return `<div class="subnav" role="tablist" aria-label="Proposal sections">${t('proposals','Proposals',wProps().length)}${t('packages','Packages',pk||'')}${t('partners','Partner variables','')}${t('activity','Activity','')}</div>`;
}
Object.assign(WCH,{fbType(el){FB.draft.type=el.value},fbShot(el){FB.draft.shot=el.checked},fbFollow(el){FB.draft.follow=el.checked}});
Object.assign(WIN,{fbMsg(el){FB.draft.msg=el.value;fbRefresh()},fbCtx(el){FB.draft.ctx=el.value}});
Object.assign(ACT,{
 toFeedback(t,e){e&&e.preventDefault&&e.preventDefault();FB.draft.ctx=fbContext();if(VER!=='v1'){W.view='feedback';W.pid=null}else{S.view='feedback'}S.sb=false;render(true)},
 fbSend(){
  const d=FB.draft;if(d.msg.trim().length<10)return;const id='FB-'+String(FB.seq++).padStart(4,'0');
  FB.items.unshift({id,type:d.type,msg:d.msg.trim(),ctx:d.ctx||'General',at:new Date().toISOString(),status:'Received'});
  if(VER!=='v1')wAudit('Feedback sent',`${id} · ${d.type} · ${d.ctx}`);FB.draft.msg='';render();toast(`Thanks. ${id} was sent with your page context.`);
 }
});

/* ---------- full-page flow (used by New proposal in both versions) ---------- */
function openPage({title,sub,body,foot}){
 lastFocus=document.activeElement;
 $('#overlay').innerHTML=`<div class="fpage" role="dialog" aria-modal="true" aria-labelledby="ovt"><div class="fph"><button class="back" data-act="closeOv" aria-label="Back">${ic('left',17)}</button><div class="fpt"><h3 id="ovt">${title}</h3>${sub?`<p>${sub}</p>`:''}</div><button class="icon-btn" data-act="closeOv" aria-label="Close">${ic('x',20)}</button></div><div class="ov-b"><div class="fpin">${body}</div></div>${foot?`<div class="ov-f">${foot}</div>`:''}</div>`;
 $('#overlay').classList.add('open');
 const f=$('#overlay').querySelector('input:not([type=radio]):not([type=checkbox]):not([readonly]),select,textarea');if(f)f.focus({preventScroll:true});
}

wInit();
