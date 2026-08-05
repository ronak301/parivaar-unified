import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import React from "react";

SplashScreen.preventAutoHideAsync();

export const useFontLoader = () => {
  const [fontsLoaded] = useFonts({
    poppins: require("assets/fonts/Poppins-Regular.ttf"),
    poppinssemibold: require("assets/fonts/Poppins-SemiBold.ttf"),
  });

  React.useEffect(() => {
    (async () => {
      if (fontsLoaded) await SplashScreen.hideAsync();
    })();
  }, [fontsLoaded]);
};
