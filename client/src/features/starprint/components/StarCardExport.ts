import { createElement } from 'react'
import { toPng } from 'html-to-image'
import { createRoot } from 'react-dom/client'
import { StarCard, type StarCardData } from './StarCard'
import { DEFAULT_STAR_AVATAR, resolveStarCardAvatar } from '../utils/avatar'
import { starprintApi } from '../services/starprintApi'

/**
 * Loads an image URL and converts it to a base64 data URL to guarantee zero canvas tainting.
 * If fetching custom photo fails (e.g. 404), safely falls back to DEFAULT_STAR_AVATAR.
 */
async function toDataUrl(url: string): Promise<string> {
  if (url.startsWith('data:')) {
    return url
  }
  try {
    const res = await fetch(url, {
      mode: 'cors',
      headers: {
        'ngrok-skip-browser-warning': 'true',
      },
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const blob = await res.blob()
    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  } catch (err) {
    console.warn(`[StarCardExport] Image failed to load (${url}), falling back to default mascot:`, err)
    if (url !== DEFAULT_STAR_AVATAR) {
      return toDataUrl(DEFAULT_STAR_AVATAR)
    }
    return url
  }
}

export interface RenderedStarCard {
  blob: Blob
  dataUrl: string
  filename: string
}

/**
 * Canonical print renderer: exactly 1200x1886 PNG.
 * SINGLE VISUAL SOURCE OF TRUTH for both manual download and server print storage.
 */
export async function renderStarCardToBlob(starprint: StarCardData): Promise<RenderedStarCard> {
  // Pre-resolve avatar and inline as data URL for export reliability
  const resolvedAvatar = resolveStarCardAvatar(starprint.photoUrl)
  const inlinedAvatar = await toDataUrl(resolvedAvatar)

  // Clone starprint with inlined avatar
  const exportData: StarCardData = {
    ...starprint,
    photoUrl: inlinedAvatar,
  }

  // 1. Create off-screen staging container at canonical dimensions (600x943)
  const container = document.createElement('div')
  container.id = 'star-card-export-staging'
  container.style.position = 'fixed'
  container.style.left = '-9999px'
  container.style.top = '0'
  container.style.width = '600px'
  container.style.height = '943px'
  container.style.zIndex = '-9999'
  container.style.pointerEvents = 'none'
  container.style.opacity = '1'
  document.body.appendChild(container)

  const root = createRoot(container)

  try {
    // 2. Render canonical StarCard in export mode
    await new Promise<void>((resolve) => {
      root.render(
        createElement(StarCard, {
          starprint: exportData,
          mode: 'export',
          id: 'star-card-export-node',
        })
      )
      // Allow React to commit DOM
      setTimeout(resolve, 80)
    })

    // 3. Wait for document fonts and images to be fully ready
    if (document.fonts) {
      await document.fonts.ready
    }

    const cardElement = container.querySelector('.starprint-id-card') as HTMLElement
    if (!cardElement) {
      throw new Error('Export card element failed to render in staging container')
    }

    // Ensure all images are loaded
    const imgElements = Array.from(cardElement.querySelectorAll('img, image'))
    await Promise.all(
      imgElements.map(
        (el) =>
          new Promise<void>((res) => {
            const href = el.getAttribute('href') || el.getAttribute('src')
            if (!href) return res()
            const img = new Image()
            img.onload = () => res()
            img.onerror = () => res()
            img.src = href
          })
      )
    )

    // Wait short rasterization buffer
    await new Promise((r) => setTimeout(r, 120))

    // 4. Capture high-resolution PNG (pixelRatio 2 -> 1200x1886)
    const dataUrl = await toPng(cardElement, {
      pixelRatio: 2,
      cacheBust: true,
      backgroundColor: '#0b0f2e',
      width: 600,
      height: 943,
    })

    const blobRes = await fetch(dataUrl)
    const blob = await blobRes.blob()

    // 5. Canonical filename
    const publicId = starprint.publicStarId || starprint.id
    const safeNickname = (starprint.nickname || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[đĐ]/g, 'd')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
    const filename = safeNickname ? `star-card-${safeNickname}-${publicId}.png` : `star-card-${publicId}.png`

    return { blob, dataUrl, filename }
  } finally {
    // 6. Complete cleanup
    try {
      root.unmount()
    } catch {
      // ignore
    }
    container.remove()
  }
}

/**
 * Manual high-definition PNG export triggered by user.
 */
export async function exportStarCardToPng(starprint: StarCardData): Promise<void> {
  const { dataUrl, filename } = await renderStarCardToBlob(starprint)
  const downloadLink = document.createElement('a')
  downloadLink.download = filename
  downloadLink.href = dataUrl
  document.body.appendChild(downloadLink)
  downloadLink.click()
  document.body.removeChild(downloadLink)
}

/**
 * Non-blocking background automatic upload for physical printing pipeline.
 */
export async function autoUploadStarCardPrintImage(
  starprint: StarCardData & { id: string; sessionId?: string; physicalCardRequested?: boolean },
): Promise<{ success: boolean; saved: boolean; reason?: string }> {
  // Client optimization: Skip if student opted out of physical card
  if (starprint.physicalCardRequested === false) {
    return { success: true, saved: false, reason: 'PHYSICAL_CARD_NOT_REQUESTED' }
  }

  const sessionId = starprint.sessionId
  if (!sessionId) {
    return { success: false, saved: false, reason: 'MISSING_SESSION_ID' }
  }

  try {
    const { blob } = await renderStarCardToBlob(starprint)

    // Bounded retry strategy (max 3 attempts with backoff)
    const maxAttempts = 3
    let lastError: any = null

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const response = await starprintApi.uploadCardImage(starprint.id, sessionId, blob)
        return response
      } catch (err: any) {
        lastError = err
        // Do not retry 4xx errors (e.g. 403 unauthorized session / 404 not found)
        if (err?.statusCode && err.statusCode >= 400 && err.statusCode < 500) {
          break
        }
        if (attempt < maxAttempts) {
          await new Promise((res) => setTimeout(res, attempt === 1 ? 1000 : 2500))
        }
      }
    }

    console.warn('[StarCardExport] Background card upload failed after retries:', lastError)
    return { success: false, saved: false, reason: lastError?.message || 'UPLOAD_FAILED' }
  } catch (err: any) {
    console.warn('[StarCardExport] Failed to render print card for auto-upload:', err)
    return { success: false, saved: false, reason: err?.message || 'RENDER_FAILED' }
  }
}
