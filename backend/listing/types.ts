export interface Gallery {
  id: number;
  name: string;
  zone: string;
  description?: string;
  latitude?: number;
  longitude?: number;
  created_at: Date;
}

export interface Shop {
  id: number;
  gallery_id: number;
  shop_number: string;
  name: string;
  description?: string;
  owner_name: string;
  phone: string;
  whatsapp?: string;
  created_at: Date;
}

export interface Category {
  id: number;
  name: string;
  name_kirundi?: string;
  name_french?: string;
  icon?: string;
  created_at: Date;
}

export interface Listing {
  id: number;
  shop_id: number;
  category_id?: number;
  title: string;
  description?: string;
  price: number;
  currency: string;
  images: string[];
  is_active: boolean;
  is_boosted: boolean;
  boost_expires_at?: Date;
  created_at: Date;
  updated_at: Date;
  listing_type: 'offering' | 'wanted';
  contact_hidden: boolean;
  trust_score: number;
}

export interface Referral {
  id: number;
  listing_id: number;
  sharer_name: string;
  sharer_phone: string;
  referral_code: string;
  clicks: number;
  is_sale_confirmed: boolean;
  gifts_points_earned: number;
  gifts_points_paid: boolean;
  created_at: Date;
  confirmed_at?: Date;
}

export interface Sale {
  id: number;
  listing_id: number;
  referral_id?: number;
  buyer_name?: string;
  buyer_phone?: string;
  sale_amount: number;
  proof_image?: string;
  vendor_confirmed: boolean;
  buyer_confirmed: boolean;
  created_at: Date;
}

export interface ListingWithDetails extends Listing {
  shop: Shop;
  gallery: Gallery;
  category?: Category;
}

export interface User {
  id: number;
  name: string;
  phone: string;
  email?: string;
  user_type: 'admin' | 'reseller' | 'vendor' | 'buyer' | 'sharer';
  trust_score: number;
  gifts_points: number;
  created_at: Date;
}

export interface AdPlan {
  id: number;
  name: string;
  description: string;
  price: number;
  duration_days: number;
  max_images: number;
  is_boosted: boolean;
  geographic_scope: 'gallery' | 'city' | 'country';
  created_at: Date;
}

export interface Subscription {
  id: number;
  reseller_id: number;
  plan_id: number;
  gallery_id?: number;
  city?: string;
  country?: string;
  start_date: Date;
  end_date: Date;
  is_active: boolean;
  created_at: Date;
}

export interface WantedMatch {
  id: number;
  wanted_listing_id: number;
  offering_listing_id: number;
  buyer_id: number;
  vendor_id: number;
  is_contact_revealed: boolean;
  reveal_fee_paid: boolean;
  created_at: Date;
}
