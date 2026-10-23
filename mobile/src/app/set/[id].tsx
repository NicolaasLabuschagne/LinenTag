import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, Text, View } from 'react-native';
import { ItemRow } from '@/components/ItemViews';
import { SetStatusPill } from '@/components/SetViews';
import { Banner, Button, Card, ColorDot, Empty, Flash, Screen, colors, styles, type FlashMessage } from '@/components/ui';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { TYPE_LABELS } from '@/lib/labels';
import type { SetStatus } from '@/lib/types';
import { useLoader } from '@/lib/useLoader';

export default function SetDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: set, error, setData } = useLoader(() => api.getSet(id), [id], `set:${id}`);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [flash, setFlash] = useState<FlashMessage | null>(null);
  const [busy, setBusy] = useState(false);
  const showPlaces = useAuth().user?.settings.multipleLocations ?? false;

  async function changeStatus(status: SetStatus) {
    setBusy(true);
    try {
      if (status === 'in_use') {
        const { set: updated, sentToLaundry } = await api.useSet(id);
        setData(updated);
        const moved = sentToLaundry.map((s) => s.name).join(' and ');
        setFlash({ text: moved ? `Now in use. ${moved} went to the laundry.` : 'Now in use.', tone: 'good' });
      } else {
        setData(await api.updateSet(id, { status }));
        setFlash(null);
      }
    } catch (err) {
      setFlash({ text: (err as Error).message, tone: 'warn' });
    } finally {
      setBusy(false);
    }
  }

  const confirmDelete = () =>
    Alert.alert('Delete set?', 'The items stay in your inventory; they just stop being grouped.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.deleteSet(id);
            router.back();
          } catch (err) {
            setDeleteError((err as Error).message);
          }
        },
      },
    ]);

  if (!set) return <Screen>{error && <Banner tone="danger" text={error.message} />}</Screen>;

  const counts = Object.entries(
    set.items.reduce<Record<string, number>>((acc, i) => ({ ...acc, [i.type]: (acc[i.type] ?? 0) + 1 }), {}),
  ).map(([type, n]) => `${n} × ${TYPE_LABELS[type as keyof typeof TYPE_LABELS]}`);

  return (
    <Screen>
      <Stack.Screen options={{ title: set.name }} />
      {error && <Banner text="Offline — showing saved details." />}
      {deleteError && <Banner tone="danger" text={deleteError} />}
      <Card>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <ColorDot color={set.color} size={20} />
          <Text style={[styles.h1, { flexShrink: 1 }]}>{set.name}</Text>
        </View>
        {set.room && <Text style={[styles.muted, { fontSize: 16 }]}>{set.room}</Text>}
        {showPlaces && set.locationName && (
          <Text style={{ color: colors.accent, fontSize: 16 }}>Kept in {set.locationName}</Text>
        )}
        {counts.length > 0 && <Text style={{ color: colors.text }}>{counts.join('\n')}</Text>}
        {set.notes && <Text style={{ color: colors.text, marginTop: 4 }}>{set.notes}</Text>}
      </Card>

      <Card>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={styles.label}>Right now</Text>
          <SetStatusPill set={set} showPlaces={showPlaces} />
        </View>
        <Flash message={flash} />
        {set.status !== 'in_use' && <Button title="Use this set" onPress={() => changeStatus('in_use')} disabled={busy} />}
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {set.status !== 'laundry' && (
            <Button title="Put in laundry" variant="secondary" onPress={() => changeStatus('laundry')} disabled={busy} style={{ flex: 1 }} />
          )}
          {set.status !== 'stored' && (
            <Button title="Mark as put away" variant="secondary" onPress={() => changeStatus('stored')} disabled={busy} style={{ flex: 1 }} />
          )}
        </View>
      </Card>

      <Text style={styles.h2}>Pieces</Text>
      {set.items.length === 0 && <Empty text="No pieces in this set yet." />}
      {set.items.map((item) => (
        <ItemRow key={item.id} item={item} />
      ))}

      <Button title="Add new bedding to this set" onPress={() => router.push({ pathname: '/add', params: { setId: id } })} />
      <Button
        title="Add bedding you already have"
        variant="secondary"
        onPress={() => router.push({ pathname: '/set/add', params: { id } })}
      />
      <Button
        title="Edit set or choose pieces"
        variant="secondary"
        onPress={() => router.push({ pathname: '/set/edit', params: { id } })}
      />
      <Button title="Delete set" variant="danger" onPress={confirmDelete} />
    </Screen>
  );
}
