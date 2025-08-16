import { api } from "encore.dev/api";
import { listingDB } from "./db";
import type { Listing } from "./types";

interface CreateListingRequest {
  vendor_id: number;
  category_id?: number;
  title: string;
  description?: string;
  price: number;
  currency?: string;
  images?: string[];
  listing_type?: 'offering' | 'wanted';
  contact_hidden?: boolean;
  duration_days?: number;
}

// Creates a new listing.
export const createListing = api<CreateListingRequest, Listing>(
  { expose: true, method: "POST", path: "/listings" },
  async (req) => {
    const listing = await listingDB.queryRow<Listing>`
      INSERT INTO listings (
        vendor_id, category_id, title, description, price, currency, 
        images, listing_type, contact_hidden, duration_days
      )
      VALUES (
        ${req.vendor_id}, ${req.category_id}, ${req.title}, ${req.description}, 
        ${req.price}, ${req.currency || 'BIF'}, ${req.images || []}, 
        ${req.listing_type || 'offering'}, ${req.contact_hidden || false}, ${req.duration_days || 30}
      )
      RETURNING *
    `;
    
    if (!listing) {
      throw new Error("Failed to create listing");
    }
    
    // Check for matching wanted listings if this is an offering
    if (listing.listing_type === 'offering') {
      const matchingWanted = await listingDB.queryAll<{ id: number; buyer_id: number }>`
        SELECT id, buyer_id FROM wanted_listings 
        WHERE status = 'active' 
        AND (category = ${req.category_id?.toString()} OR category IS NULL)
        AND description ILIKE '%' || ${req.title} || '%'
      `;
      
      // Create notifications for matching wanted listings
      for (const wanted of matchingWanted) {
        await listingDB.exec`
          INSERT INTO notifications (user_id, user_type, type, title, message, related_id)
          VALUES (${wanted.buyer_id}, 'buyer', 'wanted_match', 'New Matching Item Found', 
                  'A new listing matches your wanted item: ${req.title}', ${listing.id})
        `;
        
        // Create wanted match record
        await listingDB.exec`
          INSERT INTO wanted_matches (wanted_listing_id, offering_listing_id, buyer_id, vendor_id)
          VALUES (${wanted.id}, ${listing.id}, ${wanted.buyer_id}, ${req.vendor_id})
        `;
      }
    }
    
    return listing;
  }
);
