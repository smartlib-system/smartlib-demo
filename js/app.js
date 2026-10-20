(function () {
  'use strict';
  const {config,state}=window.smartlibConfiguration;
  const jsonResponse=data=>new Response(JSON.stringify(data),{headers:{'Content-Type':'application/json;charset=utf-8'}});
  const failure=(type,message)=>{const error=new Error(type+' ERROR: '+message);error.errorType=type;return error;};
  function loadScript(src){return new Promise((resolve,reject)=>{const script=document.createElement('script');script.src=src;script.onload=resolve;script.onerror=()=>reject(failure('CONFIG','Fail persekitaran demo tidak dapat dimuatkan.'));document.head.appendChild(script);});}
  // Keep the same index/core in all deployments. Only demo loads its local simulation layer.
  window.SMARTLIB_ENV_READY=Promise.resolve();
  if(config.environment==='demo'&&state.valid&&typeof document!=='undefined'){
    window.SMARTLIB_ENV_READY=(async()=>{
      await loadScript('js/demo-data.js');await loadScript('js/demo-adapter.js');
      if(document.readyState==='loading')await new Promise(resolve=>document.addEventListener('DOMContentLoaded',resolve,{once:true}));
      await loadScript('js/demo-entry.js');
    })().catch(()=>{state.valid=false;state.errors.push('Demo environment unavailable');document.getElementById('lo')?.style.setProperty('display','none');const panel=document.getElementById('l-admin');if(panel)panel.textContent='Konfigurasi SMARTLib belum lengkap. Fail demo tidak dapat dimuatkan.';});
  }
  window.smartlibBackendFetch=async function(url,options={}){
    await window.SMARTLIB_ENV_READY;
    if(!state.valid||config.environment==='master')return jsonResponse({ok:false,errorType:'CONFIG',error:'CONFIG ERROR: '+window.smartlibConfiguration.statusMessage()});
    if(config.environment==='demo'){
      if(typeof window.smartlibDemoFetch!=='function')throw failure('CONFIG','Demo adapter tidak tersedia.');
      return window.smartlibDemoFetch(url,options);
    }
    const target=new URL(url),backend=new URL(config.backendUrl);
    if(target.origin!==backend.origin||target.pathname!==backend.pathname)throw failure('CONFIG','Backend tidak sepadan dengan config sekolah.');
    let response;
    try {response=await window.fetch(target.href,options);}catch(error){if(error.name==='AbortError')throw error;throw failure('NETWORK','Sambungan backend gagal (Failed to fetch).');}
    if(!response.ok)throw failure('BACKEND','HTTP '+response.status);
    let action=target.searchParams.get('action');try{if(options.body)action=JSON.parse(options.body).action;}catch{}
    if(['login','member_login'].includes(action)){
      let data;try{data=await response.clone().json();}catch{throw failure('BACKEND','Respons login bukan JSON.');}
      if(data?.ok===false)return jsonResponse({...data,errorType:'AUTH',error:'AUTH ERROR: '+(data.error||'Log masuk ditolak.')});
    }
    return response;
  };
})();
