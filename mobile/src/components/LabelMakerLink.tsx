import { Linking, Pressable, Text } from 'react-native';
import { WEB_URL } from '@/lib/api';
import { colors, styles } from './ui';

/** Points owners of older bedding (no label, no tag) to the website's label maker. */
export function LabelMakerLink() {
  return (
    <Pressable
      accessibilityRole="link"
      onPress={() => void Linking.openURL(`${WEB_URL}/labels`)}
      style={{ paddingVertical: 8, alignSelf: 'center' }}
    >
      <Text style={[styles.muted, { textAlign: 'center' }]}>
        No label?{' '}
        <Text style={{ color: colors.accent, fontWeight: '600' }}>Make labels for bedding you already own</Text>
      </Text>
    </Pressable>
  );
}
