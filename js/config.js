(function () {
  'use strict';
  const defaults = {
    environment:'master', schoolId:'', schoolName:'Sistem Pengurusan Pusat Sumber',
    resourceCentreName:'Pusat Sumber Sekolah', appName:'SMARTLib',
    fullAppName:'Smart Management Automated Resources Tracking Library System',
    tagline:'Sistem Pengurusan Pusat Sumber Sekolah', version:'1.0.0', backendUrl:'',
    assets:{schoolLogo:'assets/school-logo-placeholder.png',smartlibLogo:'assets/smartlib-logo-official.png',icon192:'assets/icon-192.png',icon512:'assets/icon-512.png',appleTouchIcon:'assets/apple-touch-icon.png'},
    features:{dashboard:true,acquisition:true,circulation:true,members:true,memberCards:true,opac:true,labels:true,disposal:true,booking:true,reports:true}
  };
  const text = value => typeof value === 'string' ? value.trim() : '';
  function normalize(input) {
    input=input&&typeof input==='object'?input:{};
    const result={};
    for(const key of Object.keys(defaults).filter(k=>!['assets','features'].includes(k)))result[key]=text(input[key])||defaults[key];
    result.environment=text(input.environment)||({scaffold:'master',school:'customer',demo:'demo'})[input.mode]||defaults.environment;
    result.backendUrl=text(input.backendUrl);
    result.assets={...defaults.assets};
    for(const key of Object.keys(result.assets))result.assets[key]=text(input.assets?.[key])||text(input[key])||defaults.assets[key];
    result.features={...defaults.features};
    for(const key of Object.keys(result.features))if(typeof input.features?.[key]==='boolean')result.features[key]=input.features[key];
    Object.freeze(result.assets);Object.freeze(result.features);return Object.freeze(result);
  }
  function backendValid(value) {
    try {const u=new URL(value);return u.protocol==='https:'&&u.hostname==='script.google.com'&&!u.port&&!u.username&&!u.password&&!u.search&&!u.hash&&/^\/macros\/s\/[A-Za-z0-9_-]+\/exec$/.test(u.pathname)&&!u.pathname.includes('XXXXX');} catch {return false;}
  }
  function validate(input,config) {
    const errors=[];
    if(!input||typeof input!=='object')errors.push('Missing SMARTLIB_CONFIG');
    for(const key of ['schoolId','schoolName','appName'])if(!text(input?.[key]))errors.push('Missing SMARTLIB_CONFIG.'+key);
    if(!['master','demo','customer'].includes(config.environment))errors.push('Invalid SMARTLIB_CONFIG.environment');
    if(input?.environment!==undefined&&typeof input.environment!=='string')errors.push('Invalid SMARTLIB_CONFIG.environment');
    for(const key of ['assets','features'])if(input?.[key]!==undefined&&(!input[key]||typeof input[key]!=='object'||Array.isArray(input[key])))errors.push('Invalid SMARTLIB_CONFIG.'+key);
    if(config.environment==='customer'&&!backendValid(config.backendUrl))errors.push('Invalid SMARTLIB_CONFIG.backendUrl (HTTPS Apps Script /exec required)');
    if(['master','demo'].includes(config.environment)&&config.backendUrl)errors.push('SMARTLIB_CONFIG.backendUrl must be empty in '+config.environment);
    for(const [key,value] of Object.entries(config.assets))if(!value||/^[a-z][a-z0-9+.-]*:/i.test(value)&&!/^https:\/\//i.test(value)||value.startsWith('//')||/[<>"']/.test(value))errors.push('Invalid SMARTLIB_CONFIG.assets.'+key);
    for(const key of Object.keys(defaults.features))if(input?.features?.[key]!==undefined&&typeof input.features[key]!=='boolean')errors.push('Invalid SMARTLIB_CONFIG.features.'+key);
    return errors;
  }
  const original=window.SMARTLIB_CONFIG;
  const config=normalize(original);
  const state={errors:validate(original,config),valid:false,backendReady:false};
  state.valid=state.errors.length===0;
  state.backendReady=state.valid&&config.environment==='customer';
  window.SMARTLIB_CONFIG=config;
  const brandingDefaults={nm:config.appName,sch:config.schoolName,tag:config.tagline,em:'📚',logo:config.assets.schoolLogo,resourceCentreName:config.resourceCentreName};
  function createBranding() {
    const values={...brandingDefaults},branding={};
    for(const key of Object.keys(values))Object.defineProperty(branding,key,{enumerable:true,get(){return text(values[key])||brandingDefaults[key];},set(value){values[key]=value;}});
    Object.defineProperties(branding,{nama:{get(){return this.nm;},set(v){this.nm=v;}},sekolah:{get(){return this.sch;},set(v){this.sch=v;}}});
    return branding;
  }
  function applySettings(rows,branding) {
    const mapping={sekolah:'sch',nama_app:'nm',tagline:'tag',logo_emoji:'em',logo_url:'logo',resource_centre_name:'resourceCentreName'};
    for(const row of rows||[]){const key=mapping[row.kunci];if(key&&typeof row.nilai==='string')branding[key]=text(row.nilai)||brandingDefaults[key];}
  }
  function applyHead(branding) {
    if(typeof document==='undefined')return;
    const identity=branding||brandingDefaults;
    document.title=state.valid?identity.nm+' — '+identity.sch:defaults.appName+' — '+defaults.schoolName;
    for(const [selector,attr,value] of [
      ['link[rel="icon"][sizes="192x192"]','href',config.assets.icon192],
      ['link[rel="icon"][sizes="512x512"]','href',config.assets.icon512],
      ['link[rel="apple-touch-icon"]','href',config.assets.appleTouchIcon],
      ['meta[name="apple-mobile-web-app-title"]','content',config.appName]
    ])document.querySelector(selector)?.setAttribute(attr,value);
    const footer=document.querySelector('.smartlib-copyright');
    if(footer&&!document.getElementById('smartlib-version')){const version=document.createElement('span');version.id='smartlib-version';version.textContent=' · v'+config.version;footer.appendChild(version);}
  }
  function statusMessage() {
    if(!state.valid)return 'Konfigurasi SMARTLib belum lengkap.';
    return config.environment==='master'?'SMARTLib Master: backend sekolah belum dikonfigurasi.':'';
  }
  function showStatus() {
    if(typeof document==='undefined')return;
    applyHead();const message=statusMessage();if(!message)return;
    const target=document.querySelector('.lc');if(!target)return;
    const notice=document.createElement('div');notice.id='smartlib-config-status';notice.className='l-hint';notice.setAttribute('role','alert');notice.textContent=message;target.appendChild(notice);
    if(!state.valid){document.getElementById('lo')?.style.setProperty('display','none');console.warn('SMARTLib configuration:',state.errors.join('; '));}
  }
  window.smartlibConfiguration={config,state,normalize,validate,backendValid,createBranding,applySettings,applyHead,statusMessage,isFeatureEnabled:name=>config.features[name]!==false};
  if(typeof document!=='undefined')document.addEventListener('DOMContentLoaded',showStatus,{once:true});
})();
