import { api } from "encore.dev/api";
import { listingDB } from "./db";
import type { Gallery } from "./types";

interface ListGalleriesResponse {
  galleries: Gallery[];
}

// Retrieves all galleries with their zones and locations.
export const listGalleries = api<void, ListGalleriesResponse>(
  { expose: true, method: "GET", path: "/galleries" },
  async () => {
    const galleries = await listingDB.queryAll<Gallery>`
      SELECT * FROM galleries ORDER BY name
    `;
    return { galleries };
  }
);
