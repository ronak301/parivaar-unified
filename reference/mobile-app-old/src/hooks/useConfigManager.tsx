import { compareVersions } from "compare-versions";
import { getFirebaseAppRemoteConfig } from "src/config/firebaseConfig";
import * as Application from "expo-application";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "src/app/store";
import { setConfig } from "src/modules/directory/redux/communitySlice";
import React from "react";
import { setIsAppUpdateNeeded } from "src/modules/authentication/redux/authSlice";

type Item = {
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

type Props = {
  forceSync?: boolean;
};

export const useConfigManager = ({ forceSync }: Props) => {
  const config = useSelector((state: RootState) => state?.community?.config);
  const dispatch = useDispatch();
  const [loading, setLoading] = React.useState(false);
  const isAppVersionOK = useSelector(
    (state: RootState) => !state?.auth?.needAppUpdate
  );

  const applicationVersion = Application?.nativeApplicationVersion;

  React.useEffect(() => {
    if ((!config || forceSync) && !loading) {
      // console.log("fetching again");
      setLoading(true);

      getFirebaseAppRemoteConfig()
        .then((c) => {
          const appMeta = c?.appMeta;
          if (applicationVersion && appMeta?.minVersion)
            dispatch(
              setIsAppUpdateNeeded(
                compareVersions(applicationVersion, appMeta?.minVersion) < 0
              )
            );
          dispatch(setConfig(c));
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
        });
    }
  }, []);

  const getCommunityConfig = React.useCallback((id: string) => {
    return config?.configByCommunity[id];
  }, []);

  return {
    loading,
    config,
    isAppVersionOK,
    getCommunityConfig,
  };
};
