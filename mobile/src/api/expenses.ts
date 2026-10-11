import apiClient from "./client";
import type { Expense, ExpenseCreate } from "../types";

export const getExpenses = async (): Promise<Expense[]> => {
  const { data } = await apiClient.get<Expense[]>("/expenses/");
  return data;
};

export const createExpense = async (payload: ExpenseCreate): Promise<Expense> => {
  const { data } = await apiClient.post<Expense>("/expenses/", payload);
  return data;
};

export const deleteExpense = async (id: number): Promise<void> => {
  await apiClient.delete(`/expenses/${id}`);
};
