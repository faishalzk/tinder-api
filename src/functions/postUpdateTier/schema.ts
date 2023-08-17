export default {
  type: "object",
  properties: {
    user_tier: { type: 'number' },
  },
  required: ['user_tier']
} as const;
