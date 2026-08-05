import type { ReactNode } from "react";
import { isEmpty } from "lodash";

type Props = {
  ifPresent: unknown;
  children: ReactNode;
};

export function Check({ ifPresent, children }: Props) {
  if (ifPresent || !isEmpty(ifPresent)) return <>{children}</>;
  return null;
}
