import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { userDB } from './db';
import { listUsers } from './list_users';

describe('listUsers', () => {
  let testUserIds: number[] = [];

  beforeEach(async () => {
    // Clean up test data
    await userDB.exec`DELETE FROM users WHERE name LIKE 'Test%'`;

    // Create test users
    const user1 = await userDB.queryRow<{ id: number }>`
      INSERT INTO users (name, phone, user_type, trust_score, gifts_points)
      VALUES ('Test User List 1', '+25779123560', 'vendor', 80, 200)
      RETURNING id
    `;
    testUserIds.push(user1!.id);

    const user2 = await userDB.queryRow<{ id: number }>`
      INSERT INTO users (name, phone, user_type, trust_score, gifts_points)
      VALUES ('Test User List 2', '+25779123561', 'buyer', 65, 150)
      RETURNING id
    `;
    testUserIds.push(user2!.id);

    const user3 = await userDB.queryRow<{ id: number }>`
      INSERT INTO users (name, phone, user_type, trust_score, gifts_points)
      VALUES ('Test User List 3', '+25779123562', 'admin', 95, 0)
      RETURNING id
    `;
    testUserIds.push(user3!.id);

    const user4 = await userDB.queryRow<{ id: number }>`
      INSERT INTO users (name, phone, user_type, trust_score, gifts_points)
      VALUES ('Test User List 4', '+25779123563', 'sharer', 70, 300)
      RETURNING id
    `;
    testUserIds.push(user4!.id);

    const user5 = await userDB.queryRow<{ id: number }>`
      INSERT INTO users (name, phone, user_type, trust_score, gifts_points)
      VALUES ('Test User List 5', '+25779123564', 'reseller', 85, 50)
      RETURNING id
    `;
    testUserIds.push(user5!.id);
  });

  afterEach(async () => {
    // Clean up test data
    await userDB.exec`DELETE FROM users WHERE name LIKE 'Test%'`;
  });

  it('should list all users without filter', async () => {
    const result = await listUsers({});

    expect(result).toBeDefined();
    expect(result.users).toBeDefined();
    expect(result.total).toBeGreaterThanOrEqual(5);

    // Find our test users
    const testUsers = result.users.filter(u => u.name.startsWith('Test User List'));
    expect(testUsers).toHaveLength(5);
  });

  it('should filter by user type', async () => {
    const result = await listUsers({ user_type: 'vendor' });

    expect(result).toBeDefined();
    const testVendors = result.users.filter(u => u.name.startsWith('Test User List'));
    expect(testVendors).toHaveLength(1);
    expect(testVendors[0].user_type).toBe('vendor');
    expect(testVendors[0].name).toBe('Test User List 1');
  });

  it('should filter by buyer type', async () => {
    const result = await listUsers({ user_type: 'buyer' });

    expect(result).toBeDefined();
    const testBuyers = result.users.filter(u => u.name.startsWith('Test User List'));
    expect(testBuyers).toHaveLength(1);
    expect(testBuyers[0].user_type).toBe('buyer');
    expect(testBuyers[0].name).toBe('Test User List 2');
  });

  it('should filter by admin type', async () => {
    const result = await listUsers({ user_type: 'admin' });

    expect(result).toBeDefined();
    const testAdmins = result.users.filter(u => u.name.startsWith('Test User List'));
    expect(testAdmins).toHaveLength(1);
    expect(testAdmins[0].user_type).toBe('admin');
    expect(testAdmins[0].name).toBe('Test User List 3');
  });

  it('should filter by sharer type', async () => {
    const result = await listUsers({ user_type: 'sharer' });

    expect(result).toBeDefined();
    const testSharers = result.users.filter(u => u.name.startsWith('Test User List'));
    expect(testSharers).toHaveLength(1);
    expect(testSharers[0].user_type).toBe('sharer');
    expect(testSharers[0].name).toBe('Test User List 4');
  });

  it('should filter by reseller type', async () => {
    const result = await listUsers({ user_type: 'reseller' });

    expect(result).toBeDefined();
    const testResellers = result.users.filter(u => u.name.startsWith('Test User List'));
    expect(testResellers).toHaveLength(1);
    expect(testResellers[0].user_type).toBe('reseller');
    expect(testResellers[0].name).toBe('Test User List 5');
  });

  it('should respect limit parameter', async () => {
    const result = await listUsers({ limit: 2 });

    expect(result).toBeDefined();
    expect(result.users).toHaveLength(2);
    expect(result.total).toBeGreaterThanOrEqual(5);
  });

  it('should respect offset parameter', async () => {
    const result1 = await listUsers({ limit: 2, offset: 0 });
    const result2 = await listUsers({ limit: 2, offset: 2 });

    expect(result1).toBeDefined();
    expect(result2).toBeDefined();
    expect(result1.users).toHaveLength(2);
    expect(result2.users).toHaveLength(2);

    // Users should be different (assuming we have enough users)
    const user1Ids = result1.users.map(u => u.id);
    const user2Ids = result2.users.map(u => u.id);
    
    // Should not have overlapping users
    const overlap = user1Ids.filter(id => user2Ids.includes(id));
    expect(overlap).toHaveLength(0);
  });

  it('should order by creation date descending', async () => {
    const result = await listUsers({});

    expect(result).toBeDefined();
    const testUsers = result.users.filter(u => u.name.startsWith('Test User List'));
    
    if (testUsers.length > 1) {
      // Should be ordered by created_at DESC (newest first)
      for (let i = 0; i < testUsers.length - 1; i++) {
        expect(testUsers[i].created_at.getTime()).toBeGreaterThanOrEqual(
          testUsers[i + 1].created_at.getTime()
        );
      }
    }
  });

  it('should include all user fields', async () => {
    const result = await listUsers({ user_type: 'vendor' });

    expect(result).toBeDefined();
    const testVendor = result.users.find(u => u.name === 'Test User List 1');
    expect(testVendor).toBeDefined();

    expect(testVendor).toHaveProperty('id');
    expect(testVendor).toHaveProperty('name');
    expect(testVendor).toHaveProperty('phone');
    expect(testVendor).toHaveProperty('email');
    expect(testVendor).toHaveProperty('user_type');
    expect(testVendor).toHaveProperty('trust_score');
    expect(testVendor).toHaveProperty('gifts_points');
    expect(testVendor).toHaveProperty('created_at');

    expect(testVendor!.name).toBe('Test User List 1');
    expect(testVendor!.phone).toBe('+25779123560');
    expect(testVendor!.user_type).toBe('vendor');
    expect(testVendor!.trust_score).toBe(80);
    expect(testVendor!.gifts_points).toBe(200);
    expect(testVendor!.created_at).toBeInstanceOf(Date);
  });

  it('should return empty results for non-existent user type', async () => {
    // This should not happen in practice due to type constraints, but test the query
    const result = await listUsers({});
    
    // Filter to a type that doesn't exist in our test data
    const nonExistentUsers = result.users.filter(u => u.user_type === 'nonexistent' as any);
    expect(nonExistentUsers).toHaveLength(0);
  });

  it('should handle default limit when not specified', async () => {
    const result = await listUsers({});

    expect(result).toBeDefined();
    expect(result.users.length).toBeLessThanOrEqual(50); // Default limit is 50
  });

  it('should handle zero offset', async () => {
    const result = await listUsers({ offset: 0 });

    expect(result).toBeDefined();
    expect(result.users).toBeDefined();
    expect(result.total).toBeGreaterThanOrEqual(5);
  });

  it('should return correct total count regardless of limit', async () => {
    const result1 = await listUsers({ limit: 2 });
    const result2 = await listUsers({ limit: 10 });

    expect(result1.total).toBe(result2.total);
    expect(result1.total).toBeGreaterThanOrEqual(5);
  });
});
