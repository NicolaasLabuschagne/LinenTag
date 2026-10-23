import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, Switch, Text, TextInput, View } from 'react-native';
import { Banner, Button, Card, colors, Screen, styles } from '@/components/ui';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import type { StorageLocation } from '@/lib/types';
import { useLoader } from '@/lib/useLoader';

export default function Settings() {
  const { user, updateMe, signOut } = useAuth();
  const { data: places, setData: setPlaces } = useLoader(api.listLocations, []);
  const [newPlace, setNewPlace] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!user) return null;
  const { multipleLocations, trackWashes } = user.settings;

  async function attempt(fn: () => Promise<unknown>) {
    setError(null);
    try {
      await fn();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  const addPlace = () =>
    attempt(async () => {
      const name = newPlace.trim();
      if (!name) return;
      const created = await api.createLocation(name);
      setPlaces((p) => [...(p ?? []), created]);
      setNewPlace('');
    });

  const renamePlace = (place: StorageLocation, name: string) =>
    attempt(async () => {
      if (!name.trim() || name.trim() === place.name) return;
      const updated = await api.renameLocation(place.id, name.trim());
      setPlaces((p) => p?.map((x) => (x.id === place.id ? updated : x)) ?? null);
    });

  const removePlace = (place: StorageLocation) =>
    attempt(async () => {
      await api.deleteLocation(place.id);
      setPlaces((p) => p?.filter((x) => x.id !== place.id) ?? null);
    });

  return (
    <Screen>
      {error && <Banner tone="danger" text={error} />}

      <Card>
        <Toggle
          title="More than one storage place"
          subtitle="Choose where each set is kept, like a hall closet or a bedroom closet"
          value={multipleLocations}
          onChange={(v) => attempt(() => updateMe({ settings: { multipleLocations: v } }))}
        />
        {multipleLocations && (
          <View style={{ gap: 8, marginTop: 8 }}>
            {places?.map((place) => (
              <View key={place.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  defaultValue={place.name}
                  onEndEditing={(e) => renamePlace(place, e.nativeEvent.text)}
                />
                <Pressable onPress={() => removePlace(place)} hitSlop={8}>
                  <Text style={{ color: colors.danger }}>Remove</Text>
                </Pressable>
              </View>
            ))}
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="Add a place…"
                placeholderTextColor={colors.muted}
                value={newPlace}
                onChangeText={setNewPlace}
                onSubmitEditing={addPlace}
              />
              <Button title="Add" variant="secondary" onPress={addPlace} disabled={!newPlace.trim()} />
            </View>
          </View>
        )}
      </Card>

      <Card>
        <Toggle
          title="Count washes"
          subtitle="Add one wash each time you put an item away after laundry"
          value={trackWashes}
          onChange={(v) => attempt(() => updateMe({ settings: { trackWashes: v } }))}
        />
      </Card>

      <Card onPress={() => router.push('/nfc-tags')}>
        <Text style={[styles.h2, { fontSize: 16 }]}>NFC tags</Text>
        <Text style={styles.muted}>Get sew-in tags, or upgrade bedding that uses printed labels</Text>
      </Card>

      <Text style={[styles.muted, { textAlign: 'center' }]}>Signed in as {user.email}</Text>
      <Button title="Sign out" variant="secondary" onPress={signOut} />
    </Screen>
  );
}

function Toggle({
  title,
  subtitle,
  value,
  onChange,
}: {
  title: string;
  subtitle: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={[styles.h2, { fontSize: 16 }]}>{title}</Text>
        <Text style={styles.muted}>{subtitle}</Text>
      </View>
      <Switch value={value} onValueChange={onChange} trackColor={{ true: colors.accent }} />
    </View>
  );
}
