import { defineStorage } from '@aws-amplify/backend';

export const storage = defineStorage({
  name: 'avatarStorage',
  access: (allow) => ({
    'avatars/{entity_id}/*': [
      allow.entity('identity').to(['read', 'write', 'delete']),
    ],
  }),
});
