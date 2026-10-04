const TZ = 'Asia/Jakarta'

export const rupiah = (n: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)

export const fmtDate = (d: string | Date) =>
  new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric', timeZone: TZ }).format(new Date(d))

export const fmtDateTime = (d: string | Date) =>
  new Intl.DateTimeFormat('id-ID', {
    weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: TZ,
  }).format(new Date(d))

export const fmtTime = (d: string | Date) =>
  new Intl.DateTimeFormat('id-ID', { hour: '2-digit', minute: '2-digit', timeZone: TZ }).format(new Date(d))

/** Tanggal hari ini (WIB) format YYYY-MM-DD */
export const todayISO = () => new Date().toLocaleDateString('en-CA', { timeZone: TZ })

export const startOfTodayISO = () => `${todayISO()}T00:00:00+07:00`
export const startOfMonthISO = () => `${todayISO().slice(0, 8)}01T00:00:00+07:00`

export function daysLeft(endDate: string) {
  const end = new Date(`${endDate}T00:00:00+07:00`).getTime()
  const now = new Date(`${todayISO()}T00:00:00+07:00`).getTime()
  return Math.round((end - now) / 86400000)
}

export function addDays(dateISO: string, days: number) {
  const d = new Date(`${dateISO}T00:00:00+07:00`)
  d.setUTCDate(d.getUTCDate() + days)
  return d.toLocaleDateString('en-CA', { timeZone: TZ })
}
