import { hashPassword } from '../../shared/utils/password';
import { UserDocument, UserModel } from '../../modules/users/model/user.model';

type CreateUserOptions = {
  name?: string;
  email?: string;
  password?: string;
};

export async function createUser(options: CreateUserOptions = {}): Promise<{
  user: UserDocument;
  password: string;
}> {
  const password = options.password ?? 'Password@123';

  const passwordHash = await hashPassword(password);

  const user = await UserModel.create({
    name: options.name ?? 'Parth Sharma',
    email: options.email ?? `user-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`,
    passwordHash,
    isVerified: true,
  });

  return {
    user,
    password,
  };
}
