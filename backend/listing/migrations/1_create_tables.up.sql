-- Create vendors table (central entity)
CREATE TABLE vendors (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  contact_number TEXT NOT NULL UNIQUE,
  email TEXT,
  vendor_type TEXT NOT NULL CHECK (vendor_type IN ('gallery', 'outside')),
  kyc_status TEXT NOT NULL DEFAULT 'pending' CHECK (kyc_status IN ('pending', 'verified', 'rejected')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'inactive')),
  payment_preferences TEXT,
  whatsapp_link TEXT,
  trust_score INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create gallery vendor data (specialized data for gallery vendors)
CREATE TABLE gallery_vendor_data (
  vendor_id BIGINT PRIMARY KEY REFERENCES vendors(id) ON DELETE CASCADE,
  gallery_name TEXT NOT NULL,
  shop_number TEXT NOT NULL,
  category_authorization TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(gallery_name, shop_number)
);

-- Create outside vendor data (specialized data for outside vendors)
CREATE TABLE outside_vendor_data (
  vendor_id BIGINT PRIMARY KEY REFERENCES vendors(id) ON DELETE CASCADE,
  home_address TEXT NOT NULL,
  service_area_coverage TEXT NOT NULL,
  pickup_points TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create buyers table
CREATE TABLE buyers (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  contact_number TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create categories table
CREATE TABLE categories (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  name_kirundi TEXT,
  name_french TEXT,
  icon TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create listings table
CREATE TABLE listings (
  id BIGSERIAL PRIMARY KEY,
  vendor_id BIGINT REFERENCES vendors(id) ON DELETE CASCADE,
  category_id BIGINT REFERENCES categories(id),
  title TEXT NOT NULL,
  description TEXT,
  price BIGINT NOT NULL,
  currency TEXT DEFAULT 'BIF',
  images TEXT[],
  is_active BOOLEAN DEFAULT true,
  is_boosted BOOLEAN DEFAULT false,
  boost_expires_at TIMESTAMP,
  listing_type TEXT NOT NULL DEFAULT 'offering' CHECK (listing_type IN ('offering', 'wanted')),
  contact_hidden BOOLEAN DEFAULT false,
  trust_score INTEGER DEFAULT 0,
  duration_days INTEGER DEFAULT 30,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'reserved', 'completed', 'expired')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create transactions table
CREATE TABLE transactions (
  id BIGSERIAL PRIMARY KEY,
  buyer_id BIGINT REFERENCES buyers(id) ON DELETE CASCADE,
  vendor_id BIGINT REFERENCES vendors(id) ON DELETE CASCADE,
  listing_id BIGINT REFERENCES listings(id) ON DELETE CASCADE,
  amount BIGINT NOT NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'mobile_money')),
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled', 'disputed')),
  pickup_date TIMESTAMP,
  delivery_address TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create sharers table
CREATE TABLE sharers (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  contact_number TEXT NOT NULL UNIQUE,
  gift_points INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create referrals table
CREATE TABLE referrals (
  id BIGSERIAL PRIMARY KEY,
  referral_id TEXT NOT NULL UNIQUE,
  sharer_id BIGINT REFERENCES sharers(id) ON DELETE CASCADE,
  listing_id BIGINT REFERENCES listings(id) ON DELETE CASCADE,
  transaction_id BIGINT REFERENCES transactions(id),
  click_timestamp TIMESTAMP,
  sale_confirmation_timestamp TIMESTAMP,
  points_earned INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create ad_resellers table
CREATE TABLE ad_resellers (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  reseller_type TEXT NOT NULL CHECK (reseller_type IN ('gallery', 'city', 'country')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create trust_scores table
CREATE TABLE trust_scores (
  vendor_id BIGINT PRIMARY KEY REFERENCES vendors(id) ON DELETE CASCADE,
  score INTEGER NOT NULL DEFAULT 0,
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create wanted_listings table
CREATE TABLE wanted_listings (
  id BIGSERIAL PRIMARY KEY,
  buyer_id BIGINT REFERENCES buyers(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  category TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'fulfilled', 'expired')),
  vendor_fee_paid BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create reservations table (for gallery vendor flow)
CREATE TABLE reservations (
  id BIGSERIAL PRIMARY KEY,
  listing_id BIGINT REFERENCES listings(id) ON DELETE CASCADE,
  buyer_id BIGINT REFERENCES buyers(id) ON DELETE CASCADE,
  vendor_id BIGINT REFERENCES vendors(id) ON DELETE CASCADE,
  pickup_date TIMESTAMP NOT NULL,
  pickup_time TEXT NOT NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'mobile_money')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'completed', 'cancelled')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create orders table (for outside vendor flow)
CREATE TABLE orders (
  id BIGSERIAL PRIMARY KEY,
  listing_id BIGINT REFERENCES listings(id) ON DELETE CASCADE,
  buyer_id BIGINT REFERENCES buyers(id) ON DELETE CASCADE,
  vendor_id BIGINT REFERENCES vendors(id) ON DELETE CASCADE,
  delivery_address TEXT NOT NULL,
  contact_info TEXT NOT NULL,
  payment_method TEXT NOT NULL DEFAULT 'mobile_money',
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'authorized', 'confirmed', 'failed')),
  order_status TEXT NOT NULL DEFAULT 'pending' CHECK (order_status IN ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
  amount BIGINT NOT NULL,
  afripay_transaction_id TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create notifications table
CREATE TABLE notifications (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL,
  user_type TEXT NOT NULL CHECK (user_type IN ('vendor', 'buyer', 'sharer', 'admin')),
  type TEXT NOT NULL CHECK (type IN ('reservation', 'payment', 'order_status', 'wanted_match', 'points_credited', 'dispute')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  related_id BIGINT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create users table (for backward compatibility)
CREATE TABLE users (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL UNIQUE,
  email TEXT,
  user_type TEXT NOT NULL CHECK (user_type IN ('admin', 'reseller', 'vendor', 'buyer', 'sharer')),
  trust_score INTEGER DEFAULT 0,
  gifts_points INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create ad_plans table
CREATE TABLE ad_plans (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price BIGINT NOT NULL,
  duration_days INTEGER NOT NULL,
  max_images INTEGER NOT NULL,
  is_boosted BOOLEAN DEFAULT false,
  geographic_scope TEXT NOT NULL CHECK (geographic_scope IN ('gallery', 'city', 'country')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create subscriptions table
CREATE TABLE subscriptions (
  id BIGSERIAL PRIMARY KEY,
  reseller_id BIGINT REFERENCES ad_resellers(id) ON DELETE CASCADE,
  plan_id BIGINT REFERENCES ad_plans(id) ON DELETE CASCADE,
  gallery_id BIGINT,
  city TEXT,
  country TEXT,
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create wanted_matches table
CREATE TABLE wanted_matches (
  id BIGSERIAL PRIMARY KEY,
  wanted_listing_id BIGINT REFERENCES wanted_listings(id) ON DELETE CASCADE,
  offering_listing_id BIGINT REFERENCES listings(id) ON DELETE CASCADE,
  buyer_id BIGINT REFERENCES buyers(id) ON DELETE CASCADE,
  vendor_id BIGINT REFERENCES vendors(id) ON DELETE CASCADE,
  is_contact_revealed BOOLEAN DEFAULT false,
  reveal_fee_paid BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample categories
INSERT INTO categories (name, name_kirundi, name_french, icon) VALUES
('Electronics', 'Ibikoresho bya elegitoronike', 'Électronique', 'smartphone'),
('Clothing', 'Imyenda', 'Vêtements', 'shirt'),
('Food & Beverages', 'Ibiryo n''ibinyobwa', 'Nourriture et boissons', 'utensils'),
('Home & Garden', 'Inzu n''ubusitani', 'Maison et jardin', 'home'),
('Vehicles', 'Ibinyabiziga', 'Véhicules', 'car'),
('Services', 'Serivisi', 'Services', 'briefcase'),
('Beauty & Health', 'Ubwiza n''ubuzima', 'Beauté et santé', 'heart'),
('Sports & Recreation', 'Siporo n''imyidagaduro', 'Sports et loisirs', 'trophy');

-- Insert sample ad plans
INSERT INTO ad_plans (name, description, price, duration_days, max_images, is_boosted, geographic_scope) VALUES
('Basic Gallery', 'Basic listing for one gallery', 5000, 30, 3, false, 'gallery'),
('Premium Gallery', 'Premium listing with boost for one gallery', 15000, 30, 10, true, 'gallery'),
('City Wide', 'Listing visible across entire city', 25000, 30, 5, false, 'city'),
('Country Wide', 'National visibility listing', 50000, 30, 8, true, 'country');

-- Insert sample users for backward compatibility
INSERT INTO users (name, phone, user_type) VALUES
('System Admin', '+25779000000', 'admin'),
('Gallery Reseller', '+25779111111', 'reseller'),
('Sample Vendor', '+25779222222', 'vendor'),
('Sample Buyer', '+25779333333', 'buyer');

-- Create indexes for better performance
CREATE INDEX idx_listings_vendor_id ON listings(vendor_id);
CREATE INDEX idx_listings_category_id ON listings(category_id);
CREATE INDEX idx_listings_status ON listings(status);
CREATE INDEX idx_transactions_buyer_id ON transactions(buyer_id);
CREATE INDEX idx_transactions_vendor_id ON transactions(vendor_id);
CREATE INDEX idx_transactions_listing_id ON transactions(listing_id);
CREATE INDEX idx_referrals_sharer_id ON referrals(sharer_id);
CREATE INDEX idx_referrals_listing_id ON referrals(listing_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
