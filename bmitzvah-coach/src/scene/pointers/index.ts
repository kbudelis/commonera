import { buildSilverYad } from './silverYad';
import type { PointerBuilder, PointerId } from './types';

/** Era pointer visuals. Placeholders point at the silver yad until each
    era's real pointer lands (commits alongside the era). */
export const POINTERS: Record<PointerId, PointerBuilder> = {
  finger: buildSilverYad,
  mouseArrow: buildSilverYad,
  blockCursor: buildSilverYad,
  ballpoint: buildSilverYad,
  woodPointer: buildSilverYad,
  quill: buildSilverYad,
  silverYad: buildSilverYad,
};
