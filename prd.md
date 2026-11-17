# PRODUCT REQUIREMENTS DOCUMENT (PRD)

# Website Rental Mobil Kupang

**Versi:** 1.0  
**Status:** Draft – MVP  
**Platform:** Web Application  
**Bahasa:** Indonesia  
**Lokasi Operasional:** Kota Kupang, Nusa Tenggara Timur

---

# 1. Ringkasan Proyek

## 1.1 Latar Belakang

Rental Mobil Kupang merupakan platform website untuk mempromosikan dan mengelola layanan penyewaan kendaraan harian di Kota Kupang.

Website ini bertujuan mempermudah calon pelanggan dalam melihat pilihan kendaraan, mengetahui harga sewa, memeriksa ketersediaan mobil, dan mengajukan pemesanan tanpa harus datang langsung atau menghubungi pemilik rental terlebih dahulu.

Di sisi lain, website menyediakan dashboard administrator untuk mengelola kendaraan, harga sewa, permintaan booking, dan jadwal penyewaan.

Sistem dikembangkan dengan pendekatan Minimum Viable Product (MVP), sehingga hanya mencakup fitur-fitur inti yang dibutuhkan untuk menjalankan operasional rental mobil.

## 1.2 Tujuan Produk

1. Menyediakan katalog kendaraan yang dapat diakses secara online.
2. Memudahkan pelanggan melakukan permintaan booking secara online.
3. Menyediakan informasi harga dan ketersediaan kendaraan.
4. Mempermudah administrator mengelola data kendaraan dan booking.
5. Mengurangi proses pencatatan penyewaan secara manual.
6. Menyediakan saluran komunikasi langsung antara pelanggan dan administrator melalui WhatsApp.

## 1.3 Target Pengguna

**Pelanggan:**

- Wisatawan yang berkunjung ke Kota Kupang.
- Masyarakat lokal yang membutuhkan kendaraan.
- Pelanggan perjalanan dinas.
- Keluarga yang membutuhkan kendaraan untuk keperluan tertentu.
- Pelanggan yang membutuhkan kendaraan dengan atau tanpa sopir.

**Administrator:**

- Pemilik usaha rental mobil.
- Petugas yang bertanggung jawab mengelola kendaraan dan pemesanan.

---

# 2. Ruang Lingkup Produk

## 2.1 Fitur yang Termasuk MVP

Website memiliki dua bagian utama:

**A. Customer Website**

- Landing page.
- Katalog kendaraan.
- Detail kendaraan.
- Formulir booking.
- Pemeriksaan ketersediaan kendaraan.
- Estimasi biaya penyewaan.
- Integrasi WhatsApp.
- Informasi layanan dan kontak.

**B. Admin Dashboard**

- Login administrator.
- Dashboard ringkasan.
- Manajemen kendaraan.
- Manajemen harga sewa.
- Manajemen booking.
- Kalender penyewaan.
- Pengelolaan status kendaraan.
- Pengaturan informasi bisnis.

## 2.2 Fitur di Luar MVP

Fitur berikut tidak menjadi prioritas pengembangan tahap pertama:

- Payment gateway.
- Pembayaran otomatis melalui QRIS.
- Registrasi dan login pelanggan.
- Membership pelanggan.
- Loyalty points.
- Sistem voucher dan diskon.
- Review dan rating kendaraan.
- Aplikasi mobile Android/iOS.
- Notifikasi otomatis melalui WhatsApp API.
- Multi-cabang rental.
- Laporan keuangan kompleks.
- Integrasi GPS kendaraan.
- Sistem tanda tangan kontrak digital.

---

# 3. Informasi Kendaraan

Pada tahap awal, sistem menyediakan empat kendaraan.

| No. | Kendaraan            | Merek  | Tipe         |
| --- | -------------------- | ------ | ------------ |
| 1   | Toyota Avanza        | Toyota | MPV          |
| 2   | Toyota Innova Reborn | Toyota | MPV          |
| 3   | Honda Brio           | Honda  | City Car     |
| 4   | Toyota Hilux         | Toyota | Double Cabin |

## 3.1 Informasi Kendaraan

Setiap kendaraan memiliki informasi:

- Nama kendaraan.
- Merek.
- Tipe kendaraan.
- Deskripsi.
- Foto kendaraan.
- Kapasitas penumpang.
- Jenis transmisi.
- Harga sewa per hari.
- Status kendaraan.
- Ketersediaan kendaraan.

Data kendaraan tidak boleh di-hardcode pada frontend. Seluruh informasi harus diambil dari database agar administrator dapat memperbarui informasi melalui dashboard.

## 3.2 Harga Sewa

Harga awal untuk seluruh kendaraan adalah:

**Rp300.000 / hari**

Ketentuan:

1. Semua kendaraan menggunakan harga awal yang sama, yaitu Rp300.000 per hari.
2. Harga bersifat dinamis dan harus dapat diubah administrator.
3. Perubahan harga dilakukan melalui dashboard.
4. Administrator dapat menentukan harga berbeda untuk setiap kendaraan apabila diperlukan.
5. Harga yang ditampilkan pada website harus mengikuti data terbaru dari database.
6. Harga booking yang sudah dikonfirmasi harus disimpan sebagai snapshot agar perubahan harga kendaraan tidak mengubah transaksi sebelumnya.

Catatan: Harga Rp300.000 merupakan harga awal untuk kebutuhan MVP, bukan harga yang dikunci permanen.

## 3.3 Jenis Layanan Penyewaan

Tersedia dua pilihan layanan:

- Dengan sopir (WITH_DRIVER).
- Tanpa sopir / lepas kunci (SELF_DRIVE).

Pelanggan harus memilih jenis layanan ketika melakukan booking.

Ketentuan tambahan mengenai biaya sopir belum ditetapkan. MVP tidak boleh mengarang biaya tambahan. Jika terdapat biaya tambahan, administrator harus dapat menetapkannya sebelum booking dikonfirmasi.

---

# 4. User Roles dan Authentication

## 4.1 Pelanggan (Guest)

Pelanggan tidak diwajibkan membuat akun atau login.

Pelanggan dapat:

- Mengakses halaman website.
- Melihat katalog kendaraan.
- Melihat detail kendaraan.
- Memilih tanggal penyewaan.
- Memeriksa ketersediaan kendaraan.
- Mengisi formulir booking.
- Mengirim permintaan booking.
- Menghubungi administrator melalui WhatsApp.

## 4.2 Administrator

Administrator wajib login untuk mengakses dashboard.

Administrator memiliki hak akses:

- Melihat dashboard.
- Mengelola kendaraan.
- Mengubah harga.
- Mengelola booking.
- Mengubah status booking.
- Melihat kalender penyewaan.
- Mengatur informasi bisnis.

MVP hanya membutuhkan satu jenis role administrator.

Tidak diperlukan sistem multi-role atau manajemen hak akses kompleks.

---

# 5. Functional Requirements

## 5.1 Landing Page

Landing page merupakan halaman utama yang pertama kali dilihat pelanggan.

Komponen:

**A. Navbar**

- Logo atau nama rental.
- Beranda.
- Daftar Mobil.
- Tentang Kami.
- Kontak.
- Tombol Booking / Hubungi Kami.

**B. Hero Section**

Menampilkan:

- Headline utama: "Jelajahi Kupang dengan Nyaman".
- Deskripsi layanan rental.
- Gambar kendaraan atau visual Kota Kupang.
- CTA "Lihat Pilihan Mobil".
- CTA "Pesan Sekarang".

**C. Keunggulan Layanan**

Menampilkan keunggulan:

- Mobil bersih dan terawat.
- Pilihan mobil lengkap.
- Layanan fleksibel.
- Tersedia dengan atau tanpa sopir.
- Harga terjangkau.

**D. Katalog Kendaraan**

Menampilkan empat kendaraan beserta:

- Foto.
- Nama kendaraan.
- Harga per hari.
- Kapasitas.
- Transmisi.
- Status ketersediaan.
- Tombol detail.

**E. Cara Booking**

Menjelaskan proses pemesanan:

1. Pilih kendaraan.
2. Tentukan tanggal penyewaan.
3. Isi informasi pelanggan.
4. Kirim permintaan booking.
5. Tunggu konfirmasi administrator.

**F. Informasi Bisnis**

- Nomor WhatsApp.
- Lokasi rental.
- Jam operasional jika tersedia.
- Informasi layanan.

**G. Footer**

- Logo atau nama bisnis.
- Navigasi.
- Informasi kontak.
- Alamat.
- Copyright.

## 5.2 Katalog Kendaraan

Route: `/mobil`

Fitur:

- Menampilkan semua kendaraan aktif.
- Menampilkan foto kendaraan.
- Menampilkan harga sewa per hari.
- Menampilkan spesifikasi kendaraan.
- Menampilkan status kendaraan.
- Tombol melihat detail kendaraan.

Filter sederhana:

- Semua mobil.
- MPV.
- City Car.
- Double Cabin.

Kendaraan yang berstatus maintenance atau tidak aktif tidak boleh ditampilkan sebagai kendaraan yang tersedia untuk booking.

## 5.3 Detail Kendaraan

Route: `/mobil/[slug]`

Menampilkan:

- Galeri foto kendaraan.
- Nama kendaraan.
- Deskripsi.
- Merek.
- Tipe kendaraan.
- Kapasitas penumpang.
- Jenis transmisi.
- Harga sewa per hari.
- Ketentuan penyewaan.
- Pilihan layanan dengan atau tanpa sopir.
- Tombol booking.

Ketika pelanggan memilih booking, sistem mengarahkan pelanggan ke formulir booking dengan kendaraan yang sudah dipilih.

## 5.4 Booking Form

Route: `/booking`

Booking merupakan proses pengajuan permintaan penyewaan kendaraan.

Formulir berisi:

**Informasi pelanggan:**

- Nama lengkap.
- Nomor WhatsApp aktif.

**Informasi penyewaan:**

- Kendaraan yang dipilih.
- Tanggal mulai penyewaan.
- Tanggal selesai penyewaan.
- Jenis layanan (dengan sopir / tanpa sopir).
- Lokasi penjemputan.
- Catatan tambahan (opsional).

Validasi:

1. Nama wajib diisi.
2. Nomor WhatsApp wajib diisi.
3. Kendaraan wajib dipilih.
4. Tanggal mulai tidak boleh lebih awal dari tanggal saat ini.
5. Tanggal selesai harus setelah tanggal mulai.
6. Durasi penyewaan minimal satu hari.
7. Kendaraan harus tersedia pada rentang tanggal yang dipilih.
8. Nomor WhatsApp harus memiliki format yang valid.

## 5.5 Perhitungan Estimasi Biaya

Sistem menghitung estimasi biaya berdasarkan harga kendaraan dan durasi penyewaan.

Rumus:

Total biaya = Harga per hari × Jumlah hari penyewaan.

Contoh:

| Komponen       |         Nilai |
| -------------- | ------------: |
| Kendaraan      | Toyota Avanza |
| Harga harian   |     Rp300.000 |
| Durasi         |        3 hari |
| Estimasi total |     Rp900.000 |

Ketentuan:

- Perhitungan dilakukan di backend.
- Frontend hanya menampilkan hasil perhitungan.
- Harga harus diambil dari database.
- Nilai harga disimpan pada data booking.
- Estimasi biaya tidak dianggap sebagai tagihan final sebelum dikonfirmasi administrator.
- Apabila terdapat biaya tambahan sopir, biaya tersebut harus dikonfirmasi administrator sebelum booking diterima.

Aturan perhitungan hari harus konsisten antara frontend dan backend. MVP menggunakan perhitungan berdasarkan tanggal kalender, dengan tanggal selesai tidak termasuk dalam jumlah hari sewa.

## 5.6 Pemeriksaan Ketersediaan

Sistem harus memeriksa apakah kendaraan tersedia pada rentang tanggal yang dipilih.

Kendaraan dianggap tidak tersedia apabila:

- Berstatus maintenance.
- Berstatus tidak aktif.
- Memiliki booking CONFIRMED yang bertabrakan dengan tanggal permintaan.
- Sedang digunakan dalam penyewaan aktif yang bertabrakan dengan tanggal permintaan.

Booking PENDING belum memblokir jadwal secara permanen. Administrator dapat mengelola permintaan yang masuk dan memastikan tidak ada dua booking yang dikonfirmasi untuk kendaraan dan periode yang sama.

Sistem wajib melakukan pemeriksaan ulang ketika administrator mengonfirmasi booking.

Pemeriksaan bentrokan menggunakan kondisi:

existing.start_date < requested.end_date AND existing.end_date > requested.start_date

Pemeriksaan harus dilakukan di backend, bukan hanya berdasarkan tampilan kalender.

## 5.7 Pengiriman Booking

Setelah formulir valid dan kendaraan tersedia:

1. Backend melakukan validasi ulang.
2. Sistem menghitung estimasi harga.
3. Sistem menghasilkan kode booking unik.
4. Sistem menyimpan data booking ke database.
5. Status awal booking adalah PENDING.
6. Sistem menampilkan halaman konfirmasi.
7. Pelanggan mendapatkan opsi menghubungi administrator melalui WhatsApp.

Format kode booking dapat menggunakan:

BK-YYYYMMDD-XXXX

Contoh:

BK-20261120-A001

Kode booking harus unik.

## 5.8 Integrasi WhatsApp

Integrasi menggunakan WhatsApp Click to Chat.

Tidak membutuhkan WhatsApp Business API.

Ketika pelanggan menekan tombol WhatsApp, sistem membuka WhatsApp dengan pesan yang telah diisi otomatis.

Contoh pesan:

Halo, saya ingin menanyakan booking rental mobil.

Kode Booking: BK-20261120-A001  
Nama: Delano  
Mobil: Toyota Avanza  
Tanggal Mulai: 20 November 2026  
Tanggal Selesai: 23 November 2026  
Durasi: 3 hari  
Layanan: Tanpa Sopir  
Estimasi Biaya: Rp900.000

Mohon informasi dan konfirmasi ketersediaan. Terima kasih.

Nomor WhatsApp tujuan harus berasal dari konfigurasi bisnis, bukan di-hardcode di berbagai komponen.

## 5.9 Halaman Konfirmasi Booking

Route: `/booking/sukses/[bookingCode]`

Menampilkan:

- Kode booking.
- Informasi kendaraan.
- Informasi pelanggan.
- Tanggal penyewaan.
- Durasi.
- Jenis layanan.
- Estimasi biaya.
- Status PENDING.
- Informasi bahwa booking belum dikonfirmasi.
- Tombol WhatsApp untuk menghubungi admin.

Pelanggan harus diberi penjelasan bahwa pengiriman formulir tidak otomatis menjamin kendaraan berhasil dipesan.

---

# 6. Admin Dashboard

Route utama: `/admin`

Seluruh route admin selain halaman login wajib dilindungi autentikasi.

## 6.1 Admin Login

Route: `/admin/login`

Form:

- Username atau email.
- Password.
- Tombol login.

Ketentuan:

- Password disimpan dalam bentuk hash.
- Session harus dikelola secara aman.
- Route dashboard tidak boleh diakses tanpa autentikasi.
- Sediakan fungsi logout.
- Jangan menyediakan registrasi admin publik.

## 6.2 Dashboard Overview

Route: `/admin`

Menampilkan informasi ringkasan:

**Statistik kendaraan:**

- Total kendaraan.
- Kendaraan tersedia.
- Kendaraan sedang disewa.
- Kendaraan maintenance.

**Statistik booking:**

- Total booking.
- Booking pending.
- Booking confirmed.
- Booking in progress.
- Booking completed.

**Informasi tambahan:**

- Booking terbaru.
- Jadwal penyewaan terdekat.
- Aktivitas booking terbaru.

Dashboard tidak harus memiliki grafik kompleks pada tahap MVP.

## 6.3 Manajemen Kendaraan

Route: `/admin/mobil`

Fitur:

- Melihat seluruh kendaraan.
- Menambahkan kendaraan.
- Mengedit informasi kendaraan.
- Menghapus kendaraan jika belum memiliki riwayat transaksi.
- Mengatur harga sewa.
- Mengubah status kendaraan.
- Mengelola foto kendaraan.

Data yang dapat dikelola:

- Nama kendaraan.
- Merek.
- Slug.
- Deskripsi.
- Tipe kendaraan.
- Kapasitas.
- Transmisi.
- Harga harian.
- Foto.
- Status.

Status kendaraan:

| Status      | Keterangan       |
| ----------- | ---------------- |
| AVAILABLE   | Siap disewakan   |
| RENTED      | Sedang disewa    |
| MAINTENANCE | Dalam perawatan  |
| INACTIVE    | Tidak ditawarkan |

Status RENTED sebaiknya diturunkan dari jadwal booking aktif, bukan diubah secara manual tanpa sinkronisasi.

Data kendaraan yang sudah memiliki riwayat booking sebaiknya menggunakan soft delete atau status INACTIVE.

## 6.4 Manajemen Booking

Route: `/admin/booking`

Menampilkan seluruh booking pelanggan dalam bentuk tabel.

Kolom:

- Kode booking.
- Nama pelanggan.
- Nomor WhatsApp.
- Kendaraan.
- Tanggal mulai.
- Tanggal selesai.
- Jenis layanan.
- Estimasi biaya.
- Status.
- Tanggal booking.
- Aksi.

Fitur:

- Melihat daftar booking.
- Melihat detail booking.
- Mencari berdasarkan kode booking atau nama pelanggan.
- Filter berdasarkan status.
- Filter berdasarkan tanggal.
- Menghubungi pelanggan melalui WhatsApp.
- Mengonfirmasi booking.
- Menolak booking.
- Membatalkan booking.
- Mengubah status penyewaan.

### Detail Booking

Menampilkan seluruh informasi pelanggan dan penyewaan.

Administrator dapat:

- Mengonfirmasi booking.
- Menolak booking.
- Mengubah harga final sebelum konfirmasi.
- Mengisi catatan internal.
- Mengubah status penyewaan.

### Alur Perubahan Status

PENDING:

- CONFIRMED.
- REJECTED.
- CANCELLED.

CONFIRMED:

- IN_PROGRESS.
- CANCELLED.

IN_PROGRESS:

- COMPLETED.

REJECTED, CANCELLED, dan COMPLETED merupakan status akhir.

Sistem tidak boleh mengizinkan perubahan status yang tidak sesuai alur tanpa mekanisme koreksi khusus.

Ketika administrator mengonfirmasi booking:

1. Sistem memeriksa kembali ketersediaan mobil.
2. Sistem memastikan tidak ada bentrokan jadwal.
3. Sistem menyimpan harga final.
4. Sistem memperbarui status menjadi CONFIRMED.
5. Sistem memperbarui informasi jadwal kendaraan.

## 6.5 Kalender Penyewaan

Route: `/admin/kalender`

Menampilkan jadwal penyewaan setiap kendaraan.

Fitur:

- Tampilan kalender bulanan.
- Filter kendaraan.
- Melihat jadwal booking.
- Menampilkan tanggal mulai dan selesai.
- Membedakan status booking.
- Menampilkan periode maintenance.

Kalender digunakan untuk membantu administrator mengetahui jadwal kendaraan dan menghindari bentrokan penyewaan.

## 6.6 Pengaturan Bisnis

Route: `/admin/pengaturan`

Administrator dapat mengubah:

- Nama bisnis.
- Logo.
- Nomor WhatsApp.
- Alamat rental.
- Deskripsi bisnis.
- Jam operasional.
- Informasi kontak.

Informasi ini harus bersumber dari database atau konfigurasi yang dapat diubah administrator.

---

# 7. Business Rules

Aturan bisnis utama:

**BR-01: Guest Booking**

Pelanggan tidak diwajibkan memiliki akun.

**BR-02: Admin Authentication**

Hanya administrator yang memiliki akses ke dashboard pengelolaan.

**BR-03: Harga Kendaraan**

Harga awal seluruh kendaraan adalah Rp300.000 per hari dan dapat diubah administrator.

**BR-04: Rental Harian**

Penyewaan menggunakan satuan hari kalender. Durasi minimum adalah satu hari.

**BR-05: Jenis Layanan**

Pelanggan dapat memilih dengan sopir atau tanpa sopir.

**BR-06: Booking Request**

Setiap booking yang dibuat pelanggan memiliki status awal PENDING.

**BR-07: Manual Approval**

Booking hanya dianggap berhasil setelah disetujui administrator.

**BR-08: Availability**

Sistem harus memeriksa ketersediaan sebelum booking dibuat dan sebelum booking dikonfirmasi.

**BR-09: No Double Booking**

Dua booking yang sudah dikonfirmasi tidak boleh menggunakan kendaraan yang sama dalam rentang waktu yang bertabrakan.

**BR-10: Manual Payment**

MVP tidak menyediakan pembayaran online. Proses pembayaran dilakukan di luar sistem dan dikonfirmasi secara manual.

**BR-11: Price Snapshot**

Harga pada booking harus disimpan sebagai nilai historis agar perubahan harga kendaraan tidak mengubah booking sebelumnya.

**BR-12: Booking History**

Booking yang sudah dibuat tidak boleh dihapus secara permanen melalui dashboard operasional.

**BR-13: Maintenance**

Kendaraan dengan status MAINTENANCE tidak dapat dikonfirmasi untuk periode yang bertabrakan dengan periode perawatan.

**BR-14: Booking Expiration**

Booking PENDING tidak mengunci kendaraan secara permanen. Administrator dapat menolak atau mengelola permintaan yang belum dikonfirmasi.

---

# 8. Database Design

Database menggunakan PostgreSQL.

ORM: Prisma.

Tabel utama:

## 8.1 Admins

| Field         | Type      | Description      |
| ------------- | --------- | ---------------- |
| id            | UUID      | Primary key      |
| name          | VARCHAR   | Nama admin       |
| email         | VARCHAR   | Email login      |
| password_hash | TEXT      | Password hash    |
| created_at    | TIMESTAMP | Waktu dibuat     |
| updated_at    | TIMESTAMP | Waktu diperbarui |

## 8.2 Cars

| Field         | Type      | Description      |
| ------------- | --------- | ---------------- |
| id            | UUID      | Primary key      |
| name          | VARCHAR   | Nama kendaraan   |
| slug          | VARCHAR   | URL identifier   |
| brand         | VARCHAR   | Merek            |
| category      | VARCHAR   | Kategori         |
| description   | TEXT      | Deskripsi        |
| capacity      | INTEGER   | Kapasitas        |
| transmission  | VARCHAR   | Transmisi        |
| price_per_day | DECIMAL   | Harga per hari   |
| status        | ENUM      | Status kendaraan |
| created_at    | TIMESTAMP | Waktu dibuat     |
| updated_at    | TIMESTAMP | Waktu diperbarui |

## 8.3 CarImages

| Field      | Type      | Description   |
| ---------- | --------- | ------------- |
| id         | UUID      | Primary key   |
| car_id     | UUID      | Foreign key   |
| image_url  | TEXT      | URL gambar    |
| is_primary | BOOLEAN   | Foto utama    |
| sort_order | INTEGER   | Urutan gambar |
| created_at | TIMESTAMP | Waktu dibuat  |

## 8.4 Bookings

| Field           | Type      | Description              |
| --------------- | --------- | ------------------------ |
| id              | UUID      | Primary key              |
| booking_code    | VARCHAR   | Kode booking unik        |
| car_id          | UUID      | Foreign key              |
| customer_name   | VARCHAR   | Nama pelanggan           |
| customer_phone  | VARCHAR   | Nomor WhatsApp           |
| start_date      | DATE      | Tanggal mulai            |
| end_date        | DATE      | Tanggal selesai          |
| duration_days   | INTEGER   | Durasi                   |
| rental_type     | ENUM      | WITH_DRIVER / SELF_DRIVE |
| pickup_location | TEXT      | Lokasi penjemputan       |
| notes           | TEXT      | Catatan pelanggan        |
| price_per_day   | DECIMAL   | Snapshot harga harian    |
| additional_fee  | DECIMAL   | Biaya tambahan           |
| total_price     | DECIMAL   | Estimasi/final total     |
| status          | ENUM      | Status booking           |
| admin_notes     | TEXT      | Catatan internal         |
| created_at      | TIMESTAMP | Waktu dibuat             |
| updated_at      | TIMESTAMP | Waktu diperbarui         |

## 8.5 BusinessSettings

| Field           | Type      | Description      |
| --------------- | --------- | ---------------- |
| id              | UUID      | Primary key      |
| business_name   | VARCHAR   | Nama bisnis      |
| logo_url        | TEXT      | Logo             |
| whatsapp_number | VARCHAR   | Nomor WhatsApp   |
| address         | TEXT      | Alamat           |
| description     | TEXT      | Deskripsi bisnis |
| operating_hours | TEXT      | Jam operasional  |
| updated_at      | TIMESTAMP | Waktu diperbarui |

Catatan implementasi:

- Gunakan foreign key untuk relasi data.
- Gunakan Decimal untuk nominal uang.
- Gunakan enum untuk status.
- Terapkan unique constraint pada booking_code dan slug.
- Booking harus mempertahankan snapshot harga.
- Hindari penghapusan permanen data booking.
- Simpan waktu pembuatan dan pembaruan data.
- Operasi konfirmasi booking harus menggunakan transaksi database dan pemeriksaan bentrokan yang aman terhadap request bersamaan.

---

# 9. Technology Stack

Stack yang direkomendasikan:

## Frontend

- Next.js App Router.
- React.
- TypeScript.
- Tailwind CSS.
- shadcn/ui.
- Lucide Icons.

## Backend

- Next.js Route Handlers.
- Server-side validation.
- Prisma ORM.

## Database

- PostgreSQL.
- Neon PostgreSQL.

## Authentication

- Auth.js atau solusi session authentication yang sesuai.
- Password hashing menggunakan Argon2id atau bcrypt.
- Session cookie HttpOnly, Secure, dan SameSite.
- Proteksi seluruh endpoint admin.

## Image Storage

- Cloudinary atau layanan object storage.
- Simpan URL gambar pada database.

## Deployment

- Vercel untuk aplikasi.
- Neon untuk database.
- Domain khusus untuk website.

Tidak perlu membuat backend terpisah pada tahap MVP. Next.js dapat menangani frontend, API, dan proses server-side dalam satu aplikasi.

---

# 10. Non-Functional Requirements

## 10.1 Performance

- Halaman utama harus dimuat dengan cepat.
- Optimasi gambar menggunakan Next.js Image.
- Gunakan pagination untuk daftar booking jika diperlukan.
- Hindari query database yang tidak efisien.

## 10.2 Security

- Semua halaman admin harus dilindungi autentikasi.
- Password tidak boleh disimpan dalam bentuk plaintext.
- Validasi seluruh input pada backend.
- Terapkan rate limiting pada endpoint login dan booking.
- Cegah SQL injection melalui Prisma.
- Lindungi endpoint admin dari akses tanpa izin.
- Jangan mengekspos credential database pada frontend.
- Validasi file upload dan batas ukuran gambar.
- Hindari menyimpan data pelanggan yang tidak diperlukan.

## 10.3 Responsive Design

Website harus mendukung:

- Desktop.
- Laptop.
- Tablet.
- Smartphone.

Customer website harus mengutamakan pengalaman mobile karena sebagian besar calon pelanggan kemungkinan mengakses melalui smartphone dan WhatsApp.

Admin dashboard harus tetap dapat digunakan pada tablet dan smartphone.

## 10.4 Reliability

- Booking harus tersimpan secara konsisten.
- Sistem harus mencegah double booking.
- Perubahan status harus tervalidasi.
- Kesalahan backend harus menghasilkan pesan yang jelas.
- Kegagalan membuka WhatsApp tidak boleh menghapus data booking yang sudah tersimpan.

---

# 11. UI/UX Design Guidelines

## 11.1 Design Direction

Gunakan pendekatan visual modern, profesional, dan ramah.

Inspirasi utama adalah poster promosi rental mobil yang menggunakan kombinasi warna biru tua, kuning, dan putih.

Namun, tampilan website tidak perlu meniru poster secara langsung.

Gunakan desain yang lebih modern dengan ruang kosong cukup, tipografi jelas, dan navigasi sederhana.

## 11.2 Color Palette

| Warna               | Penggunaan         |
| ------------------- | ------------------ |
| Navy Blue (#071B49) | Primary            |
| Blue (#155EEF)      | Secondary          |
| Yellow (#FFD21F)    | Accent             |
| White (#FFFFFF)     | Background         |
| Gray (#F5F7FA)      | Section background |
| Dark (#111827)      | Text               |

## 11.3 UI Guidelines

- Gunakan card untuk katalog kendaraan.
- Foto kendaraan harus menjadi elemen visual utama.
- Harga sewa harus mudah ditemukan.
- CTA booking harus terlihat jelas.
- Gunakan badge untuk status kendaraan.
- Form booking harus sederhana.
- Gunakan dialog konfirmasi untuk tindakan penting admin.
- Gunakan toast untuk notifikasi keberhasilan dan kegagalan.
- Hindari terlalu banyak animasi.
- Pastikan kontras teks memadai.

---

# 12. Sitemap

## Customer Website

/

- Beranda
- /mobil
- /mobil/[slug]
- /booking
- /booking/sukses/[bookingCode]
- /tentang
- /kontak

## Admin Dashboard

/admin/login

- /admin
- /admin/mobil
- /admin/mobil/tambah
- /admin/mobil/[id]
- /admin/booking
- /admin/booking/[id]
- /admin/kalender
- /admin/pengaturan

---

# 13. Acceptance Criteria

MVP dianggap memenuhi kebutuhan apabila:

## Customer

- [ ] Pengunjung dapat mengakses website tanpa login.
- [ ] Pengunjung dapat melihat empat kendaraan.
- [ ] Pengunjung dapat melihat detail kendaraan.
- [ ] Harga awal kendaraan tampil Rp300.000 per hari.
- [ ] Pengunjung dapat memilih layanan dengan atau tanpa sopir.
- [ ] Pengunjung dapat memilih tanggal sewa.
- [ ] Sistem menghitung estimasi biaya secara otomatis.
- [ ] Sistem memvalidasi ketersediaan kendaraan.
- [ ] Pengunjung dapat mengirim booking.
- [ ] Booking tersimpan dengan status PENDING.
- [ ] Pengunjung memperoleh kode booking.
- [ ] Pengunjung dapat menghubungi admin melalui WhatsApp.

## Administrator

- [ ] Admin dapat login dan logout.
- [ ] Admin dapat melihat ringkasan dashboard.
- [ ] Admin dapat menambah kendaraan.
- [ ] Admin dapat mengubah informasi kendaraan.
- [ ] Admin dapat mengubah harga sewa.
- [ ] Admin dapat mengubah status kendaraan.
- [ ] Admin dapat melihat semua booking.
- [ ] Admin dapat melihat detail booking.
- [ ] Admin dapat menerima atau menolak booking.
- [ ] Admin dapat mengubah status penyewaan.
- [ ] Admin dapat melihat kalender penyewaan.
- [ ] Sistem mencegah konfirmasi booking yang bertabrakan.
- [ ] Admin dapat mengubah informasi bisnis.

## System

- [ ] Semua data tersimpan pada PostgreSQL.
- [ ] Validasi penting dilakukan di backend.
- [ ] Endpoint admin terlindungi.
- [ ] Harga booking tersimpan sebagai snapshot.
- [ ] Sistem tidak mengizinkan double booking.
- [ ] Website responsif pada perangkat mobile dan desktop.

---

# 14. Development Roadmap

Pengembangan dibagi menjadi beberapa fase.

## Phase 1 – Project Foundation

- Inisialisasi Next.js.
- Konfigurasi TypeScript.
- Setup Tailwind CSS dan shadcn/ui.
- Setup Prisma.
- Setup PostgreSQL.
- Membuat schema database.
- Seed empat kendaraan awal.
- Konfigurasi environment variables.

## Phase 2 – Customer Website

- Membuat landing page.
- Membuat katalog kendaraan.
- Membuat detail kendaraan.
- Membuat booking form.
- Membuat kalkulasi harga.
- Membuat pemeriksaan ketersediaan.
- Membuat halaman konfirmasi booking.
- Integrasi WhatsApp.

## Phase 3 – Admin Dashboard

- Membuat autentikasi admin.
- Membuat dashboard overview.
- Membuat CRUD kendaraan.
- Membuat manajemen harga.
- Membuat manajemen booking.
- Membuat perubahan status booking.
- Membuat kalender penyewaan.
- Membuat pengaturan bisnis.

## Phase 4 – Testing & Deployment

- Pengujian alur booking.
- Pengujian validasi form.
- Pengujian ketersediaan kendaraan.
- Pengujian double booking.
- Pengujian autentikasi.
- Pengujian responsive design.
- Pengujian keamanan dasar.
- Deployment ke Vercel.
- Setup database production.
- Verifikasi seluruh fitur pada production.

---

# 15. Future Development

Setelah MVP berjalan dan mendapatkan masukan pengguna, pengembangan berikutnya dapat mencakup:

1. Payment gateway dan QRIS.
2. Sistem pembayaran DP.
3. Pengelolaan bukti pembayaran.
4. Notifikasi WhatsApp otomatis.
5. Riwayat pelanggan.
6. Laporan pendapatan.
7. Laporan performa kendaraan.
8. Sistem promo.
9. Pengelolaan biaya tambahan.
10. Pengelolaan dokumen persyaratan rental.

Fitur tersebut tidak boleh menghambat penyelesaian MVP.

---

# 16. Kesimpulan

Website Rental Mobil Kupang merupakan sistem informasi penyewaan kendaraan berbasis web yang berfokus pada katalog kendaraan, pengajuan booking, dan pengelolaan operasional rental.

Sistem menggunakan pendekatan guest booking sehingga pelanggan tidak perlu membuat akun. Administrator menjadi satu-satunya pengguna yang membutuhkan autentikasi.

Proses pembayaran tetap dilakukan secara manual di luar sistem, sedangkan konfirmasi booking dilakukan langsung oleh administrator.

Dengan empat kendaraan awal, sistem dirancang sederhana, mudah dikelola, responsif, dan dapat dikembangkan secara bertahap sesuai kebutuhan bisnis.

**Prioritas utama MVP:**

Katalog kendaraan → Booking Request → Pemeriksaan Ketersediaan → Konfirmasi Admin → Pengelolaan Penyewaan.
