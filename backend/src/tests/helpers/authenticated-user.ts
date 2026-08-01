import { createUser } from './create-user';
import { login } from './login';

export async function createAuthenticatedUser() {
  const { user, password } = await createUser();

  const token = await login(user.email, password);

  return {
    user,
    password,
    token,
  };
}
