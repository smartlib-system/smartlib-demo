# Pelan migrasi berperingkat

## Keadaan baseline

Frontend asal terdiri daripada `index.html` besar dengan CSS, fungsi global dan beberapa patch/override legacy. Baseline komersial mengekalkan markup serta CSS tersebut. Tiada pemisahan besar-besaran ke fail baru dalam setup ini.

Perubahan setempat ialah membuang URL backend/branding sekolah, membaca config neutral, menambah sempadan transport dalam `js/app.js`, menggunakan aset neutral berlaluan relatif dan mengasingkan nama cache mengikut schoolId. Backend asal tidak dimasukkan.

## Peringkat seterusnya

1. Bekukan baseline visual/tingkah laku: login, sidebar, dark mode, dashboard, katalog, ahli, pinjam/pulang, pelupusan, tempahan, kad, label, scanner dan cetakan A4.
2. Inventori semua fungsi global, override, event handler dan susunan script. Tandakan dependency dan handler berulang sebelum mengubahnya.
3. Ekstrak satu blok CSS statik setiap perubahan ke `css/smartlib.css`. Kekalkan susunan cascade; bandingkan screenshot desktop/mobile/dark mode dan cetakan selepas setiap perubahan.
4. Pindahkan helper tulen dan kontrak data ke modul berasingan. Jangan tukar susunan boot atau menyatukan patch legacy sehingga coverage wujud.
5. Pindahkan satu modul fungsi pada satu masa ke `js/`. Kekalkan API global yang dipanggil inline handler sehingga migrasi event handler diluluskan dan diuji.
6. Audit backend secara berasingan, termasuk auth server, stock aggregate seluruh data, status pelupusan, cache, schema append-only dan hak akses. Jangan menggunakan backend production untuk ujian.
7. Stabilkan `development`, uji di demo, bina release dan gabungkan ke `main` selepas semakan.

Baseline ini ialah asas development; ia bukan bukti bahawa backend multi-school, semua tindakan modul atau kamera sebenar telah diuji. Jangan menjualnya sebagai deployment pelanggan siap sebelum checkpoint di atas selesai.
