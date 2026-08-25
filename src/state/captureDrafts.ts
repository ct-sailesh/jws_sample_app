import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Local, best-effort draft persistence for an in-progress guided-capture
 * session, keyed by vehicle registration number. Deliberately minimal:
 * only `id -> uri` per captured shot, not full `CaptureAngle` objects
 * (those already live in code/content and shouldn't be duplicated into
 * storage) and no copying of the photo files themselves into permanent
 * storage — accepted trade-off (confirmed) is that a photo occasionally
 * won't be there if the OS evicts Expo's cache between sessions.
 *
 * Every function is try/catch-wrapped and never throws — losing a draft
 * read/write is not worth crashing the capture flow over.
 */

export interface CaptureDraft {
  registration: string;
  updatedAt: number;
  currentIndex: number;
  /** Angle id -> captured photo uri. */
  capturedUris: Record<string, string>;
}

const STORAGE_PREFIX = '@jsw/captureDraft/';

/** Normalizes a registration number so "MH 12 QK 4821" and "mh12qk4821" hit the same draft. */
function normalize(registration: string): string {
  return registration.replace(/\s+/g, '').toUpperCase();
}

function keyFor(registration: string): string {
  return `${STORAGE_PREFIX}${normalize(registration)}`;
}

export async function saveDraft(draft: CaptureDraft): Promise<void> {
  try {
    await AsyncStorage.setItem(keyFor(draft.registration), JSON.stringify(draft));
  } catch {
    // best-effort
  }
}

export async function loadDraft(registration: string): Promise<CaptureDraft | null> {
  if (!registration.trim()) return null;
  try {
    const raw = await AsyncStorage.getItem(keyFor(registration));
    if (!raw) return null;
    return JSON.parse(raw) as CaptureDraft;
  } catch {
    return null;
  }
}

export async function deleteDraft(registration: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(keyFor(registration));
  } catch {
    // best-effort
  }
}
