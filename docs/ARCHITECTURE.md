# Architecture komersial

```text
smartlib-system
├── smartlib-master   PRIVATE: source induk; Pages OFF
└── smartlib-demo     PUBLIC: fixtures rekaan; Pages ON

RELEASE daripada master
  ├── demo: browser memory, data palsu sahaja
  ├── Sekolah A: Frontend A → Apps Script A → Google Sheet A
  └── Sekolah B: Frontend B → Apps Script B → Google Sheet B
```

Tiada repository pelanggan sebenar dicipta pada peringkat ini. `sk-seri-mutiara` dan `sk-taman-maju` di bawah hanyalah contoh dokumentasi.

## Contoh konfigurasi sekolah A

```javascript
window.SMARTLIB_CONFIG = {
  schoolId: "SKSM001",
  schoolName: "SK Seri Mutiara",
  appName: "SMARTLib",
  version: "1.0.0",
  mode: "school",
  backendUrl: "APPS_SCRIPT_URL_SEKOLAH_INI",
  schoolLogo: "assets/school-logo.png",
  smartlibLogo: "assets/smartlib-logo-official.png"
};
```

Sekolah B menggunakan `schoolId: "SKTM002"`, `schoolName: "SK Taman Maju"` dan backend/Sheet miliknya sendiri. Placeholder backend mesti diganti dengan URL deployment HTTPS sekolah berkenaan sebelum digunakan.

Jangan gunakan satu Google Sheet untuk semua sekolah. Jangan menjadikan `schoolId` sebagai sempadan keselamatan tunggal. Backend setiap sekolah mesti mengesahkan sesi, peranan pentadbir/GPM dan setiap tindakan sensitif pada server.

## Pelanggan pertama, selepas release komersial siap

1. Audit/sanitasi backend secara berasingan; hapuskan kata laluan permulaan hardcoded. Sediakan ujian auth, stok, pelupusan, akses awam dan data isolation.
2. Uji release master melalui demo dan satu backend ujian baharu dengan data rekaan.
3. Dapatkan arahan sebelum mencipta repository pelanggan; tiada pelanggan dicipta oleh setup ini.
4. Cipta Google Sheet dan Apps Script khusus sekolah baharu dengan akaun/akses yang dibenarkan. Jangan salin database sekolah lain.
5. Sediakan config sekolah, logo, manifest relatif dan backendUrl tersendiri. Gantikan tag config contoh dalam artefak `index.html` dengan `config.js`.
6. Imbas secrets dan data peribadi sebelum publish. Private repository memerlukan plan yang menyokong Pages private; Pages biasa menghasilkan laman public.
7. Uji login, OPAC, stok, pinjaman, pemulangan, tempahan, pelupusan dan cetakan menggunakan backend ujian sekolah tersebut, kemudian dapatkan pengesahan operasi.

## Production sedia ada

`SKPKT/smartlib` — **PROTECTED / DO NOT MODIFY**. URL production, repository, GitHub Pages, manifest, Apps Script dan Google Sheet kekal berasingan. Setup komersial ini tidak memindah atau mengubahnya. Kod frontend yang digunakan sebagai rujukan dibaca sahaja daripada commit yang telah sedia diterbitkan; tiada database atau rekod sekolah diambil.
