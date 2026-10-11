/** Shared formatting helpers, so money and dates look the same everywhere. */

export const formatMoney = (amount: number): string =>
  `$${amount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTHS_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];
export const MONTHS_LONG = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/** "YYYY-MM-DD" -> a local Date, avoiding the UTC shift of `new Date(str)`. */
const parseISODate = (iso: string): Date => {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
};

export const todayISO = (): string => {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
};

export const currentMonthISO = (): string => todayISO().slice(0, 7);

/** "2026-10-12" -> "12 Oct", or "Today" / "Yesterday" when it's recent. */
export const formatDayLabel = (iso: string): string => {
  const today = todayISO();
  if (iso === today) return "Today";

  const yesterday = new Date(parseISODate(today));
  yesterday.setDate(yesterday.getDate() - 1);
  const yMonth = String(yesterday.getMonth() + 1).padStart(2, "0");
  const yDay = String(yesterday.getDate()).padStart(2, "0");
  if (iso === `${yesterday.getFullYear()}-${yMonth}-${yDay}`) return "Yesterday";

  const date = parseISODate(iso);
  return `${date.getDate()} ${MONTHS_SHORT[date.getMonth()]}`;
};

/** The weekday name for a date, used as the secondary line on day headers. */
export const formatWeekday = (iso: string): string => DAYS[parseISODate(iso).getDay()];

/** "2026-10" -> "October 2026". */
export const formatMonthLabel = (month: string): string => {
  const [year, m] = month.split("-").map(Number);
  return `${MONTHS_LONG[(m ?? 1) - 1]} ${year}`;
};
