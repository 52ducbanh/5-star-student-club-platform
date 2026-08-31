import { useRef, useMemo, useState, useEffect, Component, type ReactNode } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, Sparkles, PerformanceMonitor } from '@react-three/drei'
import * as THREE from 'three'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { useIsMobile } from '../../hooks/useIsMobile'

interface Criteria3DSceneProps {
  activeIndex: number // 0 to 4
}

const CRITERIA_COLORS = [
  '#ffd467', // 1. Đạo đức tốt - Warm Sun Gold
  '#6cd5f7', // 2. Học tập tốt - Sky Cyan
  '#5fe3a1', // 3. Thể lực tốt - Mint Spring Green
  '#ff8b72', // 4. Tình nguyện tốt - Coral Orange
  '#b794f6', // 5. Hội nhập tốt - Dreamy Lavender Violet
]

function CriteriaConstellation({
  activeIndex,
  active,
  mobile,
}: {
  activeIndex: number
  active: boolean
  mobile: boolean
}) {
  const group = useRef<THREE.Group>(null)

  useFrame((_, delta) => {
    if (!active || !group.current) return

    const activeAngle = -Math.PI / 2 + (activeIndex * 2 * Math.PI) / 5
    const targetRotationY = -activeAngle - Math.PI / 2

    // Smoothly interpolate rotation to orient active node towards camera
    group.current.rotation.y = THREE.MathUtils.damp(
      group.current.rotation.y,
      targetRotationY * 0.45,
      2.5,
      delta,
    )
    group.current.rotation.x = THREE.MathUtils.damp(
      group.current.rotation.x,
      0.18,
      2.0,
      delta,
    )
  })

  const radius = mobile ? 1.6 : 1.75
  const nodes = useMemo(() => {
    return Array.from({ length: 5 }).map((_, i) => {
      const angle = -Math.PI / 2 + (i * 2 * Math.PI) / 5
      return {
        pos: [Math.cos(angle) * radius, Math.sin(angle) * radius, 0] as [number, number, number],
        color: CRITERIA_COLORS[i],
      }
    })
  }, [radius])

  const activeColor = CRITERIA_COLORS[activeIndex] || '#ffd467'

  return (
    <group ref={group}>
      <Float speed={active ? 1.8 : 0} rotationIntensity={0.12} floatIntensity={0.28}>
        {/* Core Pentagon wireframe lines */}
        {nodes.map((node, i) => {
          const next = nodes[(i + 1) % 5]
          const isHighlighted = i === activeIndex || (i + 1) % 5 === activeIndex

          return (
            <line key={`line-${i}`}>
              <bufferGeometry>
                <bufferAttribute
                  attach="attributes-position"
                  args={[new Float32Array([...node.pos, ...next.pos]), 3]}
                />
              </bufferGeometry>
              <lineBasicMaterial
                color={isHighlighted ? activeColor : '#9fd7f5'}
                transparent
                opacity={isHighlighted ? 0.9 : 0.22}
                linewidth={isHighlighted ? 2.5 : 1}
              />
            </line>
          )
        })}

        {/* Diagonal star lines to center core */}
        {nodes.map((node, i) => (
          <line key={`center-line-${i}`}>
            <bufferGeometry>
              <bufferAttribute
                attach="attributes-position"
                args={[new Float32Array([...node.pos, 0, 0, 0]), 3]}
              />
            </bufferGeometry>
            <lineBasicMaterial
              color={node.color}
              transparent
              opacity={i === activeIndex ? 0.95 : 0.18}
            />
          </line>
        ))}

        {/* 5 Nodes */}
        {nodes.map((node, i) => {
          const isActive = i === activeIndex
          return (
            <group key={`node-${i}`} position={node.pos}>
              {/* Inner crisp orb */}
              <mesh scale={isActive ? 1.55 : 0.95}>
                <sphereGeometry args={[0.13, mobile ? 16 : 24, mobile ? 16 : 24]} />
                <meshPhysicalMaterial
                  color={node.color}
                  emissive={node.color}
                  emissiveIntensity={isActive ? 1.2 : 0.35}
                  roughness={0.08}
                  clearcoat={1}
                />
              </mesh>

              {/* Outer soft glowing atmosphere */}
              <mesh scale={isActive ? 3.6 : 1.6}>
                <sphereGeometry args={[0.13, 14, 14]} />
                <meshBasicMaterial
                  color={node.color}
                  transparent
                  opacity={isActive ? 0.45 : 0.08}
                  depthWrite={false}
                  toneMapped={false}
                />
              </mesh>
            </group>
          )
        })}

        {/* Central 5SS Star Core */}
        <mesh position={[0, 0, 0]} scale={0.34}>
          <octahedronGeometry args={[1, 0]} />
          <meshPhysicalMaterial
            color={activeColor}
            emissive={activeColor}
            emissiveIntensity={0.9}
            roughness={0.1}
            clearcoat={1}
          />
        </mesh>
      </Float>
    </group>
  )
}

class CriteriaSceneBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  render() { return this.state.failed ? this.props.fallback : this.props.children }
}

function supportsWebGL() {
  try {
    const canvas = document.createElement('canvas')
    return Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl'))
  } catch {
    return false
  }
}

export function Criteria3DScene({ activeIndex }: Criteria3DSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const reducedMotion = useReducedMotion()
  const mobile = useIsMobile(768)
  const [visible, setVisible] = useState(false)
  const [dpr, setDpr] = useState(mobile ? 1.1 : 1.4)

  const hasWebGL = useMemo(() => supportsWebGL(), [])
  const active = visible && !reducedMotion
  const renderCanvas = hasWebGL && !reducedMotion

  useEffect(() => {
    const element = containerRef.current
    if (!element || typeof IntersectionObserver === 'undefined') {
      setVisible(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setVisible(entry.isIntersecting)
      },
      { rootMargin: '160px' },
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  const fallback = (
    <div
      className="w-full h-full flex items-center justify-center rounded-2xl bg-[rgba(14,46,94,0.4)] border border-[rgba(159,215,245,0.2)]"
      aria-hidden="true"
    />
  )

  return (
    <div ref={containerRef} className="w-full h-full relative" aria-hidden="true">
      <CriteriaSceneBoundary fallback={fallback}>
        {renderCanvas ? (
          <Canvas
            camera={{ position: [0, 0, mobile ? 4.8 : 4.4], fov: mobile ? 50 : 46 }}
            dpr={dpr}
            gl={{ powerPreference: 'high-performance', alpha: true, antialias: !mobile }}
            frameloop={active ? 'always' : 'demand'}
          >
            <PerformanceMonitor onDecline={() => setDpr(1)} onIncline={() => setDpr(mobile ? 1.2 : 1.5)} />
            <ambientLight intensity={1.2} />
            <directionalLight position={[2, 3, 4]} color="#ffffff" intensity={2.6} />
            <pointLight position={[0, 0, 2]} color={CRITERIA_COLORS[activeIndex]} intensity={5.5} distance={8} />

            <CriteriaConstellation activeIndex={activeIndex} active={active} mobile={mobile} />

            <Sparkles
              count={mobile ? 8 : 18}
              scale={[5, 5, 2]}
              size={mobile ? 1.2 : 1.6}
              speed={active ? 0.35 : 0}
              opacity={0.6}
              color={CRITERIA_COLORS[activeIndex]}
            />
          </Canvas>
        ) : fallback}
      </CriteriaSceneBoundary>
    </div>
  )
}
