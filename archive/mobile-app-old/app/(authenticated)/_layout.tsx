import { Stack, Tabs } from "expo-router";
import { useTheme } from "src/ui";

export default () => {
  const { colors } = useTheme();

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="search/filters"
        options={{
          title: "Filters",
          headerShown: true,
          headerStyle: { backgroundColor: "black" },
          headerTintColor: "white",
          presentation: "modal",
        }}
      />
      <Stack.Screen
        name="community/welcome"
        options={{
          title: "Welcome",
          headerStyle: { backgroundColor: "black" },
          headerTransparent: false,
          headerTintColor: "white",
        }}
      />
      <Stack.Screen
        name="community/all"
        options={{
          title: "Parivaar App",
          headerStyle: { backgroundColor: "black" },
          headerTransparent: false,
          headerTintColor: "white",
        }}
      />
      <Stack.Screen
        name="member/[id]"
        getId={({ params }) => params.id}
        options={{
          title: "",
          headerShown: true,
          headerStyle: { backgroundColor: "black" },
          headerTintColor: "white",
        }}
      />

      <Stack.Screen
        name="search/search"
        options={{
          headerShown: true,
          headerStyle: { backgroundColor: "black" },
        }}
      />

      <Stack.Screen
        name="editprofile"
        options={{
          title: "Edit Profile",
          headerShown: true,
          headerStyle: { backgroundColor: "black" },
          headerTintColor: "white",
        }}
      />

      <Stack.Screen
        name="add-family-member"
        options={{
          title: "Add Family Member",
          headerShown: true,
          headerStyle: { backgroundColor: "black" },
          headerTintColor: "white",
        }}
      />
      <Stack.Screen
        name="add-member"
        options={{
          title: "Add Member",
          headerShown: true,
          headerStyle: { backgroundColor: "black" },
          headerTintColor: "white",
        }}
      />
      <Stack.Screen
        name="geetmala/all"
        options={{
          title: "Geetmala",
          headerShown: true,
          headerStyle: { backgroundColor: "black" },
          headerTintColor: "white",
        }}
      />
      <Stack.Screen
        name="geetmala/[id]"
        options={{
          title: "Geetmala",
          headerShown: true,
          headerStyle: { backgroundColor: "black" },
          headerTintColor: "white",
        }}
      />
    </Stack>
  );
};
