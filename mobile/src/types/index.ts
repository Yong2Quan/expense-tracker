export interface Category {
  id: number;
  name: string;
  colour: string;
}

export interface Expense {
  id: number;
  amount: number;
  note?: string;
  date: string; // ISO 8601: "YYYY-MM-DD"
  category_id: number;
  category: Category;
}

export interface ExpenseCreate {
  amount: number;
  note?: string;
  date: string;
  category_id: number;
}

export interface CategoryCreate {
  name: string;
  colour: string;
}
