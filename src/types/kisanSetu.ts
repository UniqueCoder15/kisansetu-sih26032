export type QueueStatus =
  | "WAITING"
  | "CALLED"
  | "ARRIVED"
  | "WEIGHING"
  | "QUALITY_CHECK"
  | "PROCUREMENT_COMPLETED"
  | "PAYMENT_PENDING"
  | "COMPLETED"
  | "CANCELLED";

export interface StatusConfig {
  labelEn: string;
  labelHi: string;
  bgColor: string;
  fgColor: string;
  borderColor: string;
  iconName: string;
  descriptionEn: string;
  descriptionHi: string;
}

export interface FarmerBooking {
  tokenNumber: string;
  farmerName: string;
  farmerNameHi: string;
  farmerPhone: string;
  centreName: string;
  centreNameHi: string;
  district: string;
  cropType: string;
  cropTypeHi: string;
  estimatedQuantityQuintals: number;
  bookingDate: string;
  slotTime: string;
  queuePosition: number;
  peopleAhead: number;
  estimatedWaitMinutes: number;
  currentStatus: QueueStatus;
  nextActionEn: string;
  nextActionHi: string;
  vehicleNo: string;
  grossWeightKg?: number;
  tareWeightKg?: number;
  netWeightQuintals?: number;
  moisturePercentage?: number;
  qualityGrade?: "GRADE_A" | "GRADE_B" | "REJECTED";
  mspRatePerQuintal?: number;
  totalPaymentAmount?: number;
  paymentTransactionRef?: string;
}

export interface MandiCentre {
  id: string;
  name: string;
  nameHi: string;
  district: string;
  distanceKm: number;
  activeCounters: number;
  status: "NORMAL" | "BUSY" | "HEAVY_CONGESTION";
  availableSlotsCount: number;
}

export interface SlotAvailability {
  id: string;
  timeWindow: string;
  availableSlots: number;
  totalCapacity: number;
  expectedWaitMin: number;
  crowdLevel: "Low" | "Moderate" | "High";
}
