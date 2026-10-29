import { useEffect, useLayoutEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import Lenis from 'lenis'
import { sceneState } from './state.js'

gsap.registerPlugin(ScrollTrigger, SplitText)

let lenis = null

export const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

export const scrollToTarget = (target) => {
  const el = typeof target === 'string' ? document.querySelector(target) : target
  if (!el) return
  if (lenis) lenis.scrollTo(el, { duration: 1.6 })
  else el.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth' })
}

export function useSmoothScroll(enabled) {
  useEffect(() => {
    if (!enabled) return undefined

    const onClick = (e) => {
      const link = e.target.closest('a[href^="#"]')
      if (!link) return
      e.preventDefault()
      scrollToTarget(link.getAttribute('href'))
    }
    document.addEventListener('click', onClick)

    if (prefersReducedMotion()) return () => document.removeEventListener('click', onClick)

    lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 0.9 })
    lenis.on('scroll', (e) => {
      sceneState.velocity = e.velocity
      ScrollTrigger.update()
    })
    const tick = (time) => lenis.raf(time * 1000)
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)

    return () => {
      document.removeEventListener('click', onClick)
      gsap.ticker.remove(tick)
      lenis.destroy()
      lenis = null
    }
  }, [enabled])
}

// Wires every scroll-driven effect on the page once the loader has gone.
export function useScrollAnimations(enabled, onSectionChange) {
  useLayoutEffect(() => {
    if (!enabled) return undefined

    const mm = gsap.matchMedia()
    const ctx = gsap.context(() => {
      document.querySelectorAll('[data-section]').forEach((el) => {
        const index = Number(el.dataset.section)
        ScrollTrigger.create({
          trigger: el,
          start: 'top 55%',
          end: 'bottom 55%',
          onToggle: (self) => {
            if (!self.isActive) return
            sceneState.active = index
            onSectionChange(index)
          },
        })
      })

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        document.querySelectorAll('[data-split]').forEach((el) => {
          const split = SplitText.create(el, { type: 'lines', mask: 'lines', linesClass: 'split-line' })
          gsap.from(split.lines, {
            yPercent: 110,
            duration: 1.25,
            ease: 'expo.out',
            stagger: 0.08,
            delay: Number(el.dataset.delay || 0),
            scrollTrigger: { trigger: el, start: 'top 90%' },
          })
        })

        gsap.utils.toArray('[data-fade]').forEach((el) => {
          gsap.from(el, {
            y: 36,
            autoAlpha: 0,
            duration: 1.1,
            ease: 'power3.out',
            delay: Number(el.dataset.delay || 0),
            scrollTrigger: { trigger: el, start: 'top 92%' },
          })
        })

        document.querySelectorAll('[data-words]').forEach((el) => {
          gsap.fromTo(el.querySelectorAll('.word'), { opacity: 0.14 }, {
            opacity: 1,
            ease: 'none',
            stagger: 0.05,
            scrollTrigger: { trigger: el, start: 'top 80%', end: 'bottom 45%', scrub: true },
          })
        })

        gsap.utils.toArray('[data-parallax]').forEach((el) => {
          gsap.to(el, {
            yPercent: Number(el.dataset.parallax),
            ease: 'none',
            scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true },
          })
        })

        gsap.to('.progress__bar', {
          scaleY: 1,
          ease: 'none',
          scrollTrigger: { start: 0, end: 'max', scrub: true },
        })
      })
    })

    ScrollTrigger.refresh()
    return () => {
      mm.revert()
      ctx.revert()
    }
  }, [enabled, onSectionChange])
}
