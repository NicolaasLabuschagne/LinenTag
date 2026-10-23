import { router, useNavigation } from 'expo-router';
import { useLayoutEffect } from 'react';
import { Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { ItemRow } from '@/components/ItemViews';
import { Banner, Button, Card, Empty, colors, fonts, styles } from '@/components/ui';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { timeAgo } from '@/lib/labels';
import { useLoader } from '@/lib/useLoader';

export default function Home() {
  const { user } = useAuth();
  const navigation = useNavigation();
  const { data, error, refreshing, refresh } = useLoader(api.dashboard, [], 'dashboard');

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable onPress={() => router.push('/settings')} style={{ paddingHorizontal: 16 }} hitSlop={8}>
          <Text style={{ color: colors.accent, fontSize: 16, fontWeight: '600' }}>Settings</Text>
        </Pressable>
      ),
    });
  }, [navigation]);

  const isEmpty = data?.totalItems === 0;

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.screenPad}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}
    >
      <Text style={styles.h1}>Hi{user?.name ? ` ${user.name}` : ''}!</Text>
      {error && <Banner text={data ? 'Offline — showing your last synced data.' : error.message} />}

      {isEmpty ? (
        <Card>
          <Text style={styles.h2}>Add your first bedding</Text>
          <Text style={styles.muted}>Scan the QR label on each new sheet and pillowcase. LinenTag fills in the details for you.</Text>
          <Button title="Add new bedding" onPress={() => router.push('/add')} style={{ paddingVertical: 18 }} />
        </Card>
      ) : (
        <>
          <Button title="Put away laundry" onPress={() => router.push('/sort')} style={{ paddingVertical: 22 }} />
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <Button title="What's this?" variant="secondary" onPress={() => router.navigate('/scan')} style={{ flex: 1 }} />
            <Button title="Add new bedding" variant="secondary" onPress={() => router.push('/add')} style={{ flex: 1 }} />
          </View>
        </>
      )}

      {(data?.printedLabelItems ?? 0) > 0 && (
        <Card
          onPress={() => router.push('/nfc-tags')}
          style={{ backgroundColor: colors.goldSoft, borderColor: '#E8D7B3', flexDirection: 'row', alignItems: 'center', gap: 12 }}
        >
          <View
            accessible={false}
            style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.gold, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5 }}
          >
            <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: colors.bg }} />
            <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: colors.bg }} />
          </View>
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={[styles.h2, { fontSize: 16 }]}>Upgrade to NFC tags</Text>
            <Text style={{ color: colors.warn }}>
              {data!.printedLabelItems} {data!.printedLabelItems === 1 ? 'piece uses' : 'pieces use'} a printed label
            </Text>
          </View>
        </Card>
      )}

      <View style={{ flexDirection: 'row', gap: 12 }}>
        <Stat label="Items" value={data?.totalItems} onPress={() => router.navigate('/items')} />
        <Stat label="Sets" value={data?.totalSets} onPress={() => router.navigate('/sets')} />
      </View>

      {!isEmpty && (
        <>
          <Text style={styles.h2}>Recently scanned</Text>
          {data?.recentlyScanned.length === 0 && <Empty text="Nothing scanned yet." />}
          {data?.recentlyScanned.map(({ item, scannedAt }) => (
            <ItemRow key={item.id} item={item} right={timeAgo(scannedAt)} />
          ))}
        </>
      )}
    </ScrollView>
  );
}

function Stat({ label, value, onPress }: { label: string; value?: number; onPress: () => void }) {
  return (
    <Card onPress={onPress} style={{ flex: 1, gap: 2 }}>
      <Text style={{ fontSize: 32, fontFamily: fonts.display, color: colors.text }}>{value ?? '–'}</Text>
      <Text style={styles.muted}>{label}</Text>
    </Card>
  );
}
