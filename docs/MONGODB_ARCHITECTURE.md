# KisanSetu — MongoDB Schema & Database Architecture

---

## 1. Schema Design Rationale: Embedded vs Reference

In accordance with MongoDB best practices for high-concurrency queue platforms:

- **Reference Design**: Used for high-growth, independently queried entities (e.g., `bookings` referencing `farmers` and `procurementCentres`, `queueTokens` referencing `bookings`). This prevents document size explosion and optimizes search performance.
- **Embedded Design**: Used for static, tightly-coupled sub-structures (e.g., `address` inside `procurementCentres`, `bankDetails` inside `farmers`, `weightLog` inside `procurements`). This reduces `$lookup` join overhead during frequent queue reads.

---

## 2. Collection Schemas Specification

### 1. `users` Collection
Stores system credentials and authentication roles.

```json
{
  "_id": "ObjectId",
  "mobileNumber": "String (Unique, Indexed)",
  "role": "Enum ['FARMER', 'OPERATOR', 'ADMIN']",
  "passwordHash": "String (Optional for Farmers using OTP)",
  "languagePreference": "Enum ['hi', 'en']",
  "isActive": "Boolean",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### 2. `farmers` Collection
Stores farmer identity, agricultural land details, and bank credentials for MSP payments.

```json
{
  "_id": "ObjectId",
  "userId": "ObjectId (Ref: users)",
  "fullName": "String",
  "fatherName": "String",
  "state": "String",
  "district": "String",
  "block": "String",
  "pincode": "String",
  "aadhaarHash": "String (Encrypted/Hashed)",
  "kisanId": "String (Government Agri ID)",
  "bankDetails": {
    "accountHolderName": "String",
    "accountNumber": "String (Masked)",
    "ifscCode": "String",
    "bankName": "String"
  },
  "landHoldings": [
    {
      "surveyNumber": "String",
      "areaInAcres": "Number",
      "primaryCrop": "String"
    }
  ],
  "createdAt": "Date"
}
```

### 3. `procurementCentres` Collection
Stores mandi/procurement centre location, capacity, and active counter configurations.

```json
{
  "_id": "ObjectId",
  "centreCode": "String (Unique, e.g. KNL-W-01)",
  "name": "String",
  "district": "String",
  "state": "String",
  "location": {
    "type": "Point",
    "coordinates": ["Number (Longitude)", "Number (Latitude)"]
  },
  "totalCounters": "Number",
  "activeCounters": {
    "gate": "Number",
    "weighing": "Number",
    "quality": "Number"
  },
  "dailyQuintalCapacity": "Number",
  "operatingHours": {
    "openTime": "String (e.g. 08:00)",
    "closeTime": "String (e.g. 18:00)"
  },
  "status": "Enum ['ACTIVE', 'CONGESTED', 'CLOSED']",
  "createdAt": "Date"
}
```

### 4. `slots` Collection
Defines date and time slot capacity allocations per procurement centre.

```json
{
  "_id": "ObjectId",
  "centreId": "ObjectId (Ref: procurementCentres)",
  "date": "Date (YYYY-MM-DD)",
  "timeWindow": "String (e.g. 09:00 - 11:00)",
  "maxQuintalCapacity": "Number",
  "bookedQuintalTotal": "Number",
  "maxFarmerCapacity": "Number",
  "bookedFarmerCount": "Number",
  "isLocked": "Boolean",
  "createdAt": "Date"
}
```

### 5. `bookings` Collection
Represents a farmer's slot reservation for a crop delivery.

```json
{
  "_id": "ObjectId",
  "bookingRef": "String (Unique, e.g. BSK-2026-9901)",
  "farmerId": "ObjectId (Ref: farmers)",
  "centreId": "ObjectId (Ref: procurementCentres)",
  "slotId": "ObjectId (Ref: slots)",
  "cropType": "Enum ['PADDY', 'WHEAT', 'MAIZE', 'PULSES', 'MUSTARD']",
  "estimatedQuintals": "Number",
  "vehicleType": "Enum ['TRACTOR', 'TRUCK', 'BULLOCK_CART', 'OTHER']",
  "vehicleRegistrationNumber": "String",
  "status": "Enum ['BOOKED', 'CHECKED_IN', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']",
  "bookingDate": "Date",
  "createdAt": "Date"
}
```

### 6. `queueTokens` Collection
Stores the live token state, position, and status transitions for mandi queue management.

```json
{
  "_id": "ObjectId",
  "tokenNumber": "String (e.g. #KNL-104)",
  "bookingId": "ObjectId (Ref: bookings)",
  "farmerId": "ObjectId (Ref: farmers)",
  "centreId": "ObjectId (Ref: procurementCentres)",
  "status": "Enum ['WAITING', 'CALLED', 'ARRIVED', 'WEIGHING', 'QUALITY_CHECK', 'PROCUREMENT_COMPLETED', 'PAYMENT_PENDING', 'COMPLETED', 'CANCELLED']",
  "counterAssigned": "Number",
  "calledAt": "Date",
  "arrivedAt": "Date",
  "completedAt": "Date",
  "sequenceNumber": "Number (FIFO Index)",
  "createdAt": "Date"
}
```

### 7. `procurements` Collection
Stores weighing scale measurements and net weight calculations.

```json
{
  "_id": "ObjectId",
  "tokenRef": "ObjectId (Ref: queueTokens)",
  "bookingId": "ObjectId (Ref: bookings)",
  "centreId": "ObjectId (Ref: procurementCentres)",
  "grossWeightKg": "Number",
  "tareWeightKg": "Number",
  "netWeightQuintals": "Number",
  "weighingOperatorId": "ObjectId (Ref: users)",
  "weighedAt": "Date"
}
```

### 8. `qualityChecks` Collection
Stores quality assessment parameters, moisture content, and crop grading results.

```json
{
  "_id": "ObjectId",
  "procurementId": "ObjectId (Ref: procurements)",
  "bookingId": "ObjectId (Ref: bookings)",
  "moisturePercentage": "Number",
  "foreignMatterPercentage": "Number",
  "gradeAssigned": "Enum ['GRADE_A', 'GRADE_B', 'REJECTED']",
  "mspPerQuintal": "Number",
  "calculatedTotalAmount": "Number",
  "inspectorId": "ObjectId (Ref: users)",
  "inspectedAt": "Date"
}
```

### 9. `payments` Collection
Tracks financial disbursement status for Minimum Support Price (MSP) payments via DBT.

```json
{
  "_id": "ObjectId",
  "paymentRef": "String (Unique, e.g. DBT-2026-4491)",
  "farmerId": "ObjectId (Ref: farmers)",
  "bookingId": "ObjectId (Ref: bookings)",
  "totalAmountRupees": "Number",
  "paymentStatus": "Enum ['PENDING', 'PROCESSING', 'SUCCESSFUL', 'FAILED']",
  "bankTransactionRef": "String (UTR Number)",
  "disbursedAt": "Date",
  "createdAt": "Date"
}
```

### 10. `notifications` Collection
Stores SMS and PWA push notification logs sent to farmers.

```json
{
  "_id": "ObjectId",
  "farmerId": "ObjectId (Ref: farmers)",
  "type": "Enum ['SLOT_CONFIRMED', 'QUEUE_CALL', 'WEIGHING_DONE', 'PAYMENT_CREDITED']",
  "title": "String",
  "message": "String (Hindi/English)",
  "isRead": "Boolean",
  "sentAt": "Date"
}
```

### 11. `auditLogs` Collection
Immutable compliance logs for operator actions and system overrides.

```json
{
  "_id": "ObjectId",
  "operatorId": "ObjectId (Ref: users)",
  "action": "String (e.g. QUALITY_OVERRIDE, MANUAL_WEIGHT_LOG)",
  "targetEntity": "String",
  "targetId": "ObjectId",
  "previousValue": "Object",
  "newValue": "Object",
  "timestamp": "Date"
}
```

---

## 3. Mandatory Indexes Strategy

High-performance indexes required for real-time queue queries:

| Collection | Index Field(s) | Index Type | Query Optimization Purpose |
|---|---|---|---|
| `users` | `{ mobileNumber: 1 }` | Unique Index | Fast OTP lookup during farmer login. |
| `procurementCentres` | `{ location: "2dsphere" }` | Geospatial | "Find Nearest Procurement Centres" spatial query. |
| `slots` | `{ centreId: 1, date: 1 }` | Compound Index | Rapid checking of date slot capacity. |
| `queueTokens` | `{ centreId: 1, status: 1, sequenceNumber: 1 }` | Compound Index | Live FIFO queue ordering and active counter queries. |
| `queueTokens` | `{ farmerId: 1, status: 1 }` | Compound Index | Instant display of farmer's active live token on mobile dashboard. |
| `payments` | `{ farmerId: 1, paymentStatus: 1 }` | Compound Index | Quick rendering of farmer payment history. |
