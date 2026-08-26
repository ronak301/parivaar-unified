'use client';

import { useRouter, useParams } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft } from 'lucide-react';

export default function AddFamilyPage() {
  const router = useRouter();
  const params = useParams();
  const communityId = params.id as string;

  const [formData, setFormData] = useState({
    headName: '',
    sampradaya: '',
    description: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/admin/families`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify({
          communityId,
          headName: formData.headName,
          sampradaya: formData.sampradaya,
          description: formData.description,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to create family');
      }

      router.push(`/admin/community/${communityId}/members`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create family');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-[#3230c4] hover:text-[#494ad9] mb-6 text-sm font-semibold"
      >
        <ArrowLeft className="size-4" />
        Back
      </button>

      <div className="bg-white rounded-xl shadow-sm border border-[#c7c4d7]/30 p-6">
        <h1 className="text-3xl font-bold text-[#0b1c30] mb-2">Add Family</h1>
        <p className="text-[#464555] mb-8">Create a new family in the community</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="headName">Family Head Name *</Label>
            <Input
              id="headName"
              name="headName"
              placeholder="Enter family head name"
              value={formData.headName}
              onChange={handleChange}
              required
              className="h-10"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sampradaya">Sampradaya / Caste</Label>
            <Input
              id="sampradaya"
              name="sampradaya"
              placeholder="e.g., Oswal, Maheshwari"
              value={formData.sampradaya}
              onChange={handleChange}
              className="h-10"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              name="description"
              placeholder="Family background, history, etc."
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="w-full px-3 py-2 rounded-lg border border-input bg-transparent text-sm focus:ring-2 focus:ring-[#3230c4]/20 focus:outline-none"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-[#0b1c30] hover:bg-[#1c2f47] text-white"
            >
              {loading ? 'Creating...' : 'Create Family'}
            </Button>
            <Button
              type="button"
              onClick={() => router.back()}
              variant="outline"
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
