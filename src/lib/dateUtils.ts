/**
 * Pure local date utilities for historical study tracking.
 * Avoids timezone skew by operating strictly on local calendar numbers.
 * Weeks start on Monday as per academic standard.
 */

export function formatDateToISO(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function parseISODate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function getTodayDateString(): string {
  return formatDateToISO(new Date());
}

export function getCurrentMonthString(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

/**
 * Returns the Monday of the week containing the given date.
 * Weeks strictly start on Monday.
 */
export function getMondayOfWeek(dateStr: string): string {
  const d = parseISODate(dateStr);
  const day = d.getDay(); // 0 is Sun, 1 is Mon...
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return formatDateToISO(d);
}

/**
 * Returns the Sunday of the week starting on Monday.
 */
export function getSundayOfWeek(mondayStr: string): string {
  const d = parseISODate(mondayStr);
  d.setDate(d.getDate() + 6);
  return formatDateToISO(d);
}

/**
 * Returns an array of 7 ISO date strings [Mon, Tue, Wed, Thu, Fri, Sat, Sun].
 */
export function getDaysInWeek(mondayStr: string): string[] {
  const [y, m, d] = mondayStr.split('-').map(Number);
  const days: string[] = [];
  for (let i = 0; i < 7; i++) {
    const cur = new Date(y, m - 1, d + i);
    days.push(formatDateToISO(cur));
  }
  return days;
}

export function shiftDate(dateStr: string, deltaDays: number): string {
  const d = parseISODate(dateStr);
  d.setDate(d.getDate() + deltaDays);
  return formatDateToISO(d);
}

export function shiftWeek(mondayStr: string, deltaWeeks: number): string {
  return shiftDate(mondayStr, deltaWeeks * 7);
}

export function shiftMonth(yearMonthStr: string, deltaMonths: number): string {
  const [y, m] = yearMonthStr.split('-').map(Number);
  const target = new Date(y, m - 1 + deltaMonths, 1);
  const newY = target.getFullYear();
  const newM = String(target.getMonth() + 1).padStart(2, '0');
  return `${newY}-${newM}`;
}

export function getMonthDays(yearMonthStr: string): string[] {
  const [y, m] = yearMonthStr.split('-').map(Number);
  const lastDay = new Date(y, m, 0).getDate();
  const days: string[] = [];
  for (let d = 1; d <= lastDay; d++) {
    days.push(`${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`);
  }
  return days;
}

export interface CalendarGridCell {
  dateStr: string;
  dayNumber: number;
  isCurrentMonth: boolean;
}

/**
 * Builds a Monday-first 7-column calendar grid for a given YYYY-MM.
 * Includes previous month lead-in days and next month trailing days.
 */
export function getMonthCalendarGrid(yearMonthStr: string): CalendarGridCell[] {
  const [y, m] = yearMonthStr.split('-').map(Number);
  const firstDay = new Date(y, m - 1, 1);
  const lastDayNumber = new Date(y, m, 0).getDate();

  const firstDow = firstDay.getDay(); // 0 = Sun, 1 = Mon...
  const leadingCount = firstDow === 0 ? 6 : firstDow - 1;

  const cells: CalendarGridCell[] = [];

  // Leading days from prev month
  const prevMonthDate = new Date(y, m - 2, 1);
  const prevYear = prevMonthDate.getFullYear();
  const prevMonth = prevMonthDate.getMonth() + 1;
  const prevMonthLastDay = new Date(y, m - 1, 0).getDate();

  for (let i = leadingCount - 1; i >= 0; i--) {
    const dayNum = prevMonthLastDay - i;
    const dateStr = `${prevYear}-${String(prevMonth).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
    cells.push({ dateStr, dayNumber: dayNum, isCurrentMonth: false });
  }

  // Current month days
  for (let d = 1; d <= lastDayNumber; d++) {
    const dateStr = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    cells.push({ dateStr, dayNumber: d, isCurrentMonth: true });
  }

  // Trailing days to complete 7-day row
  const remainder = cells.length % 7;
  if (remainder > 0) {
    const trailingCount = 7 - remainder;
    const nextMonthDate = new Date(y, m, 1);
    const nextYear = nextMonthDate.getFullYear();
    const nextMonth = nextMonthDate.getMonth() + 1;
    for (let d = 1; d <= trailingCount; d++) {
      const dateStr = `${nextYear}-${String(nextMonth).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      cells.push({ dateStr, dayNumber: d, isCurrentMonth: false });
    }
  }

  return cells;
}

export function formatDayHeader(dateStr: string): string {
  const today = getTodayDateString();
  const d = parseISODate(dateStr);
  const weekday = d.toLocaleDateString(undefined, { weekday: 'long' });
  const monthDay = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  if (dateStr === today) {
    return `Today, ${monthDay}`;
  }
  return `${weekday}, ${monthDay}`;
}

export function formatWeekHeader(mondayStr: string): string {
  const mon = parseISODate(mondayStr);
  const sun = parseISODate(getSundayOfWeek(mondayStr));

  const monMonth = mon.toLocaleDateString(undefined, { month: 'short' });
  const sunMonth = sun.toLocaleDateString(undefined, { month: 'short' });
  const monDay = mon.getDate();
  const sunDay = sun.getDate();
  const year = sun.getFullYear();

  if (mon.getFullYear() !== sun.getFullYear()) {
    return `${monMonth} ${monDay}, ${mon.getFullYear()} – ${sunMonth} ${sunDay}, ${year}`;
  }
  if (monMonth !== sunMonth) {
    return `${monMonth} ${monDay} – ${sunMonth} ${sunDay}, ${year}`;
  }
  return `${monMonth} ${monDay} – ${sunDay}, ${year}`;
}

export function formatMonthHeader(yearMonthStr: string): string {
  const [y, m] = yearMonthStr.split('-').map(Number);
  const d = new Date(y, m - 1, 1);
  return d.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
}

export function getWeekdayShortName(dateStr: string): string {
  const d = parseISODate(dateStr);
  return d.toLocaleDateString(undefined, { weekday: 'short' });
}
