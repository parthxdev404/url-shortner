import { InferSchemaType, model, Schema } from 'mongoose';

export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    passwordHash: {
      type: String,
      required: true,
      select: false,
    },

    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.USER,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    lastLogin: {
      type: Date,
      default: null,
    },

    // ─────────────────────────────────────
    // Email verification
    // ─────────────────────────────────────

    verificationOtp: {
      type: String,
      default: null,
      select: false,
    },

    verificationOtpExpiresAt: {
      type: Date,
      default: null,
      select: false,
    },

    // ─────────────────────────────────────
    // Password reset
    // ─────────────────────────────────────

    passwordResetOtp: {
      type: String,
      default: null,
      select: false,
    },

    passwordResetOtpExpiresAt: {
      type: Date,
      default: null,
      select: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

userSchema.index({
  email: 1,
  role: 1,
});

export type UserSchema = InferSchemaType<typeof userSchema>;

export const UserModel = model<UserSchema>('User', userSchema, 'users');

export type UserDocument = ReturnType<typeof UserModel.hydrate>;
