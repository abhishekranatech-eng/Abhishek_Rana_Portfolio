import { Fragment } from 'react'
import { PROFILE, FEATURED, MORE_WORK, SKILLS, JOBS, CAREER_LOG, MARQUEE } from '../data.js'
import { CopyButton } from './Chrome.jsx'

const Label = ({ n, children }) => (
  <p className="label mono" data-fade><span className="label__n">({n})</span>{children}</p>
)

const Words = ({ text }) => text.split(' ').map((w, i) => (
  <Fragment key={i}><span className="word">{w}</span>{' '}</Fragment>
))

// Highlights arrows in the plain-text pipeline diagrams.
const Pipeline = ({ text }) => (
  <pre className="pipeline mono" aria-label="How it works" data-fade>
    {text.split(/(→|⇄)/).map((part, i) => (part === '→' || part === '⇄' ? <b key={i}>{part}</b> : part))}
  </pre>
)

export function Hero() {
  return (
    <section className="hero" id="top" data-section="0">
      <div className="hero__top">
        <p className="mono" data-fade data-delay="0.2">Backend Software Engineer<br />Node.js · NestJS · Microservices</p>
        <p className="mono hero__coords" data-fade data-delay="0.3">Mohali, Punjab, IN<br />30.70° N · 76.71° E</p>
      </div>
      <h1 className="hero__title" aria-label={PROFILE.name}>
        <span data-split>Abhishek</span>
        <span data-split data-delay="0.08" className="hero__title-2">Rana<em className="mono">/ 5+ yrs</em></span>
      </h1>
      <div className="hero__bottom">
        <p className="hero__intro" data-fade data-delay="0.35">
          I build REST APIs, event-driven microservices and real-time systems for fintech. Today that means Banking-as-a-Service and CeFi platforms at Antier Solutions, connecting traditional finance with Web3.
        </p>
        <div className="hero__cta" data-fade data-delay="0.45">
          <a className="btn btn--solid" href="#work" data-cursor="Scroll">See projects</a>
          <a className="btn" href={PROFILE.resume} download data-cursor="PDF">Resume ↓</a>
        </div>
        <a className="scroll-hint mono" href="#about" data-fade data-delay="0.6">Scroll<span aria-hidden="true" /></a>
      </div>
    </section>
  )
}

export function About() {
  return (
    <section className="about" id="about" data-section="1">
      <div className="about__col">
        <Label n="01">About</Label>
        <p className="statement" data-words>
          <Words text="I build the plumbing money moves through: event-driven microservices on Kafka and RabbitMQ, gRPC between services, queues that retry instead of losing work, and balance updates that stay correct under load." />
        </p>
        <div className="stats">
          <div data-fade><strong>5+</strong><span>years shipping Node.js in production</span></div>
          <div data-fade data-delay="0.1"><strong>7</strong><span>services wired into one admin dashboard</span></div>
          <div data-fade data-delay="0.2"><strong>3</strong><span>transports in daily use: Kafka, RabbitMQ, gRPC</span></div>
        </div>
        <div className="log mono" data-fade>
          <div className="log__head"><span>topic: career.events</span><span>partition 0</span></div>
          <ol>
            {CAREER_LOG.map(([ts, msg], i) => (
              <li key={ts}><span className="log__off">{i}</span><span className="log__ts">{ts}</span><span>{msg}</span></li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}

export function Marquee() {
  const row = MARQUEE.map((t) => <span key={t}>{t}<i aria-hidden="true">✳</i></span>)
  return (
    <div className="marquee" aria-label={MARQUEE.join(', ')}>
      <div className="marquee__track" aria-hidden="true">{row}{row}</div>
    </div>
  )
}

function Project({ project, index }) {
  return (
    <article className="project" id={project.id} data-section={project.section}>
      <div className="project__body">
        <div className="project__meta mono" data-fade>
          <span>{String(index + 1).padStart(2, '0')} / {String(FEATURED.length).padStart(2, '0')}</span>
          <span>{project.kind}</span>
          <span>{project.year}</span>
        </div>
        <h3 className="project__title" data-split>{project.title}</h3>
        <p className="project__subtitle" data-fade>{project.subtitle}</p>
        <p className="project__summary" data-fade>{project.summary}</p>
        <ul className="project__points" data-fade>
          {project.points.map((p) => <li key={p}>{p}</li>)}
        </ul>
        <Pipeline text={project.pipeline} />
        <ul className="tags" data-fade>{project.tags.map((t) => <li key={t}>{t}</li>)}</ul>
        <div className="project__links" data-fade>
          {project.links.map((l) => (
            l.download
              ? <a key={l.url} className="btn btn--solid" href={l.url} download data-cursor="Download">{l.label} ↓</a>
              : <a key={l.url} className="btn" href={l.url} target="_blank" rel="noopener" data-cursor="Visit">{l.label} ↗</a>
          ))}
          <span className="project__note mono">{project.note}</span>
        </div>
      </div>
      <span className="project__ghost" aria-hidden="true" data-parallax="-30">{String(index + 1).padStart(2, '0')}</span>
    </article>
  )
}

export function Work() {
  return (
    <section className="work" id="work">
      <header className="section-head">
        <Label n="02">Selected work</Label>
        <h2 data-split>Systems that move money, data and people.</h2>
      </header>
      {FEATURED.map((p, i) => <Project key={p.id} project={p} index={i} />)}
      <div className="more">
        <p className="label mono" data-fade><span className="label__n">(+)</span>Also built</p>
        {MORE_WORK.map((w) => (
          <article className="more__row" key={w.title} data-fade>
            <span className="more__year mono">{w.year}</span>
            <div>
              <h3>{w.title}</h3>
              <p>{w.text}</p>
            </div>
            <div className="more__side">
              <span className="mono">{w.org}</span>
              <ul className="tags">{w.tags.map((t) => <li key={t}>{t}</li>)}</ul>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

export function Stack() {
  return (
    <section className="stack" id="stack" data-section="5">
      <div className="stack__col">
        <Label n="03">Stack</Label>
        <h2 data-split>How I wire systems together.</h2>
        <p className="stack__lead" data-fade>
          The graph is the shape of the Enfineo platform: an admin service in front, gRPC services behind it, a broker carrying events between them, Redis and Postgres underneath. Watch the messages move.
        </p>
        <div className="skills">
          {SKILLS.map((s, i) => (
            <div className="skills__group" key={s.group} data-fade data-delay={(i % 2) * 0.08}>
              <h3 className="mono">{s.group}</h3>
              <ul>{s.items.map((it) => <li key={it}>{it}</li>)}</ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export function Experience() {
  return (
    <section className="experience" id="experience" data-section="6">
      <div className="experience__col">
        <Label n="04">Experience</Label>
        <h2 data-split>Five years, two companies, one log.</h2>
        <div className="jobs">
          {JOBS.map((j) => (
            <article className="job" key={j.when} data-fade>
              <p className="job__when mono">{j.when}</p>
              <div>
                <h3>{j.role}</h3>
                <p className="job__org">{j.org}</p>
                {j.points.length > 0 && <ul>{j.points.map((p) => <li key={p}>{p}</li>)}</ul>}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export function Contact() {
  return (
    <section className="contact" id="contact" data-section="7">
      <Label n="05">Contact</Label>
      <h2 className="contact__title">
        <span data-split>Let's talk about</span>
        <span data-split data-delay="0.08">your backend.</span>
      </h2>
      <p className="contact__lead" data-fade>Open to Software Engineer and Backend Developer roles, remote or in the Mohali / Chandigarh area.</p>
      <a className="contact__email" href={`mailto:${PROFILE.email}`} data-cursor="Write" data-fade>{PROFILE.email}</a>
      <div className="contact__rows" data-fade>
        <div className="contact__row"><span className="mono">Email</span><span>{PROFILE.email}</span><CopyButton value={PROFILE.email} label="email" /></div>
        <div className="contact__row"><span className="mono">Phone</span><span>{PROFILE.phone}</span><CopyButton value={PROFILE.phone} label="phone number" /></div>
        <div className="contact__row"><span className="mono">LinkedIn</span><a href={PROFILE.linkedin} target="_blank" rel="noopener">abhishek-rana-a8ba73203 ↗</a></div>
        <div className="contact__row"><span className="mono">Resume</span><a href={PROFILE.resume} download>Abhishek_Rana_Resume.pdf ↓</a></div>
      </div>
      <footer className="footer mono">
        <span>© {new Date().getFullYear()} Abhishek Rana</span>
        <span>Built with React, Three.js & GSAP. Every model is generated in code.</span>
        <a href="#top">Back to top ↑</a>
      </footer>
    </section>
  )
}
