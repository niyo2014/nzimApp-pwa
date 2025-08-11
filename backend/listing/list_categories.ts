import { api } from "encore.dev/api";
import { listingDB } from "./db";
import type { Category } from "./types";

interface ListCategoriesResponse {
  categories: Category[];
}

// Retrieves all available categories.
export const listCategories = api<void, ListCategoriesResponse>(
  { expose: true, method: "GET", path: "/categories" },
  async () => {
    const categories = await listingDB.queryAll<Category>`
      SELECT * FROM categories ORDER BY name
    `;
    return { categories };
  }
);
