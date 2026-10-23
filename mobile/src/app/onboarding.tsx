import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { Banner, Button, ChoiceButton, MultiChipGroup, Screen, colors, styles } from '@/components/ui';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';

const PLACE_SUGGESTIONS = [
  'Hall closet',
  'Linen cupboard',
  'Main bedroom closet',
  'Guest room closet',
  'Kids room closet',
  'Bathroom cabinet',
  'Storage room',
];

type Step = 'where' | 'places' | 'washes' | 'done';

/**
 * First-run setup: a few one-tap questions. The answers decide which features the app shows,
 * so people who don't need storage places or wash counts never see them.
 */
export default function Onboarding() {
  const { updateMe, user } = useAuth();
  const [step, setStep] = useState<Step>('where');
  const [multipleLocations, setMultipleLocations] = useState(false);
  const [places, setPlaces] = useState<string[]>([]);
  const [custom, setCustom] = useState('');
  const [trackWashes, setTrackWashes] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const steps: Step[] = multipleLocations ? ['where', 'places', 'washes'] : ['where', 'washes'];
  const stepNumber = steps.indexOf(step) + 1;

  const togglePlace = (name: string) =>
    setPlaces((prev) => (prev.includes(name) ? prev.filter((p) => p !== name) : [...prev, name]));

  function addCustom() {
    const name = custom.trim();
    if (name && !places.includes(name)) setPlaces([...places, name]);
    setCustom('');
  }

  async function finish() {
    setSaving(true);
    setError(null);
    try {
      if (multipleLocations) {
        // Safe to retry: skip places that already exist.
        const existing = new Set((await api.listLocations()).map((l) => l.name.toLowerCase()));
        for (const name of places) {
          if (!existing.has(name.toLowerCase())) await api.createLocation(name);
        }
      }
      await updateMe({ onboarded: true, settings: { multipleLocations, trackWashes } });
      // The root layout switches to the app once `onboarded` is true.
    } catch (err) {
      setError((err as Error).message);
      setSaving(false);
    }
  }

  const back = () => setStep(steps[Math.max(0, steps.indexOf(step) - 1)]);

  return (
    <Screen>
      <View style={{ marginTop: 56, gap: 6 }}>
        {step !== 'done' && (
          <Text style={styles.muted}>
            Step {stepNumber} of {steps.length}
          </Text>
        )}
      </View>

      {step === 'where' && (
        <>
          <Text style={[styles.h1, { marginBottom: 8 }]}>
            {user?.name ? `Hi ${user.name}! ` : 'Welcome! '}Where do you keep your bedding?
          </Text>
          <ChoiceButton
            title="In one place"
            subtitle="Like a single linen closet"
            onPress={() => {
              setMultipleLocations(false);
              setStep('washes');
            }}
          />
          <ChoiceButton
            title="In more than one place"
            subtitle="Like a hall closet and a bedroom closet"
            onPress={() => {
              setMultipleLocations(true);
              setStep('places');
            }}
          />
        </>
      )}

      {step === 'places' && (
        <>
          <Text style={styles.h1}>Which places?</Text>
          <Text style={[styles.muted, { fontSize: 16 }]}>Tap all that apply. You can change these later.</Text>
          <MultiChipGroup
            options={[...new Set([...PLACE_SUGGESTIONS, ...places])]}
            selected={places}
            onToggle={togglePlace}
          />
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="Add your own…"
              placeholderTextColor={colors.muted}
              value={custom}
              onChangeText={setCustom}
              onSubmitEditing={addCustom}
              returnKeyType="done"
            />
            <Button title="Add" variant="secondary" onPress={addCustom} disabled={!custom.trim()} />
          </View>
          <Button title="Next" onPress={() => setStep('washes')} disabled={places.length === 0} style={{ marginTop: 8 }} />
          <BackLink onPress={back} />
        </>
      )}

      {step === 'washes' && (
        <>
          <Text style={[styles.h1, { marginBottom: 8 }]}>Should LinenTag count how often things are washed?</Text>
          <Text style={[styles.muted, { fontSize: 16 }]}>It helps you spot sheets that are wearing out.</Text>
          <Text style={[styles.muted, { fontSize: 16 }]}>This will require you to scan items before/after each wash.</Text>
          <ChoiceButton
            title="Yes, count washes"
            onPress={() => {
              setTrackWashes(true);
              setStep('done');
            }}
          />
          <ChoiceButton
            title="No thanks"
            onPress={() => {
              setTrackWashes(false);
              setStep('done');
            }}
          />
          <BackLink onPress={back} />
        </>
      )}

      {step === 'done' && (
        <>
          <Text style={[styles.h1, { fontSize: 32 }]}>You're all set!</Text>
          <Text style={[styles.muted, { fontSize: 17, lineHeight: 24 }]}>
            Next, group your bedding into sets, like "Main bedroom sheets". Then after laundry, tap{' '}
            <Text style={{ fontWeight: '700', color: colors.text }}>Put away laundry</Text> and LinenTag shows you which pieces belong
            together.
          </Text>
          {error && <Banner tone="danger" text={error} />}
          <Button title="Let's go" onPress={finish} loading={saving} style={{ marginTop: 8, paddingVertical: 18 }} />
          <BackLink onPress={() => setStep('washes')} />
        </>
      )}
    </Screen>
  );
}

function BackLink({ onPress }: { onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={{ padding: 8, alignSelf: 'center' }}>
      <Text style={{ color: colors.accent, fontSize: 15 }}>Back</Text>
    </Pressable>
  );
}
