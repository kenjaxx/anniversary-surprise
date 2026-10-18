const PH_OFFSET_MS = 8 * 3600e3; // UTC+8

export const pad = n => String(n).padStart(2, '0');

// Calendar-accurate difference (years / months / days / h / m / s), measured in Philippine time.
export function elapsed(startMs, nowMs) {
  const a = new Date(startMs + PH_OFFSET_MS);
  const b = new Date(nowMs + PH_OFFSET_MS);
  let years = b.getUTCFullYear() - a.getUTCFullYear();
  let months = b.getUTCMonth() - a.getUTCMonth();
  let days = b.getUTCDate() - a.getUTCDate();
  let hours = b.getUTCHours() - a.getUTCHours();
  let minutes = b.getUTCMinutes() - a.getUTCMinutes();
  let seconds = b.getUTCSeconds() - a.getUTCSeconds();

  if (seconds < 0) { seconds += 60; minutes--; }
  if (minutes < 0) { minutes += 60; hours--; }
  if (hours < 0) { hours += 24; days--; }
  if (days < 0) {
    // borrow the length of the month before the current one
    days += new Date(Date.UTC(b.getUTCFullYear(), b.getUTCMonth(), 0)).getUTCDate();
    months--;
  }
  if (months < 0) { months += 12; years--; }
  return { years, months, days, hours, minutes, seconds };
}