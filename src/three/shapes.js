import { FONTS } from '../state.js'

// Every model on the page is a point cloud generated here, from drawings and
// geometry tied to the work it represents. All clouds share the same point count
// so the shader can blend any one into any other.

const TAU = Math.PI * 2

const mulberry32 = (seed) => () => {
  seed = (seed + 0x6d2b79f5) | 0
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}

const createCloud = (n) => {
  const arr = new Float32Array(n * 3)
  let count = 0
  return {
    arr,
    get count() { return count },
    add(x, y, z) {
      if (count >= n) return
      arr[count * 3] = x
      arr[count * 3 + 1] = y
      arr[count * 3 + 2] = z
      count++
    },
    fillTo(target, fn) {
      const stop = Math.min(n, Math.round(target))
      while (count < stop) fn()
    },
  }
}

// Draws onto an offscreen canvas and returns a sampler that picks points with
// probability proportional to pixel alpha, so faint fills come out sparse.
const canvasSampler = (w, h, draw, rand) => {
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  ctx.fillStyle = '#fff'
  ctx.strokeStyle = '#fff'
  draw(ctx, w, h)
  const data = ctx.getImageData(0, 0, w, h).data
  const px = []
  const alpha = []
  for (let y = 0; y < h; y += 2) {
    for (let x = 0; x < w; x += 2) {
      const a = data[(y * w + x) * 4 + 3]
      if (a > 10) {
        px.push(x, y)
        alpha.push(a / 255)
      }
    }
  }
  return () => {
    if (alpha.length === 0) return [rand() - 0.5, rand() - 0.5]
    for (;;) {
      const i = Math.floor(rand() * alpha.length)
      if (rand() < alpha[i]) {
        return [(px[i * 2] + rand() * 2) / w - 0.5, 0.5 - (px[i * 2 + 1] + rand() * 2) / h]
      }
    }
  }
}

const rotateCloud = (arr, rx, ry, rz) => {
  const [cx, sx, cy, sy, cz, sz] = [Math.cos(rx), Math.sin(rx), Math.cos(ry), Math.sin(ry), Math.cos(rz), Math.sin(rz)]
  for (let i = 0; i < arr.length; i += 3) {
    let x = arr[i], y = arr[i + 1], z = arr[i + 2]
    let t = y * cx - z * sx; z = y * sx + z * cx; y = t
    t = x * cy + z * sy; z = -x * sy + z * cy; x = t
    t = x * cz - y * sz; y = x * sz + y * cz; x = t
    arr[i] = x; arr[i + 1] = y; arr[i + 2] = z
  }
  return arr
}

const roundRect = (ctx, x, y, w, h, r) => {
  ctx.beginPath()
  ctx.roundRect(x, y, w, h, r)
}

// A point on the outline of a w×h rectangle, plus faint "text lines" inside.
const rectPoint = (rand, w, h, lines = 0) => {
  if (lines && rand() < 0.35) {
    const row = Math.floor(rand() * lines)
    const len = 0.45 + ((row * 37) % 5) / 10
    return [(-0.5 + 0.12 + rand() * len * 0.76) * w, (0.28 - row * (0.56 / Math.max(1, lines - 1))) * h]
  }
  const per = 2 * (w + h)
  let d = rand() * per
  if (d < w) return [d - w / 2, h / 2]
  d -= w
  if (d < h) return [w / 2, h / 2 - d]
  d -= h
  if (d < w) return [w / 2 - d, -h / 2]
  d -= w
  return [-w / 2, -h / 2 + d]
}

/* 0 · Hero: AR monogram with an orbit ring */
const monogram = (n, rand) => {
  const cloud = createCloud(n)
  const sample = canvasSampler(1400, 700, (ctx, w, h) => {
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.font = `800 500px ${FONTS.display}`
    ctx.fillText('AR', w / 2, h / 2 + 20)
  }, rand)
  cloud.fillTo(n * 0.84, () => {
    const [u, v] = sample()
    cloud.add(u * 6.8, v * 3.4, (rand() - 0.5) * 0.6)
  })
  cloud.fillTo(n, () => {
    const a = rand() * TAU
    const r = 3.5 + (rand() - 0.5) * (rand() < 0.8 ? 0.06 : 0.5)
    cloud.add(Math.cos(a) * r, Math.sin(a) * r * 0.16 - 0.1, Math.sin(a) * r * 0.75)
  })
  return rotateCloud(cloud.arr, 0, 0, 0.08)
}

/* 1 · Kafka topic: three partitions of record blocks twisted into a helix */
const eventLog = (n, rand) => {
  const cloud = createCloud(n)
  const strands = 3
  const blocks = 30
  const radius = 1.15
  const height = 4.2
  const turns = 1.25
  const size = [0.36, 0.15, 0.2]
  const list = []
  for (let s = 0; s < strands; s++) {
    for (let j = 0; j < blocks; j++) {
      // Each partition has a different log length, like real topics.
      if (j > blocks - 1 - s * 4) continue
      const t = j / (blocks - 1)
      list.push({ a: t * turns * TAU + (s * TAU) / strands, y: (t - 0.5) * height })
    }
  }
  const point = (sx, sy, sz) => {
    const axis = Math.floor(rand() * 3)
    const p = [sx * (rand() - 0.5), sy * (rand() - 0.5), sz * (rand() - 0.5)]
    const half = [sx / 2, sy / 2, sz / 2]
    if (rand() < 0.78) {
      // On an edge: two coordinates pinned to the box surface.
      for (let k = 0; k < 3; k++) if (k !== axis) p[k] = rand() < 0.5 ? -half[k] : half[k]
    } else {
      p[axis] = rand() < 0.5 ? -half[axis] : half[axis]
    }
    return p
  }
  cloud.fillTo(n * 0.93, () => {
    const b = list[Math.floor(rand() * list.length)]
    const [lx, ly, lz] = point(...size)
    const c = Math.cos(b.a), s = Math.sin(b.a)
    // local x along the tangent, local z along the radius
    cloud.add(c * radius + -s * lx + c * lz, b.y + ly, s * radius + c * lx + s * lz)
  })
  cloud.fillTo(n, () => {
    const y = (rand() - 0.5) * height * 1.1
    const tick = Math.round(y * 5) / 5
    cloud.add((rand() - 0.5) * 0.04, rand() < 0.5 ? tick : y, (rand() - 0.5) * 0.04)
  })
  return cloud.arr
}

/* 2 · Enfineo: IBAN card */
const bankCard = (n, rand) => {
  const cloud = createCloud(n)
  const W = 1100
  const H = Math.round(W / 1.586)
  const sample = canvasSampler(W, H, (ctx, w, h) => {
    ctx.fillStyle = 'rgba(255,255,255,0.05)'
    roundRect(ctx, 6, 6, w - 12, h - 12, 56)
    ctx.fill()
    ctx.lineWidth = 7
    ctx.stroke()
    ctx.fillStyle = 'rgba(255,255,255,0.3)'
    ctx.lineWidth = 5
    roundRect(ctx, 100, 250, 150, 112, 18)
    ctx.fill()
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(100, 288); ctx.lineTo(250, 288)
    ctx.moveTo(100, 324); ctx.lineTo(250, 324)
    ctx.moveTo(175, 250); ctx.lineTo(175, 362)
    ctx.stroke()
    for (let i = 0; i < 3; i++) {
      ctx.beginPath()
      ctx.arc(290, 306, 22 + i * 20, -0.85, 0.85)
      ctx.stroke()
    }
    ctx.fillStyle = '#fff'
    ctx.font = `800 80px ${FONTS.display}`
    ctx.fillText('ENFINEO', 100, 170)
    ctx.font = `500 58px ${FONTS.mono}`
    ctx.fillText('••••  ••••  ••••  4821', 100, 495)
    ctx.font = `500 32px ${FONTS.mono}`
    ctx.fillText('IBAN · EUR · CRYPTO', 100, 575)
    ctx.lineWidth = 6
    for (const cx of [w - 230, w - 160]) {
      ctx.beginPath()
      ctx.arc(cx, h - 120, 58, 0, TAU)
      ctx.stroke()
    }
  }, rand)
  const cw = 3.7
  const ch = cw / 1.586
  cloud.fillTo(n * 0.9, () => {
    const [u, v] = sample()
    cloud.add(u * cw, v * ch, (rand() - 0.5) * 0.04)
  })
  // A second card peeking behind, like a stacked wallet.
  cloud.fillTo(n, () => {
    const [x, y] = rectPoint(rand, cw * 0.96, ch * 0.96)
    cloud.add(x + 0.35, y - 0.32, -0.45)
  })
  return rotateCloud(cloud.arr, 0.12, -0.42, 0.06)
}

/* 3 · Lendary: LRY coin with a staking orbit */
const coin = (n, rand) => {
  const cloud = createCloud(n)
  const R = 1.55
  const T = 0.3
  const face = canvasSampler(1024, 1024, (ctx, w) => {
    const c = w / 2
    ctx.lineWidth = 14
    ctx.beginPath(); ctx.arc(c, c, 492, 0, TAU); ctx.stroke()
    ctx.lineWidth = 6
    ctx.beginPath(); ctx.arc(c, c, 380, 0, TAU); ctx.stroke()
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.font = `800 470px ${FONTS.display}`
    ctx.fillText('L', c + 8, c + 18)
    ctx.font = `600 50px ${FONTS.mono}`
    const ring = ' LENDARY · LEND · STAKE · VEST · LRY ·'
    const step = TAU / ring.length
    for (let i = 0; i < ring.length; i++) {
      ctx.save()
      ctx.translate(c, c)
      ctx.rotate(i * step)
      ctx.fillText(ring[i], 0, -436)
      ctx.restore()
    }
  }, rand)
  cloud.fillTo(n * 0.46, () => {
    const [u, v] = face()
    cloud.add(u * R * 2.08, v * R * 2.08, T / 2 + rand() * 0.02)
  })
  cloud.fillTo(n * 0.6, () => {
    const a = rand() * TAU
    const r = R * (rand() < 0.6 ? 1 : 0.77)
    cloud.add(-Math.cos(a) * r, Math.sin(a) * r, -T / 2)
  })
  cloud.fillTo(n * 0.86, () => {
    // Reeded edge: points bunch onto ridges around the rim.
    const a = (Math.round(rand() * 140) + (rand() - 0.5) * 0.3) / 140 * TAU
    cloud.add(Math.cos(a) * R, Math.sin(a) * R, (rand() - 0.5) * T)
  })
  cloud.fillTo(n, () => {
    const a = rand() * TAU
    const r = 2.45 + (rand() - 0.5) * 0.08
    // a few denser clumps read as reward tokens travelling round the orbit
    const clump = rand() < 0.4 ? Math.round(a / TAU * 9) / 9 * TAU + (rand() - 0.5) * 0.06 : a
    cloud.add(Math.cos(clump) * r, Math.sin(clump) * r * 0.22, Math.sin(clump) * r * 0.6)
  })
  return rotateCloud(cloud.arr, 0, 0, -0.12)
}

/* 4 · LinkedIn Hiring Post Finder: feed of posts → AI filter funnel → matched results */
const funnel = (n, rand) => {
  const cloud = createCloud(n)
  const posts = Array.from({ length: 13 }, (_, i) => ({
    x: -1.7 + (i % 5) * 0.85 + (rand() - 0.5) * 0.3,
    y: 1.55 + Math.floor(i / 5) * 0.42 + (rand() - 0.5) * 0.15,
    z: (rand() - 0.5) * 1.6,
    rot: (rand() - 0.5) * 0.5,
  }))
  cloud.fillTo(n * 0.27, () => {
    const p = posts[Math.floor(rand() * posts.length)]
    const [x, y] = rectPoint(rand, 0.62, 0.36, 3)
    const c = Math.cos(p.rot), s = Math.sin(p.rot)
    cloud.add(p.x + x * c - y * s, p.y + x * s + y * c, p.z)
  })
  const top = 1.15
  const neck = -0.45
  cloud.fillTo(n * 0.7, () => {
    const ringed = rand() < 0.7
    let t = rand()
    if (ringed) t = Math.round(t * 13) / 13
    const y = neck + t * (top - neck)
    const r = 0.16 + 1.55 * Math.pow(t, 1.7)
    const a = rand() * TAU
    cloud.add(Math.cos(a) * r, y, Math.sin(a) * r)
  })
  cloud.fillTo(n * 0.77, () => {
    const a = rand() * TAU
    cloud.add(Math.cos(a) * 0.16, neck - rand() * 0.6, Math.sin(a) * 0.16)
  })
  cloud.fillTo(n, () => {
    const row = Math.floor(rand() * 3)
    const y = -1.45 - row * 0.4
    if (rand() < 0.15) {
      // check mark at the left of each result row
      const t = rand()
      const [x, yy] = t < 0.35 ? [-0.62 + t / 0.35 * 0.07, y - t / 0.35 * 0.07] : [-0.55 + (t - 0.35) / 0.65 * 0.15, y - 0.07 + (t - 0.35) / 0.65 * 0.15]
      cloud.add(x, yy, 0)
      return
    }
    const [x, yy] = rectPoint(rand, 1.5, 0.3, 1)
    cloud.add(x, y + yy, 0)
  })
  return rotateCloud(cloud.arr, 0.18, 0, 0)
}

/* 5 · Microservices graph, shaped like the Enfineo platform */
export const NET_NODES = [
  { label: 'React admin', p: [-2.45, 1.3, 0.3], r: 0.24 },
  { label: 'admin-service · NestJS', p: [-1.25, 0.35, 0.1], r: 0.3 },
  { label: 'Kafka / RabbitMQ', p: [0.25, -0.2, 0], r: 0.42 },
  { label: 'user · gRPC', p: [1.55, 1.45, -0.4], r: 0.22 },
  { label: 'kyc · gRPC', p: [2.35, 0.35, 0.35], r: 0.22 },
  { label: 'crypto · Web3', p: [1.8, -1.2, -0.3], r: 0.24 },
  { label: 'banking · IBAN', p: [0.45, -1.95, 0.45], r: 0.22 },
  { label: 'Redis · BullMQ', p: [-1.6, -1.35, -0.35], r: 0.24 },
  { label: 'PostgreSQL', p: [-0.4, 1.75, -0.55], r: 0.26 },
]
export const NET_EDGES = [
  [0, 1], [1, 2], [1, 7], [1, 8], [2, 3], [2, 4], [2, 5], [2, 6],
  [1, 3], [1, 4], [3, 4], [5, 6], [7, 2], [8, 3],
]

const network = (n, rand) => {
  const cloud = createCloud(n)
  const weights = NET_NODES.map((node) => node.r * node.r)
  const total = weights.reduce((a, b) => a + b, 0)
  let budget = 0
  NET_NODES.forEach((node, i) => {
    budget += (n * 0.62 * weights[i]) / total
    const isHub = i === 2
    cloud.fillTo(budget, () => {
      const [px, py, pz] = node.p
      if (isHub && rand() < 0.4) {
        const a = rand() * TAU
        const r = node.r * 2 + (rand() - 0.5) * 0.04
        cloud.add(px + Math.cos(a) * r, py + Math.sin(a) * r * 0.3, pz + Math.sin(a) * r)
        return
      }
      const z = rand() * 2 - 1
      const phi = rand() * TAU
      const s = Math.sqrt(1 - z * z)
      const r = node.r * (rand() < 0.85 ? 1 : 0.4 + rand() * 0.5)
      cloud.add(px + s * Math.cos(phi) * r, py + s * Math.sin(phi) * r, pz + z * r)
    })
  })
  cloud.fillTo(n, () => {
    const [a, b] = NET_EDGES[Math.floor(rand() * NET_EDGES.length)].map((k) => NET_NODES[k].p)
    // dotted: snap to evenly spaced beads along the link
    const t = Math.round(rand() * 24) / 24 + (rand() - 0.5) * 0.01
    cloud.add(a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t)
  })
  return cloud.arr
}

/* 6 · Contact: an open signal field (waves are added in the shader) */
const signalField = (n, rand) => {
  const cloud = createCloud(n)
  const rows = 26
  cloud.fillTo(n * 0.75, () => {
    const z = (Math.floor(rand() * rows) / (rows - 1) - 0.5) * 4.2
    cloud.add((rand() - 0.5) * 9, 0, z)
  })
  cloud.fillTo(n, () => cloud.add((rand() - 0.5) * 9, (rand() - 0.5) * 0.05, (rand() - 0.5) * 4.2))
  return cloud.arr
}

export const buildShapes = (count) => {
  const rand = mulberry32(20260)
  const targets = [monogram, eventLog, bankCard, coin, funnel, network, signalField].map((fn) => fn(count, rand))
  const random = new Float32Array(count * 4)
  for (let i = 0; i < random.length; i++) random[i] = rand()
  const scatter = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    const z = rand() * 2 - 1
    const phi = rand() * TAU
    const s = Math.sqrt(1 - z * z)
    const r = 5 + rand() * 7
    scatter.set([s * Math.cos(phi) * r, s * Math.sin(phi) * r, z * r - 2], i * 3)
  }
  return { count, targets, random, scatter }
}
