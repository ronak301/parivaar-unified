import { useMemo, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import {
  searchUser,
  createUser,
  addToCommunity,
  createRelation,
  getMemberDetails,
} from "@/api/directoryApi";
import type { RootState } from "@/store";
import { setProfileMeta } from "@/modules/profile/redux/profileSlice";
import { invalidateMembersListCache } from "@/modules/directory/redux/communitySlice";
import { unwrapApiBody } from "@/utils/unwrapApiBody";
import { getStringAfterRemovingSpace } from "@/utils/utils";
import { BloodGroups, FamilyMemberRelationshipTypes, Gender } from "@/utils/constants";
import type { Member } from "@/types/types";
import { Text } from "@/components/ui/Text";
import { BackButton } from "@/components/ui/BackButton";
import { Button } from "@/components/ui/Button";
import { themeColors } from "@/theme";

type HeadMember = Member & { root?: { id?: string } };

function parseHeadFromParams(userRaw: string | null): HeadMember | null {
  if (!userRaw) return null;
  try {
    return JSON.parse(decodeURIComponent(userRaw)) as HeadMember;
  } catch {
    return null;
  }
}

function pickCreatedUserId(body: unknown): string | undefined {
  const u = unwrapApiBody(body as Record<string, unknown>);
  return typeof u.id === "string" ? u.id : undefined;
}

function parseMemberFromDetailsResponse(res: unknown): Member | null {
  if (res == null || typeof res !== "object" || !("data" in (res as object))) {
    return null;
  }
  const axiosData = (res as { data?: unknown }).data;
  if (axiosData == null || typeof axiosData !== "object") return null;
  const flat = unwrapApiBody(axiosData as Record<string, unknown>);
  const nestedUser = flat.user;
  if (nestedUser && typeof nestedUser === "object" && !Array.isArray(nestedUser)) {
    return nestedUser as Member;
  }
  if (flat.id || flat.firstName) {
    return flat as unknown as Member;
  }
  return null;
}

export default function AddFamilyMemberPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const communityId = useSelector((s: RootState) => s.community.selectedCommunity?.id);
  const currentOpened = useSelector((s: RootState) => s.profile.meta.currentOpenedUser);

  const head = useMemo(() => parseHeadFromParams(params.get("user")), [params]);

  const [step, setStep] = useState<"phone" | "details">("phone");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const {
    register,
    handleSubmit,
    formState: { isValid },
  } = useForm({
    mode: "onChange",
    defaultValues: {
      relation: "",
      firstName: "",
      lastName: "",
      guardianName: "",
      education: "",
      bloodGroup: "",
      gender: "",
    },
  });

  const addressSource = (currentOpened?.id === head?.id ? currentOpened : head) as HeadMember | null;

  const onPhoneContinue = async () => {
    setErr("");
    const p = phone.trim();
    if (!p) {
      setStep("details");
      return;
    }
    if (p.length !== 10) {
      setErr("Enter a valid 10-digit number or leave empty.");
      return;
    }
    setLoading(true);
    try {
      const res = await searchUser(p);
      const flat = unwrapApiBody(res.data as Record<string, unknown>);
      const count = Number(flat.count ?? 0);
      if (count === 0) {
        setStep("details");
      } else {
        const rows = (flat.rows as Member[]) ?? [];
        setErr(
          `This number may already be registered (${rows[0]?.firstName ?? "user"}). Use a different number or leave empty.`
        );
      }
    } catch (e) {
      console.error(e);
      setErr("Could not verify the number.");
    } finally {
      setLoading(false);
    }
  };

  const onSubmitDetails = async (values: {
    relation: string;
    firstName: string;
    lastName: string;
    guardianName: string;
    education: string;
    bloodGroup: string;
    gender: string;
  }) => {
    if (!communityId || !head?.id) return;
    setLoading(true);
    setErr("");
    try {
      const p = phone.trim();
      const input: Record<string, unknown> = {
        firstName: values.firstName,
        lastName: values.lastName,
        fullName: getStringAfterRemovingSpace(`${values.firstName}${values.lastName}`),
        isAccountManager: false,
        parentNode: head.id,
        rootNode: head.root?.id,
        guardianName: values.guardianName || undefined,
        education: values.education || undefined,
        bloodGroup: values.bloodGroup || undefined,
        gender: values.gender || undefined,
        nativePlace: addressSource?.nativePlace,
        address: {
          fullAddress: addressSource?.address?.fullAddress,
          locality: addressSource?.address?.locality,
          city: "Udaipur",
          state: "Rajasthan",
        },
      };
      if (p.length === 10) {
        input.phone = p;
      }

      const res = await createUser(input);
      const relativeId = pickCreatedUserId(res.data);
      if (!relativeId) {
        setErr("Could not create family member.");
        return;
      }

      await addToCommunity(communityId, relativeId);
      await createRelation(head.id, relativeId, values.relation);

      const detailsRes = await getMemberDetails(head.id);
      const updated = parseMemberFromDetailsResponse(detailsRes);
      if (updated) {
        dispatch(
          setProfileMeta({
            currentOpenedUser: updated,
            shouldUpdateUser: true,
            shouldUpdateUserId: head.id,
          })
        );
      }

      dispatch(invalidateMembersListCache(communityId));
      navigate(-1);
    } catch (e) {
      console.error(e);
      setErr("Failed to add family member.");
    } finally {
      setLoading(false);
    }
  };

  if (!head?.id) {
    return (
      <div style={{ padding: 16, minHeight: "100vh", backgroundColor: "white" }}>
        <header style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
          <BackButton />
          <Text bold>Add family member</Text>
        </header>
        <Text style={{ color: "#666" }}>Missing family head. Open a profile and use &quot;Add family member&quot; again.</Text>
      </div>
    );
  }

  if (!communityId) {
    return (
      <div style={{ padding: 16, minHeight: "100vh", backgroundColor: "white" }}>
        <header style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
          <BackButton />
          <Text bold>Add family member</Text>
        </header>
        <Text style={{ marginBottom: 16 }}>Select a community first.</Text>
        <Button title="Go to communities" onPress={() => navigate("/community/all")} />
      </div>
    );
  }

  return (
    <div style={{ padding: 16, minHeight: "100vh", backgroundColor: "white", paddingBottom: 32 }}>
      <header style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
        <BackButton />
        <Text bold>Add family member</Text>
      </header>

      {step === "phone" && (
        <div>
          <Text style={{ marginBottom: 12, fontSize: 13, color: "#444" }}>
            Adding family member for {head.firstName}
            {head.lastName ? ` ${head.lastName}` : ""}
          </Text>
          <Text style={{ fontSize: 12, color: "#666", marginBottom: 8 }}>
            Phone (optional). Leave empty if they do not have a mobile number.
          </Text>
          <input
            inputMode="numeric"
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
            placeholder="10-digit mobile"
            style={{ width: "100%", height: 44, marginBottom: 12, fontSize: 16 }}
          />
          {err ? (
            <Text style={{ color: "#c00", marginBottom: 8, fontSize: 14 }}>{err}</Text>
          ) : null}
          <Button title="Continue" loading={loading} onPress={() => void onPhoneContinue()} />
        </div>
      )}

      {step === "details" && (
        <form onSubmit={handleSubmit(onSubmitDetails)}>
          <Text style={{ marginBottom: 12, fontSize: 13 }}>
            {phone.trim() ? `Phone: ${phone.trim()}` : "No phone number"}
          </Text>

          <label style={{ display: "block", marginBottom: 8 }}>
            <Text>Relation</Text>
            <select
              {...register("relation", { required: true })}
              style={{ width: "100%", height: 44, marginTop: 4 }}
            >
              <option value="">Select relation</option>
              {FamilyMemberRelationshipTypes.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.label}
                </option>
              ))}
            </select>
          </label>
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
            <Text>Education</Text>
            <textarea {...register("education", { maxLength: 200 })} rows={3} style={{ width: "100%", marginTop: 4 }} />
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
              width: "100%",
              height: 48,
              borderRadius: 10,
              border: "none",
              background: !isValid || loading ? "#ccc" : themeColors.primary,
              color: "white",
              fontWeight: 600,
              fontSize: 16,
              cursor: !isValid || loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Please wait…" : "Add family member"}
          </button>
        </form>
      )}
    </div>
  );
}
