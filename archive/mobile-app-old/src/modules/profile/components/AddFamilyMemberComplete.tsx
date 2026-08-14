import { View, ScrollView } from "react-native";
import React from "react";
import { Button } from "src/ui/Button";
import { TrackedForm } from "src/ui/Form/components/TrackedForm";
import { isEmpty, map } from "lodash";
import {
  BloodGroups,
  FamilyMemberRelationshipTypes,
  Gender,
} from "src/utils/constants";
import {
  getBloodGroupDisplay,
  getFamilyRelationTypeDisplay,
  getGenderDisplay,
  getStringAfterRemovingSpace,
} from "src/utils/utils";
import { FIELD_TYPES, getElement } from "../screens/EditProfileScreen";
import { useApi } from "src/api/useApi";
import {
  addToCommunity,
  createRelation,
  createUser,
  getMemberDetails,
} from "src/api/directoryApi";
import { FormLabel, useTheme } from "src/ui";
import { Text } from "src/ui/Text";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "src/app/store";
import { useNavigation } from "expo-router";
import { setProfileMeta } from "../redux/profileSlice";
import { Alert } from "react-native";
import * as Sentry from "sentry-expo";

const AddFamilyMemberComplete = ({ user, phone }) => {
  const userId = user?.id;
  const communityId = useSelector(
    (state: RootState) => state?.community?.selectedCommunity?.id
  );
  const navigation = useNavigation();

  const { currentOpenedUser } = useSelector(
    (state: RootState) => state?.profile?.meta
  );
  const { request: createUserApi } = useApi(createUser);
  const { request: addToCommunityApi } = useApi(addToCommunity);
  const { request: createRelationApi } = useApi(createRelation);

  const [creatingUser, setCreatingUser] = React.useState(false);
  const { request: fetchMemberDetails } = useApi(getMemberDetails);

  const dispatch = useDispatch();

  const onAddFamilyMember = async (values) => {
    setCreatingUser(true);

    const input = {
      firstName: values?.firstName,
      lastName: values?.lastName,
      fullName: getStringAfterRemovingSpace(
        `${values?.firstName}${values?.lastName}`
      ),
      isAccountManager: false,
      parentNode: user?.id,
      rootNode: user?.root?.id,
      guardianName: values?.guardianName,
      education: values?.education,
      bloodGroup: values?.bloodGroup,
      ...(!isEmpty(phone) && { phone }),
      gender: values?.gender,
      nativePlace: currentOpenedUser?.nativePlace,
      address: {
        fullAddress: currentOpenedUser?.address?.fullAddress,
        locality: currentOpenedUser?.address?.locality,
        city: "Udaipur",
        state: "Rajasthan",
      },
    };

    const { data } = await createUserApi(input);
    const relativeId = data?.id;

    try {
      await addToCommunityApi(communityId, relativeId);
      await createRelationApi(userId, relativeId, values?.relation);

      const { data: updatedUser } = await fetchMemberDetails(
        currentOpenedUser?.id
      );

      dispatch(
        setProfileMeta({
          currentOpenedUser: updatedUser?.data,
          shouldUpdateUser: true,
          shouldUpdateUserId: currentOpenedUser?.id,
        })
      );

      setCreatingUser(false);
      navigation?.goBack();
    } catch (err) {
      Sentry.Native.withScope((scope) => {
        scope.setExtra("err", err);
        Sentry.Native.captureMessage(
          "Error occurred while adding family member"
        );
      });
      setCreatingUser(false);
      Alert.alert("Error adding family member");
      navigation?.goBack();
    }
  };

  React.useEffect(() => {}, []);

  const { colors } = useTheme();

  return (
    <TrackedForm
      formHookProps={{
        mode: "onChange",
      }}
      name="editprofile"
      contentContainerStyle={{
        flex: 1,
      }}>
      {({ watch, handleSubmit, formState: { isValid } }) => {
        const FIELDS = [
          {
            id: "relation",
            visible: true,
            label: "Relation",
            type: FIELD_TYPES?.Select,
            placeholder: `Select Relation with ${user?.firstName}`,
            extras: {
              rules: {
                required: true,
              },
              items: FamilyMemberRelationshipTypes,
              value: getFamilyRelationTypeDisplay(watch("relation")),
            },
          },
          {
            id: "firstName",
            visible: true,
            label: "First Name",
            type: FIELD_TYPES?.Input,
            placeholder: "Enter first name",
            extras: {
              rules: {
                required: true,
                maxLength: {
                  value: 30,
                  message: "Please enter first name less than 30 characters",
                },
              },
            },
          },
          {
            id: "lastName",
            visible: true,
            label: "Last Name",
            type: FIELD_TYPES?.Input,
            placeholder: "Enter last name",
            extras: {
              rules: {
                required: true,
                maxLength: {
                  value: 30,
                  message: "Please enter last name less than 30 characters",
                },
              },
            },
          },
          {
            id: "guardianName",
            visible: true,
            label: "Guardian Name",
            type: FIELD_TYPES?.Input,
            placeholder: "Enter Guardian Name",
            extras: {
              rules: {
                required: false,
                maxLength: {
                  value: 30,
                  message: "Please enter gaurdian less than 30 characters",
                },
              },
            },
          },
          {
            id: "education",
            visible: true,
            label: "Education",
            type: FIELD_TYPES?.Input,
            placeholder: "Enter Education",
            extras: {
              multiline: true,
              maxHeight: 200,
              rules: {
                required: false,
                maxLength: {
                  value: 200,
                  message: "Please enter education less than 200 characters",
                },
              },
            },
          },
          {
            id: "bloodGroup",
            visible: true,
            label: "Blood Group",
            type: FIELD_TYPES?.Select,
            placeholder: "Select Blood Group",
            extras: {
              rules: {
                required: false,
              },
              items: BloodGroups,
              value: getBloodGroupDisplay(watch("bloodGroup")),
            },
          },
          {
            id: "gender",
            visible: true,
            label: "Gender",
            type: FIELD_TYPES?.Select,
            placeholder: "Select Gender",
            extras: {
              rules: {
                required: false,
              },
              items: Gender,
              value: getGenderDisplay(watch("gender")),
            },
          },
        ];
        return (
          <View
            style={{
              flex: 1,
              backgroundColor: "white",
            }}>
            <ScrollView
              style={{
                marginBottom: 98,
              }}
              nestedScrollEnabled={true}
              contentContainerStyle={{
                paddingHorizontal: 16,
                paddingVertical: 16,
                justifyContent: "space-between",
                paddingBottom: 98,
              }}>
              <Text
                style={{
                  color: colors?.darkBackground,
                  fontSize: 12,
                  paddingTop: 2,
                  paddingBottom: 12,
                }}>{`Adding Family Member for ${user?.firstName}`}</Text>
              <FormLabel label="Phone Number" />
              <Text style={{ paddingBottom: 12, paddingTop: 4 }}>{phone}</Text>
              {map(FIELDS, (field, index) => {
                const Element = getElement(field?.type);
                return (
                  <Element
                    key={index}
                    label={field?.label}
                    name={field?.id}
                    placeholder={field?.placeholder}
                    style={{ letterSpacing: 1, fontSize: 16 }}
                    {...field?.extras}
                  />
                );
              })}
            </ScrollView>
            <View
              style={{
                marginBottom: 0,
                position: "absolute",
                bottom: 32,
                left: 16,
                right: 16,
              }}>
              <Button
                loading={creatingUser}
                onPress={handleSubmit(onAddFamilyMember)}
                title="Add Family Member"
                disabled={!isValid}
              />
            </View>
          </View>
        );
      }}
    </TrackedForm>
  );
};

export default AddFamilyMemberComplete;
