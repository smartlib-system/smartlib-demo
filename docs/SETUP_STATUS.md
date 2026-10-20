# Setup status — 2026-10-20

- Organization: `smartlib-system`; pemilik yang disahkan semasa setup: `SKPKT` sahaja.
- Master: private, branch `main` dan `development`, Pages tidak diaktifkan.
- Demo: fixtures rekaan, diterbitkan secara public hanya selepas audit dan ujian.
- Pelanggan sebenar: belum dicipta.
- Backend komersial: belum dimigrasi/dideploy. Tiada Sheet baharu diperlukan untuk demo ini.
- Baseline source frontend dibaca sahaja daripada versi production yang telah diterbitkan. Sejarah Git production, database dan data sekolah tidak disalin ke repositori baharu.
- URL backend production dan branding sekolah dibuang daripada baseline komersial. Backend asal yang mempunyai kata laluan permulaan hardcoded tidak dimasukkan.
- CSS inline asal dibandingkan menggunakan SHA-256; tiada perubahan pada blok tersebut. Copyright dikekalkan.

## Pengesahan yang dilaksanakan sebelum penerbitan awal

Node checks: 6 master dan 10 demo (syntax script, UTF-8, CSS baseline, konfigurasi, aset, pola secrets, pengasingan backend, fixtures, simulasi pinjam/pulang, cadangan pelupusan dan tempahan).

Browser smoke test menggunakan Edge headless: 13 paparan modul dibuka, demo admin, carian OPAC awam, pinjaman/pemulangan simulasi, edit cadangan pelupusan, Borang 9, dark mode, mobile dan reset selepas refresh. Tiada page error JavaScript atau request backend dikesan dalam sesi yang diuji.

Ujian ini tidak meliputi backend Google Apps Script sebenar, transaksi sekolah, kamera fizikal atau semua cabang tindakan legacy. Demo mempunyai tindakan yang sengaja tidak disimulasikan; README menyenaraikan hadnya. Status deployment Pages akhir hendaklah disahkan melalui GitHub dan laman yang dihidangkan, bukan berdasarkan kewujudan fail ini.

Langkah pelanggan pertama diterangkan dalam `ARCHITECTURE.md`; pelan migrasi dalam `MIGRATION_PLAN.md`; update core/config dalam `UPDATE_STRATEGY.md`.
