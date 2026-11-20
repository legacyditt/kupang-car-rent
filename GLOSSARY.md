# Rental Mobil Kupang

Domain penyewaan kendaraan dan pengelolaan jadwal booking antara pelanggan dan admin.

## Language

**Booking**:
Catatan permintaan hingga perjalanan sewa unit oleh pelanggan dengan siklus status `PENDING`, `CONFIRMED`, `IN_PROGRESS`, `COMPLETED`, `REJECTED`, atau `CANCELLED`.
_Avoid_: Order, Pesanan, Reservasi

**Unit**:
Mobil fisik yang tersedia untuk disewakan pada tanggal tertentu.
_Avoid_: Armada, Kendaraan

**Pelanggan**:
Pihak penyewa yang mengajukan atau memiliki booking.
_Avoid_: Customer, Klien, User

**Catatan Internal**:
Catatan khusus admin pada sebuah booking (seperti lokasi serah terima, sopir, atau status DP) yang tidak ditampilkan ke pelanggan.
_Avoid_: Catatan Pelanggan, Komentar

**Profil Bisnis**:
Identitas, nomor WhatsApp tujuan booking, alamat, jam operasional, dan logo rental yang ditampilkan kepada pelanggan maupun admin.
_Avoid_: Pengaturan Sistem, Konfigurasi App


