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
}

export const userRepository = new UserRepository();
