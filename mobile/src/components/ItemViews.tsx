import { router } from 'expo-router';
import { Text, View } from 'react-native';
import { SIZE_LABELS, STATUS_LABELS, TYPE_LABELS, formatDate } from '@/lib/labels';
import type { Item, LinenSetWithItems } from '@/lib/types';
import { useAuth } from '@/lib/auth';
import { Card, ColorDot, Row, colors, styles } from './ui';

export function itemSubtitle(item: Item) {
  return [item.size && SIZE_LABELS[item.size], TYPE_LABELS[item.type], item.color].filter(Boolean).join(' · ');
}

export function ItemRow({ item, right }: { item: Item; right?: string }) {
  return (
    <Card onPress={() => router.push({ pathname: '/item/[id]', params: { id: item.id } })} style={{ gap: 2 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8 }}>
        <Text style={styles.h2} numberOfLines={1}>
          {item.name}
        </Text>
        {right && <Text style={styles.muted}>{right}</Text>}
      </View>
      <Text style={styles.muted}>{itemSubtitle(item)}</Text>
      {item.status !== 'active' && <Text style={{ color: colors.warn }}>{STATUS_LABELS[item.status]}</Text>}
    </Card>
  );
}

/** The at-a-glance card shown after a scan and on the item screen. */
export function ItemSummary({ item, setName }: { item: Item; setName?: string | null }) {
  return (
    <Card>
      {setName && (
        <Text style={{ color: colors.goldText, fontSize: 12, fontWeight: '600', letterSpacing: 1, textTransform: 'uppercase' }}>{setName}</Text>
      )}
      <Text style={styles.h1}>{item.name}</Text>
      <Text style={[styles.muted, { fontSize: 16 }]}>{itemSubtitle(item)}</Text>
      <View style={{ marginTop: 8 }}>
        <Row label="Size" value={item.size && SIZE_LABELS[item.size]} />
        <Row label="Material" value={item.material} />
        <Row label="Color" value={item.color} />
        <Row label="Room" value={item.room} />
        <Row label="Status" value={STATUS_LABELS[item.status]} />
        <Row label="Purchased" value={item.purchaseDate && formatDate(item.purchaseDate)} />
        <Row label="Washes" value={item.washCount} />
        <Row label="Last washed" value={item.lastWashedAt && formatDate(item.lastWashedAt)} />
      </View>
      {item.notes && (
        <View style={{ marginTop: 4, gap: 4 }}>
          <Text style={styles.label}>Notes</Text>
          <Text style={{ fontSize: 15, color: colors.text }}>{item.notes}</Text>
        </View>
      )}
    </Card>
  );
}

export function SetPieces({ set, highlightId }: { set: LinenSetWithItems; highlightId?: string }) {
  const showPlaces = useAuth().user?.settings.multipleLocations ?? false;
  const locationName = showPlaces ? set.locationName : null;
  return (
    <Card onPress={() => router.push({ pathname: '/set/[id]', params: { id: set.id } })}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <ColorDot color={set.color} />
        <Text style={[styles.h2, { flexShrink: 1 }]}>
          {set.name} · {set.items.length} {set.items.length === 1 ? 'piece' : 'pieces'}
        </Text>
      </View>
      {locationName && <Text style={{ color: colors.accent }}>Kept in {locationName}</Text>}
      {set.items.map((piece) => (
        <View key={piece.id} style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8 }}>
          <Text style={{ fontSize: 15, color: colors.text, fontWeight: piece.id === highlightId ? '700' : '400' }}>
            {piece.id === highlightId ? '● ' : '○ '}
            {piece.name}
          </Text>
          <Text style={styles.muted}>{TYPE_LABELS[piece.type]}</Text>
        </View>
      ))}
    </Card>
  );
}
