import Link from 'next/link';
import { Award, ChevronRight, UserRound } from 'lucide-react';
import type { Designation } from '@parivaar/shared';

/** Order office bearers by seniority when designations use common titles. */
const RANK: Array<[RegExp, number]> = [
  [/patron|sanrakshak/i, 0],
  [/president|adhyaksh/i, 1],
  [/vice.?president|upadhyaksh/i, 2],
  [/general secretary|mahamantri|mantri/i, 3],
  [/secretary|sachiv/i, 4],
  [/treasurer|koshadhyaksh/i, 5],
  [/joint/i, 6],
];

function rankOf(d: Designation): number {
  for (const [re, r] of RANK) if (re.test(d.designation)) return r;
  return 50;
}

function groupByYear(list: Designation[]): Array<{ year: string; items: Designation[] }> {
  const map = new Map<string, Designation[]>();
  for (const d of list) {
    const key = d.year?.trim() || 'Current';
    map.set(key, [...(map.get(key) ?? []), d]);
  }
  return [...map.entries()]
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([year, items]) => ({ year, items: items.sort((a, b) => rankOf(a) - rankOf(b)) }));
}

function ExecutiveCard({ d }: { d: Designation }) {
  const content = (
    <div className="flex items-center gap-3 rounded-xl bg-m-surface p-3 ring-1 ring-m-line">
      {d.photo ? (
        <img src={d.photo} alt="" className="size-12 shrink-0 rounded-full object-cover ring-2 ring-m-brand/15" />
      ) : (
        <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-m-brand/10 text-m-brand">
          <UserRound className="size-5" />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-m-ink">{d.name}</p>
        <p className="truncate text-xs font-semibold text-m-brand">{d.designation}</p>
        {d.sansthan && <p className="truncate text-xs text-m-ink-2">{d.sansthan}</p>}
      </div>
      {d.memberId && <ChevronRight className="size-4 shrink-0 text-m-ink-3" />}
    </div>
  );

  // Executives linked to a member record open that member's profile.
  return d.memberId ? (
    <Link href={`/m/member/${d.memberId}`} className="block active:opacity-80">
      {content}
    </Link>
  ) : (
    content
  );
}

export function ExecutiveCommittee({ designations }: { designations: Designation[] }) {
  if (designations.length === 0) {
    return (
      <div className="m-card flex flex-col items-center gap-2 px-6 py-10 text-center">
        <div className="flex size-12 items-center justify-center rounded-full bg-m-brand/10 text-m-brand">
          <Award className="size-5" />
        </div>
        <p className="text-sm font-semibold text-m-ink">Committee not published yet</p>
        <p className="text-xs text-m-ink-2">Office bearers will appear here once the admin adds them.</p>
      </div>
    );
  }

  const groups = groupByYear(designations);

  return (
    <div className="flex flex-col gap-5">
      {groups.map(({ year, items }) => (
        <section key={year}>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-sm font-bold text-m-ink">
              {groups.length > 1 || year !== 'Current' ? `Term ${year}` : 'Office bearers'}
            </h2>
            <span className="text-xs text-m-ink-2">{items.length} members</span>
          </div>
          <div className="flex flex-col gap-2">
            {items.map((d) => (
              <ExecutiveCard key={d.id} d={d} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
