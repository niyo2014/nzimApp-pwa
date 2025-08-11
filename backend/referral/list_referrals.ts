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
  commission_amount: number;
  commission_paid: boolean;
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
    let referrals: ReferralWithListing[];
    
    if (params.sharer_phone) {
      referrals = await referralDB.queryAll<ReferralWithListing>`
        SELECT r.*, l.title as listing_title
        FROM referrals r
        JOIN listings l ON r.listing_id = l.id
        WHERE r.sharer_phone = ${params.sharer_phone}
        ORDER BY r.created_at DESC
      `;
    } else {
      referrals = await referralDB.queryAll<ReferralWithListing>`
        SELECT r.*, l.title as listing_title
        FROM referrals r
        JOIN listings l ON r.listing_id = l.id
        ORDER BY r.created_at DESC
        LIMIT 100
      `;
    }
    
    return { referrals };
  }
);
