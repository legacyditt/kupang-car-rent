# 0001 — Intake Booking PENDING Sebelum WhatsApp dan Sumber Ketersediaan Unit

- **Status**: accepted

Saat pelanggan mengirim form booking di landing page (atau admin mencatat pesanan walk-in/telepon lewat Tambah Booking), sistem mencatat booking berstatus `PENDING` ke shared store terlebih dahulu sebelum mengarahkan pelanggan ke WhatsApp admin (dengan nomor WhatsApp pelanggan wajib diisi di form). Tanggal ketersediaan Unit di kalender landing page maupun pengecekan bentrok `BR-09` diturunkan hanya dari booking berstatus `CONFIRMED` dan `IN_PROGRESS`.

## Considered Options

- **WhatsApp-only di landing page (tanpa simpan `PENDING`)**: lebih sederhana di frontend, tetapi memaksa admin mencatat ulang semua permintaan secara manual dan menghilangkan antrean permintaan masuk.
- **Kunci tanggal sejak `PENDING`**: berisiko membuat Unit diblokir oleh permintaan yang belum disepakati atau pelanggan yang batal mengirim pesan WhatsApp.

## Consequences

- Form landing page wajib menyertakan input nomor WhatsApp pelanggan agar tombol `CHAT WA` di menu admin dapat langsung digunakan tanpa menunggu balasan.
- Dua pelanggan dapat mengajukan tanggal yang sama selama keduanya masih `PENDING`; konflik diselesaikan saat admin menekan Konfirmasi (`BR-09`).
- Selama status masih `PENDING` atau `CONFIRMED`, admin dapat mengubah Unit, tanggal, layanan, atau harga final dengan validasi `BR-09` ulang saat `CONFIRMED`.

