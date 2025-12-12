import { FastifyInstance } from 'fastify';
import { db } from '../db/index.js';
import { notes, type NewNote } from '../db/schema.js';
import { eq } from 'drizzle-orm';
import { logger } from '../services/logger.js';
import { LogLevel, EventType } from '../types/events.js';
import {
  noteSchema,
  createNoteSchema,
  updateNoteSchema,
  noteIdParamSchema,
  errorSchema,
  successMessageSchema,
} from '../schemas/notes.js';

export async function notesRoutes(fastify: FastifyInstance) {
  // Get end point to get all notes
  fastify.get('/notes', {
    schema: {
      description: 'Get all notes',
      tags: ['notes'],
      response: {
        200: {
          type: 'array',
          items: noteSchema,
          description: 'List of all notes',
        },
        500: errorSchema,
      },
    },
  }, async (request, reply) => {
    const startTime = Date.now();
    try {
      await logger.logDatabaseQuery({
        timestamp: new Date().toISOString(),
        level: LogLevel.INFO,
        eventType: EventType.DATABASE_QUERY,
        service: process.env.SERVICE_NAME || 'notes-app-backend',
        message: 'Fetching all notes',
        metadata: {
          operation: 'SELECT',
          table: 'notes',
          duration: Date.now() - startTime,
        },
      });
      
      const allNotes = await db.select().from(notes).orderBy(notes.createdAt);
      
      await logger.logDatabaseQuery({
        timestamp: new Date().toISOString(),
        level: LogLevel.INFO,
        eventType: EventType.DATABASE_QUERY,
        service: process.env.SERVICE_NAME || 'notes-app-backend',
        message: `Fetched ${allNotes.length} notes`,
        metadata: {
          operation: 'SELECT',
          table: 'notes',
          duration: Date.now() - startTime,
        },
      });
      
      return reply.send(allNotes);
    } catch (error) {
      await logger.logDatabaseError({
        timestamp: new Date().toISOString(),
        level: LogLevel.ERROR,
        eventType: EventType.DATABASE_ERROR,
        service: process.env.SERVICE_NAME || 'notes-app-backend',
        message: 'Failed to fetch notes',
        metadata: {
          operation: 'SELECT',
          table: 'notes',
          error: {
            name: error instanceof Error ? error.name : 'UnknownError',
            message: error instanceof Error ? error.message : String(error),
          },
        },
      });
      return reply.status(500).send({ error: 'Failed to fetch notes' });
    }
  });

  // Get a single note by ID
  fastify.get<{ Params: { id: string } }>('/notes/:id', {
    schema: {
      description: 'Get a single note by ID',
      tags: ['notes'],
      params: noteIdParamSchema,
      response: {
        200: {
          ...noteSchema,
          description: 'Note details',
        },
        404: errorSchema,
        500: errorSchema,
      },
    },
  }, async (request, reply) => {
    try {
      const id = parseInt(request.params.id);
      const note = await db.select().from(notes).where(eq(notes.id, id)).limit(1);
      
      if (note.length === 0) {
        return reply.status(404).send({ error: 'Note not found for the id' });
      }
      
      return reply.send(note[0]);
    } catch (error) {
      return reply.status(500).send({ error: 'Failed to fetch note' });
    }
  });

  // Create a new note
  fastify.post<{ Body: NewNote }>('/notes', {
    schema: {
      description: 'Create a new note',
      tags: ['notes'],
      body: createNoteSchema,
      response: {
        201: {
          ...noteSchema,
          description: 'Created note',
        },
        400: errorSchema,
        500: errorSchema,
      },
    },
  }, async (request, reply) => {
    try {
      const { title, content } = request.body;

      const newNote = await db.insert(notes).values({
        title,
        content,
        updatedAt: new Date(),
      }).returning();

      return reply.status(201).send(newNote[0]);
    } catch (error) {
      return reply.status(500).send({ error: 'Failed to create note' });
    }
  });

  // Update a note
  fastify.put<{ Params: { id: string }; Body: Partial<NewNote> }>('/notes/:id', {
    schema: {
      description: 'Update an existing note',
      tags: ['notes'],
      params: noteIdParamSchema,
      body: updateNoteSchema,
      response: {
        200: {
          ...noteSchema,
          description: 'Updated note',
        },
        404: errorSchema,
        400: errorSchema,
        500: errorSchema,
      },
    },
  }, async (request, reply) => {
    try {
      const id = parseInt(request.params.id);
      const { title, content } = request.body;

      const updatedNote = await db
        .update(notes)
        .set({
          ...(title && { title }),
          ...(content && { content }),
          updatedAt: new Date(),
        })
        .where(eq(notes.id, id))
        .returning();

      if (updatedNote.length === 0) {
        return reply.status(404).send({ error: 'Note not found' });
      }

      return reply.send(updatedNote[0]);
    } catch (error) {
      return reply.status(500).send({ error: 'Failed to update note' });
    }
  });

  // Delete a note
  fastify.delete<{ Params: { id: string } }>('/notes/:id', {
    schema: {
      description: 'Delete a note by ID',
      tags: ['notes'],
      params: noteIdParamSchema,
      response: {
        200: successMessageSchema,
        404: errorSchema,
        500: errorSchema,
      },
    },
  }, async (request, reply) => {
    try {
      const id = parseInt(request.params.id);
      
      const deletedNote = await db
        .delete(notes)
        .where(eq(notes.id, id))
        .returning();

      if (deletedNote.length === 0) {
        return reply.status(404).send({ error: 'Note not found' });
      }

      return reply.send({ message: 'Note deleted successfully' });
    } catch (error) {
      return reply.status(500).send({ error: 'Failed to delete note' });
    }
  });
}

