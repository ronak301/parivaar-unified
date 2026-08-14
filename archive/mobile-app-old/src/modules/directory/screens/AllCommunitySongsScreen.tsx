import { View, Text } from "react-native";
import React from "react";
import { GeetMalaSongs } from "src/utils/geetmala";
import FlatList from "src/ui/FlatList";
import TitleRow from "src/ui/TitleRow";
import { useRouter } from "expo-router";
import SearchInput from "src/ui/SearchInput";
import { filter, includes } from "lodash";
import NoDataComponent from "src/ui/NoDataComponent";

const AllCommunitySongsScreen = () => {
  const songs = GeetMalaSongs;
  const router = useRouter();
  const [query, setQuery] = React.useState("");

  const renderItem = ({ item }) => {
    return (
      <TitleRow
        title={item?.name}
        onPress={() => {
          router?.push({
            pathname: "/geetmala/[id]",
            params: {
              id: item?.id,
            },
          });
        }}
      />
    );
  };

  const filteredSongs = query
    ? filter(songs, (s) => includes(s?.name, query))
    : songs;

  return (
    <>
      <SearchInput
        placeholder="हिंदी में सर्च किजिये"
        query={query}
        setQuery={setQuery}
      />
      <FlatList
        ListEmptyComponent={<NoDataComponent />}
        ListHeaderComponent={() => (
          <View
            style={{ backgroundColor: "rgb(215,215,210)", paddingVertical: 4 }}>
            <Text style={{ paddingLeft: 16, fontSize: 10 }}>
              Source/Copyright - Geetmala App
            </Text>
          </View>
        )}
        data={filteredSongs}
        renderItem={renderItem}
        keyExtractor={(item) => item?.id}
      />
    </>
  );
};

export default AllCommunitySongsScreen;
