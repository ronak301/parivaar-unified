import { View } from "react-native";
import React from "react";
import { useMemberDetails } from "src/modules/directory/hooks/useMemberDetails";
import {
  AddressIcon,
  EducationIcon,
  EmailIcon,
  GenderIcon,
  LocationIcon,
  WeddingIcon,
} from "assets";
import moment from "moment";
import {
  filter,
  forEach,
  isEmpty,
  lowerCase,
  map,
  toLower,
  trim,
} from "lodash";
import KeyValueItem from "./KeyValueItem";
import NoDataComponent from "src/ui/NoDataComponent";
import { getLocalityDisplay } from "src/utils/utils";

const PersonalInfo = () => {
  const { memberDetails } = useMemberDetails();

  const keyValuePairs = [
    {
      id: "nativePlace",
      displayName: "Native Place",
      value: memberDetails?.nativePlace,
      icon: <LocationIcon />,
    },
    {
      id: "education",
      displayName: "Education",
      value: memberDetails?.education,
      icon: <EducationIcon />,
    },
    {
      id: "gender",
      displayName: "Gender",
      value: memberDetails?.gender,
      icon: <GenderIcon />,
    },
    {
      id: "email",
      displayName: "Email",
      value: memberDetails?.email,
      icon: <EmailIcon />,
    },
    {
      id: "address",
      displayName: "Address",
      value: memberDetails?.address?.fullAddress,
      icon: <AddressIcon />,
    },
    {
      id: "weddingDate",
      displayName: "Wedding Date",
      value: memberDetails?.weddingDate
        ? moment(new Date(memberDetails?.weddingDate)).format("DD-MMM-YYYY")
        : "",
      icon: <WeddingIcon />,
    },
    {
      id: "locality",
      displayName: "Locality",
      value: getLocalityDisplay(memberDetails?.address?.locality),
      icon: <LocationIcon />,
    },
  ];

  const noPersonalDetails =
    filter(keyValuePairs, (pair) => !isEmpty(trim(pair.value)))?.length === 0;

  if (noPersonalDetails) {
    return <NoDataComponent />;
  }

  return (
    <View>
      {map(keyValuePairs, (item) => {
        return <KeyValueItem item={item} key={item?.id} />;
      })}
    </View>
  );
};

export default PersonalInfo;
