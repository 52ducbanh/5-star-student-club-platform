import { Component, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Float, Sparkles, Stars, PerformanceMonitor } from '@react-three/drei'
import * as THREE from 'three'
import { useReducedMotion } from '@/shared/hooks/useReducedMotion'
import { useIsMobile } from '@/shared/hooks/useIsMobile'

const CRITERIA_COLORS = [
  '#ff5c5c', // 1. Đạo đức tốt - Vivid Star Red
  '#6cd5f7', // 2. Học tập tốt - Sky Cyan
  '#ffd467', // 3. Thể lực tốt - Warm Sun Gold
  '#5fe3a1', // 4. Tình nguyện tốt - Mint Spring Green
  '#b794f6', // 5. Hội nhập tốt - Dreamy Lavender Violet
]

/** Pointer dampening rig for smooth mouse parallax */
function PointerRig({ active, children }: { active: boolean; children: ReactNode }) {
  const group = useRef<THREE.Group>(null)
  const { pointer } = useThree()

  useFrame((_, delta) => {
    if (!active || !group.current) return
    group.current.rotation.y = THREE.MathUtils.damp(group.current.rotation.y, pointer.x * 0.08, 2.5, delta)
    group.current.rotation.x = THREE.MathUtils.damp(group.current.rotation.x, -pointer.y * 0.05, 2.5, delta)
  })

  return <group ref={group}>{children}</group>
}

/** 3D Extruded Star representing the 5SS Core Achievement (Luminous Glossy Candy Star) */
function CentralStar({ active }: { active: boolean }) {
  const starGroup = useRef<THREE.Group>(null)

  const starShape = useMemo(() => {
    const shape = new THREE.Shape()
    const points = 5
    for (let i = 0; i < points * 2; i++) {
      const radius = i % 2 === 0 ? 0.94 : 0.42
      const angle = -Math.PI / 2 + (i * Math.PI) / 5
      const x = Math.cos(angle) * radius
      const y = Math.sin(angle) * radius
      if (i === 0) shape.moveTo(x, y)
      else shape.lineTo(x, y)
    }
    shape.closePath()
    return shape
  }, [])

  const extrusionSettings = useMemo<THREE.ExtrudeGeometryOptions>(
    () => ({
      depth: 0.2,
      bevelEnabled: true,
      bevelSegments: 4,
      bevelSize: 0.06,
      bevelThickness: 0.06,
      curveSegments: 12,
    }),
    [],
  )

  useFrame(({ clock }) => {
    if (!active || !starGroup.current) return
    starGroup.current.rotation.z = Math.sin(clock.elapsedTime * 0.3) * 0.04
    starGroup.current.rotation.y = Math.sin(clock.elapsedTime * 0.2) * 0.1
  })

  return (
    <group ref={starGroup} position={[0, 0, 0]}>
      <Float speed={active ? 0.8 : 0} rotationIntensity={0.06} floatIntensity={0.12}>
        {/* Core physical glossy candy star */}
        <mesh position={[0, 0, -0.1]}>
          <extrudeGeometry args={[starShape, extrusionSettings]} />
          <meshPhysicalMaterial
            color="#ffaa60"
            emissive="#ffd467"
            emissiveIntensity={0.92}
            metalness={0.12}
            roughness={0.14}
            clearcoat={1.0}
            clearcoatRoughness={0.06}
          />
        </mesh>

        {/* Inner glowing 5SS core diamond */}
        <mesh position={[0, 0, 0.08]} scale={0.22}>
          <octahedronGeometry args={[1, 0]} />
          <meshPhysicalMaterial
            color="#ffffff"
            emissive="#ffd467"
            emissiveIntensity={1.2}
            roughness={0.05}
            clearcoat={1}
          />
        </mesh>

        {/* Ambient back aura star */}
        <mesh position={[0, 0, -0.15]} scale={1.16}>
          <extrudeGeometry args={[starShape, { ...extrusionSettings, depth: 0.06 }]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.24} toneMapped={false} />
        </mesh>
      </Float>
    </group>
  )
}

/** 5 Orbiting Criteria Nodes with dynamic constellation energy lines */
function ConstellationOrbit({ active }: { active: boolean }) {
  const nodes = useRef<Array<THREE.Group | null>>([])
  const lineMesh = useRef<THREE.LineSegments>(null)

  // 5 Node dynamic coordinates buffer
  const nodePositions = useRef(new Float32Array(5 * 3))

  // Line indices to connect adjacent nodes into a closed pentagon
  const lineIndices = useMemo(() => {
    const indices: number[] = []
    for (let i = 0; i < 5; i++) {
      indices.push(i, (i + 1) % 5)
    }
    return new Uint16Array(indices)
  }, [])

  const lineGeometry = useMemo(() => {
    const geom = new THREE.BufferGeometry()
    geom.setAttribute('position', new THREE.BufferAttribute(new Float32Array(15), 3))
    geom.setIndex(new THREE.BufferAttribute(lineIndices, 1))
    return geom
  }, [lineIndices])

  useFrame(({ clock }) => {
    if (!active) return

    const time = clock.elapsedTime
    for (let i = 0; i < 5; i++) {
      const initialAngle = (i / 5) * Math.PI * 2
      const angle = time * (0.1 + i * 0.005) + initialAngle
      const x = Math.cos(angle) * 2.25
      const y = Math.sin(angle * 1.25 + i * 0.6) * 0.55
      const z = Math.sin(angle) * 0.85

      const node = nodes.current[i]
      if (node) {
        node.position.set(x, y, z)
      }

      nodePositions.current[i * 3] = x
      nodePositions.current[i * 3 + 1] = y
      nodePositions.current[i * 3 + 2] = z
    }

    if (lineMesh.current) {
      const posAttr = lineMesh.current.geometry.attributes.position as THREE.BufferAttribute
      posAttr.copyArray(nodePositions.current)
      posAttr.needsUpdate = true
    }
  })

  return (
    <group>
      {/* Subtle Constellation Energy Lines */}
      <lineSegments ref={lineMesh} geometry={lineGeometry}>
        <lineBasicMaterial color="#9fd7f5" transparent opacity={0.24} depthWrite={false} toneMapped={false} />
      </lineSegments>

      {/* 5 Criteria Nodes */}
      {CRITERIA_COLORS.map((color, index) => {
        const initialAngle = (index / 5) * Math.PI * 2
        return (
          <group
            key={color}
            ref={(node) => { nodes.current[index] = node }}
            position={[Math.cos(initialAngle) * 2.25, Math.sin(initialAngle * 1.25) * 0.55, Math.sin(initialAngle) * 0.85]}
          >
            {/* Core glossy orb */}
            <mesh>
              <sphereGeometry args={[0.125, 20, 20]} />
              <meshPhysicalMaterial
                color={color}
                emissive={color}
                emissiveIntensity={0.65}
                roughness={0.1}
                clearcoat={1}
                clearcoatRoughness={0.08}
              />
            </mesh>
            {/* Soft luminous halo */}
            <mesh scale={2.4}>
              <sphereGeometry args={[0.125, 14, 14]} />
              <meshBasicMaterial color={color} transparent opacity={0.22} depthWrite={false} toneMapped={false} />
            </mesh>
          </group>
        )
      })}
    </group>
  )
}

/** Complete 3D Solar / Galaxy Assembly */
function GalaxyAssembly({ active, mobile }: { active: boolean; mobile: boolean }) {
  const group = useRef<THREE.Group>(null)
  const ringA = useRef<THREE.Mesh>(null)
  const ringB = useRef<THREE.Mesh>(null)
  const viewportWidth = useThree((state) => state.viewport.width)

  // Keep the orbit halos inside the frustum when the desktop visual column is
  // relatively narrow. The canvas also has a small CSS overscan, so common
  // desktop widths retain the original 1:1 scene scale.
  const horizontalFitScale = THREE.MathUtils.clamp(
    (viewportWidth / 2 - 0.12) / 2.6,
    0.84,
    1,
  )
  const sceneScale = mobile ? 0.82 : horizontalFitScale

  useFrame(({ clock }, delta) => {
    if (!active) return
    if (group.current) group.current.rotation.y += delta * 0.03
    if (ringA.current) ringA.current.rotation.z = clock.elapsedTime * 0.06
    if (ringB.current) ringB.current.rotation.z = -clock.elapsedTime * 0.04
  })

  return (
    <group ref={group} scale={sceneScale}>
      <CentralStar active={active} />

      {/* Delicate Inner Planetary Orbit Trail */}
      <mesh rotation={[Math.PI / 2.5, 0.25, 0]}>
        <torusGeometry args={[1.2, 0.016, 12, 100]} />
        <meshBasicMaterial color="#ffd467" transparent opacity={0.5} toneMapped={false} />
      </mesh>

      {/* Outer Cyan Energy Ring */}
      <mesh ref={ringA} rotation={[Math.PI / 2.35, 0.18, 0.2]}>
        <torusGeometry args={[1.75, 0.014, 8, 120]} />
        <meshBasicMaterial color="#6cd5f7" transparent opacity={0.45} toneMapped={false} />
      </mesh>

      {/* Outer Candy Pink Energy Ring */}
      <mesh ref={ringB} rotation={[Math.PI / 2.1, -0.38, 1.0]}>
        <torusGeometry args={[2.2, 0.012, 8, 120]} />
        <meshBasicMaterial color="#f565b4" transparent opacity={0.35} toneMapped={false} />
      </mesh>

      <ConstellationOrbit active={active} />
    </group>
  )
}

function Scene({ active, mobile, lowPower }: { active: boolean; mobile: boolean; lowPower: boolean }) {
  return (
    <>
      <fog attach="fog" args={['#0b234d', 7, 19]} />
      <ambientLight intensity={0.95} />
      <directionalLight position={[3, 4, 5]} color="#ffffff" intensity={3.0} />
      <pointLight position={[2.5, 1.8, 3]} color="#f565b4" intensity={6} distance={12} />
      <pointLight position={[-3, -2, 2]} color="#6cd5f7" intensity={5} distance={12} />
      <pointLight position={[0, 2.5, 2]} color="#ffd467" intensity={5} distance={10} />

      <PointerRig active={active}>
        <GalaxyAssembly active={active} mobile={mobile} />
      </PointerRig>

      <Stars
        radius={14}
        depth={30}
        count={lowPower ? 180 : 420}
        factor={mobile ? 1.2 : 1.6}
        saturation={0.4}
        fade
        speed={active ? 0.12 : 0}
      />

      <Sparkles
        count={lowPower ? 10 : 24}
        scale={[7.5, 5, 3.5]}
        size={lowPower ? 1.1 : 1.5}
        speed={active ? 0.2 : 0}
        opacity={0.55}
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
  } catch {
    return false
  }
}

export function HeroGalaxyScene() {
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

  const fallback = <div className="galaxy-scene__fallback" aria-hidden="true" />

  return (
    <div ref={containerRef} className="galaxy-scene" aria-hidden="true">
      <SceneBoundary fallback={fallback}>
        {renderCanvas ? (
          <Canvas
            dpr={dpr}
            camera={{ position: [0, 0, mobile ? 5.8 : 5.2], fov: mobile ? 52 : 46 }}
            gl={{ powerPreference: 'high-performance', alpha: true, antialias: !mobile }}
            frameloop={active ? 'always' : 'demand'}
          >
            <PerformanceMonitor onDecline={() => setDpr(1)} onIncline={() => setDpr(1.5)} />
            <Scene active={active} mobile={mobile} lowPower={mobile} />
          </Canvas>
        ) : fallback}
      </SceneBoundary>
    </div>
  )
}
