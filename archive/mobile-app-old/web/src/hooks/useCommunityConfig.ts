import { useSelector } from "react-redux";
import type { CommunityConfig } from "@/hooks/useConfigManager";
import { useConfigManager } from "@/hooks/useConfigManager";
import type { RootState } from "@/store";

export function useCommunityConfig(): {
  config: CommunityConfig | undefined;
  loading: boolean;
} {
  const selectedCommunityId = useSelector(
    (state: RootState) => state?.community?.selectedCommunity?.id
  );
  const { getCommunityConfig, loading } = useConfigManager({});
  return {
    loading,
    config: selectedCommunityId
      ? getCommunityConfig(selectedCommunityId)
      : undefined,
  };
}
