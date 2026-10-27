# Academic Agent Studio

Aplikasi Next.js untuk menyusun dan menyunting dokumen akademik.

## Menjalankan secara lokal

Gunakan Node.js yang mendukung `--experimental-strip-types`, lalu jalankan `npm install` dan `npm run dev`. Buka alamat yang ditampilkan oleh Next.js. Jalankan pengujian dengan `npm test` dan pemeriksaan tipe dengan `npx tsc --noEmit --incremental false`.

## Status fitur

Aplikasi saat ini berjalan dalam **mode lokal**: data sesi dan proyek disimpan di browser dan dapat hilang jika data browser dihapus. Ekspor pekerjaan secara berkala. Akun, pembayaran, administrasi, sinkronisasi Supabase, dan unggah R2 dinonaktifkan sampai autentikasi server dan pembatasan akses tersedia. Data lokal lama tidak dihapus oleh perubahan ini.

Pada pengembangan lokal, `npm run dev` hanya mendengarkan 127.0.0.1. Atur `GEMINI_API_KEY` dan `ACADEMIC_LOCAL_AI=true` di `.env.local` untuk memakai kunci proyek. Gunakan lingkungan lokal tepercaya: pengguna yang memiliki akses ke server lokal dapat menggunakan kuota kunci tersebut. Di produksi kunci server tidak digunakan untuk permintaan anonim. Untuk menggunakan kunci pribadi, pilih **AI: hubungkan** dan masukkan kunci API Gemini. Kunci disimpan di sessionStorage pada tab tersebut dan dikirim ke server aplikasi untuk permintaan AI; gunakan hanya pada server yang Anda percayai. Endpoint tidak menggunakan kunci server untuk pengguna anonim. Jika kunci atau layanan tidak tersedia, beberapa fitur memakai draf atau saran lokal; hasilnya harus diperiksa. Penggunaan Gemini mengikuti kuota dan biaya akun pemilik kunci.

Pemeriksaan sitasi hanya memeriksa format dan konsistensi lokal, bukan keberadaan sumber, pencabutan, atau kecocokan klaim. Pencarian literatur bukan pemeriksaan plagiarisme. Periksa semua sumber dan ikuti pedoman kampus.

## Sebelum produksi

Diperlukan autentikasi dan otorisasi server, kebijakan RLS yang diuji, penyimpanan transaksi dan kuota di server, pembatasan permintaan, penyimpanan file privat, serta verifikasi referensi terhadap sumber tepercaya. Jangan mengaktifkan fitur pembayaran atau penyimpanan bersama hanya dengan mengubah antarmuka.
