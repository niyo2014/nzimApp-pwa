import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { listingDB } from './db';
import { listListings } from './list_listings';

describe('listListings', () => {
  let testVendorId: number;
  let testCategoryId: number;
  let testListingIds: number[] = [];

  beforeEach(async () => {
    // Clean up test data
    await listingDB.exec`DELETE FROM listings WHERE title LIKE 'Test%'`;
    await listingDB.exec`DELETE FROM vendors WHERE name LIKE 'Test%'`;
    await listingDB.exec`DELETE FROM categories WHERE name LIKE 'Test%'`;

    // Create test vendor
    const vendor = await listingDB.queryRow<{ id: number }>`
      INSERT INTO vendors (name, contact_number, vendor_type, trust_score)
      VALUES ('Test Vendor List', '+25779123480', 'gallery', 90)
      RETURNING id
    `;
    testVendorId = vendor!.id;

    // Create gallery vendor data
    await listingDB.exec`
      INSERT INTO gallery_vendor_data (vendor_id, gallery_name, shop_number)
      VALUES (${testVendorId}, 'Test Gallery List', 'B001')
    `;

    // Create test category
    const category = await listingDB.queryRow<{ id: number }>`
      INSERT INTO categories (name, icon)
      VALUES ('Test Category List', 'grid')
      RETURNING id
    `;
    testCategoryId = category!.id;

    // Create test listings
    const listing1 = await listingDB.queryRow<{ id: number }>`
      INSERT INTO listings (vendor_id, category_id, title, price, is_active, is_boosted, listing_type, trust_score, status)
      VALUES (${testVendorId}, ${testCategoryId}, 'Test Product 1', 50000, true, true, 'offering', 8, 'active')
      RETURNING id
    `;
    testListingIds.push(listing1!.id);

    const listing2 = await listingDB.queryRow<{ id: number }>`
      INSERT INTO listings (vendor_id, category_id, title, price, is_active, is_boosted, listing_type, trust_score, status)
      VALUES (${testVendorId}, ${testCategoryId}, 'Test Product 2', 30000, true, false, 'offering', 6, 'active')
      RETURNING id
    `;
    testListingIds.push(listing2!.id);

    const listing3 = await listingDB.queryRow<{ id: number }>`
      INSERT INTO listings (vendor_id, title, price, is_active, listing_type, status)
      VALUES (${testVendorId}, 'Test Wanted Item', 25000, true, 'wanted', 'active')
      RETURNING id
    `;
    testListingIds.push(listing3!.id);
  });

  afterEach(async () => {
    // Clean up test data
    await listingDB.exec`DELETE FROM listings WHERE title LIKE 'Test%'`;
    await listingDB.exec`DELETE FROM gallery_vendor_data WHERE vendor_id = ${testVendorId}`;
    await listingDB.exec`DELETE FROM vendors WHERE name LIKE 'Test%'`;
    await listingDB.exec`DELETE FROM categories WHERE name LIKE 'Test%'`;
  });

  it('should list all active offerings by default', async () => {
    const result = await listListings({});

    expect(result).toBeDefined();
    expect(result.listings).toBeDefined();
    expect(result.total).toBeGreaterThanOrEqual(2);

    // Should only include offerings
    const testListings = result.listings.filter(l => l.title.startsWith('Test Product'));
    expect(testListings).toHaveLength(2);
    
    testListings.forEach(listing => {
      expect(listing.listing_type).toBe('offering');
      expect(listing.is_active).toBe(true);
    });
  });

  it('should list wanted listings when specified', async () => {
    const result = await listListings({ listing_type: 'wanted' });

    expect(result).toBeDefined();
    const testWantedListings = result.listings.filter(l => l.title.startsWith('Test Wanted'));
    expect(testWantedListings).toHaveLength(1);
    expect(testWantedListings[0].listing_type).toBe('wanted');
  });

  it('should filter by category', async () => {
    const result = await listListings({ category_id: testCategoryId });

    expect(result).toBeDefined();
    const testListings = result.listings.filter(l => l.title.startsWith('Test Product'));
    expect(testListings).toHaveLength(2);
    
    testListings.forEach(listing => {
      expect(listing.category_id).toBe(testCategoryId);
    });
  });

  it('should filter by vendor', async () => {
    const result = await listListings({ vendor_id: testVendorId });

    expect(result).toBeDefined();
    const testListings = result.listings.filter(l => l.title.startsWith('Test'));
    expect(testListings).toHaveLength(2); // Only offerings by default
    
    testListings.forEach(listing => {
      expect(listing.vendor_id).toBe(testVendorId);
    });
  });

  it('should filter by vendor type', async () => {
    const result = await listListings({ vendor_type: 'gallery' });

    expect(result).toBeDefined();
    const testListings = result.listings.filter(l => l.title.startsWith('Test Product'));
    expect(testListings).toHaveLength(2);
    
    testListings.forEach(listing => {
      expect(listing.vendor.vendor_type).toBe('gallery');
    });
  });

  it('should search by title and description', async () => {
    const result = await listListings({ search: 'Product 1' });

    expect(result).toBeDefined();
    const matchingListings = result.listings.filter(l => l.title.includes('Product 1'));
    expect(matchingListings).toHaveLength(1);
    expect(matchingListings[0].title).toBe('Test Product 1');
  });

  it('should filter by status', async () => {
    // Create a reserved listing
    const reservedListing = await listingDB.queryRow<{ id: number }>`
      INSERT INTO listings (vendor_id, title, price, is_active, status)
      VALUES (${testVendorId}, 'Test Reserved Product', 40000, true, 'reserved')
      RETURNING id
    `;

    const result = await listListings({ status: 'reserved' });

    expect(result).toBeDefined();
    const reservedListings = result.listings.filter(l => l.title === 'Test Reserved Product');
    expect(reservedListings).toHaveLength(1);
    expect(reservedListings[0].status).toBe('reserved');

    // Clean up
    await listingDB.exec`DELETE FROM listings WHERE id = ${reservedListing!.id}`;
  });

  it('should respect limit and offset parameters', async () => {
    const result = await listListings({ limit: 1, offset: 0 });

    expect(result).toBeDefined();
    expect(result.listings).toHaveLength(1);
    expect(result.total).toBeGreaterThanOrEqual(2);
  });

  it('should order by boosted, trust score, and creation date', async () => {
    const result = await listListings({ vendor_id: testVendorId });

    expect(result).toBeDefined();
    const testListings = result.listings.filter(l => l.title.startsWith('Test Product'));
    expect(testListings).toHaveLength(2);

    // First listing should be boosted (Test Product 1)
    expect(testListings[0].is_boosted).toBe(true);
    expect(testListings[0].title).toBe('Test Product 1');
    
    // Second listing should not be boosted (Test Product 2)
    expect(testListings[1].is_boosted).toBe(false);
    expect(testListings[1].title).toBe('Test Product 2');
  });

  it('should include vendor details in results', async () => {
    const result = await listListings({ vendor_id: testVendorId });

    expect(result).toBeDefined();
    const testListings = result.listings.filter(l => l.title.startsWith('Test Product'));
    expect(testListings).toHaveLength(2);

    testListings.forEach(listing => {
      expect(listing.vendor).toBeDefined();
      expect(listing.vendor.name).toBe('Test Vendor List');
      expect(listing.vendor.vendor_type).toBe('gallery');
      expect(listing.vendor.trust_score).toBe(90);
    });
  });

  it('should include gallery data for gallery vendors', async () => {
    const result = await listListings({ vendor_id: testVendorId });

    expect(result).toBeDefined();
    const testListings = result.listings.filter(l => l.title.startsWith('Test Product'));
    expect(testListings).toHaveLength(2);

    testListings.forEach(listing => {
      expect(listing.gallery_data).toBeDefined();
      expect(listing.gallery_data!.gallery_name).toBe('Test Gallery List');
      expect(listing.gallery_data!.shop_number).toBe('B001');
    });
  });

  it('should include category details when available', async () => {
    const result = await listListings({ category_id: testCategoryId });

    expect(result).toBeDefined();
    const testListings = result.listings.filter(l => l.title.startsWith('Test Product'));
    expect(testListings).toHaveLength(2);

    testListings.forEach(listing => {
      expect(listing.category).toBeDefined();
      expect(listing.category!.name).toBe('Test Category List');
      expect(listing.category!.icon).toBe('grid');
    });
  });

  it('should return empty results for non-matching filters', async () => {
    const result = await listListings({ search: 'NonExistentProduct' });

    expect(result).toBeDefined();
    expect(result.listings).toHaveLength(0);
    expect(result.total).toBe(0);
  });
});
