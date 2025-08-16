import { api } from "encore.dev/api";
import { referralDB } from "./db";

interface CreateReferralRequest {
  listing_id: number;
  sharer_name: string;
  sharer_phone: string;
}

interface CreateReferralResponse {
  referral_code: string;
  whatsapp_link: string;
}

// Creates a new referral link for sharing a listing.
export const createReferral = api<CreateReferralRequest, CreateReferralResponse>(
  { expose: true, method: "POST", path: "/referrals" },
  async (req) => {
    const referralCode = generateReferralCode();
    
    // First, check if sharer exists, if not create them
    let sharer = await referralDB.queryRow<{ id: number }>`
      SELECT id FROM sharers WHERE contact_number = ${req.sharer_phone}
    `;
    
    if (!sharer) {
      sharer = await referralDB.queryRow<{ id: number }>`
        INSERT INTO sharers (name, contact_number)
        VALUES (${req.sharer_name}, ${req.sharer_phone})
        RETURNING id
      `;
    }
    
    if (!sharer) {
      throw new Error("Failed to create or find sharer");
    }
    
    await referralDB.exec`
      INSERT INTO referrals (referral_id, sharer_id, listing_id, points_earned)
      VALUES (${referralCode}, ${sharer.id}, ${req.listing_id}, 100)
    `;
    
    const listing = await referralDB.queryRow<any>`
      SELECT l.title, v.contact_number, v.name as vendor_name
      FROM listings l
      JOIN vendors v ON l.vendor_id = v.id
      WHERE l.id = ${req.listing_id}
    `;
    
    const baseUrl = process.env.NODE_ENV === 'production' 
      ? 'https://getpaid.bi' 
      : 'http://localhost:3000';
    
    const referralUrl = `${baseUrl}/listing/${req.listing_id}?ref=${referralCode}`;
    const whatsappNumber = listing?.contact_number;
    const message = `Murakoze! Check out this great offer: ${listing?.title} from ${listing?.vendor_name}. ${referralUrl}`;
    const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    
    return {
      referral_code: referralCode,
      whatsapp_link: whatsappLink
    };
  }
);

function generateReferralCode(): string {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
}
