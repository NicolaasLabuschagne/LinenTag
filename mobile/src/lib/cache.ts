import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Item, ScanResult } from './types';

/**
 * Offline cache. Scan results are keyed by tag UID so a tap can render instantly
 * (and with no signal) while the fresh result loads in the background.
 */
const PREFIX = 'lt:';

export async function readCache<T>(key: string): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(PREFIX + key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export async function writeCache(key: string, value: unknown): Promise<void> {
  try {
    await AsyncStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    // Cache is best-effort.
  }
}

export async function removeCache(key: string): Promise<void> {
  await AsyncStorage.removeItem(PREFIX + key).catch(() => {});
}

export async function clearCache(): Promise<void> {
  const keys = (await AsyncStorage.getAllKeys()).filter((k) => k.startsWith(PREFIX));
  if (keys.length) await AsyncStorage.multiRemove(keys);
}

export const scanKey = (uid: string) => `scan:${uid}`;

/** Seed scan entries from an item list so freshly-synced items scan offline too. */
export async function primeScanCache(items: Item[]): Promise<void> {
  await Promise.all(
    items
      .filter((item) => item.tagUid)
      .map(async (item) => {
        const key = scanKey(item.tagUid!);
        const existing = await readCache<ScanResult>(key);
        const set = existing?.set && existing.set.id === item.setId ? existing.set : null;
        await writeCache(key, { item, set } satisfies ScanResult);
      }),
  );
}
