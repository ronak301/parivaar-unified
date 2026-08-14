import type { Member } from "@/types/types";
import { NoDataComponent } from "@/components/ui/NoDataComponent";
import MemberItem from "@/modules/directory/components/MemberItem";
import { Text } from "@/components/ui/Text";

type Props = {
  hasMemberSource: boolean;
  data: Member[] | undefined;
  count?: number;
};

export default function SearchResultList({ hasMemberSource, data, count }: Props) {
  return (
    <div
      style={{
        backgroundColor: "#fff",
        flex: 1,
        minHeight: 0,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          gap: 8,
          paddingLeft: 16,
          paddingRight: 16,
          paddingTop: 12,
          paddingBottom: 8,
          flexShrink: 0,
        }}
      >
        <Text bold style={{ display: "block" }}>
          {count ?? 0} Results Found
        </Text>
      </div>
      <div
        style={{
          backgroundColor: "rgb(231, 240, 244)",
          paddingTop: 4,
          paddingBottom: 16,
          flex: 1,
          minHeight: 0,
          overflowY: "auto",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {!hasMemberSource ? (
          <NoDataComponent subtitle="Open the Home tab and load members once. Search runs on that saved list (no network)." />
        ) : !data?.length ? (
          <NoDataComponent subtitle="No matches for this search or filters. Try different text or clear filters." />
        ) : (
          data.map((item) => <MemberItem key={item.id} member={item} />)
        )}
      </div>
    </div>
  );
}
