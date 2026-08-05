import {
  View,
  ScrollView,
  TouchableOpacity,
  Linking,
  RefreshControl,
} from "react-native";
import React from "react";
import { useMemberDetails } from "src/modules/directory/hooks/useMemberDetails";
import Check from "src/ui/Check";
import { useTheme } from "src/ui";
import { BirthdayIcon, BloodDropIcon, CallIcon, WhatsappIcon } from "assets";
import { Button } from "src/ui/Button";
import moment from "moment";

import {
  getAge,
  getBloodGroupDisplay,
  getCapitalizedName,
  ifCurrentOpenedProfileIsRelative,
} from "src/utils/utils";
import MoreProfileInformation from "./MoreProfileInformation";
import { useDispatch, useSelector } from "react-redux";
import { isEmpty } from "lodash";
import NoDataComponent from "src/ui/NoDataComponent";
import MemberImage from "src/ui/MemberImage";
import { Text } from "src/ui/Text";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import DeleteAccount from "./DeleteAccount";
import { setProfileMeta } from "src/modules/profile/redux/profileSlice";
import { useProfileExtraInfo } from "src/modules/profile/utils";
import * as Application from "expo-application";
import { Relative } from "src/types/types";
import Tag from "./Tag";
import FamilyMemberDetails from "./FamilyMemberDetails";
import Box from "src/ui/Box";
import { RootState } from "src/app/store";
import { useLogout } from "src/modules/authentication/hooks/useLogout";

export const sortedRelatives = (relatives: Relative[]) => {
  if (isEmpty(relatives)) return [];
  if (relatives?.length <= 1) return relatives;
  var relativesCopy = [...relatives];
  const RelativeOrder = [
    "Father",
    "Mother",
    "Husband",
    "Wife",
    "Son",
    "Daughter",
    "Brother",
    "Sister",
  ];

  relativesCopy?.sort((r1, r2) => {
    const type1 = r1?.relationship?.type;
    const type2 = r2?.relationship?.type;

    if (type1 === type2) return 0;

    for (var i = 0; i < RelativeOrder?.length; i++) {
      const o = RelativeOrder[i];
      if (type1 === o) {
        return -11;
      }
      if (type2 === o) {
        return 1;
      }
    }
  });

  return relativesCopy;
};

const Profile = ({ setFetchAgain }) => {
  const memberDetailsObject = useMemberDetails();
  const memberDetails = memberDetailsObject?.memberDetails;
  const noOfFamilyMembers = memberDetails?.relatives?.length || 0;
  const [showCTA, setShowCTA] = React.useState(!!noOfFamilyMembers);
  const [selectedIndex, setIndex] = React.useState(0);
  const { clearReduxState } = useLogout();
  const { isSelfProfile, isSuperAdmin, isFamilyHead } =
    useProfileExtraInfo(memberDetails);

  const { colors } = useTheme();
  const router = useRouter();

  const isFamilyMember = ifCurrentOpenedProfileIsRelative(memberDetails);
  const [refreshing, setRefreshing] = React.useState(false);

  const showEditProfileButton = isSelfProfile || isFamilyMember || isSuperAdmin;
  const dispatch = useDispatch();
  const shouldShowDeleteAccountButton = isSuperAdmin;
  const shouldShowAppVersion = isSelfProfile;
  const showAddFamilyMemberButton = isSelfProfile || isSuperAdmin;
  React.useEffect(() => {
    setShowCTA(!!noOfFamilyMembers);
  }, [noOfFamilyMembers]);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setFetchAgain(true);
    setRefreshing(false);
  }, []);

  const pushToken = useSelector((state: RootState) => state?.auth?.pushToken);
  const shouldShowPushToken = pushToken && isSelfProfile;

  if (isEmpty(memberDetails)) {
    return <NoDataComponent />;
  }

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={{ paddingBottom: 100 }}
        style={{
          flex: 1,
          backgroundColor: "rgb(231, 240, 244)",
          paddingBottom: 44,
        }}>
        <View
          style={{
            paddingHorizontal: 8,
            backgroundColor: "white",
            paddingVertical: 20,
            borderBottomColor: "rgb(220,220,220)",
            borderBottomWidth: 1,
          }}>
          <View
            style={{
              flexDirection: "row",
              marginTop: 0,
            }}>
            <MemberImage
              url={memberDetails?.profilePicture}
              initials={[memberDetails?.firstName, memberDetails?.lastName]}
            />
            <View style={{ flex: 1, paddingLeft: 8 }}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Text
                    bold
                    style={{
                      fontSize: 15,
                    }}>
                    {getCapitalizedName(memberDetails)}
                  </Text>
                  <Check ifPresent={memberDetails?.dob}>
                    <View
                      style={{
                        width: 4,
                        height: 4,
                        borderRadius: 8,
                        backgroundColor: "rgb(153,153,153)",
                        marginHorizontal: 4,
                      }}
                    />
                    <Text style={{ fontSize: 10 }}>
                      {`${getAge(memberDetails?.dob)}yr`}
                    </Text>
                  </Check>
                </View>
                <Check ifPresent={isFamilyHead}>
                  <Tag text="Family Head"></Tag>
                </Check>
              </View>
              <Check ifPresent={memberDetails?.guardianName}>
                <Text
                  style={{
                    marginTop: 2,
                    fontSize: 14,
                    fontFamily: "poppins",
                    paddingTop: 2,
                  }}>{`${memberDetails?.guardianName}`}</Text>
              </Check>
              <Check ifPresent={memberDetails?.phone}>
                <Text
                  style={{
                    fontSize: 14,
                    color: colors.textLight,

                    fontFamily: "poppins",
                  }}>
                  {memberDetails?.phone}
                </Text>
              </Check>

              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginTop: 8,
                }}>
                <Check ifPresent={memberDetails?.phone}>
                  <View style={{ flexDirection: "row" }}>
                    <TouchableOpacity
                      style={{
                        marginRight: 8,
                      }}
                      onPress={() => {
                        Linking.openURL(`tel:+91${memberDetails?.phone}`);
                      }}>
                      <CallIcon width={32} height={32} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => {
                        Linking.openURL(
                          `https://wa.me/${memberDetails?.phone}`
                        );
                      }}>
                      <WhatsappIcon width={32} height={32} />
                    </TouchableOpacity>
                  </View>
                </Check>
                <Check ifPresent={showEditProfileButton}>
                  <Button
                    size="md"
                    style={{ borderRadius: 8, height: 36 }}
                    title="Edit Profile"
                    onPress={() => {
                      setTimeout(() => {
                        dispatch(
                          setProfileMeta({ currentOpenedUser: memberDetails })
                        );
                        router.push("/editprofile");
                      }, 0);
                    }}
                  />
                </Check>
              </View>
            </View>
          </View>
          <View
            style={{
              marginTop: 16,
              flexDirection: "row",
              backgroundColor: "white",
            }}>
            <Check ifPresent={memberDetails?.dob}>
              <View
                style={{
                  flex: 1,
                  padding: 16,
                  backgroundColor: "#EFFFF1",
                  borderRadius: 8,
                  alignItems: "center",
                  marginRight: 16,
                }}>
                <Text
                  style={{
                    fontSize: 12,
                    marginBottom: 4,
                    color: colors.textLight,
                  }}>
                  Date of Birth
                </Text>
                <BirthdayIcon />
                <Text
                  bold
                  style={{ fontSize: 16, fontWeight: "500", marginTop: 4 }}>
                  {moment(new Date(memberDetails?.dob)).format("DD-MMM-YYYY")}
                </Text>
              </View>
            </Check>

            <View
              style={{
                flex: 1,
                padding: 16,
                backgroundColor: "#FFF3F3",
                borderRadius: 8,
                alignItems: "center",
              }}>
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "500",
                  marginBottom: 4,
                  color: colors.textLight,
                }}>
                Blood Group
              </Text>
              <BloodDropIcon width={20} height={24} />
              <Text
                bold
                style={{ fontSize: 16, fontWeight: "500", marginTop: 4 }}>
                {getBloodGroupDisplay(memberDetails?.bloodGroup)}
              </Text>
            </View>
          </View>
          <Check ifPresent={showCTA}>
            <Button
              onPress={() => setShowCTA(false)}
              style={{ marginTop: 24 }}
              title="Show Complete Profile"
              icon={
                <Ionicons name={"chevron-down"} size={14} color={"white"} />
              }
            />
          </Check>
        </View>
        <Check ifPresent={!showCTA}>
          <MoreProfileInformation
            selectedIndex={selectedIndex}
            setIndex={setIndex}
          />
        </Check>

        <FamilyMemberDetails
          memberDetails={memberDetails}
          showAddFamilyMemberButton={showAddFamilyMemberButton}
        />
        <Check ifPresent={isSelfProfile}>
          <Box>
            <TouchableOpacity onPress={clearReduxState}>
              <Text style={{ paddingHorizontal: 16, paddingTop: 4 }}>
                Clear Storage
              </Text>
            </TouchableOpacity>
          </Box>
        </Check>

        <Check ifPresent={shouldShowAppVersion}>
          <Box style={{ paddingHorizontal: 16 }}>
            <Text
              style={{}}>{`App Version - ${Application?.nativeApplicationVersion}`}</Text>
          </Box>
        </Check>

        <Check ifPresent={shouldShowDeleteAccountButton}>
          <DeleteAccount memberDetails={memberDetails} />
        </Check>
      </ScrollView>
    </View>
  );
};

export default Profile;
