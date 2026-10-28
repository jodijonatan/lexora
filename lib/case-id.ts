export function createCaseId(now = new Date()): string {
  let rand = 0
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const arr = new Uint32Array(1)
    crypto.getRandomValues(arr)
    rand = 100000 + (arr[0] % 900000)
  } else {
    rand = Math.floor(100000 + Math.random() * 900000)
  }
  return `LXR-${now.getFullYear()}-${rand}`
}

export function generateSecurePin(): string {
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const arr = new Uint32Array(1)
    crypto.getRandomValues(arr)
    return String(100000 + (arr[0] % 900000))
  }
  return String(Math.floor(100000 + Math.random() * 900000))
}
