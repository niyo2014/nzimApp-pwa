import { api } from "encore.dev/api";
import { referralDB } from "./db";

interface ConfirmSaleRequest {
  listing_id: number;
  referral_code?: string;
  buyer_name?: string;
  buyer_phone?: string;
  sale_amount: number;
  proof_image?: string;
}

interface ConfirmSaleResponse {
  sale_id: number;
  gifts_points_earned?: number;
}

// Confirms a sale and processes referral gifts points.
export const confirmSale = api<ConfirmSaleRequest, ConfirmSaleResponse>(
  { expose: true, method: "POST", path: "/sales/confirm" },
  async (req) => {
    let referralId: number | null = null;
    let giftsPointsEarned: number | undefined;
    
    if (req.referral_code) {
      const referral = await referralDB.queryRow<{ id: number; gifts_points_earned: number }>`
        SELECT id, gifts_points_earned 
        FROM referrals 
        WHERE referral_code = ${req.referral_code} AND listing_id = ${req.listing_id}
      `;
      
      if (referral) {
        referralId = referral.id;
        giftsPointsEarned = referral.gifts_points_earned;
        
        await referralDB.exec`
          UPDATE referrals 
          SET is_sale_confirmed = true, confirmed_at = CURRENT_TIMESTAMP
          WHERE id = ${referral.id}
        `;
      }
    }
    
    const saleResult = await referralDB.queryRow<{ id: number }>`
      INSERT INTO sales (listing_id, referral_id, buyer_name, buyer_phone, sale_amount, proof_image, vendor_confirmed)
      VALUES (${req.listing_id}, ${referralId}, ${req.buyer_name}, ${req.buyer_phone}, ${req.sale_amount}, ${req.proof_image}, true)
      RETURNING id
    `;
    
    return {
      sale_id: saleResult!.id,
      gifts_points_earned: giftsPointsEarned
    };
  }
);
