import { api, APIError } from "encore.dev/api";
import { userDB } from "./db";
import type { User } from "../listing/types";

interface GetUserParams {
  id: number;
}

// Retrieves a single user by ID.
export const getUser = api<GetUserParams, User>(
  { expose: true, method: "GET", path: "/users/:id" },
  async (params) => {
    const user = await userDB.queryRow<User>`
      SELECT * FROM users WHERE id = ${params.id}
    `;
    
    if (!user) {
      throw APIError.notFound("user not found");
    }
    
    return user;
  }
);
