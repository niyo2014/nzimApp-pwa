import { api, APIError } from "encore.dev/api";
import { listingDB } from "./db";
import type { ListingWithDetails } from "./types";

interface GetListingParams {
  id: number;
}

// Retrieves a single listing with full details.
export const getListing = api<GetListingParams, ListingWithDetails>(
  { expose: true, method: "GET", path: "/listings/:id" },
  async (params) => {
    const listing = await listingDB.rawQueryRow<any>(`
      SELECT 
        l.*,
        s.shop_number, s.name as shop_name, s.description as shop_description,
        s.owner_name, s.phone, s.whatsapp, s.gallery_id,
        g.name as gallery_name, g.zone, g.latitude, g.longitude,
        c.name as category_name, c.name_kirundi as category_name_kirundi,
        c.name_french as category_name_french, c.icon as category_icon
      FROM listings l
      JOIN shops s ON l.shop_id = s.id
      JOIN galleries g ON s.gallery_id = g.id
      LEFT JOIN categories c ON l.category_id = c.id
      WHERE l.id = $1 AND l.is_active = true
    `, params.id);
    
    if (!listing) {
      throw APIError.notFound("listing not found");
    }
    
    return {
      ...listing,
      shop: {
        id: listing.shop_id,
        gallery_id: listing.gallery_id,
        shop_number: listing.shop_number,
        name: listing.shop_name,
        description: listing.shop_description,
        owner_name: listing.owner_name,
        phone: listing.phone,
        whatsapp: listing.whatsapp,
        created_at: new Date()
      },
      gallery: {
        id: listing.gallery_id,
        name: listing.gallery_name,
        zone: listing.zone,
        latitude: listing.latitude,
        longitude: listing.longitude,
        created_at: new Date()
      },
      category: listing.category_name ? {
        id: listing.category_id,
        name: listing.category_name,
        name_kirundi: listing.category_name_kirundi,
        name_french: listing.category_name_french,
        icon: listing.category_icon,
        created_at: new Date()
      } : undefined
    };
  }
);
