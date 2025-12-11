'use client'

import styles from './NoteFilter.module.css'

interface NoteFilterProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  filterToday: boolean
  onFilterTodayChange: (filter: boolean) => void
  resultCount: number
}

export default function NoteFilter({
  searchQuery,
  onSearchChange,
  filterToday,
  onFilterTodayChange,
  resultCount,
}: NoteFilterProps) {
  return (
    <div className={styles.filterContainer}>
      <div className={styles.filterContent}>
        <div className={styles.filterRow}>
          <div className={styles.searchContainer}>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#666"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={styles.searchIcon}
            >
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>
            <input
              type="text"
              placeholder="Search by title or description..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className={styles.searchInput}
            />
          </div>
          <label className={`${styles.filterCheckboxLabel} ${filterToday ? styles.active : ''}`}>
            <input
              type="checkbox"
              checked={filterToday}
              onChange={(e) => onFilterTodayChange(e.target.checked)}
              className={styles.filterCheckbox}
            />
            <span>Today's Notes</span>
          </label>
          {(searchQuery || filterToday) && (
            <button
              onClick={() => {
                onSearchChange('')
                onFilterTodayChange(false)
              }}
              className={styles.clearButton}
            >
              Clear Filters
            </button>
          )}
        </div>
        {(searchQuery || filterToday) && (
          <div className={styles.resultCount}>
            Found {resultCount} note{resultCount !== 1 ? 's' : ''}
            {searchQuery && ` matching "${searchQuery}"`}
            {filterToday && ' from today'}
          </div>
        )}
      </div>
    </div>
  )
}

