import { api, APIError } from "encore.dev/api";
import { listingDB } from "./db";
import type { Listing } from "./types";

interface UpdateListingRequest {
  id: number;
  title?: string;
  description?: string;
  price?: number;
  currency?: string;
  images?: string[];
  category_id?: number;
  is_active?: boolean;
}

// Updates an existing listing.
export const updateListing = api<UpdateListingRequest, Listing>(
  { expose: true, method: "PUT", path: "/listings/:id" },
  async (req) => {
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (req.title !== undefined) {
      updates.push(`title = $${paramIndex}`);
      values.push(req.title);
      paramIndex++;
    }

    if (req.description !== undefined) {
      updates.push(`description = $${paramIndex}`);
      values.push(req.description);
      paramIndex++;
    }

    if (req.price !== undefined) {
      updates.push(`price = $${paramIndex}`);
      values.push(req.price);
      paramIndex++;
    }

    if (req.currency !== undefined) {
      updates.push(`currency = $${paramIndex}`);
      values.push(req.currency);
      paramIndex++;
    }

    if (req.images !== undefined) {
      updates.push(`images = $${paramIndex}`);
      values.push(req.images);
      paramIndex++;
    }

    if (req.category_id !== undefined) {
      updates.push(`category_id = $${paramIndex}`);
      values.push(req.category_id);
      paramIndex++;
    }

    if (req.is_active !== undefined) {
      updates.push(`is_active = $${paramIndex}`);
      values.push(req.is_active);
      paramIndex++;
    }

    if (updates.length === 0) {
      throw APIError.invalidArgument("No fields to update");
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);

    const listing = await listingDB.rawQueryRow<Listing>(`
      UPDATE listings 
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `, ...values, req.id);

    if (!listing) {
      throw APIError.notFound("listing not found");
    }

    return listing;
  }
);
