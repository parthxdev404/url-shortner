import {
  InferSchemaType,
  HydratedDocument,
  Schema,
  model,
} from "mongoose";

const urlSchema = new Schema(
  {
    originalUrl: {
      type: String,
      required: true,
      trim: true,
    },

    shortCode: {
      type: String,
      required: true,
      trim: true,
    },

    clicks: {
      type: Number,
      default: 0,
      min: 0,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    expiresAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

urlSchema.index({ shortCode: 1 }, { unique: true });

urlSchema.index(
  { expiresAt: 1 },
  { expireAfterSeconds: 0 }
);

export type UrlSchema = InferSchemaType<typeof urlSchema>;

export type UrlDocument = HydratedDocument<UrlSchema>;

export const UrlModel = model<UrlSchema>('Url', urlSchema, 'urls');