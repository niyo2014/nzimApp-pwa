import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { referralDB } from './db';
import { createReferral } from './create_referral';

describe('createReferral', () => {
  let testListingId: number;
  let testVendorId: number;

  beforeEach(async () => {
    // Clean up test data
    await referralDB.exec`DELETE FROM referrals WHERE referral_id LIKE '%TEST%'`;
    await referralDB.exec`DELETE FROM sharers WHERE name LIKE 'Test%'`;
    await referralDB.exec`DELETE FROM listings WHERE title LIKE 'Test%'`;
    await referralDB.exec`DELETE FROM vendors WHERE name LIKE 'Test%'`;

    // Create test vendor
    const vendor = await referralDB.queryRow<{ id: number }>`
      INSERT INTO vendors (name, contact_number, vendor_type)
      VALUES ('Test Vendor Ref', '+25779123490', 'gallery')
      RETURNING id
    `;
    testVendorId = vendor!.id;

    // Create test listing
    const listing = await referralDB.queryRow<{ id: number }>`
      INSERT INTO listings (vendor_id, title, price, is_active)
      VALUES (${testVendorId}, 'Test Product Ref', 60000, true)
      RETURNING id
    `;
    testListingId = listing!.id;
  });

  afterEach(async () => {
    // Clean up test data
    await referralDB.exec`DELETE FROM referrals WHERE referral_id LIKE '%TEST%'`;
    await referralDB.exec`DELETE FROM sharers WHERE name LIKE 'Test%'`;
    await referralDB.exec`DELETE FROM listings WHERE title LIKE 'Test%'`;
    await referralDB.exec`DELETE FROM vendors WHERE name LIKE 'Test%'`;
  });

  it('should create referral for new sharer', async () => {
    const request = {
      listing_id: testListingId,
      sharer_name: 'Test Sharer',
      sharer_phone: '+25779123491'
    };

    const result = await createReferral(request);

    expect(result).toBeDefined();
    expect(result.referral_code).toBeDefined();
    expect(result.referral_code).toHaveLength(8);
    expect(result.whatsapp_link).toBeDefined();
    expect(result.whatsapp_link).toContain('wa.me');
    expect(result.whatsapp_link).toContain(result.referral_code);

    // Verify sharer was created
    const sharer = await referralDB.queryRow<{ id: number; name: string }>`
      SELECT id, name FROM sharers WHERE contact_number = '+25779123491'
    `;
    expect(sharer).toBeDefined();
    expect(sharer!.name).toBe('Test Sharer');

    // Verify referral was created
    const referral = await referralDB.queryRow<{ id: number; points_earned: number }>`
      SELECT id, points_earned FROM referrals WHERE referral_id = ${result.referral_code}
    `;
    expect(referral).toBeDefined();
    expect(referral!.points_earned).toBe(100);
  });

  it('should reuse existing sharer', async () => {
    // Create sharer first
    const existingSharer = await referralDB.queryRow<{ id: number }>`
      INSERT INTO sharers (name, contact_number, gift_points)
      VALUES ('Test Existing Sharer', '+25779123492', 250)
      RETURNING id
    `;

    const request = {
      listing_id: testListingId,
      sharer_name: 'Test Different Name', // Different name, same phone
      sharer_phone: '+25779123492'
    };

    const result = await createReferral(request);

    expect(result).toBeDefined();
    expect(result.referral_code).toBeDefined();

    // Verify no new sharer was created
    const sharers = await referralDB.queryAll<{ id: number }>`
      SELECT id FROM sharers WHERE contact_number = '+25779123492'
    `;
    expect(sharers).toHaveLength(1);
    expect(sharers[0].id).toBe(existingSharer!.id);

    // Verify referral uses existing sharer
    const referral = await referralDB.queryRow<{ sharer_id: number }>`
      SELECT sharer_id FROM referrals WHERE referral_id = ${result.referral_code}
    `;
    expect(referral!.sharer_id).toBe(existingSharer!.id);
  });

  it('should generate unique referral codes', async () => {
    const request1 = {
      listing_id: testListingId,
      sharer_name: 'Test Sharer 1',
      sharer_phone: '+25779123493'
    };

    const request2 = {
      listing_id: testListingId,
      sharer_name: 'Test Sharer 2',
      sharer_phone: '+25779123494'
    };

    const result1 = await createReferral(request1);
    const result2 = await createReferral(request2);

    expect(result1.referral_code).not.toBe(result2.referral_code);
    expect(result1.referral_code).toHaveLength(8);
    expect(result2.referral_code).toHaveLength(8);
  });

  it('should create proper WhatsApp link with listing details', async () => {
    const request = {
      listing_id: testListingId,
      sharer_name: 'Test Sharer WhatsApp',
      sharer_phone: '+25779123495'
    };

    const result = await createReferral(request);

    expect(result.whatsapp_link).toBeDefined();
    expect(result.whatsapp_link).toContain('wa.me/+25779123490'); // Vendor's phone
    expect(result.whatsapp_link).toContain('Test Product Ref'); // Listing title
    expect(result.whatsapp_link).toContain('Test Vendor Ref'); // Vendor name
    expect(result.whatsapp_link).toContain(result.referral_code); // Referral code in URL
  });

  it('should handle listing without vendor contact', async () => {
    // Create vendor without contact
    const vendorNoContact = await referralDB.queryRow<{ id: number }>`
      INSERT INTO vendors (name, contact_number, vendor_type)
      VALUES ('Test Vendor No Contact', '', 'outside')
      RETURNING id
    `;

    const listingNoContact = await referralDB.queryRow<{ id: number }>`
      INSERT INTO listings (vendor_id, title, price, is_active)
      VALUES (${vendorNoContact!.id}, 'Test Product No Contact', 40000, true)
      RETURNING id
    `;

    const request = {
      listing_id: listingNoContact!.id,
      sharer_name: 'Test Sharer No Contact',
      sharer_phone: '+25779123496'
    };

    const result = await createReferral(request);

    expect(result).toBeDefined();
    expect(result.referral_code).toBeDefined();
    expect(result.whatsapp_link).toBeDefined();

    // Clean up
    await referralDB.exec`DELETE FROM listings WHERE id = ${listingNoContact!.id}`;
    await referralDB.exec`DELETE FROM vendors WHERE id = ${vendorNoContact!.id}`;
  });

  it('should throw error for non-existent listing', async () => {
    const request = {
      listing_id: 99999, // Non-existent listing
      sharer_name: 'Test Sharer Error',
      sharer_phone: '+25779123497'
    };

    await expect(createReferral(request)).rejects.toThrow();
  });

  it('should set default points earned to 100', async () => {
    const request = {
      listing_id: testListingId,
      sharer_name: 'Test Sharer Points',
      sharer_phone: '+25779123498'
    };

    const result = await createReferral(request);

    const referral = await referralDB.queryRow<{ points_earned: number }>`
      SELECT points_earned FROM referrals WHERE referral_id = ${result.referral_code}
    `;

    expect(referral!.points_earned).toBe(100);
  });
});
