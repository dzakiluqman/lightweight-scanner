# Lightweight PDF Scanner

Aplikasi mobile ringan untuk memindai dokumen fisik menjadi PDF berkualitas tinggi. Lightweight PDF Scanner menggunakan deteksi tepi dan auto-crop dari native document scanner, sehingga beberapa halaman dapat diproses menjadi satu dokumen PDF tanpa watermark.

## Fitur

- Memindai satu atau beberapa halaman melalui kamera perangkat.
- Deteksi tepi otomatis dan perspective auto-crop.
- Pratinjau halaman sebelum ekspor.
- Menambah, memindai ulang, menghapus, dan mengurutkan halaman.
- Ekspor gambar hasil pindaian ke PDF berformat A4.
- Penamaan file PDF dengan sanitasi karakter yang tidak valid.
- Riwayat dokumen yang tersimpan secara lokal di perangkat.
- Pencarian dokumen berdasarkan nama file.
- Membagikan PDF melalui OS share sheet.
- Menyimpan PDF ke penyimpanan eksternal dan menghapus dokumen.

## Teknologi

- [Expo](https://expo.dev/) SDK 57
- [React Native](https://reactnative.dev/) 0.86
- [Expo Router](https://docs.expo.dev/router/introduction/)
- TypeScript dan JavaScript
- [`react-native-document-scanner-plugin`](https://github.com/WebsiteBeaver/react-native-document-scanner-plugin)
- `expo-print`, `expo-file-system`, `expo-sharing`, dan `expo-media-library`
- AsyncStorage untuk metadata riwayat dokumen

## Prasyarat

- Node.js versi LTS
- npm
- Android Studio dan emulator Android untuk pengembangan Android, atau Xcode untuk iOS
- Expo CLI melalui dependensi proyek
- Perangkat fisik atau development build untuk menguji kamera

> Modul native document scanner tidak dapat diuji sepenuhnya melalui browser. Untuk fitur pemindaian, gunakan perangkat fisik atau development build.

## Instalasi

```bash
git clone <url-repository>
cd lightweight-scanner
npm install
```

## Menjalankan Aplikasi

Mulai development server:

```bash
npm run start
```

Perintah platform yang tersedia:

```bash
npm run android  # Membuka project di Android
npm run ios      # Membuka project di iOS
npm run web      # Menjalankan target web untuk layar yang kompatibel
```

Saat pertama kali digunakan, berikan izin kamera dan akses media ketika diminta oleh sistem operasi.

## Pemeriksaan Kode

Jalankan lint sebelum membuat perubahan dikirimkan:

```bash
npm run lint
```

## Build dengan EAS

Profil build telah disediakan di [`eas.json`](eas.json):

```bash
# Development build Android berbentuk APK
npx eas-cli build --profile development --platform android

# Preview/release internal berbentuk APK
npx eas-cli build --profile preview --platform android

# Production Android berbentuk Android App Bundle
npx eas-cli build --profile production --platform android
```

Pastikan sudah login ke akun Expo dan project EAS telah dikonfigurasi sebelum menjalankan build. Detail resmi tersedia di [EAS Build](https://docs.expo.dev/build/introduction/).

## Struktur Proyek

```text
.
├── App.js                    # State dan alur utama scanner
├── app.json                  # Konfigurasi Expo dan permission native
├── eas.json                  # Profil build EAS
├── src/
│   ├── app/                  # Route Expo Router
│   ├── components/           # Komponen UI scanner dan riwayat
│   ├── constants/            # Konstanta tema
│   ├── hooks/                # Hook terkait tema dan color scheme
│   └── services/
│       └── pdfService.js     # Scanner, konversi PDF, storage, dan sharing
└── assets/                   # Icon, splash screen, dan aset aplikasi
```

## Penyimpanan Data

File PDF disimpan di direktori dokumen internal aplikasi. Metadata riwayat disimpan menggunakan AsyncStorage dengan key `@lightweight_pdf_scanner_history`. Saat riwayat dimuat, entri yang file PDF-nya sudah tidak tersedia akan dibersihkan secara otomatis.

## Permission

Aplikasi meminta akses berikut sesuai platform:

- Kamera untuk memindai dokumen.
- Galeri atau media untuk menyimpan dan mengelola hasil pindaian.
- Penyimpanan eksternal pada Android untuk ekspor file.

Deskripsi permission dikonfigurasi di [`app.json`](app.json) dan ditampilkan oleh sistem operasi saat runtime.

## Lisensi

Lihat file [`LICENSE`](LICENSE) untuk informasi lisensi proyek.
