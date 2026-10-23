import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { Text, View } from 'react-native';
import { TagScanner } from '@/components/TagScanner';
import { Button, Card, ColorDot, Flash, Screen, colors, styles, type FlashMessage } from '@/components/ui';
import { ApiError, api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { readCache, scanKey, writeCache } from '@/lib/cache';
import { TYPE_LABELS } from '@/lib/labels';
import type { Item, LinenSetWithItems, ScanResult } from '@/lib/types';

type SetProgress = { set: LinenSetWithItems; scannedIds: string[] };

const isComplete = (p: SetProgress) => p.set.items.every((i) => p.scannedIds.includes(i.id));

/**
 * "Put away laundry": scan items one after another (no button per item) and see each set's
 * pieces come together, where to put a finished set, and which tags are new.
 */
export default function PutAway() {
  const { user } = useAuth();
  const trackWashes = user?.settings.trackWashes ?? false;
  const showPlaces = user?.settings.multipleLocations ?? false;

  const [progress, setProgress] = useState<Record<string, SetProgress>>({});
  const [loose, setLoose] = useState<Item[]>([]);
  const [newTags, setNewTags] = useState<string[]>([]);
  const [count, setCount] = useState(0);
  const [flash, setFlash] = useState<FlashMessage | null>(null);

  // Mirrors `progress` so back-to-back scans build on each other's results.
  const progressRef = useRef<Record<string, SetProgress>>({});
  const nameByUid = useRef(new Map<string, string>());

  function placeHint(set: LinenSetWithItems) {
    return showPlaces && set.locationName ? `Put it in ${set.locationName}.` : 'Fold it together.';
  }

  async function handleUid(uid: string) {
    const known = nameByUid.current.get(uid);
    if (known) {
      setFlash({ text: `${known} is already ticked off`, tone: 'info' });
      return;
    }

    let result: ScanResult | null = null;
    try {
      result = await api.scan(uid, trackWashes);
      void writeCache(scanKey(uid), result);
    } catch (err) {
      if (err instanceof ApiError && err.code === 'TAG_NOT_REGISTERED') {
        setNewTags((t) => [...t, uid]);
        nameByUid.current.set(uid, 'This new tag');
        setFlash({ text: 'New tag — you can add it below when you’re done', tone: 'info' });
        return;
      }
      result = err instanceof ApiError && err.isNetwork ? await readCache<ScanResult>(scanKey(uid)) : null;
      if (!result) {
        setFlash({ text: (err as Error).message, tone: 'warn' });
        return;
      }
    }

    const { item, set } = result;
    nameByUid.current.set(uid, item.name);
    setCount((c) => c + 1);

    if (!set) {
      setLoose((l) => [...l, item]);
      setFlash({ text: `${item.name} isn't in a set yet`, tone: 'info' });
      return;
    }

    const existing = progressRef.current[set.id];
    const next: SetProgress = {
      set,
      scannedIds: existing?.scannedIds.includes(item.id) ? existing.scannedIds : [...(existing?.scannedIds ?? []), item.id],
    };
    progressRef.current = { ...progressRef.current, [set.id]: next };
    setProgress(progressRef.current);
    // Every piece is back: the set is put away in its storage place.
    if (isComplete(next) && set.status !== 'stored') {
      api.updateSet(set.id, { status: 'stored' }).catch(() => {});
    }
    setFlash(
      isComplete(next)
        ? { text: `✓ ${set.name} is complete! ${placeHint(set)}`, tone: 'good' }
        : { text: `${item.name} → ${set.name} (${next.scannedIds.length} of ${set.items.length})`, tone: 'good' },
    );
  }

  const sets = Object.values(progress).sort((a, b) => Number(isComplete(a)) - Number(isComplete(b)));
  const completeCount = sets.filter(isComplete).length;

  return (
    <Screen>
      <TagScanner onUid={handleUid} onError={(text) => setFlash({ text, tone: 'warn' })} />
      <Flash message={flash} />

      {count > 0 && (
        <Text style={styles.muted}>
          {count} {count === 1 ? 'item' : 'items'} scanned
          {completeCount > 0 ? ` · ${completeCount} ${completeCount === 1 ? 'set' : 'sets'} complete` : ''}
          {trackWashes ? ' · washes counted' : ''}
        </Text>
      )}

      {sets.map((p) => {
        const done = isComplete(p);
        return (
          <Card key={p.set.id} style={done ? { borderColor: colors.accent, borderWidth: 2 } : undefined}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <ColorDot color={p.set.color} />
              <Text style={[styles.h2, { flex: 1 }]}>{p.set.name}</Text>
              <Text style={[styles.h2, { color: done ? colors.accent : colors.muted }]}>
                {p.scannedIds.length}/{p.set.items.length}
              </Text>
            </View>
            {done ? (
              <Text style={{ color: colors.accent, fontSize: 16, fontWeight: '600' }}>✓ Complete. {placeHint(p.set)}</Text>
            ) : (
              p.set.items.map((piece) => {
                const got = p.scannedIds.includes(piece.id);
                return (
                  <Text key={piece.id} style={{ fontSize: 15, color: got ? colors.text : colors.muted }}>
                    {got ? '✓' : '○'} {piece.name}
                    {!got && <Text style={styles.muted}> · {TYPE_LABELS[piece.type]}</Text>}
                  </Text>
                );
              })
            )}
          </Card>
        );
      })}

      {loose.length > 0 && (
        <Card>
          <Text style={styles.h2}>Not in a set</Text>
          {loose.map((item) => (
            <Text key={item.id} style={{ fontSize: 15 }}>
              • {item.name}
            </Text>
          ))}
          <Text style={styles.muted}>Open an item and tap "Add to a set" so it gets matched next time.</Text>
        </Card>
      )}

      {newTags.length > 0 && (
        <Card>
          <Text style={styles.h2}>
            {newTags.length} new {newTags.length === 1 ? 'tag' : 'tags'}
          </Text>
          <Text style={styles.muted}>Tell LinenTag what these are.</Text>
          {newTags.map((uid, i) => (
            <Button
              key={uid}
              title={`Add new item ${i + 1}`}
              variant="secondary"
              onPress={() => {
                setNewTags((t) => t.filter((x) => x !== uid));
                nameByUid.current.delete(uid);
                router.push({ pathname: '/item/edit', params: { tagUid: uid } });
              }}
            />
          ))}
        </Card>
      )}

      <Button title="Done" onPress={() => router.back()} style={{ marginTop: 8 }} />
    </Screen>
  );
}
