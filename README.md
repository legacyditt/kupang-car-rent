# Kupang Car Rent (Website Rental Mobil Kupang)

Platform web untuk mempromosikan dan mengelola layanan penyewaan kendaraan harian di Kota Kupang, NTT (MVP).

## Tech Stack

- **Frontend:** React 19, TypeScript, Vite, TanStack Router, TanStack Query v5, Axios, Tailwind CSS, shadcn/ui, Lucide Icons, React Hook Form, Zod
- **Backend:** Node.js, TypeScript, Express.js, Zod, Prisma ORM
- **Database:** PostgreSQL (Neon)
- **Authentication:** Session-based HTTP-only Cookies (`argon2`)
- **Storage & Deployment:** Cloudinary, Vercel (Frontend), Railway/Render (Backend)

## Struktur Proyek

```text
rental-mobil/
├── backend/          # Express.js API (Layered SoC: routes -> controller -> service -> repository)
│   ├── prisma/       # Prisma schema & seed
│   ├── src/          # Source code backend
│   └── tests/        # Unit & integration tests
├── frontend/         # React + Vite SPA (Feature-sliced SoC)
│   └── src/          # App, routes, features, shared components, lib
└── prd.md            # Product Requirements Document
```

## Setup Awal

1. Salin file environment:
   - `backend/.env.example` → `backend/.env`
   - `frontend/.env.example` → `frontend/.env`
2. Isi kredensial Neon PostgreSQL, session secret, dan Cloudinary.
3. Install dependencies dan jalankan migrasi Prisma (Phase 1).
