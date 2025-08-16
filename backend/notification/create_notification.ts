import { api } from "encore.dev/api";
import { notificationDB } from "./db";
import type { Notification } from "../listing/types";

interface CreateNotificationRequest {
  user_id: number;
  user_type: 'vendor' | 'buyer' | 'sharer' | 'admin';
  type: 'reservation' | 'payment' | 'order_status' | 'wanted_match' | 'points_credited' | 'dispute';
  title: string;
  message: string;
  related_id?: number;
}

// Creates a new notification.
export const createNotification = api<CreateNotificationRequest, Notification>(
  { expose: true, method: "POST", path: "/notifications" },
  async (req) => {
    const notification = await notificationDB.queryRow<Notification>`
      INSERT INTO notifications (user_id, user_type, type, title, message, related_id)
      VALUES (${req.user_id}, ${req.user_type}, ${req.type}, ${req.title}, ${req.message}, ${req.related_id})
      RETURNING *
    `;
    
    if (!notification) {
      throw new Error("Failed to create notification");
    }
    
    return notification;
  }
);
