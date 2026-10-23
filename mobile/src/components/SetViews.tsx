import { router } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { SET_STATUS_COLORS, setStatusLabel } from '@/lib/labels';
import type { LinenSet } from '@/lib/types';
import { Card, ColorDot, colors, styles } from './ui';

/** Route param for sets with no room. */
export const NO_ROOM = '__none__';

/** Sets grouped by room, case-insensitively; sets without a room come last. */
export function groupByRoom(sets: LinenSet[]) {
  const groups = new Map<string, { key: string; label: string; sets: LinenSet[] }>();
  for (const set of sets) {
    const room = set.room?.trim();
    const key = room ? room.toLowerCase() : NO_ROOM;
    if (!groups.has(key)) groups.set(key, { key, label: room || 'No room yet', sets: [] });
    groups.get(key)!.sets.push(set);
  }
  return [...groups.values()].sort((a, b) =>
    a.key === NO_ROOM ? 1 : b.key === NO_ROOM ? -1 : a.label.localeCompare(b.label),
  );
}

/** Lowercased text a set can be found by: its name, room and storage place. */
export const setSearchText = (set: LinenSet) => [set.name, set.room, set.locationName].filter(Boolean).join(' ').toLowerCase();

export function SetStatusPill({ set, showPlaces }: { set: LinenSet; showPlaces: boolean }) {
  // Sets cached by older app versions have no status.
  const c = SET_STATUS_COLORS[set.status] ?? SET_STATUS_COLORS.stored;
  return (
    <View style={{ backgroundColor: c.bg, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3, alignSelf: 'flex-start' }}>
      <Text style={{ color: c.fg, fontSize: 13, fontWeight: '600' }}>{setStatusLabel(set, showPlaces)}</Text>
    </View>
  );
}

export function SetRow({
  set,
  showPlace,
  showRoom,
  onUse,
  using,
}: {
  set: LinenSet;
  showPlace: boolean;
  showRoom?: boolean;
  /** Shows a "Use" button on sets that aren't on the bed. */
  onUse?: (set: LinenSet) => void;
  using?: boolean;
}) {
  return (
    <Card
      onPress={() => router.push({ pathname: '/set/[id]', params: { id: set.id } })}
      style={[{ flexDirection: 'row', alignItems: 'center', gap: 10 }, set.status === 'in_use' && { borderColor: colors.accent }]}
    >
      <View style={{ flex: 1, gap: 4 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <ColorDot color={set.color} />
          <Text style={[styles.h2, { flexShrink: 1 }]}>{set.name}</Text>
        </View>
        <Text style={styles.muted}>
          {[`${set.itemCount ?? 0} ${set.itemCount === 1 ? 'piece' : 'pieces'}`, showRoom && set.room].filter(Boolean).join(' · ')}
        </Text>
        <SetStatusPill set={set} showPlaces={showPlace} />
      </View>
      {onUse && set.status !== 'in_use' && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Use ${set.name}`}
          disabled={using}
          onPress={() => onUse(set)}
          hitSlop={6}
          style={({ pressed }) => ({
            backgroundColor: colors.accent,
            borderRadius: 8,
            paddingHorizontal: 16,
            paddingVertical: 8,
            opacity: using ? 0.5 : pressed ? 0.8 : 1,
          })}
        >
          <Text style={{ color: '#fff', fontWeight: '600' }}>Use</Text>
        </Pressable>
      )}
    </Card>
  );
}
