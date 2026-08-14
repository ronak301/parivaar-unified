import { useSelector } from "react-redux";
import type { RootState } from "@/store";
import { Text } from "@/components/ui/Text";
import { themeColors } from "@/theme";
import { Spacer } from "@/components/ui/Spacer";
import MemberTile from "./MemberTile";
import TitleRow from "@/components/ui/TitleRow";
import { useNavigate } from "react-router-dom";
import { useCommunityConfig } from "@/hooks/useCommunityConfig";
import { Check } from "@/components/ui/Check";
import { resolveMediaUrl } from "@/utils/resolveMediaUrl";

export function Title({
  children,
  size = 18,
  style = {},
}: {
  children: React.ReactNode;
  size?: number;
  style?: React.CSSProperties;
}) {
  return (
    <Text bold style={{ fontWeight: 600, fontSize: size, paddingTop: 8, paddingBottom: 8, ...style }}>
      {children}
    </Text>
  );
}

export default function CommunityDetailsScreen() {
  const selectedCommunity = useSelector(
    (state: RootState) => state?.community?.selectedCommunity
  );
  const navigate = useNavigate();

  const president = {
    id: "1f39c54c-4a9f-4485-bea6-91e91126858c",
    name: "Arjun lal Khokhawat",
    profilePicture: "/assets/arjunji.jpeg",
    role: "President",
  };
  const secretary = {
    id: "b8e3545c-8e19-4574-9c5f-f32be8120121",
    name: "Vinod Kachhara",
    profilePicture: "/assets/vinodji.jpeg",
    role: "Secretary",
  };

  const coordinators = [
    {
      id: "9a095f36-7096-4653-bcb7-5e54ad360038",
      name: "Abhishek Pokharna",
      profilePicture: "/assets/abhishekji.jpeg",
      role: "Coordinator",
    },
    {
      id: "3d102aa6-163e-42e4-af2f-1168c4753b93",
      name: "Ronak Kothari",
      profilePicture: "/assets/ronakji.jpeg",
      role: "Coordinator",
    },
    {
      id: "30a5ef92-86a5-47f9-8689-545e8b3a7b4c",
      name: "Abhay Kothari",
      profilePicture: "/assets/abhayji.jpeg",
      role: "Coordinator",
    },
  ];

  const { loading, config } = useCommunityConfig();
  const showExtraInfo = config?.features?.AboutScreenExtraInfo;
  const logoUrl = resolveMediaUrl(selectedCommunity?.logo);

  if (loading) return null;

  return (
    <div style={{ backgroundColor: "white", paddingBottom: 32 }}>
      <div
        style={{
          padding: "24px 16px",
          alignItems: "center",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {logoUrl ? (
          <img
            src={logoUrl}
            alt=""
            style={{ width: 100, height: 100, borderRadius: 8, objectFit: "cover" }}
          />
        ) : (
          <div
            style={{
              width: 100,
              height: 100,
              borderRadius: 8,
              backgroundColor: themeColors.border,
            }}
          />
        )}
        <Text bold style={{ fontSize: 22, paddingTop: 16 }}>
          {selectedCommunity?.name}
        </Text>
        <Text
          bold
          style={{
            textAlign: "center",
            fontSize: 14,
            paddingBottom: 16,
            color: themeColors.textLight,
            lineHeight: 24,
          }}
        >
          {selectedCommunity?.description}
        </Text>
        <Text bold style={{ textAlign: "center", fontSize: 14, color: themeColors.textDark }}>
          {`Total Members - ${selectedCommunity?.totalMembers}`}
        </Text>
      </div>

      <Check ifPresent={showExtraInfo}>
        <Spacer />
        <TitleRow
          size={16}
          title="GeetMala (गीतमाला) - 110 songs"
          isNew
          onPress={() => navigate("/geetmala/all")}
        />
        <Spacer />

        <div style={{ padding: "16px", alignItems: "center" }}>
          <Title size={15}>Founding President & Secretary 2023-24</Title>
          <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", gap: 8 }}>
            <MemberTile
              id={president.id}
              profilePicture={president.profilePicture}
              name={president.name}
              role={president.role}
            />
            <MemberTile
              id={secretary.id}
              profilePicture={secretary.profilePicture}
              name={secretary.name}
              role={secretary.role}
            />
          </div>
        </div>

        <Spacer />
        <div style={{ padding: "16px", alignItems: "center" }}>
          <Title size={15}>Founding Coordinators</Title>
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
              paddingLeft: 8,
              paddingRight: 8,
              flexWrap: "wrap",
              gap: 8,
            }}
          >
            {coordinators.map((c) => (
              <MemberTile
                key={c.id}
                id={c.id}
                size={100}
                profilePicture={c.profilePicture}
                name={c.name}
                role={c.role}
              />
            ))}
          </div>
        </div>
      </Check>
    </div>
  );
}
