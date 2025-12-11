'use client'

import styles from './Header.module.css'

export default function Header() {
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
        </nav>
      </div>
    </header>
  )
}

