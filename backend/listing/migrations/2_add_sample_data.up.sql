-- Insert sample vendors
INSERT INTO vendors (name, contact_number, email, vendor_type, kyc_status, status, trust_score) VALUES
('Jean Baptiste Electronics', '+25779111001', 'jean@example.com', 'gallery', 'verified', 'active', 85),
('Marie Claire Fashion', '+25779111002', 'marie@example.com', 'gallery', 'verified', 'active', 92),
('Pierre Food Paradise', '+25779111003', 'pierre@example.com', 'gallery', 'verified', 'active', 78),
('Esperance Electronics', '+25779222001', 'esperance@example.com', 'gallery', 'verified', 'active', 88),
('Grace Beauty Hub', '+25779222002', 'grace@example.com', 'gallery', 'verified', 'active', 95),
('David Modern Living', '+25779333001', 'david@example.com', 'outside', 'verified', 'active', 82),
('Emmanuel Sports Zone', '+25779333002', 'emmanuel@example.com', 'outside', 'verified', 'active', 90);

-- Insert gallery vendor data
INSERT INTO gallery_vendor_data (vendor_id, gallery_name, shop_number, category_authorization) VALUES
(1, 'Bujumbura Central Gallery', 'A001', 'Electronics'),
(2, 'Bujumbura Central Gallery', 'A002', 'Clothing'),
(3, 'Bujumbura Central Gallery', 'A003', 'Food & Beverages'),
(4, 'Kamenge Market Gallery', 'B001', 'Electronics'),
(5, 'Kamenge Market Gallery', 'B002', 'Beauty & Health');

-- Insert outside vendor data
INSERT INTO outside_vendor_data (vendor_id, home_address, service_area_coverage, pickup_points) VALUES
(6, 'Ngagara, Bujumbura', 'Bujumbura City', 'Ngagara Center, City Center'),
(7, 'Rohero, Bujumbura', 'Bujumbura Province', 'Rohero Stadium, Central Market');

-- Insert sample buyers
INSERT INTO buyers (name, contact_number) VALUES
('Alice Uwimana', '+25779444001'),
('Bob Nkurunziza', '+25779444002'),
('Carol Ndayishimiye', '+25779444003'),
('Daniel Hakizimana', '+25779444004');

-- Insert sample sharers
INSERT INTO sharers (name, contact_number, gift_points) VALUES
('Frank Niyonzima', '+25779555001', 250),
('Grace Uwimana', '+25779555002', 180),
('Henry Bizimana', '+25779555003', 320);

-- Insert sample listings
INSERT INTO listings (vendor_id, category_id, title, description, price, currency, images, listing_type, is_boosted, trust_score, duration_days, status) VALUES
(1, 1, 'Samsung Galaxy A54', 'Brand new Samsung Galaxy A54 with 128GB storage, excellent camera quality', 450000, 'BIF', ARRAY['https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400'], 'offering', true, 5, 30, 'active'),
(1, 1, 'iPhone 13 Pro', 'Used iPhone 13 Pro in excellent condition, 256GB storage', 850000, 'BIF', ARRAY['https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400'], 'offering', false, 8, 30, 'active'),
(2, 2, 'Designer Dress', 'Beautiful evening dress, perfect for special occasions', 75000, 'BIF', ARRAY['https://images.unsplash.com/photo-1566479179817-c0b8b8b6b8b8?w=400'], 'offering', false, 3, 30, 'active'),
(2, 2, 'Men''s Suit', 'Professional business suit, size L, excellent quality', 120000, 'BIF', ARRAY['https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400'], 'offering', true, 6, 30, 'active'),
(3, 3, 'Fresh Vegetables', 'Daily fresh vegetables from local farms', 5000, 'BIF', ARRAY['https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400'], 'offering', false, 4, 30, 'active'),
(4, 1, 'Laptop Repair Service', 'Professional laptop repair and maintenance services', 25000, 'BIF', ARRAY['https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400'], 'offering', false, 7, 30, 'active'),
(5, 7, 'Skincare Set', 'Complete skincare routine with natural ingredients', 35000, 'BIF', ARRAY['https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400'], 'offering', false, 5, 30, 'active'),
(6, 4, 'Garden Tools Set', 'Complete set of gardening tools for home use', 45000, 'BIF', ARRAY['https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400'], 'offering', false, 2, 30, 'active'),
(7, 8, 'Football Boots', 'Professional football boots, size 42', 65000, 'BIF', ARRAY['https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=400'], 'offering', true, 4, 30, 'active');

-- Insert some wanted listings
INSERT INTO wanted_listings (buyer_id, description, category, status) VALUES
(1, 'Looking for MacBook Pro 2020 or newer for graphic design work', 'Electronics', 'active'),
(2, 'Need a beautiful wedding dress, size M', 'Clothing', 'active'),
(3, 'Looking for a reliable used car, preferably Toyota or Honda', 'Vehicles', 'active'),
(4, 'Need regular house cleaning service, 2-3 times per week', 'Services', 'active');

-- Insert sample transactions
INSERT INTO transactions (buyer_id, vendor_id, listing_id, amount, payment_method, status) VALUES
(1, 1, 1, 450000, 'mobile_money', 'completed'),
(2, 2, 3, 75000, 'cash', 'completed'),
(3, 6, 8, 45000, 'mobile_money', 'pending');

-- Insert sample referrals
INSERT INTO referrals (referral_id, sharer_id, listing_id, transaction_id, click_timestamp, sale_confirmation_timestamp, points_earned) VALUES
('REF001ABC', 1, 1, 1, CURRENT_TIMESTAMP - INTERVAL '2 days', CURRENT_TIMESTAMP - INTERVAL '1 day', 100),
('REF002DEF', 2, 3, 2, CURRENT_TIMESTAMP - INTERVAL '3 days', CURRENT_TIMESTAMP - INTERVAL '2 days', 100);

-- Insert sample reservations
INSERT INTO reservations (listing_id, buyer_id, vendor_id, pickup_date, pickup_time, payment_method, status) VALUES
(2, 1, 1, CURRENT_TIMESTAMP + INTERVAL '1 day', '14:00', 'cash', 'accepted'),
(4, 2, 2, CURRENT_TIMESTAMP + INTERVAL '2 days', '10:30', 'mobile_money', 'pending');

-- Insert sample orders
INSERT INTO orders (listing_id, buyer_id, vendor_id, delivery_address, contact_info, amount, payment_status, order_status) VALUES
(8, 3, 6, 'Ngagara, Zone 1, House 123', '+25779444003', 45000, 'confirmed', 'shipped');

-- Insert sample notifications
INSERT INTO notifications (user_id, user_type, type, title, message, related_id) VALUES
(1, 'vendor', 'reservation', 'New Reservation Request', 'You have a new reservation request for Samsung Galaxy A54', 1),
(1, 'buyer', 'reservation', 'Reservation Confirmed', 'Your reservation for iPhone 13 Pro has been confirmed', 1),
(3, 'buyer', 'order_status', 'Order Shipped', 'Your order for Garden Tools Set has been shipped', 1),
(1, 'sharer', 'points_credited', 'Points Credited', 'You earned 100 gift points from a confirmed sale', 1);

-- Update trust scores
INSERT INTO trust_scores (vendor_id, score, last_updated) VALUES
(1, 85, CURRENT_TIMESTAMP),
(2, 92, CURRENT_TIMESTAMP),
(3, 78, CURRENT_TIMESTAMP),
(4, 88, CURRENT_TIMESTAMP),
(5, 95, CURRENT_TIMESTAMP),
(6, 82, CURRENT_TIMESTAMP),
(7, 90, CURRENT_TIMESTAMP);
