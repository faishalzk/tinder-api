export default {
  type: "object",
  properties: {
    user_id: { type: 'number' },
    match_id: { type: 'number' },
    is_like: { type: 'boolean' }
  },
  required: ['user_id', 'match_id']
} as const;
