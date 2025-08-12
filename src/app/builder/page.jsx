'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function BuilderDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in and is a builder
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      if (parsedUser.role !== 'builder' && parsedUser.role !== 'admin') {
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
      <h1 className="text-3xl font-bold mb-6">Builder Dashboard</h1>
      <p className="mb-4">Welcome, {user.name}!</p>
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Builder Controls</h2>
        <p>This is a placeholder for the builder dashboard. You can add builder-specific functionality here.</p>
      </div>
    </div>
  );
}