# Yin-Panel Helper

[English](../../README.md) | [简体中文](../zh-CN/README.md) | [繁體中文](../zh-TW/README.md) | [日本語](../ja-JP/README.md) | [한국어](../ko-KR/README.md) | [Deutsch](../de-DE/README.md) | [Français](../fr-FR/README.md) | [Español](../es-ES/README.md) | [Português (Brasil)](../pt-BR/README.md) | [Русский](../ru-RU/README.md) | **Bahasa Indonesia** | [Türkçe](../tr-TR/README.md) | [Polski](../pl-PL/README.md) | [Italiano](../it-IT/README.md) | [Nederlands](../nl-NL/README.md) | [हिन्दी](../hi-IN/README.md) | [ไทย](../th-TH/README.md)

Ekstensi Chrome Manifest V3 opsional untuk Yin-Panel. Ekstensi ini mengambil byte favicon situs asli untuk impor bookmark ketika permintaan browser normal diblokir oleh CORS, beralih ke layanan favicon publik, dan menambahkan pengalihan tab baru yang dapat dikonfigurasi. Yin-Panel tetap berfungsi tanpanya dengan menggunakan favicon sisi server dan fallback ikon teks miliknya sendiri.

## Pemasangan

1. Buka `chrome://extensions`.
2. Aktifkan mode Developer.
3. Pilih **Load unpacked** dan pilih direktori ini.
4. Muat ulang Yin-Panel sebelum memulai impor bookmark.

## Izin

- `storage` — menyimpan URL target tab baru.
- `host_permissions: ["<all_urls>"]` — ekstensi meminta data favicon langsung dari situs bookmark.
- Tidak ada izin kamera, mikrofon, lokasi, notifikasi, atau perangkat yang diminta.

## Pengalihan tab baru

`chrome_url_overrides` mengirim setiap tab baru ke `newtab.html`, yang langsung mengalihkan ke target tersimpan. Bawaannya adalah `https://panel.yiniot.com`, dan hanya URL `http` dan `https` yang diterima; nilai yang tidak valid atau kosong akan kembali ke bawaan. Tetapkan target dari popup toolbar atau halaman opsi.

## Pengambilan favicon

- Skrip konten hanya menjawab pesan yang ditandai dengan `source: 'yin-panel'`, dan mendukung tipe pesan `ping` serta `fetch-icons`.
- Untuk setiap halaman, service worker terlebih dahulu mengikuti deklarasi ikon milik situs itu sendiri (`rel="icon"`, `apple-touch-icon`, `mask-icon`), lalu jalur favicon akar yang umum.
- Jika semuanya gagal, ekstensi ini menyelidiki layanan favicon publik, membuat kumpulan delapan permintaan untuk setiap layanan yang dapat digunakan.
- Pencarian yang gagal dikembalikan ke Yin-Panel, yang menerapkan favicon dan fallback ikon teks miliknya sendiri; ekstensi tidak menghasilkan ikon fallback terpisah.

## Bahasa

Antarmuka mengikuti bahasa UI browser. String bahasa Inggris, Tionghoa Sederhana, Tionghoa Tradisional, Jepang, Korea, Jerman, Prancis, Spanyol, Portugis Brasil, Rusia, Indonesia, Turki, Polski, Italia, Belanda, Hindi, dan Thai berada di `_locales/`; bahasa browser lain akan kembali ke bahasa Inggris. Teks halaman ekstensi diselesaikan melalui `i18n.js` dan tidak pernah di-hard-code.

## Pengembangan

| File | Peran |
| --- | --- |
| `service-worker.js` | Pesan ekstensi, pengambilan favicon situs, dan fallback publik |
| `content-script.js` | Jembatan pesan sisi halaman yang digunakan oleh Yin-Panel |
| `config.js` | Normalisasi URL tab baru dan target bawaan |
| `newtab.html`, `newtab.js` | Penggantian tab baru dan pengalihan |
| `settings.html`, `settings.css`, `settings.js` | Halaman opsi dan popup toolbar |
| `i18n.js`, `_locales/` | Helper pelokalan halaman bersama dan katalog pesan per bahasa |
| `manifest.json` | Izin, entrypoint, penggantian tab baru, dan registrasi skrip konten |

Tidak ada langkah build; setiap berkas dimuat langsung. Periksa JavaScript dan manifes dengan:

```bash
node --check service-worker.js
node --check content-script.js
node --check config.js
node --check newtab.js
node --check settings.js
node --check i18n.js
```

[AGENTS.md](../../AGENTS.md) mendokumentasikan invarian perilaku, penempatan pengujian, dan aturan keselamatan. Tes penerimaan tingkat browser berada di [repositori E2E](https://github.com/yinorg/yin-panel-e2e); layanan Core berada di [yinorg/Yin-Panel](https://github.com/yinorg/Yin-Panel).

## Publikasi otomatis ke Chrome Web Store

Workflow di `.github/workflows/publish-chrome-web-store.yml` berjalan saat tag rilis didorong (push). Workflow ini membangun paket sementara, menetapkan versi manifes paket dari tag, mengunggahnya melalui Chrome Web Store API v2, dan mengirimkannya untuk ditinjau.

Chrome menerima satu hingga empat segmen versi numerik yang dipisahkan titik, sehingga tag harus berbentuk seperti `1.2.3` atau `v1.2.3`. Huruf `v` di awal yang opsional dihapus sebelum menulis versi manifes. Setiap segmen harus antara `0` dan `65535`, dan versinya harus lebih besar daripada versi yang saat ini dipublikasikan.

### Penyiapan sekali saja

1. Aktifkan Chrome Web Store API di proyek Google Cloud.
2. Buat akun layanan Google Cloud dan tambahkan emailnya di pengaturan akun Chrome Web Store Developer Dashboard. Lihat [panduan akun layanan Chrome Web Store](https://developer.chrome.com/docs/webstore/service-accounts).
3. Konfigurasikan GitHub Actions Workload Identity Federation untuk repositori ini. [Panduan auth Google GitHub Actions](https://github.com/google-github-actions/auth#setting-up-workload-identity-federation) menjelaskan pool, provider, dan pengikatan IAM yang diperlukan.
4. Tambahkan secret repositori berikut:

   - `GCP_WORKLOAD_IDENTITY_PROVIDER`: nama sumber daya provider lengkap, seperti `projects/123456789/locations/global/workloadIdentityPools/github/providers/yin-panel-extension`.
   - `GCP_SERVICE_ACCOUNT`: email akun layanan.
   - `CHROME_WEBSTORE_PUBLISHER_ID`: ID penerbit dari Developer Dashboard.
   - `CHROME_WEBSTORE_EXTENSION_ID`: ID 32 karakter ekstensi yang dipublikasikan ini.

Misalnya, publikasikan versi `1.0.1` dengan:

```sh
git tag v1.0.1
git push origin v1.0.1
```

Workflow mengirimkan rilis secara otomatis, tetapi peninjauan Chrome Web Store dapat menunda kapan versi baru tersedia bagi pengguna.
