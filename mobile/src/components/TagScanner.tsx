import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Platform, Pressable, Text } from 'react-native';
import { cancelRead, nfcAvailability, readTagUid, type NfcAvailability } from '@/lib/nfc';
import { QR_TEST_TAGS, qrToTagUid } from '@/lib/qr';
import { QrCamera } from './QrCamera';
import { Button, Card, colors, styles } from './ui';

/** The same tag is ignored for this long: the phone/camera keeps seeing it while it's held there. */
const REPEAT_WINDOW_MS = 4000;
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Continuous tag scanning: NFC tags one after another with no button press, or QR test tags
 * through the camera. Calls `onUid` once per tag (per repeat window); pauses while the screen
 * is in the background.
 */
export function TagScanner({
  onUid,
  onError,
  prompt = 'Tap your phone on each item',
}: {
  onUid: (uid: string) => Promise<void> | void;
  onError?: (message: string) => void;
  prompt?: string;
}) {
  const [nfc, setNfc] = useState<NfcAvailability | null>(null);
  const [mode, setMode] = useState<'nfc' | 'qr' | null>(null);
  const [focused, setFocused] = useState(true);
  const [paused, setPaused] = useState(false);
  const lastSeen = useRef(new Map<string, number>());

  // Latest callbacks, without restarting the scan loop.
  const handlers = useRef({ onUid, onError });
  handlers.current = { onUid, onError };

  const emit = useCallback(async (uid: string) => {
    const now = Date.now();
    const prev = lastSeen.current.get(uid);
    if (prev !== undefined && now - prev < REPEAT_WINDOW_MS) return;
    lastSeen.current.set(uid, now);
    await handlers.current.onUid(uid);
  }, []);

  // The camera reports a code many times a second; product labels also need a server lookup,
  // so skip codes seen recently before resolving them.
  const lastCode = useRef(new Map<string, number>());
  const onQr = useCallback(
    async (data: string) => {
      const now = Date.now();
      const prev = lastCode.current.get(data);
      if (prev !== undefined && now - prev < REPEAT_WINDOW_MS) return;
      lastCode.current.set(data, now);
      try {
        await emit(await qrToTagUid(data));
      } catch (err) {
        handlers.current.onError?.((err as Error).message);
      }
    },
    [emit],
  );

  useEffect(() => {
    void nfcAvailability().then((a) => {
      setNfc(a);
      setMode(a === 'ready' || !QR_TEST_TAGS ? 'nfc' : 'qr');
    });
  }, []);

  useFocusEffect(
    useCallback(() => {
      setFocused(true);
      return () => setFocused(false);
    }, []),
  );

  useEffect(() => {
    if (mode !== 'nfc' || nfc !== 'ready' || !focused || paused) return;
    let stopped = false;
    (async () => {
      while (!stopped) {
        try {
          const uid = await readTagUid('Hold your phone to the next item');
          if (stopped) break;
          if (uid) {
            await emit(uid);
            await delay(600);
          } else if (Platform.OS === 'ios') {
            setPaused(true); // user closed the system scan sheet
            break;
          } else {
            await delay(300);
          }
        } catch (err) {
          if (stopped) break;
          handlers.current.onError?.((err as Error).message);
          await delay(1500);
        }
      }
    })();
    return () => {
      stopped = true;
      void cancelRead();
    };
  }, [mode, nfc, focused, paused, emit]);

  return (
    <>
      {mode === 'qr' && focused && (
        <QrCamera style={{ height: 240, borderRadius: 14 }} hint="Point at each QR tag or label" onCode={(d) => void onQr(d)} />
      )}
      {mode === 'nfc' && (
        <Card style={{ alignItems: 'center', paddingVertical: 24 }}>
          <Text style={[styles.h2, { fontSize: 20, textAlign: 'center' }]}>
            {nfc === 'ready' ? prompt : nfc === 'disabled' ? 'Turn on NFC to scan' : 'NFC is not available'}
          </Text>
          <Text style={[styles.muted, { textAlign: 'center' }]}>No need to press anything between items.</Text>
          {paused && <Button title="Keep scanning" onPress={() => setPaused(false)} />}
        </Card>
      )}
      {QR_TEST_TAGS && mode && (
        <Pressable onPress={() => setMode(mode === 'nfc' ? 'qr' : 'nfc')} style={{ alignSelf: 'center' }}>
          <Text style={{ color: colors.accent }}>{mode === 'nfc' ? 'Use QR test tags instead' : 'Use NFC instead'}</Text>
        </Pressable>
      )}
    </>
  );
}
