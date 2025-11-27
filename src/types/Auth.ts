export interface AuthBase {
  email: string;
  password: string;
}

export interface RegisterPayload extends AuthBase {
  fullName: string;
}

export interface AuthCredentials extends AuthBase {}

export interface AuthResponse {
  token: string;
}