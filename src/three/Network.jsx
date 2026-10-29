import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import { sceneState } from '../state.js'
import { NET_NODES, NET_EDGES } from './shapes.js'
import { pulseVertex, pulseFragment } from './shaders.js'

const PULSES_PER_EDGE = 3
const NETWORK_SHAPE = 5

// Links and travelling messages layered over the network point cloud.
// Visible only while that shape is formed.
export default function Network({ showLabels }) {
  const group = useRef()
  const lineMaterial = useRef()
  const pulseMaterial = useRef()
  const labels = useRef([])

  const lines = useMemo(() => {
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(NET_EDGES.flatMap(([a, b]) => [...NET_NODES[a].p, ...NET_NODES[b].p])), 3))
    return g
  }, [])

  const pulses = useMemo(() => {
    const from = []
    const to = []
    const seed = []
    NET_EDGES.forEach(([a, b], e) => {
      for (let k = 0; k < PULSES_PER_EDGE; k++) {
        // alternate direction so traffic flows both ways, like request/response
        const forward = (e + k) % 2 === 0
        from.push(...NET_NODES[forward ? a : b].p)
        to.push(...NET_NODES[forward ? b : a].p)
        seed.push(k / PULSES_PER_EDGE + e * 0.13, 0.25 + ((e * 7 + k * 3) % 5) * 0.06)
      }
    })
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(from), 3))
    g.setAttribute('aFrom', new THREE.BufferAttribute(new Float32Array(from), 3))
    g.setAttribute('aTo', new THREE.BufferAttribute(new Float32Array(to), 3))
    g.setAttribute('aSeed', new THREE.BufferAttribute(new Float32Array(seed), 2))
    return g
  }, [])

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uPixelRatio: { value: 1 },
    uOpacity: { value: 0 },
    uColor: { value: new THREE.Color('#d9fff0') },
  }), [])

  useFrame((state, delta) => {
    const w = sceneState.weights[NETWORK_SHAPE]
    const visible = Math.max(0, (w - 0.35) / 0.65)
    group.current.visible = visible > 0.001
    // keep in step with the point cloud, which sways the same way in the shader
    group.current.rotation.y = Math.sin(sceneState.time * 0.2) * 0.25
    lineMaterial.current.opacity = visible * 0.22
    pulseMaterial.current.uniforms.uOpacity.value = visible
    pulseMaterial.current.uniforms.uTime.value += Math.min(delta, 1 / 30)
    pulseMaterial.current.uniforms.uPixelRatio.value = state.gl.getPixelRatio()
    for (const el of labels.current) {
      if (el) el.style.opacity = visible.toFixed(3)
    }
  })

  return (
    <group ref={group}>
      <lineSegments geometry={lines}>
        <lineBasicMaterial ref={lineMaterial} color="#7dffc8" transparent opacity={0} depthWrite={false} blending={THREE.AdditiveBlending} />
      </lineSegments>
      <points geometry={pulses} frustumCulled={false}>
        <shaderMaterial
          ref={pulseMaterial}
          vertexShader={pulseVertex}
          fragmentShader={pulseFragment}
          uniforms={uniforms}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
      {showLabels && NET_NODES.map((node, i) => (
        <Html key={node.label} position={[node.p[0], node.p[1] - node.r - 0.18, node.p[2]]} center zIndexRange={[1, 0]}>
          <div className="node-label" ref={(el) => { labels.current[i] = el }}>{node.label}</div>
        </Html>
      ))}
    </group>
  )
}
