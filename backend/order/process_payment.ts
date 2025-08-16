import { api } from "encore.dev/api";
import { orderDB } from "./db";

interface ProcessPaymentRequest {
  order_id: number;
  afripay_transaction_id: string;
  payment_status: 'authorized' | 'confirmed' | 'failed';
}

// Processes payment webhook from Afripay.
export const processPayment = api<ProcessPaymentRequest, void>(
  { expose: true, method: "POST", path: "/orders/payment-webhook" },
  async (req) => {
    await orderDB.exec`BEGIN`;
    
    try {
      const order = await orderDB.queryRow<{ buyer_id: number; vendor_id: number; listing_id: number }>`
        UPDATE orders 
        SET payment_status = ${req.payment_status}, 
            afripay_transaction_id = ${req.afripay_transaction_id},
            order_status = CASE WHEN ${req.payment_status} = 'confirmed' THEN 'confirmed' ELSE order_status END,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ${req.order_id}
        RETURNING buyer_id, vendor_id, listing_id
      `;
      
      if (!order) {
        throw new Error("Order not found");
      }
      
      if (req.payment_status === 'confirmed') {
        // Notify vendor to prepare order
        await orderDB.exec`
          INSERT INTO notifications (user_id, user_type, type, title, message, related_id)
          VALUES (${order.vendor_id}, 'vendor', 'payment', 'Payment Confirmed', 
                  'Payment confirmed. Please prepare the order for delivery', ${req.order_id})
        `;
        
        // Notify buyer
        await orderDB.exec`
          INSERT INTO notifications (user_id, user_type, type, title, message, related_id)
          VALUES (${order.buyer_id}, 'buyer', 'payment', 'Order Confirmed', 
                  'Your payment has been confirmed. Your order is being prepared', ${req.order_id})
        `;
        
        // Update listing status
        await orderDB.exec`
          UPDATE listings SET status = 'reserved' WHERE id = ${order.listing_id}
        `;
      }
      
      await orderDB.exec`COMMIT`;
    } catch (error) {
      await orderDB.exec`ROLLBACK`;
      throw error;
    }
  }
);
