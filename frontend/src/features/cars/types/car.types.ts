export type CarStatus = "AVAILABLE" | "RENTED" | "MAINTENANCE" | "INACTIVE";

export type CarCategory = "MPV" | "City Car" | "Double Cabin";

export interface CarItem {
  id: string;
  slug: string;
  name: string;
  brand: string;
  category: CarCategory;
  imageUrl: string;
  capacityLabel: string;
  transmissionLabel: string;
  pricePerDay: number;
  status: CarStatus;
}

