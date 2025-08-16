import { api } from "encore.dev/api";
import { Query } from "encore.dev/api";
import { referralDB } from "./db";

interface ListReferralsParams {
  sharer_phone?: Query<string>;
}

interface ReferralWithListing {
  id: number;
  listing_id: number;
  listing_title: string;
  sharer_name: string;
  sharer_phone: string;
  referral_code: string;
  clicks: number;
  is_sale_confirmed: boolean;
  gifts_points_earned: number;
  gifts_points_paid: boolean;
  created_at: Date;
  confirmed_at?: Date;
}

interface ListReferralsResponse {
  referrals: ReferralWithListing[];
}

// Retrieves referrals for a specific sharer.
export const listReferrals = api<ListReferralsParams, ListReferralsResponse>(
  { expose: true, method: "GET", path: "/referrals" },
  async (params) => {
    let referrals: any[];
    
    if (params.sharer_phone) {
      referrals = await referralDB.rawQueryAll<any>(`
        SELECT 
          r.*,
          l.title as listing_title,
          s.name as sharer_name,
          s.contact_number as sharer_phone,
          CASE WHEN r.click_timestamp IS NOT NULL THEN 1 ELSE 0 END as clicks,
          CASE WHEN r.sale_confirmation_timestamp IS NOT NULL THEN true ELSE false END as is_sale_confirmed,
          r.points_earned as gifts_points_earned,
          false as gifts_points_paid,
          r.sale_confirmation_timestamp as confirmed_at
        FROM referrals r
        JOIN listings l ON r.listing_id = l.id
        JOIN sharers s ON r.sharer_id = s.id
        WHERE s.contact_number = $1
        ORDER BY r.created_at DESC
      `, params.sharer_phone);
    } else {
      referrals = await referralDB.rawQueryAll<any>(`
        SELECT 
          r.*,
          l.title as listing_title,
          s.name as sharer_name,
          s.contact_number as sharer_phone,
          CASE WHEN r.click_timestamp IS NOT NULL THEN 1 ELSE 0 END as clicks,
          CASE WHEN r.sale_confirmation_timestamp IS NOT NULL THEN true ELSE false END as is_sale_confirmed,
          r.points_earned as gifts_points_earned,
          false as gifts_points_paid,
          r.sale_confirmation_timestamp as confirmed_at
        FROM referrals r
        JOIN listings l ON r.listing_id = l.id
        JOIN sharers s ON r.sharer_id = s.id
        ORDER BY r.created_at DESC
        LIMIT 100
      `);
    }
    
    const formattedReferrals: ReferralWithListing[] = referrals.map(ref => ({
      id: ref.id,
      listing_id: ref.listing_id,
      listing_title: ref.listing_title,
      sharer_name: ref.sharer_name,
      sharer_phone: ref.sharer_phone,
      referral_code: ref.referral_id,
      clicks: ref.clicks,
      is_sale_confirmed: ref.is_sale_confirmed,
      gifts_points_earned: ref.gifts_points_earned,
      gifts_points_paid: ref.gifts_points_paid,
      created_at: ref.created_at,
      confirmed_at: ref.confirmed_at
    }));
    
    return { referrals: formattedReferrals };
  }
);
