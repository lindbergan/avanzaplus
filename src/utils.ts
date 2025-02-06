export const parseTime = (time: string): Date => {
  const parts = time
    .trim()
    .split(":")
  const hours = parseInteger(parts[0]) || 0
  const minutes = parseInteger(parts[1]) || 0
  const seconds = parseInteger(parts[2]) || 0

  const newDate = new Date()
  newDate.setHours(hours)
  newDate.setMinutes(minutes)
  newDate.setSeconds(seconds)

  return newDate
}

export const formatTime = (date: Date): string => {
  const fmtNumber = (n: number): string => n < 10 ? `0${n}` : String(n)

  return `${fmtNumber(date.getHours())}:${fmtNumber(date.getMinutes())}:${fmtNumber(date.getSeconds())}`
}

/* Fix to remove spaces and shit. Real tired when I wrote this... */
const strFuckfaceRemover = (str: string): string => {
  const forbidden = [
    160,
    32,
  ]

  return str
    .split("")
    .filter((c, i) => !forbidden.includes(str.charCodeAt(i)))
    .join("")
}

export const parseNumber = (str: string): number => {
  return parseFloat(strFuckfaceRemover(str
    .trim()
    .replaceAll(" ", "")
    .replaceAll("&nbsp;", "")
    .replaceAll(",", ".")))
}

export const parseInteger = (str: string): number => {
  return parseInt(strFuckfaceRemover(str
    .trim()
    .replaceAll(" ", "")
    .replaceAll("&nbsp;", "")))
}