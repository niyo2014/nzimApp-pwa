import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { userDB } from './db';
import { getUser } from './get_user';
import { APIError } from 'encore.dev/api';

describe('getUser', () => {
  let testUserId: number;

  beforeEach(async () => {
    // Clean up test data
    await userDB.exec`DELETE FROM users WHERE name LIKE 'Test%'`;

    // Create test user
    const user = await userDB.queryRow<{ id: number }>`
      INSERT INTO users (name, phone, email, user_type, trust_score, gifts_points)
      VALUES ('Test User Get', '+25779123540', 'testget@example.com', 'vendor', 75, 250)
      RETURNING id
    `;
    testUserId = user!.id;
  });

  afterEach(async () => {
    // Clean up test data
    await userDB.exec`DELETE FROM users WHERE name LIKE 'Test%'`;
  });

  it('should retrieve user by ID', async () => {
    const result = await getUser({ id: testUserId });

    expect(result).toBeDefined();
    expect(result.id).toBe(testUserId);
    expect(result.name).toBe('Test User Get');
    expect(result.phone).toBe('+25779123540');
    expect(result.email).toBe('testget@example.com');
    expect(result.user_type).toBe('vendor');
    expect(result.trust_score).toBe(75);
    expect(result.gifts_points).toBe(250);
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should throw not found error for non-existent user', async () => {
    await expect(getUser({ id: 99999 })).rejects.toThrow(APIError);
  });

  it('should handle user without email', async () => {
    const userNoEmail = await userDB.queryRow<{ id: number }>`
      INSERT INTO users (name, phone, user_type)
      VALUES ('Test User No Email', '+25779123541', 'buyer')
      RETURNING id
    `;

    const result = await getUser({ id: userNoEmail!.id });

    expect(result).toBeDefined();
    expect(result.email).toBeNull();

    // Clean up
    await userDB.exec`DELETE FROM users WHERE id = ${userNoEmail!.id}`;
  });

  it('should handle user with default values', async () => {
    const userDefaults = await userDB.queryRow<{ id: number }>`
      INSERT INTO users (name, phone, user_type)
      VALUES ('Test User Defaults', '+25779123542', 'sharer')
      RETURNING id
    `;

    const result = await getUser({ id: userDefaults!.id });

    expect(result).toBeDefined();
    expect(result.trust_score).toBe(0);
    expect(result.gifts_points).toBe(0);

    // Clean up
    await userDB.exec`DELETE FROM users WHERE id = ${userDefaults!.id}`;
  });

  it('should handle all user types', async () => {
    const userTypes = ['admin', 'reseller', 'vendor', 'buyer', 'sharer'] as const;
    const userIds: number[] = [];

    // Create users of each type
    for (let i = 0; i < userTypes.length; i++) {
      const user = await userDB.queryRow<{ id: number }>`
        INSERT INTO users (name, phone, user_type)
        VALUES ('Test User Type ${userTypes[i]}', '+2577912354${3 + i}', ${userTypes[i]})
        RETURNING id
      `;
      userIds.push(user!.id);
    }

    // Verify each user type
    for (let i = 0; i < userTypes.length; i++) {
      const result = await getUser({ id: userIds[i] });
      expect(result.user_type).toBe(userTypes[i]);
    }

    // Clean up
    for (const id of userIds) {
      await userDB.exec`DELETE FROM users WHERE id = ${id}`;
    }
  });
});
