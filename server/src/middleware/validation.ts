import { Request, Response, NextFunction } from "express";
import { z, ZodSchema } from "zod";

export const validate = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const messages = result.error.issues
        .map((e) => `${e.path.join(".")}: ${e.message}`)
        .join("; ");
      res.status(400).json({
        status: "error",
        message: `Validation failed: ${messages}`,
      });
      return;
    }
    req.body = result.data;
    next();
  };
};

// Common Zod validation schemas
export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().regex(/^[0-9]{10}$/, "Phone number must be a valid 10-digit number"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["FARMER", "OPERATOR", "ADMIN"]).default("FARMER"),
  district: z.string().optional(),
  state: z.string().optional(),
  preferredLanguage: z.string().optional(),
  village: z.string().optional(),
  cropType: z.string().optional(),
  expectedQuantity: z.number().optional(),
  vehicleNumber: z.string().optional(),
});

export const loginSchema = z.object({
  phone: z.string().min(1, "Phone number is required"),
  password: z.string().min(1, "Password is required"),
});

export const farmerProfileUpdateSchema = z.object({
  farmerName: z.string().optional(),
  district: z.string().optional(),
  village: z.string().optional(),
  procurementCentreId: z.string().optional(),
  cropType: z.string().optional(),
  expectedQuantity: z.number().min(0, "Quantity must be non-negative").optional(),
  vehicleNumber: z.string().optional(),
  preferredLanguage: z.string().optional(),
});

export const queueBookingSchema = z.object({
  procurementCentreId: z.string().min(1, "Procurement centre ID is required"),
  cropType: z.string().min(1, "Crop type is required"),
  quantityQuintals: z.number().positive("Quantity in quintals must be positive"),
  vehicleNumber: z.string().min(1, "Vehicle number is required"),
  bookingDate: z.string().min(1, "Booking date is required"),
  scheduledSlot: z.string().min(1, "Scheduled slot is required"),
});

export const queueStatusUpdateSchema = z.object({
  status: z.enum([
    "WAITING",
    "CALLED",
    "ARRIVED",
    "WEIGHING",
    "QUALITY_CHECK",
    "PAYMENT_PENDING",
    "COMPLETED",
    "CANCELLED",
    "NO_SHOW",
  ]),
});
