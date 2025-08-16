import { api } from "encore.dev/api";
import { orderDB } from "./db";

interface UpdateDeliveryStatusRequest {
  order_id: number;
  vendor_id: number;
  status: 'shipped' | 'delivered';
}

// Updates delivery status (vendor action).
export const updateDeliveryStatus = api<UpdateDeliveryStatusRequest, void>(
  { expose: true, method: "PUT", path: "/orders/:order_id/delivery" },
  async (req) => {
    await orderDB.exec`BEGIN`;
    
    try {
      const order = await orderDB.queryRow<{ buyer_id: number; listing_id: number }>`
        UPDATE orders 
        SET order_status = ${req.status}, updated_at = CURRENT_TIMESTAMP
        WHERE id = ${req.order_id} AND vendor_id = ${req.vendor_id}
        RETURNING buyer_id, listing_id
      `;
      
      if (!order) {
        throw new Error("Order not found or unauthorized");
      }
      
      // Notify buyer
      const message = req.status === 'shipped' ? 'Your order has been shipped' : 'Your order has been delivered';
      await orderDB.exec`
        INSERT INTO notifications (user_id, user_type, type, title, message, related_id)
        VALUES (${order.buyer_id}, 'buyer', 'order_status', 'Delivery Update', ${message}, ${req.order_id})
      `;
      
      await orderDB.exec`COMMIT`;
    } catch (error) {
      await orderDB.exec`ROLLBACK`;
      throw error;
    }
  }
);
