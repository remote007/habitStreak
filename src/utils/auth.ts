
import { UserAuth } from "@/types";

// Auth functions
export const registerUser = (email: string, password: string): UserAuth => {
  const users = JSON.parse(sessionStorage.getItem("users") || "[]");
  
  // Check if email already exists
  if (users.some((user: UserAuth) => user.email === email)) {
    throw new Error("Email already registered");
  }
  
  const newUser = {
    id: crypto.randomUUID(),
    email,
    password, // In a real app, this would be hashed
  };
  
  users.push(newUser);
  sessionStorage.setItem("users", JSON.stringify(users));
  
  // Auto login the user
  sessionStorage.setItem("currentUser", JSON.stringify(newUser));
  
  return newUser;
};

export const loginUser = (email: string, password: string): UserAuth => {
  const users = JSON.parse(sessionStorage.getItem("users") || "[]");
  const user = users.find((user: UserAuth) => user.email === email && user.password === password);
  
  if (!user) {
    throw new Error("Invalid email or password");
  }
  
  sessionStorage.setItem("currentUser", JSON.stringify(user));
  return user;
};

export const logoutUser = (): void => {
  sessionStorage.removeItem("currentUser");
};

export const getCurrentUser = (): UserAuth | null => {
  const userString = sessionStorage.getItem("currentUser");
  return userString ? JSON.parse(userString) : null;
};

export const isAuthenticated = (): boolean => {
  return getCurrentUser() !== null;
};
