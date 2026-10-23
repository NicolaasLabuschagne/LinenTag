import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Text } from 'react-native';
import { Banner, Button, Card, ChipGroup, Field, Screen, styles } from '@/components/ui';
import { api } from '@/lib/api';
import { SIZE_LABELS, STATUS_LABELS, TYPE_LABELS, localToday, options } from '@/lib/labels';
import type { ItemInput, ItemType, LinenSet, Size, Status } from '@/lib/types';

/** Create (optionally pre-linked to a scanned tag) or edit an item. */
export default function EditItem() {
  const { id, tagUid } = useLocalSearchParams<{ id?: string; tagUid?: string }>();
  const [loaded, setLoaded] = useState(!id);
  const [sets, setSets] = useState<LinenSet[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [type, setType] = useState<ItemType | null>(null);
  const [size, setSize] = useState<Size | null>(null);
  const [material, setMaterial] = useState('');
  const [color, setColor] = useState('');
  const [room, setRoom] = useState('');
  // New items default to today; the user can change it.
  const [purchaseDate, setPurchaseDate] = useState(id ? '' : localToday());
  const [setId, setSetId] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>('active');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    api.listSets().then(setSets, () => {});
    if (!id) return;
    api.getItem(id).then(
      (item) => {
        setName(item.name);
        setType(item.type);
        setSize(item.size);
        setMaterial(item.material ?? '');
        setColor(item.color ?? '');
        setRoom(item.room ?? '');
        setPurchaseDate(item.purchaseDate ?? '');
        setSetId(item.setId);
        setStatus(item.status);
        setNotes(item.notes ?? '');
        setLoaded(true);
      },
      (err) => setError(err.message),
    );
  }, [id]);

  const dateValid = !purchaseDate || /^\d{4}-\d{2}-\d{2}$/.test(purchaseDate);

  async function save() {
    if (!type) return;
    setSaving(true);
    setError(null);
    const input: ItemInput = {
      name: name.trim(),
      type,
      size,
      material,
      color,
      room,
      notes,
      status,
      setId,
      // Cleared on a new item: the server fills in today.
      purchaseDate: purchaseDate || (id ? null : localToday()),
    };
    try {
      if (id) {
        await api.updateItem(id, input);
        router.back();
      } else {
        const item = await api.createItem({ ...input, tagUid: tagUid ?? null });
        router.replace({ pathname: '/item/[id]', params: { id: item.id } });
      }
    } catch (err) {
      setError((err as Error).message);
      setSaving(false);
    }
  }

  return (
    <Screen>
      <Stack.Screen options={{ title: id ? 'Edit item' : 'New item' }} />
      {error && <Banner tone="danger" text={error} />}
      {tagUid && !id && (
        <Card>
          <Text style={styles.label}>Linking tag</Text>
          <Text style={{ fontFamily: 'monospace' }}>{tagUid}</Text>
        </Card>
      )}
      {loaded && (
        <>
          <Field label="Name" value={name} onChangeText={setName} placeholder="e.g. Master Bedroom Fitted Sheet" />
          <ChipGroup label="Type" options={options(TYPE_LABELS)} value={type} onChange={setType} allowClear={false} />
          <ChipGroup label="Size" options={options(SIZE_LABELS)} value={size} onChange={setSize} />
          <Field label="Material" value={material} onChangeText={setMaterial} placeholder="e.g. 100% Cotton" />
          <Field label="Color" value={color} onChangeText={setColor} placeholder="e.g. White" />
          <Field label="Room" value={room} onChangeText={setRoom} placeholder="e.g. Guest Room" />
          <Field
            label="Purchase date"
            value={purchaseDate}
            onChangeText={setPurchaseDate}
            placeholder="YYYY-MM-DD"
            keyboardType="numbers-and-punctuation"
          />
          {sets.length > 0 && (
            <ChipGroup label="Set" options={sets.map((s) => ({ value: s.id, label: s.name }))} value={setId} onChange={setSetId} />
          )}
          {id && (
            <ChipGroup
              label="Status"
              options={options(STATUS_LABELS)}
              value={status}
              onChange={(s) => s && setStatus(s)}
              allowClear={false}
            />
          )}
          <Field
            label="Notes"
            value={notes}
            onChangeText={setNotes}
            placeholder="e.g. Deep pocket mattress"
            multiline
            style={[styles.input, { minHeight: 80, textAlignVertical: 'top' }]}
          />
          {!dateValid && <Text style={{ color: 'crimson' }}>Purchase date must look like 2026-01-31</Text>}
          <Button title="Save" onPress={save} loading={saving} disabled={!name.trim() || !type || !dateValid} />
        </>
      )}
    </Screen>
  );
}
