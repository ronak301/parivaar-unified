'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getAdminClient } from '@/lib/api/client';
import { getCommunities } from '@/lib/api/community';

interface Community {
  _id: string;
  name: string;
  status: string;
  createdAt: string;
}

export default function CommunitiesPage() {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadCommunities() {
      try {
        const client = await getAdminClient();
        const data = await getCommunities(client);
        setCommunities(data);
      } catch (err) {
        setError('Failed to load communities');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadCommunities();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-gray-600">Loading communities...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Communities</h1>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      )}

      {communities.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-8 text-center text-gray-600">
          No communities yet
        </div>
      ) : (
        <div className="grid gap-4">
          {communities.map((community) => (
            <Link
              key={community._id}
              href={`/admin/communities/${community._id}`}
              className="block p-4 border rounded-lg hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold">{community.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Status: <span className="font-medium">{community.status}</span>
                  </p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  community.status === 'Active'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {community.status}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
