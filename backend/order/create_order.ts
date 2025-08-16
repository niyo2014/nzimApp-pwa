import { api } from "encore.dev/api";
import { orderDB } from "./db";
import type { Order } from "../listing/types";

interface CreateOrderRequest {
  listing_id: number;
  buyer_id: number;
  delivery_address: string;
  contact_info: string;
}

// Creates a new order for outside vendor delivery.
export const createOrder = api<CreateOrderRequest, Order>(
  { expose: true, method: "POST", path: "/orders" },
  async (req) => {
    await orderDB.exec`BEGIN`;
    
    try {
      // Get listing details
      const listing = await orderDB.queryRow<{ vendor_id: number; price: number }>`
        SELECT vendor_id, price FROM listings WHERE id = ${req.listing_id}
      `;
      
      if (!listing) {
        throw new Error("Listing not found");
      }
      
      const order = await orderDB.queryRow<Order>`
        INSERT INTO orders (listing_id, buyer_id, vendor_id, delivery_address, contact_info, amount)
        VALUES (${req.listing_id}, ${req.buyer_id}, ${listing.vendor_id}, ${req.delivery_address}, ${req.contact_info}, ${listing.price})
        RETURNING *
      `;
      
      if (!order) {
        throw new Error("Failed to create order");
      }
      
      await orderDB.exec`COMMIT`;
      
      return order;
    } catch (error) {
      await orderDB.exec`ROLLBACK`;
      throw error;
    }
  }
);
