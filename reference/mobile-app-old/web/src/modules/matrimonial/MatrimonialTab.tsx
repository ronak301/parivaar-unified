import { useState } from "react";
import Matrimonial from "./Matrimonial";
import { themeColors } from "@/theme";

export default function MatrimonialTab() {
  const [selectedIndex, setSelectedIndex] = useState(0);

  return (
    <div style={{ backgroundColor: "white", flex: 1 }}>
      <div
        style={{
          margin: "12px 32px 0",
          borderRadius: 8,
          display: "flex",
          border: `1px solid ${themeColors.border}`,
          overflow: "hidden",
        }}
      >
        {["Boys", "Girls"].map((label, i) => (
          <button
            key={label}
            type="button"
            onClick={() => setSelectedIndex(i)}
            style={{
              flex: 1,
              padding: 10,
              border: "none",
              background: selectedIndex === i ? themeColors.primary : "white",
              color: selectedIndex === i ? "white" : themeColors.textDark,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            {label}
          </button>
        ))}
      </div>
      {selectedIndex === 0 ? <Matrimonial gender="Male" /> : <Matrimonial gender="Female" />}
    </div>
  );
}
