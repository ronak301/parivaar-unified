import { extendTheme, type ThemeConfig } from "@chakra-ui/react";

const config: ThemeConfig = {
  initialColorMode: "light",
  useSystemColorMode: false,
};

export const chakraTheme = extendTheme({
  config,
  colors: {
    brand: {
      50: "#e6f2ff",
      100: "rgba(7, 119, 255, 0.12)",
      200: "#b3d9ff",
      300: "#80c1ff",
      400: "#4da8ff",
      500: "#0777FF",
      600: "#065ecc",
      700: "#054699",
      800: "#032f66",
      900: "#021733",
    },
  },
  fonts: {
    body: `system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif`,
  },
  styles: {
    global: {
      body: {
        WebkitTapHighlightColor: "transparent",
      },
    },
  },
  components: {
    Button: {
      defaultProps: {
        colorScheme: "brand",
      },
    },
  },
});
