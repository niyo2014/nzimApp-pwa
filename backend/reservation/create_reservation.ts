import { api } from "encore.dev/api";
import { reservationDB } from "./db";
import type { Reservation } from "../listing/types";

interface CreateReservationRequest {
  listing_id: number;
  buyer_id: number;
  pickup_date: Date;
  pickup_time: string;
  payment_method: 'cash' | 'mobile_money';
}

// Creates a new reservation for gallery vendor pickup.
export const createReservation = api<CreateReservationRequest, Reservation>(
  { expose: true, method: "POST", path: "/reservations" },
  async (req) => {
    await reservationDB.exec`BEGIN`;
    
    try {
      // Get vendor_id from listing
      const listing = await reservationDB.queryRow<{ vendor_id: number }>`
        SELECT vendor_id FROM listings WHERE id = ${req.listing_id}
      `;
      
      if (!listing) {
        throw new Error("Listing not found");
      }
      
      const reservation = await reservationDB.queryRow<Reservation>`
        INSERT INTO reservations (listing_id, buyer_id, vendor_id, pickup_date, pickup_time, payment_method)
        VALUES (${req.listing_id}, ${req.buyer_id}, ${listing.vendor_id}, ${req.pickup_date}, ${req.pickup_time}, ${req.payment_method})
        RETURNING *
      `;
      
      if (!reservation) {
        throw new Error("Failed to create reservation");
      }
      
      // Update listing status to reserved
      await reservationDB.exec`
        UPDATE listings SET status = 'reserved' WHERE id = ${req.listing_id}
      `;
      
      // Create notification for vendor
      await reservationDB.exec`
        INSERT INTO notifications (user_id, user_type, type, title, message, related_id)
        VALUES (${listing.vendor_id}, 'vendor', 'reservation', 'New Reservation Request', 
                'You have a new reservation request for pickup', ${reservation.id})
      `;
      
      await reservationDB.exec`COMMIT`;
      
      return reservation;
    } catch (error) {
      await reservationDB.exec`ROLLBACK`;
      throw error;
    }
  }
);
