import { InferSchemaType, HydratedDocument, Schema, model } from 'mongoose';

const analyticsSchema = new Schema(
  {
    urlId: {
      type: Schema.Types.ObjectId,
      ref: 'Url',
      required: true,
      index: true,
    },
    ipAddress: {
      type: String,
      required: true,
      trim: true,
    },
    userAgent: {
      type: String,
      required: true,
      trim: true,
    },
    referrer: {
      type: String,
      default: null,
      trim: true,
    },
    browser: {
      type: String,
      default: 'Unknown',
    },
    os: {
      type: String,
      default: 'Unknown',
    },
    device: {
      type: String,
      default: 'Unknown',
    },
    country: {
      type: String,
      default: 'Unknown',
    },
    city: {
      type: String,
      default: 'Unknown',
    },
    clickedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  { versionKey: false },
);

analyticsSchema.index({
  urlId: 1,
  clickedAt: -1,
});

export type AnalyticsSchema = InferSchemaType<typeof analyticsSchema>;
export type AnalyticsDocument = HydratedDocument<AnalyticsSchema>;
export const AnalyticsModel = model<AnalyticsSchema>('Analytics', analyticsSchema, 'analytics');
