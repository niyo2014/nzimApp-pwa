import { api } from "encore.dev/api";
import { orderDB } from "./db";

interface ConfirmReceiptRequest {
  order_id: number;
  buyer_id: number;
}

// Confirms receipt of order (buyer action).
export const confirmReceipt = api<ConfirmReceiptRequest, void>(
  { expose: true, method: "POST", path: "/orders/:order_id/confirm-receipt" },
  async (req) => {
    await orderDB.exec`BEGIN`;
    
    try {
      const order = await orderDB.queryRow<{ vendor_id: number; listing_id: number }>`
        UPDATE orders 
        SET order_status = 'delivered', updated_at = CURRENT_TIMESTAMP
        WHERE id = ${req.order_id} AND buyer_id = ${req.buyer_id}
        RETURNING vendor_id, listing_id
      `;
      
      if (!order) {
        throw new Error("Order not found or unauthorized");
      }
      
      // Update listing status to completed
      await orderDB.exec`
        UPDATE listings SET status = 'completed' WHERE id = ${order.listing_id}
      `;
      
      // Update vendor trust score
      await orderDB.exec`
        UPDATE trust_scores 
        SET score = score + 10, last_updated = CURRENT_TIMESTAMP
        WHERE vendor_id = ${order.vendor_id}
      `;
      
      // Check for referral and credit points
      const referral = await orderDB.queryRow<{ sharer_id: number; points_earned: number }>`
        SELECT sharer_id, points_earned 
        FROM referrals 
        WHERE listing_id = ${order.listing_id} AND sale_confirmation_timestamp IS NULL
      `;
      
      if (referral) {
        await orderDB.exec`
          UPDATE referrals 
          SET sale_confirmation_timestamp = CURRENT_TIMESTAMP
          WHERE listing_id = ${order.listing_id}
        `;
        
        await orderDB.exec`
          UPDATE sharers 
          SET gift_points = gift_points + ${referral.points_earned}
          WHERE id = ${referral.sharer_id}
        `;
        
        // Notify sharer
        await orderDB.exec`
          INSERT INTO notifications (user_id, user_type, type, title, message, related_id)
          VALUES (${referral.sharer_id}, 'sharer', 'points_credited', 'Points Credited', 
                  'You earned ${referral.points_earned} gift points from a confirmed sale', ${req.order_id})
        `;
      }
      
      await orderDB.exec`COMMIT`;
    } catch (error) {
      await orderDB.exec`ROLLBACK`;
      throw error;
    }
  }
);
