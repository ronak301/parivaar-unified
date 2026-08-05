import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "src/app/store";
import GenericProfileScreen from "./GenericProfileScreen";

const ProfileScreen = () => {
  const currentUser = useSelector(
    (state: RootState) => state?.auth?.currentUser
  );

  return <GenericProfileScreen id={currentUser?.id} />;
};

export default ProfileScreen;
