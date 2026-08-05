import { View, ScrollView } from "react-native";
import React from "react";
import { Button } from "src/ui/Button";
import { TrackedForm } from "src/ui/Form/components/TrackedForm";
import { includes, map } from "lodash";
import { useApi } from "src/api/useApi";
import { FIELD_TYPES, getElement } from "../screens/EditProfileScreen";
import { Text } from "src/ui/Text";
import { FormErrorMessage } from "src/ui/Form/components/FormErrorMessage";
import { getMemberDetails, searchUser } from "src/api/directoryApi";
import { useSelector } from "react-redux";
import { RootState } from "src/app/store";
import { Member } from "src/types/types";

type Props = {
  setIsFinalStep: (arg: boolean) => void;
  setPhoneNumber: (arg: string) => void;
  setIsUserPresentInAnotherCommunity: (arg: boolean) => void;
  setUser: (user: Member) => void;
};

const AddMemberInitiate = ({
  setIsFinalStep,
  setPhoneNumber,
  setIsUserPresentInAnotherCommunity,
  setUser,
}: Props) => {
  const { data, loading, request: getUserByNumber } = useApi(searchUser);
  const selectedCommunityId = useSelector(
    (state: RootState) => state?.community?.selectedCommunity
  )?.id;

  const { request: fetchMemberDetails } = useApi(getMemberDetails);

  const [error, setError] = React.useState(false);

  const onContinue = async (values) => {
    if (values?.phone?.trim()?.length !== 10) {
      setError(true);
      return;
    }
    setPhoneNumber(values?.phone);
    const val = await getUserByNumber(values?.phone);
    if (val?.data?.data?.count === 0) {
      setIsFinalStep(true);
      return;
    }
    const user = val?.data?.data?.rows?.[0];
    const communitiesUserIsAlreadyPartOf = map(user.communities, (c) => c?.id);

    const isUserAlreadyPresentInSelectedCommunity = includes(
      communitiesUserIsAlreadyPartOf,
      selectedCommunityId
    );
    if (isUserAlreadyPresentInSelectedCommunity) {
      setError(true);
    } else {
      setIsUserPresentInAnotherCommunity(true);
      setUser(user);
      setIsFinalStep(true);
    }
  };

  return (
    <TrackedForm
      formHookProps={{
        mode: "onChange",
      }}
      name="add-family-member"
      contentContainerStyle={{
        flex: 1,
      }}>
      {({ watch, handleSubmit, formState: { isValid } }) => {
        const FIELDS = [
          {
            id: "phone",
            visible: true,
            label: "Enter Phone",
            type: FIELD_TYPES?.Input,
            placeholder: "Enter phone number",
            extras: {
              keyboardType: "number-pad",
              rules: {
                required: true,
                maxLength: {
                  value: 10,
                  message: "Please enter 10 digit phone number",
                },
                minLength: {
                  value: 10,
                  message: "Please enter 10 digit phone number",
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
              nestedScrollEnabled={true}
              contentContainerStyle={{
                paddingHorizontal: 16,
                paddingVertical: 16,
                justifyContent: "space-between",
              }}>
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
              {error && !!watch("phone") ? (
                <>
                  <FormErrorMessage
                    error={`Phone number must be unique. Entered number already exist in this community with below details.`}
                  />
                  <Text
                    style={{
                      marginTop: 16,
                    }}>{`Name: ${data?.data?.rows?.[0]?.firstName}`}</Text>
                </>
              ) : null}
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
                disabled={!isValid}
                loading={loading}
                onPress={handleSubmit(onContinue)}
                title="Continue"
              />
            </View>
          </View>
        );
      }}
    </TrackedForm>
  );
};

export default AddMemberInitiate;
