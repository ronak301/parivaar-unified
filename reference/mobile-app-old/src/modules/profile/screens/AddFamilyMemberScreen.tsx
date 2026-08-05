import { View, Text } from "react-native";
import React from "react";
import AddFamilyMemberInitiate from "../components/AddFamilyMemberInitiate";
import AddFamilyMemberComplete from "../components/AddFamilyMemberComplete";
import { useLocalSearchParams } from "expo-router";

const AddFamilyMemberScreen = () => {
  const [isFinalStep, setIsFinalStep] = React.useState(false);
  const [phone, setPhoneNumber] = React.useState(null);
  const params = useLocalSearchParams();
  const user = JSON.parse(params?.user as string);

  return (
    <View style={{ flex: 1 }}>
      {!isFinalStep ? (
        <AddFamilyMemberInitiate
          user={user}
          setIsFinalStep={setIsFinalStep}
          setPhoneNumber={setPhoneNumber}
        />
      ) : (
        <AddFamilyMemberComplete user={user} phone={phone} />
      )}
    </View>
  );
};

export default AddFamilyMemberScreen;
