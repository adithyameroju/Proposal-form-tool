/* ================= shell ================= */
function renderSb(){
 const n=(ico,t,cur,cnt,a)=>`<a href="#" data-tip="${t}" ${cur?'aria-current="page"':''} data-act="${a}">${ic(ico,20)}<span class="lbl">${t}</span>${cnt?`<span class="count">${cnt}</span>`:''}</a>`;
 $('#app').classList.toggle('col',S.col);
 const sb=$('#sb');sb.className='sb'+(S.col?' c':'')+(S.sb?' open':'');
 $('#sbscrim').className='sb-scrim'+(S.sb?' open':'');
 const v=VER!=='v1'?W.view:S.view;
 const inProp=['proposals','proposal','packages','partners','activity','new'].includes(v);
 const cnt=VER!=='v1'?wProps().length:S.props.length;
 sb.innerHTML=`
  <div class="brand"><button class="tg" data-tip="${S.col?'Expand sidebar':'Collapse sidebar'}" data-act="toggleCol" aria-label="${S.col?'Expand':'Collapse'} sidebar" aria-pressed="${S.col}">${ic('menu',20)}</button><div class="brand-mark">${ic('shield',18,2.2)}</div><div class="bt"><b>Proposal form</b><span>Ops console</span></div></div>
  <nav class="nav" aria-label="Main">
   ${n('dash','Overview',v==='overview','','toOverview')}
   ${n('file','Proposals',inProp,cnt,'toProposals')}
   ${n('msg','Feedback',v==='feedback','','toFeedback')}
  </nav>
  <div class="sb-foot"><a href="#" data-tip="Reset prototype" data-act="resetVer">${ic('refresh',20)}<span class="lbl">Reset prototype</span></a></div>`;
}
function pvLabel(p){
 if(p.status==='parsing')return 'Parsing';if(p.status==='failed')return 'Parsing failed';
 return ['Parsing status','Groups','Variables','Review','Submitted'][p.step];
}
function crumbs(){
 const p=cur();
 return `<li><a href="#" data-act="toProposals">Proposals</a>${ic('right',14)}</li><li><span class="t">${esc(p.name)}</span>${ic('right',14)}</li><li aria-current="page">${pvLabel(p)}</li>`;
}
function verMenu(){
 const open=S.menu==='ver';
 const opt=(v,t,d)=>`<button class="pop-item vopt" role="menuitemradio" aria-checked="${VER===v}" data-act="pickVer" data-v="${v}"><span class="vb">${VLAB[v]}</span><span class="t"><b>${t}</b><span>${d}</span></span>${VER===v?`<span class="ck">${ic('check',18,2.5)}</span>`:''}</button>`;
 return `<div class="ver"><button class="ver-btn" data-act="toggleVer" aria-haspopup="true" aria-expanded="${open}" aria-label="Prototype version: ${VLAB[VER]}"><span>Version</span><b class="vb">${VLAB[VER]}</b>${ic('down',14)}</button>
  ${open?`<div class="pop ver-pop" role="menu"><h4>Prototype version</h4>${opt('v3','Smart review','Groups, left-overs, templates with auto-matched terms, plans and packages')}${opt('v4','Idealistic','Everything in V1 plus a work queue, keyboard shortcuts, command palette, side-by-side source, autosave and a faster data grid')}</div>`:''}</div>`;
}
function meMenu(){
 const open=S.menu==='me';
 return `<div class="me-w"><button class="icon-btn me" data-act="toggleMe" aria-haspopup="true" aria-expanded="${open}" aria-label="Account menu">RK</button>
  ${open?`<div class="pop me-pop" role="menu"><div class="mi"><b>Riya Kulkarni</b><span>${VER!=='v1'&&W.role==='admin'?'Administrator (demo)':'Operator'}</span></div>${VER!=='v1'?`<button class="pop-item" role="menuitem" data-act="w_role">${ic('shield',18)}<span class="t"><b>Switch to ${W.role==='admin'?'operator':'admin (demo)'}</b><span>Admins can freeze partner variables</span></span></button>`:''}<button class="pop-item" role="menuitem" data-act="demo">${ic('help',18)}<span class="t"><b>Help &amp; docs</b></span></button></div>`:''}</div>`;
}
function renderTop(){
 const c=S.co;
 $('#top').innerHTML=`
  <button class="icon-btn menu-btn" data-act="toggleSb" aria-label="Open navigation">${ic('menu',20)}</button>
  ${VER==='v4'?`<button class="cmdk-btn" data-act="cmdk">${ic('search',16)}<span>Search or jump to</span><kbd>⌘K</kbd></button><span class="saved" id="savedind">${ic('check',13,2.5)}<span id="savedtx">${wSavedText()}</span></span>`:''}
  <div class="top-r">${verMenu()}
   <div class="co">
    <button class="co-btn" data-act="toggleCo" aria-haspopup="true" aria-expanded="${S.menu==='co'}">
     <span class="av" style="background:${c.color}">${c.short.slice(0,2).toUpperCase()}</span>
     <span class="t"><b>${esc(c.name)}</b></span>${ic('down',16)}
    </button>
    ${S.menu==='co'?`<div class="pop" role="menu"><h4>Switch company</h4>
     ${COMPANIES.map(x=>`<button class="pop-item" role="menuitem" data-act="pickCo" data-id="${x.id}"><span class="av" style="background:${x.color}">${x.short.slice(0,2).toUpperCase()}</span><span class="t"><b>${esc(x.name)}</b><span>${x.cid}</span></span>${x.id===c.id?`<span class="ck">${ic('check',18,2.5)}</span>`:''}</button>`).join('')}
     <dl class="co-detail"><dt>Industry</dt><dd>${c.industry}</dd><dt>Employees covered</dt><dd>${c.emp}</dd><dt>Next renewal</dt><dd>${c.renewal}</dd><dt>Account manager</dt><dd>${c.am}</dd></dl></div>`:''}
   </div>
   <button class="icon-btn" data-act="${SMART()?'startTourW':'demo'}" aria-label="${SMART()?'Take the tour':'Help'}" title="${SMART()?'Take the tour':'Help'}">${ic('help',20)}</button>
   <button class="icon-btn" data-act="demo" aria-label="Notifications">${ic('bell',20)}<span class="dot"></span></button>
   ${meMenu()}
  </div>`;
}
