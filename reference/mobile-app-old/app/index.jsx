import React from "react";
import { View } from "react-native";
import AppContainer from "src/app/AppContainer";
import { useConfigManager } from "src/hooks/useConfigManager";
import LoadingComponent from "src/ui/LoadingComponent";

export default function StartPage() {
  const { loading } = useConfigManager({ forceSync: true });

  if (loading) return <LoadingComponent />;
  return (
    <View style={{ backgroundColor: "white", flex: 1 }}>
      <AppContainer />
    </View>
  );
}
