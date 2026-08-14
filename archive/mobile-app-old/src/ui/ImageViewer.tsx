import React, { memo, useRef, useMemo } from "react";
import { View } from "react-native";
import { ImageWrapper, ImageViewer } from "react-native-reanimated-viewer";
import { useTheme } from "./theme";
import { Image } from "expo-image";

const blurhash =
  "|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[";

const ImageViewerPage = ({ url, style }) => {
  const imageRef = useRef(null);

  const { colors } = useTheme();

  const data = useMemo(
    () => [
      {
        smallUrl: url,
        url,
      },
    ],
    []
  );

  return (
    <View>
      <ImageViewer
        ref={imageRef}
        data={data.map((el) => ({
          key: `key-${el.url}`,
          source: { uri: el.url },
        }))}
      />
      <View style={{ flexDirection: "row" }}>
        {data.map((el, index) => (
          <ImageWrapper
            key={el.smallUrl}
            viewerRef={imageRef}
            index={index}
            source={{
              uri: el.smallUrl,
            }}>
            <View
              style={{
                borderColor: colors.border,
                borderWidth: 1,
                borderRadius: 999,
              }}>
              <Image
                source={{
                  uri: el.smallUrl,
                }}
                style={[{ width: 100, height: 100 }, style]}
                placeholder={blurhash}
              />
            </View>
          </ImageWrapper>
        ))}
      </View>
    </View>
  );
};
export default memo(ImageViewerPage);
