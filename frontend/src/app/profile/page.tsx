"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import AuthLayout from "@/app/components/AuthLayout";
import Button from "@/app/components/reusable/Button";
import InputField from "../components/reusable/InputField";

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
        <h1 className='text-2xl font-bold text-gray-800 mb-6'>Jouw profiel</h1>

        <div className='bg-white shadow-lg rounded-lg p-6'>
          {!isEditing ? (
            <div className='space-y-4'>
              <div>
                <h2 className='text-sm font-medium text-gray-500'>Email</h2>
                <p className='mt-1 text-lg text-black'>{user?.email}</p>
              </div>
              <div>
                <h2 className='text-sm font-medium text-gray-500'>Naam</h2>
                <p className='mt-1 text-lg text-black'>{user?.name}</p>
              </div>
              <div className='pt-4'>
                <Button onClick={() => setIsEditing(true)}>
                  Bewerk profiel
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className='space-y-4'>
              <div>
                <InputField
                  label='Email'
                  type='email'
                  value={user?.email || ""}
                  onChange={() => {}}
                  placeholder='Enter your email'
                />

                <p className='mt-1 text-sm text-gray-500'>
                  Email kan niet worden gewijzigd
                </p>
              </div>
              <div>
                <InputField
                  type='text'
                  value={name}
                  onChange={(e) => setName(e)}
                  label='Naam'
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
