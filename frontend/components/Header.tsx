'use client'

import { useAuth } from '@/contexts/AuthContext'
import styles from './Header.module.css'

export default function Header() {
  const { session, logout } = useAuth()

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <h1 className={styles.title}>
          Notes App
        </h1>
        <nav className={styles.nav}>
          <a href="/" className={styles.navLink}>
            Home
          </a>
          <a href="/logs" className={styles.navLink}>
            Logs
          </a>
          {session && (
            <div className={styles.userSection}>
              <span className={styles.userInfo}>
                {session.username}
                {session.roles && session.roles.length > 0 && (
                  <span className={styles.roles}> ({session.roles.join(', ')})</span>
                )}
              </span>
              <button className={styles.logoutButton} type="button" onClick={logout}>
                Sign Out
              </button>
            </div>
          )}
        </nav>
      </div>
    </header>
  )
}
