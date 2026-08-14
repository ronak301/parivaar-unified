import { Stack, useRouter } from "expo-router";
import { Provider } from "react-redux";
import { store } from "src/app/store";
import React from "react";
import * as Notifications from "expo-notifications";
import Toast from "react-native-toast-message";
import { NotificationTypes } from "src/app/NotificationManager";

function useNotificationObserver() {
  const router = useRouter();
  React.useEffect(() => {
    let isMounted = true;

    function redirect(notification: Notifications.Notification) {
      const type = notification.request.content.data?.type;
      /**
       * communityId
       */
      let params = notification.request.content.data?.params;
      let pathname = "";

      if (type) {
        switch (type) {
          case NotificationTypes.BIRTHDAY_WISH:
            pathname = `/(authenticated)/community/${params?.communityId}`;
            params.tab = "Today";
          default:
            pathname = `community/all`;
        }
        router.push({
          pathname,
          params,
        });
      }
    }

    Notifications.getLastNotificationResponseAsync().then((response) => {
      if (!isMounted || !response?.notification) {
        return;
      }
      redirect(response?.notification);
    });

    const subscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        redirect(response.notification);
      }
    );

    return () => {
      isMounted = false;
      subscription.remove();
    };
  }, []);
}

export default function Layout() {
  useNotificationObserver();
  return (
    <Provider store={store}>
      <Stack>
        <Stack.Screen
          name="(unauthenticated)"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="(authenticated)"
          options={{ headerShown: false, animation: "none" }}
        />
        <Stack.Screen
          name="index"
          options={{
            headerShown: false,
          }}
        />
      </Stack>
      <Toast />
    </Provider>
  );
}
