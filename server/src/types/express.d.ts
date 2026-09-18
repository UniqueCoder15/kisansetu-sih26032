import { UserRole } from "../models/User.js";

export interface JwtPayloadUser {
  userId: string;
  phone: string;
  role: UserRole;
  name: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayloadUser;
    }
  }
}
