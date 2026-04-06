import React, { useRef, useState } from 'react'
import styles from './WelcomeModal.module.css'
import { supabase } from '../lib/supabaseClient'

interface Props {
  onDemo: () => void
  onNew: () => void
  onLoad: (pattern: any) => void
}

export const WelcomeModal: React.FC<Props> = ({ onDemo, onNew, onLoad }) => {
  const fileRef = useRef<HTMLInputElement>(null)

  const [error, setError] = useState('')
  const [mode, setMode] = useState<'menu' | 'auth'>('menu')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  // 📂 LOAD JSON
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setError('')
    const reader = new FileReader()

    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target?.result as string)

        if (!parsed.tracks || !Array.isArray(parsed.tracks)) {
          throw new Error('Format invalide')
        }

        onLoad(parsed)
      } catch {
        setError('Fichier invalide. Chargez un fichier .json BeatStudio.')
        if (fileRef.current) fileRef.current.value = ''
      }
    }

    reader.readAsText(file)
  }

  // 🔐 LOGIN
  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      alert(error.message)
    } else {
      alert('Connecté !')
      setMode('menu')
    }
  }

  // 🆕 SIGNUP
  const handleSignUp = async () => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      alert(error.message)
    } else {
      alert('Compte créé !')
      setMode('menu')
    }
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>

        {/* HEADER */}
        <div className={styles.header}>
          <div className={styles.logo}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="#7c3aed">
              <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
            </svg>
            <span>BeatStudio</span>
          </div>

          <p className={styles.subtitle}>
            {mode === 'menu'
              ? 'Que souhaitez-vous faire ?'
              : 'Connexion / Premium'}
          </p>
        </div>

        {/* ================= MENU ================= */}
        {mode === 'menu' && (
          <div className={styles.options}>

            {/* DEMO */}
            <button className={styles.card} onClick={onDemo}>
              <div className={`${styles.iconWrap} ${styles.iconDemo}`}>
                ▶
              </div>
              <div className={styles.cardText}>
                <span className={styles.cardTitle}>Démo</span>
                <span className={styles.cardSub}>
                  Découvrir avec un pattern exemple
                </span>
              </div>
              <div className={styles.arrow}>→</div>
            </button>

            {/* NEW */}
            <button className={styles.card} onClick={onNew}>
              <div className={`${styles.iconWrap} ${styles.iconNew}`}>
                +
              </div>
              <div className={styles.cardText}>
                <span className={styles.cardTitle}>Nouveau projet</span>
                <span className={styles.cardSub}>
                  Partir d'une page blanche
                </span>
              </div>
              <div className={styles.arrow}>→</div>
            </button>

            {/* LOAD */}
            <button
              className={styles.card}
              onClick={() => {
                setError('')
                fileRef.current?.click()
              }}
            >
              <div className={`${styles.iconWrap} ${styles.iconLoad}`}>
                📂
              </div>
              <div className={styles.cardText}>
                <span className={styles.cardTitle}>Ouvrir un projet</span>
                <span className={styles.cardSub}>
                  Charger un fichier .json BeatStudio
                </span>
              </div>
              <div className={styles.arrow}>→</div>
            </button>

            {/* PREMIUM */}
            <button
              className={styles.card}
              onClick={() => setMode('auth')}
            >
              <div className={styles.iconWrap}>
                💎
              </div>
              <div className={styles.cardText}>
                <span className={styles.cardTitle}>Compte / Premium</span>
                <span className={styles.cardSub}>
                  Connexion ou accès premium
                </span>
              </div>
              <div className={styles.arrow}>→</div>
            </button>

          </div>
        )}

        {/* ================= AUTH ================= */}
        {mode === 'auth' && (
          <div className={styles.options}>

            <input
              className={styles.input}
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <input
              className={styles.input}
              placeholder="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <button className={styles.card} onClick={handleLogin}>
              🔐 Login
            </button>

            <button className={styles.card} onClick={handleSignUp}>
              ✨ Sign Up
            </button>

            <button
              className={styles.card}
              onClick={() => setMode('menu')}
            >
              ← Retour
            </button>

          </div>
        )}

        <input
          ref={fileRef}
          type="file"
          accept=".json"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />

        {error && (
          <div className={styles.errorBox}>
            {error}
          </div>
        )}

        <p className={styles.footer}>
          v1.2.5 · Open Source · MIT License · Sébastien Cantrelle
        </p>

      </div>
    </div>
  )
}