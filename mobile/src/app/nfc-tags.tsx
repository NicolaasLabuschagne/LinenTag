import { router } from 'expo-router';
import { Linking, Text, View } from 'react-native';
import { Button, Card, Screen, colors, styles } from '@/components/ui';
import { WEB_URL } from '@/lib/api';

const BENEFITS = [
  ['Tap instead of aiming a camera', 'Hold your phone to the sheet. No light or angle needed.'],
  ['Made for the wash', 'Sealed capsules survive hot washes and the dryer, where printed labels fade.'],
  ['Invisible', 'Sewn into a seam or hem, so nothing shows on the bed.'],
  ['Keeps everything', 'Your sets, rooms and wash counts carry over. The old label still works as a backup.'],
] as const;

/** Explains the NFC tag kit for older bedding and starts the label-to-NFC upgrade. */
export default function NfcTags() {
  return (
    <Screen>
      <Text style={styles.h1}>NFC tags for your bedding</Text>
      <Text style={[styles.muted, { fontSize: 16 }]}>
        Using printed labels? Sew in LinenTag NFC tags for a permanent, wash-proof upgrade.
      </Text>

      {BENEFITS.map(([title, body]) => (
        <View key={title} style={{ flexDirection: 'row', gap: 12 }}>
          <Text style={{ color: colors.accent, fontSize: 18, fontWeight: '700' }}>✓</Text>
          <View style={{ flex: 1 }}>
            <Text style={[styles.h2, { fontSize: 16 }]}>{title}</Text>
            <Text style={styles.muted}>{body}</Text>
          </View>
        </View>
      ))}

      <Button title="Get NFC tags" onPress={() => void Linking.openURL(`${WEB_URL}/nfc-tags`)} style={{ marginTop: 8 }} />

      <Card>
        <Text style={styles.h2}>Already have your tags?</Text>
        <Text style={styles.muted}>Sew one into each piece, then scan each printed label and tap its new tag.</Text>
        <Button title="Upgrade my bedding" variant="secondary" onPress={() => router.push('/upgrade')} />
      </Card>
    </Screen>
  );
}
