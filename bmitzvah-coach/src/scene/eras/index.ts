import { makeDefaultEra } from './defaultEra';
import type { EraDef, EraId } from './types';

/** Real device eras register here as they land; anything missing falls back
    to the flat parchment defaultEra so every level is always playable. */
export const ERAS: Partial<Record<EraId, EraDef>> = {};

export function resolveEra(id: EraId): EraDef {
  return ERAS[id] ?? makeDefaultEra(id);
}
