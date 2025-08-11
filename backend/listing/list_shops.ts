import { api } from "encore.dev/api";
import { Query } from "encore.dev/api";
import { listingDB } from "./db";
import type { Shop } from "./types";

interface ListShopsParams {
  gallery_id?: Query<number>;
}

interface ListShopsResponse {
  shops: Shop[];
}

// Retrieves shops, optionally filtered by gallery.
export const listShops = api<ListShopsParams, ListShopsResponse>(
  { expose: true, method: "GET", path: "/shops" },
  async (params) => {
    let shops: Shop[];
    
    if (params.gallery_id) {
      shops = await listingDB.queryAll<Shop>`
        SELECT * FROM shops 
        WHERE gallery_id = ${params.gallery_id}
        ORDER BY shop_number
      `;
    } else {
      shops = await listingDB.queryAll<Shop>`
        SELECT * FROM shops ORDER BY shop_number
      `;
    }
    
    return { shops };
  }
);
