// Mutable state shared between the DOM (scroll, pointer) and the WebGL scene.
// Read every frame inside useFrame, so it lives outside React state on purpose.
export const sceneState = {
  active: 0,
  time: 0,
  intro: 0,
  velocity: 0,
  pointer: { x: 0, y: 0 },
  weights: [1, 0, 0, 0, 0, 0, 0],
}

// One entry per [data-section] element, in page order.
// shape: which particle model to form. x: horizontal offset as a fraction of half the viewport width. s: extra scale.
export const SECTIONS = [
  { name: 'Intro', shape: 0, x: 0.5, y: 0.35, s: 0.72 },
  { name: 'About', shape: 1, x: -0.5, y: 0 },
  { name: 'Enfineo', shape: 2, x: 0.5, y: 0 },
  { name: 'Lendary', shape: 3, x: 0.5, y: 0 },
  { name: 'Finder', shape: 4, x: 0.5, y: 0 },
  { name: 'Stack', shape: 5, x: 0.44, y: 0 },
  { name: 'Experience', shape: 1, x: 0.52, y: 0 },
  { name: 'Contact', shape: 6, x: 0, y: -1.1 },
]

// Two-stop color per shape: [core, edge].
export const PALETTE = [
  ['#f6efe4', '#ff7a2f'],
  ['#8af4ff', '#3d6bff'],
  ['#d4c4ff', '#6b55ff'],
  ['#ffe7a3', '#ff9a1f'],
  ['#a6e8ff', '#c6ff3d'],
  ['#c2ffe0', '#22e3a0'],
  ['#ffc09a', '#ff4f2e'],
]

export const FONTS = {
  display: 'Syne, "Arial Black", sans-serif',
  mono: '"JetBrains Mono", ui-monospace, monospace',
}
