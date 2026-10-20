(function () {
  'use strict';
  if(window.SMARTLIB_CONFIG.environment!=='demo')return;
  window.enterSmartlibDemo=async function(type,id){
    const action=type?'member_login':'login';
    const result=await window.api({action,type,member_id:id},0);
    if(!result.ok){toast(result.error,'er');return;}
    window._tok=_tok=result.data.sessionToken;
    window._me=_me=result.data.user;
    window._mR=_mR=result.data.user.peranan;
    await window.loadAllOnce(false);
    masuklah();
    if(type&&typeof limitAhliSirkulasi==='function')limitAhliSirkulasi();
  };
  document.getElementById('l-admin').innerHTML='<div class="l-hint">Semua data ialah rekaan. Gunakan data demo sahaja. Perubahan hilang selepas refresh.</div><button class="l-btn" id="demo-enter" onclick="enterSmartlibDemo()">Buka Demo Admin / GPM</button>';
  document.getElementById('l-ahli').innerHTML='<div class="l-hint">Pilih ahli rekaan untuk mencuba.</div><button class="l-btn cy" onclick="enterSmartlibDemo(\'murid\',\'1\')">Ahmad Demo</button><button class="l-btn cy" onclick="enterSmartlibDemo(\'murid\',\'2\')">Aisyah Demo</button>';
  document.getElementById('l-sch').textContent=AP.sch+' — DATA DEMO SAHAJA';
  document.getElementById('tb-sub').textContent='DEMO · Data rekaan sahaja';
  // Preserve the legacy Enter shortcut without collecting any credentials.
  window.doLogin=function(){return window.enterSmartlibDemo();};
  const legacyShowLogin=window.showLogin;
  window.showLogin=function(){
    document.getElementById('lw').style.display='';
    if(document.getElementById('lp'))legacyShowLogin();
  };
})();
