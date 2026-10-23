import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useRef, useState } from 'react';
import { Text } from 'react-native';
import { TagScanner } from '@/components/TagScanner';
import { Button, Card, Flash, Screen, styles, type FlashMessage } from '@/components/ui';
import { ApiError, api } from '@/lib/api';
import { scanKey, writeCache } from '@/lib/cache';
import { useLoader } from '@/lib/useLoader';

/** Add pieces to a set by scanning their tags one after another. */
export default function AddToSet() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: set } = useLoader(() => api.getSet(id), [id]);
  const [added, setAdded] = useState<string[]>([]);
  const [flash, setFlash] = useState<FlashMessage | null>(null);
  const done = useRef(new Set<string>());

  async function handleUid(uid: string) {
    if (done.current.has(uid)) return;
    try {
      const { item, set: current } = await api.scan(uid);
      if (item.setId === id) {
        done.current.add(uid);
        setFlash({ text: `${item.name} is already in this set`, tone: 'info' });
        return;
      }
      const updated = await api.updateItem(item.id, { setId: id });
      done.current.add(uid);
      setAdded((a) => [...a, updated.name]);
      void writeCache(scanKey(uid), { item: updated, set: null });
      setFlash({
        text: current ? `✓ ${updated.name} moved here from ${current.name}` : `✓ ${updated.name} added`,
        tone: 'good',
      });
    } catch (err) {
      if (err instanceof ApiError && err.code === 'TAG_NOT_REGISTERED') {
        setFlash({ text: 'This tag isn’t registered yet. Add it with “Add new bedding” first.', tone: 'warn' });
      } else {
        setFlash({ text: (err as Error).message, tone: 'warn' });
      }
    }
  }

  return (
    <Screen>
      <Stack.Screen options={{ title: set ? `Add to ${set.name}` : 'Add pieces' }} />
      <TagScanner onUid={handleUid} onError={(text) => setFlash({ text, tone: 'warn' })} prompt="Tap each piece to add it" />
      <Flash message={flash} />
      {added.length > 0 && (
        <Card>
          <Text style={styles.h2}>
            Added {added.length} {added.length === 1 ? 'piece' : 'pieces'}
          </Text>
          {added.map((name, i) => (
            <Text key={`${name}-${i}`} style={{ fontSize: 15 }}>
              ✓ {name}
            </Text>
          ))}
        </Card>
      )}
      <Button title="Done" onPress={() => router.back()} />
    </Screen>
  );
}
