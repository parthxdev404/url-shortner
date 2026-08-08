export type User = {
  name: string;
  email: string;
  password: string;
};

const USER_KEY = "linkeforge_users";
const AUTH_KEY = "linkeforge_authenticated";

export const getUsers = (): User[] => {
  const users = localStorage.getItem(USER_KEY);
  if (!users) {
    return [];
  }

  return JSON.parse(users);
};

export const registerUser = (user: User): void => {
  const users = getUsers();

  const existingUser = users.find(
    (existingUser) => existingUser.email === user.email,
  );

  if (existingUser) {
    throw new Error("An account with this email already exists");
  }
  users.push(user);

  localStorage.setItem(USER_KEY, JSON.stringify(users));
};

export const loginUser = (email: string, password: string): User => {
  const users = getUsers();

  const user = users.find(
    (user) => user.email === email && user.password === password,
  );
  if (!user) {
    throw new Error("Invalid Email Address");
  }

  localStorage.setItem(AUTH_KEY, "true");

  return user;
};

export const isAuthenticated = (): boolean => {
  return localStorage.getItem(AUTH_KEY) === "true";
};

export const logOutUser = (): void => {
  localStorage.removeItem(AUTH_KEY);
};
