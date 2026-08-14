import React, { useState } from "react";
import { useNavigation, useRouter } from "expo-router";
import { BackButton, Button } from "src/ui/Button";
import { FormInput, FormLabel, FormSelect, useTheme } from "src/ui";
import {
  BloodGroups,
  BusinessTypes,
  Gender,
  KeyValuePair,
  Localities,
} from "src/utils/constants";
import { map } from "lodash";
import BloodGroupBubble from "../components/BloodGroupBubble";
import {
  View,
  TouchableOpacity,
  ScrollView,
  Keyboard,
  Switch,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { addFilter, removeFilter } from "./SearchScreen/redux/searchSlice";
import { RootState } from "src/app/store";
import { Text } from "src/ui/Text";
import { TrackedForm } from "src/ui/Form/components/TrackedForm";
import RangeSlider from "react-native-range-slider-expo";

import {
  getBusinessTypeDisplay,
  getGenderDisplay,
  getLocalityDisplay,
  sortByKey,
} from "src/utils/utils";

export default function FiltersScreen() {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const router = useRouter();
  const filter = useSelector((state: RootState) => state?.search?.filter);
  const [selectedBloodGroup, setSelectedBloodGroup] = React.useState(
    filter?.bloodGroup
  );

  const [age, setAge] = React.useState(filter?.age || { max: 100, min: 0 });

  const [showUnmarried, setShowUnmarried] = React.useState(
    filter?.showUnmarried
  );

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => <BackButton appearance="light" />,
      title: "Filters",
      headerRight: () => (
        <TouchableOpacity
          style={{ marginTop: 8 }}
          onPress={() => {
            setTimeout(() => {
              dispatch(removeFilter());
              router.back();
            }, 0);
          }}>
          <Text style={{ color: colors.primary, fontSize: 14 }}>Clear All</Text>
        </TouchableOpacity>
      ),
    });
  });

  const dispatch = useDispatch();

  const onPress = (bloodGroup: KeyValuePair) => {
    if (selectedBloodGroup?.id === bloodGroup.id) {
      setSelectedBloodGroup(null);
    } else {
      setSelectedBloodGroup(bloodGroup);
    }
  };

  const onApply = (values) => {
    dispatch(
      addFilter({
        bloodGroup: selectedBloodGroup,
        locality: values?.locality,
        businessType: values?.businessType,
        showUnmarried,
        age,
        gender: values?.gender,
      })
    );
    router?.back();
    Keyboard.dismiss();
  };

  return (
    <TrackedForm
      formHookProps={{
        defaultValues: {
          locality: filter?.locality,
          businessType: filter?.businessType,
          gender: filter?.gender,
        },
      }}
      name="filter"
      contentContainerStyle={{
        flex: 1,
        backgroundColor: "white",
      }}>
      {({ watch, handleSubmit }) => (
        <View style={{ flex: 1, paddingBottom: 98 }}>
          <ScrollView
            contentContainerStyle={{
              paddingHorizontal: 16,
              backgroundColor: "white",
              paddingVertical: 16,
              justifyContent: "space-between",
            }}>
            <>
              <View>
                <FormLabel label="Blood Group" />
                <View
                  style={{
                    flexDirection: "row",
                    marginTop: 0,
                    flexWrap: "wrap",
                  }}>
                  {map(BloodGroups, (bg) => {
                    const isSelected = selectedBloodGroup?.id === bg?.id;
                    return (
                      <BloodGroupBubble
                        key={bg?.id}
                        isSelected={isSelected}
                        bloodGroup={bg}
                        onPress={onPress}
                      />
                    );
                  })}
                </View>
              </View>
              <View
                style={{
                  height: 48,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  borderBottomColor: colors.borderDark,
                  borderBottomWidth: 1,
                  borderTopColor: colors.borderDark,
                  borderTopWidth: 1,
                  marginTop: 8,
                }}>
                <View style={{ marginTop: 4 }}>
                  <FormLabel label="Show Only Unmarried" />
                </View>
                <Switch
                  trackColor={{ false: "rgb(100,100,100)", true: "#0777FF" }}
                  thumbColor={"white"}
                  ios_backgroundColor="#3e3e3e"
                  onValueChange={(val) =>
                    setShowUnmarried(!!val ? true : undefined)
                  }
                  value={showUnmarried}
                />
              </View>
              <View style={{ paddingTop: 24 }}>
                <FormLabel label="Age" />
                <Text style={{ fontSize: 12 }}>{`From - ${age?.min}`}</Text>
                <Text style={{ fontSize: 12 }}>{`To - ${age?.max}`}</Text>
                <RangeSlider
                  step={1}
                  min={0}
                  max={100}
                  fromValueOnChange={(min) =>
                    setAge((a) => ({
                      ...a,
                      min,
                    }))
                  }
                  toValueOnChange={(max) => {
                    setAge((a) => ({
                      ...a,
                      max,
                    }));
                  }}
                  initialFromValue={age?.min}
                  initialToValue={age?.max}
                />
              </View>

              <View style={{ marginTop: 16 }}>
                <FormSelect
                  items={sortByKey(Gender, "id")}
                  name="gender"
                  placeholder="Select Gender"
                  label="Gender"
                  value={getGenderDisplay(watch("gender"))}
                />
                <FormSelect
                  items={sortByKey(BusinessTypes, "id")}
                  name="businessType"
                  placeholder="Select Business Type"
                  label="Business Type"
                  value={getBusinessTypeDisplay(watch("businessType"))}
                />

                <FormSelect
                  items={sortByKey(Localities, "id")}
                  name="locality"
                  placeholder="Select Locality"
                  label="Locality"
                  value={getLocalityDisplay(watch("locality"))}
                />
              </View>
            </>
          </ScrollView>
          <View
            style={{
              marginBottom: 0,
              position: "absolute",
              bottom: 32,
              left: 16,
              right: 16,
            }}>
            <Button onPress={handleSubmit(onApply)} title="Apply" />
          </View>
        </View>
      )}
    </TrackedForm>
  );
}
