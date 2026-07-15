import { Types } from "mongoose";

export interface CachedUrlDocument {
  id: string;
  _id: Types.ObjectId;

  originalUrl: string;
  shortCode: string;
  isActive: boolean;
  expiresAt: Date | null;
}