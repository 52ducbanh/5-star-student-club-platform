import { useRef, useState, useEffect, useCallback, type ChangeEvent } from 'react'
import { useStarprintStore } from '../store/useStarprintStore'
import { starprintApi } from '../services/starprintApi'
import { DEFAULT_STAR_AVATAR } from '../utils/avatar'

type CameraStepView = 'choose' | 'camera_active' | 'preview'
type PhotoSource = 'camera' | 'file'

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024 // 5MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg']

function checkHasMediaDevices(): boolean {
  return typeof navigator !== 'undefined' && Boolean(navigator.mediaDevices?.getUserMedia)
}

/**
 * Downscale and compress image client-side to max 1024x1024 JPEG before uploading.
 * Reduces 5MB gallery uploads down to ~80-150KB to preserve bandwidth and server RAM under 100 CCU.
 */
async function compressImageBeforeUpload(fileOrBlob: Blob | File): Promise<Blob> {
  if (fileOrBlob.size < 150 * 1024 && (fileOrBlob.type === 'image/jpeg' || fileOrBlob.type === 'image/webp')) {
    return fileOrBlob
  }

  return new Promise((resolve) => {
    const img = new Image()
    const objectUrl = URL.createObjectURL(fileOrBlob)

    img.onload = () => {
      URL.revokeObjectURL(objectUrl)
      const maxDimension = 1024
      let width = img.naturalWidth || img.width
      let height = img.naturalHeight || img.height

      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width)
          width = maxDimension
        } else {
          width = Math.round((width * maxDimension) / height)
          height = maxDimension
        }
      }

      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        resolve(fileOrBlob)
        return
      }

      ctx.drawImage(img, 0, 0, width, height)
      canvas.toBlob(
        (blob) => {
          resolve(blob || fileOrBlob)
        },
        'image/jpeg',
        0.85
      )
    }

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      resolve(fileOrBlob)
    }

    img.src = objectUrl
  })
}

export function CameraStep() {
  const [view, setView] = useState<CameraStepView>('choose')
  const [photoSource, setPhotoSource] = useState<PhotoSource | null>(null)
  const [capturedBlobOrFile, setCapturedBlobOrFile] = useState<Blob | File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [cameraLoading, setCameraLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [validationError, setValidationError] = useState<string | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const videoRef = useRef<HTMLVideoElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const previewUrlRef = useRef<string | null>(null)

  const { sessionId, photoPreviewUrl, setPhotoPreviewUrl, setStep } = useStarprintStore()

  // Track previewUrl in a ref for safe cleanup on unmount
  useEffect(() => {
    previewUrlRef.current = previewUrl
  }, [previewUrl])

  // Stop media stream tracks cleanly
  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        try {
          track.stop()
        } catch {
          /* noop */
        }
      })
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
  }, [])

  // Cleanup on unmount: stop camera tracks and revoke object URLs
  useEffect(() => {
    return () => {
      stopStream()
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current)
        previewUrlRef.current = null
      }
    }
  }, [stopStream])

  // Callback ref for <video> element to ensure stream is immediately attached
  const setVideoRef = useCallback((node: HTMLVideoElement | null) => {
    videoRef.current = node
    if (node && streamRef.current) {
      node.srcObject = streamRef.current
      node.play().catch(() => {
        /* play interrupted or not allowed yet */
      })
    }
  }, [])

  // Start camera stream only on explicit user request
  const startCamera = async () => {
    setCameraError(null)
    setValidationError(null)
    setUploadError(null)

    if (!checkHasMediaDevices()) {
      setCameraError('Trình duyệt không hỗ trợ mở camera. Bạn có thể chọn ảnh từ thiết bị.')
      return
    }

    setCameraLoading(true)
    stopStream()

    try {
      let stream: MediaStream
      try {
        // Preferred facing mode: user (selfie)
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 720 }, height: { ideal: 720 } },
          audio: false,
        })
      } catch {
        // Graceful fallback to any video camera
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        })
      }

      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        try {
          await videoRef.current.play()
        } catch {
          /* noop */
        }
      }
      setView('camera_active')
    } catch {
      setCameraError('Không thể truy cập camera. Bạn vẫn có thể chọn ảnh từ thiết bị.')
    } finally {
      setCameraLoading(false)
    }
  }

  // Capture frame from active video stream
  const capturePhoto = () => {
    const video = videoRef.current
    if (!video) return

    const canvas = document.createElement('canvas')
    const vWidth = video.videoWidth || 640
    const vHeight = video.videoHeight || 640
    const size = Math.min(vWidth, vHeight)

    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Center crop square from video feed
    const sx = (vWidth - size) / 2
    const sy = (vHeight - size) / 2

    // Apply mirror transformation matching the video preview
    ctx.translate(size, 0)
    ctx.scale(-1, 1)
    ctx.drawImage(video, sx, sy, size, size, 0, 0, size, size)

    canvas.toBlob(
      (blob) => {
        if (!blob) return
        stopStream()

        if (previewUrlRef.current) {
          URL.revokeObjectURL(previewUrlRef.current)
        }
        const url = URL.createObjectURL(blob)
        setCapturedBlobOrFile(blob)
        setPreviewUrl(url)
        setPhotoSource('camera')
        setView('preview')
      },
      'image/jpeg',
      0.9
    )
  }

  // Handle native file selection
  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    // Reset file input value so selecting the same file again triggers onChange
    e.target.value = ''
    if (!file) return

    setValidationError(null)
    setUploadError(null)

    // Validate MIME type
    if (!ALLOWED_MIME_TYPES.includes(file.type.toLowerCase())) {
      setValidationError('Định dạng ảnh không hợp lệ. Vui lòng chọn ảnh JPG, PNG hoặc WebP.')
      return
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setValidationError('Ảnh quá lớn. Vui lòng chọn ảnh nhỏ hơn 5MB.')
      return
    }

    stopStream()

    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current)
    }
    const url = URL.createObjectURL(file)
    setCapturedBlobOrFile(file)
    setPreviewUrl(url)
    setPhotoSource('file')
    setView('preview')
  }

  // Trigger file picker
  const triggerFilePicker = () => {
    setValidationError(null)
    setUploadError(null)
    fileInputRef.current?.click()
  }

  // Retake photo or re-select file depending on source
  const handleRetakeOrReselect = () => {
    if (photoSource === 'camera') {
      void startCamera()
    } else {
      triggerFilePicker()
    }
  }

  // Cancel current preview and return to initial choice view
  const handleCancelPreview = () => {
    stopStream()
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current)
      setPreviewUrl(null)
    }
    setCapturedBlobOrFile(null)
    setPhotoSource(null)
    setUploadError(null)
    setValidationError(null)
    setView('choose')
  }

  // Confirm and persist photo through the STARPRINT flow
  const handleConfirmAndSave = async () => {
    if (!capturedBlobOrFile || !sessionId || uploading) return
    setUploading(true)
    setUploadError(null)

    try {
      const optimizedBlob = await compressImageBeforeUpload(capturedBlobOrFile)
      const { photoUrl } = await starprintApi.uploadPhoto(sessionId, optimizedBlob)
      setPhotoPreviewUrl(photoUrl)

      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current)
        setPreviewUrl(null)
      }
      setStep('SOLVE')
    } catch {
      setUploadError('Không thể lưu ảnh. Vui lòng thử lại.')
    } finally {
      setUploading(false)
    }
  }

  // Skip photo: clears any custom portrait and advances to mini-games
  const handleSkip = async () => {
    stopStream()
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current)
      setPreviewUrl(null)
    }
    setPhotoPreviewUrl(null)

    if (sessionId) {
      try {
        await starprintApi.deletePhoto(sessionId)
      } catch {
        /* Best effort cleanup */
      }
    }
    setStep('SOLVE')
  }

  return (
    <div className="game-step camera-step">
      {/* Hidden file input for native gallery/file picker (no capture attr to prevent camera lock) */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
        tabIndex={-1}
        aria-hidden="true"
      />

      {/* STATE A: CHOOSE (Initial View) */}
      {view === 'choose' && (
        <>
          <div className="game-progress">📷 BƯỚC 2 · ẢNH CHÂN DUNG</div>
          <h2>Chân dung tỏa sáng</h2>
          <p>Ảnh chân dung sẽ đặt tại trung tâm của ngôi sao STARPRINT cá nhân</p>

          <div className="camera-avatar-showcase" aria-hidden="true">
            <div className="camera-avatar-showcase__ring" />
            <div className="camera-avatar-showcase__inner">
              <img
                src={photoPreviewUrl || DEFAULT_STAR_AVATAR}
                alt="STAR Mascot Avatar"
                className="camera-avatar-showcase__img"
              />
            </div>
          </div>

          {cameraError && (
            <div className="camera-notice camera-notice--warning" role="alert">
              ⚠️ {cameraError}
            </div>
          )}

          {validationError && (
            <div className="camera-notice camera-notice--error" role="alert">
              ⚠️ {validationError}
            </div>
          )}

          <div className="camera-choice-actions camera-choice-actions--row">
            <button
              className="btn btn--primary"
              onClick={startCamera}
              disabled={cameraLoading}
              aria-label="Chụp ảnh bằng camera"
            >
              {cameraLoading ? 'Đang mở camera...' : '📷 Chụp ảnh'}
            </button>
            <button
              className="btn btn--outline"
              onClick={triggerFilePicker}
              aria-label="Chọn ảnh từ thiết bị"
            >
              🖼️ Chọn ảnh
            </button>
          </div>

          <button
            className="camera-step__skip"
            onClick={handleSkip}
            aria-label="Bỏ qua bước chọn ảnh chân dung"
          >
            Bỏ qua bước này →
          </button>
        </>
      )}

      {/* STATE B: CAMERA ACTIVE */}
      {view === 'camera_active' && (
        <>
          <div className="game-progress">📷 BƯỚC 2 · CHỤP ẢNH CHÂN DUNG</div>
          <h2>Căn chỉnh khuôn mặt</h2>
          <p>Đặt gương mặt vào giữa khung tròn để ảnh tỏa sáng đẹp nhất</p>

          <div className="camera-feed-container" aria-label="Camera trực tiếp">
            <video
              ref={setVideoRef}
              autoPlay
              playsInline
              muted
              className="camera-feed-video"
            />
            <div className="camera-framing-guide" aria-hidden="true" />
          </div>

          <div className="camera-feed-actions">
            <button
              className="btn btn--primary"
              onClick={capturePhoto}
              aria-label="Chụp ảnh ngay"
            >
              📸 Chụp ngay
            </button>
            <button
              className="btn btn--outline"
              onClick={() => {
                stopStream()
                setView('choose')
              }}
              aria-label="Quay lại màn hình chọn"
            >
              ← Quay lại
            </button>
          </div>

          <button
            className="camera-step__skip"
            onClick={handleSkip}
            aria-label="Bỏ qua bước chọn ảnh chân dung"
          >
            Bỏ qua bước này →
          </button>
        </>
      )}

      {/* STATE C: PREVIEW & CONFIRM */}
      {view === 'preview' && previewUrl && (
        <>
          <div className="game-progress">📷 BƯỚC 2 · XÁC NHẬN ẢNH</div>
          <h2>Chân dung của bạn</h2>
          <p>Xem trước hình ảnh sẽ xuất hiện trên STAR CARD và ngôi sao cá nhân</p>

          <div className="camera-preview-container" aria-label="Xem trước ảnh chân dung đã chọn">
            <img
              src={previewUrl}
              alt="Xem trước ảnh chân dung"
              className="camera-preview-img"
            />
          </div>

          {uploadError && (
            <div className="camera-notice camera-notice--error" role="alert">
              ⚠️ {uploadError}
            </div>
          )}

          <div className="camera-preview-actions">
            <button
              className="btn btn--primary"
              disabled={uploading}
              onClick={handleConfirmAndSave}
              aria-label="Xác nhận dùng ảnh này"
            >
              {uploading ? 'Đang lưu ảnh...' : 'Dùng ảnh này ✓'}
            </button>

            <button
              className="btn btn--outline"
              disabled={uploading}
              onClick={handleRetakeOrReselect}
              aria-label={photoSource === 'camera' ? 'Chụp lại ảnh' : 'Chọn ảnh khác từ thiết bị'}
            >
              {photoSource === 'camera' ? '🔄 Chụp lại' : '🖼️ Chọn ảnh khác'}
            </button>

            <button
              className="camera-step__skip"
              disabled={uploading}
              onClick={handleCancelPreview}
              aria-label="Hủy ảnh này và chọn lại"
            >
              ← Chọn cách khác
            </button>
          </div>
        </>
      )}
    </div>
  )
}
