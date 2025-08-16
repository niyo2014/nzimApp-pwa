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
  vendor_id: number;
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
  duration_days: number;
  status: 'active' | 'reserved' | 'completed' | 'expired';
}

export interface Vendor {
  id: number;
  name: string;
  contact_number: string;
  email?: string;
  vendor_type: 'gallery' | 'outside';
  kyc_status: 'pending' | 'verified' | 'rejected';
  status: 'active' | 'suspended' | 'inactive';
  payment_preferences?: string;
  whatsapp_link?: string;
  trust_score: number;
  created_at: Date;
  updated_at: Date;
}

export interface GalleryVendorData {
  vendor_id: number;
  gallery_name: string;
  shop_number: string;
  category_authorization?: string;
  created_at: Date;
}

export interface OutsideVendorData {
  vendor_id: number;
  home_address: string;
  service_area_coverage: string;
  pickup_points?: string;
  created_at: Date;
}

export interface Buyer {
  id: number;
  name: string;
  contact_number: string;
  created_at: Date;
}

export interface Transaction {
  id: number;
  buyer_id: number;
  vendor_id: number;
  listing_id: number;
  amount: number;
  payment_method: 'cash' | 'mobile_money';
  timestamp: Date;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'disputed';
  pickup_date?: Date;
  delivery_address?: string;
  created_at: Date;
}

export interface Sharer {
  id: number;
  name: string;
  contact_number: string;
  gift_points: number;
  created_at: Date;
}

export interface Referral {
  id: number;
  referral_id: string;
  sharer_id: number;
  listing_id: number;
  transaction_id?: number;
  click_timestamp?: Date;
  sale_confirmation_timestamp?: Date;
  points_earned: number;
  created_at: Date;
}

export interface AdReseller {
  id: number;
  name: string;
  reseller_type: 'gallery' | 'city' | 'country';
  created_at: Date;
}

export interface TrustScore {
  vendor_id: number;
  score: number;
  last_updated: Date;
}

export interface WantedListing {
  id: number;
  buyer_id: number;
  description: string;
  category?: string;
  status: 'active' | 'fulfilled' | 'expired';
  vendor_fee_paid: boolean;
  created_at: Date;
}

export interface Reservation {
  id: number;
  listing_id: number;
  buyer_id: number;
  vendor_id: number;
  pickup_date: Date;
  pickup_time: string;
  payment_method: 'cash' | 'mobile_money';
  status: 'pending' | 'accepted' | 'rejected' | 'completed' | 'cancelled';
  created_at: Date;
  updated_at: Date;
}

export interface Order {
  id: number;
  listing_id: number;
  buyer_id: number;
  vendor_id: number;
  delivery_address: string;
  contact_info: string;
  payment_method: 'mobile_money';
  payment_status: 'pending' | 'authorized' | 'confirmed' | 'failed';
  order_status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  amount: number;
  afripay_transaction_id?: string;
  created_at: Date;
  updated_at: Date;
}

export interface Notification {
  id: number;
  user_id: number;
  user_type: 'vendor' | 'buyer' | 'sharer' | 'admin';
  type: 'reservation' | 'payment' | 'order_status' | 'wanted_match' | 'points_credited' | 'dispute';
  title: string;
  message: string;
  is_read: boolean;
  related_id?: number;
  created_at: Date;
}

export interface ListingWithDetails extends Listing {
  vendor: Vendor;
  gallery_data?: GalleryVendorData;
  outside_data?: OutsideVendorData;
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
