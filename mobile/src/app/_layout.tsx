import { Fraunces_500Medium } from '@expo-google-fonts/fraunces/500Medium';
import { Fraunces_600SemiBold } from '@expo-google-fonts/fraunces/600SemiBold';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View } from 'react-native';
import { colors, fonts } from '@/components/ui';
import { AuthProvider, useAuth } from '@/lib/auth';

function RootStack() {
  const { user, loading } = useAuth();
  const [fontsLoaded, fontError] = useFonts({ Fraunces_500Medium, Fraunces_600SemiBold });
  // If the font fails to load, carry on with the system font rather than blocking the app.
  if (loading || (!fontsLoaded && !fontError)) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', backgroundColor: colors.bg }}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.bg },
        headerTintColor: colors.accent,
        headerTitleStyle: { color: colors.text, fontFamily: fontError ? undefined : fonts.display },
        contentStyle: { backgroundColor: colors.bg },
      }}
    >
      <Stack.Protected guard={!!user && !user.onboarded}>
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
      </Stack.Protected>
      <Stack.Protected guard={!!user?.onboarded}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="sort" options={{ title: 'Put away laundry' }} />
        <Stack.Screen name="add" options={{ title: 'Add new bedding' }} />
        <Stack.Screen name="set/add" options={{ title: 'Add pieces' }} />
        <Stack.Screen name="room/[name]" options={{ title: 'Room' }} />
        <Stack.Screen name="room/move" options={{ title: 'Move bedding here', presentation: 'modal' }} />
        <Stack.Screen name="nfc-tags" options={{ title: 'NFC tags' }} />
        <Stack.Screen name="upgrade" options={{ title: 'Upgrade to NFC' }} />
        <Stack.Screen name="item/set-picker" options={{ title: 'Choose a set', presentation: 'modal' }} />
        <Stack.Screen name="settings" options={{ title: 'Settings' }} />
        <Stack.Screen name="item/[id]" options={{ title: 'Item' }} />
        <Stack.Screen name="item/edit" options={{ presentation: 'modal' }} />
        <Stack.Screen name="item/link" options={{ title: 'Link tag', presentation: 'modal' }} />
        <Stack.Screen name="set/[id]" options={{ title: 'Set' }} />
        <Stack.Screen name="set/edit" options={{ presentation: 'modal' }} />
        <Stack.Screen name="qr-scan" options={{ title: 'Scan QR code' }} />
      </Stack.Protected>
      <Stack.Protected guard={!user}>
        <Stack.Screen name="sign-in" options={{ headerShown: false }} />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <StatusBar style="dark" />
      <RootStack />
    </AuthProvider>
  );
}
