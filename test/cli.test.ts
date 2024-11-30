import { describe, it } from 'vitest'
import path from 'path'
import { spawnSync } from 'child_process'

const node = './node_modules/.bin/ts-node'
const cliBin = path.join(__dirname, '..', 'src', 'cli.ts')

// const node = 'node'
// const cliBin = path.join(__dirname, '..', 'dist', 'cli.js')

describe('test suite', () => {
  it('generally work', ({ expect }) => {
    const proc = spawnSync(node, [cliBin], {
      stdio: 'pipe',
    })
    expect(proc.stdout.toString()).toBeTypeOf('string')
    expect(proc.status).toBe(0)
  })

  it('compile some code', ({ expect }) => {
    // const { stdout } = spawnSync(
    const proc = spawnSync(
      node,
      [
        cliBin,
        path.join(__dirname, 'fixtures', 'src', 'index.ts'),
        '--config-file',
        path.join(__dirname, 'fixtures', 'src', '.swcrc'),
      ],
      { stdio: 'pipe' },
    )
    expect(proc.status).toBe(0)
    expect(proc.stderr.toString()).toMatch('')
    expect(proc.stdout.toString()).toMatch('') // success
  })

  it('debug works', ({ expect }) => {
    const codePath = path.join(__dirname, 'fixtures', 'src', 'index.ts')
    const proc = spawnSync(
      node,
      [cliBin, codePath, '--debug', '--tsconfig', 'tsconfig.json'],
      {
        stdio: 'pipe',
      },
    )
    expect(proc.status).toBe(0)
    expect(proc.stdout.toString()).toMatch(/\[debug\] swcrc:/)
  })

  it('error throws', ({ expect }) => {
    const codePath = path.join(__dirname, 'fixtures', 'src', 'index.ts')
    try {
      const proc = spawnSync(
        node,
        [cliBin, codePath, '--', '--random-args-for-error'],
        {
          stdio: 'pipe',
        },
      )
      expect(proc.status).toBe(1)
      expect(proc.stderr.toString()).toMatch(/error: unknown option/)
    } catch {}
  })
})