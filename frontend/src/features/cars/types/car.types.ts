export type CarStatus = "AVAILABLE" | "RENTED" | "MAINTENANCE" | "INACTIVE";
export type CarTransmission = "MATIC" | "MANUAL" | "BOTH";

export interface CarUnitItem {
  id: string;
  carId: string;
  label: string;
  plateNumber: string;
  transmission: "MATIC" | "MANUAL";
  status: CarStatus;
}

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
  bookedDatesByTransmission?: {
    MATIC: string[];
    MANUAL: string[];
  };
  units?: CarUnitItem[];
}
