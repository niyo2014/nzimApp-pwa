-- Add sample shops to existing galleries
INSERT INTO shops (gallery_id, shop_number, name, description, owner_name, phone, whatsapp) VALUES
(1, 'A001', 'Tech Solutions', 'Electronics and mobile accessories', 'Jean Baptiste', '+25779111001', '+25779111001'),
(1, 'A002', 'Fashion Corner', 'Latest fashion trends and clothing', 'Marie Claire', '+25779111002', '+25779111002'),
(1, 'A003', 'Food Paradise', 'Fresh groceries and local delicacies', 'Pierre Nkurunziza', '+25779111003', '+25779111003'),
(2, 'B001', 'Kamenge Electronics', 'Affordable electronics for everyone', 'Esperance Ndayishimiye', '+25779222001', '+25779222001'),
(2, 'B002', 'Beauty & Health Hub', 'Cosmetics and health products', 'Grace Uwimana', '+25779222002', '+25779222002'),
(3, 'C001', 'Modern Living', 'Home and garden supplies', 'David Niyonzima', '+25779333001', '+25779333001'),
(3, 'C002', 'Sports Zone', 'Sports equipment and recreation', 'Emmanuel Hakizimana', '+25779333002', '+25779333002');

-- Add sample listings
INSERT INTO listings (shop_id, category_id, title, description, price, currency, images, listing_type, is_boosted, trust_score) VALUES
(1, 1, 'Samsung Galaxy A54', 'Brand new Samsung Galaxy A54 with 128GB storage, excellent camera quality', 450000, 'BIF', ARRAY['https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400'], 'offering', true, 5),
(1, 1, 'iPhone 13 Pro', 'Used iPhone 13 Pro in excellent condition, 256GB storage', 850000, 'BIF', ARRAY['https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400'], 'offering', false, 8),
(2, 2, 'Designer Dress', 'Beautiful evening dress, perfect for special occasions', 75000, 'BIF', ARRAY['https://images.unsplash.com/photo-1566479179817-c0b8b8b6b8b8?w=400'], 'offering', false, 3),
(2, 2, 'Men''s Suit', 'Professional business suit, size L, excellent quality', 120000, 'BIF', ARRAY['https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400'], 'offering', true, 6),
(3, 3, 'Fresh Vegetables', 'Daily fresh vegetables from local farms', 5000, 'BIF', ARRAY['https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400'], 'offering', false, 4),
(4, 1, 'Laptop Repair Service', 'Professional laptop repair and maintenance services', 25000, 'BIF', ARRAY['https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400'], 'offering', false, 7),
(5, 7, 'Skincare Set', 'Complete skincare routine with natural ingredients', 35000, 'BIF', ARRAY['https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400'], 'offering', false, 5),
(6, 4, 'Garden Tools Set', 'Complete set of gardening tools for home use', 45000, 'BIF', ARRAY['https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400'], 'offering', false, 2),
(7, 8, 'Football Boots', 'Professional football boots, size 42', 65000, 'BIF', ARRAY['https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=400'], 'offering', true, 4);

-- Add some wanted listings
INSERT INTO listings (shop_id, category_id, title, description, price, currency, listing_type, contact_hidden, trust_score) VALUES
(1, 1, 'Looking for MacBook Pro', 'Need a MacBook Pro 2020 or newer for graphic design work', 1200000, 'BIF', 'wanted', true, 0),
(2, 2, 'Wedding Dress Needed', 'Looking for a beautiful wedding dress, size M', 200000, 'BIF', 'wanted', false, 0),
(3, 5, 'Used Car Wanted', 'Looking for a reliable used car, preferably Toyota or Honda', 8000000, 'BIF', 'wanted', true, 0),
(4, 6, 'House Cleaning Service', 'Need regular house cleaning service, 2-3 times per week', 50000, 'BIF', 'wanted', false, 0);
