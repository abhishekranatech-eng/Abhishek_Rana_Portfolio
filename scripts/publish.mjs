// GitHub Pages serves this repo's root, so copy the fresh build there and drop stale hashed assets.
import { cpSync, rmSync } from 'node:fs'

rmSync('assets', { recursive: true, force: true })
cpSync('dist', '.', { recursive: true })
rmSync('dist', { recursive: true, force: true })
console.log('Published dist/ to the repo root.')
