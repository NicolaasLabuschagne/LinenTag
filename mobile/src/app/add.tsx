import { router, Stack, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { LabelMakerLink } from '@/components/LabelMakerLink';
import { QrCamera } from '@/components/QrCamera';
import { Button, Card, ChipGroup, ColorDot, Flash, Screen, colors, styles, type FlashMessage } from '@/components/ui';
import { ApiError, api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { writeCache, scanKey } from '@/lib/cache';
import { SIZE_LABELS, localToday } from '@/lib/labels';
import { cancelRead, nfcAvailability, readTagUid, type NfcAvailability } from '@/lib/nfc';
import { parseProductLabel, type ProductLabel } from '@/lib/product';
import { QR_TEST_TAGS, qrToUid } from '@/lib/qr';
import type { Item, LinenSetWithItems } from '@/lib/types';
import { useLoader } from '@/lib/useLoader';

const ROOM_SUGGESTIONS = ['Main bedroom', 'Guest room', 'Kids room'];
/** Ignore the same QR for this long; the camera reports it many times a second. */
const REPEAT_WINDOW_MS = 3000;

const describe = (p: { name: string; size: string | null }) =>
  p.size ? `${p.name} (${SIZE_LABELS[p.size as keyof typeof SIZE_LABELS] ?? p.size})` : p.name;

/**
 * "Add new bedding": scan the product label on each item. Details and set grouping come from
 * the label; the user only picks the room (and storage place) once for the whole batch.
 */
export default function AddBedding() {
  /** When opened from a set's page, everything scanned goes into that set. */
  const { setId: targetSetId, room: roomParam } = useLocalSearchParams<{ setId?: string; room?: string }>();
  const { data: targetSet } = useLoader(() => (targetSetId ? api.getSet(targetSetId) : Promise.resolve(null)), [targetSetId]);
  const { user } = useAuth();
  const showPlaces = user?.settings.multipleLocations ?? false;

  const { data: known } = useLoader(async () => {
    const [items, sets, places] = await Promise.all([
      api.listItems(),
      api.listSets(),
      showPlaces ? api.listLocations() : Promise.resolve([]),
    ]);
    const rooms = [...items.map((i) => i.room), ...sets.map((s) => s.room)].filter((r): r is string => !!r);
    return { rooms: [...new Set([...rooms, ...ROOM_SUGGESTIONS])], places };
  }, [showPlaces]);

  // A target set already has its room and place, so there's nothing to ask. Opened from a room,
  // only the storage place is left to ask (and only if the user has several).
  const [phase, setPhase] = useState<'setup' | 'scan'>(targetSetId || (roomParam && !showPlaces) ? 'scan' : 'setup');
  const [room, setRoom] = useState<string | null>(roomParam || null);
  const [customRoom, setCustomRoom] = useState('');
  const [locationId, setLocationId] = useState<string | null>(null);

  const [pending, setPending] = useState<ProductLabel | null>(null);
  const pendingRef = useRef<ProductLabel | null>(null);
  const [sets, setSets] = useState<Record<string, LinenSetWithItems>>({});
  const [loose, setLoose] = useState<Item[]>([]);
  const [flash, setFlash] = useState<FlashMessage | null>(null);
  const [nfc, setNfc] = useState<NfcAvailability | null>(null);
  const [focused, setFocused] = useState(true);
  const lastSeen = useRef(new Map<string, number>());
  const submitting = useRef(false);

  const placeName = useMemo(() => known?.places.find((p) => p.id === locationId)?.name, [known, locationId]);

  useEffect(() => {
    void nfcAvailability().then(setNfc);
  }, []);

  useFocusEffect(
    useCallback(() => {
      setFocused(true);
      return () => setFocused(false);
    }, []),
  );

  function waitForTag(label: ProductLabel | null) {
    pendingRef.current = label;
    setPending(label);
  }

  async function submit(label: ProductLabel, tagUid: string | null) {
    if (submitting.current) return;
    submitting.current = true;
    try {
      const { tagUid: _labelUid, ...product } = label;
      const result = await api.intake({
        product,
        tagUid,
        purchaseDate: localToday(),
        ...(targetSetId ? { setId: targetSetId } : { room, locationId: showPlaces ? locationId : null }),
      });
      waitForTag(null);
      if (result.item.tagUid) void writeCache(scanKey(result.item.tagUid), { item: result.item, set: result.set });

      const { item, set } = result;
      if (set) {
        setSets((s) => ({ ...s, [set.id]: set }));
        const expected = set.expectedPieces;
        const have = set.items.length;
        const prefix = result.itemCreated ? `✓ ${item.name} added` : `${item.name} was already added`;
        setFlash({
          text:
            expected && have >= expected
              ? `✓ All ${expected} pieces of ${set.name} added!`
              : `${prefix} · ${set.name} ${have}${expected ? ` of ${expected}` : ''}`,
          tone: result.itemCreated ? 'good' : 'info',
        });
      } else {
        if (result.itemCreated) setLoose((l) => [...l, item]);
        setFlash({ text: result.itemCreated ? `✓ ${item.name} added` : `${item.name} was already added`, tone: 'good' });
      }
    } catch (err) {
      if (err instanceof ApiError && err.code === 'TAG_IN_USE') {
        setFlash({ text: 'That tag is already on another item. Try a different tag, or Skip.', tone: 'warn' });
      } else {
        setFlash({ text: (err as Error).message, tone: 'warn' });
      }
    } finally {
      submitting.current = false;
    }
  }

  const submitRef = useRef(submit);
  submitRef.current = submit;

  function onCode(data: string) {
    const now = Date.now();
    const prev = lastSeen.current.get(data);
    if (prev !== undefined && now - prev < REPEAT_WINDOW_MS) return;
    lastSeen.current.set(data, now);

    const label = parseProductLabel(data);
    const waiting = pendingRef.current;
    if (label) {
      if (waiting) {
        setFlash({ text: `First tap the tag on the ${waiting.name}, or press Skip.`, tone: 'warn' });
      } else if (label.tagUid) {
        void submit(label, label.tagUid); // tag ID printed on the label: nothing else to do
      } else {
        waitForTag(label);
        setFlash(null);
      }
    } else if (waiting && QR_TEST_TAGS) {
      void submit(waiting, qrToUid(data)); // testing: any other QR stands in for the item's NFC tag
    } else {
      setFlash({ text: "That's not a LinenTag product label.", tone: 'info' });
    }
  }

  // While an item waits for its tag, listen for the NFC tap.
  useEffect(() => {
    if (!pending || nfc !== 'ready' || !focused) return;
    let stopped = false;
    (async () => {
      while (!stopped) {
        try {
          const uid = await readTagUid(`Tap the tag on the ${pending.name}`);
          if (stopped) break;
          if (uid) {
            await submitRef.current(pending, uid);
            if (!pendingRef.current) break; // done; otherwise (e.g. tag already used) keep listening
            await new Promise((r) => setTimeout(r, 1000));
            continue;
          }
          await new Promise((r) => setTimeout(r, 300));
        } catch (err) {
          if (stopped) break;
          setFlash({ text: (err as Error).message, tone: 'warn' });
          await new Promise((r) => setTimeout(r, 1500));
        }
      }
    })();
    return () => {
      stopped = true;
      void cancelRead();
    };
  }, [pending, nfc, focused]);

  if (phase === 'setup') {
    const rooms = known?.rooms ?? ROOM_SUGGESTIONS;
    return (
      <Screen>
        {roomParam ? (
          <Text style={[styles.muted, { fontSize: 16 }]}>Adding to {roomParam}</Text>
        ) : (
          <>
            <Text style={styles.h1}>Which room is this bedding for?</Text>
            <ChipGroup options={rooms.map((r) => ({ value: r, label: r }))} value={room} onChange={setRoom} />
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="Another room…"
                placeholderTextColor={colors.muted}
                value={customRoom}
                onChangeText={setCustomRoom}
                onSubmitEditing={() => customRoom.trim() && setRoom(customRoom.trim())}
              />
              <Button title="Use" variant="secondary" disabled={!customRoom.trim()} onPress={() => setRoom(customRoom.trim())} />
            </View>
          </>
        )}

        {showPlaces && (known?.places.length ?? 0) > 0 && (
          <>
            <Text style={[styles.h1, { marginTop: roomParam ? 0 : 12 }]}>Where will you keep it?</Text>
            <ChipGroup
              options={known!.places.map((p) => ({ value: p.id, label: p.name }))}
              value={locationId}
              onChange={setLocationId}
            />
          </>
        )}

        <Button title="Start scanning labels" onPress={() => setPhase('scan')} style={{ marginTop: 12, paddingVertical: 18 }} />
        <Text style={[styles.muted, { textAlign: 'center' }]}>You can skip these and set them later.</Text>
        <LabelMakerLink />
      </Screen>
    );
  }

  const setList = Object.values(sets);

  return (
    <Screen>
      {targetSetId ? (
        <>
          <Stack.Screen options={{ title: targetSet ? `Add to ${targetSet.name}` : 'Add to set' }} />
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <ColorDot color={targetSet?.color} />
            <Text style={styles.muted}>Everything you scan goes into {targetSet?.name ?? 'this set'}.</Text>
          </View>
        </>
      ) : (
        <Pressable onPress={() => setPhase('setup')} style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={styles.muted} numberOfLines={1}>
            {[room ?? 'No room chosen', showPlaces && placeName].filter(Boolean).join(' · ')}
          </Text>
          <Text style={{ color: colors.accent }}>Change</Text>
        </Pressable>
      )}

      {focused && <QrCamera style={{ height: 240, borderRadius: 14 }} hint="Scan the label on each item" onCode={onCode} />}

      {pending ? (
        <Card style={{ borderColor: colors.accent, borderWidth: 2 }}>
          <Text style={styles.muted}>Now tap the NFC tag on the</Text>
          <Text style={[styles.h2, { fontSize: 20 }]}>{describe(pending)}</Text>
          {QR_TEST_TAGS && <Text style={styles.muted}>Testing: scan any other QR code as its tag.</Text>}
          <Button title="Skip — add it without a tag" variant="secondary" onPress={() => void submit(pending, null)} />
        </Card>
      ) : (
        setList.length === 0 &&
        loose.length === 0 && (
          <>
            <Text style={[styles.muted, { textAlign: 'center', fontSize: 16 }]}>
              Scan the QR label on each item, one after another.
            </Text>
            <LabelMakerLink />
          </>
        )
      )}

      <Flash message={flash} />

      {setList.map((set) => {
        const done = !!set.expectedPieces && set.items.length >= set.expectedPieces;
        return (
          <Card key={set.id} style={done ? { borderColor: colors.accent, borderWidth: 2 } : undefined}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <ColorDot color={set.color} />
              <Text style={[styles.h2, { flex: 1 }]}>{set.name}</Text>
              <Text style={[styles.h2, { color: done ? colors.accent : colors.muted }]}>
                {set.items.length}
                {set.expectedPieces ? `/${set.expectedPieces}` : ''}
              </Text>
            </View>
            {set.items.map((piece) => (
              <Text key={piece.id} style={{ fontSize: 15 }}>
                ✓ {describe(piece)}
                {!piece.tagUid && <Text style={{ color: colors.warn }}> · no tag yet</Text>}
              </Text>
            ))}
            {!done && set.expectedPieces && (
              <Text style={styles.muted}>
                {set.expectedPieces - set.items.length} more to scan
              </Text>
            )}
          </Card>
        );
      })}

      {loose.length > 0 && (
        <Card>
          <Text style={styles.h2}>Added (no set)</Text>
          {loose.map((item) => (
            <Text key={item.id} style={{ fontSize: 15 }}>
              ✓ {describe(item)}
            </Text>
          ))}
        </Card>
      )}

      <Button title="Done" onPress={() => router.back()} style={{ marginTop: 8 }} />
    </Screen>
  );
}
