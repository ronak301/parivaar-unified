import { ScrollView, View, Text } from "react-native";
import React from "react";
import { useSearchParams } from "expo-router";
import { filter } from "lodash";
import { GeetMalaSongs } from "src/utils/geetmala";
import { useTheme } from "src/ui";
import Check from "src/ui/Check";

const CommunitySongDetailScreen = () => {
  const params = useSearchParams();
  const [song, setSong] = React.useState({});
  const { colors } = useTheme();

  React.useEffect(() => {
    setSong(filter(GeetMalaSongs, (s) => s?.id === Number(params?.id))?.[0]);
  }, [params?.id]);

  return (
    <ScrollView
      contentContainerStyle={{ paddingBottom: 64 }}
      style={{ paddingHorizontal: 12, paddingVertical: 16 }}>
      <Check ifPresent={song?.author || song?.similarto}>
        <View
          style={{
            paddingHorizontal: 20,
            paddingVertical: 10,
            borderWidth: 2,
            borderColor: colors.green,
            borderRadius: 16,
            marginBottom: 16,
            backgroundColor: colors.lightGreen,
          }}>
          {song?.author ? <Text bold>{`रचियता - ${song?.author}`}</Text> : null}
          {song?.similarto ? <Text>{`लय - ${song?.similarto}`}</Text> : null}
        </View>
      </Check>

      <Text
        style={{
          fontSize: 18,
          fontFamily: null,
          lineHeight: 24,
        }}>
        {song?.desc}
      </Text>
    </ScrollView>
  );
};

export default CommunitySongDetailScreen;
