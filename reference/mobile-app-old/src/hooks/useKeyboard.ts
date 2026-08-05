import { useEffect, useState } from "react";
import { Keyboard, KeyboardEvent, Platform } from "react-native";

export const useKeyboard = (): [number] => {
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  function onKeyboardDidShow(e: KeyboardEvent): void {
    let height = e.endCoordinates.height;
    if (Platform.OS === "android" && Platform.Version > 28) {
      height += 50;
    }
    setKeyboardHeight(height);
  }

  function onKeyboardDidHide(): void {
    setKeyboardHeight(0);
  }

  useEffect(() => {
    Keyboard.addListener("keyboardDidShow", onKeyboardDidShow);
    Keyboard.addListener("keyboardDidHide", onKeyboardDidHide);
    return (): void => {
      Keyboard.removeAllListeners("keyboardDidShow");
      Keyboard.removeAllListeners("keyboardDidHide");
    };
  }, []);

  return [keyboardHeight];
};
