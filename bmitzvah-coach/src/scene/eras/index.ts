import { makeDefaultEra } from './defaultEra';
import { eraCrt } from './eraCrt';
import { eraDotMatrix } from './eraDotMatrix';
import { eraLaptop } from './eraLaptop';
import { eraTablet } from './eraTablet';
import { eraSiddur } from './eraSiddur';
import type { EraDef, EraId } from './types';

/** Real device eras register here as they land; anything missing falls back
    to the flat parchment defaultEra so every level is always playable. */
export const ERAS: Partial<Record<EraId, EraDef>> = {
  tablet2026: eraTablet,
  dotmatrix1978: eraDotMatrix,
  crt1984: eraCrt,
  laptop1995: eraLaptop,
  siddur1565: eraSiddur,
};

export function resolveEra(id: EraId): EraDef {
  return ERAS[id] ?? makeDefaultEra(id);
}
