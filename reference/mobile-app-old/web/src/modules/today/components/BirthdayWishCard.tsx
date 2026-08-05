import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { capitalize, includes } from "lodash";
import { Text } from "@/components/ui/Text";
import { themeColors } from "@/theme";
import MemberImage from "@/components/ui/MemberImage";
import { pickMemberAvatarUrl } from "@/utils/resolveMediaUrl";
import { getAge, getTodayDateKey } from "@/utils/utils";
import type { RootState } from "@/store";
import { addTodaysBirthdayWishedIds } from "@/modules/today/redux/todaySlice";
import { wishBirthday } from "@/api/directoryApi";
import { Button } from "@/components/ui/Button";
import type { Member } from "@/types/types";

export default function BirthdayWishCard({ user }: { user: Member }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const currentUser = useSelector((state: RootState) => state?.auth?.currentUser);
  const currentCommunity = useSelector(
    (state: RootState) => state?.community?.selectedCommunity
  );
  const dailyBirthdayWishedIds =
    useSelector(
      (state: RootState) =>
        state?.today?.dailyBirthdayWishedIds[getTodayDateKey()]
    ) || [];

  const alreadyWishedToThisUser = includes(dailyBirthdayWishedIds, user?.id);
  const [hasWished, setHasWished] = useState(alreadyWishedToThisUser);

  const onWish = () => {
    void wishBirthday(user?.id, currentUser?.id, currentCommunity?.id);
    const wishedUserIds = [...dailyBirthdayWishedIds, user?.id];
    const key = getTodayDateKey();
    setHasWished(true);
    dispatch(addTodaysBirthdayWishedIds({ [key]: wishedUserIds }));
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => navigate(`/member/${user?.id}`)}
      onKeyDown={(e) => e.key === "Enter" && navigate(`/member/${user?.id}`)}
      style={{
        minHeight: 220,
        backgroundColor: "white",
        margin: 8,
        padding: 8,
        borderRadius: 12,
        boxShadow: "0 1px 4px rgba(0,0,0,0.12)",
        display: "inline-block",
        width: "calc(50% - 16px)",
        verticalAlign: "top",
        cursor: "pointer",
        position: "relative",
        paddingBottom: 56,
      }}
    >
      <div style={{ display: "flex", justifyContent: "center" }}>
        <MemberImage
          url={pickMemberAvatarUrl(user)}
          initials={[user?.firstName, user?.lastName]}
        />
      </div>
      <Text
        bold
        style={{ fontSize: 14, marginTop: 8, display: "block", textAlign: "center" }}
      >
        {capitalize(user?.firstName)} {capitalize(user?.lastName)}
      </Text>
      <Text style={{ fontSize: 12, color: themeColors.textLight, textAlign: "center" }}>
        {user?.dob ? `${getAge(user.dob)} years old` : ""}
      </Text>
      <div
        style={{
          position: "absolute",
          left: 16,
          right: 16,
          bottom: 16,
          display: "flex",
          justifyContent: "center",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {hasWished || alreadyWishedToThisUser ? (
          <span style={{ color: themeColors.green, fontSize: 14 }}>✓ Wished</span>
        ) : (
          <Button size="md" title="Say Happy Birthday" variant="outline" onPress={onWish} />
        )}
      </div>
    </div>
  );
}
