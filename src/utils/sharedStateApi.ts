import { BucketItem, CoupleSettings, LoveLetter, LoveReason, Milestone } from '../types';

export interface SharedAppState {
  settings: CoupleSettings;
  letters: LoveLetter[];
  reasons: LoveReason[];
  milestones: Milestone[];
  bucketList: BucketItem[];
  secretNotes: string[];
}

export async function loadSharedAppState(): Promise<Partial<SharedAppState>> {
  const response = await fetch('/api/state');
  if (!response.ok) throw new Error('No se pudieron cargar los datos compartidos de la beta.');
  return (await response.json()) as Partial<SharedAppState>;
}

export async function saveSharedAppState(state: SharedAppState) {
  const response = await fetch('/api/state', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(state),
  });
  if (!response.ok) throw new Error('No se pudieron guardar los datos compartidos de la beta.');
}
