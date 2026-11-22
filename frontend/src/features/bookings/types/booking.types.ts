import type { RentalServiceType } from "@/features/cars/utils/booking";

export type PaymentScheme = "FULL" | "DP_50";
export type PaymentStatus = "UNPAID" | "DP_PAID" | "PAID";

export type BookingStatus =
  | "PENDING"
  | "CONFIRMED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "REJECTED"
  | "CANCELLED";

export interface BookingItem {
  id: string;
  bookingCode: string;
  customerName: string;
  customerPhone: string;
  carId: string;
  carName: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  totalDays: number;
  serviceType: RentalServiceType;
  estimatedPrice: number;
  finalPrice: number;
  paymentScheme?: PaymentScheme;
  paymentStatus?: PaymentStatus;
  paidAmount?: number;
  status: BookingStatus;
  internalNote: string;
  createdAt: string;
}

