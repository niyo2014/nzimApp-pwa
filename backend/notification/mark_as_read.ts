import { api } from "encore.dev/api";
import { notificationDB } from "./db";

interface MarkAsReadRequest {
  notification_id: number;
  user_id: number;
}

// Marks a notification as read.
export const markAsRead = api<MarkAsReadRequest, void>(
  { expose: true, method: "PUT", path: "/notifications/:notification_id/read" },
  async (req) => {
    await notificationDB.exec`
      UPDATE notifications 
      SET is_read = true 
      WHERE id = ${req.notification_id} AND user_id = ${req.user_id}
    `;
  }
);
