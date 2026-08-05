import { View, ScrollView } from "react-native";
import React from "react";
import { Button } from "src/ui/Button";
import { TrackedForm } from "src/ui/Form/components/TrackedForm";
import { map } from "lodash";
import { BloodGroups, Gender } from "src/utils/constants";
import {
  getBloodGroupDisplay,
  getGenderDisplay,
  getStringAfterRemovingSpace,
} from "src/utils/utils";
import { FIELD_TYPES, getElement } from "../screens/EditProfileScreen";
import { useApi } from "src/api/useApi";
import { addToCommunity, createUser } from "src/api/directoryApi";
import { FormLabel } from "src/ui";
import { Text } from "src/ui/Text";
import { useSelector } from "react-redux";
import { RootState } from "src/app/store";
import { useNavigation } from "expo-router";
import { Member } from "src/types/types";
import AddUserToExistingCommunity from "./AddUserToExistingCommunity";

type Props = {
  phone: string;
  isUserPresentInAnotherCommunity?: boolean;
  user?: Member;
};

const AddMemberComplete = ({
  phone,
  isUserPresentInAnotherCommunity,
  user,
}: Props) => {
  const communityId = useSelector(
    (state: RootState) => state?.community?.selectedCommunity?.id
  );
  const navigation = useNavigation();

  const { request: createUserApi } = useApi(createUser);
  const { request: addToCommunityApi } = useApi(addToCommunity);

  const [creatingUser, setCreatingUser] = React.useState(false);

  const onAddMember = async (values) => {
    setCreatingUser(true);
    const input = {
      firstName: values?.firstName,
      lastName: values?.lastName,
      fullName: getStringAfterRemovingSpace(
        `${values?.firstName}${values?.lastName}`
      ),
      isAccountManager: true,
      guardianName: values?.guardianName,
      gender: values?.gender,
      bloodGroup: values?.bloodGroup,
      phone,
      
      parent: null,
      address: {
        city: "Udaipur",
        state: "Rajasthan",
      },
    };

    const { data } = await createUserApi(input);
    const userId = data?.id;

    await addToCommunityApi(communityId, userId);

    setCreatingUser(false);
    navigation?.goBack();
  };

  if (isUserPresentInAnotherCommunity) {
    return (
      <AddUserToExistingCommunity
        user={user as Member}
        communityId={communityId as string}
      />
    );
  }

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
              <FormLabel label="Phone Number" />
              <Text style={{ paddingBottom: 12 }}>{phone}</Text>
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
                onPress={handleSubmit(onAddMember)}
                title="Add Member"
                disabled={!isValid}
              />
            </View>
          </View>
        );
      }}
    </TrackedForm>
  );
};

export default AddMemberComplete;
