import type { Expense } from "../types";

export interface CategorySummary {
  name: string;
  colour: string;
  total: number;
  percentage: number;
}

/** Expenses whose date falls in the given "YYYY-MM" month. */
export const filterByMonth = (expenses: Expense[], month: string): Expense[] =>
  expenses.filter((e) => e.date.startsWith(month));

export const monthlyTotal = (expenses: Expense[], month: string): number =>
  filterByMonth(expenses, month).reduce((sum, e) => sum + e.amount, 0);

/** Per-category totals for a month, largest first, with percentage shares. */
export const monthlySummary = (expenses: Expense[], month: string): CategorySummary[] => {
  const byCategory = new Map<string, CategorySummary>();

  for (const expense of filterByMonth(expenses, month)) {
    const key = expense.category.name;
    const existing = byCategory.get(key);
    if (existing) {
      existing.total += expense.amount;
    } else {
      byCategory.set(key, {
        name: expense.category.name,
        colour: expense.category.colour,
        total: expense.amount,
        percentage: 0,
      });
    }
  }

  const rows = [...byCategory.values()].sort((a, b) => b.total - a.total);
  const grandTotal = rows.reduce((sum, r) => sum + r.total, 0);
  for (const row of rows) {
    row.percentage = grandTotal > 0 ? (row.total / grandTotal) * 100 : 0;
  }
  return rows;
};

export interface DaySection {
  /** "YYYY-MM-DD" */
  date: string;
  total: number;
  data: Expense[];
}

/**
 * Group expenses into day sections, newest day first, for a SectionList.
 * Each section carries its own total so the day header can show it.
 */
export const groupByDay = (expenses: Expense[]): DaySection[] => {
  const byDate = new Map<string, Expense[]>();

  for (const expense of expenses) {
    const bucket = byDate.get(expense.date);
    if (bucket) {
      bucket.push(expense);
    } else {
      byDate.set(expense.date, [expense]);
    }
  }

  return [...byDate.entries()]
    .sort(([a], [b]) => (a < b ? 1 : a > b ? -1 : 0))
    .map(([date, data]) => ({
      date,
      data,
      total: data.reduce((sum, e) => sum + e.amount, 0),
    }));
};

/** Mean spend per day that actually had any spending, for the month. */
export const averagePerActiveDay = (expenses: Expense[], month: string): number => {
  const inMonth = filterByMonth(expenses, month);
  if (inMonth.length === 0) return 0;
  const days = new Set(inMonth.map((e) => e.date)).size;
  return inMonth.reduce((sum, e) => sum + e.amount, 0) / days;
};
