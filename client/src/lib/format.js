/* Money, dates and image helpers. */

const inrFormat = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
export const inr = (value) => inrFormat.format(Math.round(value || 0));

export const img = (id, w = 800, h = 600) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&h=${h}&q=70`;

const pad = (n) => String(n).padStart(2, '0');
export const dateISO = (date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

export const addDays = (days) => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + days);
  return d;
};

export const bookableRange = (settings) => ({
  min: dateISO(addDays(settings?.minNoticeDays ?? 2)),
  max: dateISO(addDays(settings?.maxAdvanceDays ?? 120)),
});

export const formatDate = (iso) => {
  if (!iso) return '';
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
};

export const formatTime = (hhmm) => {
  if (!hhmm) return '';
  const [h, m] = hhmm.split(':').map(Number);
  return `${((h + 11) % 12) + 1}:${pad(m)} ${h < 12 ? 'AM' : 'PM'}`;
};

export const timeOptions = (meal) => {
  if (!meal) return [];
  const toMinutes = (t) => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
  const out = [];
  for (let t = toMinutes(meal.from); t <= toMinutes(meal.to); t += 30) {
    out.push(`${pad(Math.floor(t / 60))}:${pad(t % 60)}`);
  }
  return out;
};
