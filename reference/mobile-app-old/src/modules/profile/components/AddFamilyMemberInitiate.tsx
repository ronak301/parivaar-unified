import { View, ScrollView } from "react-native";
import React from "react";
import { Button } from "src/ui/Button";
import { useTheme } from "src/ui";
import { TrackedForm } from "src/ui/Form/components/TrackedForm";
import { map } from "lodash";
import { useApi } from "src/api/useApi";
import { searchUser } from "src/api/directoryApi";
import { FIELD_TYPES, getElement } from "../screens/EditProfileScreen";
import { Text } from "src/ui/Text";
import { FormErrorMessage } from "src/ui/Form/components/FormErrorMessage";
import { useKeyboard } from "src/hooks/useKeyboard";

const AddFamilyMemberInitiate = ({ user, setIsFinalStep, setPhoneNumber }) => {
  const {
    data,
    loading,
    request: checkIfUniqueNumberExists,
  } = useApi(searchUser);

  const [error, setError] = React.useState(false);
  const { colors } = useTheme();
  const [keyboardHeight] = useKeyboard();

  const onContinue = async (values) => {
    if (!values?.phone?.length) {
      setIsFinalStep(true);
      return;
    }
    if (values?.phone?.trim()?.length !== 10) {
      setError(true);
      return;
    }
    setPhoneNumber(values?.phone);
    checkIfUniqueNumberExists(values?.phone);
  };

  React.useEffect(() => {
    if (data?.data) {
      if (data?.data?.count === 0) {
        setIsFinalStep(true);
      } else {
        setError(true);
      }
    }
  }, [data]);

  return (
    <TrackedForm
      formHookProps={{ mode: "onSubmit" }}
      name="add-family-member"
      contentContainerStyle={{
        flex: 1,
      }}>
      {({ watch, handleSubmit, formState: { isValid } }) => {
        const FIELDS = [
          {
            id: "phone",
            visible: true,
            label: "Enter Phone (Optional)",
            type: FIELD_TYPES?.Input,
            placeholder: "Enter phone number",
            extras: {
              rules: {
                maxLength: {
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
              <Text
                style={{
                  paddingBottom: 12,
                  fontSize: 12,
                }}>{`Adding Family member for ${user?.firstName} Ji`}</Text>
              {map(FIELDS, (field, index) => {
                const Element = getElement(field?.type);
                return (
                  <Element
                    key={index}
                    label={field?.label}
                    name={field?.id}
                    placeholder={field?.placeholder}
                    style={{ letterSpacing: 1, fontSize: 16 }}
                    keyboardType="number-pad"
                    {...field?.extras}
                  />
                );
              })}
              <Text
                style={{
                  color: colors?.textLight,
                  fontSize: 14,
                  paddingHorizontal: 0,
                  marginBottom: 16,
                }}>
                Please keep this field empty if your family member doesnt have
                mobile number.
              </Text>
              {error && !!watch("phone") ? (
                <>
                  <FormErrorMessage
                    error={`Please double check number. Number is either incomplete or belongs to some other user.`}
                  />
                  <Text style={{ paddingTop: 16 }}>
                    {`Name: ${data?.data?.rows?.[0]?.firstName}`}
                  </Text>
                </>
              ) : null}
            </ScrollView>
            <View
              style={{
                marginBottom: 0,
                position: "absolute",
                bottom: keyboardHeight + 32,
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

export default AddFamilyMemberInitiate;
