import { api } from "encore.dev/api";
import { adminDB } from "./db";

interface AnalyticsResponse {
  total_users: number;
  total_listings: number;
  total_referrals: number;
  total_sales: number;
  total_clicks: number;
  conversion_rate: number;
  users_by_type: Record<string, number>;
  listings_by_category: Record<string, number>;
  recent_activity: {
    new_users_today: number;
    new_listings_today: number;
    sales_today: number;
  };
}

// Retrieves comprehensive analytics for admin dashboard.
export const getAnalytics = api<void, AnalyticsResponse>(
  { expose: true, method: "GET", path: "/admin/analytics" },
  async () => {
    // Get total counts
    const totalUsers = await adminDB.queryRow<{ count: number }>`
      SELECT COUNT(*) as count FROM vendors
    `;

    const totalListings = await adminDB.queryRow<{ count: number }>`
      SELECT COUNT(*) as count FROM listings
    `;

    const totalReferrals = await adminDB.queryRow<{ count: number }>`
      SELECT COUNT(*) as count FROM referrals
    `;

    const totalSales = await adminDB.queryRow<{ count: number }>`
      SELECT COUNT(*) as count FROM transactions WHERE status = 'completed'
    `;

    const totalClicks = await adminDB.queryRow<{ total_clicks: number }>`
      SELECT COALESCE(COUNT(*), 0) as total_clicks FROM referrals WHERE click_timestamp IS NOT NULL
    `;

    // Get users by type (using vendors table)
    const usersByType = await adminDB.queryAll<{ vendor_type: string; count: number }>`
      SELECT vendor_type, COUNT(*) as count 
      FROM vendors 
      GROUP BY vendor_type
    `;

    // Get listings by category
    const listingsByCategory = await adminDB.queryAll<{ category_name: string; count: number }>`
      SELECT c.name as category_name, COUNT(l.id) as count
      FROM categories c
      LEFT JOIN listings l ON c.id = l.category_id
      GROUP BY c.id, c.name
    `;

    // Get today's activity
    const newUsersToday = await adminDB.queryRow<{ count: number }>`
      SELECT COUNT(*) as count 
      FROM vendors 
      WHERE DATE(created_at) = CURRENT_DATE
    `;

    const newListingsToday = await adminDB.queryRow<{ count: number }>`
      SELECT COUNT(*) as count 
      FROM listings 
      WHERE DATE(created_at) = CURRENT_DATE
    `;

    const salesToday = await adminDB.queryRow<{ count: number }>`
      SELECT COUNT(*) as count 
      FROM transactions 
      WHERE DATE(created_at) = CURRENT_DATE AND status = 'completed'
    `;

    const conversionRate = totalClicks?.total_clicks > 0 
      ? (totalSales?.count || 0) / totalClicks.total_clicks * 100 
      : 0;

    return {
      total_users: totalUsers?.count || 0,
      total_listings: totalListings?.count || 0,
      total_referrals: totalReferrals?.count || 0,
      total_sales: totalSales?.count || 0,
      total_clicks: totalClicks?.total_clicks || 0,
      conversion_rate: conversionRate,
      users_by_type: usersByType.reduce((acc, item) => {
        acc[item.vendor_type] = item.count;
        return acc;
      }, {} as Record<string, number>),
      listings_by_category: listingsByCategory.reduce((acc, item) => {
        acc[item.category_name] = item.count;
        return acc;
      }, {} as Record<string, number>),
      recent_activity: {
        new_users_today: newUsersToday?.count || 0,
        new_listings_today: newListingsToday?.count || 0,
        sales_today: salesToday?.count || 0,
      }
    };
  }
);
