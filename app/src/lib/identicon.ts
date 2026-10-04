import Identicon from "identicon.js"

// Identicons drawn from the SHA-256 of the email: the same person gets the
// same pattern everywhere (commit list, panel, card, header), and the
// email itself never appears in the image. Each email is hashed once.
const cache = new Map<string, string>()
const pending = new Map<string, Promise<string>>()

function normalize(email: string) {
  return email.trim().toLowerCase()
}

async function sha256Hex(text: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text))
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("")
}

/** The identicon already generated for `email`, if any (sync, for first render). */
export function cachedIdenticon(email: string): string | undefined {
  return cache.get(normalize(email))
}

/** An SVG data URL with the identicon for `email`. */
export function identiconFor(email: string): Promise<string> {
  const key = normalize(email)
  const cached = cache.get(key)
  if (cached) return Promise.resolve(cached)

  let promise = pending.get(key)
  if (!promise) {
    promise = sha256Hex(key).then((hash) => {
      const svg = new Identicon(hash, {
        format: "svg",
        size: 64,
        // Transparent: the avatar's own (theme) background shows through.
        background: [0, 0, 0, 0],
        // Keeps the pattern clear of the avatar's round clip.
        margin: 0.18,
      }).toString()
      const url = `data:image/svg+xml;base64,${svg}`
      cache.set(key, url)
      pending.delete(key)
      return url
    })
    pending.set(key, promise)
  }
  return promise
}
