import type { WeekRecord } from '../shared/store';

type Tile = {
  x: number;
  y: number;
  opacity: number;
  fill: 'gold' | 'ember' | 'lapis' | 'vermilion';
};

function seededValue(seed: number) {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

function buildTiles(count: number): Tile[] {
  const tiles: Tile[] = [];
  const order = Array.from({ length: 49 }, (_, index) => index).sort((a, b) => seededValue(a + 1) - seededValue(b + 1));
  const palette: Tile['fill'][] = ['gold', 'ember', 'lapis', 'gold', 'vermilion'];

  for (let i = 0; i < Math.min(count, order.length); i += 1) {
    const index = order[i];
    tiles.push({
      x: index % 7,
      y: Math.floor(index / 7),
      opacity: 0.58 + seededValue(index + 17) * 0.35,
      fill: palette[index % palette.length],
    });
  }

  return tiles;
}

export default function Mosaic({ history }: { history: WeekRecord[] }) {
  const keptWeeks = history.filter((record) => record.kept);
  const tiles = buildTiles(keptWeeks.length);

  return (
    <svg className="ceremony-mosaic" viewBox="0 0 154 154" role="img" aria-label="Your mosaic. One tile for each kept week.">
      <defs>
        <pattern id="ceremony-mosaic-grid" width="22" height="22" patternUnits="userSpaceOnUse">
          <path d="M 22 0 L 0 0 0 22" fill="none" className="ceremony-mosaic-gridline" />
        </pattern>
      </defs>
      <rect width="154" height="154" rx="0" className="ceremony-mosaic-field" />
      <rect width="154" height="154" rx="0" fill="url(#ceremony-mosaic-grid)" />
      {tiles.map((tile, index) => (
        <rect
          key={`${tile.x}-${tile.y}-${index}`}
          x={tile.x * 22 + 4}
          y={tile.y * 22 + 4}
          width="14"
          height="14"
          className={`ceremony-mosaic-tile ceremony-mosaic-${tile.fill}`}
          style={{ opacity: tile.opacity }}
        />
      ))}
    </svg>
  );
}
