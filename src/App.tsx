import { FormEvent, useEffect, useState } from "react";
import {
  createInitialFlow,
  FlowAction,
  FlowLandmark,
  FlowState,
  transitionFlow,
  visibleLandmarksForFlow,
} from "./flow.js";

const welcomeLines = [
  "Welcome.",
  "Look up for a moment.",
  "Every month carries a different shape.",
  "Let’s find the one you’re moving through.",
] as const;

export function easeInOutCubic(progress: number): number {
  return progress < 0.5
    ? 4 * progress * progress * progress
    : 1 - Math.pow(-2 * progress + 2, 3) / 2;
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
  birthdayValue: string;
  welcomeLine: number;
  onAdvanceWelcome: () => void;
  onAdvance: () => void;
  onBirthdayChange: (value: string) => void;
  onBirthdaySubmit: (event: FormEvent<HTMLFormElement>) => void;
  onSkip: () => void;
}

export function FlowSections({
  state,
  birthdayValue,
  welcomeLine,
  onAdvanceWelcome,
  onAdvance,
  onBirthdayChange,
  onBirthdaySubmit,
  onSkip,
}: FlowSectionsProps) {
  const landmarks = visibleLandmarksForFlow(state);

  return (
    <main className={`flow-page flow-page--${state.step}`}>
      {landmarks.map((landmark) => {
        switch (landmark) {
          case "welcome":
            return (
              <WelcomeScreen
                key={landmark}
                line={welcomeLine}
                onAdvance={onAdvanceWelcome}
                onSkip={onSkip}
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
                value={birthdayValue}
                error={state.validationError}
                onChange={onBirthdayChange}
                onSubmit={onBirthdaySubmit}
                onSkip={onSkip}
              />
            );
          case "personal":
            return <PersonalPlaceholder key={landmark} />;
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
  onAdvance,
  onSkip,
}: {
  line: number;
  onAdvance: () => void;
  onSkip: () => void;
}) {
  return (
    <section
      className="flow-section welcome-section"
      data-landmark="welcome"
      aria-labelledby="welcome-line"
    >
      <div className="zodiac-placeholder zodiac-placeholder--immersive" />
      <div className="welcome-content">
        <p id="welcome-line" className="welcome-line" aria-live="polite">
          {welcomeLines[line] ?? welcomeLines[welcomeLines.length - 1]}
        </p>
        <button className="primary-action primary-action--light" onClick={onAdvance}>
          Continue
        </button>
        <button className="text-action text-action--light" onClick={onSkip}>
          Skip to this month
        </button>
      </div>
    </section>
  );
}

function ZodiacTransition({ onAdvance }: { onAdvance: () => void }) {
  return (
    <section
      className="flow-section transition-section"
      data-landmark="zodiac-transition"
      aria-labelledby="transition-title"
    >
      <div className="zodiac-placeholder zodiac-placeholder--compact" />
      <div className="section-copy section-copy--centered">
        <p className="eyebrow">A view of the whole sky</p>
        <h1 id="transition-title">Now, a place for you.</h1>
        <button className="primary-action" onClick={onAdvance}>
          Continue
        </button>
      </div>
    </section>
  );
}

function BirthdayStep({
  value,
  error,
  onChange,
  onSubmit,
  onSkip,
}: {
  value: string;
  error: string | null;
  onChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onSkip: () => void;
}) {
  return (
    <section
      className="flow-section birthday-section"
      data-landmark="birthday"
      aria-labelledby="birthday-title"
    >
      <div className="zodiac-placeholder zodiac-placeholder--compact" />
      <div className="section-copy birthday-copy">
        <p className="eyebrow">Optional</p>
        <h1 id="birthday-title">When did you arrive?</h1>
        <p>We’ll use the date only for this placeholder reading.</p>
        <form className="birthday-form" onSubmit={onSubmit} noValidate>
          <label htmlFor="birthday">Birthday</label>
          <input
            id="birthday"
            name="birthday"
            type="text"
            inputMode="numeric"
            autoComplete="bday"
            placeholder="MM/DD/YYYY"
            value={value}
            aria-describedby={error ? "birthday-error" : "birthday-hint"}
            aria-invalid={Boolean(error)}
            onChange={(event) => onChange(event.target.value)}
          />
          <span id="birthday-hint" className="field-hint">
            MM/DD/YYYY
          </span>
          {error ? (
            <span id="birthday-error" className="field-error" role="alert">
              {error}
            </span>
          ) : null}
          <button className="primary-action" type="submit">
            Show my reading
          </button>
        </form>
        <button className="text-action" onClick={onSkip}>
          Skip to this month
        </button>
      </div>
    </section>
  );
}

function PersonalPlaceholder() {
  return (
    <section
      className="flow-section reading-section personal-section"
      data-landmark="personal"
      aria-labelledby="personal-title"
    >
      <div className="zodiac-arc" aria-hidden="true" />
      <div className="section-copy reading-copy">
        <p className="hero-glyph" aria-hidden="true">
          א
        </p>
        <p className="eyebrow">Your birth-month reflection</p>
        <h1 id="personal-title">A personal reading lives here.</h1>
        <p>
          This placeholder holds the letter, mood, and short reflection that will
          be generated from your birth month.
        </p>
        <div className="constellation-placeholder" aria-label="Constellation placeholder" />
      </div>
    </section>
  );
}

function MonthPlaceholder() {
  return (
    <section
      className="flow-section reading-section month-section"
      data-landmark="month"
      aria-labelledby="month-title"
    >
      <div className="section-copy reading-copy">
        <div className="constellation-placeholder" aria-label="Constellation placeholder" />
        <p className="eyebrow">This month</p>
        <h1 id="month-title">The month has a message.</h1>
        <p>
          A short seasonal reading and one small ritual will appear in this space.
        </p>
      </div>
    </section>
  );
}

function UpcomingPlaceholder() {
  return (
    <section
      className="flow-section reading-section upcoming-section"
      data-landmark="upcoming"
      aria-labelledby="upcoming-title"
    >
      <div className="section-copy reading-copy">
        <p className="eyebrow">Moon / upcoming</p>
        <div className="moon-placeholder" aria-label="Moon phase placeholder" />
        <h1 id="upcoming-title">Something is gathering.</h1>
        <p>The next Friday and symbolic moon moment will land here.</p>
      </div>
    </section>
  );
}

export default function App() {
  const [flow, setFlow] = useState<FlowState>(createInitialFlow);
  const [welcomeLine, setWelcomeLine] = useState(0);
  const [birthdayValue, setBirthdayValue] = useState("");
  const [pendingLandmark, setPendingLandmark] =
    useState<FlowLandmark | null>(null);

  useEffect(() => {
    if (!pendingLandmark) {
      return;
    }
    scrollToLandmarkUnlessReducedMotion(pendingLandmark);
    setPendingLandmark(null);
  }, [flow.step, pendingLandmark]);

  const applyAction = (action: FlowAction, destination?: FlowLandmark) => {
    setFlow((current) => transitionFlow(current, action));
    if (destination) {
      setPendingLandmark(destination);
    }
  };

  const advanceWelcome = () => {
    if (welcomeLine < welcomeLines.length - 1) {
      setWelcomeLine((current) => current + 1);
      return;
    }
    applyAction({ type: "advance" });
  };

  const submitBirthday = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const next = transitionFlow(flow, {
      type: "submit-birthday",
      value: birthdayValue,
    });
    setFlow(next);
    if (next.step === "personal") {
      setPendingLandmark("personal");
    }
  };

  return (
    <FlowSections
      state={flow}
      birthdayValue={birthdayValue}
      welcomeLine={welcomeLine}
      onAdvanceWelcome={advanceWelcome}
      onAdvance={() => applyAction({ type: "advance" })}
      onBirthdayChange={setBirthdayValue}
      onBirthdaySubmit={submitBirthday}
      onSkip={() => applyAction({ type: "skip-to-month" }, "month")}
    />
  );
}
