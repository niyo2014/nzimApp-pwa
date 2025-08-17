import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { referralDB } from './db';
import { listReferrals } from './list_referrals';

describe('listReferrals', () => {
  let testSharerPhone: string;
  let testSharerId: number;
  let testReferralIds: number[] = [];

  beforeEach(async () => {
    // Clean up test data
    await referralDB.exec`DELETE FROM referrals WHERE referral_id LIKE '%LIST%'`;
    await referralDB.exec`DELETE FROM sharers WHERE name LIKE 'Test%'`;
    await referralDB.exec`DELETE FROM listings WHERE title LIKE 'Test%'`;
    await referralDB.exec`DELETE FROM vendors WHERE name LIKE 'Test%'`;

    testSharerPhone = '+25779123510';

    // Create test vendor
    const vendor = await referralDB.queryRow<{ id: number }>`
      INSERT INTO vendors (name, contact_number, vendor_type)
      VALUES ('Test Vendor List Ref', '+25779123511', 'gallery')
      RETURNING id
    `;

    // Create test listings
    const listing1 = await referralDB.queryRow<{ id: number }>`
      INSERT INTO listings (vendor_id, title, price, is_active)
      VALUES (${vendor!.id}, 'Test Product List 1', 50000, true)
      RETURNING id
    `;

    const listing2 = await referralDB.queryRow<{ id: number }>`
      INSERT INTO listings (vendor_id, title, price, is_active)
      VALUES (${vendor!.id}, 'Test Product List 2', 75000, true)
      RETURNING id
    `;

    // Create test sharer
    const sharer = await referralDB.queryRow<{ id: number }>`
      INSERT INTO sharers (name, contact_number, gift_points)
      VALUES ('Test Sharer List', ${testSharerPhone}, 150)
      RETURNING id
    `;
    testSharerId = sharer!.id;

    // Create test referrals
    const referral1 = await referralDB.queryRow<{ id: number }>`
      INSERT INTO referrals (referral_id, sharer_id, listing_id, points_earned, click_timestamp)
      VALUES ('LIST001', ${testSharerId}, ${listing1!.id}, 100, CURRENT_TIMESTAMP)
      RETURNING id
    `;
    testReferralIds.push(referral1!.id);

    const referral2 = await referralDB.queryRow<{ id: number }>`
      INSERT INTO referrals (referral_id, sharer_id, listing_id, points_earned, sale_confirmation_timestamp)
      VALUES ('LIST002', ${testSharerId}, ${listing2!.id}, 100, CURRENT_TIMESTAMP)
      RETURNING id
    `;
    testReferralIds.push(referral2!.id);

    const referral3 = await referralDB.queryRow<{ id: number }>`
      INSERT INTO referrals (referral_id, sharer_id, listing_id, points_earned)
      VALUES ('LIST003', ${testSharerId}, ${listing1!.id}, 100)
      RETURNING id
    `;
    testReferralIds.push(referral3!.id);
  });

  afterEach(async () => {
    // Clean up test data
    await referralDB.exec`DELETE FROM referrals WHERE referral_id LIKE '%LIST%'`;
    await referralDB.exec`DELETE FROM sharers WHERE name LIKE 'Test%'`;
    await referralDB.exec`DELETE FROM listings WHERE title LIKE 'Test%'`;
    await referralDB.exec`DELETE FROM vendors WHERE name LIKE 'Test%'`;
  });

  it('should list referrals for specific sharer phone', async () => {
    const result = await listReferrals({ sharer_phone: testSharerPhone });

    expect(result).toBeDefined();
    expect(result.referrals).toBeDefined();
    expect(result.referrals).toHaveLength(3);

    result.referrals.forEach(referral => {
      expect(referral.sharer_phone).toBe(testSharerPhone);
      expect(referral.sharer_name).toBe('Test Sharer List');
      expect(referral.gifts_points_earned).toBe(100);
      expect(referral.gifts_points_paid).toBe(false);
    });
  });

  it('should include listing details', async () => {
    const result = await listReferrals({ sharer_phone: testSharerPhone });

    expect(result.referrals).toHaveLength(3);

    const referral1 = result.referrals.find(r => r.referral_code === 'LIST001');
    expect(referral1).toBeDefined();
    expect(referral1!.listing_title).toBe('Test Product List 1');

    const referral2 = result.referrals.find(r => r.referral_code === 'LIST002');
    expect(referral2).toBeDefined();
    expect(referral2!.listing_title).toBe('Test Product List 2');
  });

  it('should correctly identify clicked referrals', async () => {
    const result = await listReferrals({ sharer_phone: testSharerPhone });

    const clickedReferral = result.referrals.find(r => r.referral_code === 'LIST001');
    expect(clickedReferral).toBeDefined();
    expect(clickedReferral!.clicks).toBe(1);

    const unclickedReferrals = result.referrals.filter(r => r.referral_code !== 'LIST001');
    unclickedReferrals.forEach(referral => {
      expect(referral.clicks).toBe(0);
    });
  });

  it('should correctly identify confirmed sales', async () => {
    const result = await listReferrals({ sharer_phone: testSharerPhone });

    const confirmedReferral = result.referrals.find(r => r.referral_code === 'LIST002');
    expect(confirmedReferral).toBeDefined();
    expect(confirmedReferral!.is_sale_confirmed).toBe(true);
    expect(confirmedReferral!.confirmed_at).toBeDefined();

    const unconfirmedReferrals = result.referrals.filter(r => r.referral_code !== 'LIST002');
    unconfirmedReferrals.forEach(referral => {
      expect(referral.is_sale_confirmed).toBe(false);
      expect(referral.confirmed_at).toBeUndefined();
    });
  });

  it('should order referrals by creation date descending', async () => {
    const result = await listReferrals({ sharer_phone: testSharerPhone });

    expect(result.referrals).toHaveLength(3);

    // Referrals should be ordered by created_at DESC
    // Since they were created in order LIST001, LIST002, LIST003
    // They should be returned in reverse order
    expect(result.referrals[0].referral_code).toBe('LIST003');
    expect(result.referrals[1].referral_code).toBe('LIST002');
    expect(result.referrals[2].referral_code).toBe('LIST001');
  });

  it('should return limited results when no phone specified', async () => {
    const result = await listReferrals({});

    expect(result).toBeDefined();
    expect(result.referrals).toBeDefined();
    expect(result.referrals.length).toBeLessThanOrEqual(100); // Should respect the LIMIT 100

    // Should include our test referrals
    const testReferrals = result.referrals.filter(r => r.referral_code.startsWith('LIST'));
    expect(testReferrals).toHaveLength(3);
  });

  it('should return empty array for non-existent phone', async () => {
    const result = await listReferrals({ sharer_phone: '+25779999999' });

    expect(result).toBeDefined();
    expect(result.referrals).toHaveLength(0);
  });

  it('should handle sharer with no referrals', async () => {
    // Create sharer with no referrals
    const emptySharer = await referralDB.queryRow<{ id: number }>`
      INSERT INTO sharers (name, contact_number)
      VALUES ('Test Empty Sharer', '+25779123512')
      RETURNING id
    `;

    const result = await listReferrals({ sharer_phone: '+25779123512' });

    expect(result).toBeDefined();
    expect(result.referrals).toHaveLength(0);

    // Clean up
    await referralDB.exec`DELETE FROM sharers WHERE id = ${emptySharer!.id}`;
  });

  it('should include all required fields in response', async () => {
    const result = await listReferrals({ sharer_phone: testSharerPhone });

    expect(result.referrals).toHaveLength(3);

    result.referrals.forEach(referral => {
      expect(referral).toHaveProperty('id');
      expect(referral).toHaveProperty('listing_id');
      expect(referral).toHaveProperty('listing_title');
      expect(referral).toHaveProperty('sharer_name');
      expect(referral).toHaveProperty('sharer_phone');
      expect(referral).toHaveProperty('referral_code');
      expect(referral).toHaveProperty('clicks');
      expect(referral).toHaveProperty('is_sale_confirmed');
      expect(referral).toHaveProperty('gifts_points_earned');
      expect(referral).toHaveProperty('gifts_points_paid');
      expect(referral).toHaveProperty('created_at');

      expect(typeof referral.id).toBe('number');
      expect(typeof referral.listing_id).toBe('number');
      expect(typeof referral.listing_title).toBe('string');
      expect(typeof referral.sharer_name).toBe('string');
      expect(typeof referral.sharer_phone).toBe('string');
      expect(typeof referral.referral_code).toBe('string');
      expect(typeof referral.clicks).toBe('number');
      expect(typeof referral.is_sale_confirmed).toBe('boolean');
      expect(typeof referral.gifts_points_earned).toBe('number');
      expect(typeof referral.gifts_points_paid).toBe('boolean');
      expect(referral.created_at).toBeInstanceOf(Date);
    });
  });
});
