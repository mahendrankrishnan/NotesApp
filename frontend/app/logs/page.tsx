'use client'

import { useState, useEffect } from 'react'
import styles from './page.module.css'
import type { LogEvent } from '@/types/log'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4202'

interface LogStats {
  total: number
  byLevel: Record<string, number>
  byEventType: Record<string, number>
  kafkaEnabled: boolean
}

export default function LogsPage() {
  const [logs, setLogs] = useState<LogEvent[]>([])
  const [stats, setStats] = useState<LogStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [filters, setFilters] = useState({
    level: '',
    eventType: '',
    limit: '100',
  })

  const fetchLogs = async () => {
    try {
      setError(null)
      const params = new URLSearchParams()
      if (filters.level) params.append('level', filters.level)
      if (filters.eventType) params.append('eventType', filters.eventType)
      if (filters.limit) params.append('limit', filters.limit)

      const response = await fetch(`${API_URL}/api/logs?${params.toString()}`)
      if (!response.ok) {
        throw new Error('Failed to fetch logs')
      }
      const data = await response.json()
      setLogs(data.logs || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch logs')
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_URL}/api/logs/stats`)
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err)
    }
  }

  useEffect(() => {
    fetchLogs()
    fetchStats()

    if (autoRefresh) {
      const interval = setInterval(() => {
        fetchLogs()
        fetchStats()
      }, 2000) // Refresh every 2 seconds

      return () => clearInterval(interval)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.level, filters.eventType, filters.limit, autoRefresh])

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'error':
        return '#dc3545'
      case 'warn':
        return '#ffc107'
      case 'info':
        return '#007bff'
      case 'debug':
        return '#6c757d'
      default:
        return '#333'
    }
  }

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString()
  }

  return (
    <div>
      <div className={styles.header}>
        <h1 className={styles.title}>
          Application Logs
        </h1>
        <div className={styles.controls}>
          <label className={styles.autoRefreshLabel}>
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
            />
            <span>Auto-refresh</span>
          </label>
          <button
            onClick={() => {
              fetchLogs()
              fetchStats()
            }}
            className={styles.refreshButton}
          >
            Refresh
          </button>
        </div>
      </div>

      {stats && (
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statLabel}>
              Total Logs
            </div>
            <div className={styles.statValue}>
              {stats.total}
            </div>
          </div>
          {Object.entries(stats.byLevel).map(([level, count]) => (
            <div key={level} className={styles.statCard}>
              <div className={styles.statLabel}>
                {level.toUpperCase()}
              </div>
              <div
                className={styles.statValue}
                style={{ color: getLevelColor(level) }}
              >
                {count}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className={styles.filtersContainer}>
        <h2 className={styles.filtersTitle}>Filters</h2>
        <div className={styles.filtersGrid}>
          <div className={styles.filterField}>
            <label className={styles.filterLabel}>
              Level
            </label>
            <select
              value={filters.level}
              onChange={(e) => setFilters({ ...filters, level: e.target.value })}
              className={styles.filterSelect}
            >
              <option value="">All Levels</option>
              <option value="error">Error</option>
              <option value="warn">Warning</option>
              <option value="info">Info</option>
              <option value="debug">Debug</option>
            </select>
          </div>
          <div className={styles.filterField}>
            <label className={styles.filterLabel}>
              Event Type
            </label>
            <select
              value={filters.eventType}
              onChange={(e) => setFilters({ ...filters, eventType: e.target.value })}
              className={styles.filterSelect}
            >
              <option value="">All Types</option>
              <option value="api.request">API Request</option>
              <option value="api.response">API Response</option>
              <option value="api.error">API Error</option>
              <option value="database.query">Database Query</option>
              <option value="database.error">Database Error</option>
              <option value="system">System</option>
            </select>
          </div>
          <div className={styles.filterField}>
            <label className={styles.filterLabel}>
              Limit
            </label>
            <input
              type="number"
              value={filters.limit}
              onChange={(e) => setFilters({ ...filters, limit: e.target.value })}
              min="1"
              max="1000"
              className={styles.filterInput}
            />
          </div>
        </div>
      </div>

      {error && (
        <div className={styles.errorMessage}>
          {error}
        </div>
      )}

      {loading ? (
        <p className={styles.loadingMessage}>Loading logs...</p>
      ) : logs.length === 0 ? (
        <div className={styles.emptyState}>
          <p>No logs found. Make some API requests to see logs appear here.</p>
        </div>
      ) : (
        <div className={styles.logsContainer}>
          <div className={styles.logsScrollContainer}>
            <table className={styles.logsTable}>
              <thead className={styles.tableHeader}>
                <tr>
                  <th className={styles.tableHeaderCell}>
                    Timestamp
                  </th>
                  <th className={styles.tableHeaderCell}>
                    Level
                  </th>
                  <th className={styles.tableHeaderCell}>
                    Event Type
                  </th>
                  <th className={styles.tableHeaderCell}>
                    Message
                  </th>
                  <th className={styles.tableHeaderCell}>
                    Details
                  </th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log, index) => (
                  <tr key={index} className={styles.tableRow}>
                    <td className={`${styles.tableCell} ${styles.timestampCell}`}>
                      {formatTimestamp(log.timestamp)}
                    </td>
                    <td className={styles.tableCell}>
                      <span
                        className={styles.levelBadge}
                        style={{
                          backgroundColor: getLevelColor(log.level) + '20',
                          color: getLevelColor(log.level),
                        }}
                      >
                        {log.level.toUpperCase()}
                      </span>
                    </td>
                    <td className={styles.tableCell}>
                      {log.eventType}
                    </td>
                    <td className={styles.tableCell}>
                      {log.message}
                    </td>
                    <td className={styles.tableCell}>
                      <details>
                        <summary className={styles.detailsSummary}>
                          View
                        </summary>
                        <pre className={styles.detailsPre}>
                          {JSON.stringify(log.metadata, null, 2)}
                        </pre>
                      </details>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

