import type { CommunityConfig } from "@/hooks/useConfigManager";

export const getNextScreen = (communityConfig: CommunityConfig | undefined, id?: string) => {
  const isWelcomeScreenEnabled = communityConfig?.features?.WelcomeScreen;
  return isWelcomeScreenEnabled
    ? `/community/welcome`
    : `/community/${id}`;
};
