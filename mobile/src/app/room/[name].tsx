import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, RefreshControl, TextInput, View } from 'react-native';
import { LabelMakerLink } from '@/components/LabelMakerLink';
import { NO_ROOM, SetRow, groupByRoom, setSearchText } from '@/components/SetViews';
import { Banner, Button, Empty, Flash, colors, styles, type FlashMessage } from '@/components/ui';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import type { LinenSet } from '@/lib/types';
import { useLoader } from '@/lib/useLoader';

/** The sets in one room. `name` is the room's grouping key (lowercased), or NO_ROOM. */
export default function RoomSets() {
  const { name, label } = useLocalSearchParams<{ name: string; label?: string }>();
  const showPlaces = useAuth().user?.settings.multipleLocations ?? false;
  const { data, error, refreshing, refresh } = useLoader(api.listSets, [], 'sets');
  const [q, setQ] = useState('');
  const [usingId, setUsingId] = useState<string | null>(null);
  const [flash, setFlash] = useState<FlashMessage | null>(null);

  const room = useMemo(() => groupByRoom(data ?? []).find((g) => g.key === name), [data, name]);
  const needle = q.trim().toLowerCase();
  // The set on the bed first, then the rest by name.
  const sets = (room?.sets ?? [])
    .filter((s) => !needle || needle.split(/\s+/).every((t) => setSearchText(s).includes(t)))
    .sort((a, b) => Number(b.status === 'in_use') - Number(a.status === 'in_use'));
  const title = room?.label ?? label ?? (name === NO_ROOM ? 'No room yet' : 'Room');

  async function use(set: LinenSet) {
    setUsingId(set.id);
    try {
      const { sentToLaundry } = await api.useSet(set.id);
      const moved = sentToLaundry.map((s) => s.name).join(' and ');
      setFlash({ text: moved ? `Now using ${set.name}. ${moved} went to the laundry.` : `Now using ${set.name}.`, tone: 'good' });
      await refresh();
    } catch (err) {
      setFlash({ text: (err as Error).message, tone: 'warn' });
    } finally {
      setUsingId(null);
    }
  }

  return (
    <FlatList
      style={styles.screen}
      contentContainerStyle={[styles.screenPad, { gap: 10 }]}
      keyboardShouldPersistTaps="handled"
      data={sets}
      keyExtractor={(s) => s.id}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}
      ListHeaderComponent={
        <>
          <Stack.Screen options={{ title }} />
          {error && <Banner text={data ? 'Offline — showing your last synced sets.' : error.message} />}
          {name !== NO_ROOM && (
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
              <Button
                title="Add new bedding"
                onPress={() => router.push({ pathname: '/add', params: { room: title } })}
                style={{ flex: 1, paddingHorizontal: 8 }}
              />
              <Button
                title="Move bedding here"
                variant="secondary"
                onPress={() => router.push({ pathname: '/room/move', params: { room: title } })}
                style={{ flex: 1, paddingHorizontal: 8 }}
              />
            </View>
          )}
          {name !== NO_ROOM && <LabelMakerLink />}
          <TextInput
            style={[styles.input, { marginBottom: 4 }]}
            placeholder={`Search ${title}`}
            value={q}
            onChangeText={setQ}
            placeholderTextColor={colors.muted}
          />
          <Flash message={flash} />
        </>
      }
      renderItem={({ item }) => (
        <SetRow set={item} showPlace={showPlaces} onUse={name === NO_ROOM ? undefined : use} using={usingId !== null} />
      )}
      ListEmptyComponent={data ? <Empty text={needle ? 'No sets match.' : 'No sets in this room.'} /> : undefined}
    />
  );
}
