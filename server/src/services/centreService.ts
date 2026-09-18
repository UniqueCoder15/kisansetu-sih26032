import { ProcurementCentre, IProcurementCentre } from "../models/ProcurementCentre.js";

export class CentreService {
  static async getAllCentres(district?: string): Promise<IProcurementCentre[]> {
    const query: any = {};
    if (district) {
      query.district = new RegExp(district, "i");
    }
    return await ProcurementCentre.find(query).sort({ name: 1 });
  }

  static async getCentreById(id: string): Promise<IProcurementCentre> {
    const centre = await ProcurementCentre.findById(id);
    if (!centre) {
      const err = new Error("Procurement Centre not found") as any;
      err.statusCode = 404;
      throw err;
    }
    return centre;
  }
}
