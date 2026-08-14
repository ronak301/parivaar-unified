import { capitalize, filter, find, includes, isEmpty, map } from "lodash";
import { useTheme } from "../ui";
import {
  BloodGroups,
  BusinessTypes,
  FamilyMemberRelationshipTypes,
  Gender,
  Localities,
} from "./constants";
import { Executive, Member, Relative } from "src/types/types";
import { useSelector } from "react-redux";
import { RootState } from "src/app/store";
import moment from "moment";

export const ifCurrentOpenedProfileIsRelative = (currentOpenedUser) => {
  const currentUser = useSelector(
    (state: RootState) => state?.auth?.currentUser
  );

  return currentUser?.root?.id === currentOpenedUser?.root?.id;
};

export const getRandomColors = () => {
  const { colors } = useTheme();
  const defaultColors = [
    {
      light: colors.lightGreen,
      dark: colors.green,
    },
  ];

  return defaultColors[Math.floor(Math.random() * 1)];
};

export const getBloodGroupDisplay = (bloodGroup) => {
  if (isEmpty(bloodGroup)) return "--";
  return find(BloodGroups, (b) => b.id === bloodGroup)?.label;
};

export const getFamilyRelationTypeDisplay = (relation) => {
  if (isEmpty(relation)) return "";
  return (
    find(FamilyMemberRelationshipTypes, (f) => f.id === relation)?.label ||
    relation
  );
};

export const getFamilyReverseRelationType = (relationId) => {
  if (isEmpty(relationId)) return "";
  const rel = find(FamilyMemberRelationshipTypes, (f) => f.id === relationId);
  return rel?.reverse?.id;
};

export const getBusinessTypeDisplay = (businessType) => {
  if (isEmpty(businessType)) return "";
  return find(BusinessTypes, (b) => b.id === businessType)?.label;
};

export const getLocalityDisplay = (locality) => {
  if (isEmpty(locality)) return "";
  return find(Localities, (b) => b.id === locality)?.label;
};

export const getGenderDisplay = (gender) => {
  if (isEmpty(gender)) return "";
  return find(Gender, (g) => g.id === gender)?.label;
};

export const filterAndGetFirstRole = (roles: string[]) => {
  if (isEmpty(roles)) return null;
  const filteredRoles = filter(roles, (role) => role !== "ADMIN");
  return filteredRoles[0];
};

export const getCapitalizedName = (member: Member | Executive | Relative) => {
  return `${capitalize(member?.firstName)} ${capitalize(member?.lastName)}`;
};

export const getIfAnyFilterPresent = (filters) => {
  return (
    filters?.bloodGroup ||
    filters?.showUnmarried ||
    filters.businessType ||
    filters?.locality
  );
};

export const sortByKey = (array, key) => {
  const newArray = [...array];
  return newArray.sort((a, b) =>
    String(a[key]).localeCompare?.(String(b[key]))
  );
};

export const getStringAfterRemovingSpace = (str) =>
  str?.replace(/\s/g, "").trim();

export const getAge = (dateString) => {
  const today = new Date();
  const birthDate = new Date(moment(dateString).format("yyyy-MM-DD"));
  var age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

export const getTodayDateKey = () => {
  const today = new Date();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const date = String(today.getDate()).padStart(2, "0");
  const year = String(today.getFullYear());
  return `${date}${month}${year}`;
};
