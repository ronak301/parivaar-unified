import { FlatList as RNFlatList, FlatListProps } from "react-native";
import React from "react";
import SearchBar from "src/modules/directory/components/SearchBar";
import Animated, { FadeInDown } from "react-native-reanimated";

type Props = FlatListProps<any>;

const FlatList = (props: Props) => {
  return (
    <Animated.View entering={FadeInDown.duration(500)}>
      <RNFlatList {...props} />
    </Animated.View>
  );
};

export default FlatList;
