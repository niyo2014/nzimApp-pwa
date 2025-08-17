import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { vendorDB } from './db';
import { createVendor } from './create_vendor';

describe('createVendor', () => {
  beforeEach(async () => {
    // Clean up test data
    await vendorDB.exec`DELETE FROM gallery_vendor_data WHERE vendor_id IN (SELECT id FROM vendors WHERE name LIKE 'Test%')`;
    await vendorDB.exec`DELETE FROM outside_vendor_data WHERE vendor_id IN (SELECT id FROM vendors WHERE name LIKE 'Test%')`;
    await vendorDB.exec`DELETE FROM vendors WHERE name LIKE 'Test%'`;
  });

  afterEach(async () => {
    // Clean up test data
    await vendorDB.exec`DELETE FROM gallery_vendor_data WHERE vendor_id IN (SELECT id FROM vendors WHERE name LIKE 'Test%')`;
    await vendorDB.exec`DELETE FROM outside_vendor_data WHERE vendor_id IN (SELECT id FROM vendors WHERE name LIKE 'Test%')`;
    await vendorDB.exec`DELETE FROM vendors WHERE name LIKE 'Test%'`;
  });

  it('should create gallery vendor with gallery data', async () => {
    const request = {
      name: 'Test Gallery Vendor',
      contact_number: '+25779123570',
      email: 'gallery@test.com',
      vendor_type: 'gallery' as const,
      gallery_data: {
        gallery_name: 'Test Gallery',
        shop_number: 'A001',
        category_authorization: 'Electronics'
      }
    };

    const result = await createVendor(request);

    expect(result).toBeDefined();
    expect(result.vendor).toBeDefined();
    expect(result.gallery_data).toBeDefined();
    expect(result.outside_data).toBeUndefined();

    // Check vendor data
    expect(result.vendor.name).toBe('Test Gallery Vendor');
    expect(result.vendor.contact_number).toBe('+25779123570');
    expect(result.vendor.email).toBe('gallery@test.com');
    expect(result.vendor.vendor_type).toBe('gallery');
    expect(result.vendor.kyc_status).toBe('pending');
    expect(result.vendor.status).toBe('active');
    expect(result.vendor.trust_score).toBe(0);

    // Check gallery data
    expect(result.gallery_data!.vendor_id).toBe(result.vendor.id);
    expect(result.gallery_data!.gallery_name).toBe('Test Gallery');
    expect(result.gallery_data!.shop_number).toBe('A001');
    expect(result.gallery_data!.category_authorization).toBe('Electronics');
  });

  it('should create outside vendor with outside data', async () => {
    const request = {
      name: 'Test Outside Vendor',
      contact_number: '+25779123571',
      vendor_type: 'outside' as const,
      outside_data: {
        home_address: 'Test Address 123',
        service_area_coverage: 'Bujumbura City',
        pickup_points: 'Central Market, Bus Station'
      }
    };

    const result = await createVendor(request);

    expect(result).toBeDefined();
    expect(result.vendor).toBeDefined();
    expect(result.outside_data).toBeDefined();
    expect(result.gallery_data).toBeUndefined();

    // Check vendor data
    expect(result.vendor.name).toBe('Test Outside Vendor');
    expect(result.vendor.contact_number).toBe('+25779123571');
    expect(result.vendor.vendor_type).toBe('outside');

    // Check outside data
    expect(result.outside_data!.vendor_id).toBe(result.vendor.id);
    expect(result.outside_data!.home_address).toBe('Test Address 123');
    expect(result.outside_data!.service_area_coverage).toBe('Bujumbura City');
    expect(result.outside_data!.pickup_points).toBe('Central Market, Bus Station');
  });

  it('should create vendor without email', async () => {
    const request = {
      name: 'Test Vendor No Email',
      contact_number: '+25779123572',
      vendor_type: 'gallery' as const,
      gallery_data: {
        gallery_name: 'Test Gallery 2',
        shop_number: 'B002'
      }
    };

    const result = await createVendor(request);

    expect(result).toBeDefined();
    expect(result.vendor.email).toBeNull();
  });

  it('should create gallery vendor without category authorization', async () => {
    const request = {
      name: 'Test Gallery No Auth',
      contact_number: '+25779123573',
      vendor_type: 'gallery' as const,
      gallery_data: {
        gallery_name: 'Test Gallery 3',
        shop_number: 'C003'
      }
    };

    const result = await createVendor(request);

    expect(result).toBeDefined();
    expect(result.gallery_data).toBeDefined();
    expect(result.gallery_data!.category_authorization).toBeNull();
  });

  it('should create outside vendor without pickup points', async () => {
    const request = {
      name: 'Test Outside No Pickup',
      contact_number: '+25779123574',
      vendor_type: 'outside' as const,
      outside_data: {
        home_address: 'Test Address 456',
        service_area_coverage: 'Gitega Province'
      }
    };

    const result = await createVendor(request);

    expect(result).toBeDefined();
    expect(result.outside_data).toBeDefined();
    expect(result.outside_data!.pickup_points).toBeNull();
  });

  it('should enforce unique contact numbers', async () => {
    const request1 = {
      name: 'Test Vendor 1',
      contact_number: '+25779123575',
      vendor_type: 'gallery' as const,
      gallery_data: {
        gallery_name: 'Gallery 1',
        shop_number: 'D001'
      }
    };

    const request2 = {
      name: 'Test Vendor 2',
      contact_number: '+25779123575', // Same contact number
      vendor_type: 'outside' as const,
      outside_data: {
        home_address: 'Address 2',
        service_area_coverage: 'Area 2'
      }
    };

    await createVendor(request1);
    
    // Second vendor with same contact should fail
    await expect(createVendor(request2)).rejects.toThrow();
  });

  it('should enforce unique gallery shop numbers', async () => {
    const request1 = {
      name: 'Test Gallery Vendor 1',
      contact_number: '+25779123576',
      vendor_type: 'gallery' as const,
      gallery_data: {
        gallery_name: 'Same Gallery',
        shop_number: 'E001'
      }
    };

    const request2 = {
      name: 'Test Gallery Vendor 2',
      contact_number: '+25779123577',
      vendor_type: 'gallery' as const,
      gallery_data: {
        gallery_name: 'Same Gallery',
        shop_number: 'E001' // Same gallery and shop number
      }
    };

    await createVendor(request1);
    
    // Second vendor with same gallery/shop should fail
    await expect(createVendor(request2)).rejects.toThrow();
  });

  it('should allow same shop number in different galleries', async () => {
    const request1 = {
      name: 'Test Gallery Vendor A',
      contact_number: '+25779123578',
      vendor_type: 'gallery' as const,
      gallery_data: {
        gallery_name: 'Gallery A',
        shop_number: 'F001'
      }
    };

    const request2 = {
      name: 'Test Gallery Vendor B',
      contact_number: '+25779123579',
      vendor_type: 'gallery' as const,
      gallery_data: {
        gallery_name: 'Gallery B',
        shop_number: 'F001' // Same shop number, different gallery
      }
    };

    const result1 = await createVendor(request1);
    const result2 = await createVendor(request2);

    expect(result1).toBeDefined();
    expect(result2).toBeDefined();
    expect(result1.gallery_data!.gallery_name).toBe('Gallery A');
    expect(result2.gallery_data!.gallery_name).toBe('Gallery B');
  });

  it('should rollback transaction on error', async () => {
    const request = {
      name: 'Test Rollback Vendor',
      contact_number: '+25779123580',
      vendor_type: 'gallery' as const,
      gallery_data: {
        gallery_name: 'Test Gallery Rollback',
        shop_number: 'G001'
      }
    };

    // Create first vendor successfully
    await createVendor(request);

    // Try to create second vendor with same contact (should fail and rollback)
    const duplicateRequest = {
      ...request,
      name: 'Test Duplicate Vendor'
    };

    await expect(createVendor(duplicateRequest)).rejects.toThrow();

    // Verify only one vendor was created
    const vendors = await vendorDB.queryAll<{ id: number }>`
      SELECT id FROM vendors WHERE contact_number = '+25779123580'
    `;
    expect(vendors).toHaveLength(1);
  });

  it('should handle gallery vendor without gallery data', async () => {
    const request = {
      name: 'Test Gallery No Data',
      contact_number: '+25779123581',
      vendor_type: 'gallery' as const
      // No gallery_data provided
    };

    const result = await createVendor(request);

    expect(result).toBeDefined();
    expect(result.vendor).toBeDefined();
    expect(result.gallery_data).toBeUndefined();
  });

  it('should handle outside vendor without outside data', async () => {
    const request = {
      name: 'Test Outside No Data',
      contact_number: '+25779123582',
      vendor_type: 'outside' as const
      // No outside_data provided
    };

    const result = await createVendor(request);

    expect(result).toBeDefined();
    expect(result.vendor).toBeDefined();
    expect(result.outside_data).toBeUndefined();
  });

  it('should set correct default values', async () => {
    const request = {
      name: 'Test Defaults Vendor',
      contact_number: '+25779123583',
      vendor_type: 'gallery' as const
    };

    const result = await createVendor(request);

    expect(result.vendor.kyc_status).toBe('pending');
    expect(result.vendor.status).toBe('active');
    expect(result.vendor.trust_score).toBe(0);
    expect(result.vendor.payment_preferences).toBeNull();
    expect(result.vendor.whatsapp_link).toBeNull();
    expect(result.vendor.created_at).toBeInstanceOf(Date);
    expect(result.vendor.updated_at).toBeInstanceOf(Date);
  });
});
