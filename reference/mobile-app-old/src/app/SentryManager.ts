import * as Sentry from "sentry-expo";
import * as Application from "expo-application";

export const initSentry = () => {
  if (!__DEV__) {
    Sentry.init({
      dsn: "https://8f56fffe0f2dc8e32c0ac1b64386c559@o4505876586168320.ingest.sentry.io/4505876596391936",
      debug: !!__DEV__,
      normalizeDepth: 8,
      release: Application.nativeApplicationVersion || "1.0.0",
    });
  }
};

export const setSentryUser = (user) => {
  Sentry.Native.setUser({
    id: user?.id,
    phone: user?.phone,
    name: `${user?.firstName}`,
  });
};
