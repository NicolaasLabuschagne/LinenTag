import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, Text } from 'react-native';
import { ItemSummary, SetPieces } from '@/components/ItemViews';
import { Banner, Button, Card, Screen, styles } from '@/components/ui';
import { api } from '@/lib/api';
import { removeCache, scanKey } from '@/lib/cache';
import { readTagUid } from '@/lib/nfc';
import { QR_TEST_TAGS, scanQr } from '@/lib/qr';
import { useLoader } from '@/lib/useLoader';

export default function ItemDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data, error, setData } = useLoader(
    async () => {
      const item = await api.getItem(id);
      const set = item.setId ? await api.getSet(item.setId) : null;
      return { item, set };
    },
    [id],
    `item:${id}`,
  );
  const [busy, setBusy] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  async function act(name: string, fn: () => Promise<void>) {
    setBusy(name);
    setActionError(null);
    try {
      await fn();
    } catch (err) {
      setActionError((err as Error).message);
    } finally {
      setBusy(null);
    }
  }

  const linkTag = (readUid: () => Promise<string | null> = () => readTagUid('Hold your phone near the tag to link')) =>
    act('link', async () => {
      const uid = await readUid();
      if (!uid) return;
      const item = await api.linkTag(id, uid);
      setData((d) => d && { ...d, item });
    });

  const unlinkTag = () =>
    act('unlink', async () => {
      const old = data?.item.tagUid;
      const item = await api.unlinkTag(id);
      if (old) void removeCache(scanKey(old));
      setData((d) => d && { ...d, item });
    });

  const confirmDelete = () =>
    Alert.alert('Delete item?', 'This removes the item and frees its tag for reuse.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () =>
          act('delete', async () => {
            await api.deleteItem(id);
            if (data?.item.tagUid) void removeCache(scanKey(data.item.tagUid));
            router.back();
          }),
      },
    ]);

  if (!data) {
    return <Screen>{error && <Banner tone="danger" text={error.message} />}</Screen>;
  }
  const { item, set } = data;

  return (
    <Screen>
      <Stack.Screen options={{ title: item.name }} />
      {error && <Banner text="Offline — showing saved details." />}
      {actionError && <Banner tone="danger" text={actionError} />}

      <ItemSummary item={item} setName={set?.name} />
      {set && <SetPieces set={set} highlightId={item.id} />}

      <Button
        title={set ? 'Change set' : 'Add to a set'}
        onPress={() => router.push({ pathname: '/item/set-picker', params: { id } })}
      />
      <Button title="Edit details" variant="secondary" onPress={() => router.push({ pathname: '/item/edit', params: { id } })} />

      <Card>
        <Text style={styles.label}>NFC tag</Text>
        <Text style={{ fontSize: 15, fontFamily: 'monospace' }}>{item.tagUid ?? 'No tag linked'}</Text>
        <Button
          title={item.tagUid ? 'Replace tag' : 'Link a tag'}
          variant="secondary"
          onPress={() => linkTag()}
          loading={busy === 'link'}
          disabled={!!busy}
        />
        {QR_TEST_TAGS && (
          <Button
            title={item.tagUid ? 'Replace with QR test tag' : 'Link a QR test tag'}
            variant="secondary"
            onPress={() => linkTag(scanQr)}
            disabled={!!busy}
          />
        )}
        {item.tagUid && (
          <Button title="Unlink tag" variant="secondary" onPress={unlinkTag} loading={busy === 'unlink'} disabled={!!busy} />
        )}
      </Card>

      <Button title="Delete item" variant="danger" onPress={confirmDelete} loading={busy === 'delete'} disabled={!!busy} />
    </Screen>
  );
}
