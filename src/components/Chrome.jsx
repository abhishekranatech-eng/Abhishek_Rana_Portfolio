import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { sceneState } from '../state.js'
import { prefersReducedMotion } from '../motion.js'

// Fixed UI around the page: loader, cursor, header, section index and scroll progress.

export function Loader({ ready, onEnter }) {
  const root = useRef()
  const count = useRef()
  const gate = useRef({ minTime: false, ready: false, leaving: false })

  useLayoutEffect(() => {
    document.documentElement.classList.add('is-loading')
    const counter = { v: 0 }
    const render = () => { count.current.textContent = String(Math.round(counter.v)).padStart(3, '0') }

    const leave = () => {
      const g = gate.current
      if (!g.minTime || !g.ready || g.leaving) return
      g.leaving = true
      const reduce = prefersReducedMotion()
      gsap.timeline({ onComplete: () => { root.current.style.display = 'none' } })
        .to(counter, { v: 100, duration: 0.35, ease: 'power1.out', onUpdate: render })
        .to('.loader__line', { scaleX: 1, duration: 0.35, ease: 'power1.out' }, '<')
        .to('.loader__inner > *', { yPercent: -120, duration: 0.7, ease: 'expo.in', stagger: 0.04 })
        .add(() => {
          document.documentElement.classList.remove('is-loading')
          gsap.to(sceneState, { intro: 1, duration: reduce ? 0.01 : 2.6, ease: 'expo.out' })
          onEnter()
        })
        .to(root.current, { clipPath: 'inset(0% 0% 100% 0%)', duration: 1.1, ease: 'expo.inOut' }, '<')
    }
    gate.current.leave = leave

    const intro = gsap.to(counter, {
      v: 86,
      duration: 1.6,
      ease: 'power2.inOut',
      onUpdate: () => {
        render()
        gsap.set('.loader__line', { scaleX: counter.v / 100 })
      },
      onComplete: () => { gate.current.minTime = true; leave() },
    })
    // Never trap the visitor behind the loader if WebGL fails to start.
    const fallback = setTimeout(() => { gate.current.ready = true; leave() }, 7000)
    return () => { intro.kill(); clearTimeout(fallback) }
  }, [onEnter])

  useEffect(() => {
    if (!ready) return
    gate.current.ready = true
    gate.current.leave?.()
  }, [ready])

  return (
    <div className="loader" ref={root} aria-hidden="true">
      <div className="loader__inner">
        <span className="loader__name">Abhishek Rana<sup>©</sup></span>
        <span className="loader__note mono">Building models from the work itself…</span>
      </div>
      <div className="loader__inner loader__bottom">
        <span className="loader__count" ref={count}>000</span>
      </div>
      <span className="loader__line" />
    </div>
  )
}

export function Cursor() {
  const dot = useRef()
  const ring = useRef()
  const label = useRef()

  useEffect(() => {
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches
    const dx = fine && gsap.quickTo(dot.current, 'x', { duration: 0.08 })
    const dy = fine && gsap.quickTo(dot.current, 'y', { duration: 0.08 })
    const rx = fine && gsap.quickTo(ring.current, 'x', { duration: 0.45, ease: 'power3.out' })
    const ry = fine && gsap.quickTo(ring.current, 'y', { duration: 0.45, ease: 'power3.out' })

    const onMove = (e) => {
      sceneState.pointer.x = (e.clientX / window.innerWidth) * 2 - 1
      sceneState.pointer.y = -((e.clientY / window.innerHeight) * 2 - 1)
      if (!fine) return
      dx(e.clientX); dy(e.clientY); rx(e.clientX); ry(e.clientY)
    }
    const onOver = (e) => {
      if (!fine) return
      const target = e.target.closest('a, button, [data-cursor]')
      ring.current.classList.toggle('is-hover', Boolean(target))
      label.current.textContent = target?.dataset.cursor || ''
      ring.current.classList.toggle('has-label', Boolean(target?.dataset.cursor))
    }
    const onLeave = () => { sceneState.pointer.x = 0; sceneState.pointer.y = 0 }

    window.addEventListener('pointermove', onMove, { passive: true })
    document.addEventListener('pointerover', onOver)
    document.documentElement.addEventListener('pointerleave', onLeave)
    if (fine) document.documentElement.classList.add('has-cursor')
    return () => {
      window.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerover', onOver)
      document.documentElement.removeEventListener('pointerleave', onLeave)
    }
  }, [])

  return (
    <>
      <div className="cursor-dot" ref={dot} aria-hidden="true" />
      <div className="cursor-ring" ref={ring} aria-hidden="true"><span ref={label} /></div>
    </>
  )
}

const clockFormat = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata' })

export function Header() {
  const [time, setTime] = useState(() => clockFormat.format(new Date()))
  useEffect(() => {
    const id = setInterval(() => setTime(clockFormat.format(new Date())), 15000)
    return () => clearInterval(id)
  }, [])

  return (
    <header className="header">
      <a href="#top" className="header__logo" data-cursor="Top">AR<sup>©</sup></a>
      <nav className="header__nav" aria-label="Sections">
        <a href="#work">Work</a>
        <a href="#stack">Stack</a>
        <a href="#experience">Experience</a>
        <a href="#contact">Contact</a>
      </nav>
      <div className="header__meta mono">
        <span className="status-dot" aria-hidden="true" />
        <span className="header__avail">Open to roles</span>
        <span className="header__time">Mohali {time} IST</span>
      </div>
    </header>
  )
}

export function ScrollProgress() {
  return <div className="progress" aria-hidden="true"><span className="progress__bar" /></div>
}

export function CopyButton({ value, label }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard?.writeText(value).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }
  return (
    <button type="button" className="copy mono" onClick={copy} data-cursor="Copy" aria-label={`Copy ${label}`}>
      {copied ? 'Copied ✓' : 'Copy'}
    </button>
  )
}
