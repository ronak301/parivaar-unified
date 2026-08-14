import { View, ScrollView, Alert } from "react-native";
import React from "react";
import { useNavigation } from "expo-router";
import { Button } from "src/ui/Button";
import { FormInput, FormSelect, useTheme } from "src/ui";
import { TrackedForm } from "src/ui/Form/components/TrackedForm";
import { map } from "lodash";
import {
  BloodGroups,
  BusinessTypes,
  Gender,
  Localities,
} from "src/utils/constants";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "src/app/store";
import {
  getBloodGroupDisplay,
  getBusinessTypeDisplay,
  getGenderDisplay,
  getLocalityDisplay,
  getStringAfterRemovingSpace,
  sortByKey,
} from "src/utils/utils";
import { useApi } from "src/api/useApi";
import { updateUser } from "src/api/authApi";
import EditProfileImage from "../components/EditProfileImage";
import { setProfileMeta } from "../redux/profileSlice";
import {
  createBusiness,
  getMemberDetails,
  updateAddress,
  updateBusiness,
} from "src/api/directoryApi";
import { Text } from "src/ui/Text";
import FormDatePicker from "src/ui/Form/components/FormDatePicker";
import * as Sentry from "sentry-expo";
import { useProfileExtraInfo } from "../utils";

export const FIELD_TYPES = {
  Input: "Input",
  Select: "Select",
  Date: "Date",
  Spacer: "spacer",
};

const Spacer = ({ title }) => {
  return (
    <View
      style={{
        marginHorizontal: -16,
      }}>
      <View
        style={{ backgroundColor: "rgb(231, 240, 244)", height: 16 }}></View>
      <Text
        bold
        style={{
          borderTopColor: "rgb(235,235,249)",
          borderTopWidth: 1,
          fontSize: 22,
          paddingHorizontal: 16,
          paddingTop: 16,
          paddingBottom: 16,
        }}>
        {title}
      </Text>
    </View>
  );
};

export const getElement = (type) => {
  switch (type) {
    case FIELD_TYPES?.Input:
      return FormInput;
    case FIELD_TYPES?.Select:
      return FormSelect;
    case FIELD_TYPES?.Date:
      return FormDatePicker;
    case FIELD_TYPES?.Spacer:
      return Spacer;
    default:
      return <View />;
  }
};

const EditProfileScreen = () => {
  const navigation = useNavigation();

  const { currentOpenedUser } = useSelector(
    (state: RootState) => state?.profile?.meta
  );

  const dispatch = useDispatch();
  const { request: fetchMemberDetails } = useApi(getMemberDetails);

  const [image, setImage] = React.useState(currentOpenedUser?.profilePicture);
  const [imagePath] = React.useState(`/user/ + ${new Date()}`);
  const [uploading, setUploading] = React.useState(false);

  const { request: updateUserProfile } = useApi(updateUser);
  const { request: updateUserAddress } = useApi(updateAddress);
  const { request: updateUserBusiness } = useApi(updateBusiness);
  const { request: createUserBusiness } = useApi(createBusiness);

  const [updatingUser, setUpdatingUser] = React.useState(false);

  const shouldUpdateAddress = (values) => {
    if (
      values?.fullAddress !== currentOpenedUser?.address?.fullAddress ||
      values?.locality !== currentOpenedUser?.address?.locality ||
      values?.city !== currentOpenedUser?.address?.city ||
      values?.state !== currentOpenedUser?.address?.state
    ) {
      return true;
    }
    return false;
  };

  const shouldUpdateBusiness = (values) => {
    if (
      values?.businessName !== currentOpenedUser?.business?.name ||
      values?.businessType !== currentOpenedUser?.business?.type ||
      values?.businessDescription !==
        currentOpenedUser?.business?.description ||
      values?.businessAddress !== currentOpenedUser?.business?.address ||
      values?.businessWebsite !== currentOpenedUser?.business?.website
    ) {
      return true;
    }
    return false;
  };

  const onSave = async (values) => {
    setUpdatingUser(true);
    const input = {
      firstName: values?.firstName,
      lastName: values?.lastName,
      fullName: getStringAfterRemovingSpace(
        `${values?.firstName}${values?.lastName}`
      ),
      email: values?.email,
      guardianName: values?.guardianName,
      education: values?.education,
      nativePlace: values?.nativePlace,
      profilePicture: image,
      imagePath,
      dob: values?.dob,
      gender: values?.gender,
      weddingDate: values?.weddingDate,
      bloodGroup: values?.bloodGroup,
      phone: values?.phone,
    };

    const addressInput = {
      fullAddress: values?.fullAddress,
      locality: values?.locality,
      city: values?.city,
      state: values?.state,
    };

    const businessInput = {
      name: values?.businessName,
      type: values?.businessType,
      description: values?.businessDescription,
      website: values?.businessWebsite,
      address: values?.businessAddress,
    };

    try {
      const res = await updateUserProfile(currentOpenedUser?.id, input);

      if (!res?.data) {
        Alert.alert(
          "User Updation Failed",
          "Phone number must be unique and should not belong to any other user"
        );
        setUpdatingUser(false);
        navigation?.goBack();
        return;
      }
      if (shouldUpdateAddress(values)) {
        await updateUserAddress(currentOpenedUser?.address?.id, addressInput);
      }

      if (shouldUpdateBusiness(values)) {
        if (currentOpenedUser?.business?.id) {
          await updateUserBusiness(
            currentOpenedUser?.business?.id,
            businessInput
          );
        } else {
          await createUserBusiness({
            ownerId: currentOpenedUser?.id,
            ...businessInput,
          });
        }
      }

      const { data } = await fetchMemberDetails(currentOpenedUser?.id);
      dispatch(
        setProfileMeta({
          currentOpenedUser: data?.data,
          shouldUpdateUser: true,
          shouldUpdateUserId: currentOpenedUser?.id,
        })
      );
      setUpdatingUser(false);
      navigation?.goBack();
    } catch (err) {
      Sentry.Native.withScope((scope) => {
        scope.setExtra("err", err);
        Sentry.Native.captureMessage("Error occurred while updatinf profile");
      });
      Alert.alert("User Update Failed");
      setUpdatingUser(false);
      navigation?.goBack();
    }
  };

  const isFamilyHead = useProfileExtraInfo(currentOpenedUser);

  return (
    <TrackedForm
      formHookProps={{
        mode: "onChange",
        defaultValues: {
          firstName: currentOpenedUser?.firstName,
          lastName: currentOpenedUser?.lastName,
          bloodGroup: currentOpenedUser?.bloodGroup,
          education: currentOpenedUser?.education,
          phone: currentOpenedUser?.phone,
          guardianName: currentOpenedUser?.guardianName,
          nativePlace: currentOpenedUser?.nativePlace,
          email: currentOpenedUser?.email || null,
          fullAddress: currentOpenedUser?.address?.fullAddress,
          locality: currentOpenedUser?.address?.locality,
          city: currentOpenedUser?.address?.city,
          state: currentOpenedUser?.address?.state,
          dob: currentOpenedUser?.dob,
          weddingDate: currentOpenedUser?.weddingDate,
          gender: currentOpenedUser?.gender,
          businessName: currentOpenedUser?.business?.name,
          businessType: currentOpenedUser?.business?.type,
          businessDescription: currentOpenedUser?.business?.description,
          businessAddress: currentOpenedUser?.business?.address,
          businessWebsite: currentOpenedUser?.business?.website,
        },
      }}
      name="editprofile"
      contentContainerStyle={{
        flex: 1,
      }}>
      {({ watch, handleSubmit, formState: { isValid } }) => {
        const FIELDS = [
          {
            type: "spacer",
            extras: {
              title: "Personal Info",
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
            id: "phone",
            visible: true,
            label: "Phone Number",
            type: FIELD_TYPES?.Input,
            placeholder: "Enter phone number",
            extras: {
              rules: {
                required: !currentOpenedUser?.parent,
                maxLength: {
                  value: 10,
                  message: "Please enter 10 digit phone number",
                },
              },
            },
          },
          {
            id: "dob",
            visible: true,
            label: "Date of Birth",
            type: FIELD_TYPES?.Date,
            placeholder: "Select date of birth",
            extras: {},
          },
          {
            id: "guardianName",
            visible: true,
            label: "Guardian Name (Pita / Pati)",
            type: FIELD_TYPES?.Input,
            placeholder: "Enter Guardian Name",
            extras: {
              rules: {
                required: false,
                maxLength: {
                  value: 50,
                  message: "Please enter gaurdian less than 50 characters",
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
          {
            id: "education",
            visible: true,
            label: "Education",
            type: FIELD_TYPES?.Input,
            placeholder: "Enter Education",
            extras: {
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
            id: "weddingDate",
            visible: true,
            label: "Wedding Date",
            type: FIELD_TYPES?.Date,
            placeholder: "Select wedding date",
            extras: {},
          },
          {
            id: "nativePlace",
            visible: !!isFamilyHead,
            label: "Native Place (मूल निवास)",
            type: FIELD_TYPES?.Input,
            placeholder: "Enter Native Place",
            extras: {
              rules: {
                required: false,
                maxLength: {
                  value: 30,
                  message: "Please enter native place less than 30 characters",
                },
              },
            },
          },
          {
            id: "email",
            visible: true,
            label: "Email",
            type: FIELD_TYPES?.Input,
            placeholder: "Enter email",
            extras: {
              rules: {
                required: false,
                maxLength: {
                  value: 200,
                  message: "Please enter email less than 200 characters",
                },
              },
            },
          },
          {
            type: "spacer",
            extras: {
              title: "Address",
            },
          },
          {
            id: "fullAddress",
            visible: true,
            label: "Residence Address",
            type: FIELD_TYPES?.Input,
            placeholder: "Enter Residence Address",
            extras: {
              multiline: true,
              maxHeight: 200,
              minHeight: 80,
              paddingTop: 8,
              rules: {
                required: false,
                maxLength: {
                  value: 300,
                  message: "Please enter address less than 300 characters",
                },
              },
            },
          },
          {
            id: "locality",
            visible: true,
            label: "Locality",
            type: FIELD_TYPES?.Select,
            placeholder: "Select Locality",
            extras: {
              rules: {
                required: false,
              },
              items: sortByKey(Localities, "id"),
              value: getLocalityDisplay(watch("locality")),
            },
          },

          {
            id: "city",
            label: "City",
            type: FIELD_TYPES?.Input,
            placeholder: "Enter City",
            extras: {
              editable: false,
              rules: {
                required: false,
              },
            },
          },
          {
            id: "state",
            label: "State",
            type: FIELD_TYPES?.Input,
            placeholder: "State",
            extras: {
              editable: false,
              rules: {
                required: false,
                editable: false,
              },
            },
          },
          {
            type: "spacer",
            extras: {
              title: "Business Details",
            },
          },
          {
            id: "businessName",
            visible: true,
            label: "Business Name",
            type: FIELD_TYPES?.Input,
            placeholder: "Enter business name",
            extras: {
              rules: {
                required: false,
                maxLength: {
                  value: 30,
                  message: "Please enter business name less than 30 characters",
                },
              },
            },
          },
          {
            id: "businessType",
            visible: true,
            label: "Business Type",
            type: FIELD_TYPES?.Select,
            placeholder: "Select Business Type",
            extras: {
              rules: {
                required: false,
              },
              items: sortByKey(BusinessTypes, "id"),
              value: getBusinessTypeDisplay(watch("businessType")),
            },
          },
          {
            id: "businessDescription",
            visible: true,
            label: "Business Description",
            type: FIELD_TYPES?.Input,
            placeholder: "Enter business description",
            extras: {
              multiline: true,
              maxHeight: 200,
              minHeight: 80,
              paddingTop: 8,
              rules: {
                required: false,
                maxLength: {
                  value: 200,
                  message:
                    "Please enter business description less than 200 characters",
                },
              },
            },
          },
          {
            id: "businessAddress",
            visible: true,
            label: "Business Address",
            type: FIELD_TYPES?.Input,
            placeholder: "Enter business address",
            extras: {
              rules: {
                required: false,
                maxLength: {
                  value: 200,
                  message:
                    "Please enter business address less than 200 characters",
                },
              },
            },
          },
          {
            id: "businessWebsite",
            visible: true,
            label: "Business Website",
            type: FIELD_TYPES?.Input,
            placeholder: "Enter business website",
            extras: {
              rules: {
                required: false,
                maxLength: {
                  value: 30,
                  message:
                    "Please enter business website less than 30 characters",
                },
              },
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
              <EditProfileImage
                key={currentOpenedUser?.id}
                image={image}
                setImage={setImage}
                imagePath={imagePath}
                uploading={uploading}
                setUploading={setUploading}
              />

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
                loading={updatingUser}
                onPress={handleSubmit(onSave)}
                title="Save Changes"
                disabled={updatingUser || uploading}
              />
            </View>
          </View>
        );
      }}
    </TrackedForm>
  );
};

export default EditProfileScreen;
