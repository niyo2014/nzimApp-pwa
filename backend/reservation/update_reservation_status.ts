import { api } from "encore.dev/api";
import { reservationDB } from "./db";

interface UpdateReservationStatusRequest {
  reservation_id: number;
  status: 'accepted' | 'rejected' | 'completed' | 'cancelled';
  vendor_id: number;
}

// Updates reservation status (vendor action).
export const updateReservationStatus = api<UpdateReservationStatusRequest, void>(
  { expose: true, method: "PUT", path: "/reservations/:reservation_id/status" },
  async (req) => {
    await reservationDB.exec`BEGIN`;
    
    try {
      const reservation = await reservationDB.queryRow<{ buyer_id: number; listing_id: number }>`
        UPDATE reservations 
        SET status = ${req.status}, updated_at = CURRENT_TIMESTAMP
        WHERE id = ${req.reservation_id} AND vendor_id = ${req.vendor_id}
        RETURNING buyer_id, listing_id
      `;
      
      if (!reservation) {
        throw new Error("Reservation not found or unauthorized");
      }
      
      // Update listing status based on reservation status
      if (req.status === 'completed') {
        await reservationDB.exec`
          UPDATE listings SET status = 'completed' WHERE id = ${reservation.listing_id}
        `;
        
        // Update vendor trust score
        await reservationDB.exec`
          UPDATE trust_scores 
          SET score = score + 5, last_updated = CURRENT_TIMESTAMP
          WHERE vendor_id = ${req.vendor_id}
        `;
        
        // Check for referral and credit points
        const referral = await reservationDB.queryRow<{ sharer_id: number; points_earned: number }>`
          SELECT sharer_id, points_earned 
          FROM referrals 
          WHERE listing_id = ${reservation.listing_id} AND sale_confirmation_timestamp IS NULL
        `;
        
        if (referral) {
          await reservationDB.exec`
            UPDATE referrals 
            SET sale_confirmation_timestamp = CURRENT_TIMESTAMP
            WHERE listing_id = ${reservation.listing_id}
          `;
          
          await reservationDB.exec`
            UPDATE sharers 
            SET gift_points = gift_points + ${referral.points_earned}
            WHERE id = ${referral.sharer_id}
          `;
          
          // Notify sharer
          await reservationDB.exec`
            INSERT INTO notifications (user_id, user_type, type, title, message, related_id)
            VALUES (${referral.sharer_id}, 'sharer', 'points_credited', 'Points Credited', 
                    'You earned ${referral.points_earned} gift points from a confirmed sale', ${req.reservation_id})
          `;
        }
      } else if (req.status === 'rejected' || req.status === 'cancelled') {
        await reservationDB.exec`
          UPDATE listings SET status = 'active' WHERE id = ${reservation.listing_id}
        `;
      }
      
      // Create notification for buyer
      let notificationMessage = '';
      switch (req.status) {
        case 'accepted':
          notificationMessage = 'Your reservation has been accepted';
          break;
        case 'rejected':
          notificationMessage = 'Your reservation has been rejected';
          break;
        case 'completed':
          notificationMessage = 'Your order has been completed';
          break;
        case 'cancelled':
          notificationMessage = 'Your reservation has been cancelled';
          break;
      }
      
      await reservationDB.exec`
        INSERT INTO notifications (user_id, user_type, type, title, message, related_id)
        VALUES (${reservation.buyer_id}, 'buyer', 'reservation', 'Reservation Update', 
                ${notificationMessage}, ${req.reservation_id})
      `;
      
      await reservationDB.exec`COMMIT`;
    } catch (error) {
      await reservationDB.exec`ROLLBACK`;
      throw error;
    }
  }
);
