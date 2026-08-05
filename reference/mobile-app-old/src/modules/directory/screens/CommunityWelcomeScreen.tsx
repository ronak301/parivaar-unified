import { ScrollView, View } from "react-native";
import React from "react";
import { BackButton, Button } from "src/ui/Button";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { Text } from "src/ui/Text";
import { Title } from "./CommunityDetailsScreen/CommunityDetailsScreen";
import MemberTile from "./CommunityDetailsScreen/components/MemberTile";
import { Image } from "expo-image";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "src/app/store";
import { useApi } from "src/api/useApi";
import { getMemberDetails } from "src/api/directoryApi";
import TextTile from "./CommunityDetailsScreen/components/TextTile";

const CommunityWelcomeScreen = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const currentUser = useSelector(
    (state: RootState) => state?.auth?.currentUser
  );

  const { request: getMemberDetailsApi } = useApi(getMemberDetails);

  const dispatch = useDispatch();
  const navigation = useNavigation();

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => <BackButton appearance="light" />,
      title: `जय जिनेन्द्र`,
    });
  }, [currentUser]);

  const president = {
    id: "1f39c54c-4a9f-4485-bea6-91e91126858c",
    name: "Arjun lal Khokhawat",
    profilePicture: require("assets/arjunji.jpeg"),
    role: "President",
    number: "9353502843",
  };
  const secretary = {
    id: "b8e3545c-8e19-4574-9c5f-f32be8120121",
    name: "Vinod Kachhara",
    profilePicture: require("assets/vinodji.jpeg"),
    role: "Secretary",
    number: "9414232279",
  };

  const coordinators = [
    {
      id: "9a095f36-7096-4653-bcb7-5e54ad360038",
      name: "Abhishek Pokharna",
      profilePicture: require("assets/abhishekji.jpeg"),
      role: "Coordinator",
      number: "9829074922",
    },
    {
      id: "3d102aa6-163e-42e4-af2f-1168c4753b93",
      name: "Ronak Kothari",
      profilePicture: require("assets/ronakji.jpeg"),
      role: "Coordinator",
      number: "7042770304",
    },
    {
      id: "30a5ef92-86a5-47f9-8689-545e8b3a7b4c",
      name: "Abhay Kothari",
      profilePicture: require("assets/abhayji.jpeg"),
      role: "Coordinator",
      number: "9649354356",
    },
  ];

  return (
    <ScrollView
      contentContainerStyle={{ paddingBottom: 142 }}
      style={{
        paddingHorizontal: 16,
        paddingVertical: 8,
      }}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
        }}>
        <Text
          bold
          style={{
            fontSize: 10,
            paddingBottom: 8,
          }}>
          जय भिक्षु
        </Text>
        <Text
          bold
          style={{
            fontSize: 10,
            paddingBottom: 8,
          }}>
          जय महाश्रमण
        </Text>
      </View>
      <View
        style={{
          flex: 1,
          flexDirection: "row",
          justifyContent: "space-between",
          marginBottom: 16,
          alignItems: "center",
        }}>
        <Image
          source={require("assets/marasa.jpg")}
          style={{
            resizeMode: "cover",
            width: 50,
            height: 50,
            borderRadius: 999,
          }}
        />
        <View style={{ paddingHorizontal: 16 }}>
          <Text
            bold
            style={{
              paddingTop: 4,
              textAlign: "center",
              fontWeight: "700",
              fontFamily: null,
              fontSize: 18,
            }}>{`तेरापंथ उदयपुर मोबाइल एप`}</Text>
          <Text
            style={{
              paddingTop: 4,
              textAlign: "center",
              fontWeight: "400",
              fontFamily: null,
              fontSize: 16,
            }}>{`पर आपका हार्दिक स्वागत है।`}</Text>
        </View>
        <Image
          source={require("assets/marasa.jpg")}
          style={{
            resizeMode: "cover",
            width: 50,
            height: 50,

            borderRadius: 999,
          }}
        />
      </View>

      <TextTile>
        <>
          <Text
            bold
            style={{
              color: "white",
              textAlign: "center",
              fontWeight: "700",
              fontFamily: null,
              fontSize: 20,
            }}>{`Digital Directory`}</Text>
          <Text
            bold
            style={{
              color: "white",
              paddingTop: 8,
              textAlign: "center",
              fontWeight: "500",
              fontSize: 18,
            }}>{`श्री जैन श्वेताम्बर तेरापंथी सभा, उदयपुर`}</Text>
        </>
      </TextTile>

      <Text
        style={{
          marginTop: 16,
          textAlign: "center",
          fontWeight: "700",
          fontFamily: null,
          fontSize: 16,
        }}>
        Sponsored by
      </Text>
      <TextTile>
        <Text
          style={{
            color: "white",
            textAlign: "center",
            fontWeight: "700",
            fontFamily: null,
            fontSize: 16,
          }}>
          Shri Mangi lal Ji, Pradeep Ji, Sunil Ji Lunawat & Family
        </Text>
      </TextTile>

      <View
        style={{
          paddingHorizontal: 16,
          paddingVertical: 16,
          alignItems: "center",
        }}>
        <Title size={15}>Founding President & Secretary 2022-24</Title>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
          }}>
          <MemberTile
            profilePicture={president?.profilePicture}
            name={president?.name}
            role={president?.role}
            number={president?.number}
          />
          <MemberTile
            profilePicture={secretary?.profilePicture}
            name={secretary?.name}
            role={secretary?.role}
            number={secretary?.number}
          />
        </View>
      </View>

      <View
        style={{
          marginTop: 0,
          paddingHorizontal: 16,

          alignItems: "center",
        }}>
        <Title size={14}>Founding Coordinators</Title>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            paddingHorizontal: 0,
          }}>
          <MemberTile
            size={100}
            profilePicture={coordinators[0]?.profilePicture}
            name={coordinators[0]?.name}
            role={coordinators[0]?.role}
            number={coordinators[0]?.number}
          />
          <MemberTile
            size={100}
            profilePicture={coordinators[1]?.profilePicture}
            name={coordinators[1]?.name}
            role={coordinators[1]?.role}
            number={coordinators[1]?.number}
          />
          <MemberTile
            size={100}
            profilePicture={coordinators[2]?.profilePicture}
            name={coordinators[2]?.name}
            role={coordinators[2]?.role}
            number={coordinators[2]?.number}
          />
        </View>
      </View>

      <Button
        style={{ marginTop: 16 }}
        onPress={() => {
          router.push({
            pathname: `/(authenticated)/community/${id}`,
          });
        }}
        title="Continue to Directory"
      />
    </ScrollView>
  );
};

export default CommunityWelcomeScreen;
