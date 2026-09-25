export const todayIsoDate = () => new Date().toISOString().slice(0, 10)

export const formatDate = (value) => {
  if (!value) return ''
  return new Intl.DateTimeFormat('en-LK', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(`${value}T00:00:00`))
}

export const csvDateStamp = () => todayIsoDate()
