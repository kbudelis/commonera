import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { ZODIAC_SECTORS } from "./zodiacWheel.data";
import {
  CENTER,
  type Direction,
  planSettledAngle,
  polar,
  sectorAngle,
  WHEEL_SIZE,
  wrapIndex
} from "./zodiacWheel.geometry";
import styles from "./ZodiacWheel.module.css";

type LayerId = "atlas" | "labels" | "symbols" | "figures" | "ticks";
type LayerAngles = Record<LayerId, number>;
export type ZodiacWheelProps = {
  initialIndex?: number;
  autoSpinOnMount?: boolean;
  className?: string;
};

type LayerConfig = {
  id: LayerId;
  duration: number;
  turns: number;
  direction: Direction;
};

const LAYERS: readonly LayerConfig[] = [
  { id: "atlas", duration: 2600, turns: 3, direction: -1 },
  { id: "labels", duration: 3200, turns: 2, direction: 1 },
  { id: "symbols", duration: 3800, turns: 2, direction: -1 },
  { id: "figures", duration: 4400, turns: 1, direction: 1 },
  { id: "ticks", duration: 5200, turns: 2, direction: -1 }
];

const INITIAL_ANGLES: LayerAngles = {
  atlas: 0,
  labels: 0,
  symbols: 0,
  figures: 0,
  ticks: 0
};

function settledAngles(index: number): LayerAngles {
  const angle = 180 - sectorAngle(index);
  return { atlas: angle, labels: angle, symbols: angle, figures: angle, ticks: angle };
}

const astronomyPlate = new URL(
  "../../assets/Astronomy_without_a_telescope-_(1869)_(14769193535).jpg",
  import.meta.url
).href;

const asTextGlyph = (glyph: string) => `${glyph}\uFE0E`;

function useReducedMotion() {
  const [reduced, setReduced] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  return reduced;
}

function MeridianTicks() {
  return (
    <g className={styles.meridianTicks}>
      {Array.from({ length: 72 }, (_, index) => {
        const angle = index * 5;
        const major = index % 6 === 0;
        const start = polar(major ? 299 : 307, angle);
        const end = polar(320, angle);
        return (
          <line
            key={angle}
            className={major ? styles.majorTick : styles.tick}
            x1={start.x}
            y1={start.y}
            x2={end.x}
            y2={end.y}
          />
        );
      })}
    </g>
  );
}

function DegreeScale() {
  return (
    <g className={styles.degreeScale} aria-hidden="true">
      {Array.from({ length: 12 }, (_, index) => {
        const angle = index * 30 + 180;
        const point = polar(292, angle);
        return (
          <text key={index} x={point.x} y={point.y + 3} textAnchor="middle">
            {index * 30}°
          </text>
        );
      })}
    </g>
  );
}

function OuterTicks() {
  const tickPath = (angles: number[], startRadius: number) =>
    angles
      .map((angle) => {
        const start = polar(startRadius, angle);
        const end = polar(340, angle);
        return `M ${start.x} ${start.y} L ${end.x} ${end.y}`;
      })
      .join(" ");

  const allAngles = Array.from({ length: 360 }, (_, angle) => angle);
  const majorAngles = allAngles.filter((angle) => angle % 10 === 0);
  const mediumAngles = allAngles.filter((angle) => angle % 5 === 0 && angle % 10 !== 0);
  const minorAngles = allAngles.filter((angle) => angle % 5 !== 0);

  return (
    <g className={styles.outerTicks} aria-hidden="true">
      <path className={styles.outerMinorTicks} d={tickPath(minorAngles, 329)} />
      <path className={styles.outerMediumTicks} d={tickPath(mediumAngles, 323)} />
      <path className={styles.outerMajorTicks} d={tickPath(majorAngles, 316)} />
    </g>
  );
}

function HebrewCrownGlyph({ letter }: { letter: string }) {
  return (
    <text className={styles.outerHebrewGlyph} x="0" y="9" textAnchor="middle" aria-hidden="true">
      {letter}
    </text>
  );
}

export default function ZodiacWheel({
  initialIndex = 3,
  autoSpinOnMount = true,
  className
}: ZodiacWheelProps) {
  const instanceId = useId().replace(/:/g, "");
  const clipId = `atlas-clip-${instanceId}`;
  const initialSelection = useRef(wrapIndex(initialIndex)).current;
  const reducedMotion = useReducedMotion();
  const [selectedIndex, setSelectedIndex] = useState(() =>
    autoSpinOnMount ? 0 : initialSelection
  );
  const [angles, setAngles] = useState<LayerAngles>(() =>
    autoSpinOnMount ? INITIAL_ANGLES : settledAngles(initialSelection)
  );
  const [isSpinning, setIsSpinning] = useState(false);
  const timers = useRef<number[]>([]);
  const autoStarted = useRef(false);

  const selected = ZODIAC_SECTORS[selectedIndex];

  const clearTimers = useCallback(() => {
    timers.current.forEach((timer) => window.clearTimeout(timer));
    timers.current = [];
  }, []);

  useEffect(() => clearTimers, [clearTimers]);

  const reveal = useCallback(
    (requestedIndex: number) => {
      if (isSpinning) return;

      const targetIndex = wrapIndex(requestedIndex);
      clearTimers();

      if (reducedMotion) {
        const settledAngle = -sectorAngle(targetIndex);
        setAngles({
          atlas: settledAngle,
          labels: settledAngle,
          symbols: settledAngle,
          figures: settledAngle,
          ticks: settledAngle
        });
        setSelectedIndex(targetIndex);
        return;
      }

      setIsSpinning(true);
      setAngles((current) =>
        LAYERS.reduce<LayerAngles>(
          (next, layer) => ({
            ...next,
            [layer.id]: planSettledAngle(
              current[layer.id],
              targetIndex,
              layer.turns,
              layer.direction
            )
          }),
          { ...current }
        )
      );

      LAYERS.forEach((layer) => {
        const timer = window.setTimeout(() => {
          if (layer.id === "ticks") {
            setSelectedIndex(targetIndex);
            setIsSpinning(false);
          }
        }, layer.duration);
        timers.current.push(timer);
      });
    },
    [clearTimers, isSpinning, reducedMotion]
  );

  useEffect(() => {
    if (!autoSpinOnMount) return;
    if (autoStarted.current) return;
    const timer = window.setTimeout(() => {
      autoStarted.current = true;
      reveal(initialSelection);
    }, 520);
    return () => window.clearTimeout(timer);
  }, [autoSpinOnMount, initialSelection, reveal]);

  const layerById = useMemo(
    () => Object.fromEntries(LAYERS.map((layer) => [layer.id, layer])) as Record<LayerId, LayerConfig>,
    []
  );

  const layerStyle = (id: LayerId) => ({
    transform: `rotate(${angles[id]}deg)`,
    transitionDuration: reducedMotion ? "0ms" : `${layerById[id].duration}ms`
  });

  const uprightStyle = (id: LayerId) => ({
    transform: `rotate(${-angles[id]}deg)`,
    transitionDuration: reducedMotion ? "0ms" : `${layerById[id].duration}ms`
  });

  return (
    <section
      className={[styles.instrument, className].filter(Boolean).join(" ")}
      aria-label="Interactive Hebrew zodiac wheel"
    >
      <button
        className={styles.wheelFrame}
        type="button"
        onClick={() => reveal(selectedIndex + 1)}
        disabled={isSpinning}
        aria-label={isSpinning ? "Zodiac wheel is turning" : "Turn zodiac wheel"}
      >
        <svg
          className={styles.wheel}
          viewBox={`0 0 ${WHEEL_SIZE} ${WHEEL_SIZE}`}
          aria-hidden="true"
        >
          <defs>
            <clipPath id={clipId}>
              <circle cx={CENTER} cy={CENTER} r="316" />
            </clipPath>
          </defs>

          <circle className={styles.outerPlate} cx={CENTER} cy={CENTER} r="356" />

          <g className={styles.rotorGroup} style={layerStyle("atlas")}>
            <circle className={styles.atlasBase} cx={CENTER} cy={CENTER} r="318" />
            <image
              className={styles.atlasImage}
              href={astronomyPlate}
              x="0"
              y="0"
              width="720"
              height="720"
              preserveAspectRatio="xMidYMid slice"
              clipPath={`url(#${clipId})`}
            />
            <circle className={styles.atlasEdge} cx={CENTER} cy={CENTER} r="316" />
            <circle className={styles.atlasOrbit} cx={CENTER} cy={CENTER} r="240" />
            <circle className={styles.atlasOrbit} cx={CENTER} cy={CENTER} r="170" />
            <MeridianTicks />
          </g>

          <g className={styles.rotorGroup} style={layerStyle("ticks")}>
            <OuterTicks />
          </g>
          <DegreeScale />

          <g className={styles.rotorGroup} style={layerStyle("labels")}>
            <circle className={styles.labelOrbit} cx={CENTER} cy={CENTER} r="286" />
            <circle className={styles.labelOrbitInner} cx={CENTER} cy={CENTER} r="250" />
            {ZODIAC_SECTORS.map((sector, index) => {
              const angle = sectorAngle(index);
              const point = polar(268, angle);
              const dividerStart = polar(247, angle - 15);
              const dividerEnd = polar(293, angle - 15);
              return (
                <g key={sector.id}>
                  <line
                    className={styles.sectorDivider}
                    x1={dividerStart.x}
                    y1={dividerStart.y}
                    x2={dividerEnd.x}
                    y2={dividerEnd.y}
                  />
                  <g transform={`translate(${point.x} ${point.y})`}>
                    <g className={styles.uprightNode} style={uprightStyle("labels")} />
                  </g>
                </g>
              );
            })}
          </g>

          <g className={styles.rotorGroup} style={layerStyle("symbols")}>
            <circle className={styles.symbolOrbit} cx={CENTER} cy={CENTER} r="207" />
            {ZODIAC_SECTORS.map((sector, index) => {
              const angle = sectorAngle(index);
              const point = polar(198, angle);
              return (
                <g key={sector.id} transform={`translate(${point.x} ${point.y})`}>
                  <g className={styles.uprightNode} style={uprightStyle("symbols")}>
                    <circle className={styles.symbolMedallion} r="18" />
                    <text className={styles.symbolGlyph} x="0" y="7" textAnchor="middle">
                      {asTextGlyph(sector.glyph)}
                    </text>
                  </g>
                </g>
              );
            })}
          </g>

          <g className={styles.rotorGroup} style={layerStyle("figures")}>
            {ZODIAC_SECTORS.map((sector, index) => {
              const angle = sectorAngle(index);
              const point = polar(350, angle);
              return (
                <g key={sector.id} transform={`translate(${point.x} ${point.y})`}>
                  <g className={styles.uprightNode} style={uprightStyle("figures")}>
                    <HebrewCrownGlyph letter={sector.letter} />
                  </g>
                </g>
              );
            })}
          </g>

        </svg>

      </button>

      <p className={styles.liveRegion} aria-live="polite">
        {isSpinning
          ? "The zodiac wheel is aligning."
          : `${selected.month}, ${selected.sign}, Hebrew letter ${selected.letterName}, faculty ${selected.faculty}.`}
      </p>

    </section>
  );
}
