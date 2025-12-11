'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import NoteList from '@/components/NoteList'
import NoteForm from '@/components/NoteForm'
import NoteFilter from '@/components/NoteFilter'
import styles from './page.module.css'
import type { Note } from '@/types/note'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4202'

export default function Home() {
  const router = useRouter()
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingNote, setEditingNote] = useState<Note | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterToday, setFilterToday] = useState(false)

  const fetchNotes = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch(`${API_URL}/notes`)
      if (!response.ok) {
        throw new Error('Failed to fetch notes')
      }
      const data = await response.json()
      setNotes(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNotes()
  }, [])


  const handleUpdateNote = async (id: number, title: string, content: string) => {
    try {
      const response = await fetch(`${API_URL}/notes/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, content }),
      })

      if (!response.ok) {
        throw new Error('Failed to update note')
      }

      setEditingNote(null)
      await fetchNotes()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update note')
    }
  }

  const handleDeleteNote = async (id: number) => {
    try {
      const response = await fetch(`${API_URL}/notes/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete note')
      }

      await fetchNotes()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete note')
    }
  }

  const handleEditNote = (note: Note) => {
    setEditingNote(note)
  }

  // Filter notes based on search query and date filter
  const filteredNotes = useMemo(() => {
    let filtered = [...notes]

    // Filter by today's date if enabled
    if (filterToday) {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)

      filtered = filtered.filter((note) => {
        const noteDate = new Date(note.createdAt)
        return noteDate >= today && noteDate < tomorrow
      })
    }

    // Filter by search query (title or content)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim()
      filtered = filtered.filter((note) => {
        const titleMatch = note.title.toLowerCase().includes(query)
        const contentMatch = note.content.toLowerCase().includes(query)
        return titleMatch || contentMatch
      })
    }

    return filtered
  }, [notes, searchQuery, filterToday])

  return (
    <div>
      <div className={styles.headerSection}>
        <div className={styles.logoContainer}>
          <div className={styles.logo}>
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
          </div>
          <h1 className={styles.title}>
            My Notes
          </h1>
        </div>
        <button
          onClick={() => router.push('/notes/new')}
          className={styles.newNoteButton}
        >
          <span>+</span>
          <span>New Note</span>
        </button>
      </div>

      {error && (
        <div className={styles.errorMessage}>
          {error}
        </div>
      )}

      {editingNote && (
        <div className={styles.editFormContainer}>
          <NoteForm
            onSubmit={(title, content) => handleUpdateNote(editingNote.id, title, content)}
            initialNote={editingNote}
            onCancel={() => setEditingNote(null)}
          />
        </div>
      )}

      {!loading && notes.length > 0 && (
        <NoteFilter
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          filterToday={filterToday}
          onFilterTodayChange={setFilterToday}
          resultCount={filteredNotes.length}
        />
      )}

      {loading ? (
        <p className={styles.loadingMessage}>Loading notes...</p>
      ) : (
        <NoteList
          notes={filteredNotes}
          onEdit={handleEditNote}
          onDelete={handleDeleteNote}
          showNoResults={notes.length > 0 && filteredNotes.length === 0}
        />
      )}
    </div>
  )
}

