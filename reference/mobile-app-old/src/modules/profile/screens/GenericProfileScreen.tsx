import React from "react";
import { useApi } from "src/api/useApi";
import { getMemberDetails } from "src/api/directoryApi";
import { MemberDetailsContextProvider } from "src/modules/directory/hooks/useMemberDetails";
import Profile from "src/modules/directory/screens/MemberDetails/components/Profile";
import LoadingComponent from "src/ui/LoadingComponent";
import { Member } from "src/types/types";
import { useDispatch, useSelector } from "react-redux";
import { setProfileMeta } from "../redux/profileSlice";
import { RootState } from "src/app/store";
import { sendEvent } from "src/api/events";
import Animated, { FadeInDown } from "react-native-reanimated";

type Props = {
  id?: string;
};

const GenericProfileScreen = ({ id }: Props) => {
  const { currentOpenedUser, shouldUpdateUser, shouldUpdateUserId } =
    useSelector((state: RootState) => state?.profile?.meta);

  const [details, setDetails] = React.useState<Member | null>(null);
  const dispatch = useDispatch();

  const currentLoggedInUser = useSelector(
    (state: RootState) => state?.auth?.currentUser
  );

  const shallThisUserBeUpdated = details?.id === shouldUpdateUserId;

  const { loading, request: fetchMemberDetails } = useApi(getMemberDetails);
  const [refetchKey, setRefetchKey] = React.useState(0);

  React.useEffect(() => {
    if (shouldUpdateUser && shallThisUserBeUpdated) {
      setDetails(currentOpenedUser as Member);
    }
  }, [shouldUpdateUser, shallThisUserBeUpdated, currentOpenedUser]);

  React.useEffect(() => {
    if (!id) return;
    let cancelled = false;
    (async () => {
      const { data } = await fetchMemberDetails(id);
      if (cancelled) return;
      dispatch(
        setProfileMeta({
          currentOpenedUser: data?.data,
          shouldUpdateUser: false,
          shouldUpdateUserId: "",
        })
      );
      setDetails(data?.data as Member);
    })();
    return () => {
      cancelled = true;
    };
  }, [id, refetchKey, fetchMemberDetails, dispatch]);

  React.useEffect(() => {
    if (
      currentOpenedUser &&
      currentOpenedUser?.id === id &&
      currentLoggedInUser?.id !== currentOpenedUser?.id
    ) {
      sendEvent(
        `Profile of -  ${currentOpenedUser?.firstName}(${currentOpenedUser?.phone}) visited by ${currentLoggedInUser?.firstName} ${currentLoggedInUser?.lastName} (${currentLoggedInUser?.phone})`
      );
    }
  }, [currentOpenedUser, currentLoggedInUser, id]);

  if (!id) {
    return null;
  }

  if ((loading && refetchKey === 0) || !details?.id) {
    return <LoadingComponent />;
  }

  return (
    <Animated.View entering={FadeInDown.duration(500)} style={{ flex: 1 }}>
      <MemberDetailsContextProvider memberDetails={details}>
        <Profile setFetchAgain={() => setRefetchKey((k) => k + 1)} />
      </MemberDetailsContextProvider>
    </Animated.View>
  );
};

export default GenericProfileScreen;
