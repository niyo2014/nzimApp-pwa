import { api } from "encore.dev/api";
import { userDB } from "./db";

interface UpdateTrustScoreRequest {
  user_id: number;
  score_change: number;
}

interface UpdateTrustScoreResponse {
  new_score: number;
}

// Updates a user's trust score.
export const updateTrustScore = api<UpdateTrustScoreRequest, UpdateTrustScoreResponse>(
  { expose: true, method: "POST", path: "/users/trust-score" },
  async (req) => {
    const result = await userDB.queryRow<{ trust_score: number }>`
      UPDATE users 
      SET trust_score = GREATEST(0, trust_score + ${req.score_change})
      WHERE id = ${req.user_id}
      RETURNING trust_score
    `;
    
    if (!result) {
      throw new Error("User not found");
    }
    
    return {
      new_score: result.trust_score
    };
  }
);
