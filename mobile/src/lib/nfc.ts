import { Platform } from 'react-native';
import NfcManager, { NfcError, NfcTech } from 'react-native-nfc-manager';
import { normalizeUid } from './labels';

export type NfcAvailability = 'ready' | 'unsupported' | 'disabled';

// Washable laundry tags are usually NTAG21x (NFC-A) or ICODE (ISO 15693).
// Requesting these techs (rather than Ndef) is what exposes the tag UID on iOS.
const TECHS =
  Platform.OS === 'ios'
    ? [NfcTech.MifareIOS, NfcTech.Iso15693IOS]
    : [NfcTech.NfcA, NfcTech.NfcV, NfcTech.IsoDep];

let started: Promise<void> | null = null;
let busy = false;

function ensureStarted() {
  started ??= NfcManager.start().catch((err) => {
    started = null;
    throw err;
  });
  return started;
}

export async function nfcAvailability(): Promise<NfcAvailability> {
  try {
    if (!(await NfcManager.isSupported())) return 'unsupported';
    await ensureStarted();
    // iOS has no NFC on/off switch; isEnabled is Android-only in practice.
    if (Platform.OS === 'android' && !(await NfcManager.isEnabled())) return 'disabled';
    return 'ready';
  } catch {
    return 'unsupported';
  }
}

export const openNfcSettings = () => NfcManager.goToNfcSetting();

/**
 * Wait for a tag and return its normalised UID.
 * Resolves null if the user cancels or a scan is already in progress.
 */
export async function readTagUid(prompt = 'Hold your phone near the LinenTag'): Promise<string | null> {
  if (busy) return null;
  busy = true;
  try {
    await ensureStarted();
    await NfcManager.requestTechnology(TECHS, { alertMessage: prompt });
    const tag = await NfcManager.getTag();
    if (!tag?.id) throw new Error("Couldn't read this tag's ID. Try holding the phone still.");
    if (Platform.OS === 'ios') await NfcManager.setAlertMessageIOS('Got it').catch(() => {});
    return normalizeUid(tag.id);
  } catch (err) {
    if (err instanceof NfcError.UserCancel) return null;
    throw err instanceof Error ? err : new Error(String(err));
  } finally {
    await NfcManager.cancelTechnologyRequest().catch(() => {});
    busy = false;
  }
}

/** Cancel an in-flight Android scan (iOS has its own system sheet with a Cancel button). */
export const cancelRead = () => NfcManager.cancelTechnologyRequest().catch(() => {});
