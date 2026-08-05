import PersonalInfo from "./PersonalInfo";
import BusinessInfo from "./BusinessInfo";
import { themeColors } from "@/theme";

export default function MoreProfileInformation({
  selectedIndex,
  setIndex,
}: {
  selectedIndex: number;
  setIndex: (n: number) => void;
}) {
  return (
    <div style={{ backgroundColor: "white" }}>
      <div
        style={{
          margin: "8px 16px 0",
          borderRadius: 8,
          display: "flex",
          border: `1px solid ${themeColors.border}`,
          overflow: "hidden",
        }}
      >
        {["Personal", "Business"].map((label, i) => (
          <button
            key={label}
            type="button"
            onClick={() => setIndex(i)}
            style={{
              flex: 1,
              padding: "10px 8px",
              border: "none",
              background: selectedIndex === i ? themeColors.primary : "white",
              color: selectedIndex === i ? "white" : themeColors.textDark,
              fontWeight: 600,
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            {label}
          </button>
        ))}
      </div>
      {selectedIndex === 0 ? <PersonalInfo /> : <BusinessInfo />}
    </div>
  );
}
