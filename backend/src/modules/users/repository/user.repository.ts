import { UserModel, UserSchema, UserDocument } from '../model/user.model';

export class UserRepository {
  async create(
    data: Pick<UserSchema, 'name' | 'email'> &
      Partial<Pick<UserSchema, 'passwordHash' | 'googleId' | 'role'>>,
  ): Promise<UserDocument> {
    return UserModel.create(data);
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return UserModel.findOne({ email });
  }

  async findByEmailWithPassword(email: string): Promise<UserDocument | null> {
    return UserModel.findOne({ email }).select('+passwordHash');
  }

  async findById(id: string): Promise<UserDocument | null> {
    return UserModel.findById(id);
  }

  async updateGoogleId(userId: string, googleId: string) {
    return UserModel.findByIdAndUpdate(
      userId,
      {
        $set: {
          googleId,
        },
      },
      {
        new: true,
      },
    );
  }

  async findProfileById(id: string): Promise<UserDocument | null> {
    return UserModel.findById(id).select('-passwordHash');
  }

  async updateLastLogin(id: string): Promise<UserDocument | null> {
    return UserModel.findByIdAndUpdate(
      id,
      {
        lastLogin: new Date(),
      },
      {
        returnDocument: 'after',
      },
    );
  }

  // -----------------------------
  // Email verification
  // -----------------------------

  async updateVerificationOtp(
    id: string,
    verificationOtp: string,
    verificationOtpExpiresAt: Date,
  ): Promise<UserDocument | null> {
    return UserModel.findByIdAndUpdate(
      id,
      {
        verificationOtp,
        verificationOtpExpiresAt,
      },
      {
        returnDocument: 'after',
      },
    );
  }

  async findByVerificationOtp(email: string): Promise<UserDocument | null> {
    return UserModel.findOne({
      email,
      isVerified: false,
    }).select('+verificationOtp +verificationOtpExpiresAt');
  }

  async verifyUser(id: string): Promise<UserDocument | null> {
    return UserModel.findByIdAndUpdate(
      id,
      {
        isVerified: true,
        verificationOtp: null,
        verificationOtpExpiresAt: null,
      },
      {
        returnDocument: 'after',
      },
    );
  }

  // -----------------------------
  // Password reset
  // -----------------------------

  async updatePasswordResetOtp(
    id: string,
    passwordResetOtp: string,
    passwordResetOtpExpiresAt: Date,
  ): Promise<UserDocument | null> {
    return UserModel.findByIdAndUpdate(
      id,
      {
        passwordResetOtp,
        passwordResetOtpExpiresAt,
      },
      {
        returnDocument: 'after',
      },
    );
  }

  async findByPasswordResetOtp(email: string) {
    return UserModel.findOne({
      email,
    }).select('+passwordResetOtp +passwordResetOtpExpiresAt');
  }

  async updatePassword(id: string, passwordHash: string): Promise<UserDocument | null> {
    return UserModel.findByIdAndUpdate(
      id,
      {
        passwordHash,
      },
      {
        returnDocument: 'after',
      },
    );
  }

  async clearPasswordResetOtp(userId: string): Promise<void> {
    await UserModel.updateOne(
      { _id: userId },
      {
        $set: {
          passwordResetOtp: null,
          passwordResetOtpExpiresAt: null,
        },
      },
    );
  }
}

export const userRepository = new UserRepository();
