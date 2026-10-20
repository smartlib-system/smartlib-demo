const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const crypto=require('node:crypto');
const root=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const demo=fs.existsSync(path.join(root,'js/demo-data.js'));
function context(config){const c=vm.createContext({window:{SMARTLIB_CONFIG:config},URL,Response,location:{href:'https://demo.example.invalid/'},console,fetch:()=>{throw new Error('External fetch forbidden in test');}});c.window.fetch=c.fetch;vm.runInContext(read('js/config.js'),c);return c;}
function files(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.name==='.git'?[]:e.isDirectory()?files(path.join(dir,e.name)):[path.join(dir,e.name)]);}

test('all scripts parse and HTML remains valid UTF-8 with the original copyright',()=>{
  for(const f of files(root).filter(f=>/\.(html|js|cjs|md|css|webmanifest)$/.test(f))){
    const bytes=fs.readFileSync(f);const content=new TextDecoder('utf-8',{fatal:true}).decode(bytes);
    assert(!/[\uFFFD]|\u00f0\u0178|\u00e2\u0153|\u00c2|\u00c3/.test(content),path.relative(root,f));
    if(/\.js$/.test(f))new vm.Script(content,{filename:f});
  }
  const html=read('index.html');
  assert(html.includes('<meta charset="UTF-8">'));
  assert(html.includes('© 2026 SMARTLIB |Syahida Suffian'));
  let count=0;for(const m of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)){if(!/\bsrc=/.test(m[1])){new vm.Script(m[2]);count++;}}
  assert(count>5);
});

test('original inline CSS, sidebar and dark mode remain intact',()=>{
  const html=read('index.html');const css=html.match(/<style>([\s\S]*?)<\/style>/)[1];
  const expected=JSON.parse(read('tests/baseline.json'));
  assert.equal(crypto.createHash('sha256').update(css).digest('hex'),expected.inlineCssSha256);
  assert(html.includes('<aside id="sb">'));assert(html.includes('body.dk{'));assert(html.includes('--em:#10b981;'));assert(html.includes('--cy:#06b6d4;'));
});

test('no production backend, school branding, keys or provider tokens in distributable files',()=>{
  for(const f of files(root).filter(f=>!f.includes(path.sep+'tests'+path.sep)&&!f.endsWith('.png'))){
    const text=fs.readFileSync(f,'utf8');
    assert(!/https:\/\/script\.google\.com\/macros\/s\/(?!XXXXX\/exec)[A-Za-z0-9_-]+\/exec/.test(text),'Non-example backend in '+f);
    assert(!/\b(?:gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{40,}|AIza[A-Za-z0-9_-]{30,})\b/.test(text),'Provider token in '+f);
    assert(!/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/.test(text),'Private key in '+f);
  }
  const html=read('index.html');assert(!/Taiping|SKPKT/i.test(html));
  assert(!/\bfetch\(/.test(html),'Legacy fetch must pass through configuration boundary');
  assert(!fs.existsSync(path.join(root,'SMARTLIB_Code_FAST.gs')));
});

test('assets and manifest remain relative to this deployment',()=>{
  const manifest=JSON.parse(read('manifest.webmanifest'));assert.equal(manifest.start_url,'./');assert.equal(manifest.scope,'./');
  for(const icon of manifest.icons){assert(!icon.src.startsWith('/'));assert(fs.existsSync(path.join(root,icon.src)));}
  for(const asset of ['smartlib-logo-official.png','school-logo-placeholder.png','icon-192.png','icon-512.png','apple-touch-icon.png'])assert(fs.existsSync(path.join(root,'assets',asset)));
});

test('scaffold cannot connect to a real backend before school mode is explicitly configured',async()=>{
  const c=context({schoolId:'TEST',schoolName:'Test',appName:'SMARTLib',mode:'scaffold',backendUrl:'https://script.google.com/macros/s/XXXXX/exec'});
  vm.runInContext(read('js/app.js'),c);
  const r=await c.window.smartlibBackendFetch('https://script.google.com/macros/s/XXXXX/exec');assert.equal((await r.json()).ok,false);
});

test('school transport refuses a different backend',async()=>{
  const c=context({schoolId:'TEST',schoolName:'Test',appName:'SMARTLib',mode:'school',backendUrl:'https://script.google.com/macros/s/TEST_ONLY/exec'});vm.runInContext(read('js/app.js'),c);
  await assert.rejects(()=>c.window.smartlibBackendFetch('https://different.example.invalid/exec'),/sepadan/);
});

if(demo){
  function setup(){const c=context();for(const file of ['config.js','js/config.js','js/app.js','js/demo-data.js','js/demo-adapter.js'])vm.runInContext(read(file),c);return async p=>{const r=await c.window.smartlibBackendFetch('https://smartlib.invalid/exec',{method:'POST',body:JSON.stringify(p)});return r.json();};}
  test('demo uses only explicitly fictional fixtures, five active copies and no backend',async()=>{
    const call=setup();const r=await call({action:'baca_semua'});assert(r.ok);assert.equal(r.data.stock_stats.jumlah_buku,5);assert.equal(r.data.buku.length,6);assert.deepEqual(r.data.murid.map(m=>m.nama),['Ahmad Demo','Aisyah Demo']);assert.deepEqual(r.data.guru.map(m=>m.nama),['Cikgu Ali','Cikgu Siti']);assert(r.data.tempahan_pss.length);assert(r.data.pelupusan.length);
    const c=context();vm.runInContext(read('config.js'),c);assert.equal(c.window.SMARTLIB_CONFIG.backendUrl,'');assert.equal(c.window.SMARTLIB_CONFIG.environment,'demo');
  });
  test('loan and return simulations do not decrease stock, and refresh resets fixtures',async()=>{
    const call=setup();let r=await call({action:'add_loan_fast',data:{buku_id:'1',pengguna_id:'1',jenis_pengguna:'murid',tarikh_pinjam:'2026-10-20',tempoh:14}});assert(r.ok);const id=r.data.id;
    assert.equal((await call({action:'get_dashboard_stats'})).data.jumlah_buku,5);
    r=await call({action:'return_loan_fast',id,data:{tarikh_pulang:'2026-10-20'}});assert(r.ok);assert.equal((await call({action:'get_dashboard_stats'})).data.jumlah_buku,5);
    assert.equal((await setup()({action:'baca_semua'})).data.pinjaman.length,1);
  });
  test('suggestions can be edited and bulk set; generating Borang 9 does not dispose books',async()=>{
    const call=setup();assert((await call({action:'status_bahan_usang',id:'1',status:'Disyorkan Lupus',data:{cadangan_pelupusan:'Pembakaran'}})).ok);
    assert((await call({action:'cadang_bahan_usang',data:{buku_id:'4',keadaan_bahan:'Usang',sebab_dicadang:'Demo',cadangan_pelupusan:'Jualan Sisa'}})).ok);
    const bulk=await call({action:'bulk_bahan_usang',bulk_action:'cadangan',ids:['1'],data:{cadangan_pelupusan:'Penanaman'}});assert.equal(bulk.data.updated,1);
    const untouched=(await call({action:'get_disposal_data'})).data.bahan_usang_rosak.find(r=>r.buku_id==='4');assert.equal(untouched.cadangan_pelupusan,'Jualan Sisa');assert.equal(untouched.status,'Untuk Semakan');
    assert.equal((await call({action:'get_disposal_data'})).data.bahan_usang_rosak[0].cadangan_pelupusan,'Penanaman');
    assert(!(await call({action:'status_bahan_usang',id:'1',status:'Disyorkan Lupus',data:{cadangan_pelupusan:'Usang'}})).ok);
    assert((await call({action:'status_bahan_usang',id:'1',status:'Diluluskan Untuk Pelupusan',data:{}})).ok);
    const form=await call({action:'get_borang9_data',ids:['1']});assert.equal(form.data.items[0].cadangan_pelupusan,'Penanaman');
    assert.equal((await call({action:'get_dashboard_stats'})).data.jumlah_buku,5);
    assert(!(await call({action:'sahkan_pelupusan',id:'1'})).ok);
  });
  test('unsupported writes fail and reservation simulation stays local',async()=>{
    const call=setup();assert(!(await call({action:'import',sheet:'buku',rows:[]})).ok);
    const r=await call({action:'create_reservation',data:{nama:'Cikgu Ali',tujuan:'Demo'}});assert(r.ok);assert.equal((await call({action:'get_reservations'})).data.total,2);
  });
}
