import { UserModel, UserSchema, UserDocument } from '../model/user.model';

export class UserRepository {
  async create(
    data: Pick<UserSchema, 'name' | 'email' | 'passwordHash'> & Partial<Pick<UserSchema, 'role'>>,
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

  async updateVerificationToken(
    id: string,
    verificationToken: string,
    verificationTokenExpiresAt: Date,
  ): Promise<UserDocument | null> {
    return UserModel.findByIdAndUpdate(
      id,
      {
        verificationToken,
        verificationTokenExpiresAt,
      },
      {
        returnDocument: 'after',
      },
    );
  }

  async findByVerificationToken(verificationToken: string): Promise<UserDocument | null> {
    return UserModel.findOne({
      verificationToken,
    });
  }

  async verifyUser(id: string): Promise<UserDocument | null> {
    return UserModel.findByIdAndUpdate(
      id,
      {
        isVerified: true,
        verificationToken: null,
        verificationTokenExpiresAt: null,
      },
      {
        returnDocument: 'after',
      },
    );
  }

  async updatePasswordResetToken(
    id: string,
    passwordResetToken: string,
    passwordResetTokenExpiresAt: Date,
  ): Promise<UserDocument | null> {
    return UserModel.findByIdAndUpdate(
      id,
      {
        passwordResetToken,
        passwordResetTokenExpiresAt,
      },
      { returnDocument: 'after' },
    );
  }

  async findByPasswordResetToken(passwordResetToken: string): Promise<UserDocument | null> {
    return UserModel.findOne({ passwordResetToken });
  }

  async updatePassword(id: string, passwordHash: string): Promise<UserDocument | null> {
    return UserModel.findByIdAndUpdate(id, { passwordHash }, { returnDocument: 'after' });
  }

  async clearPasswordResetToken(id: string): Promise<UserDocument | null> {
    return UserModel.findByIdAndUpdate(
      id,
      {
        passwordResetToken: null,
        passwordResetTokenExpiresAt: null,
      },
      { returnDocument: 'after' },
    );
  }
}

export const userRepository = new UserRepository();
