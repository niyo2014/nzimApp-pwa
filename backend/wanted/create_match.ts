import { api } from "encore.dev/api";
import { wantedDB } from "./db";
import type { WantedMatch } from "../listing/types";

interface CreateMatchRequest {
  wanted_listing_id: number;
  offering_listing_id: number;
  buyer_id: number;
  vendor_id: number;
}

// Creates a match between a wanted listing and an offering.
export const createMatch = api<CreateMatchRequest, WantedMatch>(
  { expose: true, method: "POST", path: "/wanted/matches" },
  async (req) => {
    const match = await wantedDB.queryRow<WantedMatch>`
      INSERT INTO wanted_matches (wanted_listing_id, offering_listing_id, buyer_id, vendor_id)
      VALUES (${req.wanted_listing_id}, ${req.offering_listing_id}, ${req.buyer_id}, ${req.vendor_id})
      RETURNING *
    `;
    
    if (!match) {
      throw new Error("Failed to create match");
    }
    
    return match;
  }
);
