import { api } from "encore.dev/api";
import { listingDB } from "./db";
import type { Listing } from "./types";

interface CreateListingRequest {
  shop_id: number;
  category_id?: number;
  title: string;
  description?: string;
  price: number;
  currency?: string;
  images?: string[];
  listing_type?: 'offering' | 'wanted';
  contact_hidden?: boolean;
}

// Creates a new listing.
export const createListing = api<CreateListingRequest, Listing>(
  { expose: true, method: "POST", path: "/listings" },
  async (req) => {
    const listing = await listingDB.queryRow<Listing>`
      INSERT INTO listings (
        shop_id, category_id, title, description, price, currency, 
        images, listing_type, contact_hidden
      )
      VALUES (
        ${req.shop_id}, ${req.category_id}, ${req.title}, ${req.description}, 
        ${req.price}, ${req.currency || 'BIF'}, ${req.images || []}, 
        ${req.listing_type || 'offering'}, ${req.contact_hidden || false}
      )
      RETURNING *
    `;
    
    if (!listing) {
      throw new Error("Failed to create listing");
    }
    
    return listing;
  }
);
