# tswc

[![NPM version](https://img.shields.io/npm/v/tswc.svg?style=flat)](https://npmjs.org/package/tswc)
[![NPM downloads](https://img.shields.io/npm/dm/tswc.svg?style=flat)](https://npmjs.org/package/tswc)

Compile your TypeScript with tsconfig.json using [swc](https://swc.rs)

## Install

```bash
npm install tswc @swc/core @swc/cli -D
# Or Yarn
yarn add tswc @swc/core @swc/cli --dev
```

## Usage

Just change `swc [...options]` to `tswc -- [options]`. That's it! Your `tsconfig.json` file will be respected.

For example:

```bash
# Transpile one file and emit to stdout.
# swc FILE
tswc -- FILE

# Transpile one file and emit to `output.js`.
# swc FILE -o output.js
tswc -- FILE -o output.js

# Transpile and write output to dir
# swc DIR -d dir
tswc -- DIR -d dir
```

See more about how to use [swc cli](https://swc.rs/docs/usage-swc-cli).

You can change your build script in "package.json" as:

```json
"build": "tswc -- src -D dist",
```

Now you can run `npm run build` to build.

### About .swcrc

tswc will always merge your swc configuration file on top of any of the options that were inferred from your tsconfig.
By default, swc and tswc will look for a .swcrc file and tolerate if there is none found.  However, tswc will respect
any `--config-file` option that you provide to swc and will even make sure to throw an error if the file is missing.

```shell
# Example of using a .development.swcrc file to override the base config from tsconfig
tswc -- --config-file .development.swcrc
```

As a naive example, if you had a tsconfig.json file that used commonjs compilation, but also wanted to compile an esm version,
you could set up a .esm.swcrc so that:

```json
// tsconfig.json
{
  "module": "commonjs",
  "moduleResolution": "node",
  // Other options
}

// .esm.swcrc
{
  "module": {
    // This overrides the module "commonjs" of tsconfig to es6
    "type": "es6"
  }
}
```

The corresponding commands for this project might be something like:

```shell
# Creates esm syntax compiled files
tswc -- src -d dist/esm --config-file .esm.swcrc

# Creates commonjs syntax compiled files
tswc -- src -d dist/esm
```

## Notice

Only a subgroup of fields of tsconfig is supported currently. This is done with [tsconfig-to-swcconfig](https://github.com/Songkeys/tsconfig-to-swcconfig). This means that some tsc features may be missing when compiling with this.

If you want to know what swc config is exactly used, you can use `--debug` to inspect:

```bash
tswc --debug -- [other options...]
```

## Advanced Options

```
Options:
  --tsconfig <filename>  the filename of tsconfig (default: tsconfig.json)
  --debug                output the final swc config (default: false)
  -h, --help             Display this message
  -v, --version          Display version number
```
