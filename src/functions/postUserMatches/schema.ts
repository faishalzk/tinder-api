export default {
  type: "object",
  properties: {
    match_id: { type: 'number' },
    is_like: { type: 'boolean' }
  },
  required: ['match_id', 'is_like']
} as const;
