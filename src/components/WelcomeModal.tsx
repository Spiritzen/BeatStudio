import React, { useRef, useState } from 'react'
import styles from './WelcomeModal.module.css'

interface Props {
  onDemo: () => void
  onNew: () => void
  onLoad: (pattern: any) => void
}

export const WelcomeModal: React.FC<Props> = ({ onDemo, onNew, onLoad }) => {
  const fileRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState('')

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

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>

        {/* Header */}
        <div className={styles.header}>
          <div className={styles.logo}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="#7c3aed">
              <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
            </svg>
            <span>BeatStudio</span>
          </div>
          <p className={styles.subtitle}>Que souhaitez-vous faire ?</p>
        </div>

        {/* Options */}
        <div className={styles.options}>

          {/* Démo */}
          <button className={styles.card} onClick={onDemo}>
            <div className={`${styles.iconWrap} ${styles.iconDemo}`}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z"/>
              </svg>
            </div>
            <div className={styles.cardText}>
              <span className={styles.cardTitle}>Démo</span>
              <span className={styles.cardSub}>Découvrir avec un pattern exemple</span>
            </div>
            <div className={styles.arrow}>→</div>
          </button>

          {/* Nouveau projet */}
          <button className={styles.card} onClick={onNew}>
            <div className={`${styles.iconWrap} ${styles.iconNew}`}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
              </svg>
            </div>
            <div className={styles.cardText}>
              <span className={styles.cardTitle}>Nouveau projet</span>
              <span className={styles.cardSub}>Partir d'une page blanche</span>
            </div>
            <div className={styles.arrow}>→</div>
          </button>

          {/* Ouvrir */}
          <button className={styles.card} onClick={() => {
            setError('')
            fileRef.current?.click()
          }}>
            <div className={`${styles.iconWrap} ${styles.iconLoad}`}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20 6h-8l-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2z"/>
              </svg>
            </div>
            <div className={styles.cardText}>
              <span className={styles.cardTitle}>Ouvrir un projet</span>
              <span className={styles.cardSub}>Charger un fichier .json BeatStudio</span>
            </div>
            <div className={styles.arrow}>→</div>
          </button>

        </div>

        <input
          ref={fileRef}
          type="file"
          accept=".json"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />

        {error && (
          <div className={styles.errorBox}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
            </svg>
            {error}
          </div>
        )}

        <p className={styles.footer}>
          v1.2.2 · Open Source · MIT License · Sébastien Cantrelle
        </p>

      </div>
    </div>
  )
}
