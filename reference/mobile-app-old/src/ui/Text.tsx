import {
  Text as ReactNativeText,
  TextProps,
  StyleSheet,
  Dimensions,
  Platform,
  PixelRatio,
} from "react-native";
import { useTheme } from "./theme";

export const FONT_SIZE_TO_LINE_HEIGHT_RATIO = 1.4;

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const scale = SCREEN_WIDTH / 320;

export function normalize(size) {
  const newSize = size * scale;
  if (Platform.OS === "ios") {
    return Math.round(PixelRatio.roundToNearestPixel(newSize));
  } else {
    return Math.round(PixelRatio.roundToNearestPixel(newSize)) - 2;
  }
}

export const Text = ({
  style,
  bold = false,
  ...props
}: TextProps & { bold?: boolean }) => {
  const fontSize = StyleSheet.flatten(style)?.fontSize || 12;
  const updatedFontSize = normalize(fontSize);
  const lineHeight = fontSize * FONT_SIZE_TO_LINE_HEIGHT_RATIO;
  const { colors } = useTheme();
  const fontFamily = bold ? "poppinssemibold" : "poppins";

  return (
    <ReactNativeText
      style={[
        {
          color: colors.textDark,
          fontSize: updatedFontSize,
          lineHeight,
          letterSpacing: 0.24,
          fontFamily,
          paddingTop: 2,
        },
        style,
      ]}
      {...props}
    />
  );
};
