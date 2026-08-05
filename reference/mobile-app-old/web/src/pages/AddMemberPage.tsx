import { useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { includes, map } from "lodash";
import { searchUser, createUser, addToCommunity } from "@/api/directoryApi";
import type { RootState } from "@/store";
import { invalidateMembersListCache } from "@/modules/directory/redux/communitySlice";
import { unwrapApiBody } from "@/utils/unwrapApiBody";
import { getStringAfterRemovingSpace } from "@/utils/utils";
import { BloodGroups, Gender } from "@/utils/constants";
import type { Member } from "@/types/types";
import { Text } from "@/components/ui/Text";
import { BackButton } from "@/components/ui/BackButton";
import { Button } from "@/components/ui/Button";
import MemberItem from "@/modules/directory/components/MemberItem";

type MemberSearchRow = Member & { communities?: { id?: string }[] };

type Step = "phone" | "newUser" | "existingUser";

function pickCreatedUserId(body: unknown): string | undefined {
  const u = unwrapApiBody(body as Record<string, unknown>);
  return typeof u.id === "string" ? u.id : undefined;
}

export default function AddMemberPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const communityId = useSelector((s: RootState) => s.community.selectedCommunity?.id);

  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [foundUser, setFoundUser] = useState<MemberSearchRow | null>(null);

  const {
    register,
    handleSubmit,
    formState: { isValid },
  } = useForm({
    mode: "onChange",
    defaultValues: {
      firstName: "",
      lastName: "",
      guardianName: "",
      bloodGroup: "",
      gender: "",
    },
  });

  const onPhoneContinue = async () => {
    setErr("");
    if (!communityId) return;
    if (phone.trim().length !== 10) {
      setErr("Please enter a valid 10-digit phone number.");
      return;
    }
    setLoading(true);
    try {
      const res = await searchUser(phone.trim());
      const flat = unwrapApiBody(res.data as Record<string, unknown>);
      const count = Number(flat.count ?? 0);
      const rows = (flat.rows as MemberSearchRow[]) ?? [];
      if (count === 0) {
        setStep("newUser");
        return;
      }
      const u = rows[0];
      const commIds = map(u.communities, (c) => c?.id).filter(Boolean) as string[];
      if (includes(commIds, communityId)) {
        setErr(
          `This number is already in this community (${u.firstName ?? ""} ${u.lastName ?? ""}).`
        );
        return;
      }
      setFoundUser(u);
      setStep("existingUser");
    } catch (e) {
      console.error(e);
      setErr("Could not verify the number. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const onCreateNewMember = async (values: {
    firstName: string;
    lastName: string;
    guardianName: string;
    bloodGroup: string;
    gender: string;
  }) => {
    if (!communityId) return;
    setLoading(true);
    setErr("");
    try {
      const input = {
        firstName: values.firstName,
        lastName: values.lastName,
        fullName: getStringAfterRemovingSpace(`${values.firstName}${values.lastName}`),
        isAccountManager: true,
        guardianName: values.guardianName || undefined,
        gender: values.gender || undefined,
        bloodGroup: values.bloodGroup || undefined,
        phone,
        parent: null,
        address: {
          city: "Udaipur",
          state: "Rajasthan",
        },
      };
      const res = await createUser(input);
      const userId = pickCreatedUserId(res.data);
      if (!userId) {
        setErr("Could not create user. Please try again.");
        return;
      }
      await addToCommunity(communityId, userId);
      dispatch(invalidateMembersListCache(communityId));
      navigate(`/community/${communityId}`);
    } catch (e) {
      console.error(e);
      setErr("Failed to add member.");
    } finally {
      setLoading(false);
    }
  };

  const onAddExistingToCommunity = async () => {
    if (!communityId || !foundUser?.id) return;
    setLoading(true);
    setErr("");
    try {
      await addToCommunity(communityId, foundUser.id);
      dispatch(invalidateMembersListCache(communityId));
      navigate(`/community/${communityId}`);
    } catch (e) {
      console.error(e);
      setErr("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  if (!communityId) {
    return (
      <div style={{ padding: 16, minHeight: "100vh", backgroundColor: "white" }}>
        <header style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
          <BackButton />
          <Text bold>Add member</Text>
        </header>
        <Text style={{ marginBottom: 16 }}>Select a community from Home first.</Text>
        <Button title="Go to communities" onPress={() => navigate("/community/all")} />
      </div>
    );
  }

  return (
    <div style={{ padding: 16, minHeight: "100vh", backgroundColor: "white", paddingBottom: 32 }}>
      <header style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
        <BackButton />
        <Text bold>Add member</Text>
      </header>

      {step === "phone" && (
        <div>
          <label style={{ display: "block", marginBottom: 8 }}>
            <Text>Phone number</Text>
            <input
              inputMode="numeric"
              autoComplete="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
              placeholder="10-digit mobile"
              style={{ width: "100%", height: 44, marginTop: 4, fontSize: 16 }}
            />
          </label>
          {err ? (
            <Text style={{ color: "#c00", marginBottom: 8, fontSize: 14 }}>{err}</Text>
          ) : null}
          <Button
            title="Continue"
            loading={loading}
            onPress={() => void onPhoneContinue()}
            disabled={phone.trim().length !== 10}
          />
        </div>
      )}

      {step === "newUser" && (
        <form
          onSubmit={handleSubmit(onCreateNewMember)}
          style={{ display: "flex", flexDirection: "column", gap: 0 }}
        >
          <Text style={{ marginBottom: 12, color: "#666" }}>Phone: {phone}</Text>
          <label style={{ display: "block", marginBottom: 8 }}>
            <Text>First name</Text>
            <input
              {...register("firstName", { required: true, maxLength: 30 })}
              style={{ width: "100%", height: 44, marginTop: 4 }}
            />
          </label>
          <label style={{ display: "block", marginBottom: 8 }}>
            <Text>Last name</Text>
            <input
              {...register("lastName", { required: true, maxLength: 30 })}
              style={{ width: "100%", height: 44, marginTop: 4 }}
            />
          </label>
          <label style={{ display: "block", marginBottom: 8 }}>
            <Text>Guardian name</Text>
            <input {...register("guardianName", { maxLength: 30 })} style={{ width: "100%", height: 44, marginTop: 4 }} />
          </label>
          <label style={{ display: "block", marginBottom: 8 }}>
            <Text>Blood group</Text>
            <select {...register("bloodGroup")} style={{ width: "100%", height: 44, marginTop: 4 }}>
              <option value="">—</option>
              {BloodGroups.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.label}
                </option>
              ))}
            </select>
          </label>
          <label style={{ display: "block", marginBottom: 16 }}>
            <Text>Gender</Text>
            <select {...register("gender")} style={{ width: "100%", height: 44, marginTop: 4 }}>
              <option value="">—</option>
              {Gender.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.label}
                </option>
              ))}
            </select>
          </label>
          {err ? (
            <Text style={{ color: "#c00", marginBottom: 8, fontSize: 14 }}>{err}</Text>
          ) : null}
          <button
            type="submit"
            disabled={!isValid || loading}
            style={{
              marginTop: 8,
              height: 48,
              borderRadius: 10,
              border: "none",
              background: !isValid || loading ? "#ccc" : "#0777FF",
              color: "white",
              fontWeight: 600,
              fontSize: 16,
              cursor: !isValid || loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Please wait…" : "Add member"}
          </button>
        </form>
      )}

      {step === "existingUser" && foundUser && (
        <div>
          <Text style={{ marginBottom: 12 }}>
            We found this profile for the number you entered. Add them to this community?
          </Text>
          <div style={{ marginBottom: 16, pointerEvents: "none" }}>
            <MemberItem member={foundUser} />
          </div>
          {err ? (
            <Text style={{ color: "#c00", marginBottom: 8, fontSize: 14 }}>{err}</Text>
          ) : null}
          <Button title="Add user to community" loading={loading} onPress={() => void onAddExistingToCommunity()} />
        </div>
      )}
    </div>
  );
}
