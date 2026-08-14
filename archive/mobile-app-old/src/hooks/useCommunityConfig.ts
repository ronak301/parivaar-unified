import { useSelector } from "react-redux";
import { CommunityConfig, useConfigManager } from "./useConfigManager";
import { RootState } from "src/app/store";

type Props = {
  config: CommunityConfig;
  loading: boolean;
};

export function useCommunityConfig(): Props {
  const selectedCommunityId = useSelector(
    (state: RootState) => state?.community?.selectedCommunity?.id
  );
  const { getCommunityConfig, loading } = useConfigManager({});
  return {
    loading,
    config: getCommunityConfig(selectedCommunityId),
  };
}
