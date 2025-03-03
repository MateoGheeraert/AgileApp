"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";

interface User {
  _id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/graphql";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const validateSession = async () => {
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
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

      const data = await response.json();

      if (data.data?.me) {
        setUser(data.data.me);
      } else {
        // Try to refresh the token
        const refreshResponse = await fetch(API_URL, {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query: `
              mutation {
                refreshToken
              }
            `,
          }),
        });

        const refreshData = await refreshResponse.json();

        if (refreshData.data?.refreshToken) {
          // Retry fetching user data
          await validateSession();
        } else {
          setUser(null);
          if (!window.location.pathname.startsWith("/login")) {
            router.push("/login");
          }
        }
      }
    } catch (error) {
      console.error("Session validation error:", error);
      setUser(null);
      if (!window.location.pathname.startsWith("/login")) {
        router.push("/login");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Check authentication status on mount and after refresh
  useEffect(() => {
    validateSession();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: `
            mutation Login($input: LoginInput!) {
              login(input: $input) {
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
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: `
            mutation Register($input: RegisterInput!) {
              register(input: $input) {
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

  const logout = async () => {
    try {
      await fetch(API_URL, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: `
            mutation {
              logout
            }
          `,
        }),
      });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
      router.push("/login");
    }
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
