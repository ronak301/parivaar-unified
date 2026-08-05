import BusinessScreen from "@/modules/business/BusinessScreen";
import { BlackTitleHeader } from "@/components/layout/BlackTitleHeader";

export default function BusinessTabPage() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        flex: 1,
        minHeight: 0,
        overflow: "hidden",
      }}
    >
      <BlackTitleHeader title="Business" />
      <div
        style={{
          flex: 1,
          minHeight: 0,
          overflowY: "auto",
          WebkitOverflowScrolling: "touch",
        }}
      >
        <BusinessScreen />
      </div>
    </div>
  );
}
