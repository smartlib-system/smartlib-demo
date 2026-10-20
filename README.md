# SMARTLib Demonstration Environment

Semua data dalam persekitaran ini ialah **data demo rekaan**, bukan data sekolah sebenar. Ia digunakan untuk demonstrasi fungsi SMARTLib.

Klik **Buka Demo Admin / GPM**. Tiada kata laluan atau akaun sebenar diperlukan. Contoh ahli ialah Cikgu Ali, Cikgu Siti, Ahmad Demo dan Aisyah Demo. Buku, pinjaman, semakan pelupusan dan tempahan semuanya fixtures yang ditulis secara manual.

Demo mengekalkan UI SMARTLib sedia ada. Data hanya berada dalam memori tab browser. Refresh halaman memulihkan fixtures asal. Tiada Google Sheet, Apps Script, token sebenar atau backend production digunakan. Jangan masukkan maklumat sebenar ke borang demo.

Paparan katalog, dashboard, carian, ahli, kad, label, pinjaman/pemulangan simulasi, semakan/cadangan pelupusan dan tempahan boleh dicuba. Upload cover, import, penukaran kata laluan dan pengesahan pelupusan sebenar tidak disediakan dalam demo. Kamera memerlukan permission browser dan perkakasan yang sesuai; ujian automatik tidak membuktikan kamera fizikal berfungsi.

`config.js`, `js/demo-data.js`, `js/demo-adapter.js` dan `js/demo-entry.js` ialah lapisan demo. `backendUrl` mesti kosong dan environment mesti `demo`; adapter menolak konfigurasi lain. Ralat tindakan yang belum disimulasikan dipaparkan tanpa menulis ke sebarang perkhidmatan.

Repository ini public untuk GitHub Pages. JavaScript/HTML yang diedarkan boleh diperiksa oleh pengunjung; ia tidak memberikan akses kepada repository private `smartlib-master`, sejarah development atau secrets backend. Jangan anggap frontend sebagai tempat menyimpan secrets.

Jalankan semakan: `node --test tests/commercial.test.cjs tests/configuration.test.cjs`.

© 2026 SMARTLIB |Syahida Suffian

## Configuration architecture — Tahap 2

Identity demo dibaca daripada config.js (environment demo, schoolId SMARTLIB-DEMO, schoolName SMARTLib Demo School, resourceCentreName Demo Resource Centre), dengan backendUrl kosong. index.html dan js/config.js/js/app.js sama seperti master. Tiada tag script perlu ditukar untuk deployment lain. Loader memuatkan simulasi tempatan hanya dalam environment demo yang sah.

PWA menggunakan manifest.webmanifest statik daripada manifest.template.webmanifest. Selepas config PWA berubah, jalankan `node scripts/generate-manifest.cjs`. Feature flags ialah metadata sahaja, belum hide/disable navigation. Lihat [CONFIGURATION.md](docs/CONFIGURATION.md), [ARCHITECTURE.md](docs/ARCHITECTURE.md) dan [UPDATE_STRATEGY.md](docs/UPDATE_STRATEGY.md). Jangan overwrite config, manifest, logo/ikon khusus ketika sync core.
