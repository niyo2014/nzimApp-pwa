import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { userDB } from './db';
import { getUserByPhone } from './get_user_by_phone';
import { APIError } from 'encore.dev/api';

describe('getUserByPhone', () => {
  let testUserPhone: string;

  beforeEach(async () => {
    // Clean up test data
    await userDB.exec`DELETE FROM users WHERE name LIKE 'Test%'`;

    testUserPhone = '+25779123550';

    // Create test user
    await userDB.exec`
      INSERT INTO users (name, phone, email, user_type, trust_score, gifts_points)
      VALUES ('Test User Phone', ${testUserPhone}, 'testphone@example.com', 'buyer', 60, 180)
    `;
  });

  afterEach(async () => {
    // Clean up test data
    await userDB.exec`DELETE FROM users WHERE name LIKE 'Test%'`;
  });

  it('should retrieve user by phone number', async () => {
    const result = await getUserByPhone({ phone: testUserPhone });

    expect(result).toBeDefined();
    expect(result.name).toBe('Test User Phone');
    expect(result.phone).toBe(testUserPhone);
    expect(result.email).toBe('testphone@example.com');
    expect(result.user_type).toBe('buyer');
    expect(result.trust_score).toBe(60);
    expect(result.gifts_points).toBe(180);
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should throw not found error for non-existent phone', async () => {
    await expect(getUserByPhone({ phone: '+25779999999' })).rejects.toThrow(APIError);
  });

  it('should handle phone number with different formats', async () => {
    // Create user with phone in different format
    const phoneFormat2 = '25779123551';
    await userDB.exec`
      INSERT INTO users (name, phone, user_type)
      VALUES ('Test User Phone Format', ${phoneFormat2}, 'vendor')
    `;

    const result = await getUserByPhone({ phone: phoneFormat2 });

    expect(result).toBeDefined();
    expect(result.phone).toBe(phoneFormat2);

    // Clean up
    await userDB.exec`DELETE FROM users WHERE phone = ${phoneFormat2}`;
  });

  it('should be case sensitive for phone numbers', async () => {
    // Phone numbers should be exact matches
    await expect(getUserByPhone({ phone: testUserPhone.toUpperCase() })).rejects.toThrow(APIError);
  });

  it('should handle user with minimal data', async () => {
    const minimalPhone = '+25779123552';
    await userDB.exec`
      INSERT INTO users (name, phone, user_type)
      VALUES ('Test Minimal User', ${minimalPhone}, 'sharer')
    `;

    const result = await getUserByPhone({ phone: minimalPhone });

    expect(result).toBeDefined();
    expect(result.name).toBe('Test Minimal User');
    expect(result.phone).toBe(minimalPhone);
    expect(result.user_type).toBe('sharer');
    expect(result.email).toBeNull();
    expect(result.trust_score).toBe(0);
    expect(result.gifts_points).toBe(0);

    // Clean up
    await userDB.exec`DELETE FROM users WHERE phone = ${minimalPhone}`;
  });

  it('should handle empty phone parameter', async () => {
    await expect(getUserByPhone({ phone: '' })).rejects.toThrow(APIError);
  });

  it('should handle special characters in phone', async () => {
    const specialPhone = '+257-79-123-553';
    await userDB.exec`
      INSERT INTO users (name, phone, user_type)
      VALUES ('Test Special Phone', ${specialPhone}, 'admin')
    `;

    const result = await getUserByPhone({ phone: specialPhone });

    expect(result).toBeDefined();
    expect(result.phone).toBe(specialPhone);

    // Clean up
    await userDB.exec`DELETE FROM users WHERE phone = ${specialPhone}`;
  });
});
