import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { vendorDB } from './db';
import { listVendors } from './list_vendors';

describe('listVendors', () => {
  let testVendorIds: number[] = [];

  beforeEach(async () => {
    // Clean up test data
    await vendorDB.exec`DELETE FROM gallery_vendor_data WHERE vendor_id IN (SELECT id FROM vendors WHERE name LIKE 'Test%')`;
    await vendorDB.exec`DELETE FROM outside_vendor_data WHERE vendor_id IN (SELECT id FROM vendors WHERE name LIKE 'Test%')`;
    await vendorDB.exec`DELETE FROM vendors WHERE name LIKE 'Test%'`;

    // Create test gallery vendors
    const galleryVendor1 = await vendorDB.queryRow<{ id: number }>`
      INSERT INTO vendors (name, contact_number, vendor_type, kyc_status, status, trust_score)
      VALUES ('Test Gallery Vendor List 1', '+25779123600', 'gallery', 'verified', 'active', 90)
      RETURNING id
    `;
    testVendorIds.push(galleryVendor1!.id);

    await vendorDB.exec`
      INSERT INTO gallery_vendor_data (vendor_id, gallery_name, shop_number)
      VALUES (${galleryVendor1!.id}, 'Test Gallery List 1', 'A001')
    `;

    const galleryVendor2 = await vendorDB.queryRow<{ id: number }>`
      INSERT INTO vendors (name, contact_number, vendor_type, kyc_status, status, trust_score)
      VALUES ('Test Gallery Vendor List 2', '+25779123601', 'gallery', 'pending', 'active', 75)
      RETURNING id
    `;
    testVendorIds.push(galleryVendor2!.id);

    await vendorDB.exec`
      INSERT INTO gallery_vendor_data (vendor_id, gallery_name, shop_number)
      VALUES (${galleryVendor2!.id}, 'Test Gallery List 2', 'B002')
    `;

    // Create test outside vendors
    const outsideVendor1 = await vendorDB.queryRow<{ id: number }>`
      INSERT INTO vendors (name, contact_number, vendor_type, kyc_status, status, trust_score)
      VALUES ('Test Outside Vendor List 1', '+25779123602', 'outside', 'verified', 'active', 85)
      RETURNING id
    `;
    testVendorIds.push(outsideVendor1!.id);

    await vendorDB.exec`
      INSERT INTO outside_vendor_data (vendor_id, home_address, service_area_coverage)
      VALUES (${outsideVendor1!.id}, 'Test Address List 1', 'Bujumbura City')
    `;

    const outsideVendor2 = await vendorDB.queryRow<{ id: number }>`
      INSERT INTO vendors (name, contact_number, vendor_type, kyc_status, status, trust_score)
      VALUES ('Test Outside Vendor List 2', '+25779123603', 'outside', 'rejected', 'suspended', 60)
      RETURNING id
    `;
    testVendorIds.push(outsideVendor2!.id);

    await vendorDB.exec`
      INSERT INTO outside_vendor_data (vendor_id, home_address, service_area_coverage)
      VALUES (${outsideVendor2!.id}, 'Test Address List 2', 'Gitega Province')
    `;
  });

  afterEach(async () => {
    // Clean up test data
    await vendorDB.exec`DELETE FROM gallery_vendor_data WHERE vendor_id IN (SELECT id FROM vendors WHERE name LIKE 'Test%')`;
    await vendorDB.exec`DELETE FROM outside_vendor_data WHERE vendor_id IN (SELECT id FROM vendors WHERE name LIKE 'Test%')`;
    await vendorDB.exec`DELETE FROM vendors WHERE name LIKE 'Test%'`;
  });

  it('should list all vendors without filter', async () => {
    const result = await listVendors({});

    expect(result).toBeDefined();
    expect(result.vendors).toBeDefined();
    expect(result.total).toBeGreaterThanOrEqual(4);

    const testVendors = result.vendors.filter(v => v.name.startsWith('Test'));
    expect(testVendors).toHaveLength(4);
  });

  it('should filter by gallery vendor type', async () => {
    const result = await listVendors({ vendor_type: 'gallery' });

    expect(result).toBeDefined();
    const testGalleryVendors = result.vendors.filter(v => v.name.startsWith('Test Gallery'));
    expect(testGalleryVendors).toHaveLength(2);

    testGalleryVendors.forEach(vendor => {
      expect(vendor.vendor_type).toBe('gallery');
      expect(vendor.gallery_name).toBeDefined();
      expect(vendor.shop_number).toBeDefined();
    });
  });

  it('should filter by outside vendor type', async () => {
    const result = await listVendors({ vendor_type: 'outside' });

    expect(result).toBeDefined();
    const testOutsideVendors = result.vendors.filter(v => v.name.startsWith('Test Outside'));
    expect(testOutsideVendors).toHaveLength(2);

    testOutsideVendors.forEach(vendor => {
      expect(vendor.vendor_type).toBe('outside');
      expect(vendor.home_address).toBeDefined();
      expect(vendor.service_area_coverage).toBeDefined();
    });
  });

  it('should filter by verified kyc status', async () => {
    const result = await listVendors({ kyc_status: 'verified' });

    expect(result).toBeDefined();
    const testVerifiedVendors = result.vendors.filter(v => v.name.startsWith('Test'));
    expect(testVerifiedVendors).toHaveLength(2);

    testVerifiedVendors.forEach(vendor => {
      expect(vendor.kyc_status).toBe('verified');
    });
  });

  it('should filter by pending kyc status', async () => {
    const result = await listVendors({ kyc_status: 'pending' });

    expect(result).toBeDefined();
    const testPendingVendors = result.vendors.filter(v => v.name.startsWith('Test'));
    expect(testPendingVendors).toHaveLength(1);
    expect(testPendingVendors[0].kyc_status).toBe('pending');
  });

  it('should filter by rejected kyc status', async () => {
    const result = await listVendors({ kyc_status: 'rejected' });

    expect(result).toBeDefined();
    const testRejectedVendors = result.vendors.filter(v => v.name.startsWith('Test'));
    expect(testRejectedVendors).toHaveLength(1);
    expect(testRejectedVendors[0].kyc_status).toBe('rejected');
  });

  it('should filter by active status', async () => {
    const result = await listVendors({ status: 'active' });

    expect(result).toBeDefined();
    const testActiveVendors = result.vendors.filter(v => v.name.startsWith('Test'));
    expect(testActiveVendors).toHaveLength(3);

    testActiveVendors.forEach(vendor => {
      expect(vendor.status).toBe('active');
    });
  });

  it('should filter by suspended status', async () => {
    const result = await listVendors({ status: 'suspended' });

    expect(result).toBeDefined();
    const testSuspendedVendors = result.vendors.filter(v => v.name.startsWith('Test'));
    expect(testSuspendedVendors).toHaveLength(1);
    expect(testSuspendedVendors[0].status).toBe('suspended');
  });

  it('should combine multiple filters', async () => {
    const result = await listVendors({ 
      vendor_type: 'gallery', 
      kyc_status: 'verified' 
    });

    expect(result).toBeDefined();
    const testFilteredVendors = result.vendors.filter(v => v.name.startsWith('Test'));
    expect(testFilteredVendors).toHaveLength(1);
    expect(testFilteredVendors[0].vendor_type).toBe('gallery');
    expect(testFilteredVendors[0].kyc_status).toBe('verified');
  });

  it('should respect limit parameter', async () => {
    const result = await listVendors({ limit: 2 });

    expect(result).toBeDefined();
    expect(result.vendors).toHaveLength(2);
    expect(result.total).toBeGreaterThanOrEqual(4);
  });

  it('should respect offset parameter', async () => {
    const result1 = await listVendors({ limit: 2, offset: 0 });
    const result2 = await listVendors({ limit: 2, offset: 2 });

    expect(result1).toBeDefined();
    expect(result2).toBeDefined();
    expect(result1.vendors).toHaveLength(2);
    expect(result2.vendors).toHaveLength(2);

    // Vendors should be different
    const vendor1Ids = result1.vendors.map(v => v.id);
    const vendor2Ids = result2.vendors.map(v => v.id);
    
    const overlap = vendor1Ids.filter(id => vendor2Ids.includes(id));
    expect(overlap).toHaveLength(0);
  });

  it('should order by creation date descending', async () => {
    const result = await listVendors({});

    expect(result).toBeDefined();
    const testVendors = result.vendors.filter(v => v.name.startsWith('Test'));
    
    if (testVendors.length > 1) {
      for (let i = 0; i < testVendors.length - 1; i++) {
        expect(testVendors[i].created_at.getTime()).toBeGreaterThanOrEqual(
          testVendors[i + 1].created_at.getTime()
        );
      }
    }
  });

  it('should include gallery data for gallery vendors', async () => {
    const result = await listVendors({ vendor_type: 'gallery' });

    expect(result).toBeDefined();
    const testGalleryVendors = result.vendors.filter(v => v.name.startsWith('Test Gallery'));
    expect(testGalleryVendors).toHaveLength(2);

    testGalleryVendors.forEach(vendor => {
      expect(vendor.gallery_name).toBeDefined();
      expect(vendor.shop_number).toBeDefined();
      expect(vendor.home_address).toBeUndefined();
      expect(vendor.service_area_coverage).toBeUndefined();
    });
  });

  it('should include outside data for outside vendors', async () => {
    const result = await listVendors({ vendor_type: 'outside' });

    expect(result).toBeDefined();
    const testOutsideVendors = result.vendors.filter(v => v.name.startsWith('Test Outside'));
    expect(testOutsideVendors).toHaveLength(2);

    testOutsideVendors.forEach(vendor => {
      expect(vendor.home_address).toBeDefined();
      expect(vendor.service_area_coverage).toBeDefined();
      expect(vendor.gallery_name).toBeUndefined();
      expect(vendor.shop_number).toBeUndefined();
    });
  });

  it('should include all required fields', async () => {
    const result = await listVendors({ limit: 1 });

    expect(result).toBeDefined();
    const testVendor = result.vendors.find(v => v.name.startsWith('Test'));
    expect(testVendor).toBeDefined();

    expect(testVendor).toHaveProperty('id');
    expect(testVendor).toHaveProperty('name');
    expect(testVendor).toHaveProperty('contact_number');
    expect(testVendor).toHaveProperty('vendor_type');
    expect(testVendor).toHaveProperty('kyc_status');
    expect(testVendor).toHaveProperty('status');
    expect(testVendor).toHaveProperty('trust_score');
    expect(testVendor).toHaveProperty('created_at');

    expect(typeof testVendor!.id).toBe('number');
    expect(typeof testVendor!.name).toBe('string');
    expect(typeof testVendor!.contact_number).toBe('string');
    expect(['gallery', 'outside']).toContain(testVendor!.vendor_type);
    expect(['pending', 'verified', 'rejected']).toContain(testVendor!.kyc_status);
    expect(['active', 'suspended', 'inactive']).toContain(testVendor!.status);
    expect(typeof testVendor!.trust_score).toBe('number');
    expect(testVendor!.created_at).toBeInstanceOf(Date);
  });

  it('should return empty results for non-matching filters', async () => {
    const result = await listVendors({ 
      vendor_type: 'gallery', 
      status: 'suspended' 
    });

    expect(result).toBeDefined();
    const testVendors = result.vendors.filter(v => v.name.startsWith('Test'));
    expect(testVendors).toHaveLength(0);
  });

  it('should handle default limit when not specified', async () => {
    const result = await listVendors({});

    expect(result).toBeDefined();
    expect(result.vendors.length).toBeLessThanOrEqual(50); // Default limit is 50
  });

  it('should return correct total count regardless of limit', async () => {
    const result1 = await listVendors({ limit: 2 });
    const result2 = await listVendors({ limit: 10 });

    expect(result1.total).toBe(result2.total);
    expect(result1.total).toBeGreaterThanOrEqual(4);
  });
});
