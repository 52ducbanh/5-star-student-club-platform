import { Component, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Float, Sparkles, Stars, PerformanceMonitor, Html } from '@react-three/drei'
import * as THREE from 'three'
import { useReducedMotion } from '@/shared/hooks/useReducedMotion'
import { useIsMobile } from '@/shared/hooks/useIsMobile'
import type { SkyStar } from '@/features/starprint/types/api.types'

interface Props {
  stars: SkyStar[]
  onSelectStar?: (star: SkyStar) => void
}

/** Individual 3D Interactive Star Node */
function InteractiveStarNode({
  star,
  position,
  active,
  onSelect,
}: {
  star: SkyStar
  position: [number, number, number]
  active: boolean
  onSelect?: (star: SkyStar) => void
}) {
  const meshRef = useRef<THREE.Mesh>(null)
  const [hovered, setHovered] = useState(false)
  const baseColor = star.palette?.[0] || '#ffd467'

  useFrame(({ clock }) => {
    if (!active || !meshRef.current) return
    meshRef.current.rotation.y = clock.elapsedTime * 0.4
    meshRef.current.rotation.z = Math.sin(clock.elapsedTime * 0.5) * 0.2
  })

  return (
    <group position={position}>
      <Float speed={active ? 1.2 : 0} rotationIntensity={0.15} floatIntensity={0.25}>
        <mesh
          ref={meshRef}
          onPointerOver={(e) => { e.stopPropagation(); setHovered(true) }}
          onPointerOut={() => setHovered(false)}
          onClick={(e) => { e.stopPropagation(); onSelect?.(star) }}
          scale={hovered ? 1.4 : 1.0}
        >
          <octahedronGeometry args={[0.3, 0]} />
          <meshPhysicalMaterial
            color={baseColor}
            emissive={baseColor}
            emissiveIntensity={hovered ? 1.8 : 0.9}
            roughness={0.1}
            clearcoat={1}
            clearcoatRoughness={0.05}
          />
        </mesh>

        {/* Outer Glowing Halo */}
        <mesh scale={hovered ? 2.8 : 1.8}>
          <sphereGeometry args={[0.3, 12, 12]} />
          <meshBasicMaterial color={baseColor} transparent opacity={hovered ? 0.4 : 0.18} depthWrite={false} />
        </mesh>

        {/* 3D Tooltip on Hover */}
        {hovered && (
          <Html distanceFactor={10} position={[0, 0.6, 0]} center>
            <div className="sky-3d-tooltip">
              {star.nickname && <strong>{star.nickname}</strong>}
              <span>{star.type}</span>
            </div>
          </Html>
        )}
      </Float>
    </group>
  )
}

/** 3D Sky Assembly positioning stars in a spherical dome */
function SkyDome({ stars, active, mobile, onSelectStar }: { stars: SkyStar[]; active: boolean; mobile: boolean; onSelectStar?: (star: SkyStar) => void }) {
  const groupRef = useRef<THREE.Group>(null)
  const { pointer } = useThree()

  // Calculate deterministic spherical coordinates for each star
  const starPositions = useMemo(() => {
    return stars.map((_, index) => {
      const phi = Math.acos(-1 + (2 * (index + 0.5)) / Math.max(stars.length, 1))
      const theta = Math.sqrt(stars.length * Math.PI) * phi
      const radius = (mobile ? 3.0 : 4.0) + (index % 4) * 0.45
      const x = radius * Math.cos(theta) * Math.sin(phi) * (mobile ? 0.9 : 1.0)
      const y = radius * Math.cos(phi) * (mobile ? 1.25 : 0.8)
      const z = radius * Math.sin(theta) * Math.sin(phi) * 0.8
      return [x, y, z] as [number, number, number]
    })
  }, [stars, mobile])

  useFrame((_, delta) => {
    if (!active || !groupRef.current) return
    groupRef.current.rotation.y += delta * 0.04
    groupRef.current.rotation.x = THREE.MathUtils.damp(groupRef.current.rotation.x, -pointer.y * 0.08, 2, delta)
  })

  return (
    <group ref={groupRef}>
      {stars.map((star, idx) => (
        <InteractiveStarNode
          key={star.id || idx}
          star={star}
          position={starPositions[idx] || [0, 0, 0]}
          active={active}
          onSelect={onSelectStar}
        />
      ))}
    </group>
  )
}

function Scene({ stars, active, mobile, lowPower, onSelectStar }: { stars: SkyStar[]; active: boolean; mobile: boolean; lowPower: boolean; onSelectStar?: (star: SkyStar) => void }) {
  return (
    <>
      <fog attach="fog" args={['#060f22', 8, 22]} />
      <ambientLight intensity={0.8} />
      <directionalLight position={[5, 5, 5]} color="#ffffff" intensity={2.5} />
      <pointLight position={[0, 0, 0]} color="#6cd5f7" intensity={4} distance={15} />

      <SkyDome stars={stars} active={active} mobile={mobile} onSelectStar={onSelectStar} />

      <Stars
        radius={18}
        depth={40}
        count={lowPower ? 200 : 500}
        factor={mobile ? 1.2 : 1.6}
        saturation={0.5}
        fade
        speed={active ? 0.15 : 0}
      />

      <Sparkles
        count={lowPower ? 15 : 35}
        scale={[12, 8, 12]}
        size={lowPower ? 1.2 : 1.8}
        speed={active ? 0.25 : 0}
        opacity={0.6}
        color="#ffd467"
      />
    </>
  )
}

class SceneBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  render() { return this.state.failed ? this.props.fallback : this.props.children }
}

function supportsWebGL() {
  try {
    const canvas = document.createElement('canvas')
    return Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl'))
  } catch { return false }
}

export function StarSkyScene({ stars, onSelectStar }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const reducedMotion = useReducedMotion()
  const mobile = useIsMobile(768)
  const [visible, setVisible] = useState(true)
  const [dpr, setDpr] = useState(1.5)

  const hasWebGL = useMemo(() => supportsWebGL(), [])
  const renderCanvas = hasWebGL && !reducedMotion
  const active = visible && !reducedMotion

  useEffect(() => {
    const element = containerRef.current
    if (!element || typeof IntersectionObserver === 'undefined') return
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { rootMargin: '100px' })
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  const fallback = <div className="sky-scene__fallback" aria-hidden="true" />

  return (
    <div ref={containerRef} className="sky-3d-scene" aria-hidden="true">
      <SceneBoundary fallback={fallback}>
        {renderCanvas ? (
          <Canvas
            dpr={dpr}
            camera={{ position: [0, 0, mobile ? 6.8 : 7.2], fov: mobile ? 54 : 50 }}
            gl={{ powerPreference: 'high-performance', alpha: true, antialias: !mobile }}
            frameloop={active ? 'always' : 'demand'}
          >
            <PerformanceMonitor onDecline={() => setDpr(1)} onIncline={() => setDpr(1.5)} />
            <Scene stars={stars} active={active} mobile={mobile} lowPower={mobile} onSelectStar={onSelectStar} />
          </Canvas>
        ) : fallback}
      </SceneBoundary>
    </div>
  )
}
