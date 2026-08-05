import { View } from "react-native";
import React from "react";
import { useMemberDetails } from "src/modules/directory/hooks/useMemberDetails";
import {
  AddressIcon,
  BusinessIcon,
  ContactNumberIcon,
  DescriptionIcon,
  EducationIcon,
  WebsiteIcon,
} from "assets";
import { filter, isEmpty, map, trim } from "lodash";
import KeyValueItem from "./KeyValueItem";
import { Text } from "src/ui/Text";
import NoDataComponent from "src/ui/NoDataComponent";
import { getBusinessTypeDisplay } from "src/utils/utils";

const BusinessInfo = () => {
  const { memberDetails } = useMemberDetails();

  const keyValuePairs = [
    {
      id: "businessName",
      displayName: "Business Name",
      value: memberDetails?.business?.name,
      icon: <BusinessIcon />,
    },
    {
      id: "businessType",
      displayName: "Business Type",
      value: getBusinessTypeDisplay(memberDetails?.business?.type),
      icon: <EducationIcon />,
    },
    {
      id: "description",
      displayName: "Description",
      value: memberDetails?.business?.description,
      icon: <DescriptionIcon />,
    },
    {
      id: "phone",
      displayName: "Contact Number",
      value: memberDetails?.business?.phone,
      icon: <ContactNumberIcon />,
    },
    {
      id: "address",
      displayName: "Address",
      value: memberDetails?.business?.address,
      icon: <AddressIcon />,
    },
    {
      id: "website",
      displayName: "Website",
      value: memberDetails?.business?.website,
      icon: <WebsiteIcon />,
    },
  ];

  const noBusinessDetails =
    filter(keyValuePairs, (pair) => !isEmpty(trim(pair.value)))?.length === 0;

  if (noBusinessDetails) {
    return <NoDataComponent subtitle="No Business Details" />;
  }

  return (
    <View>
      {map(keyValuePairs, (item) => {
        return <KeyValueItem item={item} key={item?.id} />;
      })}
    </View>
  );
};

export default BusinessInfo;
