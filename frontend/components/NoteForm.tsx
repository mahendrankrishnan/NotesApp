'use client'

import { useState, useEffect } from 'react'
import styles from './NoteForm.module.css'
import type { Note } from '@/types/note'

interface NoteFormProps {
  onSubmit: (title: string, content: string) => void
  initialNote?: Note | null
  onCancel?: () => void
  loading?: boolean
}

export default function NoteForm({ onSubmit, initialNote, onCancel, loading = false }: NoteFormProps) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')

  useEffect(() => {
    if (initialNote) {
      setTitle(initialNote.title)
      setContent(initialNote.content)
    } else {
      setTitle('')
      setContent('')
    }
  }, [initialNote])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (title.trim() && content.trim()) {
      onSubmit(title.trim(), content.trim())
      if (!initialNote) {
        setTitle('')
        setContent('')
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <h2 className={styles.title}>
        {initialNote ? 'Edit Note' : 'Create New Note'}
      </h2>
      <div className={styles.field}>
        <label htmlFor="title" className={styles.label}>
          Title
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter note title"
          required
          className={styles.input}
        />
      </div>
      <div className={styles.field}>
        <label htmlFor="content" className={styles.label}>
          Content
        </label>
        <textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Enter note content"
          required
          rows={6}
          className={styles.textarea}
        />
      </div>
      <div className={styles.actions}>
        <button
          type="submit"
          disabled={loading}
          className={`${styles.button} ${styles.submitButton}`}
        >
          {loading ? 'Saving...' : (initialNote ? 'Update Note' : 'Create Note')}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className={`${styles.button} ${styles.cancelButton}`}
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  )
}

