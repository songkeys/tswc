import { test } from 'tap'
import path from 'path'
import { spawnSync } from 'child_process'

const node = './node_modules/.bin/ts-node'
const cliBin = path.join(__dirname, '..', 'src', 'cli.ts')

// const node = 'node'
// const cliBin = path.join(__dirname, '..', 'dist', 'cli.js')

test('generally work', (t) => {
  const { stdout } = spawnSync(node, [cliBin], {
    stdio: 'pipe',
  })
  t.type(stdout.toString(), 'string')
  t.end()
})

test('compile some code', (t) => {
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
  t.match(stdout.toString(), /Successfully compiled 1 file with swc/)
  t.end()
})

test('debug works', (t) => {
  const codePath = path.join(__dirname, 'fixtures', 'src', 'index.ts')
  const { stdout } = spawnSync(
    node,
    [cliBin, codePath, '--debug', '--tsconfig', 'tsconfig.json'],
    {
      stdio: 'pipe',
    },
  )
  t.match(stdout.toString(), /\[debug\] swcrc:/)
  t.end()
})

test('error throws', (t) => {
  const codePath = path.join(__dirname, 'fixtures', 'src', 'index.ts')
  try {
    const { stderr } = spawnSync(
      node,
      [cliBin, codePath, '--', '--random-args-for-error'],
      {
        stdio: 'pipe',
      },
    )
    t.match(stderr.toString(), /error: unknown option/)
    t.end()
  } catch {}
})
