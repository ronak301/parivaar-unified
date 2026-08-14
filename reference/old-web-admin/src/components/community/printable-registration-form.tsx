"use client";

import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";

function BlankField({ label, wide = false }: { label: string; wide?: boolean }) {
  return (
    <div className={wide ? "col-span-2" : undefined}>
      <p className="text-xs text-muted-foreground">{label}</p>
      <div className="mt-4 border-b border-foreground/40" />
    </div>
  );
}

const FAMILY_MEMBER_COLUMNS = [
  "Relation",
  "First Name",
  "Last Name",
  "Phone",
  "Gender",
  "Blood Group",
  "Education",
];

const BLANK_ROWS = 8;

export function PrintableRegistrationForm({
  communityName,
}: {
  communityName: string;
}) {
  return (
    <div className="mx-auto max-w-3xl space-y-8 p-8 print:p-0">
      <div className="flex items-center justify-between print:hidden">
        <p className="text-sm text-muted-foreground">
          Fill this out by hand and submit it to a community admin.
        </p>
        <Button onClick={() => window.print()}>
          <Printer className="size-3.5" />
          Print
        </Button>
      </div>

      <div className="text-center">
        <h1 className="text-2xl font-bold">{communityName}</h1>
        <p className="mt-1 text-muted-foreground">Family Registration Form</p>
      </div>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Head of Family — Personal Info
        </h2>
        <div className="grid grid-cols-2 gap-6">
          <BlankField label="First Name" />
          <BlankField label="Last Name" />
          <BlankField label="Phone Number" />
          <BlankField label="Email" />
          <BlankField label="Date of Birth" />
          <BlankField label="Guardian Name" />
          <BlankField label="Native Place" />
          <BlankField label="Gender" />
          <BlankField label="Wedding Date" />
          <BlankField label="Education" />
          <BlankField label="Blood Group" />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Address
        </h2>
        <div className="grid grid-cols-2 gap-6">
          <BlankField label="Full Address" wide />
          <BlankField label="Locality" />
          <BlankField label="State" />
          <BlankField label="City" />
          <BlankField label="Pincode" />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Business (optional)
        </h2>
        <div className="grid grid-cols-2 gap-6">
          <BlankField label="Name" />
          <BlankField label="Phone" />
          <BlankField label="Website" />
          <BlankField label="Description" wide />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Family Members
        </h2>
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr>
              {FAMILY_MEMBER_COLUMNS.map((col) => (
                <th
                  key={col}
                  className="border border-foreground/30 p-2 text-left font-medium"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: BLANK_ROWS }).map((_, i) => (
              <tr key={i}>
                {FAMILY_MEMBER_COLUMNS.map((col) => (
                  <td key={col} className="border border-foreground/30 p-2 h-10" />
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
