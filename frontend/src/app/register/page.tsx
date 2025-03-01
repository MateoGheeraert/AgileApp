"use client";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import Button from "../components/Button";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await register(email, password, name);
    } catch (err) {
      console.error("Registration error:", err);
      setError("Registration failed. Please try again.");
    }
  };

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-200'>
      <div className='max-w-md w-full p-8 bg-white rounded-lg shadow-2xl border border-gray-300'>
        <h2 className='text-center text-3xl font-extrabold text-black'>
          Create your account
        </h2>
        <form className='mt-6 space-y-4' onSubmit={handleSubmit}>
          {error && (
            <div className='text-red-500 text-sm text-center'>{error}</div>
          )}

          <div className='space-y-3'>
            <div>
              <label
                htmlFor='name'
                className='block text-sm font-medium text-black'
              >
                Full Name
              </label>
              <input
                id='name'
                name='name'
                type='text'
                required
                className='mt-1 block w-full p-3 border border-gray-400 rounded-lg focus:ring-primaryBlue-500 focus:border-primaryBlue-500 text-black'
                placeholder='Full Name'
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <label
                htmlFor='email'
                className='block text-sm font-medium text-black'
              >
                Email address
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
                Password
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

          <div className='flex justify-center'>
            <Button type='submit' className='w-full max-w-xs'>
              Sign up
            </Button>
          </div>

          <div className='text-sm text-center mt-4'>
            <Link
              href='/login'
              className='text-primaryBlue-500 hover:text-primaryBlue-600'
            >
              Already have an account? Sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
