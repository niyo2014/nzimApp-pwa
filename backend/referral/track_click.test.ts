import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { referralDB } from './db';
import { trackClick } from './track_click';

describe('trackClick', () => {
  let testReferralCode: string;
  let testReferralId: number;

  beforeEach(async () => {
    // Clean up test data
    await referralDB.exec`DELETE FROM referrals WHERE referral_id LIKE '%TRACK%'`;
    await referralDB.exec`DELETE FROM sharers WHERE name LIKE 'Test%'`;
    await referralDB.exec`DELETE FROM listings WHERE title LIKE 'Test%'`;
    await referralDB.exec`DELETE FROM vendors WHERE name LIKE 'Test%'`;

    // Create test data
    const vendor = await referralDB.queryRow<{ id: number }>`
      INSERT INTO vendors (name, contact_number, vendor_type)
      VALUES ('Test Vendor Track', '+25779123500', 'gallery')
      RETURNING id
    `;

    const listing = await referralDB.queryRow<{ id: number }>`
      INSERT INTO listings (vendor_id, title, price, is_active)
      VALUES (${vendor!.id}, 'Test Product Track', 45000, true)
      RETURNING id
    `;

    const sharer = await referralDB.queryRow<{ id: number }>`
      INSERT INTO sharers (name, contact_number)
      VALUES ('Test Sharer Track', '+25779123501')
      RETURNING id
    `;

    testReferralCode = 'TRACK123';
    const referral = await referralDB.queryRow<{ id: number }>`
      INSERT INTO referrals (referral_id, sharer_id, listing_id, points_earned)
      VALUES (${testReferralCode}, ${sharer!.id}, ${listing!.id}, 100)
      RETURNING id
    `;
    testReferralId = referral!.id;
  });

  afterEach(async () => {
    // Clean up test data
    await referralDB.exec`DELETE FROM referrals WHERE referral_id LIKE '%TRACK%'`;
    await referralDB.exec`DELETE FROM sharers WHERE name LIKE 'Test%'`;
    await referralDB.exec`DELETE FROM listings WHERE title LIKE 'Test%'`;
    await referralDB.exec`DELETE FROM vendors WHERE name LIKE 'Test%'`;
  });

  it('should track click for valid referral code', async () => {
    // Verify no click timestamp initially
    const beforeClick = await referralDB.queryRow<{ click_timestamp: Date | null }>`
      SELECT click_timestamp FROM referrals WHERE referral_id = ${testReferralCode}
    `;
    expect(beforeClick!.click_timestamp).toBeNull();

    // Track the click
    await trackClick({ referral_code: testReferralCode });

    // Verify click timestamp was set
    const afterClick = await referralDB.queryRow<{ click_timestamp: Date | null }>`
      SELECT click_timestamp FROM referrals WHERE referral_id = ${testReferralCode}
    `;
    expect(afterClick!.click_timestamp).not.toBeNull();
    expect(afterClick!.click_timestamp).toBeInstanceOf(Date);
  });

  it('should not update click timestamp if already set', async () => {
    // Set initial click timestamp
    const initialTimestamp = new Date('2024-01-01T10:00:00Z');
    await referralDB.exec`
      UPDATE referrals 
      SET click_timestamp = ${initialTimestamp}
      WHERE referral_id = ${testReferralCode}
    `;

    // Try to track click again
    await trackClick({ referral_code: testReferralCode });

    // Verify timestamp wasn't updated
    const afterSecondClick = await referralDB.queryRow<{ click_timestamp: Date }>`
      SELECT click_timestamp FROM referrals WHERE referral_id = ${testReferralCode}
    `;
    expect(afterSecondClick!.click_timestamp.getTime()).toBe(initialTimestamp.getTime());
  });

  it('should handle non-existent referral code gracefully', async () => {
    // This should not throw an error, just do nothing
    await expect(trackClick({ referral_code: 'NONEXISTENT' })).resolves.toBeUndefined();
  });

  it('should handle empty referral code', async () => {
    // This should not throw an error, just do nothing
    await expect(trackClick({ referral_code: '' })).resolves.toBeUndefined();
  });

  it('should only update referrals without existing click timestamp', async () => {
    // Create another referral with existing click timestamp
    const vendor2 = await referralDB.queryRow<{ id: number }>`
      INSERT INTO vendors (name, contact_number, vendor_type)
      VALUES ('Test Vendor Track 2', '+25779123502', 'gallery')
      RETURNING id
    `;

    const listing2 = await referralDB.queryRow<{ id: number }>`
      INSERT INTO listings (vendor_id, title, price, is_active)
      VALUES (${vendor2!.id}, 'Test Product Track 2', 35000, true)
      RETURNING id
    `;

    const sharer2 = await referralDB.queryRow<{ id: number }>`
      INSERT INTO sharers (name, contact_number)
      VALUES ('Test Sharer Track 2', '+25779123503')
      RETURNING id
    `;

    const existingTimestamp = new Date('2024-01-01T12:00:00Z');
    const referralCode2 = 'TRACK456';
    await referralDB.exec`
      INSERT INTO referrals (referral_id, sharer_id, listing_id, points_earned, click_timestamp)
      VALUES (${referralCode2}, ${sharer2!.id}, ${listing2!.id}, 100, ${existingTimestamp})
    `;

    // Track click for the referral that already has a timestamp
    await trackClick({ referral_code: referralCode2 });

    // Verify timestamp wasn't changed
    const result = await referralDB.queryRow<{ click_timestamp: Date }>`
      SELECT click_timestamp FROM referrals WHERE referral_id = ${referralCode2}
    `;
    expect(result!.click_timestamp.getTime()).toBe(existingTimestamp.getTime());
  });
});
