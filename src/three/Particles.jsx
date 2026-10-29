import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { sceneState, SECTIONS, PALETTE } from '../state.js'
import { particleVertex, particleFragment } from './shaders.js'

const palette = PALETTE.map(([a, b]) => [new THREE.Color(a), new THREE.Color(b)])

export default function Particles({ shapes, compact }) {
  const material = useRef()

  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry()
    shapes.targets.forEach((arr, i) => {
      g.setAttribute(i === 0 ? 'position' : `aT${i}`, new THREE.BufferAttribute(arr, 3))
    })
    g.setAttribute('aRand', new THREE.BufferAttribute(shapes.random, 4))
    g.setAttribute('aScatter', new THREE.BufferAttribute(shapes.scatter, 3))
    g.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 14)
    return g
  }, [shapes])

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uW: { value: [1, 0, 0, 0, 0, 0, 0] },
    uSize: { value: compact ? 2.6 : 2.3 },
    uPixelRatio: { value: 1 },
    uIntro: { value: 0 },
    uTurb: { value: 0 },
    uAlpha: { value: compact ? 0.6 : 1 },
    uMouse: { value: new THREE.Vector3(99, 99, 0) },
    uColorA: { value: palette[0][0].clone() },
    uColorB: { value: palette[0][1].clone() },
  }), [compact])

  useFrame((state, delta) => {
    const dt = Math.min(delta, 1 / 30)
    const u = material.current.uniforms
    const shape = SECTIONS[sceneState.active].shape

    u.uTime.value += dt
    sceneState.time = u.uTime.value
    u.uPixelRatio.value = state.gl.getPixelRatio()
    u.uIntro.value = sceneState.intro

    const w = u.uW.value
    let strongest = 0
    for (let i = 0; i < w.length; i++) {
      w[i] = THREE.MathUtils.damp(w[i], i === shape ? 1 : 0, 2.4, dt)
      strongest = Math.max(strongest, w[i])
    }
    sceneState.weights = w

    const scrollKick = Math.min(Math.abs(sceneState.velocity) * 0.012, 0.35)
    u.uTurb.value = THREE.MathUtils.damp(u.uTurb.value, (1 - strongest) + scrollKick, 6, dt)

    const blend = 1 - Math.exp(-2.4 * dt)
    u.uColorA.value.lerp(palette[shape][0], blend)
    u.uColorB.value.lerp(palette[shape][1], blend)

    const { width, height } = state.viewport
    const mx = sceneState.pointer.x * width / 2
    const my = sceneState.pointer.y * height / 2
    u.uMouse.value.x = THREE.MathUtils.damp(u.uMouse.value.x, mx, 8, dt)
    u.uMouse.value.y = THREE.MathUtils.damp(u.uMouse.value.y, my, 8, dt)
  })

  return (
    <points geometry={geometry} frustumCulled={false}>
      <shaderMaterial
        ref={material}
        vertexShader={particleVertex}
        fragmentShader={particleFragment}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}
