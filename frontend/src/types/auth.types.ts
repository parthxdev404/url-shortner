export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
}
