/*
  The shared field every screen sits in. Misty ranges receding into haze —
  depth, not illustration. Abstract per the aniconic law; the mountains are a
  feeling, not a place.

    day       — warm cream mist, a soft sun-glow (arrival, deeper)
    dawn      — the same warm plate: the welcome-back morning (havdalah return)
    dusk      — a warm sunset over the ranges: the day beginning to wane (intake)
    dusk-deep — a deeper twilight, the light going gold-to-indigo (pledge)
    night     — deep indigo field, milky way, a warm glow rising (ceremony)

  Day → dusk → dusk-deep → night is one continuous darkening as you move through
  the ritual. These are the produced mist plates, self-hosted in /public/plates
  (nothing here measures you). They drop in as the full field; the solid screen
  background shows through if an image ever fails to load.
*/

type Variant = 'day' | 'dawn' | 'dusk' | 'dusk-deep' | 'night';

const PLATE: Record<Variant, string> = {
  day: '/plates/day-mist.webp',
  dawn: '/plates/day-mist.webp',
  dusk: '/plates/dusk.webp',
  'dusk-deep': '/plates/dusk-deep.webp',
  night: '/plates/night-field.webp',
};

export function Atmosphere({
  variant = 'day',
  plate,
  className,
}: {
  variant?: Variant;
  /* Override the plate for this instance only — the variant still drives tone
     classes, but the image swaps out. Used by arrival for its own field. */
  plate?: string;
  className?: string;
}) {
  return (
    <div
      className={`atmosphere atmosphere--${variant}${className ? ` ${className}` : ''}`}
      style={{ backgroundImage: `url(${plate ?? PLATE[variant]})` }}
      aria-hidden="true"
    />
  );
}

/* The mark: fine-print rings, a portal of words. On surfaces with no user text
   yet it carries the practice's own line — the one exception to "the word is
   the ornament." Pass the user's words where they exist. */
export function WordRing({
  outer = 'one day, set apart · one day, set apart · one day, set apart · one day, set apart ·',
  inner = 'a very old answer to a very new kind of tired · a very old answer ·',
  tone = 'ink',
  className,
}: {
  outer?: string;
  inner?: string;
  tone?: 'ink' | 'parchment';
  className?: string;
}) {
  return (
    <svg
      className={className ? `word-ring word-ring--${tone} ${className}` : `word-ring word-ring--${tone}`}
      viewBox="0 0 320 320"
      aria-hidden="true"
    >
      <defs>
        <path id="ring-orbit-outer" d="M 160,160 m -138,0 a 138,138 0 1,1 276,0 a 138,138 0 1,1 -276,0" fill="none" />
        <path id="ring-orbit-inner" d="M 160,160 m -104,0 a 104,104 0 1,1 208,0 a 104,104 0 1,1 -208,0" fill="none" />
      </defs>
      <g className="word-ring__outer">
        <text>
          <textPath href="#ring-orbit-outer" textLength="866" lengthAdjust="spacingAndGlyphs">{outer}</textPath>
        </text>
      </g>
      <g className="word-ring__inner">
        <text>
          <textPath href="#ring-orbit-inner" textLength="652" lengthAdjust="spacingAndGlyphs">{inner}</textPath>
        </text>
      </g>
    </svg>
  );
}
