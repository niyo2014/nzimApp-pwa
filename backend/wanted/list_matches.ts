import { api } from "encore.dev/api";
import { Query } from "encore.dev/api";
import { wantedDB } from "./db";

interface ListMatchesParams {
  buyer_id?: Query<number>;
  vendor_id?: Query<number>;
}

interface MatchWithDetails {
  id: number;
  wanted_listing_id: number;
  offering_listing_id: number;
  buyer_id: number;
  vendor_id: number;
  is_contact_revealed: boolean;
  reveal_fee_paid: boolean;
  created_at: Date;
  wanted_title: string;
  offering_title: string;
  buyer_name: string;
  vendor_name: string;
}

interface ListMatchesResponse {
  matches: MatchWithDetails[];
}

// Retrieves matches for buyers or vendors.
export const listMatches = api<ListMatchesParams, ListMatchesResponse>(
  { expose: true, method: "GET", path: "/wanted/matches" },
  async (params) => {
    let whereConditions: string[] = [];
    let queryParams: any[] = [];
    let paramIndex = 1;
    
    if (params.buyer_id) {
      whereConditions.push(`wm.buyer_id = $${paramIndex}`);
      queryParams.push(params.buyer_id);
      paramIndex++;
    }
    
    if (params.vendor_id) {
      whereConditions.push(`wm.vendor_id = $${paramIndex}`);
      queryParams.push(params.vendor_id);
      paramIndex++;
    }
    
    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(" AND ")}` : "";
    
    const matches = await wantedDB.rawQueryAll<MatchWithDetails>(`
      SELECT 
        wm.*,
        wl.title as wanted_title,
        ol.title as offering_title,
        bu.name as buyer_name,
        vu.name as vendor_name
      FROM wanted_matches wm
      JOIN listings wl ON wm.wanted_listing_id = wl.id
      JOIN listings ol ON wm.offering_listing_id = ol.id
      JOIN users bu ON wm.buyer_id = bu.id
      JOIN users vu ON wm.vendor_id = vu.id
      ${whereClause}
      ORDER BY wm.created_at DESC
    `, ...queryParams);
    
    return { matches };
  }
);
