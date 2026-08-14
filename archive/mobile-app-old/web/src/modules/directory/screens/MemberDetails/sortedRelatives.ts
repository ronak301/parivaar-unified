import { isEmpty } from "lodash";
import type { Relative } from "@/types/types";

export function sortedRelatives(relatives: Relative[] | undefined) {
  if (isEmpty(relatives)) return [];
  if ((relatives?.length ?? 0) <= 1) return relatives ?? [];
  const relativesCopy = [...(relatives ?? [])];
  const RelativeOrder = [
    "Father",
    "Mother",
    "Husband",
    "Wife",
    "Son",
    "Daughter",
    "Brother",
    "Sister",
  ];

  relativesCopy.sort((r1, r2) => {
    const type1 = r1?.relationship?.type;
    const type2 = r2?.relationship?.type;
    if (type1 === type2) return 0;
    for (let i = 0; i < RelativeOrder.length; i++) {
      const o = RelativeOrder[i];
      if (type1 === o) return -1;
      if (type2 === o) return 1;
    }
    return 0;
  });

  return relativesCopy;
}
