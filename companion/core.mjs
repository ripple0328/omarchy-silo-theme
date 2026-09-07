export const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n));
export function plant(steam, cooling) {
  return {power: Math.max(0, steam * 1.4 - 20), pressure: 22 + steam * .6 - cooling * .12, heat: 55 + steam * .6 - cooling * .45};
}
export function stable(values, demand) {
  return Math.abs(values.power - demand) <= 5 && values.pressure >= 45 && values.pressure <= 62 && values.heat >= 60 && values.heat <= 76;
}
export function newShift(minutes = 25) {
  const duration = clamp(Number(minutes) || 25, 1, 180) * 60000;
  return {duration, remaining: duration, phase: 'idle', endsAt: null};
}
export function tick(shift, now) {
  if (shift.phase !== 'running') return {...shift};
  const remaining = Math.max(0, shift.endsAt - now);
  return {...shift, remaining, phase: remaining ? 'running' : 'complete', endsAt: remaining ? shift.endsAt : null};
}
export function start(shift, now) {
  if (!['idle', 'paused'].includes(shift.phase)) return {...shift};
  return {...shift, phase: 'running', endsAt: now + shift.remaining};
}
export function pause(shift, now) {
  const current = tick(shift, now);
  return current.phase === 'running' ? {...current, phase: 'paused', endsAt: null} : current;
}
export function restoreShift(value, now) {
  if (!value || !['idle','paused','running','complete'].includes(value.phase) || !Number.isFinite(value.duration) || value.duration < 60000 || value.duration > 10800000 || !Number.isFinite(value.remaining) || value.remaining < 0 || value.remaining > value.duration || (value.phase === 'running' && !Number.isFinite(value.endsAt))) return newShift();
  return tick(value, now);
}
