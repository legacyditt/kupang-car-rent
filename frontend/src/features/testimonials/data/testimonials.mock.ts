import type { TestimonialItem } from "../types/testimonial.types";

export const INITIAL_TESTIMONIALS: TestimonialItem[] = [
  {
    id: "tm-1",
    bookingCode: "BK-20261110-D004",
    customerName: "Sinta L.",
    carName: "Honda Brio",
    tripLabel: "Wisata Pantai Kupang",
    rating: 5,
    quote:
      "Unit bersih, wangi, dan proses serah terima di Bandara El Tari tepat waktu. Sangat membantu liburan keluarga kami.",
    status: "PUBLISHED",
    createdAt: "2026-11-15",
  },
  {
    id: "tm-2",
    customerName: "Yohanes M.",
    carName: "Toyota Innova Reborn",
    tripLabel: "Perjalanan Dinas Soe",
    rating: 5,
    quote:
      "Sopir sangat berpengalaman menguasai rute Timor. Kabin nyaman untuk perjalanan dinas 4 hari tanpa kendala.",
    status: "PUBLISHED",
    createdAt: "2026-11-12",
  },
  {
    id: "tm-3",
    customerName: "Clarissa W.",
    carName: "Toyota Avanza",
    tripLabel: "Lepas Kunci Kota Kupang",
    rating: 5,
    quote:
      "Admin responsif lewat WhatsApp, harga transparan sejak awal, dan kondisi mesin sangat prima.",
    status: "PUBLISHED",
    createdAt: "2026-11-08",
  },
  {
    id: "tm-4",
    customerName: "Andre P.",
    carName: "Toyota Hilux",
    tripLabel: "Kunjungan Lapangan",
    rating: 5,
    quote:
      "Pilihan tepat untuk medan berat di luar kota. Unit tangguh dan servis pengantaran cepat.",
    status: "PUBLISHED",
    createdAt: "2026-11-02",
  },
];

