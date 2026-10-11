import apiClient from "./client";
import type { Category, CategoryCreate } from "../types";

export const getCategories = async (): Promise<Category[]> => {
  const { data } = await apiClient.get<Category[]>("/categories/");
  return data;
};

export const createCategory = async (payload: CategoryCreate): Promise<Category> => {
  const { data } = await apiClient.post<Category>("/categories/", payload);
  return data;
};

export const deleteCategory = async (id: number): Promise<void> => {
  await apiClient.delete(`/categories/${id}`);
};
