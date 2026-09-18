import { Request, Response, NextFunction } from "express";
import { ProcurementCentre } from "../models/ProcurementCentre.js";
import { QueueBooking, BookingQueueStatus } from "../models/QueueBooking.js";
import { User, UserRole } from "../models/User.js";
import { emitTokenCalled, emitQueueStatusUpdate } from "../services/socketService.js";
import { createNotification } from "../services/notificationService.js";
import { logAuditAction } from "../services/auditService.js";

export const getAdminCentres = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const centres = await ProcurementCentre.find().sort({ district: 1, name: 1 });
    res.status(200).json({
      status: "success",
      data: { centres },
    });
  } catch (error) {
    next(error);
  }
};

export const getAdminQueue = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const centreId = req.query.centreId as string | undefined;
    const status = req.query.status as string | undefined;

    const query: any = {};
    if (centreId) query.procurementCentreId = centreId;
    if (status) query.status = status;

    const queue = await QueueBooking.find(query)
      .populate("procurementCentreId")
      .populate("farmerId", "name phone district")
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: "success",
      data: { queue },
    });
  } catch (error) {
    next(error);
  }
};

export const updateTokenStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { status } = req.body;
    const actorId = req.user?.userId;
    const actorRole = req.user?.role || "OPERATOR";

    const booking = await QueueBooking.findById(id);
    if (!booking) {
      const err = new Error("Queue booking not found") as any;
      err.statusCode = 404;
      throw err;
    }

    const previousStatus = booking.status;
    booking.status = status as BookingQueueStatus;
    await booking.save();

    const mandiId = booking.procurementCentreId.toString();
    const farmerId = booking.farmerId.toString();

    // 1. Socket.IO Real-time Events
    if (status === BookingQueueStatus.CALLED) {
      emitTokenCalled(mandiId, {
        tokenId: booking._id.toString(),
        tokenNumber: booking.tokenNumber,
        counterNum: "Counter 2",
        farmerId,
      });

      // Send SMS/Push Notification
      await createNotification(
        farmerId,
        "TOKEN_CALLED",
        "Token Called / टोकन नंबर बुलाया गया",
        `Token #${booking.tokenNumber} is called to Counter 2 at your procurement centre. Please proceed immediately.`,
        { bookingId: booking._id, tokenNumber: booking.tokenNumber }
      );
    } else {
      emitQueueStatusUpdate(mandiId, {
        tokenId: booking._id.toString(),
        tokenNumber: booking.tokenNumber,
        status: booking.status,
        farmerId,
      });

      await createNotification(
        farmerId,
        "STATUS_CHANGE",
        `Token Update: ${status}`,
        `Your procurement token #${booking.tokenNumber} status has changed to ${status}.`,
        { bookingId: booking._id, tokenNumber: booking.tokenNumber, status }
      );
    }

    // 2. Write Audit Log Entry
    await logAuditAction(
      actorId,
      actorRole,
      "TOKEN_STATUS_UPDATE",
      "QueueBooking",
      booking._id,
      { tokenNumber: booking.tokenNumber, previousStatus, newStatus: status }
    );

    res.status(200).json({
      status: "success",
      data: { booking },
    });
  } catch (error) {
    next(error);
  }
};

export const getAdminMetrics = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const totalCentres = await ProcurementCentre.countDocuments();
    const totalFarmers = await User.countDocuments({ role: UserRole.FARMER });
    const totalBookings = await QueueBooking.countDocuments();
    const activeQueueCount = await QueueBooking.countDocuments({
      status: {
        $in: [
          BookingQueueStatus.WAITING,
          BookingQueueStatus.CALLED,
          BookingQueueStatus.ARRIVED,
          BookingQueueStatus.WEIGHING,
          BookingQueueStatus.QUALITY_CHECK,
        ],
      },
    });

    const completedProcurements = await QueueBooking.countDocuments({
      status: BookingQueueStatus.COMPLETED,
    });

    const aggregateLoad = await ProcurementCentre.aggregate([
      {
        $group: {
          _id: null,
          totalCapacity: { $sum: "$dailyCapacityQuintals" },
          totalCurrentLoad: { $sum: "$currentLoadQuintals" },
        },
      },
    ]);

    const capacityData = aggregateLoad[0] || { totalCapacity: 0, totalCurrentLoad: 0 };

    res.status(200).json({
      status: "success",
      data: {
        totalCentres,
        totalFarmers,
        totalBookings,
        activeQueueCount,
        completedProcurements,
        totalCapacityQuintals: capacityData.totalCapacity,
        currentLoadQuintals: capacityData.totalCurrentLoad,
        capacityUtilizationPercentage:
          capacityData.totalCapacity > 0
            ? Math.round((capacityData.totalCurrentLoad / capacityData.totalCapacity) * 100)
            : 0,
      },
    });
  } catch (error) {
    next(error);
  }
};
