'use client';

import { Gender, BloodGroups, BusinessTypes } from '@parivaar/shared';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { AGE_PRESETS, type DirectoryFilters, type MaritalFilter } from '@/lib/member/directory-filters';

interface FiltersPanelProps {
  filters: DirectoryFilters;
  onChange: (filters: DirectoryFilters) => void;
  localities: string[];
}

export function FiltersPanel({ filters, onChange, localities }: FiltersPanelProps) {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <Label>Blood Group</Label>
        <div className="flex flex-wrap gap-2">
          {BloodGroups.map((bg) => {
            const active = filters.bloodGroup === bg.id;
            return (
              <button
                key={bg.id}
                type="button"
                onClick={() => onChange({ ...filters, bloodGroup: active ? '' : bg.id })}
                data-active={active}
                className="m-chip font-medium"
              >
                {bg.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label>Marital Status</Label>
        <div className="flex gap-2">
          {(
            [
              { id: 'married', label: 'Married' },
              { id: 'unmarried', label: 'Unmarried' },
            ] as Array<{ id: MaritalFilter; label: string }>
          ).map((opt) => {
            const active = filters.marital === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => onChange({ ...filters, marital: active ? '' : opt.id })}
                data-active={active}
                className="m-chip flex-1 justify-center font-medium"
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label>Age</Label>
        <div className="flex flex-wrap gap-2">
          {AGE_PRESETS.map((p) => {
            const active = filters.ageMin === p.min && filters.ageMax === p.max;
            return (
              <button
                key={p.label}
                type="button"
                onClick={() =>
                  onChange(active ? { ...filters, ageMin: '', ageMax: '' } : { ...filters, ageMin: p.min, ageMax: p.max })
                }
                data-active={active}
                className="m-chip font-medium"
              >
                {p.label}
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            inputMode="numeric"
            min={0}
            max={120}
            placeholder="Min"
            value={filters.ageMin}
            onChange={(e) => onChange({ ...filters, ageMin: e.target.value.replace(/\D/g, '').slice(0, 3) })}
            aria-label="Minimum age"
          />
          <span className="text-sm text-m-ink-2">to</span>
          <Input
            type="number"
            inputMode="numeric"
            min={0}
            max={120}
            placeholder="Max"
            value={filters.ageMax}
            onChange={(e) => onChange({ ...filters, ageMax: e.target.value.replace(/\D/g, '').slice(0, 3) })}
            aria-label="Maximum age"
          />
          <span className="text-sm text-m-ink-2">yrs</span>
        </div>
        {filters.ageMin && filters.ageMax && Number(filters.ageMin) > Number(filters.ageMax) && (
          <p className="text-xs text-m-danger">Minimum age cannot be more than maximum age.</p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Label>Gender</Label>
        <Select
          value={filters.gender}
          onValueChange={(v) => onChange({ ...filters, gender: v ?? '' })}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Any" />
          </SelectTrigger>
          <SelectContent>
            {Gender.map((g) => (
              <SelectItem key={g.id} value={g.id}>
                {g.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-2">
        <Label>Locality</Label>
        {localities.length > 0 ? (
          <Select
            value={filters.locality}
            onValueChange={(v) => onChange({ ...filters, locality: v ?? '' })}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Any" />
            </SelectTrigger>
            <SelectContent>
              {localities.map((loc) => (
                <SelectItem key={loc} value={loc}>
                  {loc}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <Input
            placeholder="Any"
            value={filters.locality}
            onChange={(e) => onChange({ ...filters, locality: e.target.value })}
          />
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Label>Business Type</Label>
        <Select
          value={filters.businessCategory}
          onValueChange={(v) => onChange({ ...filters, businessCategory: v ?? '' })}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Any">
              {(value: string) => BusinessTypes.find((bt) => bt.id === value)?.label ?? value}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {BusinessTypes.map((bt) => (
              <SelectItem key={bt.id} value={bt.id}>
                {bt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
