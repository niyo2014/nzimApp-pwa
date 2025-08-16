import { api, APIError } from "encore.dev/api";
import { vendorDB } from "./db";

interface GetVendorParams {
  id: number;
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
  gallery_data?: {
    gallery_name: string;
    shop_number: string;
    category_authorization?: string;
  };
  outside_data?: {
    home_address: string;
    service_area_coverage: string;
    pickup_points?: string;
  };
}

// Retrieves a single vendor with specialized data.
export const getVendor = api<GetVendorParams, VendorWithData>(
  { expose: true, method: "GET", path: "/vendors/:id" },
  async (params) => {
    const vendor = await vendorDB.rawQueryRow<any>(`
      SELECT 
        v.*,
        gvd.gallery_name,
        gvd.shop_number,
        gvd.category_authorization,
        ovd.home_address,
        ovd.service_area_coverage,
        ovd.pickup_points
      FROM vendors v
      LEFT JOIN gallery_vendor_data gvd ON v.id = gvd.vendor_id
      LEFT JOIN outside_vendor_data ovd ON v.id = ovd.vendor_id
      WHERE v.id = $1
    `, params.id);
    
    if (!vendor) {
      throw APIError.notFound("vendor not found");
    }
    
    const result: VendorWithData = {
      id: vendor.id,
      name: vendor.name,
      contact_number: vendor.contact_number,
      email: vendor.email,
      vendor_type: vendor.vendor_type,
      kyc_status: vendor.kyc_status,
      status: vendor.status,
      trust_score: vendor.trust_score,
      created_at: vendor.created_at
    };
    
    if (vendor.vendor_type === 'gallery' && vendor.gallery_name) {
      result.gallery_data = {
        gallery_name: vendor.gallery_name,
        shop_number: vendor.shop_number,
        category_authorization: vendor.category_authorization
      };
    } else if (vendor.vendor_type === 'outside' && vendor.home_address) {
      result.outside_data = {
        home_address: vendor.home_address,
        service_area_coverage: vendor.service_area_coverage,
        pickup_points: vendor.pickup_points
      };
    }
    
    return result;
  }
);
