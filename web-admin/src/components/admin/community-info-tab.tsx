'use client';

import type { Community } from '@parivaar/shared';
import { Card, CardContent } from '@/components/ui/card';

function Field({ label, value }: { label: string; value?: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-foreground">{value ?? '—'}</span>
    </div>
  );
}

export function CommunityInfoTab({ community }: { community: Community }) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-6">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Name" value={community.name} />
          <Field label="Status" value={community.status} />
          <Field label="Contact Person" value={community.contactPersonName} />
          <Field label="Contact Number" value={community.contactPersonNumber} />
          <Field
            label="Location"
            value={
              community.city && community.state
                ? `${community.city}, ${community.state}`
                : (community.city ?? community.state)
            }
          />
        </div>

        {community.description && (
          <Field label="Description" value={community.description} />
        )}
      </CardContent>
    </Card>
  );
}
