import { buildBallpoint } from './ballpoint';
import { buildTouchCursor } from './touchCursor';
import { buildMouseArrow } from './mouseArrow';
import { buildQuill } from './quill';
import { buildSilverYad } from './silverYad';
import { buildWoodPointer } from './woodPointer';
import type { PointerBuilder, PointerId } from './types';

/** Era pointer visuals. Placeholders point at the silver yad until each
    era's real pointer lands (commits alongside the era). */
export const POINTERS: Record<PointerId, PointerBuilder> = {
  touchCursor: buildTouchCursor,
  mouseArrow: buildMouseArrow,
  ballpoint: buildBallpoint,
  woodPointer: buildWoodPointer,
  quill: buildQuill,
  silverYad: buildSilverYad,
};
