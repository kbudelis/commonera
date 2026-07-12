export type Pledge = {
  v: 1;
  name?: string;
  timing: {
    mode: 'traditional' | 'sunday' | 'custom';
    start: string;
    end: string;
    location?: { lat: number; lng: number; label?: string };
  };
  pledge: {
    tier: 'items' | 'all_in' | 'full';
    items?: string[];
    exceptions?: string[];
  };
  intention: string;
  substitute: string;
  phoneHome?: string;
  createdAt: string;
};

export type WeekRecord = {
  weekOf: string;
  kept: boolean;
  reflection?: string;
};

const PLEDGE_KEY = 'ds.pledge.v1';
const HISTORY_KEY = 'ds.history.v1';

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') {
    return fallback;
  }

  const stored = window.localStorage.getItem(key);
  if (!stored) {
    return fallback;
  }

  try {
    return JSON.parse(stored) as T;
  } catch {
    return fallback;
  }
}

export function getPledge(): Pledge | null {
  return readJson<Pledge | null>(PLEDGE_KEY, null);
}

export function savePledge(pledge: Pledge): void {
  window.localStorage.setItem(PLEDGE_KEY, JSON.stringify(pledge));
}

export function getHistory(): WeekRecord[] {
  return readJson<WeekRecord[]>(HISTORY_KEY, []);
}

export function attestWeek(record: WeekRecord): void {
  const history = getHistory();
  const existingIndex = history.findIndex((entry) => entry.weekOf === record.weekOf);

  if (existingIndex >= 0) {
    history[existingIndex] = record;
  } else {
    history.push(record);
  }

  window.localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}
