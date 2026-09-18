import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User, UserRole, IUser } from "../models/User.js";
import { FarmerProfile } from "../models/FarmerProfile.js";
import { env } from "../config/env.js";

export interface RegisterInput {
  name: string;
  phone: string;
  email?: string;
  password: string;
  role?: UserRole;
  district?: string;
  state?: string;
  preferredLanguage?: string;
  village?: string;
  cropType?: string;
  expectedQuantity?: number;
  vehicleNumber?: string;
}

export interface LoginInput {
  phone: string;
  password: string;
}

export interface AuthResult {
  user: any;
  token: string;
}

export class AuthService {
  static async register(input: RegisterInput): Promise<AuthResult> {
    const existingUser = await User.findOne({ phone: input.phone });
    if (existingUser) {
      const err = new Error("Phone number is already registered") as any;
      err.statusCode = 400;
      throw err;
    }

    const passwordHash = await bcrypt.hash(input.password, 10);

    const userRole = input.role || UserRole.FARMER;
    const user = await User.create({
      name: input.name,
      phone: input.phone,
      email: input.email || undefined,
      passwordHash,
      role: userRole,
      district: input.district || "Karnal",
      state: input.state || "Haryana",
      preferredLanguage: input.preferredLanguage || "hi",
      isVerified: true,
      isActive: true,
    });

    let farmerProfile = null;
    if (userRole === UserRole.FARMER) {
      farmerProfile = await FarmerProfile.create({
        userId: user._id,
        farmerName: user.name,
        phone: user.phone,
        district: user.district || "Karnal",
        village: input.village || "Gharaunda",
        cropType: input.cropType || "Wheat (PBW 550)",
        expectedQuantity: input.expectedQuantity || 50,
        vehicleNumber: input.vehicleNumber || "HR-05-AA-1234",
      });
    }

    const token = jwt.sign(
      {
        userId: user._id.toString(),
        phone: user.phone,
        role: user.role,
        name: user.name,
      },
      process.env.JWT_SECRET || env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    const userObj = user.toJSON();
    if (farmerProfile) {
      (userObj as any).farmerProfile = farmerProfile;
    }

    return { user: userObj, token };
  }

  static async login(input: LoginInput): Promise<AuthResult> {
    const user = await User.findOne({ phone: input.phone }).select("+passwordHash");

    if (!user || !user.passwordHash) {
      const err = new Error("Invalid phone number or password") as any;
      err.statusCode = 401;
      throw err;
    }

    const isMatch = await bcrypt.compare(input.password, user.passwordHash);
    if (!isMatch) {
      const err = new Error("Invalid phone number or password") as any;
      err.statusCode = 401;
      throw err;
    }

    const token = jwt.sign(
      {
        userId: user._id.toString(),
        phone: user.phone,
        role: user.role,
        name: user.name,
      },
      process.env.JWT_SECRET || env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    const userObj = user.toJSON();
    if (user.role === UserRole.FARMER) {
      const farmerProfile = await FarmerProfile.findOne({ userId: user._id });
      if (farmerProfile) {
        (userObj as any).farmerProfile = farmerProfile;
      }
    }

    return { user: userObj, token };
  }

  static async getMe(userId: string): Promise<any> {
    const user = await User.findById(userId);
    if (!user) {
      const err = new Error("User not found") as any;
      err.statusCode = 404;
      throw err;
    }

    const userObj = user.toJSON();
    if (user.role === UserRole.FARMER) {
      const farmerProfile = await FarmerProfile.findOne({ userId: user._id });
      if (farmerProfile) {
        (userObj as any).farmerProfile = farmerProfile;
      }
    }

    return userObj;
  }
}
