export default {
  type: "object",
  properties: {
    grant_type: { type: 'string' }
  },
  required: ['grant_type']
} as const;
