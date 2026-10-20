# Architecture komersial

```text
smartlib-system
├── smartlib-master   PRIVATE, Pages OFF
└── smartlib-demo     PUBLIC, config demo, data rekaan

MASTER CORE + CONFIG.JS + SCHOOL ASSETS
  ├── Demo: browser memory, backend kosong
  ├── Sekolah A: Frontend A → Apps Script A → Google Sheet A
  └── Sekolah B: Frontend B → Apps Script B → Google Sheet B
```

Setiap sekolah mempunyai config, deployment dan database sendiri. schoolId bukan sempadan keselamatan tunggal; sesi/peranan dan setiap tindakan sensitif mesti disemak pada backend.

Core index.html dan runtime configuration/transport adalah sama bagi master/demo. config.js dan manifest berbeza mengikut deployment. Demo menambah modul simulasi yang hanya dimuatkan jika environment demo dan backend kosong; jangan salin modul demo ke customer.

Tiada repository pelanggan dicipta. Nama contoh sekolah dalam dokumentasi bukan deployment sebenar. Backend komersial masih perlu audit/sanitasi dan ujian berasingan sebelum pelanggan pertama. Ikut README untuk penyediaan customer kemudian.

## Production sedia ada

`SKPKT/smartlib` — **PROTECTED / DO NOT MODIFY**. Rujukan SKPKT dalam dokumentasi ini hanya mencatat sempadan perlindungan, bukan identity configuration master/demo. Repository, URL, GitHub Pages, manifest, Apps Script, Google Sheet dan data production tidak dimigrasi atau diubah oleh setup komersial.
