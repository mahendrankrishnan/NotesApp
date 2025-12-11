import { FastifyInstance } from 'fastify';
import { db } from '../db/index.js';
import { notes, type NewNote } from '../db/schema.js';
import { eq } from 'drizzle-orm';
import { logger } from '../services/logger.js';
import { LogLevel, EventType } from '../types/events.js';

export async function notesRoutes(fastify: FastifyInstance) {
  // Get end point to get all notes
  fastify.get('/notes', async (request, reply) => {
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
  fastify.get<{ Params: { id: string } }>('/notes/:id', async (request, reply) => {
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
  fastify.post<{ Body: NewNote }>('/notes', async (request, reply) => {
    try {
      const { title, content } = request.body;
      
      if (!title || !content) {
        return reply.status(400).send({ error: 'Title and content are required' });
      }

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
  fastify.put<{ Params: { id: string }; Body: Partial<NewNote> }>('/notes/:id', async (request, reply) => {
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
  fastify.delete<{ Params: { id: string } }>('/notes/:id', async (request, reply) => {
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

