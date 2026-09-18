import { QueueBooking, IQueueBooking, BookingQueueStatus } from "../models/QueueBooking.js";
import { ProcurementCentre } from "../models/ProcurementCentre.js";

export interface BookQueueInput {
  farmerId: string;
  procurementCentreId: string;
  cropType: string;
  quantityQuintals: number;
  vehicleNumber: string;
  bookingDate: string;
  scheduledSlot: string;
}

export class QueueService {
  static async bookQueueToken(input: BookQueueInput): Promise<IQueueBooking> {
    const centre = await ProcurementCentre.findById(input.procurementCentreId);
    if (!centre) {
      const err = new Error("Procurement Centre not found") as any;
      err.statusCode = 404;
      throw err;
    }

    const bookingDateObj = new Date(input.bookingDate);

    // Calculate position based on existing active bookings for that centre and date
    const existingCount = await QueueBooking.countDocuments({
      procurementCentreId: input.procurementCentreId,
      bookingDate: {
        $gte: new Date(bookingDateObj.setHours(0, 0, 0, 0)),
        $lte: new Date(bookingDateObj.setHours(23, 59, 59, 999)),
      },
      status: { $nin: [BookingQueueStatus.CANCELLED, BookingQueueStatus.NO_SHOW] },
    });

    const queuePosition = existingCount + 1;
    const estimatedWaitMinutes = queuePosition * 12;

    const tokenNumber = `KS-${centre.centreCode || "CENTRE"}-${Date.now().toString().slice(-4)}-${queuePosition}`;

    const booking = await QueueBooking.create({
      tokenNumber,
      farmerId: input.farmerId,
      procurementCentreId: input.procurementCentreId,
      cropType: input.cropType,
      quantityQuintals: input.quantityQuintals,
      vehicleNumber: input.vehicleNumber,
      bookingDate: new Date(input.bookingDate),
      scheduledSlot: input.scheduledSlot,
      queuePosition,
      estimatedWaitMinutes,
      status: BookingQueueStatus.WAITING,
    });

    // Update centre load counters
    centre.currentLoadQuintals += input.quantityQuintals;
    centre.activeFarmers += 1;
    await centre.save();

    return booking;
  }

  static async getFarmerBookings(farmerId: string): Promise<IQueueBooking[]> {
    return await QueueBooking.find({ farmerId })
      .populate("procurementCentreId")
      .sort({ createdAt: -1 });
  }

  static async getBookingById(bookingId: string): Promise<IQueueBooking> {
    const booking = await QueueBooking.findById(bookingId).populate("procurementCentreId").populate("farmerId");
    if (!booking) {
      const err = new Error("Queue booking not found") as any;
      err.statusCode = 404;
      throw err;
    }
    return booking;
  }

  static async cancelBooking(bookingId: string, userId: string, userRole: string): Promise<IQueueBooking> {
    const booking = await QueueBooking.findById(bookingId);
    if (!booking) {
      const err = new Error("Queue booking not found") as any;
      err.statusCode = 404;
      throw err;
    }

    if (userRole !== "ADMIN" && userRole !== "OPERATOR" && booking.farmerId.toString() !== userId) {
      const err = new Error("Forbidden. You can only cancel your own bookings.") as any;
      err.statusCode = 403;
      throw err;
    }

    if (booking.status === BookingQueueStatus.CANCELLED) {
      return booking;
    }

    booking.status = BookingQueueStatus.CANCELLED;
    await booking.save();

    // Adjust centre active counters
    const centre = await ProcurementCentre.findById(booking.procurementCentreId);
    if (centre) {
      centre.activeFarmers = Math.max(0, centre.activeFarmers - 1);
      centre.currentLoadQuintals = Math.max(0, centre.currentLoadQuintals - booking.quantityQuintals);
      await centre.save();
    }

    return booking;
  }
}
