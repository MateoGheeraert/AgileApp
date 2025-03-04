"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import Button from "../components/reusable/Button";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [localError, setLocalError] = useState("");
  const { login, user, isLoading, error: authError } = useAuth();
  const router = useRouter();

  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (user && !isLoading) {
      router.push("/dashboard");
    }
  }, [user, isLoading, router]);

  // Display auth context errors in the UI
  useEffect(() => {
    if (authError) {
      setLocalError(authError);
    }
  }, [authError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError("");

    // Simple validation
    if (!email || !password) {
      setLocalError("Email and password are required");
      return;
    }

    try {
      await login(email, password);
    } catch (err) {
      console.error("Login error:", err);
    }
  };

  if (isLoading) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gray-200'>
        <div className='text-center'>
          <p className='text-lg'>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-200'>
      <div className='max-w-md w-full p-8 bg-white rounded-lg shadow-2xl border border-gray-300'>
        <h2 className='text-center text-3xl font-extrabold text-black'>
          Inloggen
        </h2>
        <form className='mt-6 space-y-4' onSubmit={handleSubmit}>
          {localError && (
            <div className='text-red-500 text-sm text-center'>{localError}</div>
          )}
          <div className='space-y-3'>
            <div>
              <label
                htmlFor='email'
                className='block text-sm font-medium text-black'
              >
                Email adres
              </label>
              <input
                id='email'
                name='email'
                type='email'
                required
                className='mt-1 block w-full p-3 border border-gray-400 rounded-lg focus:ring-primaryBlue-500 focus:border-primaryBlue-500 text-black'
                placeholder='Email address'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label
                htmlFor='password'
                className='block text-sm font-medium text-black'
              >
                Wachtwoord
              </label>
              <input
                id='password'
                name='password'
                type='password'
                required
                className='mt-1 block w-full p-3 border border-gray-400 rounded-lg focus:ring-primaryBlue-500 focus:border-primaryBlue-500 text-black'
                placeholder='Password'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>
          {/* Centered Sign In Button */}
          <div className='flex justify-center'>
            <Button
              type='submit'
              className='w-full max-w-xs'
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </Button>
          </div>
          <div className='text-sm text-center mt-4'>
            <Link
              href='/register'
              className='text-primaryBlue-500 hover:text-primaryBlue-600'
            >
              Heb je nog geen account? Registreer je
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
