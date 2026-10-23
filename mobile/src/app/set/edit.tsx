import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { itemSubtitle } from '@/components/ItemViews';
import { Banner, Button, ChipGroup, ColorDot, Empty, Field, Screen, colors, styles } from '@/components/ui';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { SET_COLORS } from '@/lib/labels';
import type { Item, SetColor, SetInput, StorageLocation } from '@/lib/types';

export default function EditSet() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const [items, setItems] = useState<Item[] | null>(null);
  const [name, setName] = useState('');
  const [room, setRoom] = useState('');
  const [notes, setNotes] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [color, setColor] = useState<SetColor | null>(null);
  const [locationId, setLocationId] = useState<string | null>(null);
  const [places, setPlaces] = useState<StorageLocation[]>([]);
  const { user } = useAuth();
  const showPlaces = user?.settings.multipleLocations ?? false;
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [all, set, locs] = await Promise.all([
          api.listItems(),
          id ? api.getSet(id) : null,
          showPlaces ? api.listLocations() : [],
        ]);
        if (set) {
          setName(set.name);
          setRoom(set.room ?? '');
          setNotes(set.notes ?? '');
          setColor(set.color);
          setLocationId(set.locationId);
          setSelected(new Set(set.items.map((i) => i.id)));
        }
        setPlaces(locs);
        setItems(all);
      } catch (err) {
        setError((err as Error).message);
      }
    })();
  }, [id, showPlaces]);

  const toggle = (itemId: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) next.delete(itemId);
      else next.add(itemId);
      return next;
    });

  async function save() {
    setSaving(true);
    setError(null);
    const input: SetInput = {
      name: name.trim(),
      room: room.trim() || null,
      notes: notes.trim() || null,
      itemIds: [...selected],
      // Leaving colour unpicked on a new set lets the server choose an unused one.
      ...(color ? { color } : {}),
      ...(showPlaces ? { locationId } : {}),
    };
    try {
      if (id) {
        await api.updateSet(id, input);
        router.back();
      } else {
        const set = await api.createSet(input);
        router.replace({ pathname: '/set/[id]', params: { id: set.id } });
      }
    } catch (err) {
      setError((err as Error).message);
      setSaving(false);
    }
  }

  return (
    <Screen>
      <Stack.Screen options={{ title: id ? 'Edit set' : 'New set' }} />
      {error && <Banner tone="danger" text={error} />}
      <Field label="Name" value={name} onChangeText={setName} placeholder="e.g. Master Bedroom Set" />
      <Field label="Room" value={room} onChangeText={setRoom} placeholder="e.g. Master Bedroom" />
      <View style={{ gap: 6 }}>
        <Text style={styles.label}>Colour{!id && !color ? ' (we’ll pick one if you skip this)' : ''}</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
          {(Object.keys(SET_COLORS) as SetColor[]).map((c) => (
            <Pressable
              key={c}
              accessibilityRole="radio"
              accessibilityLabel={SET_COLORS[c].label}
              accessibilityState={{ selected: color === c }}
              onPress={() => setColor(c)}
              style={{
                padding: 3,
                borderRadius: 999,
                borderWidth: 2,
                borderColor: color === c ? colors.text : 'transparent',
              }}
            >
              <ColorDot color={c} size={30} />
            </Pressable>
          ))}
        </View>
      </View>
      {showPlaces && places.length > 0 && (
        <ChipGroup
          label="Kept in"
          options={places.map((p) => ({ value: p.id, label: p.name }))}
          value={locationId}
          onChange={setLocationId}
        />
      )}
      <Field label="Notes" value={notes} onChangeText={setNotes} placeholder="e.g. Seasonal bedding" />

      <Text style={styles.label}>Pieces ({selected.size} selected)</Text>
      {items?.length === 0 && <Empty text="Add some items first, then group them here." />}
      {items?.map((item) => {
        const on = selected.has(item.id);
        // Selecting an item already in another set moves it to this one.
        const elsewhere = item.setId && item.setId !== id && !on;
        return (
          <Pressable
            key={item.id}
            onPress={() => toggle(item.id)}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: on }}
            style={[styles.card, { flexDirection: 'row', alignItems: 'center', gap: 12 }, on && { borderColor: colors.accent }]}
          >
            <Text style={{ fontSize: 20, color: on ? colors.accent : colors.muted }}>{on ? '☑' : '☐'}</Text>
            <View style={{ flex: 1 }}>
              <Text style={[styles.h2, { fontSize: 16 }]}>{item.name}</Text>
              <Text style={styles.muted}>{itemSubtitle(item)}</Text>
              {elsewhere && <Text style={{ color: colors.warn }}>In another set — selecting moves it here</Text>}
            </View>
          </Pressable>
        );
      })}

      <Button title="Save set" onPress={save} loading={saving} disabled={!name.trim() || !items} />
    </Screen>
  );
}
