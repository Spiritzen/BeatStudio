import { useState, useEffect } from 'react'

export const isMobileDevice = (): boolean => {
  return (
    /android|iphone|ipad|ipod/i.test(navigator.userAgent) ||
    (window.innerWidth < 900 && navigator.maxTouchPoints > 0)
  )
}

export const isLandscape = (): boolean =>
  window.innerWidth > window.innerHeight

export const useDevice = () => {
  const [mobile] = useState(() => isMobileDevice())
  const [landscape, setLandscape] = useState(isLandscape())

  useEffect(() => {
    if (!mobile) return
    const handle = () => setLandscape(isLandscape())
    window.addEventListener('resize', handle)
    window.addEventListener('orientationchange', handle)
    return () => {
      window.removeEventListener('resize', handle)
      window.removeEventListener('orientationchange', handle)
    }
  }, [mobile])

  return { mobile, landscape }
}
