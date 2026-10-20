# Strategi update

development → ujian → smartlib-demo → main stabil → release → customer yang telah diluluskan.

## Sempadan fail

| Boleh dikemas kini sebagai core | Mesti dikekalkan/disemak khusus sekolah |
|---|---|
| index.html | config.js |
| js/config.js, js/app.js dan modul core yang diluluskan | assets/school-logo.png dan aset khusus |
| CSS dan aset rasmi SMARTLib | manifest.webmanifest dan custom favicon/PWA icons |
| template manifest dan tools development | backendUrl, schoolId dan settings/database sekolah |

1. Rekod versi/commit deployment semasa, release notes dan pelan rollback. Simpan backup settings/config/aset dalam ruang sekolah yang dibenarkan.
2. Semak diff dan gunakan allowlist core sahaja. index.html kini sama; **jangan tukar tag script config**. Tiada search/replace nama atau endpoint diperlukan.
3. Jangan copy config.js, manifest deployment atau js/demo-*.js daripada master/demo ke customer. Jangan gunakan force push, mirror/delete sync atau overwrite keseluruhan repository.
4. Bandingkan hash config, logo, ikon dan manifest khusus sebelum/selepas update. Jika schema config berubah, semak dan merge field secara sengaja; jangan overwrite values pelanggan.
5. Manifest template boleh dikemas kini sebagai tool. Regenerate manifest deployment hanya selepas semakan config/icon sekolah, bukan secara automatik ketika update core biasa.
6. Uji pada backend ujian sekolah sendiri, kemudian commit biasa, push branch deployment yang betul dan sahkan Pages/commit yang dihidangkan.
7. Rollback core jika perlu, dengan config/aset/data sekolah dikekalkan. Migrasi schema database ialah kerja berasingan dan tidak boleh reset sheet.

Semasa sync ke demo, salin core yang sama; kekalkan config demo, fixtures, aset neutral dan manifest demo. Jalankan keselamatan config dan browser sebelum publish.

Production SKPKT bukan sasaran update ini tanpa arahan berasingan.
