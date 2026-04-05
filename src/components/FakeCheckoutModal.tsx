import { useState, useEffect } from 'react'
import styles from './FakeCheckoutModal.module.css'

interface Props {
  onClose: () => void
  onSuccess: () => void
}

export const FakeCheckoutModal = ({ onClose, onSuccess }: Props) => {
  const [step, setStep] = useState<'pricing' | 'payment' | 'success'>('pricing')
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    email: '',
    cardNumber: '',
    expiry: '',
    cvv: '',
    name: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    console.log('📊 [TRACK] checkout_opened', { timestamp: new Date().toISOString() })
  }, [])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    if (!form.email.includes('@')) newErrors.email = 'Email invalide'
    if (form.cardNumber.replace(/\s/g, '').length < 16)
      newErrors.cardNumber = 'Numéro de carte invalide'
    if (!form.expiry.match(/^\d{2}\/\d{2}$/))
      newErrors.expiry = 'Format MM/AA requis'
    if (form.cvv.length < 3) newErrors.cvv = 'CVV invalide'
    if (!form.name.trim()) newErrors.name = 'Nom requis'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handlePayment = async () => {
    if (!validateForm()) return

    console.log('📊 [TRACK] checkout_payment_submitted', {
      email: form.email,
      timestamp: new Date().toISOString(),
    })

    setLoading(true)
    await new Promise(r => setTimeout(r, 2000))
    setLoading(false)
    setStep('success')

    console.log('📊 [TRACK] checkout_payment_success', {
      email: form.email,
      timestamp: new Date().toISOString(),
    })

    localStorage.setItem('premium', 'true')
    setTimeout(() => onSuccess(), 1500)
  }

  const formatCardNumber = (val: string) =>
    val.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim()

  const formatExpiry = (val: string) =>
    val.replace(/\D/g, '').slice(0, 4).replace(/^(\d{2})(\d)/, '$1/$2')

  if (step === 'success') {
    return (
      <div className={styles.overlay}>
        <div className={styles.modal}>
          <div className={styles.success}>
            <div className={styles.successIcon}>✓</div>
            <h2>Bienvenue dans BeatStudio Premium !</h2>
            <p>Votre accès illimité est maintenant actif.</p>
            <p style={{ fontSize: '13px', color: '#9090b0' }}>
              Export WAV illimité · Toutes les features débloquées
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (step === 'pricing') {
    return (
      <div className={styles.overlay} onClick={onClose}>
        <div className={styles.modal} onClick={e => e.stopPropagation()}>

          <button className={styles.closeBtn} onClick={onClose}>✕</button>

          <div className={styles.header}>
            <span className={styles.badge}>💎 Premium</span>
            <h2>BeatStudio Premium</h2>
            <p>Composez sans limites</p>
          </div>

          <div className={styles.pricing}>
            <div className={styles.price}>
              <span className={styles.amount}>5€</span>
              <span className={styles.period}>/mois</span>
            </div>
            <p className={styles.priceSub}>Annulable à tout moment</p>
          </div>

          <ul className={styles.features}>
            <li>✅ Export WAV illimité (durée complète)</li>
            <li>✅ Sans filigrane audio</li>
            <li>✅ Sans fade out automatique</li>
            <li>✅ Accès à toutes les futures features</li>
            <li>✅ Sauvegarde cloud (bientôt)</li>
            <li>✅ Partage de patterns (bientôt)</li>
          </ul>

          <button
            className={styles.ctaBtn}
            onClick={() => {
              console.log('📊 [TRACK] checkout_pricing_accepted', { timestamp: new Date().toISOString() })
              setStep('payment')
            }}
          >
            Continuer vers le paiement →
          </button>

          <p className={styles.legal}>
            Paiement sécurisé · SSL · Annulation en 1 clic
          </p>

        </div>
      </div>
    )
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>

        <button className={styles.closeBtn} onClick={onClose}>✕</button>

        <div className={styles.header}>
          <span className={styles.badge}>💎 Premium — 5€/mois</span>
          <h2>Informations de paiement</h2>
        </div>

        <div className={styles.form}>

          <div className={styles.field}>
            <label>Email</label>
            <input
              type="email"
              placeholder="votre@email.com"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            />
            {errors.email && <span className={styles.error}>{errors.email}</span>}
          </div>

          <div className={styles.field}>
            <label>Titulaire de la carte</label>
            <input
              type="text"
              placeholder="Jean Dupont"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            />
            {errors.name && <span className={styles.error}>{errors.name}</span>}
          </div>

          <div className={styles.field}>
            <label>Numéro de carte</label>
            <div className={styles.cardInput}>
              <input
                type="text"
                placeholder="1234 5678 9012 3456"
                value={form.cardNumber}
                maxLength={19}
                onChange={e => setForm(f => ({
                  ...f,
                  cardNumber: formatCardNumber(e.target.value),
                }))}
              />
              <span className={styles.cardIcons}>💳</span>
            </div>
            {errors.cardNumber && <span className={styles.error}>{errors.cardNumber}</span>}
          </div>

          <div className={styles.fieldRow}>
            <div className={styles.field}>
              <label>Date d'expiration</label>
              <input
                type="text"
                placeholder="MM/AA"
                value={form.expiry}
                maxLength={5}
                onChange={e => setForm(f => ({
                  ...f,
                  expiry: formatExpiry(e.target.value),
                }))}
              />
              {errors.expiry && <span className={styles.error}>{errors.expiry}</span>}
            </div>
            <div className={styles.field}>
              <label>CVV</label>
              <input
                type="text"
                placeholder="123"
                value={form.cvv}
                maxLength={4}
                onChange={e => setForm(f => ({
                  ...f,
                  cvv: e.target.value.replace(/\D/g, ''),
                }))}
              />
              {errors.cvv && <span className={styles.error}>{errors.cvv}</span>}
            </div>
          </div>

        </div>

        <div className={styles.summary}>
          <span>BeatStudio Premium</span>
          <span>5,00€/mois</span>
        </div>

        <button
          className={styles.payBtn}
          onClick={handlePayment}
          disabled={loading}
        >
          {loading ? <span>⏳ Traitement en cours...</span> : <span>🔒 Payer 5,00€</span>}
        </button>

        <p className={styles.legal}>
          🔒 Paiement simulé — Aucune donnée réelle transmise
        </p>

        <button className={styles.backBtn} onClick={() => setStep('pricing')}>
          ← Retour
        </button>

      </div>
    </div>
  )
}
