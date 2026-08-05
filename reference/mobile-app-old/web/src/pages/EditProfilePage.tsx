import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { getMemberDetails } from "@/api/directoryApi";
import { updateUser } from "@/api/authApi";
import { useApi } from "@/api/useApi";
import type { RootState } from "@/store";
import { Text } from "@/components/ui/Text";
import { Button } from "@/components/ui/Button";
import { LoadingComponent } from "@/components/ui/LoadingComponent";
import { setProfileMeta } from "@/modules/profile/redux/profileSlice";
import { BackButton } from "@/components/ui/BackButton";

export default function EditProfilePage() {
  const currentUser = useSelector((s: RootState) => s.auth.currentUser);
  const dispatch = useDispatch();
  const { loading, request } = useApi(getMemberDetails);
  const { register, handleSubmit, reset } = useForm({
    defaultValues: { firstName: "", lastName: "", education: "" },
  });

  useEffect(() => {
    if (!currentUser?.id) return;
    void (async () => {
      const res = await request(currentUser.id);
      const member = (res as { data?: { data?: Record<string, string> } })?.data?.data;
      if (member) {
        reset({
          firstName: member.firstName ?? "",
          lastName: member.lastName ?? "",
          education: member.education ?? "",
        });
      }
    })();
  }, [currentUser?.id, request, reset]);

  const onSubmit = async (values: { firstName: string; lastName: string; education: string }) => {
    if (!currentUser?.id) return;
    await updateUser(currentUser.id, values);
    const res = await request(currentUser.id);
    const member = (res as { data?: { data?: Record<string, unknown> } })?.data?.data;
    dispatch(
      setProfileMeta({
        currentOpenedUser: member,
        shouldUpdateUser: true,
        shouldUpdateUserId: currentUser.id,
      })
    );
    window.history.back();
  };

  if (loading) return <LoadingComponent />;

  return (
    <div style={{ padding: 16, minHeight: "100vh", backgroundColor: "white" }}>
      <header style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
        <BackButton />
        <Text bold style={{ fontSize: 18 }}>
          Edit Profile
        </Text>
      </header>
      <form onSubmit={handleSubmit(onSubmit)}>
        <label style={{ display: "block", marginBottom: 8 }}>
          <Text>First name</Text>
          <input {...register("firstName")} style={{ width: "100%", height: 44, marginTop: 4 }} />
        </label>
        <label style={{ display: "block", marginBottom: 8 }}>
          <Text>Last name</Text>
          <input {...register("lastName")} style={{ width: "100%", height: 44, marginTop: 4 }} />
        </label>
        <label style={{ display: "block", marginBottom: 16 }}>
          <Text>Education</Text>
          <input {...register("education")} style={{ width: "100%", height: 44, marginTop: 4 }} />
        </label>
        <Button title="Save" onPress={() => handleSubmit(onSubmit)()} />
      </form>
    </div>
  );
}
