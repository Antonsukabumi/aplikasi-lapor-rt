# Panduan Deployment ke Vercel

Jangan bingung, ikuti langkah ini satu per satu.

## Langkah 1: Pastikan Kode ada di GitHub
Sebelum ke Vercel, kode di laptop harus "naik" ke GitHub dulu.
Cek di browser: **https://github.com/Antonsukabumi/aplikasi-lapor-rt**
Apakah kode yang Anda lihat disana sudah "baru" (ada folder `app/super-admin`)?
- **Jika YA**: Lanjut ke Langkah 2.
- **Jika TIDAK**: Anda harus push dulu dari terminal laptop:
  ```bash
  git push origin main
  ```

## Langkah 2: Mulai di Vercel
1.  Buka **[Dashboard Vercel](https://vercel.com/dashboard)**.
2.  Lihat tombol **"Add New..."** (biasanya tombol hitam di kanan atas).
3.  Klik tombol itu, lalu pilih **"Project"**.

## Langkah 3: Import Repository
1.  Anda akan melihat daftar repository GitHub Anda.
2.  Cari **`aplikasi-lapor-rt`**.
3.  Klik tombol **"Import"** di sebelahnya.

## Langkah 4: Konfigurasi (PENTING!)
Anda akan melihat halaman "Configure Project".
1.  **Project Name**: Biarkan default (`aplikasi-lapor-rt`).
2.  **Framework Preset**: Biarkan `Next.js`.
3.  **Root Directory**: Biarkan `./`.
4.  **Environment Variables**: **(INI BAGIAN KRUSIAL)**
    Klik untuk membuka bagian ini. Anda harus memasukkan "rahasia" aplikasi agar bisa jalan.
    Copy data ini dari file `.env.local` di laptop Anda, lalu masukkan satu per satu:

    | Key (Nama) | Value (Isi/Nilai) |
    |------------|-------------------|
    | `NEXT_PUBLIC_SUPABASE_URL` | (Copy dari .env.local) |
    | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | (Copy dari .env.local) |
    | `JWT_SECRET` | (Isi bebas, contoh: `rahasia123`) |

    *Cara isi:* Masukkan Nama di kiri, Nilai di kanan, lalu klik tombol **Add**. Ulangi untuk ketiga variable di atas.

## Langkah 5: Deploy
1.  Klik tombol besar **"Deploy"**.
2.  Tunggu sekitar 1-2 menit. Anda akan melihat proses "Building...".
3.  Jika berhasil, layar akan penuh dengan kembang api (konfeti) dan tulisan **"Congratulations!"**.

## Langkah 6: Selesai!
Klik tombol **"Visit"** atau klik gambar preview website.
Itulah link website Anda yang bisa dishare (contoh: `aplikasi-lapor-rt.vercel.app`).
