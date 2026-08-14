import { useEffect, useState } from "react";
import { filter, isEmpty } from "lodash";
import { useSelector } from "react-redux";
import { getAllTodaysBirthdays } from "@/api/directoryApi";
import { useApi } from "@/api/useApi";
import type { RootState } from "@/store";
import { LoadingComponent } from "@/components/ui/LoadingComponent";
import { NoDataComponent } from "@/components/ui/NoDataComponent";
import { Text } from "@/components/ui/Text";
import BirthdayWishCard from "./BirthdayWishCard";
import type { Member } from "@/types/types";

export default function BirthdaysSection() {
  const {
    data: allBirthdays,
    loading,
    request: fetchAllTodaysBirthdays,
  } = useApi(getAllTodaysBirthdays);

  function isToday(dob: string | undefined) {
    if (isEmpty(dob)) return false;
    const dateOfBirth = new Date(dob as string);
    const today = new Date();
    return (
      today.getDate() === dateOfBirth.getDate() &&
      today.getMonth() === dateOfBirth.getMonth()
    );
  }

  const [data, setData] = useState<Member[]>([]);
  const currentCommunity = useSelector(
    (state: RootState) => state?.community?.selectedCommunity
  );

  useEffect(() => {
    if (currentCommunity?.id) {
      void fetchAllTodaysBirthdays(currentCommunity.id);
    }
  }, [currentCommunity?.id]);

  useEffect(() => {
    const nested = (allBirthdays as { data?: unknown })?.data;
    const raw = Array.isArray(nested) ? nested : [];
    const filteredBirthdays = filter(raw, (user) => isToday(user?.dob));
    const sorted = filteredBirthdays?.sort((u1) => {
      if (u1?.profilePicture === null) return 1;
      return -1;
    });
    setData(sorted ?? []);
  }, [allBirthdays]);

  if (isEmpty(data) && loading) {
    return <LoadingComponent />;
  }

  if (isEmpty(data)) {
    return <NoDataComponent title="No Birthdays today" subtitle="" />;
  }

  return (
    <div style={{ paddingBottom: 0, backgroundColor: "white" }}>
      <Text
        bold
        style={{
          fontSize: 18,
          paddingLeft: 16,
          paddingTop: 32,
          paddingBottom: 16,
          display: "block",
        }}
      >
        {`We have ${data?.length} Birthdays Today`}
      </Text>
      <div style={{ paddingLeft: 8, paddingRight: 8, textAlign: "center" }}>
        {data.map((item) => (
          <BirthdayWishCard key={item.id} user={item} />
        ))}
      </div>
    </div>
  );
}
