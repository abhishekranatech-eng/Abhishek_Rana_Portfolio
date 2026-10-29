import { lazy, Suspense, useCallback, useEffect, useState } from 'react'
import { useSmoothScroll, useScrollAnimations } from './motion.js'
import { FONTS } from './state.js'
import { Loader, Cursor, Header, ScrollProgress } from './components/Chrome.jsx'
import { Hero, About, Marquee, Work, Stack, Experience, Contact } from './components/Sections.jsx'

const Stage = lazy(() => import('./three/Stage.jsx'))

// The particle models sample glyphs from canvas, so fonts must be ready first.
const waitForFonts = () => Promise.race([
  Promise.all([
    document.fonts.load(`800 100px ${FONTS.display}`),
    document.fonts.load(`500 40px ${FONTS.mono}`),
    document.fonts.load(`600 40px ${FONTS.mono}`),
  ]),
  new Promise((resolve) => setTimeout(resolve, 3000)),
])

export default function App() {
  const [fontsReady, setFontsReady] = useState(false)
  const [sceneReady, setSceneReady] = useState(false)
  const [entered, setEntered] = useState(false)

  useEffect(() => {
    waitForFonts().finally(() => setFontsReady(true))
  }, [])

  const onSceneReady = useCallback(() => setSceneReady(true), [])
  const onEnter = useCallback(() => setEntered(true), [])

  useSmoothScroll(entered)
  useScrollAnimations(entered)

  return (
    <>
      <div className="stage" aria-hidden="true">
        {fontsReady && (
          <Suspense fallback={null}>
            <Stage onReady={onSceneReady} />
          </Suspense>
        )}
      </div>
      <Loader ready={sceneReady} onEnter={onEnter} />
      <Cursor />
      <Header />
      <ScrollProgress />
      <main className={entered ? 'is-entered' : ''}>
        <Hero />
        <About />
        <Marquee />
        <Work />
        <Stack />
        <Experience />
        <Contact />
      </main>
    </>
  )
}
