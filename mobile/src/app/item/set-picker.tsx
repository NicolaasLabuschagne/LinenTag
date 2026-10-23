import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import { Banner, Button, Card, ColorDot, Screen, colors, styles } from '@/components/ui';
import { api } from '@/lib/api';
import { useLoader } from '@/lib/useLoader';

/** Put one item into an existing set, or a new one. */
export default function SetPicker() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data } = useLoader(async () => {
    const [item, sets] = await Promise.all([api.getItem(id), api.listSets()]);
    return { item, sets };
  }, [id]);
  const [newName, setNewName] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run(fn: () => Promise<unknown>) {
    setBusy(true);
    setError(null);
    try {
      await fn();
      router.back();
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  }

  if (!data) return <Screen>{error && <Banner tone="danger" text={error} />}</Screen>;
  const { item, sets } = data;

  return (
    <Screen>
      <Text style={styles.h1}>Which set does {item.name} belong to?</Text>
      {error && <Banner tone="danger" text={error} />}

      {sets.map((set) => {
        const current = set.id === item.setId;
        return (
          <Card
            key={set.id}
            onPress={busy || current ? undefined : () => run(() => api.updateItem(id, { setId: set.id }))}
            style={current ? { borderColor: colors.accent, borderWidth: 2 } : undefined}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <ColorDot color={set.color} size={18} />
              <Text style={[styles.h2, { flex: 1 }]}>{set.name}</Text>
              <Text style={styles.muted}>{current ? 'Current' : `${set.itemCount ?? 0} pieces`}</Text>
            </View>
          </Card>
        );
      })}

      <Card>
        <Text style={styles.h2}>Make a new set</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Guest room sheets"
          placeholderTextColor={colors.muted}
          value={newName}
          onChangeText={setNewName}
        />
        <Button
          title="Create and add"
          disabled={!newName.trim() || busy}
          onPress={() => run(() => api.createSet({ name: newName.trim(), itemIds: [id] }))}
        />
      </Card>

      {item.setId && (
        <Button
          title="Remove from its set"
          variant="danger"
          disabled={busy}
          onPress={() => run(() => api.updateItem(id, { setId: null }))}
        />
      )}
    </Screen>
  );
}
