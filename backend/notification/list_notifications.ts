import { api } from "encore.dev/api";
import { Query } from "encore.dev/api";
import { notificationDB } from "./db";
import type { Notification } from "../listing/types";

interface ListNotificationsParams {
  user_id: number;
  user_type: 'vendor' | 'buyer' | 'sharer' | 'admin';
  is_read?: Query<boolean>;
  limit?: Query<number>;
  offset?: Query<number>;
}

interface ListNotificationsResponse {
  notifications: Notification[];
  total: number;
  unread_count: number;
}

// Retrieves notifications for a user.
export const listNotifications = api<ListNotificationsParams, ListNotificationsResponse>(
  { expose: true, method: "GET", path: "/notifications" },
  async (params) => {
    const limit = params.limit || 50;
    const offset = params.offset || 0;
    
    let whereConditions = [`user_id = ${params.user_id}`, `user_type = '${params.user_type}'`];
    let queryParams: any[] = [];
    let paramIndex = 1;
    
    if (params.is_read !== undefined) {
      whereConditions.push(`is_read = $${paramIndex}`);
      queryParams.push(params.is_read);
      paramIndex++;
    }
    
    const whereClause = whereConditions.join(" AND ");
    
    const notifications = await notificationDB.rawQueryAll<Notification>(`
      SELECT * FROM notifications 
      WHERE ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `, ...queryParams, limit, offset);
    
    const totalResult = await notificationDB.rawQueryRow<{ count: number }>(`
      SELECT COUNT(*) as count FROM notifications WHERE ${whereClause}
    `, ...queryParams);
    
    const unreadResult = await notificationDB.rawQueryRow<{ count: number }>(`
      SELECT COUNT(*) as count FROM notifications 
      WHERE user_id = ${params.user_id} AND user_type = '${params.user_type}' AND is_read = false
    `);
    
    return {
      notifications,
      total: totalResult?.count || 0,
      unread_count: unreadResult?.count || 0
    };
  }
);
