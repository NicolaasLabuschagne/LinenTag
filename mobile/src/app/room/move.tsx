import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { NO_ROOM, groupByRoom } from '@/components/SetViews';
import { Banner, Card, ColorDot, Empty, Flash, Screen, colors, styles, type FlashMessage } from '@/components/ui';
import { api } from '@/lib/api';
import type { LinenSet } from '@/lib/types';
import { useLoader } from '@/lib/useLoader';

/** Move existing sets from other rooms (or no room) into this room. `room` is the room's display name. */
export default function MoveSetsHere() {
  const { room } = useLocalSearchParams<{ room: string }>();
  const { data, error, refresh } = useLoader(api.listSets, []);
  const [movingId, setMovingId] = useState<string | null>(null);
  const [flash, setFlash] = useState<FlashMessage | null>(null);

  // Everything not already in this room, grouped by where it is now; unassigned sets first.
  const groups = useMemo(() => {
    const here = room.trim().toLowerCase();
    const others = groupByRoom(data ?? []).filter((g) => g.key !== here);
    return [...others.filter((g) => g.key === NO_ROOM), ...others.filter((g) => g.key !== NO_ROOM)];
  }, [data, room]);

  async function move(set: LinenSet) {
    setMovingId(set.id);
    try {
      await api.updateSet(set.id, { room });
      setFlash({ text: `✓ ${set.name} moved to ${room}`, tone: 'good' });
      await refresh();
    } catch (err) {
      setFlash({ text: (err as Error).message, tone: 'warn' });
    } finally {
      setMovingId(null);
    }
  }

  return (
    <Screen>
      <Stack.Screen options={{ title: `Move to ${room}` }} />
      {error && <Banner tone="danger" text={error.message} />}
      <Text style={[styles.muted, { fontSize: 16 }]}>Tap Move here on each set that belongs in {room}.</Text>
      <Flash message={flash} />
      {data && groups.length === 0 && <Empty text={`All your sets are already in ${room}.`} />}

      {groups.map((g) => (
        <View key={g.key} style={{ gap: 8 }}>
          <Text style={styles.label}>{g.key === NO_ROOM ? 'Not in a room yet' : `Now in ${g.label}`}</Text>
          {g.sets.map((set) => (
            <Card key={set.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <ColorDot color={set.color} />
              <View style={{ flex: 1 }}>
                <Text style={styles.h2}>{set.name}</Text>
                <Text style={styles.muted}>
                  {set.itemCount ?? 0} {set.itemCount === 1 ? 'piece' : 'pieces'}
                </Text>
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Move ${set.name} to ${room}`}
                disabled={movingId !== null}
                onPress={() => move(set)}
                style={({ pressed }) => ({
                  backgroundColor: colors.accent,
                  borderRadius: 8,
                  paddingHorizontal: 14,
                  paddingVertical: 8,
                  opacity: movingId === set.id ? 0.5 : pressed ? 0.8 : 1,
                })}
              >
                <Text style={{ color: '#fff', fontWeight: '600' }}>Move here</Text>
              </Pressable>
            </Card>
          ))}
        </View>
      ))}

      {data && <Pressable onPress={() => router.back()} style={{ alignSelf: 'center', padding: 8 }}>
        <Text style={{ color: colors.accent, fontSize: 16 }}>Done</Text>
      </Pressable>}
    </Screen>
  );
}
