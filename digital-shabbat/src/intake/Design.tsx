import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { getPledge, savePledge, type Pledge } from '../shared/store';
import { getTimingWindow, type TimingMode } from '../shared/sun';
import WhenStep from './WhenStep';
import SettingDownStep from './SettingDownStep';
import IntentionStep from './IntentionStep';

/*
  Intake — one thing at a time (2026-07-11 redesign): When → Setting down →
  Making room. Three deliberate choices build the pledge, then the pledge card
  is the checkpoint (`/pledge`). No form; each choice is its own screen.
*/

type Draft = {
  mode: TimingMode;
  customStart: string;
  customEnd: string;
  lat: string;
  lng: string;
  items: string[];
  intention: string;
};

function toDateTimeInput(iso?: string): string {
  if (!iso) return '';
  const date = new Date(iso);
  const offsetMs = date.getTimezoneOffset() * 60 * 1000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
}

function fromDateTimeInput(value: string): string {
  return new Date(value).toISOString();
}

function nextLocalDateTime(dayOffset: number, hour: number): string {
  const date = new Date();
  date.setDate(date.getDate() + dayOffset);
  date.setHours(hour, 0, 0, 0);
  return toDateTimeInput(date.toISOString());
}

function draftFromPledge(pledge: Pledge | null): Draft {
  return {
    mode: pledge?.timing.mode ?? 'traditional',
    customStart: pledge?.timing.mode === 'custom' ? toDateTimeInput(pledge.timing.start) : nextLocalDateTime(5, 18),
    customEnd: pledge?.timing.mode === 'custom' ? toDateTimeInput(pledge.timing.end) : nextLocalDateTime(6, 20),
    lat: pledge?.timing.location ? String(pledge.timing.location.lat) : '',
    lng: pledge?.timing.location ? String(pledge.timing.location.lng) : '',
    items: pledge?.pledge.items ?? [],
    intention: pledge?.intention ?? '',
  };
}

function buildPledge(draft: Draft): Pledge {
  const lat = Number.parseFloat(draft.lat);
  const lng = Number.parseFloat(draft.lng);
  const location = Number.isFinite(lat) && Number.isFinite(lng) ? { lat, lng } : undefined;

  const timing = getTimingWindow({
    mode: draft.mode,
    location,
    customStart: draft.mode === 'custom' ? fromDateTimeInput(draft.customStart) : undefined,
    customEnd: draft.mode === 'custom' ? fromDateTimeInput(draft.customEnd) : undefined,
  });

  return {
    v: 1,
    timing,
    pledge: {
      tier: 'items',
      items: draft.items.map((item) => item.trim()).filter(Boolean),
    },
    intention: draft.intention.trim(),
    substitute: '',
    createdAt: new Date().toISOString(),
  };
}

export default function Design() {
  const navigate = useNavigate();
  const [draft, setDraft] = useState<Draft>(() => draftFromPledge(getPledge()));
  const [step, setStep] = useState(0);

  // coordinates are plumbing: geolocation fills them silently, no field asked
  useEffect(() => {
    if (!navigator.geolocation || (draft.lat && draft.lng)) return;
    navigator.geolocation.getCurrentPosition(
      (position) =>
        setDraft((current) => ({
          ...current,
          lat: String(position.coords.latitude),
          lng: String(position.coords.longitude),
        })),
      () => undefined,
      { timeout: 8000 },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const whenValue = useMemo(
    () => ({ mode: draft.mode, customStart: draft.customStart, customEnd: draft.customEnd }),
    [draft.mode, draft.customStart, draft.customEnd],
  );

  function finish() {
    savePledge(buildPledge(draft));
    navigate('/pledge');
  }

  if (step === 0) {
    return (
      <WhenStep
        value={whenValue}
        onChange={(patch) => setDraft((current) => ({ ...current, ...patch }))}
        onNext={() => setStep(1)}
      />
    );
  }

  if (step === 1) {
    return (
      <SettingDownStep
        value={draft.items}
        onChange={(items) => setDraft((current) => ({ ...current, items }))}
        onBack={() => setStep(0)}
        onNext={() => setStep(2)}
      />
    );
  }

  return (
    <IntentionStep
      value={draft.intention}
      onChange={(intention) => setDraft((current) => ({ ...current, intention }))}
      onBack={() => setStep(1)}
      onNext={finish}
    />
  );
}
