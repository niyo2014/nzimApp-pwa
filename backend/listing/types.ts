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
}

export interface Referral {
  id: number;
  listing_id: number;
  sharer_name: string;
  sharer_phone: string;
  referral_code: string;
  clicks: number;
  is_sale_confirmed: boolean;
  commission_amount: number;
  commission_paid: boolean;
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
