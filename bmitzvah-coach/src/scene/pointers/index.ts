import { buildMouseArrow } from './mouseArrow';
import { buildSilverYad } from './silverYad';
import { buildWoodPointer } from './woodPointer';
import type { PointerBuilder, PointerId } from './types';

/** Era pointer visuals. Placeholders point at the silver yad until each
    era's real pointer lands (commits alongside the era). */
export const POINTERS: Record<PointerId, PointerBuilder> = {
  finger: buildSilverYad,
  mouseArrow: buildMouseArrow,
  blockCursor: buildSilverYad,
  ballpoint: buildSilverYad,
  woodPointer: buildWoodPointer,
  quill: buildSilverYad,
  silverYad: buildSilverYad,
};
