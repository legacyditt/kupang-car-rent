export type CarStatus = "AVAILABLE" | "RENTED" | "MAINTENANCE" | "INACTIVE";

export interface CarItem {
  id: string;
  slug: string;
  name: string;
  brand: string;
  imageUrl: string;
  capacityLabel: string;
  pricePerDay: number;
  status: CarStatus;
  bookedDates?: string[];
}
