import { notFound } from "next/navigation";
import { getCommunityDetailsForId } from "@/lib/api/community";
import { getRemoteConfig } from "@/lib/firebase/config";
import { getCommunityConfig } from "@/lib/firebase/community-config";
import { FormShowcase } from "@/components/community/form-showcase";

export default async function CommunityFormPage({
  params,
}: {
  params: Promise<{ communityId: string }>;
}) {
  const { communityId } = await params;

  const [communityRes, config, communityConfig] = await Promise.all([
    getCommunityDetailsForId(communityId).catch(() => null),
    getRemoteConfig(),
    getCommunityConfig(communityId),
  ]);
  if (!communityRes) notFound();

  return (
    <div className="min-h-screen bg-muted/20">
      <header className="bg-neutral-950 py-8 text-center text-white">
        <h1 className="text-2xl font-bold tracking-tight">
          {communityRes.data.name}
        </h1>
        <p className="mt-1 text-sm text-white/60">Family Registration Form</p>
      </header>
      <div className="mx-auto max-w-2xl px-4 py-10">
        <FormShowcase
          config={config}
          localities={communityConfig.localities}
        />
      </div>
    </div>
  );
}
