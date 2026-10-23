import { router, useNavigation } from 'expo-router';
import { useLayoutEffect, useMemo, useState } from 'react';
import { FlatList, Pressable, RefreshControl, Text, TextInput, View } from 'react-native';
import { SetRow, groupByRoom, setSearchText } from '@/components/SetViews';
import { Banner, Card, ColorDot, Empty, colors, styles } from '@/components/ui';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { useLoader } from '@/lib/useLoader';

/** Sets, organised by room: pick a room, then a set. Searching shows matching sets directly. */
export default function Sets() {
  const navigation = useNavigation();
  const showPlaces = useAuth().user?.settings.multipleLocations ?? false;
  const { data, error, refreshing, refresh } = useLoader(api.listSets, [], 'sets');
  const [q, setQ] = useState('');

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable onPress={() => router.push('/set/edit')} style={{ paddingHorizontal: 16 }} hitSlop={8}>
          <Text style={{ color: colors.accent, fontSize: 16, fontWeight: '600' }}>New set</Text>
        </Pressable>
      ),
    });
  }, [navigation]);

  const rooms = useMemo(() => groupByRoom(data ?? []), [data]);
  const needle = q.trim().toLowerCase();
  const matches = useMemo(
    () => (needle ? (data ?? []).filter((s) => needle.split(/\s+/).every((t) => setSearchText(s).includes(t))) : []),
    [data, needle],
  );

  const header = (
    <View style={{ gap: 12, marginBottom: 4 }}>
      {error && <Banner text={data ? 'Offline — showing your last synced sets.' : error.message} />}
      <TextInput
        style={styles.input}
        placeholder="Search sets"
        value={q}
        onChangeText={setQ}
        placeholderTextColor={colors.muted}
        clearButtonMode="while-editing"
      />
    </View>
  );

  if (needle) {
    return (
      <FlatList
        style={styles.screen}
        contentContainerStyle={[styles.screenPad, { gap: 10 }]}
        keyboardShouldPersistTaps="handled"
        data={matches}
        keyExtractor={(s) => s.id}
        ListHeaderComponent={header}
        renderItem={({ item }) => <SetRow set={item} showPlace={showPlaces} showRoom />}
        ListEmptyComponent={<Empty text="No sets match." />}
      />
    );
  }

  return (
    <FlatList
      style={styles.screen}
      contentContainerStyle={[styles.screenPad, { gap: 10 }]}
      keyboardShouldPersistTaps="handled"
      data={rooms}
      keyExtractor={(r) => r.key}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}
      ListHeaderComponent={header}
      renderItem={({ item: room }) => (
        <Card
          onPress={() => router.push({ pathname: '/room/[name]', params: { name: room.key, label: room.label } })}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}
        >
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={[styles.h2, { fontSize: 19 }]}>{room.label}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              {room.sets.slice(0, 8).map((s) => (
                <ColorDot key={s.id} color={s.color} size={12} />
              ))}
              <Text style={[styles.muted, { marginLeft: 4 }]}>
                {room.sets.length} {room.sets.length === 1 ? 'set' : 'sets'}
              </Text>
            </View>
          </View>
          <Text style={[styles.muted, { fontSize: 22 }]}>›</Text>
        </Card>
      )}
      ListEmptyComponent={
        data ? (
          <Empty text="No sets yet. Add new bedding from the Home tab, or tap New set." />
        ) : undefined
      }
    />
  );
}
