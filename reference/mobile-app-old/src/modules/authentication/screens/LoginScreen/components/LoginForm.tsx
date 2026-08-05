import { View, Linking, StatusBar } from "react-native";
import React from "react";
import { TrackedForm } from "src/ui/Form/components/TrackedForm";
import { FormNames } from "src/ui/Form/components/FormNames";
import { FormInput, useTheme } from "src/ui";
import { Image } from "expo-image";
import { Button } from "src/ui/Button";
import { Text } from "src/ui/Text";

type Props = {
  onSubmit: (...arg: any) => void;
  loading: boolean;
};

const LoginForm = ({ onSubmit, loading }: Props) => {
  const { colors } = useTheme();

  return (
    <>
      <StatusBar backgroundColor={colors.primary} barStyle="light-content" />
      <View
        style={{
          paddingTop: 64,
          backgroundColor: colors.primary,
          width: "100%",
          height: "40%",
          marginBottom: 32,
          paddingBottom: 32,
          justifyContent: "space-around",
        }}>
        <Text
          style={{
            alignSelf: "center",
            fontSize: 24,
            color: "white",
            fontFamily: "poppinssemibold",
          }}>
          Parivaar
        </Text>
        <Image
          source={require("assets/login.png")}
          style={{
            width: 140,
            height: 140,
            borderRadius: 999,
            alignSelf: "center",
          }}
        />
        <Text
          style={{
            color: "white",
            alignSelf: "center",
            fontSize: 16,
            fontWeight: "400",
            paddingTop: 16,
            paddingBottom: 16,
          }}>
          India's First Local Community Platform
        </Text>
        <Text
          style={{
            paddingTop: 16,
            alignSelf: "center",
            fontSize: 14,
            color: "white",
            fontWeight: "600",
          }}>
          भारत से 🇮🇳 भारत के लिए ❤️
        </Text>
      </View>
      <TrackedForm
        name={FormNames.Login}
        formHookProps={{ mode: "onSubmit" }}
        scrollEnabled={false}>
        {({
          handleSubmit,
          getValues,
          setError,
          formState: { isSubmitting, isValid },
        }) => (
          <View style={{ paddingHorizontal: 16, paddingBottom: 32 }}>
            <FormInput
              name="phone"
              placeholder="Enter Phone Number"
              maxLength={10}
              autoFocus
              rules={{
                required: true,
                maxLength: {
                  value: 10,
                  message: "Please enter 10 digit mobile number",
                },
                minLength: {
                  value: 10,
                  message: "Please enter 10 digit mobile number",
                },
              }}
              keyboardType="phone-pad"
              style={{ letterSpacing: 1.2, fontSize: 16 }}
            />
            <Button
              title="GET OTP"
              disabled={!isValid}
              loading={loading}
              onPress={() => {
                handleSubmit(onSubmit)();
              }}
            />
          </View>
        )}
      </TrackedForm>
      <Text
        onPress={() => {
          Linking?.openURL(
            "https://wa.me/7042770304?text=Jai%20Jinendra.I%20am%20interested%20in%20parivaar%20app."
          );
        }}
        style={{
          textAlign: "center",
          marginTop: 16,
          letterSpacing: 0.3,
          color: colors.textLight,
          paddingHorizontal: 32,
          paddingTop: 4,
          lineHeight: 24,
        }}>
        Can't login, need help ? Reach out to us on
        <Text style={{ color: colors.link }}> +917042770304</Text>
      </Text>
    </>
  );
};

export default LoginForm;
