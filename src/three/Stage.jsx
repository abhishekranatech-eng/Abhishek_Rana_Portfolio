import { useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { EffectComposer, Bloom, Noise, Vignette } from '@react-three/postprocessing'
import * as THREE from 'three'
import { sceneState, SECTIONS } from '../state.js'
import { buildShapes } from './shapes.js'
import Particles from './Particles.jsx'
import Network from './Network.jsx'

const isCompact = () => window.matchMedia('(max-width: 820px)').matches

// Moves the whole model beside the active section's text and tilts it toward the pointer.
function Rig({ children }) {
  const group = useRef()
  useFrame((state, delta) => {
    const dt = Math.min(delta, 1 / 30)
    const { width, height } = state.viewport
    const narrow = width / height < 0.85
    const section = SECTIONS[sceneState.active]
    const g = group.current

    const x = narrow ? 0 : section.x * width / 2
    const y = narrow ? (section.shape === 6 ? -1.6 : height * 0.18) : section.y
    const scale = narrow ? Math.min(0.66, width / 5.6) : Math.min(1, width / 9.2)

    g.position.x = THREE.MathUtils.damp(g.position.x, x, 2.2, dt)
    g.position.y = THREE.MathUtils.damp(g.position.y, y, 2.2, dt)
    g.scale.setScalar(THREE.MathUtils.damp(g.scale.x, scale, 2.2, dt))

    const t = state.clock.elapsedTime
    const { x: px, y: py } = sceneState.pointer
    g.rotation.y = THREE.MathUtils.damp(g.rotation.y, px * 0.32 + Math.sin(t * 0.17) * 0.1, 3, dt)
    g.rotation.x = THREE.MathUtils.damp(g.rotation.x, -py * 0.18 + Math.cos(t * 0.13) * 0.05, 3, dt)
  })
  return <group ref={group}>{children}</group>
}

export default function Stage({ onReady }) {
  const compact = useMemo(isCompact, [])
  const shapes = useMemo(() => buildShapes(compact ? 9000 : 16000), [compact])

  return (
    <Canvas
      dpr={[1, compact ? 1.5 : 1.75]}
      camera={{ position: [0, 0, 8], fov: 35, near: 0.1, far: 60 }}
      gl={{ antialias: false, powerPreference: 'high-performance' }}
      onCreated={() => requestAnimationFrame(() => onReady())}
    >
      <color attach="background" args={['#0a0a0b']} />
      <Rig>
        <Particles shapes={shapes} compact={compact} />
        <Network showLabels={!compact} />
      </Rig>
      <EffectComposer multisampling={0}>
        <Bloom mipmapBlur intensity={0.9} luminanceThreshold={0.18} luminanceSmoothing={0.4} radius={0.72} />
        <Noise premultiply opacity={0.35} />
        <Vignette offset={0.25} darkness={0.75} />
      </EffectComposer>
    </Canvas>
  )
}
