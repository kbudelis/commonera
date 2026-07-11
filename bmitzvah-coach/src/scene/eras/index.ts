import { makeDefaultEra } from './defaultEra';
import { eraLaptop } from './eraLaptop';
import type { EraDef, EraId } from './types';

/** Real device eras register here as they land; anything missing falls back
    to the flat parchment defaultEra so every level is always playable. */
export const ERAS: Partial<Record<EraId, EraDef>> = {
  laptop1995: eraLaptop,
};

export function resolveEra(id: EraId): EraDef {
  return ERAS[id] ?? makeDefaultEra(id);
}
