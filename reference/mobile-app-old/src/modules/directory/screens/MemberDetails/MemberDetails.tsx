import React from "react";
import { useLocalSearchParams, useNavigation } from "expo-router";
import GenericProfileScreen from "src/modules/profile/screens/GenericProfileScreen";

const MemberDetailsScreen = () => {
  const navigation = useNavigation();
  const params = useLocalSearchParams();

  React.useLayoutEffect(() => {
    navigation.setOptions({
      title: "Profile",
    });
  }, [navigation]);

  return <GenericProfileScreen id={params?.id as string} />;
};

export default MemberDetailsScreen;
