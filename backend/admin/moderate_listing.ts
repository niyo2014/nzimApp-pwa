import { api } from "encore.dev/api";
import { adminDB } from "./db";

interface ModerateListing {
  listing_id: number;
  action: 'approve' | 'reject' | 'flag';
  reason?: string;
}

// Moderates a listing (approve, reject, or flag).
export const moderateListing = api<ModerateListing, void>(
  { expose: true, method: "POST", path: "/admin/moderate" },
  async (req) => {
    if (req.action === 'approve') {
      await adminDB.exec`
        UPDATE listings 
        SET is_active = true 
        WHERE id = ${req.listing_id}
      `;
    } else if (req.action === 'reject') {
      await adminDB.exec`
        UPDATE listings 
        SET is_active = false 
        WHERE id = ${req.listing_id}
      `;
    }
    
    // In a real implementation, you might want to log moderation actions
    // or send notifications to users
  }
);
