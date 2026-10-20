# Kontrak configuration — Tahap 2

## Satu source deployment

`window.SMARTLIB_CONFIG` dimuatkan daripada config.js sebelum aplikasi. js/config.js normalize/freeze nilainya dan mengesahkan field. config.example.js tidak dimuatkan ketika runtime.

| Field | Tugas |
|---|---|
| environment | master, demo atau customer |
| schoolId | Identiti deployment dan scope cache; bukan authentication |
| schoolName, resourceCentreName | Identity awal sekolah/PSS |
| appName, fullAppName, tagline | Nama produk/paparan dan metadata |
| version | Metadata versi; dipaparkan kecil pada footer |
| backendUrl | Satu endpoint sekolah; tiada password/token |
| assets.schoolLogo | Logo sekolah: sidebar, toolbar, kad dan paparan sekolah |
| assets.smartlibLogo | Logo produk: login dan fallback rasmi |
| assets.icon192, icon512, appleTouchIcon | Ikon browser/PWA deployment |
| features | Metadata boolean modul; navigation enforcement belum diaktifkan |

`GAS` membaca config.backendUrl; `GAS_URL` ialah alias GAS; CFG.url dan window.CFG.url menggunakan nilai yang sama. Semua panggilan backend melalui smartlibBackendFetch, termasuk OPAC dan tempahan awam. Query action/session sedia ada dikekalkan. Jika backend kosong dalam master/demo, URL sementara untuk penghurai GET diambil daripada location.href; ia **tidak dihantar ke rangkaian**.

## Environment dan validation

- Master: backendUrl mesti kosong. Preview boleh dibuka; mesej terkawal menerangkan backend belum dikonfigurasi. Tiada panggilan backend dibuat.
- Demo: backendUrl mesti kosong untuk implementation simulasi tempatan ini. Loader hanya memuatkan js/demo-data.js, demo-adapter.js dan demo-entry.js dalam environment demo yang sah.
- Customer: backend mesti HTTPS, hostname tepat script.google.com, path /macros/s/DEPLOYMENT_ID/exec, tanpa credentials, query atau fragment. Placeholder XXXXX ditolak.
- schoolId, schoolName dan appName wajib diisi. Invalid/missing config memaparkan **Konfigurasi SMARTLib belum lengkap.**, menggunakan title fallback dan menyekat backend. Console hanya menyenaraikan field bermasalah, bukan nilai atau secrets.

config.js master yang tracked ialah placeholder neutral yang disengajakan. Jangan simpan config pelanggan sebenar di master. config.js customer/demo mesti tracked bagi hosting statik; local-config.* dan config.local.js diignore. Config.example.js sentiasa tracked.

## Precedence runtime settings

Identity UI: **backend settings sah/non-empty → deployment config → built-in fallback**.

Mapping: sekolah → schoolName, nama_app → appName, tagline → tagline, logo_url → schoolLogo, logo_emoji → emoji; resource_centre_name boleh override nama PSS jika backend membekalkannya. Field kosong memulihkan fallback config. Nilai bukan string diabaikan. AP.sch/AP.sekolah dan AP.nm/AP.nama ialah alias kepada identity yang sama; kad, label, title, dashboard dan cetakan tidak memerlukan config berasingan.

Settings sedia ada bagi maks_hari, maks_pinjam, denda, dark mode dan pengumuman dikekalkan. Settings tidak boleh mengubah deployment schoolId, backendUrl, environment atau path ikon PWA. Nama manifest tidak berubah selepas settings runtime load; generate manifest daripada config deployment semasa release.

## PWA statik

manifest.template.webmanifest ialah JSON dengan placeholder teks, bukan expression JavaScript. scripts/generate-manifest.cjs membaca config.js, validate, mengganti token dalam object JSON dan menulis manifest.webmanifest. Penulisan JSON mengendalikan Unicode/quotes dengan selamat.

Jalankan `node scripts/generate-manifest.cjs` selepas menukar nama/icon PWA. Override path boleh diberi: `node scripts/generate-manifest.cjs config.js manifest.webmanifest`. start_url, id dan scope kekal relatif `./`, sesuai bagi project Pages. Ujian ini tidak mengesahkan pemasangan native PWA atau offline service worker.

## Keserasian dan had

Loader masih menerima mode lama scaffold/school/demo dan schoolLogo/smartlibLogo top-level sebagai input migration, kemudian normalize kepada environment/assets tunggal. Config baharu hendaklah menggunakan schema Tahap 2.

Feature flags ialah metadata sahaja dalam fasa ini; `booking:false` belum hide UI dan bukan authorization. Enforcement navigation memerlukan ujian berasingan supaya semua pintu masuk modul konsisten.

Error transport dibezakan: CONFIG (config/endpoint mismatch), NETWORK (fetch gagal), BACKEND (HTTP bukan 2xx atau respons login bukan JSON), AUTH (backend menolak login/member_login). AbortError dikekalkan untuk timeout/cancellation sedia ada. Body diagnostik backend tidak dimasukkan ke error HTTP.

Authentication/session logic kekal. Tiada token statik ditambah. Rujukan CFG.token legacy tidak mempunyai nilai statik dalam master; guard mengelakkan penghantaran undefined. Ini ialah **TECHNICAL DEBT / SECURITY MIGRATION REQUIRED** bersama boot/override legacy dan audit auth/backend seterusnya. Jangan menambah shared token ke config.
