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
        v.name as vendor_name, v.contact_number, v.vendor_type, v.trust_score as vendor_trust_score,
        v.email as vendor_email, v.kyc_status, v.status as vendor_status,
        gvd.gallery_name, gvd.shop_number, gvd.category_authorization,
        ovd.home_address, ovd.service_area_coverage, ovd.pickup_points,
        c.name as category_name, c.name_kirundi as category_name_kirundi,
        c.name_french as category_name_french, c.icon as category_icon
      FROM listings l
      JOIN vendors v ON l.vendor_id = v.id
      LEFT JOIN gallery_vendor_data gvd ON v.id = gvd.vendor_id
      LEFT JOIN outside_vendor_data ovd ON v.id = ovd.vendor_id
      LEFT JOIN categories c ON l.category_id = c.id
      WHERE l.id = $1 AND l.is_active = true
    `, params.id);
    
    if (!listing) {
      throw APIError.notFound("listing not found");
    }
    
    return {
      id: listing.id,
      vendor_id: listing.vendor_id,
      category_id: listing.category_id,
      title: listing.title,
      description: listing.description,
      price: listing.price,
      currency: listing.currency,
      images: listing.images || [],
      is_active: listing.is_active,
      is_boosted: listing.is_boosted,
      boost_expires_at: listing.boost_expires_at,
      listing_type: listing.listing_type,
      contact_hidden: listing.contact_hidden,
      trust_score: listing.trust_score,
      duration_days: listing.duration_days,
      status: listing.status,
      created_at: listing.created_at,
      updated_at: listing.updated_at,
      vendor: {
        id: listing.vendor_id,
        name: listing.vendor_name,
        contact_number: listing.contact_number,
        email: listing.vendor_email,
        vendor_type: listing.vendor_type,
        kyc_status: listing.kyc_status,
        status: listing.vendor_status,
        trust_score: listing.vendor_trust_score,
        created_at: new Date(),
        updated_at: new Date()
      },
      gallery_data: listing.gallery_name ? {
        vendor_id: listing.vendor_id,
        gallery_name: listing.gallery_name,
        shop_number: listing.shop_number,
        category_authorization: listing.category_authorization,
        created_at: new Date()
      } : undefined,
      outside_data: listing.home_address ? {
        vendor_id: listing.vendor_id,
        home_address: listing.home_address,
        service_area_coverage: listing.service_area_coverage,
        pickup_points: listing.pickup_points,
        created_at: new Date()
      } : undefined,
      category: listing.category_name ? {
        id: listing.category_id!,
        name: listing.category_name,
        name_kirundi: listing.category_name_kirundi,
        name_french: listing.category_name_french,
        icon: listing.category_icon,
        created_at: new Date()
      } : undefined
    };
  }
);
