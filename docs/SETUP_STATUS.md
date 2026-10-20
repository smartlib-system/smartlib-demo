# Status komersial — Tahap 2

Master private dan demo public kini menggunakan runtime config.js masing-masing. Master neutral/backend kosong; demo identity rekaan/backend kosong. Core index/runtime sama, CSS inline asal dan aset rasmi tidak diubah. Tiada customer repository, Apps Script atau Google Sheet dicipta.

Configuration fields, branding, endpoint tunggal, environment, validation, error classification, version footer dan manifest template disediakan. Config hilang/invalid dikendalikan dengan mesej yang jelas. README menerangkan policy tracked config selamat dan fail customer yang mesti dikekalkan.

Feature flags hanya metadata; navigation enforcement belum dilaksanakan. Authentication/database/business logic tidak ditulis semula. Static-token/legacy boot debt, audit backend komersial dan ujian kamera/peranti sebenar masih perlu kerja berasingan.

## Pengesahan

Suite Node meliputi syntax/UTF-8/CSS baseline, tiada endpoint production/secrets, fixture safety, config normalization, settings precedence, alias, validation, backend switching, error types dan manifest statik.

Browser configuration check menggunakan backend olok-olok yang dipintas sepenuhnya: config-only school/title/logo/endpoint changes, login sedia ada, kad, OPAC dan tempahan awam, settings override, config missing/invalid dan master disconnected. Demo smoke check menggunakan data rekaan bagi 13 paparan, transaksi simulasi, Borang 9, dark/mobile dan refresh reset.

Keputusan sebenar dan deployment akhir dicatat dalam laporan Tahap 2. Fail ini tidak membuktikan semua cabang legacy, backend sebenar, kamera fizikal atau pemasangan native PWA telah diuji. Jangan gunakan demo sebagai bukti bahawa backend komersial sudah production-ready.
