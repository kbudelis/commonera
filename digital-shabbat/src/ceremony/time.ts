import type { Pledge } from '../shared/store';

export function formatCeremonyEnd(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return 'when three stars are out';

  return new Intl.DateTimeFormat(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

export function formatEndDay(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "at week's end";

  return new Intl.DateTimeFormat(undefined, {
    weekday: 'long',
  }).format(date);
}

export function weekOfPledge(pledge: Pledge) {
  const date = new Date(pledge.timing.start);
  if (Number.isNaN(date.getTime())) return new Date().toISOString();
  date.setHours(0, 0, 0, 0);
  return date.toISOString();
}
