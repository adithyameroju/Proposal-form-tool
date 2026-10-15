/* ================= PAT UI skin =================
   A visual skin only. The pages, structure and content stay exactly as they are;
   body.pat re-styles them in the Policy Authoring Tool look (purple sidebar,
   white header with a partner select, light-grey canvas, Ant Design style
   controls). All styling lives in src/styles/09-pat.css.
   Toggle: the "PAT UI" switch in the header, next to the Version menu. */

const PAT=()=>!!W.pat;
W.pat=false;try{W.pat=localStorage.getItem('pat')==='1'}catch(e){}

function patSw(){
 return `<label class="pat-sw" title="Show the Policy Authoring Tool look"><span>PAT UI</span><button type="button" class="swb ${PAT()?'on':''}" role="switch" aria-checked="${PAT()}" aria-label="PAT UI" data-act="togglePat"><i></i></button></label>`;
}

Object.assign(ACT,{
 togglePat(){
  W.pat=!W.pat;try{localStorage.setItem('pat',W.pat?'1':'0')}catch(e){}
  S.menu=null;if(!S.intake)closeOv();
  if(typeof spotEnd==='function'&&SPOT.on)spotEnd(false);
  render();toast(W.pat?'PAT UI on':'PAT UI off');
 }
});
