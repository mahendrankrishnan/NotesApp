'use client'

import { usePathname } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { useAuth } from '@/contexts/AuthContext'
import styles from './AuthShell.module.css'

const PUBLIC_PATHS = ['/login', '/access-denied']

export default function AuthShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { isLoading } = useAuth()
  const isPublicPath = PUBLIC_PATHS.includes(pathname)

  if (isLoading) {
    return (
      <div className={styles.loading}>
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <>
      {!isPublicPath && <Header />}
      <main className="container">{children}</main>
      {!isPublicPath && <Footer />}
    </>
  )
}
