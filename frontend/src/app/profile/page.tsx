"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import AuthLayout from "@/app/components/AuthLayout";
import Button from "@/app/components/Button";

export default function ProfilePage() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsEditing(false);
  };

  return (
    <AuthLayout>
      <div className='max-w-2xl mx-auto'>
        <h1 className='text-2xl font-bold text-gray-800 mb-6'>Your Profile</h1>

        <div className='bg-white shadow-lg rounded-lg p-6'>
          {!isEditing ? (
            <div className='space-y-4'>
              <div>
                <h2 className='text-sm font-medium text-gray-500'>Email</h2>
                <p className='mt-1 text-lg'>{user?.email}</p>
              </div>
              <div>
                <h2 className='text-sm font-medium text-gray-500'>Name</h2>
                <p className='mt-1 text-lg'>{user?.name}</p>
              </div>
              <div className='pt-4'>
                <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className='space-y-4'>
              <div>
                <label
                  htmlFor='email'
                  className='block text-sm font-medium text-gray-700'
                >
                  Email
                </label>
                <input
                  id='email'
                  type='email'
                  disabled
                  className='mt-1 block w-full border border-gray-300 rounded-lg shadow-sm p-2 bg-gray-100'
                  value={user?.email}
                />
                <p className='mt-1 text-sm text-gray-500'>
                  Email cannot be changed
                </p>
              </div>
              <div>
                <label
                  htmlFor='name'
                  className='block text-sm font-medium text-gray-700'
                >
                  Name
                </label>
                <input
                  id='name'
                  type='text'
                  required
                  className='mt-1 block w-full border border-gray-300 rounded-lg shadow-sm p-2'
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className='flex space-x-3 pt-4'>
                <Button
                  variant='outline'
                  onClick={() => setIsEditing(false)}
                  type='button'
                >
                  Cancel
                </Button>
                <Button type='submit'>Save Changes</Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </AuthLayout>
  );
}
