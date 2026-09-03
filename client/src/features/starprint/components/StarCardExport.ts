import { createElement } from 'react'
import { toPng } from 'html-to-image'
import { createRoot } from 'react-dom/client'
import { StarCard, type StarCardData } from './StarCard'
import { DEFAULT_STAR_AVATAR, resolveStarCardAvatar } from '../utils/avatar'

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

/**
 * High-definition (1200x1886 at 2x) deterministic PNG export.
 * WHAT THE USER SEES = WHAT THE USER DOWNLOADS.
 * Renders the same StarCard component at canonical resolution off-screen.
 */
export async function exportStarCardToPng(starprint: StarCardData): Promise<void> {
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

    // 5. Trigger download with canonical filename including student nickname
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
    const downloadLink = document.createElement('a')
    downloadLink.download = filename
    downloadLink.href = dataUrl
    document.body.appendChild(downloadLink)
    downloadLink.click()
    document.body.removeChild(downloadLink)
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
