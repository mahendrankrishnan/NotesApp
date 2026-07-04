'use client'

import { useAuth } from '@/contexts/AuthContext'
import styles from './page.module.css'

export default function AccessDeniedPage() {
  const { logout } = useAuth()

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>Access Denied</h1>
        <p className={styles.message}>
          You do not have permission to access this application. Access requires
          the <strong>MyNote</strong> application with at least one assigned role.
        </p>
        <p className={styles.detail}>
          You have been signed out. Contact your administrator if you believe this is an error.
        </p>
        <button className={styles.button} type="button" onClick={logout}>
          Return to Sign In
        </button>
      </div>
    </div>
  )
}
