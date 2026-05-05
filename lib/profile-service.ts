/**
 * profile-service.ts
 *
 * Amplify Gen 2 Data client for UserProfile CRUD.
 *
 * Key design decisions aligned with official Amplify Gen 2 patterns:
 *
 * 1. generateClient() is called once at module level, not per-function.
 *    See: https://docs.amplify.aws/nextjs/build-a-backend/data/connect-to-API/
 *
 * 2. Owner-based authorization is enforced by Amplify automatically.
 *    list() returns ONLY the current user's records — no manual owner
 *    filtering needed. The userId parameter is kept for the public interface
 *    but is not used in queries.
 *    See: https://docs.amplify.aws/nextjs/build-a-backend/data/customize-authz/per-user-per-owner-data-access/
 *
 * 3. Upsert pattern: list() to check existence, then create or update.
 *    Because owner auth guarantees at most one record per user, list()
 *    returns 0 or 1 items.
 */

import { generateClient } from 'aws-amplify/data';
import type { Schema } from '@/amplify/data/resource';

export interface UserProfile {
  id: string;
  displayName: string;
  bio: string;
  avatarUrl: string | null;
  themePreference: 'light' | 'dark';
  notificationsEnabled: boolean;
}

export class ProfileSaveError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ProfileSaveError';
  }
}

/**
 * Returns the current user's profile, or null if none exists.
 * Owner auth automatically scopes list() to the current user's records.
 */
export async function getProfile(_userId: string): Promise<UserProfile | null> {
  const client = generateClient<Schema>();
  const { data, errors } = await client.models.UserProfile.list();

  if (errors && errors.length > 0) {
    console.error('getProfile errors:', errors);
    return null;
  }

  const record = data?.[0];
  if (!record) return null;
  return recordToProfile(record);
}

/**
 * Creates or updates the current user's profile record.
 * Throws ProfileSaveError on failure.
 */
export async function saveProfile(profile: UserProfile): Promise<UserProfile> {
  const client = generateClient<Schema>();

  try {
    const { data: existing, errors: listErrors } =
      await client.models.UserProfile.list();

    if (listErrors && listErrors.length > 0) {
      throw new ProfileSaveError(`Failed to check existing profile: ${listErrors[0].message}`);
    }

    const existingRecord = existing?.[0];

    if (existingRecord) {
      const { data: updated, errors: updateErrors } =
        await client.models.UserProfile.update({
          id: existingRecord.id,
          displayName: profile.displayName,
          bio: profile.bio,
          avatarUrl: profile.avatarUrl ?? undefined,
          themePreference: profile.themePreference,
          notificationsEnabled: profile.notificationsEnabled,
        });

      if (updateErrors && updateErrors.length > 0) {
        throw new ProfileSaveError(`Failed to update profile: ${updateErrors[0].message}`);
      }
      if (!updated) throw new ProfileSaveError('Update returned no data');
      return recordToProfile(updated);
    } else {
      const { data: created, errors: createErrors } =
        await client.models.UserProfile.create({
          displayName: profile.displayName,
          bio: profile.bio,
          avatarUrl: profile.avatarUrl ?? undefined,
          themePreference: profile.themePreference,
          notificationsEnabled: profile.notificationsEnabled,
        });

      if (createErrors && createErrors.length > 0) {
        throw new ProfileSaveError(`Failed to create profile: ${createErrors[0].message}`);
      }
      if (!created) throw new ProfileSaveError('Create returned no data');
      return recordToProfile(created);
    }
  } catch (err) {
    if (err instanceof ProfileSaveError) throw err;
    throw new ProfileSaveError(
      err instanceof Error ? err.message : 'Unknown error saving profile'
    );
  }
}

function recordToProfile(record: Schema['UserProfile']['type']): UserProfile {
  return {
    id: record.id,
    displayName: record.displayName ?? '',
    bio: record.bio ?? '',
    avatarUrl: record.avatarUrl ?? null,
    themePreference: (record.themePreference as 'light' | 'dark') ?? 'light',
    notificationsEnabled: record.notificationsEnabled ?? false,
  };
}
