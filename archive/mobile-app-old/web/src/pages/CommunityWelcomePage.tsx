import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";
import { Text } from "@/components/ui/Text";
import { Button } from "@/components/ui/Button";
import { Title } from "@/modules/directory/screens/CommunityDetailsScreen/CommunityDetailsScreen";
import MemberTile from "@/modules/directory/screens/CommunityDetailsScreen/MemberTile";

export default function CommunityWelcomePage() {
  const navigate = useNavigate();
  const selected = useSelector((s: RootState) => s.community.selectedCommunity);

  const president = {
    profilePicture: "/assets/arjunji.jpeg",
    name: "Arjun lal Khokhawat",
    role: "President",
    number: "9353502843",
  };
  const secretary = {
    profilePicture: "/assets/vinodji.jpeg",
    name: "Vinod Kachhara",
    role: "Secretary",
    number: "9414232279",
  };
  const coordinators = [
    {
      profilePicture: "/assets/abhishekji.jpeg",
      name: "Abhishek Pokharna",
      role: "Coordinator",
      number: "9829074922",
    },
    {
      profilePicture: "/assets/ronakji.jpeg",
      name: "Ronak Kothari",
      role: "Coordinator",
      number: "7042770304",
    },
    {
      profilePicture: "/assets/abhayji.jpeg",
      name: "Abhay Kothari",
      role: "Coordinator",
      number: "9649354356",
    },
  ];

  return (
    <div
      style={{
        padding: "8px 16px 120px",
        overflowY: "auto",
        maxHeight: "100vh",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
        <Text bold style={{ fontSize: 10, paddingBottom: 8 }}>
          जय भिक्षु
        </Text>
        <Text bold style={{ fontSize: 10, paddingBottom: 8 }}>
          जय महाश्रमण
        </Text>
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          marginBottom: 16,
          alignItems: "center",
        }}
      >
        <img
          src="/assets/marasa.jpg"
          alt=""
          style={{ width: 50, height: 50, borderRadius: 999, objectFit: "cover" }}
        />
        <div style={{ paddingLeft: 16, paddingRight: 16, textAlign: "center" }}>
          <Text bold style={{ fontSize: 18, fontWeight: 700 }}>
            तेरापंथ उदयपुर मोबाइल एप
          </Text>
          <Text style={{ paddingTop: 4, fontSize: 16 }}>पर आपका हार्दिक स्वागत है।</Text>
        </div>
        <img
          src="/assets/marasa.jpg"
          alt=""
          style={{ width: 50, height: 50, borderRadius: 999, objectFit: "cover" }}
        />
      </div>

      <div
        style={{
          backgroundColor: "#0777FF",
          padding: 16,
          borderRadius: 8,
          marginBottom: 16,
        }}
      >
        <Text bold style={{ color: "white", textAlign: "center", fontSize: 20 }}>
          Digital Directory
        </Text>
        <Text bold style={{ color: "white", textAlign: "center", fontSize: 18, paddingTop: 8 }}>
          श्री जैन श्वेताम्बर तेरापंथी सभा, उदयपुर
        </Text>
      </div>

      <div style={{ paddingTop: 16, paddingBottom: 16, alignItems: "center" }}>
        <Title size={15}>Founding President & Secretary 2022-24</Title>
        <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", gap: 8 }}>
          <MemberTile profilePicture={president.profilePicture} name={president.name} role={president.role} number={president.number} />
          <MemberTile profilePicture={secretary.profilePicture} name={secretary.name} role={secretary.role} number={secretary.number} />
        </div>
      </div>

      <div style={{ marginTop: 0, paddingBottom: 16, alignItems: "center" }}>
        <Title size={14}>Founding Coordinators</Title>
        <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
          {coordinators.map((c, i) => (
            <MemberTile
              key={i}
              size={100}
              profilePicture={c.profilePicture}
              name={c.name}
              role={c.role}
              number={c.number}
            />
          ))}
        </div>
      </div>

      <Button
        style={{ marginTop: 16 }}
        onPress={() =>
          navigate(selected?.id ? `/community/${selected.id}` : "/community/all")
        }
        title="Continue to Directory"
      />
    </div>
  );
}
