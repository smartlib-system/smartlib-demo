// Optional: NODE_PATH can point to an existing Playwright installation. No app dependency/build step.
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..'),results={pageErrors:[],backendCalls:[],checks:[]};
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.png':'image/png','.webmanifest':'application/manifest+json'};
const server=http.createServer((req,res)=>{const url=new URL(req.url,'http://localhost');const file=path.resolve(root,'.'+decodeURIComponent(url.pathname)+(url.pathname.endsWith('/')?'index.html':''));if(!file.startsWith(root+path.sep)){res.writeHead(403);res.end();return;}fs.readFile(file,(error,bytes)=>{res.writeHead(error?404:200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream'});res.end(error?'Not found':bytes);});});
const sample={environment:'customer',schoolId:'TEST-BROWSER',schoolName:'Sekolah Ujian Config',resourceCentreName:'PSS Ujian Config',appName:'SMARTLib Ujian',backendUrl:'https://script.google.com/macros/s/TEST_BROWSER_A/exec',assets:{schoolLogo:'assets/icon-512.png',smartlibLogo:'assets/smartlib-logo-official.png'}};
(async()=>{
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const browser=await chromium.launch({headless:true,...(process.env.SMARTLIB_TEST_BROWSER?{channel:process.env.SMARTLIB_TEST_BROWSER}:{})});
  try{
    const address='http://127.0.0.1:'+server.address().port+'/';
    async function pageFor(config,settings=[]){
      const page=await browser.newPage({viewport:{width:1280,height:900}});page.on('pageerror',e=>results.pageErrors.push(e.message));
      await page.route('**/config.js',route=>new URL(route.request().url()).pathname==='/config.js'?route.fulfill(config===null?{status:404,body:'Not found'}:{contentType:'application/javascript',body:'window.SMARTLIB_CONFIG='+JSON.stringify(config)+';'}):route.continue());
      await page.route('https://script.google.com/**',async route=>{
        const request=route.request(),url=new URL(request.url()),p=request.method()==='POST'?JSON.parse(request.postData()):Object.fromEntries(url.searchParams);
        results.backendCalls.push({url:request.url(),action:p.action});
        const empty={buku:[],murid:[],guru:[],pinjaman:[],pelupusan:[],bahan_usang_rosak:[],tempahan_pss:[],settings};
        const data=p.action==='login'?{user:{id:'test',nama:'Pengguna Ujian',peranan:'admin'},sessionToken:'test'}:p.action==='get_dashboard_stats'?{jumlah_buku:0,jumlah_rekod_perolehan:0,jumlah_dilupuskan:0,latest_books:[]}:p.action==='get_book_index'?{items:[]}:empty;
        await route.fulfill({contentType:'application/json',body:JSON.stringify({ok:true,data})});
      });
      await page.goto(address,{waitUntil:'networkidle'});return page;
    }
    let page=await pageFor(sample);
    assert.equal(await page.title(),sample.appName+' — '+sample.schoolName);
    assert.equal(await page.locator('#sb-sch').innerText(),sample.schoolName);
    assert((await page.locator('#sb-img').getAttribute('src')).endsWith(sample.assets.schoolLogo));
    assert((await page.locator('#l-img').getAttribute('src')).endsWith(sample.assets.smartlibLogo));
    await page.locator('#lu').fill('test-user');await page.locator('#lp').fill('test-input-only');await page.locator('#l-btn-a').click();
    await page.waitForFunction(()=>document.getElementById('lw').style.display==='none');
    assert((await page.locator('.wb-su').innerText()).includes(sample.resourceCentreName));
    await page.evaluate(async()=>{await apiGet({action:'settings_public'},0);nav('kad');});
    assert.equal(await page.locator('#kad-sch').inputValue(),sample.schoolName);
    await page.evaluate(()=>masukOPAC());await page.evaluate(()=>runOpac());
    await page.evaluate(()=>bukaTempahanAwam());assert(await page.locator('#pub-save').isVisible());
    assert(results.backendCalls.length>0&&results.backendCalls.every(c=>new URL(c.url).pathname==='/macros/s/TEST_BROWSER_A/exec'));
    results.checks.push('A school name/title/resource centre, C school logo, product logo, login, cards, public OPAC/booking');
    await page.close();
    const before=results.backendCalls.length,newConfig={...sample,schoolName:'Sekolah Ujian B',backendUrl:'https://script.google.com/macros/s/TEST_BROWSER_B/exec'};
    page=await pageFor(newConfig);await page.evaluate(async()=>{await api({action:'login'},0);await apiGet({action:'settings_public'},0);masukOPAC();});
    assert(results.backendCalls.slice(before).every(c=>new URL(c.url).pathname==='/macros/s/TEST_BROWSER_B/exec'));results.checks.push('B config-only endpoint change, GET/POST and public modules');await page.close();
    page=await pageFor(sample,[{kunci:'sekolah',nilai:'Sekolah Runtime'},{kunci:'logo_url',nilai:'assets/icon-192.png'}]);
    await page.waitForFunction(()=>document.title.includes('Sekolah Runtime'));assert.equal(await page.locator('#sb-sch').innerText(),'Sekolah Runtime');results.checks.push('backend settings override config identity');await page.close();
    for(const bad of [null,{...sample,backendUrl:'http://invalid.example.invalid/'}]){
      const count=results.backendCalls.length;page=await pageFor(bad);assert((await page.locator('#smartlib-config-status').innerText()).includes('Konfigurasi SMARTLib belum lengkap.'));assert.equal(await page.title(),'SMARTLib — Sistem Pengurusan Pusat Sumber');assert.equal(results.backendCalls.length,count);await page.close();
    }
    results.checks.push('missing/invalid config handled without application exceptions or backend access');
    const master={...sample,environment:'master',backendUrl:''};page=await pageFor(master);assert((await page.locator('#smartlib-config-status').innerText()).includes('Master'));await page.close();
    assert.deepEqual(results.pageErrors,[]);console.log(JSON.stringify(results,null,2));
  }finally{await browser.close();}
})().catch(error=>{console.error(JSON.stringify({...results,error:error.message},null,2));process.exitCode=1;}).finally(()=>server.close());
