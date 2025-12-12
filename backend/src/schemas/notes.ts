export const noteSchema = {
  type: 'object',
  properties: {
    id: { type: 'integer', description: 'Unique identifier for the note' },
    title: { type: 'string', description: 'Title of the note' },
    content: { type: 'string', description: 'Content of the note' },
    createdAt: { type: 'string', format: 'date-time', description: 'Creation timestamp' },
    updatedAt: { type: 'string', format: 'date-time', description: 'Last update timestamp' },
  },
  required: ['id', 'title', 'content', 'createdAt', 'updatedAt'],
} as const;

export const createNoteSchema = {
  type: 'object',
  properties: {
    title: { 
      type: 'string', 
      minLength: 1,
      maxLength: 500,
      description: 'Title of the note' 
    },
    content: { 
      type: 'string', 
      minLength: 1,
      maxLength: 10000,
      description: 'Content of the note' 
    },
  },
  required: ['title', 'content'],
  additionalProperties: false,
} as const;

export const updateNoteSchema = {
  type: 'object',
  properties: {
    title: { 
      type: 'string', 
      minLength: 1,
      maxLength: 500,
      description: 'Title of the note' 
    },
    content: { 
      type: 'string', 
      minLength: 1,
      maxLength: 10000,
      description: 'Content of the note' 
    },
  },
  minProperties: 1,
  additionalProperties: false,
} as const;

export const noteIdParamSchema = {
  type: 'object',
  properties: {
    id: { 
      type: 'string', 
      pattern: '^[0-9]+$',
      description: 'Note ID' 
    },
  },
  required: ['id'],
} as const;

export const errorSchema = {
  type: 'object',
  properties: {
    error: { 
      type: 'string',
      description: 'Error message' 
    },
  },
  required: ['error'],
} as const;

export const successMessageSchema = {
  type: 'object',
  properties: {
    message: { 
      type: 'string',
      description: 'Success message' 
    },
  },
  required: ['message'],
} as const;

