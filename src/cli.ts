#!/usr/bin/env node
import path from 'node:path'
import fs from 'node:fs'
import { cac } from 'cac'
import { convert } from 'tsconfig-to-swcconfig'
import { spawnSync } from 'node:child_process'
import { parse } from 'jsonc-parser'

const cli = cac('tswc')

cli
  .command('[file]', 'file or directory to build')
  .allowUnknownOptions()
  .option('--tsconfig <filename>', 'the filename of tsconfig', {
    default: 'tsconfig.json',
  })
  .option('--debug', 'output the final swc config', { default: false })
  .action((file = '', { tsconfig, debug, configFile = '.swcrc', ...args }) => {
    // read .swcrc
    const oSwcrcPath = path.resolve(process.cwd(), configFile)
    let oSwcOptions = fs.existsSync(oSwcrcPath)
      ? parse(fs.readFileSync(oSwcrcPath, 'utf8'))
      : {}

    const SWCRC_FILENAME =
      '.swcrc_from_tsconfig' + Math.random().toString().slice(8) // add some randomness to avoid collisions
    const SWCRC_PATH = path.resolve(process.cwd(), SWCRC_FILENAME)
    try {
      // convert tsconfig.json to swcrc
      const swcrc = convert(tsconfig, process.cwd(), oSwcOptions)
      if (debug) {
        console.log('[debug] swcrc:')
        console.log(JSON.stringify(swcrc, null, 2))
      }
      fs.writeFileSync(SWCRC_PATH, JSON.stringify(swcrc, null, 2))

      // compile
      const swcBin = require.resolve('.bin/swc')
      const swcArgs = [file, ...args['--'], '--config-file', SWCRC_PATH]
      if (debug) {
        console.log(`> swc ${swcArgs.join(' ')}`)
      }
      spawnSync(swcBin, swcArgs, {
        stdio: 'inherit',
        cwd: process.cwd(),
        env: process.env,
      })
    } catch (e) {
      /* istanbul ignore next */
      console.error(e)
    } finally {
      fs.unlinkSync(SWCRC_PATH)
    }
  })

cli.help()

const pkgPath = path.join(__dirname, '..', 'package.json')
cli.version(JSON.parse(fs.readFileSync(pkgPath, 'utf8')).version)

cli.parse()
