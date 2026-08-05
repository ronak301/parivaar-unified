import { useState } from "react";
import moment from "moment";
import { useMemberDetails } from "@/modules/directory/hooks/useMemberDetails";
import { Check } from "@/components/ui/Check";
import { themeColors } from "@/theme";
import {
  getAge,
  getBloodGroupDisplay,
  getCapitalizedName,
  useIfRelativeProfile,
} from "@/utils/utils";
import MoreProfileInformation from "./MoreProfileInformation";
import { useDispatch } from "react-redux";
import { isEmpty } from "lodash";
import { NoDataComponent } from "@/components/ui/NoDataComponent";
import MemberImage from "@/components/ui/MemberImage";
import { pickMemberAvatarUrl } from "@/utils/resolveMediaUrl";
import { Text } from "@/components/ui/Text";
import { useNavigate } from "react-router-dom";
import { setProfileMeta } from "@/modules/profile/redux/profileSlice";
import Tag from "./Tag";
import FamilyMemberDetails from "./FamilyMemberDetails";
import { useProfileExtraInfo } from "@/modules/profile/utils";
import { useLogout } from "@/hooks/useLogout";
import { Button } from "@/components/ui/Button";
import { ProfileHeaderContactIcons } from "@/components/ui/ContactActionIcons";

export default function Profile() {
  const { memberDetails } = useMemberDetails();
  const noOfFamilyMembers = memberDetails?.relatives?.length || 0;
  const [showCTA, setShowCTA] = useState(!!noOfFamilyMembers);
  const [selectedIndex, setIndex] = useState(0);
  const { logout } = useLogout();
  const { isSelfProfile, isSuperAdmin, isFamilyHead } = useProfileExtraInfo(memberDetails ?? undefined);

  const navigate = useNavigate();
  const isFamilyMember = useIfRelativeProfile(memberDetails ?? undefined);

  const showEditProfileButton = isSelfProfile || isFamilyMember || isSuperAdmin;
  const dispatch = useDispatch();
  const showAddFamilyMemberButton = !!(isSelfProfile || isSuperAdmin);

  if (isEmpty(memberDetails)) {
    return <NoDataComponent />;
  }

  return (
    <div style={{ flex: 1, paddingBottom: 16 }}>
      <div
        style={{
          paddingLeft: 16,
          paddingRight: 16,
          backgroundColor: "white",
          paddingTop: 16,
          paddingBottom: 20,
          borderBottom: "1px solid rgb(220,220,220)",
        }}
      >
        <div style={{ display: "flex", flexDirection: "row", alignItems: "flex-start", gap: 12 }}>
          <MemberImage
            url={pickMemberAvatarUrl(memberDetails ?? {})}
            initials={[memberDetails?.firstName, memberDetails?.lastName]}
            size={88}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: 8,
                flexWrap: "wrap",
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 0 }}>
                <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                  <Text bold style={{ fontSize: 16 }}>
                    {getCapitalizedName(memberDetails)}
                  </Text>
                  <Check ifPresent={memberDetails?.dob}>
                    <span
                      style={{
                        width: 4,
                        height: 4,
                        borderRadius: 8,
                        backgroundColor: "rgb(153,153,153)",
                        flexShrink: 0,
                      }}
                    />
                    <Text style={{ fontSize: 11 }}>{`${getAge(memberDetails?.dob)} yr`}</Text>
                  </Check>
                </div>
                <Check ifPresent={memberDetails?.guardianName}>
                  <Text style={{ fontSize: 14 }}>{memberDetails.guardianName}</Text>
                </Check>
                <Check ifPresent={memberDetails?.phone}>
                  <Text style={{ fontSize: 14, color: themeColors.textLight }}>{memberDetails.phone}</Text>
                </Check>
              </div>
              <Check ifPresent={isFamilyHead}>
                <Tag text="Family Head" />
              </Check>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginTop: 12,
                gap: 12,
                flexWrap: "wrap",
              }}
            >
              {memberDetails.phone ? <ProfileHeaderContactIcons phone={memberDetails.phone} /> : null}
              <Check ifPresent={showEditProfileButton}>
                <Button
                  size="md"
                  style={{ borderRadius: 8, height: 36, width: "auto", flexShrink: 0 }}
                  title="Edit Profile"
                  onPress={() => {
                    dispatch(setProfileMeta({ currentOpenedUser: memberDetails }));
                    navigate("/editprofile");
                  }}
                />
              </Check>
            </div>
          </div>
        </div>

        <div
          style={{
            marginTop: 16,
            display: "flex",
            flexDirection: "row",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <Check ifPresent={memberDetails?.dob}>
            <div
              style={{
                flex: "1 1 140px",
                minWidth: 0,
                padding: "12px 14px",
                backgroundColor: "#EFFFF1",
                borderRadius: 8,
                textAlign: "center",
              }}
            >
              <Text style={{ fontSize: 11, marginBottom: 6, color: themeColors.textLight, display: "block" }}>
                Date of birth
              </Text>
              <Text bold style={{ fontSize: 15, fontWeight: 600, lineHeight: 1.35 }}>
                {memberDetails.dob ? moment(new Date(memberDetails.dob)).format("DD-MMM-YYYY") : ""}
              </Text>
            </div>
          </Check>

          <div
            style={{
              flex: "1 1 140px",
              minWidth: 0,
              padding: "12px 14px",
              backgroundColor: "#FFF3F3",
              borderRadius: 8,
              textAlign: "center",
            }}
          >
            <Text style={{ fontSize: 11, fontWeight: 500, marginBottom: 6, color: themeColors.textLight, display: "block" }}>
              Blood group
            </Text>
            <Text bold style={{ fontSize: 15, fontWeight: 600, lineHeight: 1.35 }}>
              {getBloodGroupDisplay(memberDetails?.bloodGroup)}
            </Text>
          </div>
        </div>

        <Check ifPresent={showCTA}>
          <Button onPress={() => setShowCTA(false)} style={{ marginTop: 20 }} title="Show Complete Profile" />
        </Check>
      </div>

      <Check ifPresent={!showCTA}>
        <MoreProfileInformation selectedIndex={selectedIndex} setIndex={setIndex} />
      </Check>

      <FamilyMemberDetails
        memberDetails={memberDetails}
        showAddFamilyMemberButton={showAddFamilyMemberButton}
      />

      <Check ifPresent={isSelfProfile}>
        <div
          style={{
            marginTop: 8,
            backgroundColor: "white",
            borderTop: `1px solid ${themeColors.border}`,
            borderBottom: `1px solid ${themeColors.border}`,
            borderRadius: 0,
          }}
        >
          <div style={{ padding: "14px 16px", borderBottom: `1px solid ${themeColors.border}` }}>
            <Text style={{ fontSize: 12, color: themeColors.textLight }}>Version</Text>
            <Text style={{ fontSize: 15, marginTop: 6, fontWeight: 500 }}>
              {`Web ${import.meta.env.VITE_APP_VERSION ?? "dev"}`}
            </Text>
          </div>
          <button
            type="button"
            onClick={() => {
              if (window.confirm("Are you sure you want to log out?")) {
                logout();
              }
            }}
            style={{
              width: "100%",
              textAlign: "left",
              padding: "14px 16px",
              border: "none",
              background: "white",
              cursor: "pointer",
              fontSize: 15,
              fontWeight: 500,
              color: themeColors.textDark,
            }}
          >
            Logout
          </button>
        </div>
      </Check>
    </div>
  );
}
