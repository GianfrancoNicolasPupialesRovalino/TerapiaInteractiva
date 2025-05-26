import { apiRequest } from "./queryClient";
import type { LoginRequest, RegisterRequest, User } from "@shared/schema";

export interface AuthResponse {
  user: User;
  token: string;
}

export async function login(credentials: LoginRequest): Promise<AuthResponse> {
  const response = await apiRequest("POST", "/api/auth/login", credentials);
  return response.json();
}

export async function register(userData: RegisterRequest): Promise<AuthResponse> {
  const response = await apiRequest("POST", "/api/auth/register", userData);
  return response.json();
}

export async function getCurrentUser(): Promise<User> {
  const response = await apiRequest("GET", "/api/auth/me");
  return response.json();
}

export function getAuthToken(): string | null {
  return localStorage.getItem("auth_token");
}

export function setAuthToken(token: string): void {
  localStorage.setItem("auth_token", token);
}

export function removeAuthToken(): void {
  localStorage.removeItem("auth_token");
}

export function logout(): void {
  removeAuthToken();
  window.location.href = "/login";
}
