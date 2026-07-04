'use client'

import { FormEvent, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { formatPhoneNumber, getPhoneDigits } from '@/lib/phone'
import styles from './page.module.css'

export default function LoginPage() {
  const { signIn, isLoading } = useAuth()
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const handlePhoneChange = (value: string) => {
    setPhone(formatPhoneNumber(value))
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError(null)

    const phoneDigits = getPhoneDigits(phone)

    if (!email.trim() || phoneDigits.length !== 10 || !password) {
      setError('Please enter your email, a complete 10-digit phone number, and password.')
      return
    }

    setSubmitting(true)
    try {
      const result = await signIn({
        email: email.trim(),
        phone: phone.trim(),
        password,
      })

      if (result === 'failed') {
        setError('Invalid credentials. Please check your email, phone, and password.')
      }
    } catch {
      setError('Authentication failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className={styles.page}>
        <p className={styles.message}>Loading...</p>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>Sign In</h1>
        <p className={styles.subtitle}>
          Sign in with your credentials. Access to MyNote will be verified
          before you can continue.
        </p>

        <form className={styles.form} onSubmit={handleSubmit}>
          <label className={styles.label}>
            Email
            <input
              className={styles.input}
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
          </label>

          <label className={styles.label}>
            Phone
            <input
              className={styles.input}
              type="tel"
              value={phone}
              onChange={(event) => handlePhoneChange(event.target.value)}
              placeholder="(410) 336-7582"
              autoComplete="tel"
              required
            />
          </label>

          <label className={styles.label}>
            Password
            <input
              className={styles.input}
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
              autoComplete="current-password"
              required
            />
          </label>

          {error && <p className={styles.error}>{error}</p>}

          <button
            className={styles.button}
            type="submit"
            disabled={submitting}
          >
            {submitting ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  )
}
