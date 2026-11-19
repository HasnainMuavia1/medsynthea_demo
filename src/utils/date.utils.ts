export const formatDateParam = (date: Date): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export const formatDateTimeParam = (date: Date): string => {
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${formatDateParam(date)}T${hours}:${minutes}`
}

export const parseDateParam = (value: string): Date => {
  const [year, month, day] = value.split('-').map(Number)
  return new Date(year, month - 1, day)
}

export const formatDateUS = (date: Date): string => {
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const year = date.getFullYear()
  return `${month}/${day}/${year}`
}

export const formatDateTimeUS = (date: Date): string => {
  const hour24 = date.getHours()
  const minute = String(date.getMinutes()).padStart(2, '0')
  const period = hour24 >= 12 ? 'PM' : 'AM'
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12
  return `${formatDateUS(date)} ${hour12}:${minute} ${period}`
}

export const parseFlexibleDate = (value: string): Date | null => {
  const trimmed = value.trim()
  if (!trimmed) return null

  const isoDateTimeMatch = trimmed.match(
    /^(\d{4})-(\d{1,2})-(\d{1,2})(?:[T\s](\d{1,2}):(\d{2})(?::\d{2})?)?$/
  )
  if (isoDateTimeMatch) {
    const year = Number(isoDateTimeMatch[1])
    const month = Number(isoDateTimeMatch[2])
    const day = Number(isoDateTimeMatch[3])
    const hour = isoDateTimeMatch[4] !== undefined ? Number(isoDateTimeMatch[4]) : 0
    const minute = isoDateTimeMatch[5] !== undefined ? Number(isoDateTimeMatch[5]) : 0
    const parsed = new Date(year, month - 1, day, hour, minute, 0, 0)
    if (
      parsed.getFullYear() === year &&
      parsed.getMonth() === month - 1 &&
      parsed.getDate() === day
    ) {
      return parsed
    }
    return null
  }

  const usDateTimeMatch = trimmed.match(
    /^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s+(\d{1,2}):(\d{2})\s*(AM|PM))?$/i
  )
  if (usDateTimeMatch) {
    const month = Number(usDateTimeMatch[1])
    const day = Number(usDateTimeMatch[2])
    const year = Number(usDateTimeMatch[3])
    let hour = 0
    let minute = 0
    if (usDateTimeMatch[4] !== undefined && usDateTimeMatch[6]) {
      const hour12 = Number(usDateTimeMatch[4])
      minute = Number(usDateTimeMatch[5])
      const period = usDateTimeMatch[6].toUpperCase()
      if (period === 'AM') hour = hour12 === 12 ? 0 : hour12
      else hour = hour12 === 12 ? 12 : hour12 + 12
    }
    const parsed = new Date(year, month - 1, day, hour, minute, 0, 0)
    if (
      parsed.getFullYear() === year &&
      parsed.getMonth() === month - 1 &&
      parsed.getDate() === day
    ) {
      return parsed
    }
    return null
  }

  return null
}

export const isSameDay = (a: Date, b: Date): boolean => {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

export const startOfMonth = (date: Date): Date => {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

export const startOfDay = (date: Date): Date => {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

export const addDays = (date: Date, days: number): Date => {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}

export const isFutureDate = (date: Date): boolean => {
  return startOfDay(date).getTime() > startOfDay(new Date()).getTime()
}
