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

type LayerId = "atlas" | "labels" | "symbols" | "figures";
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
  lockRadius: number;
};

const LAYERS: readonly LayerConfig[] = [
  { id: "atlas", duration: 2600, turns: 3, direction: -1, lockRadius: 236 },
  { id: "labels", duration: 3200, turns: 2, direction: 1, lockRadius: 271 },
  { id: "symbols", duration: 3800, turns: 2, direction: -1, lockRadius: 198 },
  { id: "figures", duration: 4400, turns: 1, direction: 1, lockRadius: 318 }
];

const INITIAL_ANGLES: LayerAngles = {
  atlas: 0,
  labels: 0,
  symbols: 0,
  figures: 0
};

function settledAngles(index: number): LayerAngles {
  const angle = -sectorAngle(index);
  return { atlas: angle, labels: angle, symbols: angle, figures: angle };
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
        const start = polar(major ? 221 : 229, angle);
        const end = polar(242, angle);
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

function ZodiacFigure({ index, glyph }: { index: number; glyph: string }) {
  const shoulder = 13 + (index % 3) * 2;
  const lean = (index % 3) - 1;

  return (
    <g className={styles.figureDrawing} aria-hidden="true">
      <circle className={styles.figureHalo} r="31" />
      <circle className={styles.figureHead} cx={lean * 2} cy="-9" r="5.5" />
      <path
        className={styles.figureLine}
        d={`M ${lean * 2} -3 L ${lean * 2} 10 M ${-shoulder} 16 Q ${lean * 2} 3 ${shoulder} 16 M -8 7 L -15 ${index % 2 ? 2 : 12} M 8 7 L 15 ${index % 2 ? 12 : 2}`}
      />
      <text className={styles.figureGlyph} x="0" y="26" textAnchor="middle">
        {asTextGlyph(glyph)}
      </text>
    </g>
  );
}

export default function ZodiacWheel({
  initialIndex = 3,
  autoSpinOnMount = true,
  className
}: ZodiacWheelProps) {
  const instanceId = useId().replace(/:/g, "");
  const clipId = `atlas-clip-${instanceId}`;
  const headingId = `zodiac-wheel-title-${instanceId}`;
  const initialSelection = useRef(wrapIndex(initialIndex)).current;
  const reducedMotion = useReducedMotion();
  const [selectedIndex, setSelectedIndex] = useState(() =>
    autoSpinOnMount ? 0 : initialSelection
  );
  const [pendingIndex, setPendingIndex] = useState<number | null>(null);
  const [angles, setAngles] = useState<LayerAngles>(() =>
    autoSpinOnMount ? INITIAL_ANGLES : settledAngles(initialSelection)
  );
  const [lockedLayers, setLockedLayers] = useState<LayerId[]>(() =>
    autoSpinOnMount ? [] : LAYERS.map((layer) => layer.id)
  );
  const [lastLocked, setLastLocked] = useState<LayerId | null>(null);
  const [sequence, setSequence] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const timers = useRef<number[]>([]);
  const autoStarted = useRef(false);

  const selected = ZODIAC_SECTORS[selectedIndex];
  const pending = pendingIndex === null ? null : ZODIAC_SECTORS[pendingIndex];

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
      setPendingIndex(targetIndex);
      setLockedLayers([]);
      setLastLocked(null);
      setSequence((value) => value + 1);

      if (reducedMotion) {
        const settledAngle = -sectorAngle(targetIndex);
        setAngles({
          atlas: settledAngle,
          labels: settledAngle,
          symbols: settledAngle,
          figures: settledAngle
        });
        setSelectedIndex(targetIndex);
        setPendingIndex(null);
        setLockedLayers(LAYERS.map((layer) => layer.id));
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
          setLockedLayers((current) => [...current, layer.id]);
          setLastLocked(layer.id);

          if (layer.id === "figures") {
            setSelectedIndex(targetIndex);
            setPendingIndex(null);
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

  const lockRadius = lastLocked ? layerById[lastLocked].lockRadius : 0;
  const lockPoint = polar(lockRadius, 0);

  return (
    <section
      className={[styles.instrument, className].filter(Boolean).join(" ")}
      aria-labelledby={headingId}
    >
      <div className={styles.instrumentHeader}>
        <div>
          <p className={styles.eyebrow}>Twelve signs · one calendar</p>
          <h2 id={headingId}>The celestial index</h2>
        </div>
        <p className={styles.counter} aria-hidden="true">
          {String(selectedIndex + 1).padStart(2, "0")} / 12
        </p>
      </div>

      <div className={styles.wheelFrame}>
        <svg
          className={styles.wheel}
          viewBox={`0 0 ${WHEEL_SIZE} ${WHEEL_SIZE}`}
          aria-hidden="true"
        >
          <defs>
            <clipPath id={clipId}>
              <circle cx={CENTER} cy={CENTER} r="236" />
            </clipPath>
          </defs>

          <circle className={styles.outerPlate} cx={CENTER} cy={CENTER} r="348" />
          <circle className={styles.outerPlateInset} cx={CENTER} cy={CENTER} r="336" />

          <g className={styles.rotorGroup} style={layerStyle("atlas")}>
            <circle className={styles.atlasBase} cx={CENTER} cy={CENTER} r="246" />
            <image
              className={styles.atlasImage}
              href={astronomyPlate}
              x="116"
              y="116"
              width="488"
              height="488"
              preserveAspectRatio="xMidYMid slice"
              clipPath={`url(#${clipId})`}
            />
            <circle className={styles.atlasEdge} cx={CENTER} cy={CENTER} r="236" />
            <circle className={styles.atlasOrbit} cx={CENTER} cy={CENTER} r="172" />
            <circle className={styles.atlasOrbit} cx={CENTER} cy={CENTER} r="111" />
            <MeridianTicks />
          </g>

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
                    <g className={styles.uprightNode} style={uprightStyle("labels")}>
                      <text className={styles.monthLabel} x="0" y="-4" textAnchor="middle">
                        {sector.month}
                      </text>
                      <text className={styles.signLabel} x="0" y="10" textAnchor="middle">
                        {sector.sign}
                      </text>
                    </g>
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
                    <circle className={styles.symbolMedallion} r="24" />
                    <text className={styles.letterGlyph} x="0" y="5" textAnchor="middle">
                      {sector.letter}
                    </text>
                    <text className={styles.facultyLabel} x="0" y="39" textAnchor="middle">
                      {sector.faculty}
                    </text>
                  </g>
                </g>
              );
            })}
          </g>

          <g className={styles.rotorGroup} style={layerStyle("figures")}>
            <circle className={styles.figureOrbit} cx={CENTER} cy={CENTER} r="318" />
            {ZODIAC_SECTORS.map((sector, index) => {
              const angle = sectorAngle(index);
              const point = polar(318, angle);
              return (
                <g key={sector.id} transform={`translate(${point.x} ${point.y})`}>
                  <g className={styles.uprightNode} style={uprightStyle("figures")}>
                    <ZodiacFigure index={index} glyph={sector.glyph} />
                  </g>
                </g>
              );
            })}
          </g>

          <g className={styles.centerHub}>
            <circle cx={CENTER} cy={CENTER} r="82" />
            <circle className={styles.centerHubInset} cx={CENTER} cy={CENTER} r="70" />
            <text className={styles.centerGlyph} x={CENTER} y={CENTER - 9} textAnchor="middle">
              {selected.letter}
            </text>
            <text className={styles.centerMonth} x={CENTER} y={CENTER + 21} textAnchor="middle">
              {selected.month}
            </text>
            <text className={styles.centerHebrew} x={CENTER} y={CENTER + 42} textAnchor="middle">
              {selected.hebrewMonth}
            </text>
          </g>

          <g className={styles.northIndex}>
            <path d={`M ${CENTER - 13} 16 L ${CENTER} 45 L ${CENTER + 13} 16`} />
            <line x1={CENTER} y1="42" x2={CENTER} y2="79" />
          </g>

          {lastLocked && (
            <circle
              key={`${lastLocked}-${sequence}`}
              className={styles.lockPulse}
              cx={lockPoint.x}
              cy={lockPoint.y}
              r="17"
            />
          )}
        </svg>

        <div className={styles.statusPill} aria-hidden="true">
          {isSpinning && pending ? `Aligning ${pending.month}` : `${selected.signTransliteration} · ${selected.sign}`}
        </div>
      </div>

      <div className={styles.readout}>
        <div>
          <p className={styles.readoutLabel}>Current alignment</p>
          <p className={styles.readoutValue}>
            <span>{selected.month}</span>
            <bdi lang="he" dir="rtl">{selected.hebrewMonth}</bdi>
            <span>{asTextGlyph(selected.glyph)} {selected.sign}</span>
          </p>
        </div>
        <dl className={styles.metadata}>
          <div><dt>Letter</dt><dd>{selected.letterName}</dd></div>
          <div><dt>Faculty</dt><dd>{selected.faculty}</dd></div>
          <div><dt>Tribe</dt><dd>{selected.tribe}</dd></div>
        </dl>
      </div>

      <div className={styles.controls}>
        <button type="button" onClick={() => reveal(selectedIndex - 1)} disabled={isSpinning}>
          <span aria-hidden="true">←</span> Previous
        </button>
        <button
          className={styles.primaryControl}
          type="button"
          onClick={() => reveal(selectedIndex + 1)}
          disabled={isSpinning}
        >
          {isSpinning ? "Calibrating…" : "Turn the wheel"}
        </button>
        <button type="button" onClick={() => reveal(selectedIndex + 1)} disabled={isSpinning}>
          Next <span aria-hidden="true">→</span>
        </button>
      </div>

      <p className={styles.liveRegion} aria-live="polite">
        {isSpinning
          ? "The zodiac wheel is aligning."
          : `${selected.month}, ${selected.sign}, Hebrew letter ${selected.letterName}, faculty ${selected.faculty}.`}
      </p>

      <p className={styles.layerLegend} aria-hidden="true">
        {LAYERS.map((layer) => (
          <span key={layer.id} className={lockedLayers.includes(layer.id) ? styles.isLocked : ""}>
            {layer.id}
          </span>
        ))}
      </p>
    </section>
  );
}
