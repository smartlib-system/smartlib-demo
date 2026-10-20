(function () {
  'use strict';
  if (window.SMARTLIB_CONFIG.environment !== 'demo' || window.SMARTLIB_CONFIG.backendUrl) throw new Error('Demo must use local fixtures only.');
  const db = window.SMARTLIB_DEMO_SEED();
  const copy = value => JSON.parse(JSON.stringify(value));
  const ok = data => ({ok:true,data:copy(data)});
  const fail = error => ({ok:false,error});
  const next = rows => String(Math.max(0,...rows.map(r=>Number(r.id)||0))+1);
  const find = (table,id) => (db[table]||[]).find(r=>String(r.id)===String(id));
  const active = b => !['dilupuskan','telah dilupuskan','hilang','rosak teruk','tidak aktif','batal'].includes(String(b.status||'').toLowerCase());
  const stats = () => ({jumlah_buku:db.buku.filter(active).length,jumlah_rekod_perolehan:db.buku.length,jumlah_dilupuskan:db.buku.filter(b=>b.status==='Dilupuskan').length,jumlah_murid:db.murid.length,jumlah_guru:db.guru.length,latest_books:copy(db.buku.filter(active))});
  const list = (items,p) => {const limit=Math.max(1,Number(p.limit)||30),page=Math.max(1,Number(p.page)||1);return ok({items:items.slice((page-1)*limit,page*limit),page,limit,total:items.length,totalPages:Math.max(1,Math.ceil(items.length/limit))});};
  const user = {id:'demo-admin',nama:'Cikgu Siti',username:'demo',peranan:'admin'};
  const suggestionMethods = ['Pembakaran','Penanaman','Jualan Sisa'];
  function updateSuggestion(row,changes) {
    if (!row) return fail('Rekod demo tidak dijumpai.');
    if (row.status==='Telah Dilupuskan') return fail('Rekod telah dilupuskan.');
    if(changes.cadangan_pelupusan!==undefined&&!suggestionMethods.includes(changes.cadangan_pelupusan))return fail('Cadangan pelupusan tidak sah.');
    Object.assign(row,changes);return ok({item:row});
  }
  function request(p) {
    const d=p.data||{};
    switch(p.action) {
      case 'ping': return ok({mode:'demo'});
      case 'login': return ok({user,sessionToken:'demo'});
      case 'member_login': {const type=p.type==='guru'?'guru':'murid';const member=find(type,p.member_id);return member?ok({user:{...member,jenis_pengguna:type,peranan:'ahli'},sessionToken:'demo'}):fail('Ahli demo tidak dijumpai.');}
      case 'logout': return ok({});
      case 'bootstrap': return ok({settings:db.settings});
      case 'settings_public': return ok({settings:db.settings});
      case 'baca_semua': return ok({...db,stock_stats:stats()});
      case 'get_dashboard_stats': return ok(stats());
      case 'baca_buku_fast': case 'baca_buku_public': return ok({buku:db.buku,items:db.buku,total:db.buku.length});
      case 'get_book_index': return ok({items:db.buku});
      case 'get_book': return find('buku',p.id)?ok(find('buku',p.id)):fail('Buku demo tidak dijumpai.');
      case 'opac_search': case 'search_opac': case 'search_books': return list(db.buku.filter(b=>active(b)&&JSON.stringify(b).toLowerCase().includes(String(p.q||'').toLowerCase())),p);
      case 'search_members': return list(db[p.type==='guru'?'guru':'murid'].filter(m=>JSON.stringify(m).toLowerCase().includes(String(p.q||'').toLowerCase())),p);
      case 'get_active_loans': return list(db.pinjaman.filter(r=>r.status==='pinjam'),p);
      case 'get_next_accession_number': return ok({next_no_perolehan:String(Math.max(...db.buku.map(b=>Number(b.no_perolehan)))+1)});
      case 'check_isbn': return ok({exists:false,items:[]});
      case 'check_member_id': return ok({exists:false});
      case 'isbn_lookup': return ok({jumpa:false});
      case 'add_loan_fast': {
        const book=find('buku',d.buku_id);
        if(!book||!active(book)||db.pinjaman.some(r=>r.buku_id===d.buku_id&&r.status==='pinjam'))return fail('Buku demo tidak tersedia.');
        const due=new Date(d.tarikh_pinjam+'T12:00:00Z');due.setUTCDate(due.getUTCDate()+(Number(d.tempoh)||14));
        const item={...d,id:next(db.pinjaman),status:'pinjam',tarikh_patut:due.toISOString().slice(0,10),denda:0};db.pinjaman.push(item);book.status='dipinjam';return ok({item,id:item.id});
      }
      case 'return_loan_fast': {const item=find('pinjaman',p.id);if(!item)return fail('Pinjaman demo tidak dijumpai.');Object.assign(item,{status:'pulang',tarikh_pulang:d.tarikh_pulang,denda:0});const book=find('buku',item.buku_id);if(book)book.status='Tersedia';return ok({tarikh_pulang:item.tarikh_pulang,denda:0,hari_lewat:0});}
      case 'get_disposal_data': return ok({bahan_usang_rosak:db.bahan_usang_rosak,pelupusan:db.pelupusan});
      case 'cadang_bahan_usang': {const b=find('buku',d.buku_id);if(!b)return fail('Buku tidak dijumpai.');if(db.bahan_usang_rosak.some(r=>r.buku_id===d.buku_id))return fail('Bahan demo sudah dalam semakan.');const item={...b,...d,id:next(db.bahan_usang_rosak),status:'Untuk Semakan'};db.bahan_usang_rosak.push(item);return ok({item});}
      case 'status_bahan_usang': return updateSuggestion(find('bahan_usang_rosak',p.id),{...d,status:p.status});
      case 'bulk_bahan_usang': {
        if(p.bulk_action==='padam')return fail('Pemadaman pukal tidak disediakan dalam demo.');
        const rows=db.bahan_usang_rosak.filter(r=>(p.ids||[]).map(String).includes(String(r.id))&&r.status!=='Telah Dilupuskan');
        const changes=p.bulk_action==='cadangan'?{cadangan_pelupusan:d.cadangan_pelupusan}:{status:({syor:'Disyorkan Lupus',lulus:'Diluluskan Untuk Pelupusan',tidak_lulus:'Tidak Diluluskan'})[p.bulk_action]};
        if(!changes.status&&!changes.cadangan_pelupusan)return fail('Tindakan demo tidak disokong.');
        for(const row of rows){const result=updateSuggestion(row,changes);if(!result.ok)return result;}
        return ok({items:rows,updated:rows.length,skipped:(p.ids||[]).length-rows.length,failed:0});
      }
      case 'get_borang9_data': {
        const rows=db.bahan_usang_rosak.filter(r=>(p.ids||[]).map(String).includes(String(r.id)));
        const missing=rows.filter(r=>!suggestionMethods.includes(r.cadangan_pelupusan));
        if(missing.length)return fail('Terdapat bahan yang belum mempunyai Cadangan Pelupusan. Sila lengkapkan semakan sebelum menjana Borang 9.\n'+missing.map(r=>r.no_perolehan).join(', '));
        return ok({items:rows.filter(r=>r.status==='Diluluskan Untuk Pelupusan')});
      }
      case 'sahkan_pelupusan': return fail('Pengesahan pelupusan sebenar tidak tersedia dalam demo.');
      case 'get_reservations': return list(db.tempahan_pss,p);
      case 'check_availability': return ok({available:true,conflicts:[]});
      case 'create_reservation': case 'tambah_tempahan_pss': {const item={...d,id:next(db.tempahan_pss),booking_id:'DEMO-'+next(db.tempahan_pss),status:'Menunggu'};db.tempahan_pss.push(item);return ok({item,id:item.id,booking_id:item.booking_id});}
      case 'kemaskini_tempahan_pss': case 'status_tempahan_pss': case 'update_reservation': {const row=db.tempahan_pss.find(r=>String(r.id)===String(p.id)||r.booking_id===p.id);if(!row)return fail('Tempahan demo tidak dijumpai.');Object.assign(row,d,p.status?{status:p.status}:{});return ok({item:row});}
      case 'kemaskiniSetting': {let row=db.settings.find(r=>r.kunci===p.kunci);if(row)row.nilai=p.nilai;else db.settings.push({kunci:p.kunci,nilai:p.nilai});return ok({});}
      case 'tukar_password': case 'upload_cover_buku': case 'upload_cover': case 'import': return fail('Fungsi ini tidak tersedia dalam demo. Gunakan data rekaan sahaja.');
      default: return fail('Tindakan ini belum disediakan dalam demo: '+String(p.action||''));
    }
  }
  window.smartlibDemoFetch = async function (url,options={}) {
    const parsed=new URL(url,location.href);
    const p=options.body?JSON.parse(options.body):Object.fromEntries(parsed.searchParams);
    const result=request(p);
    return new Response(JSON.stringify(result),{status:200,headers:{'Content-Type':'application/json;charset=utf-8'}});
  };
})();
