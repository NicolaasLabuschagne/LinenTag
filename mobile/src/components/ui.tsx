import type { ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { SET_COLORS } from '@/lib/labels';
import type { SetColor } from '@/lib/types';

/** Sage & gold palette (matches the website). Gold is too light for text: use goldText. */
export const colors = {
  bg: '#FAF8F5',
  card: '#FFFFFF',
  text: '#1F2937',
  muted: '#6B7280',
  border: '#ECE7DF',
  accent: '#556B5D', // sage: buttons, selection
  accentDeep: '#3F5246', // text on accentSoft
  accentSoft: '#D9E7DD', // light sage surfaces
  gold: '#B68D40', // fills and highlights, with dark text
  goldText: '#8A6A2C',
  goldSoft: '#F6EEDD',
  neutralSoft: '#EFEBE3',
  danger: '#B3402F',
  warn: '#6B5320',
  warnSoft: '#F6EEDD',
};

/** Display serif for screen titles; loaded in the root layout. */
export const fonts = { display: 'Fraunces_500Medium', displayBold: 'Fraunces_600SemiBold' };

export function Button({
  title,
  onPress,
  variant = 'primary',
  loading,
  disabled,
  style,
}: {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}) {
  const v = buttonVariants[variant];
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.button,
        v.container,
        (disabled || loading) && { opacity: 0.5 },
        pressed && { opacity: 0.8 },
        style,
      ]}
    >
      {loading ? <ActivityIndicator color={v.text.color} /> : <Text style={[styles.buttonText, v.text]}>{title}</Text>}
    </Pressable>
  );
}

const buttonVariants = {
  primary: { container: { backgroundColor: colors.accent }, text: { color: '#fff' } },
  secondary: {
    container: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
    text: { color: colors.text },
  },
  danger: {
    container: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.danger },
    text: { color: colors.danger },
  },
};

export function Field({ label, ...props }: TextInputProps & { label: string }) {
  return (
    <View style={{ gap: 6 }}>
      <Text style={styles.label}>{label}</Text>
      <TextInput placeholderTextColor={colors.muted} style={styles.input} {...props} />
    </View>
  );
}

export function ChipGroup<V extends string>({
  label,
  options,
  value,
  onChange,
  allowClear = true,
}: {
  label?: string;
  options: { value: V; label: string }[];
  value: V | null | undefined;
  onChange: (value: V | null) => void;
  allowClear?: boolean;
}) {
  return (
    <View style={{ gap: 6 }}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.chips}>
        {options.map((o) => {
          const selected = o.value === value;
          return (
            <Pressable
              key={o.value}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              onPress={() => onChange(selected && allowClear ? null : o.value)}
              style={[styles.chip, selected && styles.chipSelected]}
            >
              <Text style={[styles.chipText, selected && { color: '#fff' }]}>{o.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export function MultiChipGroup({
  options,
  selected,
  onToggle,
}: {
  options: string[];
  selected: string[];
  onToggle: (value: string) => void;
}) {
  return (
    <View style={styles.chips}>
      {options.map((o) => {
        const on = selected.includes(o);
        return (
          <Pressable
            key={o}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: on }}
            onPress={() => onToggle(o)}
            style={[styles.chip, { paddingVertical: 10, paddingHorizontal: 14 }, on && styles.chipSelected]}
          >
            <Text style={[styles.chipText, { fontSize: 16 }, on && { color: '#fff' }]}>
              {on ? '✓ ' : ''}
              {o}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function Card({ children, style, onPress }: { children: ReactNode; style?: StyleProp<ViewStyle>; onPress?: () => void }) {
  if (onPress) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => [styles.card, pressed && { opacity: 0.85 }, style]}>
        {children}
      </Pressable>
    );
  }
  return <View style={[styles.card, style]}>{children}</View>;
}

export function Screen({ children, scroll = true }: { children: ReactNode; scroll?: boolean }) {
  if (!scroll) return <View style={[styles.screen, styles.screenPad]}>{children}</View>;
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.screenPad} keyboardShouldPersistTaps="handled">
      {children}
    </ScrollView>
  );
}

export function Row({ label, value }: { label: string; value: string | number | null | undefined }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value === null || value === undefined || value === '' ? '—' : value}</Text>
    </View>
  );
}

export function Banner({ text, tone = 'warn' }: { text: string; tone?: 'warn' | 'danger' }) {
  return (
    <View style={[styles.banner, tone === 'danger' && { backgroundColor: '#F8E3DF' }]}>
      <Text style={{ color: tone === 'danger' ? colors.danger : colors.warn }}>{text}</Text>
    </View>
  );
}

export function ColorDot({ color, size = 14 }: { color: SetColor | null | undefined; size?: number }) {
  if (!color) return null;
  return (
    <View
      accessibilityLabel={`${SET_COLORS[color].label} set`}
      style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: SET_COLORS[color].hex }}
    />
  );
}

/** A large, full-width answer button for setup questions. */
export function ChoiceButton({ title, subtitle, onPress }: { title: string; subtitle?: string; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.card, { paddingVertical: 22 }, pressed && { borderColor: colors.accent, opacity: 0.9 }]}
    >
      <Text style={[styles.h2, { fontSize: 20 }]}>{title}</Text>
      {subtitle && <Text style={styles.muted}>{subtitle}</Text>}
    </Pressable>
  );
}

export type FlashMessage = { text: string; tone: 'good' | 'info' | 'warn' };

/** Feedback for the most recent scan in the continuous-scan screens. */
export function Flash({ message }: { message: FlashMessage | null }) {
  if (!message) return null;
  return (
    <View
      style={[
        styles.banner,
        message.tone === 'good' && { backgroundColor: colors.accentSoft },
        message.tone === 'info' && { backgroundColor: colors.neutralSoft },
      ]}
    >
      <Text style={{ fontSize: 16, color: message.tone === 'warn' ? colors.warn : colors.text }}>{message.text}</Text>
    </View>
  );
}

export function Empty({ text }: { text: string }) {
  return <Text style={styles.empty}>{text}</Text>;
}

export const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  screenPad: { padding: 16, gap: 16, paddingBottom: 40 },
  h1: { fontSize: 28, fontFamily: fonts.display, letterSpacing: -0.4, color: colors.text },
  h2: { fontSize: 18, fontWeight: '600', color: colors.text },
  muted: { color: colors.muted },
  label: { fontSize: 13, fontWeight: '600', color: colors.muted, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text,
  },
  button: { borderRadius: 16, paddingVertical: 15, paddingHorizontal: 16, alignItems: 'center', justifyContent: 'center' },
  buttonText: { fontSize: 16, fontWeight: '600' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  chipSelected: { backgroundColor: colors.accent, borderColor: colors.accent },
  chipText: { color: colors.text, fontSize: 14 },
  card: { backgroundColor: colors.card, borderRadius: 20, padding: 16, borderWidth: 1, borderColor: colors.border, gap: 8 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, gap: 12 },
  rowLabel: { color: colors.muted, fontSize: 15 },
  rowValue: { color: colors.text, fontSize: 15, fontWeight: '500', flexShrink: 1, textAlign: 'right' },
  banner: { backgroundColor: colors.warnSoft, borderRadius: 14, padding: 12 },
  empty: { color: colors.muted, textAlign: 'center', paddingVertical: 24 },
});
