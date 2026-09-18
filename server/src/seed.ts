import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { connectDB, closeDB } from "./config/db.js";
import { User, UserRole } from "./models/User.js";
import { FarmerProfile } from "./models/FarmerProfile.js";
import { ProcurementCentre, CentreStatus } from "./models/ProcurementCentre.js";
import { QueueBooking, BookingQueueStatus } from "./models/QueueBooking.js";
import { Procurement } from "./models/Procurement.js";
import { QualityCheck, QualityGrade } from "./models/QualityCheck.js";
import { Payment, PaymentStatus } from "./models/Payment.js";
import { Notification } from "./models/Notification.js";
import { AuditLog } from "./models/AuditLog.js";

const seedDatabase = async () => {
  console.log("🌱 Starting KisanSetu Development Data Seeding...");

  // Support in-memory DB fallback if local mongod service is not running
  let isConnected = await connectDB();
  let memServer: any = null;

  if (!isConnected) {
    console.log("⚡ Launching in-memory MongoDB instance for seeding...");
    const { MongoMemoryServer } = await import("mongodb-memory-server");
    memServer = await MongoMemoryServer.create();
    const mongoUri = memServer.getUri();
    await mongoose.connect(mongoUri);
    console.log(`✅ Connected to in-memory MongoDB: ${mongoUri}`);
  }

  try {
    // Clear existing collections
    await User.deleteMany({});
    await FarmerProfile.deleteMany({});
    await ProcurementCentre.deleteMany({});
    await QueueBooking.deleteMany({});
    await Procurement.deleteMany({});
    await QualityCheck.deleteMany({});
    await Payment.deleteMany({});
    await Notification.deleteMany({});
    await AuditLog.deleteMany({});

    console.log("🧹 Existing database collections cleared.");

    // Hash passwords (DEVELOPMENT ONLY DEFAULT CREDENTIALS)
    const adminPasswordHash = await bcrypt.hash("admin123", 10);
    const operatorPasswordHash = await bcrypt.hash("operator123", 10);
    const farmerPasswordHash = await bcrypt.hash("farmer123", 10);

    // 1. Create ADMIN User
    const adminUser = await User.create({
      name: "Rajesh Sharma (Admin)",
      phone: "9999999999",
      email: "admin@kisansetu.gov.in",
      passwordHash: adminPasswordHash,
      role: UserRole.ADMIN,
      district: "Karnal",
      state: "Haryana",
      preferredLanguage: "hi",
      isVerified: true,
      isActive: true,
    });
    console.log("👤 Created 1 ADMIN user (Phone: 9999999999 / Pass: admin123)");

    // 2. Create 2 OPERATOR Users
    const operator1 = await User.create({
      name: "Ramesh Kumar (Gate Operator)",
      phone: "8888888881",
      email: "ramesh.operator@kisansetu.gov.in",
      passwordHash: operatorPasswordHash,
      role: UserRole.OPERATOR,
      district: "Karnal",
      state: "Haryana",
      preferredLanguage: "hi",
      isVerified: true,
      isActive: true,
    });

    const operator2 = await User.create({
      name: "Suresh Sharma (Weighbridge Manager)",
      phone: "8888888882",
      email: "suresh.operator@kisansetu.gov.in",
      passwordHash: operatorPasswordHash,
      role: UserRole.OPERATOR,
      district: "Karnal",
      state: "Haryana",
      preferredLanguage: "hi",
      isVerified: true,
      isActive: true,
    });
    console.log("👷 Created 2 OPERATOR users (Phones: 8888888881, 8888888882 / Pass: operator123)");

    // 3. Create 4 PROCUREMENT CENTRES
    const centres = await ProcurementCentre.create([
      {
        name: "Karnal Main Grain Procurement Hub",
        centreCode: "KRN-01",
        district: "Karnal",
        state: "Haryana",
        address: "GT Road, Near Anaj Mandi, Karnal, Haryana 132001",
        latitude: 29.6857,
        longitude: 76.9905,
        dailyCapacityQuintals: 1500,
        currentLoadQuintals: 420,
        activeFarmers: 14,
        status: CentreStatus.NORMAL,
        operatingStartTime: "08:00 AM",
        operatingEndTime: "06:00 PM",
      },
      {
        name: "Gharaunda Procurement Centre",
        centreCode: "GHR-02",
        district: "Karnal",
        state: "Haryana",
        address: "Mandi Road, Gharaunda, District Karnal, Haryana 132114",
        latitude: 29.5381,
        longitude: 76.9731,
        dailyCapacityQuintals: 1000,
        currentLoadQuintals: 680,
        activeFarmers: 22,
        status: CentreStatus.BUSY,
        operatingStartTime: "08:00 AM",
        operatingEndTime: "06:00 PM",
      },
      {
        name: "Assandh Sub-Mandi Procurement Yard",
        centreCode: "ASD-03",
        district: "Karnal",
        state: "Haryana",
        address: "Jind Road, Assandh, Karnal, Haryana 132039",
        latitude: 29.5217,
        longitude: 76.6025,
        dailyCapacityQuintals: 800,
        currentLoadQuintals: 210,
        activeFarmers: 8,
        status: CentreStatus.NORMAL,
        operatingStartTime: "08:30 AM",
        operatingEndTime: "05:30 PM",
      },
      {
        name: "Taraori Wheat Procurement Depot",
        centreCode: "TRR-04",
        district: "Karnal",
        state: "Haryana",
        address: "Station Road, Taraori, Karnal, Haryana 132116",
        latitude: 29.8028,
        longitude: 76.9317,
        dailyCapacityQuintals: 1200,
        currentLoadQuintals: 1100,
        activeFarmers: 35,
        status: CentreStatus.HEAVY_CONGESTION,
        operatingStartTime: "08:00 AM",
        operatingEndTime: "07:00 PM",
      },
    ]);
    console.log("🏢 Created 4 Procurement Centres (Karnal, Gharaunda, Assandh, Taraori)");

    // 4. Create 5 FARMER Users & Profiles
    const farmerData = [
      { name: "Rajinder Singh", phone: "9876543210", village: "Gharaunda", crop: "Wheat (PBW 550)", qty: 65, veh: "HR-05-AA-1234" },
      { name: "Gurpreet Kaur", phone: "9876543211", village: "Kachhwa", crop: "Mustard (Pusa Bold)", qty: 40, veh: "HR-05-AB-5678" },
      { name: "Vikramjeet Malik", phone: "9876543212", village: "Nilokheri", crop: "Paddy (Basmati 1121)", qty: 120, veh: "HR-05-AC-9012" },
      { name: "Sanjeev Tyagi", phone: "9876543213", village: "Taraori", crop: "Wheat (HD 2967)", qty: 85, veh: "HR-05-AD-3456" },
      { name: "Harpreet Singh", phone: "9876543214", village: "Assandh", crop: "Wheat (PBW 550)", qty: 90, veh: "HR-05-AE-7890" },
    ];

    const farmerUsers: any[] = [];
    for (const f of farmerData) {
      const user = await User.create({
        name: f.name,
        phone: f.phone,
        email: `${f.phone}@kisansetu.app`,
        passwordHash: farmerPasswordHash,
        role: UserRole.FARMER,
        district: "Karnal",
        state: "Haryana",
        preferredLanguage: "hi",
        isVerified: true,
        isActive: true,
      });

      const profile = await FarmerProfile.create({
        userId: user._id,
        farmerName: f.name,
        phone: f.phone,
        district: "Karnal",
        village: f.village,
        procurementCentreId: centres[0]._id,
        cropType: f.crop,
        expectedQuantity: f.qty,
        vehicleNumber: f.veh,
      });

      farmerUsers.push({ user, profile });
    }
    console.log("🌾 Created 5 FARMER users & profile records (Phones: 9876543210 - 9876543214 / Pass: farmer123)");

    // 5. Create Realistic Queue Bookings
    const today = new Date();
    const queueBookings = await QueueBooking.create([
      {
        tokenNumber: "KS-KRN-001-A",
        farmerId: farmerUsers[0].user._id,
        procurementCentreId: centres[0]._id,
        cropType: "Wheat (PBW 550)",
        quantityQuintals: 65,
        vehicleNumber: "HR-05-AA-1234",
        bookingDate: today,
        scheduledSlot: "09:00 AM - 10:00 AM",
        queuePosition: 1,
        estimatedWaitMinutes: 10,
        status: BookingQueueStatus.WEIGHING,
      },
      {
        tokenNumber: "KS-GHR-002-B",
        farmerId: farmerUsers[1].user._id,
        procurementCentreId: centres[1]._id,
        cropType: "Mustard (Pusa Bold)",
        quantityQuintals: 40,
        vehicleNumber: "HR-05-AB-5678",
        bookingDate: today,
        scheduledSlot: "10:00 AM - 11:00 AM",
        queuePosition: 3,
        estimatedWaitMinutes: 25,
        status: BookingQueueStatus.WAITING,
      },
      {
        tokenNumber: "KS-ASD-003-C",
        farmerId: farmerUsers[2].user._id,
        procurementCentreId: centres[2]._id,
        cropType: "Paddy (Basmati 1121)",
        quantityQuintals: 120,
        vehicleNumber: "HR-05-AC-9012",
        bookingDate: today,
        scheduledSlot: "11:00 AM - 12:00 PM",
        queuePosition: 2,
        estimatedWaitMinutes: 15,
        status: BookingQueueStatus.QUALITY_CHECK,
      },
      {
        tokenNumber: "KS-TRR-004-D",
        farmerId: farmerUsers[3].user._id,
        procurementCentreId: centres[3]._id,
        cropType: "Wheat (HD 2967)",
        quantityQuintals: 85,
        vehicleNumber: "HR-05-AD-3456",
        bookingDate: today,
        scheduledSlot: "01:00 PM - 02:00 PM",
        queuePosition: 8,
        estimatedWaitMinutes: 75,
        status: BookingQueueStatus.WAITING,
      },
      {
        tokenNumber: "KS-KRN-005-E",
        farmerId: farmerUsers[4].user._id,
        procurementCentreId: centres[0]._id,
        cropType: "Wheat (PBW 550)",
        quantityQuintals: 90,
        vehicleNumber: "HR-05-AE-7890",
        bookingDate: today,
        scheduledSlot: "02:00 PM - 03:00 PM",
        queuePosition: 4,
        estimatedWaitMinutes: 40,
        status: BookingQueueStatus.COMPLETED,
      },
    ]);

    // 6. Create Seed Procurement, QualityCheck, and Payment Records for Completed Token
    const completedProcurement = await Procurement.create({
      bookingId: queueBookings[4]._id,
      farmerId: farmerUsers[0].user._id,
      centreId: centres[0]._id,
      crop: "Wheat (PBW 550)",
      quantity: 65,
      ratePerQuintal: 2320,
      totalAmount: 150800,
      procurementDate: today,
      status: "COMPLETED",
    });

    await QualityCheck.create({
      procurementId: completedProcurement._id,
      grade: QualityGrade.GRADE_A,
      moisturePercentage: 12.2,
      qualityStatus: "PASSED",
      remarks: "Grain moisture well within 14% limit. Approved Grade A.",
      checkedBy: operator1._id,
      checkedAt: today,
    });

    await Payment.create({
      procurementId: completedProcurement._id,
      farmerId: farmerUsers[0].user._id,
      amount: 150800,
      method: "DBT_AADHAAR",
      status: PaymentStatus.PENDING,
      transactionReference: "SBIN-DBT-2026-98124012",
    });

    // 7. Create Seed Notifications & Audit Logs
    await Notification.create([
      {
        userId: farmerUsers[0].user._id,
        type: "BOOKING_CONFIRMED",
        title: "Procurement Slot Confirmed / स्लॉट बुक हुआ",
        message: "Token #KS-KRN-001-A confirmed for today 09:00 AM at Karnal Main Grain Procurement Hub.",
        read: true,
      },
      {
        userId: farmerUsers[0].user._id,
        type: "TOKEN_CALLED",
        title: "Token Called / टोकन नंबर बुलाया गया",
        message: "Token #KS-KRN-001-A is called to Counter 2. Please proceed for gate verification.",
        read: false,
      },
    ]);

    await AuditLog.create([
      {
        actorId: adminUser._id,
        actorRole: "ADMIN",
        action: "SYSTEM_INITIALIZATION",
        entityType: "System",
        metadata: { info: "KisanSetu System initialized and seed data populated" },
      },
      {
        actorId: operator1._id,
        actorRole: "OPERATOR",
        action: "TOKEN_STATUS_UPDATE",
        entityType: "QueueBooking",
        entityId: queueBookings[0]._id,
        metadata: { tokenNumber: queueBookings[0].tokenNumber, newStatus: "WEIGHING" },
      },
    ]);

    console.log(`🎫 Created ${queueBookings.length} realistic queue token bookings.`);
    console.log("💰 Created initial Procurement, QualityCheck, and DBT Payment records.");
    console.log("🔔 Created initial Notifications and Audit Logs.");
    console.log("\n✅ KisanSetu Database Seeding Completed Successfully!");
    console.log("-------------------------------------------------------");
    console.log("DEVELOPMENT CREDENTIALS SUMMARY (FOR TESTING ONLY):");
    console.log("ADMIN    : Phone 9999999999 / Password admin123");
    console.log("OPERATOR : Phone 8888888881 / Password operator123");
    console.log("FARMER   : Phone 9876543210 / Password farmer123");
    console.log("-------------------------------------------------------\n");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
  } finally {
    if (memServer) {
      await mongoose.disconnect();
      await memServer.stop();
      console.log("🔒 Stopped in-memory MongoDB instance.");
    } else {
      await closeDB();
    }
    process.exit(0);
  }
};

seedDatabase();
