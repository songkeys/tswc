#!/usr/bin/env node
import path from 'node:path'
import fs from 'node:fs'
import { cac } from 'cac'
import { convert } from 'tsconfig-to-swcconfig'
import { spawnSync } from 'node:child_process'
import { parse } from 'jsonc-parser'

const cli = cac('tswc')

// These are swc cli arguments that we are also tapping in the wrapper
const expectedSwcCli = cac('swc')
expectedSwcCli.option(
  '--config-file <configFile>',
  'swc config file - override tsconfig',
)

cli
  .command('[file]', 'file or directory to build')
  .option('--tsconfig <filename>', 'the filename of tsconfig', {
    default: 'tsconfig.json',
  })
  .option('--debug', 'output the final swc config', { default: false })
  .option(
    '-- <swc cli args>',
    'the remaining swc arguments like you would normally call',
  )
  .action((file = '', options: any) => {
    const { tsconfig, debug } = options
    const _swcArgs = options['--']
    // parse shared swc args here
    const swcParsedArgs = expectedSwcCli.parse(_swcArgs) as {
      options: {
        configFile?: string
      }
    }
    const { configFile } = swcParsedArgs.options

    let oSwcrcPath: string
    if (configFile) {
      oSwcrcPath = path.resolve(process.cwd(), configFile)
      if (!fs.existsSync(oSwcrcPath)) {
        throw new Error(
          `Invalid option: --config-file. Could not find file: ${oSwcrcPath}`,
        )
      }
    } else {
      oSwcrcPath = path.resolve(process.cwd(), '.swcrc')
    }
    // read .swcrc
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
      const cleanedSwcArgs = removeDuplicateConfigFileFromArgs(_swcArgs, configFile)
      const swcArgs = [file, ...cleanedSwcArgs, '--config-file', SWCRC_PATH]
      if (debug) {
        console.log(`> swc ${swcArgs.join(' ')}`)
      }
      spawnSync(swcBin, swcArgs, {
        stdio: 'inherit',
        cwd: process.cwd(),
        env: process.env,
        // Windows does not do spawn well without shell explicitly set
        shell: process.platform === "win32" ? true : undefined,
      })
    } catch (e) {
      /* istanbul ignore next */
      console.error(e)
    } finally {
      fs.unlinkSync(SWCRC_PATH)
    }
  })

  /**
   * Removes the --config-file option and its value from an array of raw swc args
   * @param swcArgs 
   * @param configFileArg - the --config-file value argument that you parsed already
   * @returns 
   */
function removeDuplicateConfigFileFromArgs(swcArgs: string[], configFileArg?: string) {
  let lastArgWasConfigFile = false
  return configFileArg ? swcArgs.reduce((cleanArgs: string[], arg: string) => {
    if (arg === '--config-file') {
      lastArgWasConfigFile = true
    } else if (lastArgWasConfigFile && arg === configFileArg) {
      // We don't push anything here because the second arg is also skipped
    } else {
      cleanArgs.push(arg)
    }
    return cleanArgs
  }, [] as string[]) : swcArgs
}

cli.help()

const pkgPath = path.join(__dirname, '..', 'package.json')
cli.version(JSON.parse(fs.readFileSync(pkgPath, 'utf8')).version)

cli.parse()
