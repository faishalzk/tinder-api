export default {
  type: "object",
  properties: {
    email: { type: 'string' },
    password: { type: 'string' },
    name: { type: 'string' },
    gender: { type: 'number' },
    location: { type: 'string' },
    age: { type: 'number' },
    description: { type: 'string' }
  },
  required: ['email', 'password', 'name', 'gender']
} as const;
