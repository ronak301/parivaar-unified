import SmallLoadingComponent from "src/ui/SmallLoadingComponent";
import { View } from "react-native";
import React from "react";
import { Member } from "src/types/types";
import LoadingComponent from "src/ui/LoadingComponent";
import NoDataComponent from "src/ui/NoDataComponent";
import FlatList from "src/ui/FlatList";
import MemberItem from "src/modules/directory/components/MemberItem";
import { Text } from "src/ui/Text";

type Props = {
  loading: boolean;
  data: any;
  count?: number;
};

export const LIMIT = 1000;

export default function SearchResultList({
  loading,

  data,
  count,
}: Props) {
  const renderItem = ({ item }: { item: Member }) => {
    return <MemberItem member={item} />;
  };

  if (loading) {
    return <LoadingComponent />;
  }

  return (
    <View style={{ backgroundColor: "white", flex: 1 }}>
      <FlatList
        keyboardShouldPersistTaps="always"
        keyboardDismissMode="on-drag"
        data={data}
        ListHeaderComponent={
          <Text
            bold
            style={{
              paddingLeft: 16,
              paddingTop: 16,
            }}>{`${count} Results Found`}</Text>
        }
        style={{ backgroundColor: "rgb(231, 240, 244)", paddingTop: 4 }}
        ListEmptyComponent={() => (
          <NoDataComponent subtitle="Please change search text or clear filters to see results" />
        )}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 100 }}
        keyExtractor={(item) => item?.id}
        initialNumToRender={10}
      />
    </View>
  );
}
