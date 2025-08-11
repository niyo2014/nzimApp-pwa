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
    
    await referralDB.exec`
      INSERT INTO referrals (listing_id, sharer_name, sharer_phone, referral_code, commission_amount)
      VALUES (${req.listing_id}, ${req.sharer_name}, ${req.sharer_phone}, ${referralCode}, 1000)
    `;
    
    const listing = await referralDB.queryRow<any>`
      SELECT l.title, s.whatsapp, s.phone, s.name as shop_name
      FROM listings l
      JOIN shops s ON l.shop_id = s.id
      WHERE l.id = ${req.listing_id}
    `;
    
    const baseUrl = process.env.NODE_ENV === 'production' 
      ? 'https://getpaidconnect.com' 
      : 'http://localhost:3000';
    
    const referralUrl = `${baseUrl}/listing/${req.listing_id}?ref=${referralCode}`;
    const whatsappNumber = listing?.whatsapp || listing?.phone;
    const message = `Murakoze! Check out this great offer: ${listing?.title} from ${listing?.shop_name}. ${referralUrl}`;
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
