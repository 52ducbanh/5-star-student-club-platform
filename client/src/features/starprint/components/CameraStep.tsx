import { useRef, useState, useEffect, useCallback } from 'react'
import { useStarprintStore } from '../store/useStarprintStore'
import { starprintApi } from '../services/starprintApi'

type CameraState = 'requesting' | 'preview' | 'captured' | 'denied'

function checkHasMediaDevices() {
  return typeof navigator !== 'undefined' && Boolean(navigator.mediaDevices?.getUserMedia)
}

export function CameraStep() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [hasCamera] = useState(checkHasMediaDevices)
  const [cameraState, setCameraState] = useState<CameraState>(() => (hasCamera ? 'requesting' : 'denied'))
  const [capturedBlob, setCapturedBlob] = useState<Blob | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { sessionId, setPhotoPreviewUrl, setStep } = useStarprintStore()

  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
  }, [])

  const startStream = useCallback(() => {
    if (!hasCamera) return
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 640 } }, audio: false })
      .then((stream) => {
        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
        }
        setCameraState('preview')
      })
      .catch(() => {
        setCameraState('denied')
      })
  }, [hasCamera])

  useEffect(() => {
    startStream()
    return () => {
      stopStream()
    }
  }, [startStream, stopStream])

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

  const capture = () => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return

    const size = Math.min(video.videoWidth || 480, video.videoHeight || 480)
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const sx = ((video.videoWidth || size) - size) / 2
    const sy = ((video.videoHeight || size) - size) / 2
    ctx.drawImage(video, sx, sy, size, size, 0, 0, size, size)

    canvas.toBlob(
      (blob) => {
        if (!blob) return
        stopStream()
        if (previewUrl) URL.revokeObjectURL(previewUrl)
        const url = URL.createObjectURL(blob)
        setCapturedBlob(blob)
        setPreviewUrl(url)
        setCameraState('captured')
      },
      'image/jpeg',
      0.88
    )
  }

  const retake = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setCapturedBlob(null)
    setPreviewUrl(null)
    setCameraState('requesting')
    startStream()
  }

  const upload = async () => {
    if (!capturedBlob || !sessionId) return
    setUploading(true)
    setError(null)
    try {
      const { photoUrl } = await starprintApi.uploadPhoto(sessionId, capturedBlob)
      setPhotoPreviewUrl(photoUrl)
      if (previewUrl) URL.revokeObjectURL(previewUrl)
      setStep('SOLVE')
    } catch {
      setError('Upload thất bại. Thử lại?')
    } finally {
      setUploading(false)
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    stopStream()
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    const url = URL.createObjectURL(file)
    setCapturedBlob(file)
    setPreviewUrl(url)
    setCameraState('captured')
  }

  const skipPhoto = () => {
    stopStream()
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setStep('SOLVE')
  }

  return (
    <div className="game-step camera-step">
      <div className="game-progress">📷 BƯỚC 2 · ẢNH CHÂN DUNG</div>
      <h2>Chân dung tỏa sáng</h2>
      <p>Ảnh chân dung sẽ đặt tại trung tâm của ngôi sao STARPRINT cá nhân</p>

      {cameraState === 'preview' && (
        <div className="camera-box">
          <video ref={videoRef} autoPlay playsInline muted className="camera-preview" />
          <button className="btn btn--primary" onClick={capture}>
            📸 Chụp ảnh
          </button>
        </div>
      )}

      {cameraState === 'captured' && previewUrl && (
        <div className="camera-box">
          <img src={previewUrl} alt="Ảnh chân dung đã chụp" className="camera-preview" />
          {error && <p className="field-error" role="alert">{error}</p>}
          <div className="camera-actions">
            <button className="btn btn--primary" disabled={uploading} onClick={upload}>
              {uploading ? 'Đang lưu ảnh...' : 'Dùng ảnh này ✓'}
            </button>
            <button className="btn btn--outline" disabled={uploading} onClick={retake}>
              🔄 Chụp lại
            </button>
          </div>
        </div>
      )}

      {cameraState === 'denied' && (
        <div className="camera-fallback">
          <p>Camera không khả dụng hoặc chưa được cấp quyền. Bạn có thể chọn ảnh từ thiết bị:</p>
          <label className="btn btn--outline file-upload-label">
            📁 Tải ảnh từ máy
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
            />
          </label>
        </div>
      )}

      {cameraState === 'requesting' && <p>Đang kết nối camera...</p>}

      <canvas ref={canvasRef} style={{ display: 'none' }} aria-hidden="true" />
      <button className="btn btn--outline camera-step__skip" onClick={skipPhoto}>
        Bỏ qua bước này →
      </button>
    </div>
  )
}
