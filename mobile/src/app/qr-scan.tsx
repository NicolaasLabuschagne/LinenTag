import { router } from 'expo-router';
import { useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { QrCamera } from '@/components/QrCamera';
import { finishQrScan } from '@/lib/qr';

export default function QrScan() {
  const done = useRef(false);

  // Leaving without scanning (back gesture, header button) resolves the caller with null.
  useEffect(() => () => finishQrScan(null), []);

  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      <QrCamera
        style={StyleSheet.absoluteFill}
        hint="Point the camera at a QR code"
        onCode={(data) => {
          if (done.current) return;
          done.current = true;
          finishQrScan(data);
          router.back();
        }}
      />
      <View style={frame} pointerEvents="none" />
    </View>
  );
}

const frame = {
  position: 'absolute',
  alignSelf: 'center',
  top: '30%',
  width: 240,
  height: 240,
  borderWidth: 3,
  borderColor: '#fff',
  borderRadius: 16,
} as const;
