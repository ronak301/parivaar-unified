import { CommunityConfig } from "src/hooks/useConfigManager";

export const getNextScreen = (
  communityConfig: CommunityConfig,
  id?: string
) => {
  const isWelcomeScreenEnabled = communityConfig?.features?.WelcomeScreen;
  return isWelcomeScreenEnabled
    ? `/(authenticated)/community/welcome`
    : `/(authenticated)/community/${id}`;
};
