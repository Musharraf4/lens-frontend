'use client';

import { useState, useEffect } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface UseUserReturn {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  updateProfile: (data: Partial<User>) => Promise<void>;
  isUpdating: boolean;
  updateError: Error | null;
  updateAvatar: (file: File) => Promise<void>;
  isUpdatingAvatar: boolean;
}

export function useUser(): UseUserReturn {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<Error | null>(null);
  const [isUpdatingAvatar, setIsUpdatingAvatar] = useState(false);

  useEffect(() => {
    // Fetch user data when component mounts
    fetchUserData();
  }, []);

  async function fetchUserData() {
    try {
      // TODO: Implement actual API call to fetch user data
      const response = await fetch('/api/user');
      const data = await response.json();
      setUser(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch user'));
    } finally {
      setIsLoading(false);
    }
  }

  async function updateProfile(data: Partial<User>) {
    setIsUpdating(true);
    setUpdateError(null);
    try {
      // TODO: Implement actual API call to update profile
      const response = await fetch('/api/user', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const updatedUser = await response.json();
      setUser(updatedUser);
    } catch (err) {
      setUpdateError(err instanceof Error ? err : new Error('Failed to update profile'));
      throw err;
    } finally {
      setIsUpdating(false);
    }
  }

  async function updateAvatar(file: File) {
    setIsUpdatingAvatar(true);
    try {
      // TODO: Implement actual API call to update avatar
      const formData = new FormData();
      formData.append('avatar', file);
      const response = await fetch('/api/user/avatar', {
        method: 'PUT',
        body: formData,
      });
      const updatedUser = await response.json();
      setUser(updatedUser);
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to update avatar');
    } finally {
      setIsUpdatingAvatar(false);
    }
  }

  return {
    user,
    isLoading,
    error,
    updateProfile,
    isUpdating,
    updateError,
    updateAvatar,
    isUpdatingAvatar,
  };
}