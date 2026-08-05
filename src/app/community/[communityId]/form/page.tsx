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
    <div className="mx-auto min-h-screen max-w-2xl px-4 py-10">
      <FormShowcase
        communityName={communityRes.data.name}
        config={config}
        localities={communityConfig.localities}
      />
    </div>
  );
}
