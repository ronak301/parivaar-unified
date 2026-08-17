'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { APP_CONFIG, getAppConfig, saveAppConfig } from '@/config/app-config';

export default function SettingsPage() {
  const { user } = useAuth();
  const [config, setConfig] = useState(APP_CONFIG);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const appConfig = getAppConfig();
    setConfig(appConfig);
  }, []);

  const handleCommunitiesTtlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const minutes = parseInt(e.target.value) || 0;
    setConfig(prev => ({
      ...prev,
      cache: {
        ...prev.cache,
        communities: {
          ttl: minutes * 60 * 1000,
        },
      },
    }));
    setSaved(false);
  };

  const handleSave = () => {
    saveAppConfig(config);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  if (user?.role !== 'super_admin') {
    return (
      <div className="text-center py-12">
        <p className="text-[#464555]">Only Super Admin can access settings</p>
      </div>
    );
  }

  const communitiesTtlMinutes = config.cache.communities.ttl / (60 * 1000);

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#0b1c30]">Settings</h1>
        <p className="text-[#464555] text-sm mt-1">Global app configuration</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-[#c7c4d7]/30 p-6">
        <div className="space-y-8">
          {/* Cache Settings */}
          <div className="border-b border-[#e5eeff] pb-8">
            <h2 className="text-lg font-semibold text-[#0b1c30] mb-6">Cache Configuration</h2>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="communities-ttl">Communities Cache TTL (minutes)</Label>
                <Input
                  id="communities-ttl"
                  type="number"
                  min="1"
                  max="120"
                  value={communitiesTtlMinutes}
                  onChange={handleCommunitiesTtlChange}
                  className="h-10 max-w-xs"
                />
                <p className="text-xs text-[#464555] mt-2">
                  How long to keep communities data in browser cache before fetching from API again.
                </p>
              </div>
            </div>
          </div>

          {/* Info */}
          <div className="bg-[#f8f9ff] border border-[#e5eeff] rounded-lg p-4">
            <p className="text-sm text-[#464555]">
              <strong>Cache Strategy:</strong> The app uses a cache-first approach. On first load, data is fetched from the API and cached. On subsequent loads within the TTL window, cached data is used without API calls. Use <code className="bg-white px-2 py-1 rounded text-xs">refetch()</code> from the auth hook to manually refresh data.
            </p>
          </div>

          {/* Save Button */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleSave}
              className="bg-[#3230c4] hover:bg-[#494ad9] text-white"
            >
              Save Settings
            </Button>
            {saved && (
              <div className="flex items-center text-green-600 text-sm font-semibold">
                ✓ Saved successfully
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
