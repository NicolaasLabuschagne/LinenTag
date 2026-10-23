import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, Text, TextInput, View } from 'react-native';
import { itemSubtitle } from '@/components/ItemViews';
import { Banner, Card, Empty, colors, styles } from '@/components/ui';
import { api } from '@/lib/api';
import { useLoader } from '@/lib/useLoader';

/** Pick an existing item to attach a freshly scanned tag to. */
export default function LinkTag() {
  const { tagUid } = useLocalSearchParams<{ tagUid: string }>();
  const { data, error } = useLoader(() => api.listItems(), []);
  const [q, setQ] = useState('');
  const [linkError, setLinkError] = useState<string | null>(null);

  const items = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return (data ?? [])
      .filter((i) => !needle || i.name.toLowerCase().includes(needle))
      .sort((a, b) => Number(!!a.tagUid) - Number(!!b.tagUid));
  }, [data, q]);

  async function link(id: string) {
    setLinkError(null);
    try {
      await api.linkTag(id, tagUid);
      router.replace({ pathname: '/item/[id]', params: { id } });
    } catch (err) {
      setLinkError((err as Error).message);
    }
  }

  return (
    <FlatList
      style={styles.screen}
      contentContainerStyle={[styles.screenPad, { gap: 10 }]}
      data={items}
      keyExtractor={(i) => i.id}
      keyboardShouldPersistTaps="handled"
      ListHeaderComponent={
        <View style={{ gap: 12 }}>
          <Text style={styles.muted}>
            Choose the item tag <Text style={{ fontFamily: 'monospace' }}>{tagUid}</Text> is sewn into. Items without a tag are listed first.
          </Text>
          {(error || linkError) && <Banner tone="danger" text={linkError ?? error!.message} />}
          <TextInput style={styles.input} placeholder="Search items" value={q} onChangeText={setQ} placeholderTextColor={colors.muted} />
        </View>
      }
      renderItem={({ item }) => (
        <Card onPress={() => link(item.id)} style={{ gap: 2 }}>
          <Text style={styles.h2}>{item.name}</Text>
          <Text style={styles.muted}>{itemSubtitle(item)}</Text>
          {item.tagUid && <Text style={{ color: colors.warn }}>Already tagged — linking replaces its tag</Text>}
        </Card>
      )}
      ListEmptyComponent={data ? <Empty text="No items to link." /> : undefined}
    />
  );
}
