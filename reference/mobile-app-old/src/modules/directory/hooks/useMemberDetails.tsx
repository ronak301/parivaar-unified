import React from "react";
import { Member } from "src/types/types";

type MemberDetailsContextType = {
  memberDetails?: Member | null;
};

export const MemberDetailsContext =
  React.createContext<MemberDetailsContextType>({
    memberDetails: null,
  });

export const useMemberDetails = () => {
  const context = React.useContext(MemberDetailsContext);
  return context;
};

type Props = {
  memberDetails: Member;
  children?: React.ReactNode;
};

export const MemberDetailsContextProvider = ({
  memberDetails,
  children,
}: Props) => {
  return (
    <MemberDetailsContext.Provider value={{ memberDetails }}>
      {children}
    </MemberDetailsContext.Provider>
  );
};
