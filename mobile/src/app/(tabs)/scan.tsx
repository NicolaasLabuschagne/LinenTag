import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Platform, Switch, Text, View } from 'react-native';
import { ItemSummary, SetPieces } from '@/components/ItemViews';
import { Banner, Button, Card, Screen, colors, styles } from '@/components/ui';
import { ApiError, api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { readCache, removeCache, scanKey, writeCache } from '@/lib/cache';
import { cancelRead, nfcAvailability, openNfcSettings, readTagUid, type NfcAvailability } from '@/lib/nfc';
import { QR_TEST_TAGS, UntaggedItemError, scanQr } from '@/lib/qr';
import type { ScanResult } from '@/lib/types';

type State =
  | { kind: 'idle' }
  | { kind: 'scanning' }
  | { kind: 'found'; result: ScanResult; offline: boolean; washRecorded: boolean; untagged?: boolean }
  | { kind: 'unknown'; uid: string }
  | { kind: 'error'; message: string };

export default function Scan() {
  const [nfc, setNfc] = useState<NfcAvailability | null>(null);
  const trackWashes = useAuth().user?.settings.trackWashes ?? false;
  const [washToggle, setWash] = useState(false);
  const wash = trackWashes && washToggle;
  const [state, setState] = useState<State>({ kind: 'idle' });

  useFocusEffect(
    useCallback(() => {
      void nfcAvailability().then(setNfc);
      return () => void cancelRead();
    }, []),
  );

  async function scan(readUid: () => Promise<string | null> = readTagUid) {
    setState({ kind: 'scanning' });
    let uid: string | null;
    try {
      uid = await readUid();
    } catch (err) {
      if (err instanceof UntaggedItemError) {
        // A label for an item with no tag yet: still show what it is.
        const { item } = err;
        const set = item.setId ? await api.getSet(item.setId).catch(() => null) : null;
        setState({ kind: 'found', result: { item, set }, offline: false, washRecorded: false, untagged: true });
        return;
      }
      setState({ kind: 'error', message: (err as Error).message });
      return;
    }
    if (!uid) {
      setState({ kind: 'idle' });
      return;
    }

    // Show the cached result instantly; the network result replaces it a moment later.
    const cached = await readCache<ScanResult>(scanKey(uid));
    if (cached) setState({ kind: 'found', result: cached, offline: false, washRecorded: false });

    try {
      const result = await api.scan(uid, wash);
      setState({ kind: 'found', result, offline: false, washRecorded: wash });
      void writeCache(scanKey(uid), result);
    } catch (err) {
      if (err instanceof ApiError && err.code === 'TAG_NOT_REGISTERED') {
        void removeCache(scanKey(uid));
        setState({ kind: 'unknown', uid });
      } else if (cached && err instanceof ApiError && err.isNetwork) {
        setState({ kind: 'found', result: cached, offline: true, washRecorded: false });
      } else {
        setState({ kind: 'error', message: (err as Error).message });
      }
    }
  }

  if (nfc === 'unsupported' && !QR_TEST_TAGS) {
    return (
      <Screen>
        <Banner tone="danger" text="This device doesn't support NFC, so it can't read LinenTags." />
      </Screen>
    );
  }

  return (
    <Screen>
      {nfc === 'unsupported' && <Banner text="This device doesn't support NFC. Use QR test tags instead." />}
      {nfc === 'disabled' && (
        <Card>
          <Text style={styles.h2}>NFC is turned off</Text>
          <Button title="Open NFC settings" variant="secondary" onPress={openNfcSettings} />
        </Card>
      )}

      {trackWashes && (
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.h2, { fontSize: 16 }]}>Count as a wash</Text>
            <Text style={styles.muted}>Adds one to the wash count of each item you scan</Text>
          </View>
          <Switch value={wash} onValueChange={setWash} trackColor={{ true: colors.accent }} />
        </View>
      )}

      <Button
        title={state.kind === 'scanning' ? 'Waiting for tag…' : state.kind === 'idle' ? 'Scan tag' : 'Scan another'}
        onPress={() => scan()}
        disabled={state.kind === 'scanning' || nfc !== 'ready'}
        style={{ paddingVertical: 22 }}
      />
      {QR_TEST_TAGS && (
        <Button
          title="Scan a QR label or test tag"
          variant="secondary"
          onPress={() => scan(scanQr)}
          disabled={state.kind === 'scanning'}
        />
      )}
      {state.kind === 'scanning' && Platform.OS === 'android' && (
        <Text style={[styles.muted, { textAlign: 'center' }]}>Hold the back of your phone against the tag</Text>
      )}

      {state.kind === 'error' && <Banner tone="danger" text={state.message} />}

      {state.kind === 'unknown' && (
        <Card>
          <Text style={styles.h2}>New tag</Text>
          <Text style={styles.muted}>This tag isn't linked to any of your items yet.</Text>
          <Button
            title="Register a new item"
            onPress={() => router.push({ pathname: '/item/edit', params: { tagUid: state.uid } })}
          />
          <Button
            title="Link to an existing item"
            variant="secondary"
            onPress={() => router.push({ pathname: '/item/link', params: { tagUid: state.uid } })}
          />
        </Card>
      )}

      {state.kind === 'found' && (
        <>
          {state.offline && (
            <Banner text={wash ? 'Offline — showing saved details. This wash was not recorded.' : 'Offline — showing saved details.'} />
          )}
          {state.washRecorded && <Banner text={`Wash recorded · ${state.result.item.washCount} total`} />}
          {state.untagged && <Banner text="Found by its label. This item has no tag yet: open it and tap Link a tag." />}
          <ItemSummary item={state.result.item} setName={state.result.set?.name} />
          {state.result.set && <SetPieces set={state.result.set} highlightId={state.result.item.id} />}
          <Button
            title="Open item"
            variant="secondary"
            onPress={() => router.push({ pathname: '/item/[id]', params: { id: state.result.item.id } })}
          />
        </>
      )}
    </Screen>
  );
}
