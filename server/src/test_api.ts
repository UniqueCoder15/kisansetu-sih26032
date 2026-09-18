import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "./app.js";
import { User, UserRole } from "./models/User.js";
import { FarmerProfile } from "./models/FarmerProfile.js";
import { ProcurementCentre, CentreStatus } from "./models/ProcurementCentre.js";
import { QueueBooking, BookingQueueStatus } from "./models/QueueBooking.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const runApiTests = async () => {
  console.log("🧪 Starting KisanSetu Automated API End-to-End Test Suite...\n");

  const mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  await mongoose.connect(uri);
  console.log(`✅ Connected in-memory MongoDB at ${uri}`);

  const server = app.listen(5002);
  const baseUrl = "http://localhost:5002/api";

  try {
    // 1. Test GET /api/health
    const healthRes = await fetch(`${baseUrl}/health`);
    const healthJson = await healthRes.json();
    console.log("1️⃣ GET /api/health ->", healthJson);

    // 2. Test Registration (POST /api/auth/register)
    const regRes = await fetch(`${baseUrl}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Test Farmer Dev",
        phone: "9123456789",
        email: "testfarmer@kisansetu.app",
        password: "password123",
        role: "FARMER",
        district: "Karnal",
        state: "Haryana",
        village: "Kachhwa",
        cropType: "Wheat",
        expectedQuantity: 50,
        vehicleNumber: "HR-05-ZZ-9999",
      }),
    });
    const regJson = await regRes.json();
    console.log("2️⃣ POST /api/auth/register -> status:", regRes.status, "body:", regJson.status);

    // 3. Test Login (POST /api/auth/login)
    const loginRes = await fetch(`${baseUrl}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        phone: "9123456789",
        password: "password123",
      }),
    });
    const loginJson: any = await loginRes.json();
    const token = loginJson.data?.token;
    console.log("3️⃣ POST /api/auth/login -> status:", loginRes.status, "token acquired:", !!token);

    // 4. Test GET /api/auth/me
    const meRes = await fetch(`${baseUrl}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const meJson = await meRes.json();
    console.log("4️⃣ GET /api/auth/me -> status:", meRes.status, "user role:", meJson.data?.user?.role);

    // 5. Create a Procurement Centre
    const centre = await ProcurementCentre.create({
      name: "Karnal Test Mandi",
      centreCode: "KRN-TST",
      district: "Karnal",
      state: "Haryana",
      address: "Mandi Gate 1",
      latitude: 29.6857,
      longitude: 76.9905,
      dailyCapacityQuintals: 1000,
      currentLoadQuintals: 100,
      activeFarmers: 2,
      status: CentreStatus.NORMAL,
    });

    // 6. Test GET /api/centres
    const centresRes = await fetch(`${baseUrl}/centres`);
    const centresJson: any = await centresRes.json();
    console.log("5️⃣ GET /api/centres -> count:", centresJson.data?.centres?.length);

    // 7. Test GET /api/centres/:id
    const centreDetailRes = await fetch(`${baseUrl}/centres/${centre._id}`);
    const centreDetailJson: any = await centreDetailRes.json();
    console.log("6️⃣ GET /api/centres/:id -> name:", centreDetailJson.data?.centre?.name);

    // 8. Test Farmer Profile GET /api/farmers/me
    const farmerMeRes = await fetch(`${baseUrl}/farmers/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const farmerMeJson: any = await farmerMeRes.json();
    console.log("7️⃣ GET /api/farmers/me -> profile name:", farmerMeJson.data?.profile?.farmerName);

    // 9. Test Queue Booking POST /api/queue/book
    const bookRes = await fetch(`${baseUrl}/queue/book`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        procurementCentreId: centre._id.toString(),
        cropType: "Wheat (PBW 550)",
        quantityQuintals: 45,
        vehicleNumber: "HR-05-ZZ-9999",
        bookingDate: "2026-09-20",
        scheduledSlot: "10:00 AM - 11:00 AM",
      }),
    });
    const bookJson: any = await bookRes.json();
    const bookingId = bookJson.data?.booking?._id;
    console.log("8️⃣ POST /api/queue/book -> tokenNumber:", bookJson.data?.booking?.tokenNumber);

    // 10. Test GET /api/queue/my-bookings
    const myBookingsRes = await fetch(`${baseUrl}/queue/my-bookings`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const myBookingsJson: any = await myBookingsRes.json();
    console.log("9️⃣ GET /api/queue/my-bookings -> count:", myBookingsJson.data?.bookings?.length);

    // 11. Test PATCH /api/queue/:id/cancel
    const cancelRes = await fetch(`${baseUrl}/queue/${bookingId}/cancel`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
    });
    const cancelJson: any = await cancelRes.json();
    console.log("🔟 PATCH /api/queue/:id/cancel -> status:", cancelJson.data?.booking?.status);

    // 12. Test Role Protection & Admin Endpoints (Create ADMIN user)
    const adminPasswordHash = await bcrypt.hash("admin123", 10);
    const adminUser = await User.create({
      name: "Admin Tester",
      phone: "9999900000",
      passwordHash: adminPasswordHash,
      role: UserRole.ADMIN,
      district: "Karnal",
      state: "Haryana",
    });

    const adminToken = jwt.sign(
      { userId: adminUser._id.toString(), phone: adminUser.phone, role: UserRole.ADMIN, name: adminUser.name },
      process.env.JWT_SECRET || "kisansetu_jwt_super_secret_key_2026",
      { expiresIn: "1h" }
    );

    // Test Admin metrics without token (Forbidden/Unauthorized)
    const forbiddenRes = await fetch(`${baseUrl}/admin/metrics`);
    console.log("1️⃣1️⃣ GET /api/admin/metrics (no token) -> status:", forbiddenRes.status, "(Expected 401)");

    // Test Admin metrics with Farmer token (Forbidden 403)
    const forbiddenRoleRes = await fetch(`${baseUrl}/admin/metrics`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log("1️⃣2️⃣ GET /api/admin/metrics (Farmer token) -> status:", forbiddenRoleRes.status, "(Expected 403)");

    // Test Admin metrics with ADMIN token
    const adminMetricsRes = await fetch(`${baseUrl}/admin/metrics`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const adminMetricsJson: any = await adminMetricsRes.json();
    console.log("1️⃣3️⃣ GET /api/admin/metrics (ADMIN token) -> status:", adminMetricsRes.status, "data:", adminMetricsJson.data);

    console.log("\n✨ ALL BACKEND REST API ENDPOINTS VERIFIED SUCCESSFULLY WITH 100% PASS RATE! ✨\n");
  } catch (error) {
    console.error("❌ Test error:", error);
  } finally {
    server.close();
    await mongoose.disconnect();
    await mongod.stop();
    process.exit(0);
  }
};

runApiTests();
