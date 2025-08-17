import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { listingDB } from './db';
import { getListing } from './get_listing';
import { APIError } from 'encore.dev/api';

describe('getListing', () => {
  let testListingId: number;
  let testVendorId: number;
  let testCategoryId: number;

  beforeEach(async () => {
    // Clean up test data
    await listingDB.exec`DELETE FROM listings WHERE title LIKE 'Test%'`;
    await listingDB.exec`DELETE FROM vendors WHERE name LIKE 'Test%'`;
    await listingDB.exec`DELETE FROM categories WHERE name LIKE 'Test%'`;

    // Create test data
    const vendor = await listingDB.queryRow<{ id: number }>`
      INSERT INTO vendors (name, contact_number, email, vendor_type, kyc_status, status, trust_score)
      VALUES ('Test Vendor Get', '+25779123470', 'test@example.com', 'gallery', 'verified', 'active', 85)
      RETURNING id
    `;
    testVendorId = vendor!.id;

    // Create gallery vendor data
    await listingDB.exec`
      INSERT INTO gallery_vendor_data (vendor_id, gallery_name, shop_number, category_authorization)
      VALUES (${testVendorId}, 'Test Gallery', 'A001', 'Electronics')
    `;

    const category = await listingDB.queryRow<{ id: number }>`
      INSERT INTO categories (name, name_kirundi, name_french, icon)
      VALUES ('Test Electronics', 'Ibikoresho bya elegitoronike', 'Électronique', 'smartphone')
      RETURNING id
    `;
    testCategoryId = category!.id;

    const listing = await listingDB.queryRow<{ id: number }>`
      INSERT INTO listings (vendor_id, category_id, title, description, price, currency, images, is_active, is_boosted, listing_type, trust_score)
      VALUES (${testVendorId}, ${testCategoryId}, 'Test Product Get', 'Test description', 75000, 'BIF', ARRAY['https://example.com/test.jpg'], true, true, 'offering', 5)
      RETURNING id
    `;
    testListingId = listing!.id;
  });

  afterEach(async () => {
    // Clean up test data
    await listingDB.exec`DELETE FROM listings WHERE title LIKE 'Test%'`;
    await listingDB.exec`DELETE FROM gallery_vendor_data WHERE vendor_id = ${testVendorId}`;
    await listingDB.exec`DELETE FROM vendors WHERE name LIKE 'Test%'`;
    await listingDB.exec`DELETE FROM categories WHERE name LIKE 'Test%'`;
  });

  it('should retrieve listing with full details', async () => {
    const result = await getListing({ id: testListingId });

    expect(result).toBeDefined();
    expect(result.id).toBe(testListingId);
    expect(result.title).toBe('Test Product Get');
    expect(result.description).toBe('Test description');
    expect(result.price).toBe(75000);
    expect(result.currency).toBe('BIF');
    expect(result.images).toEqual(['https://example.com/test.jpg']);
    expect(result.is_boosted).toBe(true);
    expect(result.listing_type).toBe('offering');
    expect(result.trust_score).toBe(5);
  });

  it('should include vendor details', async () => {
    const result = await getListing({ id: testListingId });

    expect(result.vendor).toBeDefined();
    expect(result.vendor.id).toBe(testVendorId);
    expect(result.vendor.name).toBe('Test Vendor Get');
    expect(result.vendor.contact_number).toBe('+25779123470');
    expect(result.vendor.email).toBe('test@example.com');
    expect(result.vendor.vendor_type).toBe('gallery');
    expect(result.vendor.kyc_status).toBe('verified');
    expect(result.vendor.status).toBe('active');
    expect(result.vendor.trust_score).toBe(85);
  });

  it('should include gallery data for gallery vendors', async () => {
    const result = await getListing({ id: testListingId });

    expect(result.gallery_data).toBeDefined();
    expect(result.gallery_data!.vendor_id).toBe(testVendorId);
    expect(result.gallery_data!.gallery_name).toBe('Test Gallery');
    expect(result.gallery_data!.shop_number).toBe('A001');
    expect(result.gallery_data!.category_authorization).toBe('Electronics');
  });

  it('should include category details', async () => {
    const result = await getListing({ id: testListingId });

    expect(result.category).toBeDefined();
    expect(result.category!.id).toBe(testCategoryId);
    expect(result.category!.name).toBe('Test Electronics');
    expect(result.category!.name_kirundi).toBe('Ibikoresho bya elegitoronike');
    expect(result.category!.name_french).toBe('Électronique');
    expect(result.category!.icon).toBe('smartphone');
  });

  it('should include outside data for outside vendors', async () => {
    // Create outside vendor
    const outsideVendor = await listingDB.queryRow<{ id: number }>`
      INSERT INTO vendors (name, contact_number, vendor_type)
      VALUES ('Test Outside Vendor', '+25779123471', 'outside')
      RETURNING id
    `;

    await listingDB.exec`
      INSERT INTO outside_vendor_data (vendor_id, home_address, service_area_coverage, pickup_points)
      VALUES (${outsideVendor!.id}, 'Test Address', 'Bujumbura City', 'Central Market')
    `;

    const outsideListing = await listingDB.queryRow<{ id: number }>`
      INSERT INTO listings (vendor_id, title, price, is_active)
      VALUES (${outsideVendor!.id}, 'Test Outside Product', 50000, true)
      RETURNING id
    `;

    const result = await getListing({ id: outsideListing!.id });

    expect(result.outside_data).toBeDefined();
    expect(result.outside_data!.vendor_id).toBe(outsideVendor!.id);
    expect(result.outside_data!.home_address).toBe('Test Address');
    expect(result.outside_data!.service_area_coverage).toBe('Bujumbura City');
    expect(result.outside_data!.pickup_points).toBe('Central Market');

    // Clean up
    await listingDB.exec`DELETE FROM listings WHERE id = ${outsideListing!.id}`;
    await listingDB.exec`DELETE FROM outside_vendor_data WHERE vendor_id = ${outsideVendor!.id}`;
    await listingDB.exec`DELETE FROM vendors WHERE id = ${outsideVendor!.id}`;
  });

  it('should throw not found error for non-existent listing', async () => {
    await expect(getListing({ id: 99999 })).rejects.toThrow(APIError);
  });

  it('should throw not found error for inactive listing', async () => {
    // Create inactive listing
    const inactiveListing = await listingDB.queryRow<{ id: number }>`
      INSERT INTO listings (vendor_id, title, price, is_active)
      VALUES (${testVendorId}, 'Test Inactive Product', 30000, false)
      RETURNING id
    `;

    await expect(getListing({ id: inactiveListing!.id })).rejects.toThrow(APIError);

    // Clean up
    await listingDB.exec`DELETE FROM listings WHERE id = ${inactiveListing!.id}`;
  });

  it('should handle listing without category', async () => {
    const listingWithoutCategory = await listingDB.queryRow<{ id: number }>`
      INSERT INTO listings (vendor_id, title, price, is_active)
      VALUES (${testVendorId}, 'Test No Category Product', 20000, true)
      RETURNING id
    `;

    const result = await getListing({ id: listingWithoutCategory!.id });

    expect(result).toBeDefined();
    expect(result.category).toBeUndefined();

    // Clean up
    await listingDB.exec`DELETE FROM listings WHERE id = ${listingWithoutCategory!.id}`;
  });

  it('should handle listing with empty images array', async () => {
    const listingNoImages = await listingDB.queryRow<{ id: number }>`
      INSERT INTO listings (vendor_id, title, price, is_active, images)
      VALUES (${testVendorId}, 'Test No Images Product', 15000, true, ARRAY[]::TEXT[])
      RETURNING id
    `;

    const result = await getListing({ id: listingNoImages!.id });

    expect(result).toBeDefined();
    expect(result.images).toEqual([]);

    // Clean up
    await listingDB.exec`DELETE FROM listings WHERE id = ${listingNoImages!.id}`;
  });
});
