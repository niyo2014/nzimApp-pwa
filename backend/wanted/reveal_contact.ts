import { api } from "encore.dev/api";
import { wantedDB } from "./db";

interface RevealContactRequest {
  match_id: number;
  payment_confirmed: boolean;
}

interface RevealContactResponse {
  contact_revealed: boolean;
  vendor_contact?: {
    name: string;
    phone: string;
    whatsapp?: string;
  };
}

// Reveals vendor contact information after payment.
export const revealContact = api<RevealContactRequest, RevealContactResponse>(
  { expose: true, method: "POST", path: "/wanted/reveal-contact" },
  async (req) => {
    if (!req.payment_confirmed) {
      return { contact_revealed: false };
    }
    
    await wantedDB.exec`
      UPDATE wanted_matches 
      SET is_contact_revealed = true, reveal_fee_paid = true
      WHERE id = ${req.match_id}
    `;
    
    const vendorContact = await wantedDB.queryRow<any>`
      SELECT s.owner_name as name, s.phone, s.whatsapp
      FROM wanted_matches wm
      JOIN listings l ON wm.offering_listing_id = l.id
      JOIN shops s ON l.shop_id = s.id
      WHERE wm.id = ${req.match_id}
    `;
    
    return {
      contact_revealed: true,
      vendor_contact: vendorContact || undefined
    };
  }
);
