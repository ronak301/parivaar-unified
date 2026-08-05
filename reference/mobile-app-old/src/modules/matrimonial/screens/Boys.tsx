import { View, Text } from "react-native";
import React from "react";
import Matrimonial from "../components/Matrimonial";

const Boys = () => {
  return <Matrimonial gender="Male" />;
};

export default React.memo(Boys);
