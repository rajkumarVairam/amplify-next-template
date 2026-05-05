import { type ClientSchema, a, defineData } from '@aws-amplify/backend';

const schema = a.schema({
  UserProfile: a
    .model({
      displayName: a.string().required(),
      bio: a.string(),
      avatarUrl: a.string(),
      themePreference: a.enum(['light', 'dark']),
      notificationsEnabled: a.boolean(),
    })
    .authorization((allow) => [allow.owner()]),
});

export type Schema = ClientSchema<typeof schema>;
export const data = defineData({ schema });
