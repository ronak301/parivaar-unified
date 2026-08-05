import { compareVersions } from "compare-versions";
import { isEmpty } from "lodash";
import { getFirebaseAppRemoteConfig } from "@/config/firebaseConfig";
import { useDispatch, useSelector } from "react-redux";
import { store, type RootState } from "@/store";
import { setConfig } from "@/modules/directory/redux/communitySlice";
import { useCallback, useEffect, useState } from "react";
import { setIsAppUpdateNeeded } from "@/modules/authentication/redux/authSlice";

function hasMeaningfulRemoteConfig(
  cfg: RootState["community"]["config"] | undefined
): boolean {
  return cfg != null && !isEmpty(cfg);
}

export type Item = {
  id: string;
  label: string;
};

export type CommunityConfig = {
  features?: {
    WelcomeScreen?: boolean;
    AboutScreenExtraInfo?: boolean;
    ShowOnlyHeadsInAllMembers?: boolean;
  };
};

export type Config = {
  id: string;
  BloodGroups: Item[];
  BusinessTypes: Item[];
  Cities: Item[];
  CommunityTypes: Item[];
  FamilyMemberRelationshipTypes: Item[];
  Gender: Item[];
  Localities: Item[];
  State: Item[];
  appMeta: {
    currentVersionAndroid: {
      name: string;
      version: string;
    };
    currentVersionIos: {
      name: string;
      version: string;
    };
    minVersion: string;
  };
  configByCommunity: {
    [id: string]: CommunityConfig;
  };
};

const WEB_APP_VERSION =
  import.meta.env.VITE_APP_VERSION ?? "1.0.0";

type Props = {
  forceSync?: boolean;
};

export function useConfigManager({ forceSync }: Props) {
  const config = useSelector((state: RootState) => state?.community?.config);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const isAppVersionOK = useSelector(
    (state: RootState) => !state?.auth?.needAppUpdate
  );

  useEffect(() => {
    const cfg = store.getState().community?.config;
    const needsFetch =
      Boolean(forceSync) || !hasMeaningfulRemoteConfig(cfg);
    if (!needsFetch) {
      return;
    }

    let cancelled = false;
    setLoading(true);
    const timeout = window.setTimeout(() => {
      if (!cancelled) {
        setLoading(false);
      }
    }, 15000);

    getFirebaseAppRemoteConfig()
      .then((raw) => {
        if (cancelled) {
          return;
        }
        const c = raw as Partial<Config> | undefined;
        try {
          const appMeta = c?.appMeta;
          if (WEB_APP_VERSION && appMeta?.minVersion) {
            dispatch(
              setIsAppUpdateNeeded(
                compareVersions(WEB_APP_VERSION, appMeta.minVersion) < 0
              )
            );
          }
        } catch {
          // Bad minVersion format must not block loading config.
        }
        dispatch(setConfig(c));
      })
      .catch(() => {})
      .finally(() => {
        if (cancelled) {
          return;
        }
        window.clearTimeout(timeout);
        setLoading(false);
      });

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, [dispatch, forceSync]);

  const getCommunityConfig = useCallback(
    (id: string) => {
      const cfg = config as Config | undefined;
      return cfg?.configByCommunity?.[id];
    },
    [config]
  );

  return {
    loading,
    config,
    isAppVersionOK,
    getCommunityConfig,
  };
}
