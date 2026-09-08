import type { ExportMember, ExportColumnConfig } from './members-pdf';
import { DEFAULT_EXPORT_COLUMNS, memberAddress, memberName, safeFileName } from './members-pdf';

function csvCell(value: string): string {
  let v = value.replace(/\r?\n/g, ' ');
  if (/^[=+\-@\t\r]/.test(v)) v = `'${v}`;
  return `"${v.replace(/"/g, '""')}"`;
}

export function downloadMembersCsv({
  communityName,
  members,
  columns = DEFAULT_EXPORT_COLUMNS,
}: {
  communityName: string;
  members: ExportMember[];
  columns?: ExportColumnConfig;
}): void {
  type Col = { header: string; getValue: (m: ExportMember) => string };
  const cols: Col[] = [{ header: 'Serial No.', getValue: () => '' }];
  if (columns.name) cols.push({ header: 'Name', getValue: (m) => memberName(m, '', columns.nameFormat) });
  if (columns.phone) cols.push({ header: 'Number', getValue: (m) => m.phone?.trim() || '' });
  if (columns.address) cols.push({ header: 'Address', getValue: (m) => memberAddress(m, '') });
  if (columns.locality) cols.push({ header: 'Locality', getValue: (m) => m.address?.locality?.trim() || '' });

  const sorted = columns.nameFormat === 'lastFirst'
    ? [...members].sort((a, b) => {
        const aL = (a.lastName ?? '').toLowerCase();
        const bL = (b.lastName ?? '').toLowerCase();
        if (aL !== bL) return aL.localeCompare(bL);
        return (a.firstName ?? '').toLowerCase().localeCompare((b.firstName ?? '').toLowerCase());
      })
    : members;

  const lines = [
    cols.map((c) => csvCell(c.header)).join(','),
    ...sorted.map((m, i) =>
      cols.map((c, ci) => csvCell(ci === 0 ? String(i + 1) : c.getValue(m))).join(','),
    ),
  ];
  const blob = new Blob(['﻿' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${safeFileName(communityName)}-members-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
