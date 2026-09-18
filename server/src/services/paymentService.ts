import { Payment, IPayment, PaymentStatus } from "../models/Payment.js";
import { Procurement } from "../models/Procurement.js";
import { createNotification } from "./notificationService.js";
import { logAuditAction } from "./auditService.js";

export class PaymentService {
  static async getFarmerPayments(farmerId: string): Promise<IPayment[]> {
    return await Payment.find({ farmerId })
      .populate("procurementId")
      .sort({ createdAt: -1 });
  }

  static async disbursePayment(paymentId: string, actorId?: string, actorRole?: string): Promise<IPayment> {
    const payment = await Payment.findById(paymentId);
    if (!payment) {
      const err = new Error("Payment record not found") as any;
      err.statusCode = 404;
      throw err;
    }

    payment.status = PaymentStatus.PAID;
    payment.paidAt = new Date();
    if (!payment.transactionReference) {
      payment.transactionReference = `SBIN-DBT-${Date.now().toString().slice(-8)}`;
    }
    await payment.save();

    const farmerId = payment.farmerId.toString();

    // Notification
    await createNotification(
      farmerId,
      "PAYMENT_DISBURSED",
      "DBT Payment Credited / राशि खाते में जमा",
      `Direct Benefit Transfer (DBT) of ₹${payment.amount.toLocaleString("en-IN")} credited to your Aadhaar-linked bank account. UTR Ref: ${payment.transactionReference}.`,
      { paymentId: payment._id, amount: payment.amount, utr: payment.transactionReference }
    );

    // Audit Log
    await logAuditAction(
      actorId,
      actorRole || "ADMIN",
      "DISBURSE_DBT_PAYMENT",
      "Payment",
      payment._id,
      { amount: payment.amount, utr: payment.transactionReference }
    );

    return payment;
  }
}
