import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Text, View } from 'react-native';
import { QrCamera } from '@/components/QrCamera';
import { Button, Card, ColorDot, Flash, Screen, colors, styles, type FlashMessage } from '@/components/ui';
import { ApiError, api } from '@/lib/api';
import { removeCache, scanKey, writeCache } from '@/lib/cache';
import { cancelRead, nfcAvailability, readTagUid, type NfcAvailability } from '@/lib/nfc';
import { parseProductLabel } from '@/lib/product';
import { QR_TEST_TAGS, qrToUid } from '@/lib/qr';
import type { Item, LinenSetWithItems } from '@/lib/types';

/** Ignore the same QR for this long; the camera reports it many times a second. */
const REPEAT_WINDOW_MS = 3000;
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

type SetProgress = { set: LinenSetWithItems; upgradedIds: string[] };

/**
 * "Upgrade to NFC": for bedding that was registered with printed labels. Scan a piece's label,
 * tap the NFC tag newly sewn into it, repeat. The label keeps working as a backup afterwards.
 */
export default function UpgradeToNfc() {
  const [nfc, setNfc] = useState<NfcAvailability | null>(null);
  const [focused, setFocused] = useState(true);
  const [pending, setPending] = useState<Item | null>(null);
  const pendingRef = useRef<Item | null>(null);
  const [progress, setProgress] = useState<Record<string, SetProgress>>({});
  const progressRef = useRef<Record<string, SetProgress>>({});
  const [loose, setLoose] = useState<Item[]>([]);
  const [flash, setFlash] = useState<FlashMessage | null>(null);
  const lastSeen = useRef(new Map<string, number>());
  const busy = useRef(false);

  useEffect(() => {
    void nfcAvailability().then(setNfc);
  }, []);

  useFocusEffect(
    useCallback(() => {
      setFocused(true);
      return () => setFocused(false);
    }, []),
  );

  function waitForTag(item: Item | null) {
    pendingRef.current = item;
    setPending(item);
  }

  /** Find the item a printed label belongs to. */
  async function identify(data: string): Promise<Item | null> {
    const label = parseProductLabel(data);
    if (!label) return null;
    if (label.packCode) {
      try {
        return await api.lookupLabel(label);
      } catch (err) {
        if (!(err instanceof ApiError && err.code === 'LABEL_NOT_REGISTERED')) throw err;
      }
    }
    if (label.tagUid) {
      try {
        return (await api.scan(label.tagUid)).item;
      } catch (err) {
        if (!(err instanceof ApiError && err.code === 'TAG_NOT_REGISTERED')) throw err;
      }
    }
    throw new Error(`This ${label.name} label hasn't been added yet. Add it with "Add new bedding" first.`);
  }

  async function link(item: Item, uid: string) {
    if (busy.current) return;
    busy.current = true;
    try {
      if (item.tagUid === uid) {
        setFlash({ text: `That tag is already linked to ${item.name}.`, tone: 'info' });
        waitForTag(null);
        return;
      }
      const updated = await api.linkTag(item.id, uid);
      waitForTag(null);
      if (item.tagUid) void removeCache(scanKey(item.tagUid));

      const set = updated.setId ? (progressRef.current[updated.setId]?.set ?? (await api.getSet(updated.setId))) : null;
      if (set) void writeCache(scanKey(uid), { item: updated, set });
      if (!set) {
        setLoose((l) => [...l, updated]);
        setFlash({ text: `✓ ${updated.name} now has an NFC tag`, tone: 'good' });
        return;
      }
      const prev = progressRef.current[set.id];
      const next: SetProgress = {
        set,
        upgradedIds: prev?.upgradedIds.includes(updated.id) ? prev.upgradedIds : [...(prev?.upgradedIds ?? []), updated.id],
      };
      progressRef.current = { ...progressRef.current, [set.id]: next };
      setProgress(progressRef.current);
      const done = next.upgradedIds.length >= set.items.length;
      setFlash({
        text: done
          ? `✓ All of ${set.name} is on NFC now!`
          : `✓ ${updated.name} upgraded · ${set.name} ${next.upgradedIds.length} of ${set.items.length}`,
        tone: 'good',
      });
    } catch (err) {
      if (err instanceof ApiError && err.code === 'TAG_IN_USE') {
        setFlash({ text: 'That tag is already on another item. Try a different tag, or Skip.', tone: 'warn' });
      } else {
        setFlash({ text: (err as Error).message, tone: 'warn' });
      }
    } finally {
      busy.current = false;
    }
  }

  const linkRef = useRef(link);
  linkRef.current = link;

  async function onCode(data: string) {
    const now = Date.now();
    const prev = lastSeen.current.get(data);
    if (prev !== undefined && now - prev < REPEAT_WINDOW_MS) return;
    lastSeen.current.set(data, now);

    const waiting = pendingRef.current;
    const isLabel = parseProductLabel(data) !== null;
    if (waiting && !isLabel && QR_TEST_TAGS) {
      await link(waiting, qrToUid(data)); // testing: any other QR stands in for the new NFC tag
      return;
    }
    if (waiting && isLabel) {
      setFlash({ text: `First tap the new tag on the ${waiting.name}, or press Skip.`, tone: 'warn' });
      return;
    }
    if (!isLabel) {
      setFlash({ text: 'Scan the printed label on a piece first.', tone: 'info' });
      return;
    }
    try {
      const item = await identify(data);
      if (item) {
        waitForTag(item);
        setFlash(null);
      }
    } catch (err) {
      setFlash({ text: (err as Error).message, tone: 'warn' });
    }
  }

  // While a piece waits for its new tag, listen for the NFC tap.
  useEffect(() => {
    if (!pending || nfc !== 'ready' || !focused) return;
    let stopped = false;
    (async () => {
      while (!stopped) {
        try {
          const uid = await readTagUid(`Tap the new tag on the ${pending.name}`);
          if (stopped) break;
          if (uid) {
            await linkRef.current(pending, uid);
            if (!pendingRef.current) break; // linked; otherwise (e.g. tag already used) keep listening
            await delay(1000);
            continue;
          }
          await delay(300);
        } catch (err) {
          if (stopped) break;
          setFlash({ text: (err as Error).message, tone: 'warn' });
          await delay(1500);
        }
      }
    })();
    return () => {
      stopped = true;
      void cancelRead();
    };
  }, [pending, nfc, focused]);

  const sets = Object.values(progress);
  const total = sets.reduce((n, p) => n + p.upgradedIds.length, 0) + loose.length;

  return (
    <Screen>
      {focused && <QrCamera style={{ height: 220, borderRadius: 14 }} hint="Scan the printed label on a piece" onCode={(d) => void onCode(d)} />}

      {pending ? (
        <Card style={{ borderColor: colors.accent, borderWidth: 2 }}>
          <Text style={styles.muted}>Now tap the new NFC tag on the</Text>
          <Text style={[styles.h2, { fontSize: 20 }]}>{pending.name}</Text>
          {nfc !== 'ready' && <Text style={{ color: colors.warn }}>NFC is off or not available on this phone.</Text>}
          {QR_TEST_TAGS && <Text style={styles.muted}>Testing: scan any other QR code as its new tag.</Text>}
          <Button title="Skip this piece" variant="secondary" onPress={() => waitForTag(null)} />
        </Card>
      ) : (
        total === 0 && (
          <Card>
            <Text style={styles.h2}>How it works</Text>
            <Text style={{ fontSize: 15, lineHeight: 22 }}>
              1. Sew a LinenTag NFC tag into each piece.{'\n'}2. Scan the piece's printed label.{'\n'}3. Tap the new tag with your
              phone.{'\n'}Repeat for the next piece. The printed label keeps working as a backup.
            </Text>
          </Card>
        )
      )}

      <Flash message={flash} />

      {total > 0 && (
        <Text style={styles.muted}>
          {total} {total === 1 ? 'piece' : 'pieces'} upgraded
        </Text>
      )}

      {sets.map(({ set, upgradedIds }) => {
        const done = upgradedIds.length >= set.items.length;
        return (
          <Card key={set.id} style={done ? { borderColor: colors.accent, borderWidth: 2 } : undefined}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <ColorDot color={set.color} />
              <Text style={[styles.h2, { flex: 1 }]}>{set.name}</Text>
              <Text style={[styles.h2, { color: done ? colors.accent : colors.muted }]}>
                {upgradedIds.length}/{set.items.length}
              </Text>
            </View>
            {set.items.map((piece) => {
              const got = upgradedIds.includes(piece.id);
              return (
                <Text key={piece.id} style={{ fontSize: 15, color: got ? colors.text : colors.muted }}>
                  {got ? '✓' : '○'} {piece.name}
                </Text>
              );
            })}
          </Card>
        );
      })}

      {loose.length > 0 && (
        <Card>
          <Text style={styles.h2}>Upgraded (not in a set)</Text>
          {loose.map((item) => (
            <Text key={item.id} style={{ fontSize: 15 }}>
              ✓ {item.name}
            </Text>
          ))}
        </Card>
      )}

      <Button title="Done" onPress={() => router.back()} />
    </Screen>
  );
}
