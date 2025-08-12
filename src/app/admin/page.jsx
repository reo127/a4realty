'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in and is an admin
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      if (parsedUser.role !== 'admin') {
        router.push('/');
      }
    } else {
      router.push('/login');
    }
    setLoading(false);
  }, [router]);

  if (loading) {
    return <div className="text-center p-10">Loading...</div>;
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      <p className="mb-4">Welcome, {user.name}!</p>
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Admin Controls</h2>
        <p>This is a placeholder for the admin dashboard. You can add admin-specific functionality here.</p>
      </div>
    </div>
  );
}