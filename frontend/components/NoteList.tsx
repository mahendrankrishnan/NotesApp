'use client'

import styles from './NoteList.module.css'
import type { Note } from '@/types/note'

interface NoteListProps {
  notes: Note[]
  onEdit: (note: Note) => void
  onDelete: (id: number) => void
  showNoResults?: boolean
}

export default function NoteList({ notes, onEdit, onDelete, showNoResults = false }: NoteListProps) {
  if (showNoResults) {
    return (
      <div className={styles.emptyState}>
        <p>No notes found matching your search criteria.</p>
        <p className={styles.emptyStateMessage}>
          Try adjusting your filters or search query.
        </p>
      </div>
    )
  }

  if (notes.length === 0) {
    return (
      <div className={styles.emptyState}>
        <p>No notes yet. Click "New Note" to create your first note!</p>
      </div>
    )
  }

  return (
    <div className={styles.notesGrid}>
      {notes.map((note) => (
        <div key={note.id} className={styles.noteCard}>
          <h3 className={styles.noteTitle}>
            {note.title}
          </h3>
          <p className={styles.noteContent}>
            {note.content}
          </p>
          <div className={styles.noteDate}>
            {new Date(note.createdAt).toLocaleDateString()}
          </div>
          <div className={styles.noteActions}>
            <button
              onClick={() => onEdit(note)}
              className={`${styles.button} ${styles.editButton}`}
            >
              Edit
            </button>
            <button
              onClick={() => {
                if (confirm('Are you sure you want to delete this note?')) {
                  onDelete(note.id)
                }
              }}
              className={`${styles.button} ${styles.deleteButton}`}
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

