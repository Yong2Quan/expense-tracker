import * as SQLite from "expo-sqlite";

import type { Category, CategoryCreate, Expense, ExpenseCreate } from "../types";

const db = SQLite.openDatabaseSync("spending.db");

// ── Bootstrap ─────────────────────────────────────────────────────────────────

export const initDB = (): void => {
  db.withTransactionSync(() => {
    db.runSync("PRAGMA journal_mode = WAL;");

    db.runSync(`
      CREATE TABLE IF NOT EXISTS categories (
        id      INTEGER PRIMARY KEY AUTOINCREMENT,
        name    TEXT    NOT NULL UNIQUE,
        colour  TEXT    NOT NULL DEFAULT '#6366F1'
      );
    `);

    db.runSync(`
      CREATE TABLE IF NOT EXISTS expenses (
        id          INTEGER PRIMARY KEY AUTOINCREMENT,
        amount      REAL    NOT NULL,
        note        TEXT,
        date        TEXT    NOT NULL,
        category_id INTEGER NOT NULL REFERENCES categories(id)
      );
    `);

    // Seed defaults only on first launch
    const { count } = db.getFirstSync<{ count: number }>(
      "SELECT COUNT(*) AS count FROM categories;",
    )!;

    if (count === 0) {
      const defaults = [
        { name: "Food & Drink", colour: "#F59E0B" },
        { name: "Transport", colour: "#3B82F6" },
        { name: "Shopping", colour: "#EC4899" },
        { name: "Entertainment", colour: "#8B5CF6" },
        { name: "Health", colour: "#10B981" },
        { name: "Bills", colour: "#EF4444" },
      ];
      for (const cat of defaults) {
        db.runSync(
          "INSERT OR IGNORE INTO categories (name, colour) VALUES (?, ?);",
          cat.name,
          cat.colour,
        );
      }
    }
  });
};

// ── Internal row shape returned by the JOIN query ─────────────────────────────

interface ExpenseRow {
  id: number;
  amount: number;
  note: string | null;
  date: string;
  category_id: number;
  category_name: string;
  category_colour: string;
}

const rowToExpense = (row: ExpenseRow): Expense => ({
  id: row.id,
  amount: row.amount,
  note: row.note ?? undefined,
  date: row.date,
  category_id: row.category_id,
  category: {
    id: row.category_id,
    name: row.category_name,
    colour: row.category_colour,
  },
});

// ── Categories ────────────────────────────────────────────────────────────────

export const getCategories = (): Category[] =>
  db.getAllSync<Category>("SELECT * FROM categories ORDER BY name;");

export const createCategory = (payload: CategoryCreate): Category => {
  const result = db.runSync(
    "INSERT INTO categories (name, colour) VALUES (?, ?);",
    payload.name,
    payload.colour,
  );
  return { id: result.lastInsertRowId, ...payload };
};

export const deleteCategory = (id: number): void => {
  db.runSync("DELETE FROM categories WHERE id = ?;", id);
};

// ── Expenses ──────────────────────────────────────────────────────────────────

export const getExpenses = (): Expense[] =>
  db
    .getAllSync<ExpenseRow>(
      `SELECT
        e.id,
        e.amount,
        e.note,
        e.date,
        e.category_id,
        c.name   AS category_name,
        c.colour AS category_colour
      FROM expenses e
      JOIN categories c ON c.id = e.category_id
      ORDER BY e.date DESC;`,
    )
    .map(rowToExpense);

export const createExpense = (payload: ExpenseCreate): void => {
  db.runSync(
    "INSERT INTO expenses (amount, note, date, category_id) VALUES (?, ?, ?, ?);",
    payload.amount,
    payload.note ?? null,
    payload.date,
    payload.category_id,
  );
};

export const deleteExpense = (id: number): void => {
  db.runSync("DELETE FROM expenses WHERE id = ?;", id);
};

// ── Summary ───────────────────────────────────────────────────────────────────

export interface CategorySummary {
  name: string;
  colour: string;
  total: number;
  percentage: number;
}

export const getMonthlySummary = (month: string): CategorySummary[] => {
  // month format: "YYYY-MM"
  const rows = db.getAllSync<{ name: string; colour: string; total: number }>(
    `SELECT
      c.name,
      c.colour,
      SUM(e.amount) AS total
    FROM expenses e
    JOIN categories c ON c.id = e.category_id
    WHERE e.date LIKE ?
    GROUP BY c.id
    ORDER BY total DESC;`,
    `${month}%`,
  );

  const grandTotal = rows.reduce((sum, r) => sum + r.total, 0);
  return rows.map((r) => ({
    ...r,
    percentage: grandTotal > 0 ? (r.total / grandTotal) * 100 : 0,
  }));
};

export const getMonthlyTotal = (month: string): number => {
  const result = db.getFirstSync<{ total: number | null }>(
    "SELECT SUM(amount) AS total FROM expenses WHERE date LIKE ?;",
    `${month}%`,
  );
  return result?.total ?? 0;
};
