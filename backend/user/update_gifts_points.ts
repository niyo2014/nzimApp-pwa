import { api } from "encore.dev/api";
import { userDB } from "./db";

interface UpdateGiftsPointsRequest {
  user_id: number;
  points_to_add: number;
}

interface UpdateGiftsPointsResponse {
  new_balance: number;
}

// Updates a user's gifts points balance.
export const updateGiftsPoints = api<UpdateGiftsPointsRequest, UpdateGiftsPointsResponse>(
  { expose: true, method: "POST", path: "/users/gifts-points" },
  async (req) => {
    const result = await userDB.queryRow<{ gifts_points: number }>`
      UPDATE users 
      SET gifts_points = gifts_points + ${req.points_to_add}
      WHERE id = ${req.user_id}
      RETURNING gifts_points
    `;
    
    if (!result) {
      throw new Error("User not found");
    }
    
    return {
      new_balance: result.gifts_points
    };
  }
);
