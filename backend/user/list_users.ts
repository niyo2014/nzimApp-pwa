import { api } from "encore.dev/api";
import { Query } from "encore.dev/api";
import { userDB } from "./db";
import type { User } from "../listing/types";

interface ListUsersParams {
  user_type?: Query<'admin' | 'reseller' | 'vendor' | 'buyer' | 'sharer'>;
  limit?: Query<number>;
  offset?: Query<number>;
}

interface ListUsersResponse {
  users: User[];
  total: number;
}

// Retrieves users with optional filtering by type.
export const listUsers = api<ListUsersParams, ListUsersResponse>(
  { expose: true, method: "GET", path: "/users" },
  async (params) => {
    const limit = params.limit || 50;
    const offset = params.offset || 0;
    
    let whereClause = "";
    let queryParams: any[] = [];
    
    if (params.user_type) {
      whereClause = "WHERE user_type = $1";
      queryParams.push(params.user_type);
    }
    
    const users = await userDB.rawQueryAll<User>(`
      SELECT * FROM users 
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}
    `, ...queryParams, limit, offset);
    
    const totalResult = await userDB.rawQueryRow<{ count: number }>(`
      SELECT COUNT(*) as count FROM users ${whereClause}
    `, ...queryParams);
    
    return {
      users,
      total: totalResult?.count || 0
    };
  }
);
