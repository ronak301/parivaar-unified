import { Stack, Tabs } from "expo-router";
import { useTheme } from "src/ui";

export default () => {
  const { colors } = useTheme();
  return (
    <Stack screenOptions={{ headerShown: false, animation: "none" }}>
      <Stack.Screen
        name="login"
        options={{
          headerStyle: { backgroundColor: colors.primary },
          animation: "none",
        }}
      />
    </Stack>
  );
};
