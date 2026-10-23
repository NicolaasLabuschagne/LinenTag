import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, Text, View } from 'react-native';
import { Banner, Button, Field, Screen, colors, styles } from '@/components/ui';
import { useAuth } from '@/lib/auth';

/** Hide Google sign-in until its OAuth client is configured (see README). */
const GOOGLE_CONFIGURED = !!process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;

export default function SignIn() {
  const { signIn, signUp, signInWithGoogle } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState<'email' | 'google' | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function attempt(kind: 'email' | 'google', fn: () => Promise<unknown>) {
    setBusy(kind);
    setError(null);
    try {
      await fn();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(null);
    }
  }

  const submit = () =>
    attempt('email', () => (mode === 'signin' ? signIn(email.trim(), password) : signUp(email.trim(), password)));

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Screen>
        <View style={{ marginTop: 72, marginBottom: 16, gap: 6 }}>
          <Text style={[styles.h1, { fontSize: 34 }]}>LinenTag</Text>
          <Text style={[styles.muted, { fontSize: 16 }]}>Tap a sheet. Know exactly what it is.</Text>
        </View>

        {error && <Banner tone="danger" text={error} />}

        <Field
          label="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          textContentType="emailAddress"
        />
        <Field
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
          textContentType={mode === 'signin' ? 'password' : 'newPassword'}
          placeholder={mode === 'signup' ? 'At least 8 characters' : undefined}
          onSubmitEditing={submit}
        />
        <Button
          title={mode === 'signin' ? 'Sign in' : 'Create account'}
          onPress={submit}
          loading={busy === 'email'}
          disabled={!email || password.length < (mode === 'signup' ? 8 : 1) || busy !== null}
        />

        {GOOGLE_CONFIGURED && (
          <>
            <Text style={[styles.muted, { textAlign: 'center' }]}>or</Text>
            <Button
              title="Continue with Google"
              variant="secondary"
              onPress={() => attempt('google', signInWithGoogle)}
              loading={busy === 'google'}
              disabled={busy !== null}
            />
          </>
        )}

        <Pressable
          onPress={() => {
            setMode(mode === 'signin' ? 'signup' : 'signin');
            setError(null);
          }}
          style={{ padding: 8 }}
        >
          <Text style={{ color: colors.accent, textAlign: 'center', fontSize: 15 }}>
            {mode === 'signin' ? 'New here? Create an account' : 'Already have an account? Sign in'}
          </Text>
        </Pressable>
      </Screen>
    </KeyboardAvoidingView>
  );
}
