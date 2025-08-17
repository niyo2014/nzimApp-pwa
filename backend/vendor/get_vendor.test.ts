import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { vendorDB } from './db';
import { getVendor } from './get_vendor';
import { APIError } from 'encore.dev/api';

describe('getVendor', () => {
  let testGalleryVendorId: number;
  let testOutsideVendorId: number;

  beforeEach(async () => {
    // Clean up test data
    await vendorDB.exec`DELETE FROM gallery_vendor_data WHERE vendor_id IN (SELECT id FROM vendors WHERE name LIKE 'Test%')`;
    await vendorDB.exec`DELETE FROM outside_vendor_data WHERE vendor_id IN (SELECT id FROM vendors WHERE name LIKE 'Test%')`;
    await vendorDB.exec`DELETE FROM vendors WHERE name LIKE 'Test%'`;

    // Create test gallery vendor
    const galleryVendor = await vendorDB.queryRow<{ id: number }>`
      INSERT INTO vendors (name, contact_number, email, vendor_type, kyc_status, status, trust_score)
      VALUES ('Test Gallery Vendor Get', '+25779123590', 'gallery@test.com', 'gallery', 'verified', 'active', 85)
      RETURNING id
    `;
    testGalleryVendorId = galleryVendor!.id;

    await vendorDB.exec`
      INSERT INTO gallery_vendor_data (vendor_id, gallery_name, shop_number, category_authorization)
      VALUES (${testGalleryVendorId}, 'Test Gallery Get', 'A001', 'Electronics')
    `;

    // Create test outside vendor
    const outsideVendor = await vendorDB.queryRow<{ id: number }>`
      INSERT INTO vendors (name, contact_number, vendor_type, trust_score)
      VALUES ('Test Outside Vendor Get', '+25779123591', 'outside', 75)
      RETURNING id
    `;
    testOutsideVendorId = outsideVendor!.id;

    await vendorDB.exec`
      INSERT INTO outside_vendor_data (vendor_id, home_address, service_area_coverage, pickup_points)
      VALUES (${testOutsideVendorId}, 'Test Address Get', 'Bujumbura City', 'Central Market')
    `;
  });

  afterEach(async () => {
    // Clean up test data
    await vendorDB.exec`DELETE FROM gallery_vendor_data WHERE vendor_id IN (SELECT id FROM vendors WHERE name LIKE 'Test%')`;
    await vendorDB.exec`DELETE FROM outside_vendor_data WHERE vendor_id IN (SELECT id FROM vendors WHERE name LIKE 'Test%')`;
    await vendorDB.exec`DELETE FROM vendors WHERE name LIKE 'Test%'`;
  });

  it('should retrieve gallery vendor with gallery data', async () => {
    const result = await getVendor({ id: testGalleryVendorId });

    expect(result).toBeDefined();
    expect(result.id).toBe(testGalleryVendorId);
    expect(result.name).toBe('Test Gallery Vendor Get');
    expect(result.contact_number).toBe('+25779123590');
    expect(result.email).toBe('gallery@test.com');
    expect(result.vendor_type).toBe('gallery');
    expect(result.kyc_status).toBe('verified');
    expect(result.status).toBe('active');
    expect(result.trust_score).toBe(85);
    expect(result.created_at).toBeInstanceOf(Date);

    expect(result.gallery_data).toBeDefined();
    expect(result.gallery_data!.gallery_name).toBe('Test Gallery Get');
    expect(result.gallery_data!.shop_number).toBe('A001');
    expect(result.gallery_data!.category_authorization).toBe('Electronics');

    expect(result.outside_data).toBeUndefined();
  });

  it('should retrieve outside vendor with outside data', async () => {
    const result = await getVendor({ id: testOutsideVendorId });

    expect(result).toBeDefined();
    expect(result.id).toBe(testOutsideVendorId);
    expect(result.name).toBe('Test Outside Vendor Get');
    expect(result.contact_number).toBe('+25779123591');
    expect(result.vendor_type).toBe('outside');
    expect(result.trust_score).toBe(75);

    expect(result.outside_data).toBeDefined();
    expect(result.outside_data!.home_address).toBe('Test Address Get');
    expect(result.outside_data!.service_area_coverage).toBe('Bujumbura City');
    expect(result.outside_data!.pickup_points).toBe('Central Market');

    expect(result.gallery_data).toBeUndefined();
  });

  it('should handle vendor without email', async () => {
    const result = await getVendor({ id: testOutsideVendorId });

    expect(result).toBeDefined();
    expect(result.email).toBeUndefined();
  });

  it('should handle gallery vendor without category authorization', async () => {
    // Create gallery vendor without category authorization
    const vendorNoAuth = await vendorDB.queryRow<{ id: number }>`
      INSERT INTO vendors (name, contact_number, vendor_type)
      VALUES ('Test Gallery No Auth Get', '+25779123592', 'gallery')
      RETURNING id
    `;

    await vendorDB.exec`
      INSERT INTO gallery_vendor_data (vendor_id, gallery_name, shop_number)
      VALUES (${vendorNoAuth!.id}, 'Test Gallery No Auth', 'B002')
    `;

    const result = await getVendor({ id: vendorNoAuth!.id });

    expect(result).toBeDefined();
    expect(result.gallery_data).toBeDefined();
    expect(result.gallery_data!.category_authorization).toBeUndefined();

    // Clean up
    await vendorDB.exec`DELETE FROM gallery_vendor_data WHERE vendor_id = ${vendorNoAuth!.id}`;
    await vendorDB.exec`DELETE FROM vendors WHERE id = ${vendorNoAuth!.id}`;
  });

  it('should handle outside vendor without pickup points', async () => {
    // Create outside vendor without pickup points
    const vendorNoPickup = await vendorDB.queryRow<{ id: number }>`
      INSERT INTO vendors (name, contact_number, vendor_type)
      VALUES ('Test Outside No Pickup Get', '+25779123593', 'outside')
      RETURNING id
    `;

    await vendorDB.exec`
      INSERT INTO outside_vendor_data (vendor_id, home_address, service_area_coverage)
      VALUES (${vendorNoPickup!.id}, 'Test Address No Pickup', 'Gitega Province')
    `;

    const result = await getVendor({ id: vendorNoPickup!.id });

    expect(result).toBeDefined();
    expect(result.outside_data).toBeDefined();
    expect(result.outside_data!.pickup_points).toBeUndefined();

    // Clean up
    await vendorDB.exec`DELETE FROM outside_vendor_data WHERE vendor_id = ${vendorNoPickup!.id}`;
    await vendorDB.exec`DELETE FROM vendors WHERE id = ${vendorNoPickup!.id}`;
  });

  it('should handle vendor without specialized data', async () => {
    // Create vendor without gallery or outside data
    const vendorNoData = await vendorDB.queryRow<{ id: number }>`
      INSERT INTO vendors (name, contact_number, vendor_type)
      VALUES ('Test Vendor No Data Get', '+25779123594', 'gallery')
      RETURNING id
    `;

    const result = await getVendor({ id: vendorNoData!.id });

    expect(result).toBeDefined();
    expect(result.gallery_data).toBeUndefined();
    expect(result.outside_data).toBeUndefined();

    // Clean up
    await vendorDB.exec`DELETE FROM vendors WHERE id = ${vendorNoData!.id}`;
  });

  it('should throw not found error for non-existent vendor', async () => {
    await expect(getVendor({ id: 99999 })).rejects.toThrow(APIError);
  });

  it('should handle all kyc statuses', async () => {
    const statuses = ['pending', 'verified', 'rejected'] as const;
    const vendorIds: number[] = [];

    for (let i = 0; i < statuses.length; i++) {
      const vendor = await vendorDB.queryRow<{ id: number }>`
        INSERT INTO vendors (name, contact_number, vendor_type, kyc_status)
        VALUES ('Test Vendor KYC ${statuses[i]}', '+2577912359${5 + i}', 'gallery', ${statuses[i]})
        RETURNING id
      `;
      vendorIds.push(vendor!.id);
    }

    for (let i = 0; i < statuses.length; i++) {
      const result = await getVendor({ id: vendorIds[i] });
      expect(result.kyc_status).toBe(statuses[i]);
    }

    // Clean up
    for (const id of vendorIds) {
      await vendorDB.exec`DELETE FROM vendors WHERE id = ${id}`;
    }
  });

  it('should handle all vendor statuses', async () => {
    const statuses = ['active', 'suspended', 'inactive'] as const;
    const vendorIds: number[] = [];

    for (let i = 0; i < statuses.length; i++) {
      const vendor = await vendorDB.queryRow<{ id: number }>`
        INSERT INTO vendors (name, contact_number, vendor_type, status)
        VALUES ('Test Vendor Status ${statuses[i]}', '+2577912359${8 + i}', 'outside', ${statuses[i]})
        RETURNING id
      `;
      vendorIds.push(vendor!.id);
    }

    for (let i = 0; i < statuses.length; i++) {
      const result = await getVendor({ id: vendorIds[i] });
      expect(result.status).toBe(statuses[i]);
    }

    // Clean up
    for (const id of vendorIds) {
      await vendorDB.exec`DELETE FROM vendors WHERE id = ${id}`;
    }
  });
});
