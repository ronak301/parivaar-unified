import { isEmpty } from "lodash";
import { useMemberDetails } from "@/modules/directory/hooks/useMemberDetails";
import KeyValueItem from "./KeyValueItem";
import { NoDataComponent } from "@/components/ui/NoDataComponent";
import { getBusinessTypeDisplay } from "@/utils/utils";

export default function BusinessInfo() {
  const { memberDetails } = useMemberDetails();
  const b = memberDetails?.business;

  const pairs = [
    {
      id: "name",
      displayName: "Business Name",
      value: b?.name,
      icon: "🏢",
    },
    {
      id: "type",
      displayName: "Business Type",
      value: getBusinessTypeDisplay(b?.type),
      icon: "🏷️",
    },
    {
      id: "phone",
      displayName: "Business Phone",
      value: b?.phone,
      icon: "☎️",
    },
    {
      id: "description",
      displayName: "Description",
      value: b?.description,
      icon: "📝",
    },
  ];

  if (isEmpty(b)) {
    return <NoDataComponent title="No business info" />;
  }

  return (
    <div style={{ padding: "0 16px" }}>
      {pairs.map((p) => (
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
