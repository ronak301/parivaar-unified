'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowRight, ArrowLeft } from 'lucide-react';

interface AddFamilyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  communityId: string;
}

export function AddFamilyModal({ open, onOpenChange, communityId }: AddFamilyModalProps) {
  const [step, setStep] = useState<'phone' | 'details'>('phone');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    headName: '',
    sampradaya: '',
    description: '',
  });

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) {
      setError('Please enter a phone number');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Verify phone exists in community
      const res = await fetch(
        `/api/admin/communities/${communityId}/member-search?phone=${phone}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('auth_token')}` },
        }
      );

      if (!res.ok) {
        throw new Error('Phone number not found in this community');
      }

      const data = await res.json();
      // Pre-fill head name if found
      if (data.user?.fullName) {
        setFormData(prev => ({ ...prev, headName: data.user.fullName }));
      }

      setStep('details');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to verify phone');
    } finally {
      setLoading(false);
    }
  };

  const handleDetailsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.headName.trim()) {
      setError('Please enter family head name');
      return;
    }

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

      onOpenChange(false);
      // Reset
      setStep('phone');
      setPhone('');
      setFormData({ headName: '', sampradaya: '', description: '' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create family');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {step === 'phone' ? 'Add Family - Verify Phone' : 'Add Family - Details'}
          </DialogTitle>
        </DialogHeader>

        {step === 'phone' ? (
          <form onSubmit={handlePhoneSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Family Head Phone Number *</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="Enter phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="h-10"
                autoFocus
              />
              <p className="text-xs text-[#464555]">
                Enter the phone number of the person who will be the family head
              </p>
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
                className="flex-1 bg-[#0b1c30] hover:bg-[#1c2f47] text-white flex items-center justify-center gap-2"
              >
                {loading ? 'Verifying...' : 'Next'}
                <ArrowRight className="size-4" />
              </Button>
              <Button
                type="button"
                onClick={() => onOpenChange(false)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleDetailsSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="headName">Family Head Name *</Label>
              <Input
                id="headName"
                placeholder="Family head name"
                value={formData.headName}
                onChange={(e) => setFormData(prev => ({ ...prev, headName: e.target.value }))}
                className="h-10"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sampradaya">Sampradaya / Caste</Label>
              <Input
                id="sampradaya"
                placeholder="e.g., Oswal, Maheshwari"
                value={formData.sampradaya}
                onChange={(e) => setFormData(prev => ({ ...prev, sampradaya: e.target.value }))}
                className="h-10"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                placeholder="Family background, history, etc."
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
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
                type="button"
                onClick={() => {
                  setStep('phone');
                  setError('');
                }}
                variant="outline"
                className="flex-1 flex items-center justify-center gap-2"
              >
                <ArrowLeft className="size-4" />
                Back
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 bg-[#0b1c30] hover:bg-[#1c2f47] text-white"
              >
                {loading ? 'Creating...' : 'Create Family'}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
