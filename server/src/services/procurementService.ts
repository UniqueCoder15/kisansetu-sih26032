import { Procurement, IProcurement } from "../models/Procurement.js";
import { QualityCheck, QualityGrade, IQualityCheck } from "../models/QualityCheck.js";
import { QueueBooking, BookingQueueStatus } from "../models/QueueBooking.js";
import { ProcurementCentre } from "../models/ProcurementCentre.js";
import { Payment, PaymentStatus } from "../models/Payment.js";
import { Types } from "mongoose";
import { emitQueueStatusUpdate } from "./socketService.js";
import { createNotification } from "./notificationService.js";
import { logAuditAction } from "./auditService.js";

export interface LogWeighingInput {
  bookingId: string;
  grossWeightKg: number;
  tareWeightKg: number;
  actorId?: string;
  actorRole?: string;
}

export interface LogQualityInput {
  bookingId: string;
  moisturePercentage: number;
  grade: QualityGrade;
  remarks?: string;
  inspectorId: string;
  actorRole?: string;
}

export class ProcurementService {
  static async logWeighing(input: LogWeighingInput): Promise<any> {
    const booking = await QueueBooking.findById(input.bookingId);
    if (!booking) {
      const err = new Error("Queue booking not found") as any;
      err.statusCode = 404;
      throw err;
    }

    const netWeightKg = Math.max(0, input.grossWeightKg - input.tareWeightKg);
    const netQuintals = Math.round((netWeightKg / 100) * 100) / 100 || booking.quantityQuintals;

    booking.status = BookingQueueStatus.WEIGHING;
    await booking.save();

    const mandiId = booking.procurementCentreId.toString();
    const farmerId = booking.farmerId.toString();

    // Socket Emit & Notification
    emitQueueStatusUpdate(mandiId, {
      tokenId: booking._id.toString(),
      tokenNumber: booking.tokenNumber,
      status: BookingQueueStatus.WEIGHING,
      farmerId,
    });

    await createNotification(
      farmerId,
      "WEIGHING_COMPLETED",
      "Weighing Scale Logged / वजन दर्ज हुआ",
      `Gross Weight: ${input.grossWeightKg}kg, Tare Weight: ${input.tareWeightKg}kg. Net Crop Quintals: ${netQuintals} Qtl.`,
      { bookingId: booking._id, netQuintals }
    );

    await logAuditAction(
      input.actorId,
      input.actorRole || "OPERATOR",
      "LOG_WEIGHING",
      "QueueBooking",
      booking._id,
      { grossWeightKg: input.grossWeightKg, tareWeightKg: input.tareWeightKg, netQuintals }
    );

    return {
      booking,
      grossWeightKg: input.grossWeightKg,
      tareWeightKg: input.tareWeightKg,
      netWeightKg,
      netQuintals,
    };
  }

  static async logQualityAndCreateReceipt(input: LogQualityInput): Promise<{
    procurement: IProcurement;
    qualityCheck: IQualityCheck;
    payment: any;
  }> {
    const booking = await QueueBooking.findById(input.bookingId);
    if (!booking) {
      const err = new Error("Queue booking not found") as any;
      err.statusCode = 404;
      throw err;
    }

    const mspRates: Record<string, number> = {
      "Wheat": 2320,
      "Wheat (PBW 550)": 2320,
      "Wheat (PBW-725)": 2320,
      "Wheat (HD 2967)": 2320,
      "Paddy": 2300,
      "Paddy (PR-126)": 2300,
      "Paddy (Basmati 1121)": 4000,
      "Mustard": 5650,
      "Mustard (Pusa Bold)": 5650,
      "Maize": 2090,
    };

    const ratePerQuintal = mspRates[booking.cropType] || 2320;
    const totalAmount = Math.round(booking.quantityQuintals * ratePerQuintal);

    // Create Procurement record
    const procurement = await Procurement.create({
      bookingId: booking._id,
      farmerId: booking.farmerId,
      centreId: booking.procurementCentreId,
      crop: booking.cropType,
      quantity: booking.quantityQuintals,
      ratePerQuintal,
      totalAmount,
      procurementDate: new Date(),
      status: input.grade === QualityGrade.REJECTED ? "REJECTED" : "COMPLETED",
    });

    // Create QualityCheck record
    const qualityCheck = await QualityCheck.create({
      procurementId: procurement._id,
      grade: input.grade,
      moisturePercentage: input.moisturePercentage,
      qualityStatus: input.grade === QualityGrade.REJECTED ? "REJECTED" : "PASSED",
      remarks: input.remarks || "Standard inspection verified",
      checkedBy: new Types.ObjectId(input.inspectorId),
      checkedAt: new Date(),
    });

    // Update QueueBooking status
    if (input.grade === QualityGrade.REJECTED) {
      booking.status = BookingQueueStatus.CANCELLED;
    } else {
      booking.status = BookingQueueStatus.COMPLETED;
    }
    await booking.save();

    // Create Payment record
    const payment = await Payment.create({
      procurementId: procurement._id,
      farmerId: booking.farmerId,
      amount: totalAmount,
      method: "DBT_AADHAAR",
      status: PaymentStatus.PENDING,
      transactionReference: `SBIN-DBT-${Date.now().toString().slice(-8)}`,
    });

    const mandiId = booking.procurementCentreId.toString();
    const farmerId = booking.farmerId.toString();

    // Socket Emit & Notification
    emitQueueStatusUpdate(mandiId, {
      tokenId: booking._id.toString(),
      tokenNumber: booking.tokenNumber,
      status: booking.status,
      farmerId,
    });

    await createNotification(
      farmerId,
      "PROCUREMENT_RECEIPT",
      "Procurement Completed & J-Form Issued",
      `Crop Grade: ${input.grade}, Moisture: ${input.moisturePercentage}%. Total MSP Payable: ₹${totalAmount.toLocaleString("en-IN")}.`,
      { procurementId: procurement._id, amount: totalAmount, grade: input.grade }
    );

    await logAuditAction(
      input.inspectorId,
      input.actorRole || "OPERATOR",
      "QUALITY_INSPECTION_COMPLETED",
      "Procurement",
      procurement._id,
      { grade: input.grade, moisturePercentage: input.moisturePercentage, totalAmount }
    );

    return { procurement, qualityCheck, payment };
  }

  static async getFarmerProcurements(farmerId: string): Promise<IProcurement[]> {
    return await Procurement.find({ farmerId })
      .populate("centreId")
      .sort({ createdAt: -1 });
  }

  static async getProcurementById(id: string): Promise<any> {
    const procurement = await Procurement.findById(id)
      .populate("centreId")
      .populate("farmerId");
    if (!procurement) {
      const err = new Error("Procurement slip not found") as any;
      err.statusCode = 404;
      throw err;
    }

    const qualityCheck = await QualityCheck.findOne({ procurementId: procurement._id });
    const payment = await Payment.findOne({ procurementId: procurement._id });

    return {
      procurement,
      qualityCheck,
      payment,
    };
  }
}
