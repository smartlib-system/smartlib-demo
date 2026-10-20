# Strategi update

`development` → ujian → `smartlib-demo` → `main` stabil → release berversi → deployment sekolah yang telah diluluskan.

Untuk setiap release, catat versi/commit, perubahan schema, ujian yang dilaksanakan dan prosedur rollback. Jangan menghasilkan update automatik kepada pelanggan tanpa semakan.

## Sempadan fail

| Core boleh dikemas kini | Khusus sekolah: mesti dikekalkan |
|---|---|
| index.html (dengan tag konfigurasi deployment dikekalkan) | config.js |
| js/app.js dan modul core yang telah diluluskan | assets/school-logo.png |
| css/smartlib.css | school-specific settings dan manifest branding |
| aset rasmi SMARTLib | URL/ID Apps Script dan Google Sheet sekolah |

Jangan gunakan `git push --force`, mirror sync, `rsync --delete` atau salin seluruh repository untuk update sekolah. Gunakan allowlist core dan semak diff dahulu. Jangan salin adapter/fixtures/demo.config.js ke pelanggan.

1. Rekod commit deployment semasa; buat backup config dan logo dalam ruang sekolah yang dibenarkan.
2. Bina artefak release daripada master. Dalam index artefak, tukar script `config.example.js` kepada `config.js`; sahkan hanya satu script config dimuatkan. Jangan menghantar config contoh di tempat config sekolah.
3. Bandingkan artefak dengan deployment. Salin core allowlist sahaja. Pastikan hash config, logo dan settings sekolah tidak berubah.
4. Migrasi schema secara append-only hanya jika release memerlukan dan selepas backup/ujian pada backend sekolah sendiri. Jangan reset atau kosongkan sheet.
5. Jalankan smoke test, commit biasa dan push ke branch deployment sekolah yang betul. Pantau Pages dan sahkan commit yang dihidangkan.
6. Jika gagal, rollback commit core; kekalkan data/config sekolah dan nilai semula migrasi schema secara berasingan.

SKPKT production tidak menjadi sasaran strategi ini sehingga ada arahan migrasi berasingan yang nyata.
