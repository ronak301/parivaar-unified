import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface ExportMember {
  firstName?: string;
  lastName?: string;
  fullName?: string;
  phone?: string;
  address?: {
    fullAddress?: string;
    city?: string;
    district?: string;
    pincode?: string;
    locality?: string;
  };
}

export type NameFormat = 'firstLast' | 'lastFirst';

export interface ExportColumnConfig {
  name: boolean;
  phone: boolean;
  address: boolean;
  locality: boolean;
  nameFormat: NameFormat;
}

export const DEFAULT_EXPORT_COLUMNS: ExportColumnConfig = {
  name: true,
  phone: true,
  address: true,
  locality: true,
  nameFormat: 'firstLast',
};

export function memberName(m: ExportMember, empty = '—', format: NameFormat = 'firstLast'): string {
  if (format === 'lastFirst') {
    const first = m.firstName?.trim();
    const last = m.lastName?.trim();
    if (last && first) return `${last} ${first}`;
    if (last) return last;
    if (first) return first;
    return m.fullName?.trim() || empty;
  }
  return (m.fullName || [m.firstName, m.lastName].filter(Boolean).join(' ')).trim() || empty;
}

export function memberAddress(m: ExportMember, empty = '—'): string {
  const a = m.address;
  if (!a) return empty;
  if (a.fullAddress?.trim()) return a.fullAddress.trim();
  const parts = [a.city, a.district, a.pincode].map((p) => p?.trim()).filter(Boolean);
  return parts.length ? parts.join(', ') : empty;
}

export function safeFileName(name: string): string {
  return name.replace(/[^a-z0-9]+/gi, '-').replace(/^-+|-+$/g, '').toLowerCase() || 'members';
}

function sortedMembers(members: ExportMember[], format: NameFormat): ExportMember[] {
  if (format !== 'lastFirst') return members;
  return [...members].sort((a, b) => {
    const aLast = (a.lastName ?? '').toLowerCase();
    const bLast = (b.lastName ?? '').toLowerCase();
    if (aLast !== bLast) return aLast.localeCompare(bLast);
    const aFirst = (a.firstName ?? '').toLowerCase();
    const bFirst = (b.firstName ?? '').toLowerCase();
    return aFirst.localeCompare(bFirst);
  });
}

const FONT_URL = 'https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/notosansdevanagari/NotoSansDevanagari%5Bwdth%2Cwght%5D.ttf';

let cachedFontBase64: string | null = null;

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  const chunks: string[] = [];
  const CHUNK = 8192;
  for (let i = 0; i < bytes.length; i += CHUNK) {
    chunks.push(String.fromCharCode(...bytes.subarray(i, i + CHUNK)));
  }
  return btoa(chunks.join(''));
}

async function loadDevanagariFont(doc: jsPDF): Promise<boolean> {
  try {
    if (!cachedFontBase64) {
      const res = await fetch(FONT_URL);
      if (!res.ok) return false;
      const buf = await res.arrayBuffer();
      cachedFontBase64 = arrayBufferToBase64(buf);
    }
    doc.addFileToVFS('NotoSansDevanagari-Regular.ttf', cachedFontBase64);
    doc.addFont('NotoSansDevanagari-Regular.ttf', 'NotoSansDevanagari', 'normal', undefined, 'Identity-H');
    return true;
  } catch {
    return false;
  }
}

export interface MembersPdfOptions {
  communityName: string;
  members: ExportMember[];
  filterSummary?: string;
  columns?: ExportColumnConfig;
}

export async function downloadMembersPdf({ communityName, members, filterSummary, columns = DEFAULT_EXPORT_COLUMNS }: MembersPdfOptions): Promise<void> {
  const sorted = sortedMembers(members, columns.nameFormat);
  const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
  const generatedAt = new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 32;

  const hasUnicode = await loadDevanagariFont(doc);
  const fontName = hasUnicode ? 'NotoSansDevanagari' : 'helvetica';

  const drawHeader = () => {
    doc.setFont(fontName, 'normal');
    doc.setFontSize(15);
    doc.setTextColor(11, 28, 48);
    doc.text(`${communityName} — Members`, margin, 40);

    doc.setFont(fontName, 'normal');
    doc.setFontSize(9);
    doc.setTextColor(70, 69, 85);
    const meta = [`${sorted.length} members`, filterSummary, `Generated ${generatedAt}`]
      .filter(Boolean)
      .join('  •  ');
    doc.text(meta, margin, 56, { maxWidth: pageWidth - margin * 2 });
  };

  type Col = { header: string; width: number | 'auto'; halign?: 'right'; getValue: (m: ExportMember) => string };
  const cols: Col[] = [
    { header: 'Serial No.', width: 52, halign: 'right', getValue: () => '' },
  ];
  if (columns.name) cols.push({ header: 'Name', width: 130, getValue: (m) => memberName(m, '—', columns.nameFormat) });
  if (columns.phone) cols.push({ header: 'Number', width: 80, getValue: (m) => m.phone?.trim() || '—' });
  if (columns.address) cols.push({ header: 'Address', width: 'auto', getValue: (m) => memberAddress(m) });
  if (columns.locality) cols.push({ header: 'Locality', width: 90, getValue: (m) => m.address?.locality?.trim() || '—' });

  const columnStyles: Record<number, { cellWidth?: number | 'auto'; halign?: 'right' }> = {};
  cols.forEach((c, i) => {
    const style: { cellWidth?: number | 'auto'; halign?: 'right' } = {};
    if (c.width !== undefined) style.cellWidth = c.width;
    if (c.halign) style.halign = c.halign;
    columnStyles[i] = style;
  });

  autoTable(doc, {
    startY: 72,
    margin: { left: margin, right: margin, top: 72 },
    head: [cols.map((c) => c.header)],
    body: sorted.map((m, i) => cols.map((c, ci) => ci === 0 ? String(i + 1) : c.getValue(m))),
    styles: { font: fontName, fontSize: 9, cellPadding: 5, valign: 'top', overflow: 'linebreak' },
    headStyles: { fillColor: [11, 28, 48], textColor: 255 },
    alternateRowStyles: { fillColor: [245, 248, 255] },
    columnStyles,
    didDrawPage: (data) => {
      drawHeader();
      doc.setFontSize(8);
      doc.setTextColor(120);
      doc.text(
        `Page ${data.pageNumber}`,
        pageWidth - margin,
        doc.internal.pageSize.getHeight() - 16,
        { align: 'right' },
      );
    },
  });

  const stamp = new Date().toISOString().slice(0, 10);
  doc.save(`${safeFileName(communityName)}-members-${stamp}.pdf`);
}
