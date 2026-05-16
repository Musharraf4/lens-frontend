'use client'

import { useState } from 'react';
import { useUser } from '@/hooks/useUser';

export default function ProfilePage() {
  const { 
    user, 
    isLoading, 
    error,
    updateProfile,
    isUpdating,
    updateError,
    updateAvatar,
    isUpdatingAvatar,
  } = useUser();

  const [name, setName] = useState('');

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile({ name: name });
      setName('');
    } catch (err) {
      console.error('Failed to update profile:', err);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        await updateAvatar(file);
      } catch (err) {
        console.error('Failed to update avatar:', err);
      }
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading profile</div>;
  if (!user) return <div>No user found</div>;

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Profile</h1>
      
      <div className="mb-8">
        <h2 className="text-xl mb-2">Current Profile</h2>
        <div className="bg-gray-50 p-4 rounded">
          <p>Name: {user.name}</p>
          <p>Email: {user.email}</p>
        </div>
      </div>

      <form onSubmit={handleUpdateProfile} className="mb-8">
        <h2 className="text-xl mb-2">Update Profile</h2>
        <div className="flex gap-4">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="New username"
            className="flex-1 p-2 border rounded"
          />
          <button
            type="submit"
            disabled={isUpdating}
            className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
          >
            {isUpdating ? 'Updating...' : 'Update'}
          </button>
        </div>
        {updateError && (
          <p className="text-red-500 mt-2">{updateError.message}</p>
        )}
      </form>

      <div>
        <h2 className="text-xl mb-2">Update Avatar</h2>
        <div className="flex items-center gap-4">
          <input
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
            disabled={isUpdatingAvatar}
            className="flex-1"
          />
          {isUpdatingAvatar && <span>Uploading...</span>}
        </div>
      </div>
    </div>
  );
}
