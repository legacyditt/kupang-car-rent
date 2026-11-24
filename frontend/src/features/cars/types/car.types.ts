export type CarStatus = "AVAILABLE" | "RENTED" | "MAINTENANCE" | "INACTIVE";
export type CarTransmission = "MATIC" | "MANUAL" | "BOTH";

export interface CarItem {
  id: string;
  slug: string;
  name: string;
  brand?: string;
  transmission?: CarTransmission;
  imageUrl: string;
  capacityLabel: string;
  pricePerDay: number;
  status: CarStatus;
  bookedDates?: string[];
}
