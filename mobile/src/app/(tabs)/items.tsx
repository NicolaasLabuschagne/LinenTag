import { router, useNavigation } from 'expo-router';
import { useLayoutEffect, useMemo, useState } from 'react';
import { FlatList, Pressable, RefreshControl, Text, TextInput, View } from 'react-native';
import { ItemRow } from '@/components/ItemViews';
import { Banner, ChipGroup, Empty, colors, styles } from '@/components/ui';
import { api } from '@/lib/api';
import { primeScanCache } from '@/lib/cache';
import { SIZE_LABELS, STATUS_LABELS, TYPE_LABELS, options } from '@/lib/labels';
import type { Item, Size, Status } from '@/lib/types';
import { useLoader } from '@/lib/useLoader';

const distinct = (values: (string | null)[]) =>
  [...new Set(values.filter((v): v is string => !!v))].sort((a, b) => a.localeCompare(b));

/**
 * Loads the whole inventory once and filters on-device: instant filtering, and
 * the list keeps working offline from cache.
 */
export default function Items() {
  const navigation = useNavigation();
  const { data, error, refreshing, refresh } = useLoader(
    async () => {
      const [items, sets] = await Promise.all([api.listItems(), api.listSets()]);
      void primeScanCache(items);
      return { items, sets };
    },
    [],
    'inventory',
  );

  const [q, setQ] = useState('');
  const [size, setSize] = useState<Size | null>(null);
  const [status, setStatus] = useState<Status | null>(null);
  const [room, setRoom] = useState<string | null>(null);
  const [material, setMaterial] = useState<string | null>(null);
  const [setId, setSetId] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable onPress={() => router.push('/item/edit')} style={{ paddingHorizontal: 16 }} hitSlop={8}>
          <Text style={{ color: colors.accent, fontSize: 16, fontWeight: '600' }}>Add</Text>
        </Pressable>
      ),
    });
  }, [navigation]);

  const items = data?.items ?? [];
  const rooms = useMemo(() => distinct(items.map((i) => i.room)), [items]);
  const materials = useMemo(() => distinct(items.map((i) => i.material)), [items]);

  // Everything an item can be found by, so "master", "guest king" or "blue" all work.
  const searchText = useMemo(() => {
    const setsById = new Map((data?.sets ?? []).map((s) => [s.id, s]));
    return new Map(
      items.map((i) => {
        const set = i.setId ? setsById.get(i.setId) : undefined;
        const parts = [
          i.name,
          i.room,
          i.material,
          i.color,
          TYPE_LABELS[i.type],
          i.size && SIZE_LABELS[i.size],
          set?.name,
          set?.room,
          set?.locationName,
        ];
        return [i.id, parts.filter(Boolean).join(' ').toLowerCase()];
      }),
    );
  }, [items, data?.sets]);

  const filtered = useMemo(() => {
    const words = q.trim().toLowerCase().split(/\s+/).filter(Boolean);
    return items.filter(
      (i: Item) =>
        words.every((w) => searchText.get(i.id)!.includes(w)) &&
        (!size || i.size === size) &&
        (!status || i.status === status) &&
        (!room || i.room?.toLowerCase() === room.toLowerCase()) &&
        (!material || i.material?.toLowerCase() === material.toLowerCase()) &&
        (!setId || i.setId === setId),
    );
  }, [items, searchText, q, size, status, room, material, setId]);

  const activeFilters = [size, status, room, material, setId].filter(Boolean).length;

  return (
    <FlatList
      style={styles.screen}
      contentContainerStyle={[styles.screenPad, { gap: 10 }]}
      data={filtered}
      keyExtractor={(i) => i.id}
      renderItem={({ item }) => <ItemRow item={item} />}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}
      keyboardShouldPersistTaps="handled"
      ListHeaderComponent={
        <View style={{ gap: 12, marginBottom: 4 }}>
          {error && <Banner text={data ? 'Offline — showing your last synced items.' : error.message} />}
          <TextInput style={styles.input} placeholder="Search by name, room, set, colour…" value={q} onChangeText={setQ} placeholderTextColor={colors.muted} />
          <Pressable onPress={() => setShowFilters(!showFilters)}>
            <Text style={{ color: colors.accent, fontWeight: '600' }}>
              {showFilters ? 'Hide filters' : `Filters${activeFilters ? ` (${activeFilters})` : ''}`}
            </Text>
          </Pressable>
          {showFilters && (
            <View style={{ gap: 12 }}>
              <ChipGroup label="Size" options={options(SIZE_LABELS)} value={size} onChange={setSize} />
              {rooms.length > 0 && (
                <ChipGroup label="Room" options={rooms.map((r) => ({ value: r, label: r }))} value={room} onChange={setRoom} />
              )}
              {(data?.sets.length ?? 0) > 0 && (
                <ChipGroup
                  label="Set"
                  options={data!.sets.map((s) => ({ value: s.id, label: s.name }))}
                  value={setId}
                  onChange={setSetId}
                />
              )}
              {materials.length > 0 && (
                <ChipGroup
                  label="Material"
                  options={materials.map((m) => ({ value: m, label: m }))}
                  value={material}
                  onChange={setMaterial}
                />
              )}
              <ChipGroup label="Status" options={options(STATUS_LABELS)} value={status} onChange={setStatus} />
            </View>
          )}
          {data && (
            <Text style={styles.muted}>
              {filtered.length} of {items.length} items
            </Text>
          )}
        </View>
      }
      ListEmptyComponent={
        data ? <Empty text={items.length ? 'No items match these filters.' : 'No items yet. Tap Add, or scan a new tag.'} /> : undefined
      }
    />
  );
}
