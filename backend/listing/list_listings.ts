import { api } from "encore.dev/api";
import { Query } from "encore.dev/api";
import { listingDB } from "./db";
import type { ListingWithDetails } from "./types";

interface ListListingsParams {
  category_id?: Query<number>;
  gallery_id?: Query<number>;
  shop_id?: Query<number>;
  search?: Query<string>;
  listing_type?: Query<'offering' | 'wanted'>;
  limit?: Query<number>;
  offset?: Query<number>;
}

interface ListListingsResponse {
  listings: ListingWithDetails[];
  total: number;
}

// Retrieves listings with filtering and search capabilities.
export const listListings = api<ListListingsParams, ListListingsResponse>(
  { expose: true, method: "GET", path: "/listings" },
  async (params) => {
    const limit = params.limit || 20;
    const offset = params.offset || 0;
    const listingType = params.listing_type || 'offering';
    
    let whereConditions = ["l.is_active = true", `l.listing_type = '${listingType}'`];
    let queryParams: any[] = [];
    let paramIndex = 1;
    
    if (params.category_id) {
      whereConditions.push(`l.category_id = $${paramIndex}`);
      queryParams.push(params.category_id);
      paramIndex++;
    }
    
    if (params.shop_id) {
      whereConditions.push(`l.shop_id = $${paramIndex}`);
      queryParams.push(params.shop_id);
      paramIndex++;
    }
    
    if (params.gallery_id) {
      whereConditions.push(`s.gallery_id = $${paramIndex}`);
      queryParams.push(params.gallery_id);
      paramIndex++;
    }
    
    if (params.search) {
      whereConditions.push(`(l.title ILIKE $${paramIndex} OR l.description ILIKE $${paramIndex})`);
      queryParams.push(`%${params.search}%`);
      paramIndex++;
    }
    
    const whereClause = whereConditions.join(" AND ");
    
    const listings = await listingDB.rawQueryAll<any>(`
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
      WHERE ${whereClause}
      ORDER BY l.is_boosted DESC, l.trust_score DESC, l.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `, ...queryParams, limit, offset);
    
    const totalResult = await listingDB.rawQueryRow<{ count: number }>(`
      SELECT COUNT(*) as count
      FROM listings l
      JOIN shops s ON l.shop_id = s.id
      WHERE ${whereClause}
    `, ...queryParams);
    
    const formattedListings: ListingWithDetails[] = listings.map(listing => ({
      id: listing.id,
      shop_id: listing.shop_id,
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
      created_at: listing.created_at,
      updated_at: listing.updated_at,
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
        id: listing.category_id!,
        name: listing.category_name,
        name_kirundi: listing.category_name_kirundi,
        name_french: listing.category_name_french,
        icon: listing.category_icon,
        created_at: new Date()
      } : undefined
    }));
    
    return {
      listings: formattedListings,
      total: totalResult?.count || 0
    };
  }
);
