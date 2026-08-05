import { doc, getDoc, setDoc } from "firebase/firestore";
import { firebaseDB } from "./client";

export interface CommunityConfig {
  localities: string[];
}

const DEFAULT_CONFIG: CommunityConfig = { localities: [] };

export async function getCommunityConfig(
  communityId: string
): Promise<CommunityConfig> {
  const ref = doc(firebaseDB, "communityConfig", communityId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return DEFAULT_CONFIG;
  return { ...DEFAULT_CONFIG, ...snap.data() } as CommunityConfig;
}

export async function setCommunityLocalities(
  communityId: string,
  localities: string[]
): Promise<void> {
  const ref = doc(firebaseDB, "communityConfig", communityId);
  await setDoc(ref, { localities }, { merge: true });
}
