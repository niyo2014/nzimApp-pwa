import { api } from "encore.dev/api";
import { userDB } from "./db";
import type { User } from "../listing/types";

interface CreateUserRequest {
  name: string;
  phone: string;
  email?: string;
  user_type: 'admin' | 'reseller' | 'vendor' | 'buyer' | 'sharer';
}

// Creates a new user.
export const createUser = api<CreateUserRequest, User>(
  { expose: true, method: "POST", path: "/users" },
  async (req) => {
    const user = await userDB.queryRow<User>`
      INSERT INTO users (name, phone, email, user_type)
      VALUES (${req.name}, ${req.phone}, ${req.email}, ${req.user_type})
      RETURNING *
    `;
    
    if (!user) {
      throw new Error("Failed to create user");
    }
    
    return user;
  }
);
