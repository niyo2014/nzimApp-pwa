import { api } from "encore.dev/api";
import { referralDB } from "./db";

interface TrackClickRequest {
  referral_code: string;
}

// Tracks a click on a referral link.
export const trackClick = api<TrackClickRequest, void>(
  { expose: true, method: "POST", path: "/referrals/track" },
  async (req) => {
    await referralDB.exec`
      UPDATE referrals 
      SET clicks = clicks + 1 
      WHERE referral_code = ${req.referral_code}
    `;
  }
);
