import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { filter, includes } from "lodash";
import { GeetMalaSongs } from "@/utils/geetmala";
import TitleRow from "@/components/ui/TitleRow";
import SearchInput from "@/components/ui/SearchInput";
import { NoDataComponent } from "@/components/ui/NoDataComponent";
import { Text } from "@/components/ui/Text";

export default function GeetmalaAllPage() {
  const songs = GeetMalaSongs;
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  const filteredSongs = query ? filter(songs, (s) => includes(s?.name, query)) : songs;

  return (
    <>
      <SearchInput placeholder="हिंदी में सर्च किजिये" query={query} setQuery={setQuery} />
      <div style={{ backgroundColor: "rgb(215,215,210)", paddingTop: 4, paddingBottom: 4 }}>
        <Text style={{ paddingLeft: 16, fontSize: 10 }}>Source/Copyright - Geetmala App</Text>
      </div>
      {!filteredSongs.length ? (
        <NoDataComponent />
      ) : (
        filteredSongs.map((item) => (
          <TitleRow
            key={item.id}
            title={item.name}
            onPress={() => navigate(`/geetmala/${item.id}`)}
          />
        ))
      )}
    </>
  );
}
