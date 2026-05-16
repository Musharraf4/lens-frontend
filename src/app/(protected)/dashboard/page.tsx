import React from 'react';
import Link from 'next/link';

export default function Dashboard() {
  return (
    <div className="min-h-screen p-8">
      <main className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold">Dashboard</h1>
          <Link
            href="/"
            className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
          >
            <span>←</span> Back to Home
          </Link>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <p className="text-lg mb-4">
            Welcome to your dashboard! This is where you'll see all your important information.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h2 className="text-xl font-semibold mb-2">Quick Stats</h2>
              <p className="text-gray-600 dark:text-gray-300">Your statistics will appear here.</p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h2 className="text-xl font-semibold mb-2">Recent Activity</h2>
              <p className="text-gray-600 dark:text-gray-300">Your recent activities will appear here.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 