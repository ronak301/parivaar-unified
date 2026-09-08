import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { BloodGroups, Gender, BusinessTypes } from '@parivaar/shared';
import { useDirectoryFiltersStore } from '../../src/stores/directoryFilters';
import type { SearchUsersFilters } from '../../src/api/user';

function Chip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.chip, selected && styles.chipSelected]}
      onPress={onPress}
    >
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text>
    </TouchableOpacity>
  );
}

export default function FiltersScreen() {
  const router = useRouter();
  const storedFilters = useDirectoryFiltersStore((state) => state.filters);
  const setFilters = useDirectoryFiltersStore((state) => state.setFilters);
  const clearFilters = useDirectoryFiltersStore((state) => state.clearFilters);

  const [draft, setDraft] = useState<SearchUsersFilters>(storedFilters);

  function toggle<K extends 'bloodGroup' | 'gender' | 'businessCategory'>(key: K, value: string) {
    setDraft((prev) => ({ ...prev, [key]: prev[key] === value ? undefined : value }));
  }

  function setText(key: keyof SearchUsersFilters, value: string) {
    setDraft((prev) => ({ ...prev, [key]: value || undefined }));
  }

  function setAge(key: 'ageMin' | 'ageMax', value: string) {
    const numeric = value ? Number(value) : undefined;
    setDraft((prev) => ({ ...prev, [key]: Number.isFinite(numeric) ? numeric : undefined }));
  }

  function handleApply() {
    setFilters(draft);
    router.back();
  }

  function handleClear() {
    clearFilters();
    setDraft({});
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.sectionTitle}>Blood Group</Text>
      <View style={styles.chipRow}>
        {BloodGroups.map((bg) => (
          <Chip
            key={bg.id}
            label={bg.label}
            selected={draft.bloodGroup === bg.id}
            onPress={() => toggle('bloodGroup', bg.id)}
          />
        ))}
      </View>

      <Text style={styles.sectionTitle}>Gender</Text>
      <View style={styles.chipRow}>
        {Gender.map((g) => (
          <Chip
            key={g.id}
            label={g.label}
            selected={draft.gender === g.id}
            onPress={() => toggle('gender', g.id)}
          />
        ))}
      </View>

      <Text style={styles.sectionTitle}>Business Category</Text>
      <View style={styles.chipRow}>
        {BusinessTypes.map((bt) => (
          <Chip
            key={bt.id}
            label={bt.label}
            selected={draft.businessCategory === bt.id}
            onPress={() => toggle('businessCategory', bt.id)}
          />
        ))}
      </View>

      <Text style={styles.sectionTitle}>Age Range</Text>
      <View style={styles.rowInputs}>
        <TextInput
          style={styles.numberInput}
          placeholder="Min"
          keyboardType="number-pad"
          value={draft.ageMin?.toString() ?? ''}
          onChangeText={(v) => setAge('ageMin', v)}
        />
        <Text style={styles.rowInputsSeparator}>to</Text>
        <TextInput
          style={styles.numberInput}
          placeholder="Max"
          keyboardType="number-pad"
          value={draft.ageMax?.toString() ?? ''}
          onChangeText={(v) => setAge('ageMax', v)}
        />
      </View>

      <Text style={styles.sectionTitle}>Locality</Text>
      <TextInput
        style={styles.textInput}
        placeholder="Locality"
        value={draft.locality ?? ''}
        onChangeText={(v) => setText('locality', v)}
      />

      <Text style={styles.sectionTitle}>City</Text>
      <TextInput
        style={styles.textInput}
        placeholder="City"
        value={draft.city ?? ''}
        onChangeText={(v) => setText('city', v)}
      />

      <Text style={styles.sectionTitle}>Native Place</Text>
      <TextInput
        style={styles.textInput}
        placeholder="Native place"
        value={draft.nativePlace ?? ''}
        onChangeText={(v) => setText('nativePlace', v)}
      />

      <View style={styles.actionsRow}>
        <TouchableOpacity style={styles.clearButton} onPress={handleClear}>
          <Text style={styles.clearButtonText}>Clear All</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
          <Text style={styles.applyButtonText}>Apply Filters</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a2e',
    marginTop: 20,
    marginBottom: 8,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  chipSelected: {
    backgroundColor: '#1a1a2e',
    borderColor: '#1a1a2e',
  },
  chipText: {
    fontSize: 13,
    color: '#1a1a2e',
  },
  chipTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  rowInputs: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  numberInput: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
  },
  rowInputsSeparator: {
    color: '#666',
  },
  textInput: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 32,
  },
  clearButton: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  clearButtonText: {
    color: '#1a1a2e',
    fontWeight: '600',
  },
  applyButton: {
    flex: 2,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
  },
  applyButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
