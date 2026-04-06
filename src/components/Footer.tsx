import styles from './Footer.module.css';

const IconGitHub = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
  </svg>
);

const IconGlobe = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"/>
    <line x1="2" y1="12" x2="22" y2="12"/>
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
  </svg>
);

const IconLinkedIn = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z"/>
    <circle cx="4" cy="4" r="2"/>
  </svg>
);

const IconVideo = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M23 7l-7 5 7 5V7z"/>
    <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
  </svg>
);

const IconMail = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
    <polyline points="22,6 12,13 2,6"/>
  </svg>
);

const IconDownload = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="7 10 12 15 17 10"/>
    <line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
);

interface FooterProps {
  zoom: number;
  onZoomChange: (zoom: number) => void;
}

export function Footer({ zoom, onZoomChange }: FooterProps) {
  return (
    <footer className={styles.footer}>

      {/* BARRE HAUTE — zoom gauche · raccourcis droite */}
      <div className={styles.footerTop}>
        <div className={styles.zoomControl}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ opacity: 0.5 }}>
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <button className={styles.zoomBtn} onClick={() => onZoomChange(zoom - 0.1)} title="Dézoomer">−</button>
          <span className={styles.zoomValue}>{Math.round(zoom * 100)}%</span>
          <button className={styles.zoomBtn} onClick={() => onZoomChange(zoom + 0.1)} title="Zoomer">+</button>
        </div>

        <div className={styles.shortcuts}>
          <span>Cliquez sur un step</span>
          <span className={styles.dot}>·</span>
          <kbd>Espace</kbd><span>Play/Stop</span>
          <span className={styles.dot}>·</span>
          <kbd>Ctrl+Z</kbd><span>Annuler</span>
          <span className={styles.dot}>·</span>
          <kbd>Ctrl+S</kbd><span>Sauvegarder</span>
          <span className={styles.dot}>·</span>
          <kbd>M</kbd><span>Mute</span>
          <span className={styles.dot}>·</span>
          <kbd>Ctrl+D</kbd><span>Dupliquer</span>
        </div>
      </div>

      {/* BARRE BASSE — crédits · version centrée · liens icônes */}
      <div className={styles.footerBottom}>
        <span className={styles.copy}>
          © 2026 BeatStudio — créé par Sébastien Cantrelle
        </span>

        <span className={styles.version}>
          v1.2.5&nbsp;&nbsp;·&nbsp;&nbsp;Open Source · MIT License
        </span>

        <div className={styles.links}>
          <a href="https://github.com/Spiritzen" target="_blank" rel="noreferrer"
             className={`${styles.link} ${styles.linkViolet}`}>
            <IconGitHub /><span>GitHub</span>
          </a>
          <span className={styles.dot}>·</span>
          <a href="https://spiritzen.github.io/portfolio/" target="_blank" rel="noreferrer"
             className={`${styles.link} ${styles.linkViolet}`}>
            <IconGlobe /><span>Portfolio</span>
          </a>
          <span className={styles.dot}>·</span>
          <a href="https://www.linkedin.com/in/sebastien-cantrelle-26b695106/" target="_blank" rel="noreferrer"
             className={`${styles.link} ${styles.linkLinkedin}`}>
            <IconLinkedIn /><span>LinkedIn</span>
          </a>
          <span className={styles.dot}>·</span>
          <a href="https://www.youtube.com/watch?v=DVOQzauF8Es" target="_blank" rel="noreferrer"
             className={`${styles.link} ${styles.linkVideo}`}>
            <IconVideo /><span>Vidéo</span>
          </a>
          <span className={styles.dot}>·</span>
          <a href="mailto:sebastien.cantrelle@hotmail.fr"
             className={`${styles.link} ${styles.linkViolet}`}>
            <IconMail /><span>Contact</span>
          </a>
          <span className={styles.dot}>·</span>
          <a
            href="CV_Sebastien_Cantrelle.pdf"
            target="_blank"
            rel="noreferrer"
            onClick={(e) => {
              e.preventDefault();
              window.open('CV_Sebastien_Cantrelle.pdf', '_blank');
              const link = document.createElement('a');
              link.href = 'CV_Sebastien_Cantrelle.pdf';
              link.download = 'CV_Sebastien_Cantrelle.pdf';
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}
            className={`${styles.link} ${styles.linkCV}`}>
            <IconDownload /><span>CV</span>
          </a>
        </div>
      </div>

    </footer>
  );
}
