import { themeColors } from "@/theme";

type Props = {
  placeholder: string;
  query: string;
  setQuery: (q: string) => void;
};

export default function SearchInput({ placeholder, query, setQuery }: Props) {
  return (
    <div style={{ padding: "8px 16px", backgroundColor: "white" }}>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        style={{
          width: "100%",
          height: 44,
          borderRadius: 8,
          border: `1px solid ${themeColors.borderDark}`,
          paddingLeft: 12,
          fontSize: 16,
        }}
      />
    </div>
  );
}
