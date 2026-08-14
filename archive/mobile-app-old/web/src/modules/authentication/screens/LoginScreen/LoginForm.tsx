import { useForm } from "react-hook-form";
import { themeColors } from "@/theme";
import { Button } from "@/components/ui/Button";
import { Text } from "@/components/ui/Text";

type FormValues = {
  phone: string;
};

type Props = {
  onSubmit: (values: FormValues) => void;
  loading: boolean;
};

export function LoginForm({ onSubmit, loading }: Props) {
  const {
    register,
    handleSubmit,
    formState: { isValid },
  } = useForm<FormValues>({
    mode: "onChange",
    defaultValues: { phone: "" },
  });

  return (
    <>
      <div
        style={{
          paddingTop: 64,
          backgroundColor: themeColors.primary,
          width: "100%",
          minHeight: "40vh",
          marginBottom: 32,
          paddingBottom: 32,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-around",
        }}
      >
        <Text
          style={{
            alignSelf: "center",
            fontSize: 24,
            color: "white",
            fontWeight: 600,
          }}
        >
          Parivaar
        </Text>
        <img
          src="/login.png"
          alt=""
          style={{
            width: 140,
            height: 140,
            borderRadius: 999,
            alignSelf: "center",
            objectFit: "cover",
          }}
        />
        <Text
          style={{
            color: "white",
            alignSelf: "center",
            fontSize: 16,
            fontWeight: 400,
            paddingTop: 16,
            paddingBottom: 16,
            textAlign: "center",
            paddingLeft: 16,
            paddingRight: 16,
          }}
        >
          India's First Local Community Platform
        </Text>
        <Text
          style={{
            paddingTop: 16,
            alignSelf: "center",
            fontSize: 14,
            color: "white",
            fontWeight: 600,
          }}
        >
          भारत से 🇮🇳 भारत के लिए ❤️
        </Text>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        style={{ paddingLeft: 16, paddingRight: 16, paddingBottom: 32 }}
      >
        <input
          {...register("phone", {
            required: true,
            minLength: { value: 10, message: "Please enter 10 digit mobile number" },
            maxLength: { value: 10, message: "Please enter 10 digit mobile number" },
            pattern: {
              value: /^\d{10}$/,
              message: "Please enter 10 digit mobile number",
            },
          })}
          inputMode="numeric"
          autoComplete="tel"
          autoFocus
          placeholder="Enter Phone Number"
          maxLength={10}
          style={{
            width: "100%",
            minHeight: 48,
            borderRadius: 8,
            backgroundColor: "#F6F8FB",
            paddingLeft: 12,
            paddingRight: 12,
            fontSize: 16,
            letterSpacing: 1.2,
            border: `2px solid ${themeColors.border}`,
            marginBottom: 16,
            boxSizing: "border-box",
          }}
        />
        <Button
          title="GET OTP"
          disabled={!isValid}
          loading={loading}
          onPress={() => handleSubmit(onSubmit)()}
        />
      </form>

      <Text
        onClick={() => {
          window.open(
            "https://wa.me/7042770304?text=Jai%20Jinendra.I%20am%20interested%20in%20parivaar%20app.",
            "_blank",
            "noopener,noreferrer"
          );
        }}
        style={{
          textAlign: "center",
          marginTop: 16,
          letterSpacing: 0.3,
          color: themeColors.textLight,
          paddingLeft: 32,
          paddingRight: 32,
          paddingTop: 4,
          lineHeight: 24,
          cursor: "pointer",
          display: "block",
        }}
      >
        Can't login, need help ? Reach out to us on
        <span style={{ color: themeColors.link }}> +917042770304</span>
      </Text>
    </>
  );
}
