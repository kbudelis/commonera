import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type FormEvent,
  type KeyboardEvent,
  type PointerEvent,
} from "react";
import { flushSync } from "react-dom";
import {
  BIRTH_PORTRAITS,
  createStoredBirthProfile,
  formatBirthdayInput,
  getBirthMonthEntry,
  getCurrentSeason,
  getUpcomingPanel,
  GROUNDING_COPY,
  loadBirthProfile,
  MONTH_ENTRIES,
  MONTH_ORDER,
  saveBirthProfile,
  type MonthKey,
  type StoredBirthProfileV1,
} from "./content.js";
import {
  createInitialFlow,
  formatBirthdayFieldValue,
  FlowAction,
  FlowLandmark,
  FlowState,
  transitionFlow,
  visibleLandmarksForFlow,
} from "./flow.js";

const blueZodiacUrl = `${import.meta.env?.BASE_URL ?? "/"}blue-zodiac.jpg`;
const zodiacTransitionDuration = 3_000;
const zodiacTransitionHold = 500;
const welcomeFadeOutDuration = 900;
const welcomeLineRevealDuration = 1_100;
const welcomeLineStagger = 1_350;

const constellationUrls: Record<MonthKey, string> = {
  nisan: new URL("./assets/constellations/aries.png", import.meta.url).href,
  iyar: new URL("./assets/constellations/taurus.png", import.meta.url).href,
  sivan: new URL("./assets/constellations/gemini.png", import.meta.url).href,
  tammuz: new URL("./assets/constellations/cancer.png", import.meta.url).href,
  av: new URL("./assets/constellations/leo.png", import.meta.url).href,
  elul: new URL("./assets/constellations/virgo.png", import.meta.url).href,
  tishrei: new URL("./assets/constellations/libra.png", import.meta.url).href,
  cheshvan: new URL("./assets/constellations/scorpio.png", import.meta.url).href,
  kislev: new URL("./assets/constellations/sagittarius.png", import.meta.url).href,
  tevet: new URL("./assets/constellations/capricorn.png", import.meta.url).href,
  shevat: new URL("./assets/constellations/aquarius.png", import.meta.url).href,
  adar: new URL("./assets/constellations/pisces.png", import.meta.url).href,
};

const lalouGlyphUrls: Record<MonthKey, string> = {
  tishrei: new URL("./assets/hebrew-letter-illustrations/lalou/02-transparent/01-tishrei-lamed.png", import.meta.url).href,
  cheshvan: new URL("./assets/hebrew-letter-illustrations/lalou/02-transparent/02-cheshvan-nun.png", import.meta.url).href,
  kislev: new URL("./assets/hebrew-letter-illustrations/lalou/02-transparent/03-kislev-samekh.png", import.meta.url).href,
  tevet: new URL("./assets/hebrew-letter-illustrations/lalou/02-transparent/04-tevet-ayin.png", import.meta.url).href,
  shevat: new URL("./assets/hebrew-letter-illustrations/lalou/02-transparent/05-shevat-tsade.png", import.meta.url).href,
  adar: new URL("./assets/hebrew-letter-illustrations/lalou/02-transparent/06-adar-qof.png", import.meta.url).href,
  nisan: new URL("./assets/hebrew-letter-illustrations/lalou/02-transparent/07-nisan-he.png", import.meta.url).href,
  iyar: new URL("./assets/hebrew-letter-illustrations/lalou/02-transparent/08-iyar-vav.png", import.meta.url).href,
  sivan: new URL("./assets/hebrew-letter-illustrations/lalou/02-transparent/09-sivan-zayin.png", import.meta.url).href,
  tammuz: new URL("./assets/hebrew-letter-illustrations/lalou/02-transparent/10-tammuz-het.png", import.meta.url).href,
  av: new URL("./assets/hebrew-letter-illustrations/lalou/02-transparent/11-av-tet.png", import.meta.url).href,
  elul: new URL("./assets/hebrew-letter-illustrations/lalou/02-transparent/12-elul-yod.png", import.meta.url).href,
};

const lalouLightGlyphUrls: Record<MonthKey, string> = {
  tishrei: new URL("./assets/hebrew-letter-illustrations/lalou/03-white-transparent/01-tishrei-lamed.png", import.meta.url).href,
  cheshvan: new URL("./assets/hebrew-letter-illustrations/lalou/03-white-transparent/02-cheshvan-nun.png", import.meta.url).href,
  kislev: new URL("./assets/hebrew-letter-illustrations/lalou/03-white-transparent/03-kislev-samekh.png", import.meta.url).href,
  tevet: new URL("./assets/hebrew-letter-illustrations/lalou/03-white-transparent/04-tevet-ayin.png", import.meta.url).href,
  shevat: new URL("./assets/hebrew-letter-illustrations/lalou/03-white-transparent/05-shevat-tsade.png", import.meta.url).href,
  adar: new URL("./assets/hebrew-letter-illustrations/lalou/03-white-transparent/06-adar-qof.png", import.meta.url).href,
  nisan: new URL("./assets/hebrew-letter-illustrations/lalou/03-white-transparent/07-nisan-he.png", import.meta.url).href,
  iyar: new URL("./assets/hebrew-letter-illustrations/lalou/03-white-transparent/08-iyar-vav.png", import.meta.url).href,
  sivan: new URL("./assets/hebrew-letter-illustrations/lalou/03-white-transparent/09-sivan-zayin.png", import.meta.url).href,
  tammuz: new URL("./assets/hebrew-letter-illustrations/lalou/03-white-transparent/10-tammuz-het.png", import.meta.url).href,
  av: new URL("./assets/hebrew-letter-illustrations/lalou/03-white-transparent/11-av-tet.png", import.meta.url).href,
  elul: new URL("./assets/hebrew-letter-illustrations/lalou/03-white-transparent/12-elul-yod.png", import.meta.url).href,
};

const welcomeLines = [
  ["Where were you", "when the universe began?"],
  ["Long before you were born,", "the heavens knew your name"],
] as const;

export function easeInOutCubic(progress: number): number {
  return progress < 0.5
    ? 4 * progress * progress * progress
    : 1 - Math.pow(-2 * progress + 2, 3) / 2;
}

export function wrapMonthIndex(index: number): number {
  return (index + MONTH_ORDER.length) % MONTH_ORDER.length;
}

export function getCircularMonthOffset(
  index: number,
  activeIndex: number,
): number {
  let offset = index - activeIndex;
  const halfway = MONTH_ORDER.length / 2;

  if (offset > halfway) {
    offset -= MONTH_ORDER.length;
  } else if (offset < -halfway) {
    offset += MONTH_ORDER.length;
  }

  return offset;
}

function ZodiacVisual({
  variant,
  onActivate,
  activationLabel,
}: {
  variant: "immersive" | "compact" | "arc";
  onActivate?: () => void;
  activationLabel?: string;
}) {
  if (onActivate) {
    return (
      <button
        type="button"
        className={`zodiac-visual zodiac-visual--${variant} zodiac-visual--interactive`}
        aria-label={activationLabel ?? "Edit birth details"}
        onClick={onActivate}
      >
        <img src={blueZodiacUrl} alt="" />
      </button>
    );
  }

  return (
    <div
      className={`zodiac-visual zodiac-visual--${variant}`}
      aria-hidden="true"
    >
      <img src={blueZodiacUrl} alt="" />
    </div>
  );
}

function HebrewGlyphArt({
  monthKey,
}: {
  monthKey: MonthKey;
}) {
  return (
    <div className="hero-glyph-art" aria-hidden="true">
      <img src={lalouGlyphUrls[monthKey]} alt="" />
    </div>
  );
}

function MonthGlyphTitle({ monthKey }: { monthKey: MonthKey }) {
  return (
    <div className="month-title-glyph" aria-hidden="true">
      <img src={lalouLightGlyphUrls[monthKey]} alt="" />
    </div>
  );
}

export function scrollToLandmarkUnlessReducedMotion(
  landmark: FlowLandmark,
  targetDocument: Document = document,
  targetWindow: Window = window,
): boolean {
  if (targetWindow.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return false;
  }

  const target = targetDocument.querySelector<HTMLElement>(
    `[data-landmark="${landmark}"]`,
  );
  if (!target) {
    return false;
  }

  const startY = targetWindow.scrollY;
  const targetY = target.getBoundingClientRect().top + startY;
  const distance = targetY - startY;
  const duration = 480;
  const startedAt = targetWindow.performance.now();

  const animate = (now: number) => {
    const progress = Math.min((now - startedAt) / duration, 1);
    targetWindow.scrollTo(0, startY + distance * easeInOutCubic(progress));
    if (progress < 1) {
      targetWindow.requestAnimationFrame(animate);
    }
  };

  targetWindow.requestAnimationFrame(animate);
  return true;
}

interface FlowSectionsProps {
  state: FlowState;
  nameValue: string;
  nameError: string | null;
  birthdayValue: string;
  welcomeLine: number;
  welcomeExiting: boolean;
  onAdvanceWelcome: () => void;
  onAdvance: () => void;
  onNameChange: (value: string) => void;
  onBirthdayChange: (value: string) => void;
  onBirthdaySubmit: (event: FormEvent<HTMLFormElement>) => void;
  onSkip: () => void;
  onEditBirthday: () => void;
}

export function FlowSections({
  state,
  nameValue,
  nameError,
  birthdayValue,
  welcomeLine,
  welcomeExiting,
  onAdvanceWelcome,
  onAdvance,
  onNameChange,
  onBirthdayChange,
  onBirthdaySubmit,
  onSkip,
  onEditBirthday,
}: FlowSectionsProps) {
  const landmarks = visibleLandmarksForFlow(state);
  const birthProfile = state.birthday
    ? createStoredBirthProfile(state.birthday, nameValue)
    : null;

  return (
    <main className={`flow-page flow-page--${state.step}`}>
      {landmarks.map((landmark) => {
        switch (landmark) {
          case "welcome":
            return (
              <WelcomeScreen
                key={landmark}
                line={welcomeLine}
                exiting={welcomeExiting}
                onAdvance={onAdvanceWelcome}
              />
            );
          case "zodiac-transition":
            return (
              <ZodiacTransition key={landmark} onAdvance={onAdvance} />
            );
          case "birthday":
            return (
              <BirthdayStep
                key={landmark}
                nameValue={nameValue}
                nameError={nameError}
                birthdayValue={birthdayValue}
                birthdayError={state.validationError}
                onNameChange={onNameChange}
                onBirthdayChange={onBirthdayChange}
                onSubmit={onBirthdaySubmit}
                onSkip={onSkip}
              />
            );
          case "personal":
            return (
              <PersonalPlaceholder
                key={landmark}
                profile={birthProfile}
                onEditBirthday={onEditBirthday}
              />
            );
          case "month":
            return <MonthPlaceholder key={landmark} />;
          case "upcoming":
            return <UpcomingPlaceholder key={landmark} />;
        }
      })}
    </main>
  );
}

function WelcomeScreen({
  line,
  exiting,
  onAdvance,
}: {
  line: number;
  exiting: boolean;
  onAdvance: () => void;
}) {
  const lines = welcomeLines[line] ?? welcomeLines[1];

  return (
    <section
      className="flow-section welcome-section"
      data-landmark="welcome"
      aria-labelledby="welcome-line"
    >
      <ZodiacVisual variant="immersive" />
      <div className="welcome-content">
        <p
          key={line}
          id="welcome-line"
          className={`welcome-line${exiting ? " welcome-line--exiting" : ""}`}
          aria-live="polite"
        >
          {lines.map((text, index) => (
            <span
              key={text}
              className="welcome-line-part"
              style={{ animationDelay: `${index * welcomeLineStagger}ms` }}
            >
              {text}
            </span>
          ))}
        </p>
        <button className="welcome-tap" onClick={onAdvance}>
          tap to continue
        </button>
      </div>
    </section>
  );
}

function ZodiacTransition({ onAdvance }: { onAdvance: () => void }) {
  useEffect(() => {
    const delay = window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ? 500
      : zodiacTransitionDuration + zodiacTransitionHold;
    const timeout = window.setTimeout(onAdvance, delay);

    return () => window.clearTimeout(timeout);
  }, [onAdvance]);

  return (
    <section
      className="flow-section transition-section"
      data-landmark="zodiac-transition"
      aria-labelledby="transition-title"
    >
      <h1 id="transition-title" className="visually-hidden">
        The zodiac moves into place
      </h1>
      <ZodiacVisual variant="compact" />
    </section>
  );
}

function BirthdayStep({
  nameValue,
  nameError,
  birthdayValue,
  birthdayError,
  onNameChange,
  onBirthdayChange,
  onSubmit,
  onSkip,
}: {
  nameValue: string;
  nameError: string | null;
  birthdayValue: string;
  birthdayError: string | null;
  onNameChange: (value: string) => void;
  onBirthdayChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onSkip: () => void;
}) {
  return (
    <section
      className="flow-section birthday-section"
      data-landmark="birthday"
      aria-labelledby="birthday-title"
    >
      <ZodiacVisual variant="compact" />
      <div className="section-copy birthday-copy">
        <h1 id="birthday-title" className="visually-hidden">
          Enter your name and birthday
        </h1>
        <form className="birthday-form" onSubmit={onSubmit} noValidate>
          <div className="birthday-fields">
            <div className="birthday-field">
              <label className="visually-hidden" htmlFor="display-name">
                Name
              </label>
              <input
                id="display-name"
                name="display-name"
                type="text"
                autoComplete="name"
                maxLength={40}
                placeholder="Name"
                value={nameValue}
                aria-describedby={nameError ? "name-error" : undefined}
                aria-invalid={Boolean(nameError)}
                onChange={(event) => onNameChange(event.target.value)}
              />
            </div>
            <div className="birthday-field">
              <label className="visually-hidden" htmlFor="birthday">
                Birthday
              </label>
              <input
                id="birthday"
                name="birthday"
                type="text"
                inputMode="numeric"
                autoComplete="bday"
                maxLength={10}
                placeholder="MM/DD/YYYY"
                value={birthdayValue}
                aria-describedby={birthdayError ? "birthday-error" : "birthday-hint"}
                aria-invalid={Boolean(birthdayError)}
                onChange={(event) => onBirthdayChange(event.target.value)}
              />
            </div>
          </div>
          <span id="birthday-hint" className="visually-hidden">
            Enter the date as month, day, and four-digit year.
          </span>
          {nameError ? (
            <span id="name-error" className="field-error" role="alert">
              {nameError}
            </span>
          ) : null}
          {birthdayError ? (
            <span id="birthday-error" className="field-error" role="alert">
              {birthdayError}
            </span>
          ) : null}
          <button className="primary-action" type="submit">
            Continue
          </button>
        </form>
        <button className="text-action" onClick={onSkip}>
          Skip to this month
        </button>
      </div>
    </section>
  );
}

function PersonalPlaceholder({
  profile,
  onEditBirthday,
}: {
  profile: StoredBirthProfileV1 | null;
  onEditBirthday: () => void;
}) {
  const month = profile ? getBirthMonthEntry(profile) : null;
  const displayName = profile?.input.displayName?.trim() || "Your Reading";
  const portrait = month ? BIRTH_PORTRAITS[month.correspondence.key] : null;

  return (
    <section
      className="flow-section reading-section personal-section"
      data-landmark="personal"
      aria-labelledby="personal-title"
    >
      <ZodiacVisual
        variant="arc"
        onActivate={onEditBirthday}
        activationLabel="Edit name and birthday"
      />
      <div className="section-copy reading-copy">
        {month ? (
          <HebrewGlyphArt monthKey={month.correspondence.key} />
        ) : (
          <p className="hero-glyph" aria-hidden="true">א</p>
        )}
        {profile && month && portrait ? (
          <>
            <h1 id="personal-title" className="personal-name">{displayName}</h1>
            <p className="profile-facts">
              <span>{month.correspondence.mazal.zodiacLabel}</span>
              <span aria-hidden="true">·</span>
              <span>{month.correspondence.names.english}</span>
            </p>
            <p className="personal-portrait">{portrait.narrative}</p>
            <dl className="personal-facets">
              <div>
                <dt>Light</dt>
                <dd>{portrait.light}</dd>
              </div>
              <div>
                <dt>Shadow wisdom</dt>
                <dd>{portrait.shadowWisdom}</dd>
              </div>
            </dl>
            <p className="return-question">
              {portrait.question}
            </p>
          </>
        ) : (
          <>
            <h1 id="personal-title" className="personal-name">{displayName}</h1>
            <p>Your Hebrew birth profile will appear here.</p>
          </>
        )}
      </div>
    </section>
  );
}

function getCurveItemStyle(
  index: number,
  activeIndex: number,
  dragOffset: number,
): CSSProperties {
  const dragProgress = dragOffset / 150;
  const curvePosition = getCircularMonthOffset(index, activeIndex) + dragProgress;
  const distance = Math.abs(curvePosition);
  const x = curvePosition * 38;
  const y = Math.pow(distance, 1.35) * 24;
  const z = distance * -130;
  const rotation = curvePosition * -24;
  const scale = Math.max(0.38, 1 - distance * 0.24);

  return {
    zIndex: Math.max(1, Math.round(20 - distance * 4)),
    opacity: distance >= 3.2 ? 0 : Math.max(0.12, 1 - distance * 0.3),
    pointerEvents: distance > 2.4 ? "none" : "auto",
    transform: `translate3d(calc(-50% + ${x}cqw), ${y}px, ${z}px) rotateY(${rotation}deg) scale(${scale})`,
  };
}

function MonthCurveGallery({
  activeIndex,
  currentMonthKey,
  onSelect,
}: {
  activeIndex: number;
  currentMonthKey: MonthKey;
  onSelect: (index: number) => void;
}) {
  const currentMonthIndex = Math.max(0, MONTH_ORDER.indexOf(currentMonthKey));
  const dragStartRef = useRef<{
    x: number;
    y: number;
    pointerId: number;
  } | null>(null);
  const dragOffsetRef = useRef(0);
  const suppressClickRef = useRef(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const updateDragOffset = (value: number) => {
    dragOffsetRef.current = value;
    setDragOffset(value);
  };

  const selectRelativeMonth = (direction: -1 | 1) => {
    onSelect(wrapMonthIndex(activeIndex + direction));
  };

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "mouse" && event.button !== 0) {
      return;
    }

    dragStartRef.current = {
      x: event.clientX,
      y: event.clientY,
      pointerId: event.pointerId,
    };
    suppressClickRef.current = false;
    setIsDragging(true);
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const dragStart = dragStartRef.current;
    if (!dragStart || dragStart.pointerId !== event.pointerId) {
      return;
    }

    const deltaX = event.clientX - dragStart.x;
    const deltaY = event.clientY - dragStart.y;
    if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > 8) {
      return;
    }

    if (
      Math.abs(deltaX) > 8 &&
      !event.currentTarget.hasPointerCapture(event.pointerId)
    ) {
      event.currentTarget.setPointerCapture(event.pointerId);
    }

    updateDragOffset(Math.max(-170, Math.min(170, deltaX)));
  };

  const finishPointer = (
    event: PointerEvent<HTMLDivElement>,
    cancelled = false,
  ) => {
    const dragStart = dragStartRef.current;
    if (!dragStart || dragStart.pointerId !== event.pointerId) {
      return;
    }

    const finalOffset = dragOffsetRef.current;
    suppressClickRef.current = Math.abs(finalOffset) > 8;
    if (!cancelled && Math.abs(finalOffset) >= 42) {
      selectRelativeMonth(finalOffset < 0 ? 1 : -1);
    }

    dragStartRef.current = null;
    updateDragOffset(0);
    setIsDragging(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      selectRelativeMonth(-1);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      selectRelativeMonth(1);
    } else if (event.key === "Home") {
      event.preventDefault();
      onSelect(0);
    } else if (event.key === "End") {
      event.preventDefault();
      onSelect(MONTH_ORDER.length - 1);
    }
  };

  return (
    <div
      className={`month-curve-gallery${isDragging ? " month-curve-gallery--dragging" : ""}`}
      role="listbox"
      aria-label="Twelve month readings"
      aria-orientation="horizontal"
      onKeyDown={handleKeyDown}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={(event) => finishPointer(event)}
      onPointerCancel={(event) => finishPointer(event, true)}
    >
      {MONTH_ORDER.map((monthKey, index) => {
        const month = MONTH_ENTRIES[monthKey];
        const isActive = index === activeIndex;
        const isCurrentMonth = monthKey === currentMonthKey;

        return (
          <button
            key={monthKey}
            type="button"
            role="option"
            aria-selected={isActive}
            aria-label={`${month.correspondence.names.english}, ${month.correspondence.mazal.zodiacLabel}${isCurrentMonth ? ", current month" : ""}`}
            tabIndex={isActive ? 0 : -1}
            data-month-key={monthKey}
            className={`month-curve-item${isActive ? " month-curve-item--active" : ""}`}
            style={getCurveItemStyle(index, activeIndex, dragOffset)}
            onClick={() => {
              if (suppressClickRef.current) {
                suppressClickRef.current = false;
                return;
              }
              onSelect(index);
            }}
          >
            <span className="constellation-art constellation-art--month" aria-hidden="true">
              <img src={constellationUrls[monthKey]} alt="" />
            </span>
          </button>
        );
      })}
      {activeIndex === currentMonthIndex ? (
        <span className="month-curve-hint" aria-hidden="true">
          swipe to explore
        </span>
      ) : (
        <button
          type="button"
          className="month-curve-return"
          onClick={() => onSelect(currentMonthIndex)}
        >
          Return to current month
        </button>
      )}
    </div>
  );
}

function MonthPlaceholder() {
  const season = getCurrentSeason();
  const currentMonthKey = season.entry.correspondence.key;
  const currentMonthIndex = Math.max(0, MONTH_ORDER.indexOf(currentMonthKey));
  const [activeIndex, setActiveIndex] = useState(currentMonthIndex);
  const activeMonthKey = MONTH_ORDER[activeIndex] ?? currentMonthKey;
  const { correspondence, reading } = MONTH_ENTRIES[activeMonthKey];
  const isCurrentMonth = activeMonthKey === currentMonthKey;

  return (
    <section
      className="flow-section reading-section month-section"
      data-landmark="month"
      data-selected-month={activeMonthKey}
      aria-labelledby="month-title"
    >
      <div className="month-zodiac-backdrop" aria-hidden="true">
        <img src={blueZodiacUrl} alt="" />
      </div>
      <MonthCurveGallery
        activeIndex={activeIndex}
        currentMonthKey={currentMonthKey}
        onSelect={setActiveIndex}
      />
      <div
        className="section-copy reading-copy month-copy"
        aria-live="polite"
        aria-atomic="true"
      >
        <p className="eyebrow">
          {isCurrentMonth ? "This month · " : ""}
          {correspondence.mazal.zodiacLabel}
        </p>
        <h1 id="month-title" className="visually-hidden">
          {correspondence.names.english}
        </h1>
        <MonthGlyphTitle monthKey={activeMonthKey} />
        <p className="month-archetype">{reading.archetype}</p>
        <p>{reading.reading}</p>
        <aside className="ritual-card">
          <span>Small ritual</span>
          <p>{reading.ritual}</p>
        </aside>
        <details className="grounding-note">
          <summary>Where this comes from</summary>
          <p>{GROUNDING_COPY}</p>
        </details>
      </div>
    </section>
  );
}

function UpcomingPlaceholder() {
  const panel = getUpcomingPanel();
  const moonMoment = panel.moonMoment;

  return (
    <section
      className="flow-section reading-section upcoming-section"
      data-landmark="upcoming"
      aria-labelledby="upcoming-title"
    >
      <div className="section-copy reading-copy upcoming-copy">
        <p className="eyebrow">Coming into view</p>
        <h1 id="upcoming-title">Friday & Moon</h1>
        <p className="upcoming-context">{panel.contextLine}</p>

        <div className="upcoming-panels">
          <article className="upcoming-card friday-card">
            <span className="upcoming-card-label">Friday pulse</span>
            <h2>{panel.friday.title}</h2>
            <p className="upcoming-meta">
              {panel.friday.dateLabel} · {panel.friday.hebrewLabel}
            </p>
            <p>{panel.friday.body}</p>
            <dl className="friday-carry">
              <div>
                <dt>Release</dt>
                <dd>{panel.friday.release}</dd>
              </div>
              <div>
                <dt>Carry</dt>
                <dd>{panel.friday.carry}</dd>
              </div>
            </dl>
          </article>

          <article className="upcoming-card moon-card">
            <div
              className={`moon-state moon-state--${panel.current.moon.phaseKey}`}
              role="img"
              aria-label={`Symbolic ${panel.current.moon.label.toLowerCase()}`}
            />
            <div className="moon-card-copy">
              <span className="upcoming-card-label">Moon moment</span>
              <h2>{panel.current.moon.label}</h2>
              {moonMoment ? (
                <>
                  <p className="upcoming-meta">
                    {moonMoment.title} · {moonMoment.windowLabel} · {moonMoment.hebrewLabel}
                  </p>
                  <p>{moonMoment.body}</p>
                </>
              ) : (
                <>
                  <p className="upcoming-meta">No moon turning point this week</p>
                  <p>The cycle is already in motion. Return for the next threshold.</p>
                </>
              )}
            </div>
          </article>
        </div>

        <p className="upcoming-prompt">{panel.prompt}</p>
        <p className="upcoming-basis">
          Symbolic Hebrew-calendar rhythm · not an astronomical phase
        </p>
      </div>
    </section>
  );
}

export default function App() {
  const [flow, setFlow] = useState<FlowState>(createInitialFlow);
  const [welcomeLine, setWelcomeLine] = useState(0);
  const [isWelcomeExiting, setIsWelcomeExiting] = useState(false);
  const welcomePageTimer = useRef<number | null>(null);
  const welcomeUnlockTimer = useRef<number | null>(null);
  const [nameValue, setNameValue] = useState("");
  const [nameError, setNameError] = useState<string | null>(null);
  const [birthdayValue, setBirthdayValue] = useState("");
  const [pendingLandmark, setPendingLandmark] =
    useState<FlowLandmark | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedProfile = loadBirthProfile(window.localStorage);
      if (storedProfile) {
        setNameValue(storedProfile.input.displayName ?? "");
        setBirthdayValue(
          formatBirthdayInput(storedProfile.input.civilDateISO),
        );
      }
    }
  }, []);

  useEffect(() => {
    if (!pendingLandmark) {
      return;
    }
    scrollToLandmarkUnlessReducedMotion(pendingLandmark);
    setPendingLandmark(null);
  }, [flow.step, pendingLandmark]);

  useEffect(
    () => () => {
      if (welcomePageTimer.current !== null) {
        window.clearTimeout(welcomePageTimer.current);
      }
      if (welcomeUnlockTimer.current !== null) {
        window.clearTimeout(welcomeUnlockTimer.current);
      }
    },
    [],
  );

  const applyAction = (action: FlowAction, destination?: FlowLandmark) => {
    setFlow((current) => transitionFlow(current, action));
    if (destination) {
      setPendingLandmark(destination);
    }
  };

  const advanceWelcome = () => {
    if (isWelcomeExiting) {
      return;
    }

    if (welcomeUnlockTimer.current !== null) {
      window.clearTimeout(welcomeUnlockTimer.current);
      welcomeUnlockTimer.current = null;
    }

    if (welcomeLine < welcomeLines.length - 1) {
      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      if (prefersReducedMotion) {
        setWelcomeLine((current) => current + 1);
        return;
      }

      const nextPage = welcomeLine + 1;
      const nextPageLines = welcomeLines[nextPage] ?? welcomeLines[1];
      const revealDuration =
        welcomeLineRevealDuration +
        (nextPageLines.length - 1) * welcomeLineStagger;

      setIsWelcomeExiting(true);
      welcomePageTimer.current = window.setTimeout(() => {
        welcomePageTimer.current = null;
        setWelcomeLine(nextPage);
        setIsWelcomeExiting(false);
        welcomeUnlockTimer.current = window.setTimeout(() => {
          welcomeUnlockTimer.current = null;
        }, revealDuration);
      }, welcomeFadeOutDuration);
      return;
    }

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (prefersReducedMotion) {
      applyAction({ type: "advance" });
      return;
    }

    setIsWelcomeExiting(true);
    welcomePageTimer.current = window.setTimeout(() => {
      welcomePageTimer.current = null;
      applyAction({ type: "advance" });
      setIsWelcomeExiting(false);
    }, welcomeFadeOutDuration);
  };

  const advanceFromZodiac = () => {
    const showBirthday = () => {
      flushSync(() => {
        setFlow((current) => transitionFlow(current, { type: "advance" }));
      });
    };
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (typeof document.startViewTransition === "function" && !prefersReducedMotion) {
      document.startViewTransition(showBirthday);
      return;
    }

    showBirthday();
  };

  const submitBirthday = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalizedName = nameValue.trim();
    const next = transitionFlow(flow, {
      type: "submit-birthday",
      value: birthdayValue,
    });
    if (!normalizedName) {
      setNameError("Enter your name.");
      if (next.step !== "personal") {
        setFlow(next);
      }
      return;
    }
    setNameError(null);
    if (next.step !== "personal") {
      setFlow(next);
      return;
    }

    const profile = createStoredBirthProfile(birthdayValue, normalizedName);
    if (profile && typeof window !== "undefined") {
      saveBirthProfile(profile, window.localStorage);
    }

    const showPersonalReading = () => {
      flushSync(() => setFlow(next));
    };
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (typeof document.startViewTransition === "function" && !prefersReducedMotion) {
      document.startViewTransition(showPersonalReading);
      return;
    }

    showPersonalReading();
  };

  const editBirthday = () => {
    const showBirthday = () => {
      flushSync(() => {
        setNameError(null);
        setFlow((current) => transitionFlow(current, { type: "edit-birthday" }));
      });
    };
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (typeof document.startViewTransition === "function" && !prefersReducedMotion) {
      document.startViewTransition(showBirthday);
      return;
    }

    showBirthday();
  };

  return (
    <FlowSections
      state={flow}
      nameValue={nameValue}
      nameError={nameError}
      birthdayValue={birthdayValue}
      welcomeLine={welcomeLine}
      welcomeExiting={isWelcomeExiting}
      onAdvanceWelcome={advanceWelcome}
      onAdvance={advanceFromZodiac}
      onNameChange={(value) => {
        setNameValue(value);
        setNameError(null);
      }}
      onBirthdayChange={(value) => {
        setBirthdayValue((current) => formatBirthdayFieldValue(value, current));
      }}
      onBirthdaySubmit={submitBirthday}
      onSkip={() => applyAction({ type: "skip-to-month" })}
      onEditBirthday={editBirthday}
    />
  );
}
