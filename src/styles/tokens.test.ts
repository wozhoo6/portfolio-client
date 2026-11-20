import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const css = readFileSync(join(process.cwd(), 'src/app/globals.css'), 'utf8')

const palette: Record<string, string> = {
  bg: '#0B0F1A',
  surface: '#111827',
  card: '#1A1F2E',
  primary: '#8B5CF6',
  link: '#A78BFA',
  tech: '#60A5FA',
  text: '#E5E7EB',
  muted: '#9CA3AF',
}

describe('design tokens in globals.css', () => {
  for (const [name, hex] of Object.entries(palette)) {
    it(`defines --color-${name} as ${hex}`, () => {
      const pair = new RegExp(`--color-${name}:\\s*${hex}\\s*;`, 'i')
      expect(css).toMatch(pair)
    })
  }
})
