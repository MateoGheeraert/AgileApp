"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

interface User {
  _id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_COOKIE_NAME = "token"; // Consistent cookie name
const TOKEN_EXPIRY_DAYS = 7; // Centralized token expiry

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Server URL should be in an environment variable
  const API_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/graphql";

  useEffect(() => {
    // Check for stored token and validate it
    const token = Cookies.get(TOKEN_COOKIE_NAME);
    if (token) {
      validateToken(token);
    } else {
      setIsLoading(false);
    }
  }, []);

  const validateToken = async (token: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          query: `
            query {
              me {
                _id
                email
                name
              }
            }
          `,
        }),
      });

      const responseData = await response.json();

      if (responseData.errors) {
        // Handle GraphQL errors
        console.error("GraphQL errors:", responseData.errors);
        Cookies.remove(TOKEN_COOKIE_NAME);
        setUser(null);
        setError("Session expired. Please log in again.");
        return;
      }

      if (responseData.data?.me) {
        setUser(responseData.data.me);
      } else {
        // Token is invalid or expired
        Cookies.remove(TOKEN_COOKIE_NAME);
        setUser(null);
      }
    } catch (error) {
      console.error("Token validation failed:", error);
      Cookies.remove(TOKEN_COOKIE_NAME);
      setUser(null);
      setError("Authentication error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: `
            mutation Login($input: LoginInput!) {
              login(input: $input) {
                token
                user {
                  _id
                  email
                  name
                }
              }
            }
          `,
          variables: {
            input: { email, password },
          },
        }),
      });

      const responseData = await response.json();

      if (responseData.errors) {
        console.error("Login errors:", responseData.errors);
        setError(
          responseData.errors[0]?.message || "Invalid email or password"
        );
        throw new Error(responseData.errors[0]?.message || "Login failed");
      }

      if (responseData.data?.login) {
        // Set cookie with secure options
        Cookies.set(TOKEN_COOKIE_NAME, responseData.data.login.token, {
          expires: TOKEN_EXPIRY_DAYS,
          sameSite: "strict",
          secure: process.env.NODE_ENV === "production",
        });

        setUser(responseData.data.login.user);
        router.push("/dashboard");
      } else {
        setError("Login failed. Please try again.");
        throw new Error("Login failed");
      }
    } catch (error) {
      console.error("Login failed:", error);
      setError(error instanceof Error ? error.message : "Login failed");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: `
            mutation Register($input: RegisterInput!) {
              register(input: $input) {
                token
                user {
                  _id
                  email
                  name
                }
              }
            }
          `,
          variables: {
            input: { email, password, name },
          },
        }),
      });

      const responseData = await response.json();

      if (responseData.errors) {
        console.error("Registration errors:", responseData.errors);
        setError(responseData.errors[0]?.message || "Registration failed");
        throw new Error(
          responseData.errors[0]?.message || "Registration failed"
        );
      }

      if (responseData.data?.register) {
        // Set cookie with secure options
        Cookies.set(TOKEN_COOKIE_NAME, responseData.data.register.token, {
          expires: TOKEN_EXPIRY_DAYS,
          sameSite: "strict",
          secure: process.env.NODE_ENV === "production",
        });

        setUser(responseData.data.register.user);
        router.push("/dashboard");
      } else {
        setError("Registration failed. Please try again.");
        throw new Error("Registration failed");
      }
    } catch (error) {
      console.error("Registration failed:", error);
      setError(error instanceof Error ? error.message : "Registration failed");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    Cookies.remove(TOKEN_COOKIE_NAME);
    setUser(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider
      value={{ user, login, register, logout, isLoading, error }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
