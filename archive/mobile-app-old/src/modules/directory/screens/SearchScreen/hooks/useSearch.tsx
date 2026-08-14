import React from "react";
import { Member } from "src/types/types";

type SearchContextType = {
  query?: string;
  setQuery?: any;
  members?: Member[];
  setMembers?: any;
};

const SearchContext = React.createContext<SearchContextType>({});

export const useSearch = () => {
  const context = React.useContext(SearchContext);
  return context;
};

type Props = {
  query?: string;
  setQuery?: any;
  members?: Member[];
  setMembers?: any;
  children?: React.ReactNode;
};

export const SearchContextProvider = ({
  members,
  setMembers,
  children,
}: Props) => {
  return (
    <SearchContext.Provider
      value={{
        members,
        setMembers,
      }}>
      {children}
    </SearchContext.Provider>
  );
};
