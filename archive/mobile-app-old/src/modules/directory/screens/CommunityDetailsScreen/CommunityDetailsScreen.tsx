import { ScrollView, TouchableOpacity, View } from "react-native";
import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "src/app/store";
import { Text } from "src/ui/Text";
import { useTheme } from "src/ui";
import Spacer from "src/ui/Spacer";
import MemberTile from "./components/MemberTile";
import TitleRow from "src/ui/TitleRow";
import { router } from "expo-router";
import { Image } from "expo-image";
import Check from "src/ui/Check";
import { useCommunityConfig } from "src/hooks/useCommunityConfig";
import Animated, { FadeInDown, ZoomIn } from "react-native-reanimated";

export const Title = ({ children, size = 18, style = {} }) => {
  return (
    <Text
      bold
      style={[
        {
          fontWeight: "600",
          fontSize: size,
          paddingTop: 8,
          paddingBottom: 8,
          // textAlign: "center",
        },
        style,
      ]}>
      {children}
    </Text>
  );
};

const CommunityDetailsScreen = () => {
  const selectedCommunity = useSelector(
    (state: RootState) => state?.community?.selectedCommunity
  );

  const president = {
    id: "1f39c54c-4a9f-4485-bea6-91e91126858c",
    name: "Arjun lal Khokhawat",
    profilePicture: require("assets/arjunji.jpeg"),
    role: "President",
  };
  const secretary = {
    id: "b8e3545c-8e19-4574-9c5f-f32be8120121",
    name: "Vinod Kachhara",
    profilePicture: require("assets/vinodji.jpeg"),
    role: "Secretary",
  };

  const coordinators = [
    {
      id: "9a095f36-7096-4653-bcb7-5e54ad360038",
      name: "Abhishek Pokharna",
      profilePicture: require("assets/abhishekji.jpeg"),
      role: "Coordinator",
    },
    {
      id: "3d102aa6-163e-42e4-af2f-1168c4753b93",
      name: "Ronak Kothari",
      profilePicture: require("assets/ronakji.jpeg"),
      role: "Coordinator",
    },
    {
      id: "30a5ef92-86a5-47f9-8689-545e8b3a7b4c",
      name: "Abhay Kothari",
      profilePicture: require("assets/abhayji.jpeg"),
      role: "Coordinator",
    },
  ];

  const { colors } = useTheme();
  const { loading, config } = useCommunityConfig();
  const showExtraInfo = config?.features?.AboutScreenExtraInfo;

  if (loading) return null;

  return (
    <ScrollView
      contentContainerStyle={{
        backgroundColor: "white",
      }}>
      <Animated.View
        entering={ZoomIn.duration(200)}
        style={{
          paddingVertical: 24,
          paddingHorizontal: 16,
          alignItems: "center",
        }}>
        <Image
          style={{ width: 100, height: 100, borderRadius: 8 }}
          source={{ uri: selectedCommunity?.logo }}
        />
        <Text bold style={{ fontSize: 22, paddingTop: 16 }}>
          {selectedCommunity?.name}
        </Text>
        <Text
          bold
          style={{
            textAlign: "center",
            fontSize: 14,
            paddingTop: 0,
            paddingBottom: 16,
            color: colors?.textLight,
            lineHeight: 24,
            fontFamily: null,
          }}>
          {selectedCommunity?.description}
        </Text>
        <Text
          bold
          style={{
            textAlign: "center",
            fontFamily: "poppins",
            fontSize: 14,
            paddingTop: 0,
            color: colors?.textDark,
          }}>
          {`Total Members - ${selectedCommunity?.totalMembers}`}
        </Text>
      </Animated.View>
      <Check ifPresent={showExtraInfo}>
        <Spacer />
        <TitleRow
          size={16}
          title="GeetMala (गीतमाला) - 110 songs"
          isNew
          onPress={() => {
            router.push("/geetmala/all");
          }}
        />
        <Spacer />

        <Animated.View
          entering={FadeInDown.duration(500)}
          style={{
            paddingHorizontal: 16,
            paddingVertical: 16,
            alignItems: "center",
          }}>
          <Title size={15}>Founding President & Secretary 2023-24</Title>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
            }}>
            <MemberTile
              id={president?.id}
              profilePicture={president?.profilePicture}
              name={president?.name}
              role={president?.role}
            />
            <MemberTile
              id={secretary?.id}
              profilePicture={secretary?.profilePicture}
              name={secretary?.name}
              role={secretary?.role}
            />
          </View>
        </Animated.View>

        <Spacer />
        <Animated.View
          entering={FadeInDown.duration(500)}
          style={{
            paddingHorizontal: 16,
            paddingVertical: 16,
            alignItems: "center",
          }}>
          <Title size={15}>Founding Coordinators</Title>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              paddingHorizontal: 8,
            }}>
            <MemberTile
              id={coordinators[0]?.id}
              size={100}
              profilePicture={coordinators[0]?.profilePicture}
              name={coordinators[0]?.name}
              role={coordinators[0]?.role}
            />
            <MemberTile
              id={coordinators[1]?.id}
              size={100}
              profilePicture={coordinators[1]?.profilePicture}
              name={coordinators[1]?.name}
              role={coordinators[1]?.role}
            />
            <MemberTile
              id={coordinators[2]?.id}
              size={100}
              profilePicture={coordinators[2]?.profilePicture}
              name={coordinators[2]?.name}
              role={coordinators[2]?.role}
            />
          </View>
        </Animated.View>
      </Check>
    </ScrollView>
  );
};

export default CommunityDetailsScreen;
