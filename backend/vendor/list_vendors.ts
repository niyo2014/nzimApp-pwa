import { api } from "encore.dev/api";
import { Query } from "encore.dev/api";
import { vendorDB } from "./db";

interface ListVendorsParams {
  vendor_type?: Query<'gallery' | 'outside'>;
  kyc_status?: Query<'pending' | 'verified' | 'rejected'>;
  status?: Query<'active' | 'suspended' | 'inactive'>;
  limit?: Query<number>;
  offset?: Query<number>;
}

interface VendorWithData {
  id: number;
  name: string;
  contact_number: string;
  email?: string;
  vendor_type: 'gallery' | 'outside';
  kyc_status: 'pending' | 'verified' | 'rejected';
  status: 'active' | 'suspended' | 'inactive';
  trust_score: number;
  created_at: Date;
  gallery_name?: string;
  shop_number?: string;
  home_address?: string;
  service_area_coverage?: string;
}

interface ListVendorsResponse {
  vendors: VendorWithData[];
  total: number;
}

// Retrieves vendors with their specialized data.
export const listVendors = api<ListVendorsParams, ListVendorsResponse>(
  { expose: true, method: "GET", path: "/vendors" },
  async (params) => {
    const limit = params.limit || 50;
    const offset = params.offset || 0;
    
    let whereConditions: string[] = [];
    let queryParams: any[] = [];
    let paramIndex = 1;
    
    if (params.vendor_type) {
      whereConditions.push(`v.vendor_type = $${paramIndex}`);
      queryParams.push(params.vendor_type);
      paramIndex++;
    }
    
    if (params.kyc_status) {
      whereConditions.push(`v.kyc_status = $${paramIndex}`);
      queryParams.push(params.kyc_status);
      paramIndex++;
    }
    
    if (params.status) {
      whereConditions.push(`v.status = $${paramIndex}`);
      queryParams.push(params.status);
      paramIndex++;
    }
    
    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(" AND ")}` : "";
    
    const vendors = await vendorDB.rawQueryAll<VendorWithData>(`
      SELECT 
        v.*,
        gvd.gallery_name,
        gvd.shop_number,
        ovd.home_address,
        ovd.service_area_coverage
      FROM vendors v
      LEFT JOIN gallery_vendor_data gvd ON v.id = gvd.vendor_id
      LEFT JOIN outside_vendor_data ovd ON v.id = ovd.vendor_id
      ${whereClause}
      ORDER BY v.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `, ...queryParams, limit, offset);
    
    const totalResult = await vendorDB.rawQueryRow<{ count: number }>(`
      SELECT COUNT(*) as count FROM vendors v ${whereClause}
    `, ...queryParams);
    
    return {
      vendors,
      total: totalResult?.count || 0
    };
  }
);
