import { View } from "react-native";
import React from "react";
import AddMemberInitiate from "../components/AddMemberInitiate";
import AddMemberComplete from "../components/AddMemberComplete";

const AddMemberScreen = () => {
  const [isFinalStep, setIsFinalStep] = React.useState(false);
  const [phone, setPhoneNumber] = React.useState("");
  const [isUserPresentInAnotherCommunity, setIsUserPresentInAnotherCommunity] =
    React.useState(false);

  const [user, setUser] = React.useState();

  return (
    <View style={{ flex: 1 }}>
      {!isFinalStep ? (
        <AddMemberInitiate
          setIsFinalStep={setIsFinalStep}
          setPhoneNumber={setPhoneNumber}
          setIsUserPresentInAnotherCommunity={
            setIsUserPresentInAnotherCommunity
          }
          setUser={setUser}
        />
      ) : (
        <AddMemberComplete
          phone={phone}
          isUserPresentInAnotherCommunity={isUserPresentInAnotherCommunity}
          user={user}
        />
      )}
    </View>
  );
};

export default AddMemberScreen;
