import { Tabs } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useTheme } from "src/ui";

export default () => {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        tabBarStyle: {
          backgroundColor: "black",
        },
        unmountOnBlur: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === "community/[id]") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "profile") {
            iconName = focused ? "person-circle" : "person-circle-outline";
          } else if (route.name === "business") {
            iconName = focused ? "business" : "business-outline";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "white",
        tabBarInactiveTintColor: "rgb(200, 200, 200)",
      })}>
      <Tabs.Screen
        name="community/[id]"
        options={{
          title: "Home",
          tabBarLabelStyle: { fontFamily: "poppinssemibold" },
        }}
      />
      <Tabs.Screen
        name="business"
        options={{
          title: "Business",
          headerStyle: { backgroundColor: "black" },
          headerTintColor: "white",
          tabBarLabelStyle: { fontFamily: "poppinssemibold" },
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          headerStyle: { backgroundColor: "black" },
          headerTintColor: "white",
          tabBarLabelStyle: { fontFamily: "poppinssemibold" },
        }}
      />
    </Tabs>
  );
};
