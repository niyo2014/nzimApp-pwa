import { api } from "encore.dev/api";
import { listingDB } from "./db";
import type { Shop } from "./types";

interface CreateShopRequest {
  gallery_id: number;
  shop_number: string;
  name: string;
  description?: string;
  owner_name: string;
  phone: string;
  whatsapp?: string;
}

// Creates a new shop in a gallery.
export const createShop = api<CreateShopRequest, Shop>(
  { expose: true, method: "POST", path: "/shops" },
  async (req) => {
    const shop = await listingDB.queryRow<Shop>`
      INSERT INTO shops (gallery_id, shop_number, name, description, owner_name, phone, whatsapp)
      VALUES (${req.gallery_id}, ${req.shop_number}, ${req.name}, ${req.description}, ${req.owner_name}, ${req.phone}, ${req.whatsapp})
      RETURNING *
    `;
    
    if (!shop) {
      throw new Error("Failed to create shop");
    }
    
    return shop;
  }
);
