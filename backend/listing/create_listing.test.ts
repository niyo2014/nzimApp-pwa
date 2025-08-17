import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { listingDB } from './db';
import { createListing } from './create_listing';

describe('createListing', () => {
  beforeEach(async () => {
    // Clean up test data
    await listingDB.exec`DELETE FROM listings WHERE title LIKE 'Test%'`;
    await listingDB.exec`DELETE FROM vendors WHERE name LIKE 'Test%'`;
    await listingDB.exec`DELETE FROM categories WHERE name LIKE 'Test%'`;
  });

  afterEach(async () => {
    // Clean up test data
    await listingDB.exec`DELETE FROM listings WHERE title LIKE 'Test%'`;
    await listingDB.exec`DELETE FROM vendors WHERE name LIKE 'Test%'`;
    await listingDB.exec`DELETE FROM categories WHERE name LIKE 'Test%'`;
  });

  it('should create a basic offering listing', async () => {
    // Create test vendor
    const vendor = await listingDB.queryRow<{ id: number }>`
      INSERT INTO vendors (name, contact_number, vendor_type)
      VALUES ('Test Vendor', '+25779123456', 'gallery')
      RETURNING id
    `;

    const request = {
      vendor_id: vendor!.id,
      title: 'Test Product',
      description: 'A test product description',
      price: 50000,
      currency: 'BIF',
      listing_type: 'offering' as const
    };

    const result = await createListing(request);

    expect(result).toBeDefined();
    expect(result.title).toBe('Test Product');
    expect(result.price).toBe(50000);
    expect(result.vendor_id).toBe(vendor!.id);
    expect(result.listing_type).toBe('offering');
    expect(result.is_active).toBe(true);
    expect(result.currency).toBe('BIF');
  });

  it('should create a wanted listing', async () => {
    // Create test vendor (buyer in this case)
    const vendor = await listingDB.queryRow<{ id: number }>`
      INSERT INTO vendors (name, contact_number, vendor_type)
      VALUES ('Test Buyer', '+25779123457', 'outside')
      RETURNING id
    `;

    const request = {
      vendor_id: vendor!.id,
      title: 'Test Wanted Item',
      description: 'Looking for this specific item',
      price: 30000,
      listing_type: 'wanted' as const
    };

    const result = await createListing(request);

    expect(result).toBeDefined();
    expect(result.title).toBe('Test Wanted Item');
    expect(result.listing_type).toBe('wanted');
    expect(result.vendor_id).toBe(vendor!.id);
  });

  it('should create listing with category', async () => {
    // Create test vendor and category
    const vendor = await listingDB.queryRow<{ id: number }>`
      INSERT INTO vendors (name, contact_number, vendor_type)
      VALUES ('Test Vendor Cat', '+25779123458', 'gallery')
      RETURNING id
    `;

    const category = await listingDB.queryRow<{ id: number }>`
      INSERT INTO categories (name)
      VALUES ('Test Category')
      RETURNING id
    `;

    const request = {
      vendor_id: vendor!.id,
      category_id: category!.id,
      title: 'Test Product with Category',
      price: 25000
    };

    const result = await createListing(request);

    expect(result).toBeDefined();
    expect(result.category_id).toBe(category!.id);
  });

  it('should create listing with images', async () => {
    // Create test vendor
    const vendor = await listingDB.queryRow<{ id: number }>`
      INSERT INTO vendors (name, contact_number, vendor_type)
      VALUES ('Test Vendor Images', '+25779123459', 'gallery')
      RETURNING id
    `;

    const request = {
      vendor_id: vendor!.id,
      title: 'Test Product with Images',
      price: 40000,
      images: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg']
    };

    const result = await createListing(request);

    expect(result).toBeDefined();
    expect(result.images).toEqual(['https://example.com/image1.jpg', 'https://example.com/image2.jpg']);
  });

  it('should set default values correctly', async () => {
    // Create test vendor
    const vendor = await listingDB.queryRow<{ id: number }>`
      INSERT INTO vendors (name, contact_number, vendor_type)
      VALUES ('Test Vendor Defaults', '+25779123460', 'gallery')
      RETURNING id
    `;

    const request = {
      vendor_id: vendor!.id,
      title: 'Test Product Defaults',
      price: 15000
    };

    const result = await createListing(request);

    expect(result).toBeDefined();
    expect(result.currency).toBe('BIF');
    expect(result.listing_type).toBe('offering');
    expect(result.contact_hidden).toBe(false);
    expect(result.duration_days).toBe(30);
    expect(result.images).toEqual([]);
  });

  it('should create wanted matches when offering matches wanted listings', async () => {
    // Create test vendors
    const vendor = await listingDB.queryRow<{ id: number }>`
      INSERT INTO vendors (name, contact_number, vendor_type)
      VALUES ('Test Vendor Match', '+25779123461', 'gallery')
      RETURNING id
    `;

    const buyer = await listingDB.queryRow<{ id: number }>`
      INSERT INTO buyers (name, contact_number)
      VALUES ('Test Buyer Match', '+25779123462')
      RETURNING id
    `;

    const category = await listingDB.queryRow<{ id: number }>`
      INSERT INTO categories (name)
      VALUES ('Test Match Category')
      RETURNING id
    `;

    // Create a wanted listing first
    await listingDB.exec`
      INSERT INTO wanted_listings (buyer_id, description, category, status)
      VALUES (${buyer!.id}, 'Looking for test item', ${category!.id.toString()}, 'active')
    `;

    // Create offering that should match
    const request = {
      vendor_id: vendor!.id,
      category_id: category!.id,
      title: 'Test Item',
      description: 'A test item for sale',
      price: 20000,
      listing_type: 'offering' as const
    };

    const result = await createListing(request);

    expect(result).toBeDefined();

    // Check if wanted match was created
    const match = await listingDB.queryRow<{ id: number }>`
      SELECT id FROM wanted_matches 
      WHERE offering_listing_id = ${result.id} AND vendor_id = ${vendor!.id}
    `;

    expect(match).toBeDefined();

    // Check if notification was created
    const notification = await listingDB.queryRow<{ id: number }>`
      SELECT id FROM notifications 
      WHERE user_id = ${buyer!.id} AND user_type = 'buyer' AND type = 'wanted_match'
    `;

    expect(notification).toBeDefined();
  });

  it('should throw error when vendor does not exist', async () => {
    const request = {
      vendor_id: 99999, // Non-existent vendor
      title: 'Test Product',
      price: 10000
    };

    await expect(createListing(request)).rejects.toThrow();
  });
});
