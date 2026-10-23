import { CameraView, useCameraPermissions } from 'expo-camera';
import { StyleSheet, Text, View, type ViewStyle } from 'react-native';
import { Button, colors, styles } from './ui';

/**
 * Camera that reports every QR code it sees (it fires repeatedly while a code stays in view,
 * so callers de-duplicate). Handles the permission prompt itself.
 */
export function QrCamera({ onCode, style, hint }: { onCode: (data: string) => void; style?: ViewStyle; hint?: string }) {
  const [permission, requestPermission] = useCameraPermissions();

  if (!permission) return <View style={[{ backgroundColor: '#000' }, style]} />;

  if (!permission.granted) {
    return (
      <View style={[styles.card, { justifyContent: 'center' }, style]}>
        <Text style={styles.h2}>Camera access needed</Text>
        <Text style={styles.muted}>QR codes stand in for NFC tags while testing.</Text>
        {permission.canAskAgain ? (
          <Button title="Allow camera" onPress={requestPermission} />
        ) : (
          <Text style={{ color: colors.danger }}>Camera access was denied. Enable it for LinenTag in your phone's Settings.</Text>
        )}
      </View>
    );
  }

  return (
    <View style={[{ backgroundColor: '#000', overflow: 'hidden' }, style]}>
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        onBarcodeScanned={({ data }) => onCode(data)}
      />
      {hint && <Text style={qrStyles.hint}>{hint}</Text>}
    </View>
  );
}

const qrStyles = StyleSheet.create({
  hint: {
    position: 'absolute',
    bottom: 16,
    alignSelf: 'center',
    color: '#fff',
    fontSize: 15,
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    overflow: 'hidden',
  },
});
