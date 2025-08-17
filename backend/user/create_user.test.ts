import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { userDB } from './db';
import { createUser } from './create_user';

describe('createUser', () => {
  beforeEach(async () => {
    // Clean up test data
    await userDB.exec`DELETE FROM users WHERE name LIKE 'Test%'`;
  });

  afterEach(async () => {
    // Clean up test data
    await userDB.exec`DELETE FROM users WHERE name LIKE 'Test%'`;
  });

  it('should create a basic user', async () => {
    const request = {
      name: 'Test User',
      phone: '+25779123520',
      user_type: 'buyer' as const
    };

    const result = await createUser(request);

    expect(result).toBeDefined();
    expect(result.name).toBe('Test User');
    expect(result.phone).toBe('+25779123520');
    expect(result.user_type).toBe('buyer');
    expect(result.trust_score).toBe(0);
    expect(result.gifts_points).toBe(0);
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should create user with email', async () => {
    const request = {
      name: 'Test User Email',
      phone: '+25779123521',
      email: 'test@example.com',
      user_type: 'vendor' as const
    };

    const result = await createUser(request);

    expect(result).toBeDefined();
    expect(result.name).toBe('Test User Email');
    expect(result.email).toBe('test@example.com');
    expect(result.user_type).toBe('vendor');
  });

  it('should create admin user', async () => {
    const request = {
      name: 'Test Admin',
      phone: '+25779123522',
      user_type: 'admin' as const
    };

    const result = await createUser(request);

    expect(result).toBeDefined();
    expect(result.user_type).toBe('admin');
  });

  it('should create reseller user', async () => {
    const request = {
      name: 'Test Reseller',
      phone: '+25779123523',
      user_type: 'reseller' as const
    };

    const result = await createUser(request);

    expect(result).toBeDefined();
    expect(result.user_type).toBe('reseller');
  });

  it('should create sharer user', async () => {
    const request = {
      name: 'Test Sharer',
      phone: '+25779123524',
      user_type: 'sharer' as const
    };

    const result = await createUser(request);

    expect(result).toBeDefined();
    expect(result.user_type).toBe('sharer');
  });

  it('should enforce unique phone numbers', async () => {
    const request1 = {
      name: 'Test User 1',
      phone: '+25779123525',
      user_type: 'buyer' as const
    };

    const request2 = {
      name: 'Test User 2',
      phone: '+25779123525', // Same phone
      user_type: 'vendor' as const
    };

    await createUser(request1);
    
    // Second user with same phone should fail
    await expect(createUser(request2)).rejects.toThrow();
  });

  it('should set default values correctly', async () => {
    const request = {
      name: 'Test User Defaults',
      phone: '+25779123526',
      user_type: 'buyer' as const
    };

    const result = await createUser(request);

    expect(result.trust_score).toBe(0);
    expect(result.gifts_points).toBe(0);
    expect(result.email).toBeNull();
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should handle all user types', async () => {
    const userTypes = ['admin', 'reseller', 'vendor', 'buyer', 'sharer'] as const;
    
    for (let i = 0; i < userTypes.length; i++) {
      const request = {
        name: `Test User ${userTypes[i]}`,
        phone: `+2577912352${7 + i}`,
        user_type: userTypes[i]
      };

      const result = await createUser(request);
      expect(result.user_type).toBe(userTypes[i]);
    }
  });

  it('should throw error when required fields are missing', async () => {
    // Missing name
    await expect(createUser({
      name: '',
      phone: '+25779123530',
      user_type: 'buyer'
    })).rejects.toThrow();

    // Missing phone
    await expect(createUser({
      name: 'Test User',
      phone: '',
      user_type: 'buyer'
    })).rejects.toThrow();
  });
});
