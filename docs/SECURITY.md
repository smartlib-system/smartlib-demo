# Perlindungan data dan secrets

Master tidak menyimpan data sekolah, Apps Script production atau credentials. Audit sumber lama mendapati kata laluan permulaan hardcoded dalam backend. Fail backend itu tidak disalin. Nilai rahsia/credential tidak dimasukkan ke laporan, commit atau fixtures.

Tiada Google Sheet, data murid/guru, pinjaman, pelupusan atau tempahan production diambil. Fixtures demo ditulis secara manual dengan nama rekaan dan alamat `example.invalid`.

`.gitignore` mengecualikan config sekolah, .env, keys, credentials, exports, database dan backups. Ini hanya pencegahan commit tidak sengaja; ia tidak memadam secrets daripada sejarah Git dan tidak menggantikan audit sebelum push.

Sebelum publish setiap release/demo:

- Jalankan `node --test tests/commercial.test.cjs tests/configuration.test.cjs` dan pemeriksaan browser.
- Semak staged diff dan fail tracked, termasuk imej, metadata, manifest dan dokumen.
- Pastikan tiada token, password literal, private key, ID/URL backend production atau data peribadi. Ujian pola tidak membuktikan semua jenis secrets dapat dikesan; semakan manusia masih diperlukan.
- Sahkan demo mode dan backend kosong. Adapter demo menyimpan simulasi dalam memori sahaja dan tidak memanggil fetch ke backend.
- Simpan secrets sebenar dalam backend/server configuration, bukan JS frontend atau GitHub Pages. URL Apps Script ialah endpoint yang kelihatan dalam frontend, bukan pengganti authentication.

Backend komersial perlu disediakan dan diaudit sebelum pelanggan pertama. Jangan gunakan kata laluan permulaan lama. Jika ia masih digunakan pada mana-mana deployment, pemilik perlu menilai dan menukarnya melalui proses sekolah berkenaan. Setup ini tidak mengubah auth production.

## Tahap 2

Tiada credential aktif dikesan dalam current files/changes. Config master/demo tidak mengandungi backend sekolah. Shared static token tidak ditambah; CFG.token legacy tidak mempunyai nilai statik dan hanya dihantar jika tersedia. Ini ialah TECHNICAL DEBT / SECURITY MIGRATION REQUIRED, bukan authentication hardening. Fail browser test menggunakan endpoint TEST_BROWSER_A/B rekaan yang dipintas Playwright, bukan deployment sebenar.

config.js ialah fail browser-public yang tracked secara sengaja: placeholder master, dummy demo, atau config milik sekolah dalam repo customer. BackendUrl bukan authentication. Jangan letak secrets dalam mana-mana config.
