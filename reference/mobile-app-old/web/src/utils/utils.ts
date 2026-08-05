import { capitalize, filter, find, includes, isEmpty } from "lodash";
import { useSelector } from "react-redux";
import {
  BloodGroups,
  BusinessTypes,
  FamilyMemberRelationshipTypes,
  Gender,
  Localities,
} from "./constants";
import type { Executive, Member, Relative } from "@/types/types";
import type { RootState } from "@/store";
import moment from "moment";
import { themeColors } from "@/theme";

/** Hook replacement for legacy `ifCurrentOpenedProfileIsRelative` (was incorrectly named but used as hook). */
export function useIfRelativeProfile(
  currentOpenedUser: Member | Relative | null | undefined
) {
  const currentUser = useSelector((state: RootState) => state?.auth?.currentUser);
  const cuRoot = (currentUser as { root?: { id?: string } } | null)?.root;
  const opRoot = (currentOpenedUser as { root?: { id?: string } } | null)?.root;
  return cuRoot?.id === opRoot?.id;
}

export function getRandomColors() {
  return [
    {
      light: themeColors.lightGreen,
      dark: themeColors.green,
    },
  ][0];
}

export function getBloodGroupDisplay(bloodGroup: string | undefined) {
  if (isEmpty(bloodGroup)) return "--";
  return find(BloodGroups, (b) => b.id === bloodGroup)?.label;
}

export function getFamilyRelationTypeDisplay(relation: string | undefined) {
  if (isEmpty(relation)) return "";
  return (
    find(FamilyMemberRelationshipTypes, (f) => f.id === relation)?.label ||
    relation
  );
}

export function getFamilyReverseRelationType(relationId: string | undefined) {
  if (isEmpty(relationId)) return "";
  const rel = find(
    FamilyMemberRelationshipTypes,
    (f) => f.id === relationId
  ) as { reverse?: { id: string } } | undefined;
  return rel?.reverse?.id;
}

export function getBusinessTypeDisplay(businessType: string | undefined) {
  if (isEmpty(businessType)) return "";
  return find(BusinessTypes, (b) => b.id === businessType)?.label;
}

export function getLocalityDisplay(locality: string | undefined) {
  if (isEmpty(locality)) return "";
  return find(Localities, (b) => b.id === locality)?.label;
}

export function getGenderDisplay(gender: string | undefined) {
  if (isEmpty(gender)) return "";
  return find(Gender, (g) => g.id === gender)?.label;
}

export function filterAndGetFirstRole(roles: string[]) {
  if (isEmpty(roles)) return null;
  const filteredRoles = filter(roles, (role) => role !== "ADMIN");
  return filteredRoles[0];
}

export function getCapitalizedName(member: Member | Executive | Relative) {
  return `${capitalize(member?.firstName)} ${capitalize(member?.lastName)}`;
}

export function getIfAnyFilterPresent(filters: Record<string, unknown> | undefined) {
  const age = filters?.age as { min?: number; max?: number } | undefined;
  const ageActive =
    age != null &&
    (typeof age.min !== "number" || typeof age.max !== "number" || age.min !== 0 || age.max !== 100);
  return (
    filters?.bloodGroup ||
    filters?.showUnmarried ||
    filters?.businessType ||
    filters?.locality ||
    filters?.gender ||
    ageActive
  );
}

export function sortByKey<T>(array: T[], key: keyof T) {
  const newArray = [...array];
  return newArray.sort((a, b) =>
    String(a[key]).localeCompare(String(b[key]))
  );
}

export function getStringAfterRemovingSpace(str: string | undefined) {
  return str?.replace(/\s/g, "").trim();
}

export function getAge(dateString: string | undefined) {
  if (!dateString) return 0;
  const today = new Date();
  const birthDate = new Date(moment(dateString).format("yyyy-MM-DD"));
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

export function getTodayDateKey() {
  const today = new Date();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const date = String(today.getDate()).padStart(2, "0");
  const year = String(today.getFullYear());
  return `${date}${month}${year}`;
}

export { includes };
