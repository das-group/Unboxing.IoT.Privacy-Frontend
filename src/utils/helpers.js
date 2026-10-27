export const handleImageError = (e, fallbackSrc = '/error.svg') => {
  console.warn('Failed to load image:', e.target.src)
  e.target.onerror = null
  e.target.src = fallbackSrc
}

export const formatDate = (date) => {
  return new Date(date).toLocaleDateString(undefined, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export const formatReportType = (t) => {
  if (t === 'device') {
    return 'Auswertung des Geräts'
  }
  if (t === 'app') {
    return 'Auswertung der App'
  }
  return null
}

export const formatDateTime = (date) => {
  if (date === undefined) {
    return '?'
  }
  if (date.indexOf('T') === -1) {
    return formatDate(date)
  }
  return new Date(date).toLocaleDateString(undefined, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
