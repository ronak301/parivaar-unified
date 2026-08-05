import MembersList from "@/modules/directory/components/MembersList";

/** Community directory: members list (fills tab content; scroll lives inside MembersList). */
export default function DirectoryScreen() {
  return (
    <div
      style={{
        flex: 1,
        minHeight: 0,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <MembersList />
    </div>
  );
}
