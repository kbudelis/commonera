import SunCalc from 'suncalc';

import type { Pledge } from './store';

export type TimingMode = Pledge['timing']['mode'];
export type SunLocation = NonNullable<Pledge['timing']['location']>;

export type TimingWindowInput = {
  mode: TimingMode;
  location?: SunLocation;
  referenceDate?: Date;
  customStart?: string;
  customEnd?: string;
};

const DAY_MS = 24 * 60 * 60 * 1000;
const MINUTE_MS = 60 * 1000;
const WEEK_MS = 7 * DAY_MS;

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function nextWeekday(referenceDate: Date, weekday: number): Date {
  const date = new Date(referenceDate);
  date.setHours(12, 0, 0, 0);

  const daysUntil = (weekday - date.getDay() + 7) % 7;
  return addDays(date, daysUntil);
}

function localDateAt(referenceDate: Date, hour: number, minute = 0): Date {
  const date = new Date(referenceDate);
  date.setHours(hour, minute, 0, 0);
  return date;
}

function fallbackWindow(startBase: Date, startHour: number, endHour: number): {
  start: Date;
  end: Date;
} {
  const start = localDateAt(startBase, startHour);
  const end = localDateAt(addDays(startBase, 1), endHour, 50);
  return { start, end };
}

function requireCustomWindow(input: TimingWindowInput): { start: Date; end: Date } {
  if (!input.customStart || !input.customEnd) {
    throw new Error('Custom timing requires customStart and customEnd ISO values.');
  }

  return {
    start: new Date(input.customStart),
    end: new Date(input.customEnd),
  };
}

function ensureUpcomingWindow(window: { start: Date; end: Date }, referenceDate: Date): {
  start: Date;
  end: Date;
} {
  const start = new Date(window.start);
  const end = new Date(window.end);

  while (end <= referenceDate) {
    start.setTime(start.getTime() + WEEK_MS);
    end.setTime(end.getTime() + WEEK_MS);
  }

  return { start, end };
}

export function getTimingWindow(input: TimingWindowInput): {
  mode: TimingMode;
  start: string;
  end: string;
  location?: SunLocation;
} {
  const referenceDate = input.referenceDate ?? new Date();

  if (input.mode === 'custom') {
    const { start, end } = ensureUpcomingWindow(requireCustomWindow(input), referenceDate);
    return {
      mode: input.mode,
      start: start.toISOString(),
      end: end.toISOString(),
      location: input.location,
    };
  }

  if (input.mode === 'sunday') {
    const sunday = nextWeekday(referenceDate, 0);

    if (!input.location) {
      const { start, end } = ensureUpcomingWindow(fallbackWindow(sunday, 8, 18), referenceDate);
      return {
        mode: input.mode,
        start: start.toISOString(),
        end: end.toISOString(),
      };
    }

    const times = SunCalc.getTimes(sunday, input.location.lat, input.location.lng);
    const { start, end } = ensureUpcomingWindow({ start: times.sunrise, end: times.sunset }, referenceDate);
    return {
      mode: input.mode,
      start: start.toISOString(),
      end: end.toISOString(),
      location: input.location,
    };
  }

  const friday = nextWeekday(referenceDate, 5);

  if (!input.location) {
    const { start, end } = ensureUpcomingWindow(fallbackWindow(friday, 18, 19), referenceDate);
    return {
      mode: input.mode,
      start: start.toISOString(),
      end: end.toISOString(),
    };
  }

  const startTimes = SunCalc.getTimes(friday, input.location.lat, input.location.lng);
  const saturday = new Date(friday.getTime() + DAY_MS);
  const endTimes = SunCalc.getTimes(saturday, input.location.lat, input.location.lng);
  const { start, end } = ensureUpcomingWindow(
    {
      start: startTimes.sunset,
      // Traditional close approximates "three stars" as Saturday sunset + 50 minutes for handoff.
      end: new Date(endTimes.sunset.getTime() + 50 * MINUTE_MS),
    },
    referenceDate,
  );

  return {
    mode: input.mode,
    start: start.toISOString(),
    end: end.toISOString(),
    location: input.location,
  };
}
