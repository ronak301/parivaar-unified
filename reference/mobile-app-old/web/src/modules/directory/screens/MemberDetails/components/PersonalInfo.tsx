import { filter, isEmpty, trim } from "lodash";
import moment from "moment";
import { useMemberDetails } from "@/modules/directory/hooks/useMemberDetails";
import KeyValueItem from "./KeyValueItem";
import { NoDataComponent } from "@/components/ui/NoDataComponent";
import { getLocalityDisplay } from "@/utils/utils";

export default function PersonalInfo() {
  const { memberDetails } = useMemberDetails();

  const keyValuePairs = [
    {
      id: "nativePlace",
      displayName: "Native Place",
      value: memberDetails?.nativePlace,
      icon: "📍",
    },
    {
      id: "education",
      displayName: "Education",
      value: memberDetails?.education,
      icon: "🎓",
    },
    {
      id: "gender",
      displayName: "Gender",
      value: memberDetails?.gender,
      icon: "⚥",
    },
    {
      id: "email",
      displayName: "Email",
      value: memberDetails?.email,
      icon: "✉️",
    },
    {
      id: "address",
      displayName: "Address",
      value: memberDetails?.address?.fullAddress,
      icon: "🏠",
    },
    {
      id: "weddingDate",
      displayName: "Wedding Date",
      value: memberDetails?.weddingDate
        ? moment(new Date(memberDetails.weddingDate)).format("DD-MMM-YYYY")
        : "",
      icon: "💒",
    },
    {
      id: "locality",
      displayName: "Locality",
      value: getLocalityDisplay(memberDetails?.address?.locality),
      icon: "📌",
    },
  ];

  const noPersonalDetails =
    filter(keyValuePairs, (pair) => !isEmpty(trim(pair.value ?? ""))).length === 0;

  if (noPersonalDetails) {
    return <NoDataComponent />;
  }

  return (
    <div style={{ padding: "0 16px" }}>
      {keyValuePairs.map((p) => (
        <KeyValueItem
          key={p.id}
          displayName={p.displayName}
          value={p.value}
          icon={<span>{p.icon}</span>}
        />
      ))}
    </div>
  );
}
