import { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import type { UserListItem } from '@parivaar/shared';
import { useAuthStore } from '../../src/stores/auth';
import { useDirectoryFiltersStore } from '../../src/stores/directoryFilters';
import { useDebounce } from '../../src/hooks/useDebounce';
import { searchUsers } from '../../src/api/user';

const PAGE_LIMIT = 20;

export default function DirectoryScreen() {
  const router = useRouter();
  const communityId = useAuthStore((state) => state.user?.communityIds?.[0]);
  const filters = useDirectoryFiltersStore((state) => state.filters);

  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 500);

  const [users, setUsers] = useState<UserListItem[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const requestIdRef = useRef(0);
  const canLoadMoreRef = useRef(false);

  const loadPage = useCallback(
    async (targetPage: number, replace: boolean) => {
      if (!communityId) return;

      const requestId = ++requestIdRef.current;
      setLoading(true);
      setError('');
      canLoadMoreRef.current = false;

      try {
        const response = await searchUsers({
          communityId,
          query: debouncedQuery || undefined,
          filters,
          page: targetPage,
          limit: PAGE_LIMIT,
        });

        if (requestId !== requestIdRef.current) return;

        setUsers((prev) => (replace ? response.users : [...prev, ...response.users]));
        setPage(response.pagination.page);
        setTotalPages(response.pagination.totalPages);
        canLoadMoreRef.current = response.pagination.page < response.pagination.totalPages;
      } catch {
        if (requestId !== requestIdRef.current) return;
        setError('Failed to load members. Pull down to retry.');
      } finally {
        if (requestId === requestIdRef.current) setLoading(false);
      }
    },
    [communityId, debouncedQuery, filters],
  );

  useEffect(() => {
    loadPage(1, true);
  }, [loadPage]);

  function handleEndReached() {
    if (loading || !canLoadMoreRef.current) return;
    loadPage(page + 1, false);
  }

  return (
    <View style={styles.container}>
      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search members..."
          value={query}
          onChangeText={setQuery}
          autoCapitalize="none"
        />
        <TouchableOpacity
          style={styles.filterButton}
          accessibilityRole="button"
          onPress={() => router.push('/directory/filters')}
        >
          <Text style={styles.filterButtonText}>Filters</Text>
        </TouchableOpacity>
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <FlatList
        data={users}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => <MemberRow user={item} />}
        onEndReachedThreshold={0.4}
        onEndReached={handleEndReached}
        ListEmptyComponent={
          !loading ? <Text style={styles.emptyText}>No members found.</Text> : null
        }
        ListFooterComponent={loading ? <ActivityIndicator style={styles.footerSpinner} /> : null}
        contentContainerStyle={users.length === 0 ? styles.emptyContainer : undefined}
      />
    </View>
  );
}

function MemberRow({ user }: { user: UserListItem }) {
  const name = [user.firstName, user.lastName].filter(Boolean).join(' ');
  const location = [user.address?.locality, user.address?.city].filter(Boolean).join(', ');

  return (
    <View style={styles.row}>
      <View style={styles.rowAvatar}>
        <Text style={styles.rowAvatarText}>{user.firstName.charAt(0).toUpperCase()}</Text>
      </View>
      <View style={styles.rowBody}>
        <View style={styles.rowNameLine}>
          <Text style={styles.rowName}>{name}</Text>
          {user.isFamilyHead ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>Head</Text>
            </View>
          ) : null}
        </View>
        <Text style={styles.rowMeta}>{user.enrollmentId}</Text>
        {location ? <Text style={styles.rowMeta}>{location}</Text> : null}
        {user.phone ? <Text style={styles.rowMeta}>{user.phone}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  searchRow: {
    flexDirection: 'row',
    gap: 8,
    padding: 16,
    paddingBottom: 8,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
  },
  filterButton: {
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  filterButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  error: {
    color: '#e53935',
    fontSize: 13,
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
    padding: 12,
  },
  rowAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1a1a2e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rowAvatarText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 18,
  },
  rowBody: {
    flex: 1,
  },
  rowNameLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rowName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a2e',
  },
  badge: {
    backgroundColor: '#e8eaf6',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  badgeText: {
    fontSize: 11,
    color: '#1a1a2e',
    fontWeight: '600',
  },
  rowMeta: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 40,
  },
  emptyContainer: {
    flexGrow: 1,
  },
  footerSpinner: {
    marginVertical: 16,
  },
});
