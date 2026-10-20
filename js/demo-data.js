// Hand-authored fictional fixtures. No school database, exports, or backend is used.
window.SMARTLIB_DEMO_SEED = function () {
  const day = new Date().toISOString().slice(0,10);
  return {
    buku: Array.from({length:6}, (_,i)=>({id:String(i+1),no_perolehan:String(101+i),no_panggilan:'800 DEM '+(i+1),judul:'Buku Contoh '+String(i+1).padStart(3,'0'),pengarang:'Penulis Demo',penerbit:'Penerbit Demo',tahun:'2020',isbn:'',bahasa:'Bahasa Melayu',harga:'10.00',punca:'Sumbangan Demo',tarikh_daftar:day,status:i===5?'Dilupuskan':i===1?'dipinjam':'Tersedia'})),
    murid:[{id:'1',nama:'Ahmad Demo',nokad:'M-DEMO-01',no_ahli:'M-DEMO-01',tingkatan:'Kelas Demo 1',kelas:'Kelas Demo 1',aktif:'Ya'},{id:'2',nama:'Aisyah Demo',nokad:'M-DEMO-02',no_ahli:'M-DEMO-02',tingkatan:'Kelas Demo 2',kelas:'Kelas Demo 2',aktif:'Ya'}],
    guru:[{id:'1',nama:'Cikgu Ali',nokad:'G-DEMO-01',no_ahli:'G-DEMO-01',jawatan:'Guru Demo',email:'ali@example.invalid',aktif:'Ya'},{id:'2',nama:'Cikgu Siti',nokad:'G-DEMO-02',no_ahli:'G-DEMO-02',jawatan:'GPM Demo',email:'siti@example.invalid',aktif:'Ya'}],
    pinjaman:[{id:'1',buku_id:'2',jenis_pengguna:'murid',pengguna_id:'1',tarikh_pinjam:day,tarikh_patut:day,status:'pinjam',denda:0}],
    bahan_usang_rosak:[{id:'1',buku_id:'3',no_perolehan:'103',no_panggilan:'800 DEM 3',judul:'Buku Contoh 003',pengarang:'Penulis Demo',tahun:'2020',keadaan_bahan:'Usang',sebab_dicadang:'Contoh semakan bahan demo sahaja',cadangan_pelupusan:'Jualan Sisa',status:'Disyorkan Lupus',tarikh_cadang:day,dicadang_oleh:'Cikgu Siti'}],
    pelupusan:[{id:'1',buku_id:'6',no_perolehan:'106',no_panggilan:'800 DEM 6',judul:'Buku Contoh 006',tarikh_lupus:day,kaedah:'Jualan Sisa',no_rujukan:'DEMO-001',pegawai:'Cikgu Siti',status_pelupusan:'Telah Dilupuskan'}],
    tempahan_pss:[{id:'1',booking_id:'DEMO-001',nama:'Cikgu Ali',nama_penempah:'Cikgu Ali',nama_guru:'Cikgu Ali',guru_id:'1',kategori_penempah:'Guru',email_penempah:'ali@example.invalid',kelas:'Kelas Demo 1',program_aktiviti:'Aktiviti membaca demo',tujuan:'Aktiviti membaca demo',lokasi:'Pusat Sumber Demo',ruang:'Pusat Sumber Demo',tarikh:day,tarikh_mula:day,tarikh_tamat:day,masa_mula:'09:00',masa_tamat:'10:00',status:'Diluluskan',bil_murid:'2'}],
    settings:[{kunci:'ann',nilai:JSON.stringify([{id:1,ttl:'Persekitaran Demo',sub:'Semua data ialah rekaan. Perubahan hilang apabila halaman dimuat semula.',t:day,w:'em'}])}]
  };
};
