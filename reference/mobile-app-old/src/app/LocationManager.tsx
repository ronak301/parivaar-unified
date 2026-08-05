import React, { useState, useEffect } from "react";
import { Linking, Platform, Text, View } from "react-native";

import * as Location from "expo-location";
import { Button } from "src/ui/Button";

export default function LocationManager() {
  const [location, setLocation] = useState<Location.LocationObject | null>(
    null
  );
  const [bgLocation, setBgLocation] =
    useState<Location.PermissionResponse | null>(null);
  const [address, setAddress] = React.useState<null | string>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied");
        return;
      }

      const bgLocation = await Location.requestBackgroundPermissionsAsync();
      setBgLocation(bgLocation);

      let location = await Location.getCurrentPositionAsync({ accuracy: 3 });
      setLocation(location);
      const address = await Location.reverseGeocodeAsync({
        latitude: location?.coords?.latitude,
        longitude: location?.coords?.longitude,
      });
      setAddress(JSON.stringify(address?.[0]));
    })();
  }, []);

  let text = "Waiting..";
  if (errorMsg) {
    text = errorMsg;
  } else if (location) {
    text = JSON.stringify(location);
  }

  return (
    <View>
      <Text>{text}</Text>
      <Text>{address}</Text>
      <Text>{JSON.stringify(bgLocation)}</Text>
      <Button
        title="Navigate"
        onPress={() => {
          const latLng = `${location?.coords?.latitude},${location?.coords?.longitude}`;
          Linking.openURL(`comgooglemaps://?q=${latLng}(Reena di)`);
        }}
      />
    </View>
  );
}
