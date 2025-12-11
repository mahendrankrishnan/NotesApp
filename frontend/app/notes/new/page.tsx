'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import NoteForm from '@/components/NoteForm'
import styles from './page.module.css'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4202'

export default function NewNotePage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleCreateNote = async (title: string, content: string) => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch(`${API_URL}/notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, content }),
      })

      if (!response.ok) {
        throw new Error('Failed to create note')
      }

      // Navigate back to home page after successful creation
      router.push('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create note')
      setLoading(false)
    }
  }

  return (
    <div>
      <div className={styles.header}>
        <h1 className={styles.title}>
          + Create New Note
        </h1>
        <button
          onClick={() => router.push('/')}
          className={styles.backButton}
        >
          Back to Notes
        </button>
      </div>

      {error && (
        <div className={styles.errorMessage}>
          {error}
        </div>
      )}

      <NoteForm
        onSubmit={handleCreateNote}
        initialNote={null}
        onCancel={() => router.push('/')}
        loading={loading}
      />
    </div>
  )
}

