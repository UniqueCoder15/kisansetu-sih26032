import { FarmerProfile, IFarmerProfile } from "../models/FarmerProfile.js";
import { User } from "../models/User.js";

export class FarmerService {
  static async getFarmerProfile(userId: string): Promise<any> {
    const profile = await FarmerProfile.findOne({ userId }).populate("procurementCentreId");
    if (!profile) {
      const user = await User.findById(userId);
      if (!user) {
        const err = new Error("Farmer user not found") as any;
        err.statusCode = 404;
        throw err;
      }
      return {
        userId: user._id,
        farmerName: user.name,
        phone: user.phone,
        district: user.district || "Karnal",
        village: "Gharaunda",
        cropType: "Wheat (PBW 550)",
        expectedQuantity: 50,
        vehicleNumber: "HR-05-AA-1234",
      };
    }
    return profile;
  }

  static async updateFarmerProfile(userId: string, updateData: Partial<IFarmerProfile>): Promise<any> {
    let profile = await FarmerProfile.findOne({ userId });
    if (!profile) {
      const user = await User.findById(userId);
      if (!user) {
        const err = new Error("Farmer user not found") as any;
        err.statusCode = 404;
        throw err;
      }
      profile = await FarmerProfile.create({
        userId: user._id,
        farmerName: updateData.farmerName || user.name,
        phone: user.phone,
        district: updateData.district || user.district || "Karnal",
        village: updateData.village || "Gharaunda",
        procurementCentreId: updateData.procurementCentreId,
        cropType: updateData.cropType || "Wheat (PBW 550)",
        expectedQuantity: updateData.expectedQuantity || 50,
        vehicleNumber: updateData.vehicleNumber || "HR-05-AA-1234",
      });
    } else {
      Object.assign(profile, updateData);
      await profile.save();
    }
    return profile;
  }
}
