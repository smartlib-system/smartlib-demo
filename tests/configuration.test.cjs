const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),vm=require('node:vm'),cp=require('node:child_process');
const root=path.resolve(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8');
const base={environment:'customer',schoolId:'TEST',schoolName:'Sekolah Ujian',appName:'SMARTLib',backendUrl:'https://script.google.com/macros/s/TEST_ONLY_A/exec',assets:{schoolLogo:'assets/school-logo-placeholder.png'}};
function runtime(config=base,fetchImpl=async()=>new Response(JSON.stringify({ok:true,data:{}}))){
  const calls=[],c=vm.createContext({window:{SMARTLIB_CONFIG:config},URL,Response,console,location:{href:'https://example.invalid/app/'}});
  c.window.fetch=async(url,options)=>{calls.push({url,options});return fetchImpl(url,options);};
  vm.runInContext(read('js/config.js'),c);vm.runInContext(read('js/app.js'),c);
  return {c,calls,r:c.window.smartlibConfiguration,fetch:c.window.smartlibBackendFetch};
}
test('config.js loads before configuration runtime and every inline application script',()=>{
  const html=read('index.html'),config=html.indexOf('<script src="config.js"'),loader=html.indexOf('<script src="js/config.js"'),app=html.indexOf('<script src="js/app.js"');
  assert(config>0&&config<loader&&loader<app);assert(app<html.indexOf('<script>'));
  assert(!html.includes('demo.config.js'));assert(!html.includes('src="config.example.js"'));
  assert(!/https:\/\/(?:script\.google\.com|smartlib\.invalid)/.test(html));
});
test('tracked runtime is a safe master/demo config and the static PWA manifest matches it',()=>{
  const c=vm.createContext({window:{},URL,console});vm.runInContext(read('config.js'),c);vm.runInContext(read('js/config.js'),c);
  const {config,state}=c.window.smartlibConfiguration,hasDemo=fs.existsSync(path.join(root,'js/demo-data.js'));
  assert(state.valid);assert.equal(config.environment,hasDemo?'demo':'master');assert.equal(config.backendUrl,'');
  if(hasDemo)assert.equal(config.schoolId,'SMARTLIB-DEMO');
  const manifest=JSON.parse(read('manifest.webmanifest'));assert.equal(manifest.name,config.appName+' — '+config.schoolName);assert.equal(manifest.icons[0].src,config.assets.icon192);assert.equal(manifest.icons[1].src,config.assets.icon512);
});
test('one school config controls branding, logos, immutable endpoint, and feature metadata',()=>{
  const {r}=runtime({...base,schoolName:'Sekolah A',resourceCentreName:'PSS A',assets:{schoolLogo:'assets/a.png',smartlibLogo:'assets/brand.png'},features:{booking:false}});
  const b=r.createBranding();assert.equal(b.sch,'Sekolah A');assert.equal(b.sekolah,b.sch);assert.equal(b.logo,'assets/a.png');assert.equal(b.resourceCentreName,'PSS A');assert.equal(r.config.assets.smartlibLogo,'assets/brand.png');assert.equal(r.isFeatureEnabled('booking'),false);assert.equal(r.isFeatureEnabled('opac'),true);
  assert(Object.isFrozen(r.config));assert(Object.isFrozen(r.config.assets));
});
test('settings override identity only, blank settings restore config; legacy AP aliases stay in sync',()=>{
  const {r}=runtime(),b=r.createBranding();
  r.applySettings([{kunci:'sekolah',nilai:'Sekolah Runtime'},{kunci:'nama_app',nilai:'App Runtime'},{kunci:'logo_url',nilai:'assets/runtime.png'},{kunci:'backendUrl',nilai:'ignored'},{kunci:'schoolId',nilai:'ignored'}],b);
  assert.equal(b.sekolah,'Sekolah Runtime');assert.equal(b.nama,'App Runtime');assert.equal(b.logo,'assets/runtime.png');assert.equal(r.config.backendUrl,base.backendUrl);assert.equal(r.config.schoolId,'TEST');
  b.sekolah='Alias Sekolah';assert.equal(b.sch,'Alias Sekolah');b.nm='Alias App';assert.equal(b.nama,'Alias App');
  r.applySettings([{kunci:'sekolah',nilai:''},{kunci:'logo_url',nilai:''}],b);assert.equal(b.sch,base.schoolName);assert.equal(b.logo,r.config.assets.schoolLogo);
});
test('missing, invalid and unsafe configs fail closed with a configuration message, no network',async()=>{
  for(const config of [null,{}, {...base,backendUrl:''},{...base,backendUrl:'http://script.google.com/macros/s/TEST/exec'},{...base,backendUrl:'https://script.google.com.attacker.invalid/macros/s/TEST/exec'},{...base,backendUrl:base.backendUrl+'?key=test'},{...base,backendUrl:'https://script.google.com/macros/s/XXXXX/exec'},{...base,environment:'unknown'},{...base,assets:{schoolLogo:'javascript:alert(1)'}},{...base,features:{booking:'false'}}]){
    const {r,fetch,calls}=runtime(config);assert.equal(r.state.valid,false);assert.equal(r.statusMessage(),'Konfigurasi SMARTLib belum lengkap.');const response=await fetch('https://example.invalid/');assert.equal((await response.json()).errorType,'CONFIG');assert.equal(calls.length,0);
  }
});
test('master and local demo forbid external backend; old mode/assets remain compatible',()=>{
  for(const environment of ['master','demo'])assert.equal(runtime({...base,environment}).r.state.valid,false);
  const {r}=runtime({mode:'school',schoolId:'OLD',schoolName:'Old Example',appName:'SMARTLib',backendUrl:base.backendUrl,schoolLogo:'assets/old.png'});assert(r.state.valid);assert.equal(r.config.environment,'customer');assert.equal(r.config.assets.schoolLogo,'assets/old.png');
});
test('switching only backendUrl moves GET and POST to the new endpoint and refuses the previous one',async()=>{
  const endpoint='https://script.google.com/macros/s/TEST_ONLY_B/exec';const {fetch,calls}=runtime({...base,backendUrl:endpoint});
  await fetch(endpoint+'?action=bootstrap');await fetch(endpoint,{method:'POST',body:JSON.stringify({action:'login'})});
  assert(calls.every(call=>new URL(call.url).pathname==='/macros/s/TEST_ONLY_B/exec'));await assert.rejects(()=>fetch(base.backendUrl),/CONFIG ERROR/);assert.equal(calls.length,2);
});
test('CONFIG, NETWORK, BACKEND and AUTH errors remain distinguishable without leaking URL or response body',async()=>{
  const offline=runtime(base,async()=>{throw new Error('sensitive request detail');});await assert.rejects(()=>offline.fetch(base.backendUrl),error=>error.errorType==='NETWORK'&&!error.message.includes('sensitive'));
  const backend=runtime(base,async()=>new Response('private diagnostic',{status:500}));await assert.rejects(()=>backend.fetch(base.backendUrl),error=>error.errorType==='BACKEND'&&error.message.includes('HTTP 500')&&!error.message.includes('private'));
  const auth=runtime(base,async()=>new Response(JSON.stringify({ok:false,error:'Nama pengguna atau kata laluan salah.'})));const response=await auth.fetch(base.backendUrl,{method:'POST',body:JSON.stringify({action:'login'})});assert.equal((await response.json()).errorType,'AUTH');
  const abort=new Error('Aborted');abort.name='AbortError';await assert.rejects(()=>runtime(base,async()=>{throw abort;}).fetch(base.backendUrl),error=>error===abort);
});
test('manifest generator produces static JSON with Unicode and configured icon paths',()=>{
  const temp=fs.mkdtempSync(path.join(os.tmpdir(),'smartlib-config-'));
  try{
    const config={...base,schoolName:'Sekolah "Contoh" & Bestari',assets:{icon192:'assets/custom-192.png',icon512:'assets/custom-512.png'}};
    const input=path.join(temp,'config.js'),output=path.join(temp,'manifest.webmanifest');fs.writeFileSync(input,'window.SMARTLIB_CONFIG='+JSON.stringify(config));
    cp.execFileSync(process.execPath,[path.join(root,'scripts/generate-manifest.cjs'),input,output]);
    const m=JSON.parse(fs.readFileSync(output,'utf8'));assert.equal(m.name,'SMARTLib — '+config.schoolName);assert.equal(m.icons[0].src,config.assets.icon192);assert.equal(m.start_url,'./');assert.equal(m.scope,'./');assert(!JSON.stringify(m).includes('{{'));
    fs.writeFileSync(input,'window.SMARTLIB_CONFIG='+JSON.stringify({...base,backendUrl:''}));assert.notEqual(cp.spawnSync(process.execPath,[path.join(root,'scripts/generate-manifest.cjs'),input,output]).status,0);
  }finally{assert.equal(path.dirname(path.resolve(temp)),path.resolve(os.tmpdir()));assert(path.basename(temp).startsWith('smartlib-config-'));fs.rmSync(temp,{recursive:true,force:true});}
});
