import { api, APIError } from "encore.dev/api";
import { listingDB } from "./db";

interface DeleteListingParams {
  id: number;
}

// Deletes a listing.
export const deleteListing = api<DeleteListingParams, void>(
  { expose: true, method: "DELETE", path: "/listings/:id" },
  async (params) => {
    const result = await listingDB.exec`
      DELETE FROM listings WHERE id = ${params.id}
    `;
    
    // Note: In a real implementation, you might want to check if any rows were affected
    // PostgreSQL doesn't return affected rows count in this simple interface
  }
);
