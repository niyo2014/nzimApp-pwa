CREATE TABLE galleries (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  zone TEXT NOT NULL,
  description TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE shops (
  id BIGSERIAL PRIMARY KEY,
  gallery_id BIGINT REFERENCES galleries(id) ON DELETE CASCADE,
  shop_number TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  owner_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  whatsapp TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(gallery_id, shop_number)
);

CREATE TABLE categories (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  name_kirundi TEXT,
  name_french TEXT,
  icon TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

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

CREATE TABLE subscriptions (
  id BIGSERIAL PRIMARY KEY,
  reseller_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  plan_id BIGINT REFERENCES ad_plans(id) ON DELETE CASCADE,
  gallery_id BIGINT REFERENCES galleries(id),
  city TEXT,
  country TEXT,
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE listings (
  id BIGSERIAL PRIMARY KEY,
  shop_id BIGINT REFERENCES shops(id) ON DELETE CASCADE,
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
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE referrals (
  id BIGSERIAL PRIMARY KEY,
  listing_id BIGINT REFERENCES listings(id) ON DELETE CASCADE,
  sharer_name TEXT NOT NULL,
  sharer_phone TEXT NOT NULL,
  referral_code TEXT NOT NULL UNIQUE,
  clicks INTEGER DEFAULT 0,
  is_sale_confirmed BOOLEAN DEFAULT false,
  gifts_points_earned INTEGER DEFAULT 0,
  gifts_points_paid BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  confirmed_at TIMESTAMP
);

CREATE TABLE sales (
  id BIGSERIAL PRIMARY KEY,
  listing_id BIGINT REFERENCES listings(id) ON DELETE CASCADE,
  referral_id BIGINT REFERENCES referrals(id),
  buyer_name TEXT,
  buyer_phone TEXT,
  sale_amount BIGINT NOT NULL,
  proof_image TEXT,
  vendor_confirmed BOOLEAN DEFAULT false,
  buyer_confirmed BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE wanted_matches (
  id BIGSERIAL PRIMARY KEY,
  wanted_listing_id BIGINT REFERENCES listings(id) ON DELETE CASCADE,
  offering_listing_id BIGINT REFERENCES listings(id) ON DELETE CASCADE,
  buyer_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  vendor_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  is_contact_revealed BOOLEAN DEFAULT false,
  reveal_fee_paid BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO categories (name, name_kirundi, name_french, icon) VALUES
('Electronics', 'Ibikoresho bya elegitoronike', 'Électronique', 'smartphone'),
('Clothing', 'Imyenda', 'Vêtements', 'shirt'),
('Food & Beverages', 'Ibiryo n''ibinyobwa', 'Nourriture et boissons', 'utensils'),
('Home & Garden', 'Inzu n''ubusitani', 'Maison et jardin', 'home'),
('Vehicles', 'Ibinyabiziga', 'Véhicules', 'car'),
('Services', 'Serivisi', 'Services', 'briefcase'),
('Beauty & Health', 'Ubwiza n''ubuzima', 'Beauté et santé', 'heart'),
('Sports & Recreation', 'Siporo n''imyidagaduro', 'Sports et loisirs', 'trophy');

INSERT INTO galleries (name, zone, description, latitude, longitude) VALUES
('Bujumbura Central Gallery', 'Bujumbura Mairie', 'Main commercial gallery in downtown Bujumbura', -3.3761, 29.3611),
('Kamenge Market Gallery', 'Kamenge', 'Local market gallery serving Kamenge community', -3.3500, 29.3400),
('Ngagara Commercial Center', 'Ngagara', 'Modern shopping center in Ngagara', -3.3600, 29.3700);

INSERT INTO ad_plans (name, description, price, duration_days, max_images, is_boosted, geographic_scope) VALUES
('Basic Gallery', 'Basic listing for one gallery', 5000, 30, 3, false, 'gallery'),
('Premium Gallery', 'Premium listing with boost for one gallery', 15000, 30, 10, true, 'gallery'),
('City Wide', 'Listing visible across entire city', 25000, 30, 5, false, 'city'),
('Country Wide', 'National visibility listing', 50000, 30, 8, true, 'country');

INSERT INTO users (name, phone, user_type) VALUES
('System Admin', '+25779000000', 'admin'),
('Gallery Reseller', '+25779111111', 'reseller'),
('Sample Vendor', '+25779222222', 'vendor'),
('Sample Buyer', '+25779333333', 'buyer');
