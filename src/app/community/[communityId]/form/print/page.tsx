import { notFound } from "next/navigation";
import { getCommunityDetailsForId } from "@/lib/api/community";
import { PrintableRegistrationForm } from "@/components/community/printable-registration-form";

export default async function CommunityFormPrintPage({
  params,
}: {
  params: Promise<{ communityId: string }>;
}) {
  const { communityId } = await params;

  const communityRes = await getCommunityDetailsForId(communityId).catch(
    () => null
  );
  if (!communityRes) notFound();

  return <PrintableRegistrationForm communityName={communityRes.data.name} />;
}
