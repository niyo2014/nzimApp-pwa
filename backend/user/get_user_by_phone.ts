import { api, APIError } from "encore.dev/api";
import { userDB } from "./db";
import type { User } from "../listing/types";

interface GetUserByPhoneParams {
  phone: string;
}

// Retrieves a user by phone number.
export const getUserByPhone = api<GetUserByPhoneParams, User>(
  { expose: true, method: "GET", path: "/users/phone/:phone" },
  async (params) => {
    const user = await userDB.queryRow<User>`
      SELECT * FROM users WHERE phone = ${params.phone}
    `;
    
    if (!user) {
      throw APIError.notFound("user not found");
    }
    
    return user;
  }
);
