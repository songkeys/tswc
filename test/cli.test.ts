import { describe, it } from 'vitest'
import path from 'path'
import { spawnSync } from 'child_process'

const node = './node_modules/.bin/ts-node'
const cliBin = path.join(__dirname, '..', 'src', 'cli.ts')

// const node = 'node'
// const cliBin = path.join(__dirname, '..', 'dist', 'cli.js')

describe('test suite', () => {
  it('generally work', ({ expect }) => {
    const { stdout } = spawnSync(node, [cliBin], {
      stdio: 'pipe',
    })
    expect(stdout.toString()).toBeTypeOf('string')
  })

  it('compile some code', ({ expect }) => {
    const { stdout } = spawnSync(
      node,
      [
        cliBin,
        path.join(__dirname, 'fixtures', 'src', 'index.ts'),
        '--config-file',
        path.join(__dirname, 'test', 'fixtures', 'src', '.swcrc'),
      ],
      { stdio: 'pipe' },
    )
    expect(stdout.toString()).toMatch('') // success
  })

  it('debug works', ({ expect }) => {
    const codePath = path.join(__dirname, 'fixtures', 'src', 'index.ts')
    const { stdout } = spawnSync(
      node,
      [cliBin, codePath, '--debug', '--tsconfig', 'tsconfig.json'],
      {
        stdio: 'pipe',
      },
    )
    expect(stdout.toString()).toMatch(/\[debug\] swcrc:/)
  })

  it('error throws', ({ expect }) => {
    const codePath = path.join(__dirname, 'fixtures', 'src', 'index.ts')
    try {
      const { stderr } = spawnSync(
        node,
        [cliBin, codePath, '--', '--random-args-for-error'],
        {
          stdio: 'pipe',
        },
      )
      expect(stderr.toString()).toMatch(/error: unknown option/)
    } catch {}
  })
})
