const BLOCKED_EMBED_HOSTS = ['leetcode.com', 'linkedin.com', 'github.com']

export function isKnownBlockedEmbed(url: string): boolean {
  try {
    const host = new URL(url).hostname.replace(/^www\./, '')
    return BLOCKED_EMBED_HOSTS.some((blocked) => host === blocked || host.endsWith(`.${blocked}`))
  } catch {
    return true
  }
}

export function isIframeEmbedBlocked(iframe: HTMLIFrameElement): boolean {
  try {
    const doc = iframe.contentDocument ?? iframe.contentWindow?.document
    if (!doc) return true

    const body = doc.body
    if (!body) return true

    const text = body.innerText?.trim() ?? ''
    const hasContent = text.length > 0 || body.children.length > 0
    return !hasContent
  } catch {
    // Cross-origin: cannot inspect document. These profile sites block iframes.
    return true
  }
}

export const IFRAME_PROBE_MS = 600
export const IFRAME_MAX_WAIT_MS = 2200
