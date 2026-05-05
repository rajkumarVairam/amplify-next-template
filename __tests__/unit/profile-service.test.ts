// Feature: dashboard-and-profile, Property 13: Profile upsert — one record per user
// Feature: dashboard-and-profile, Property 14: Profile data round-trip

import * as fc from 'fast-check';
import { vi, describe, it, beforeEach } from 'vitest';

import {
  getProfile,
  saveProfile,
  type UserProfile,
} from '@/lib/profile-service';

// ---------------------------------------------------------------------------
// Module mocks
// ---------------------------------------------------------------------------

vi.mock('aws-amplify/data', () => ({
  generateClient: vi.fn(),
}));

import { generateClient } from 'aws-amplify/data';
// Cast to any to avoid TypeScript's excessive stack depth error on deeply
// nested Amplify generated types. This is a compiler limitation, not a
// runtime issue — the mock works correctly at runtime.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockGenerateClient = vi.mocked(generateClient) as any;

// ---------------------------------------------------------------------------
// In-memory mock store
// Simulates Amplify Data with owner-auth scoping.
// list() returns all records in the store — in production Amplify
// automatically scopes this to the current user's records.
// ---------------------------------------------------------------------------
function createMockStore() {
  const records: Array<Record<string, unknown>> = [];
  let idCounter = 1;

  const mockClient = {
    models: {
      UserProfile: {
        list: vi.fn(async () => ({ data: [...records], errors: null })),
        create: vi.fn(async (input: Record<string, unknown>) => {
          const newRecord = {
            id: String(idCounter++),
            displayName: input['displayName'] ?? '',
            bio: input['bio'] ?? '',
            avatarUrl: input['avatarUrl'] ?? null,
            themePreference: input['themePreference'] ?? 'light',
            notificationsEnabled: input['notificationsEnabled'] ?? false,
          };
          records.push(newRecord);
          return { data: { ...newRecord }, errors: null };
        }),
        update: vi.fn(async (input: Record<string, unknown>) => {
          const idx = records.findIndex((r) => r['id'] === input['id']);
          if (idx === -1) {
            return { data: null, errors: [{ message: 'Record not found' }] };
          }
          const updated = {
            ...records[idx],
            displayName: input['displayName'] ?? records[idx]['displayName'],
            bio: input['bio'] ?? records[idx]['bio'],
            avatarUrl: input['avatarUrl'] !== undefined
              ? input['avatarUrl']
              : records[idx]['avatarUrl'],
            themePreference: input['themePreference'] ?? records[idx]['themePreference'],
            notificationsEnabled: input['notificationsEnabled'] !== undefined
              ? input['notificationsEnabled']
              : records[idx]['notificationsEnabled'],
          };
          records[idx] = updated;
          return { data: { ...updated }, errors: null };
        }),
      },
    },
  };

  return { mockClient, records };
}

// ---------------------------------------------------------------------------
// Property 13: Profile upsert — one record per user
// Validates: Requirements 9.1, 9.2, 9.3
// ---------------------------------------------------------------------------

describe('Property 13: Profile upsert — one record per user', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('saving N times results in exactly one record with the most recently saved values',
    async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1 }),
          fc.integer({ min: 1, max: 10 }),
          async (userId, n) => {
            const { mockClient, records } = createMockStore();
            mockGenerateClient.mockReturnValue(mockClient);

            let lastProfile: UserProfile | null = null;
            for (let i = 0; i < n; i++) {
              lastProfile = await saveProfile({
                id: userId,
                displayName: `Name ${i}`,
                bio: `Bio ${i}`,
                avatarUrl: null,
                themePreference: i % 2 === 0 ? 'light' : 'dark',
                notificationsEnabled: i % 2 === 0,
              });
            }

            if (records.length !== 1) return false;
            if (!lastProfile) return false;
            const stored = records[0];
            return (
              stored['displayName'] === lastProfile.displayName &&
              stored['bio'] === lastProfile.bio &&
              stored['themePreference'] === lastProfile.themePreference &&
              stored['notificationsEnabled'] === lastProfile.notificationsEnabled
            );
          }
        ),
        { numRuns: 100 }
      );
    }
  );
});

// ---------------------------------------------------------------------------
// Property 14: Profile data round-trip
// Validates: Requirements 9.4
// ---------------------------------------------------------------------------

describe('Property 14: Profile data round-trip', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('saving then reading back returns equal field values for any valid UserProfile',
    async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            displayName: fc.string({ minLength: 1, maxLength: 64 }),
            bio: fc.string({ maxLength: 280 }),
            themePreference: fc.constantFrom('light' as const, 'dark' as const),
            notificationsEnabled: fc.boolean(),
          }),
          async (fields) => {
            const { mockClient } = createMockStore();
            mockGenerateClient.mockReturnValue(mockClient);

            const profile: UserProfile = { id: 'round-trip-user', avatarUrl: null, ...fields };
            await saveProfile(profile);
            const retrieved = await getProfile(profile.id);

            if (!retrieved) return false;
            return (
              retrieved.displayName === profile.displayName &&
              retrieved.bio === profile.bio &&
              retrieved.themePreference === profile.themePreference &&
              retrieved.notificationsEnabled === profile.notificationsEnabled &&
              retrieved.avatarUrl === profile.avatarUrl
            );
          }
        ),
        { numRuns: 100 }
      );
    }
  );
});
