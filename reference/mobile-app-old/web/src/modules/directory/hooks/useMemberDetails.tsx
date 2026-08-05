import React from "react";
import type { Member } from "@/types/types";

type MemberDetailsContextType = {
  memberDetails?: Member | null;
};

export const MemberDetailsContext = React.createContext<MemberDetailsContextType>(
  {
    memberDetails: null,
  }
);

export function useMemberDetails() {
  return React.useContext(MemberDetailsContext);
}

export function MemberDetailsContextProvider({
  memberDetails,
  children,
}: {
  memberDetails: Member;
  children?: React.ReactNode;
}) {
  return (
    <MemberDetailsContext.Provider value={{ memberDetails }}>
      {children}
    </MemberDetailsContext.Provider>
  );
}
