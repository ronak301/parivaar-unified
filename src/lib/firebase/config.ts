import { collection, getDocs } from "firebase/firestore";
import { firebaseDB } from "./client";
import type { RemoteConfig } from "@/lib/api/types";

export async function getRemoteConfig(): Promise<RemoteConfig | undefined> {
  const snapshot = await getDocs(collection(firebaseDB, "config"));
  const [doc] = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
  return doc as RemoteConfig | undefined;
}
