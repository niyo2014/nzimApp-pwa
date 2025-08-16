import { api } from "encore.dev/api";
import { vendorDB } from "./db";
import type { Vendor, GalleryVendorData, OutsideVendorData } from "../listing/types";

interface CreateVendorRequest {
  name: string;
  contact_number: string;
  email?: string;
  vendor_type: 'gallery' | 'outside';
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

interface CreateVendorResponse {
  vendor: Vendor;
  gallery_data?: GalleryVendorData;
  outside_data?: OutsideVendorData;
}

// Creates a new vendor with specialized data.
export const createVendor = api<CreateVendorRequest, CreateVendorResponse>(
  { expose: true, method: "POST", path: "/vendors" },
  async (req) => {
    await vendorDB.exec`BEGIN`;
    
    try {
      const vendor = await vendorDB.queryRow<Vendor>`
        INSERT INTO vendors (name, contact_number, email, vendor_type)
        VALUES (${req.name}, ${req.contact_number}, ${req.email}, ${req.vendor_type})
        RETURNING *
      `;
      
      if (!vendor) {
        throw new Error("Failed to create vendor");
      }
      
      let galleryData: GalleryVendorData | undefined;
      let outsideData: OutsideVendorData | undefined;
      
      if (req.vendor_type === 'gallery' && req.gallery_data) {
        galleryData = await vendorDB.queryRow<GalleryVendorData>`
          INSERT INTO gallery_vendor_data (vendor_id, gallery_name, shop_number, category_authorization)
          VALUES (${vendor.id}, ${req.gallery_data.gallery_name}, ${req.gallery_data.shop_number}, ${req.gallery_data.category_authorization})
          RETURNING *
        `;
      } else if (req.vendor_type === 'outside' && req.outside_data) {
        outsideData = await vendorDB.queryRow<OutsideVendorData>`
          INSERT INTO outside_vendor_data (vendor_id, home_address, service_area_coverage, pickup_points)
          VALUES (${vendor.id}, ${req.outside_data.home_address}, ${req.outside_data.service_area_coverage}, ${req.outside_data.pickup_points})
          RETURNING *
        `;
      }
      
      await vendorDB.exec`COMMIT`;
      
      return {
        vendor,
        gallery_data: galleryData,
        outside_data: outsideData
      };
    } catch (error) {
      await vendorDB.exec`ROLLBACK`;
      throw error;
    }
  }
);
