# tswc

[![NPM version](https://img.shields.io/npm/v/tswc.svg?style=flat)](https://npmjs.org/package/tswc)
[![NPM downloads](https://img.shields.io/npm/dm/tswc.svg?style=flat)](https://npmjs.org/package/tswc)

Compile your TypeScript with tsconfig.json using [swc](https://swc.rs)

## Install

```bash
npm install tswc @swc/core -D
# Or Yarn
yarn add tsup @swc/core --dev
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

## Advanced Options

```
Options:
  --tsconfig <filename>  the filename of tsconfig (default: tsconfig.json)
  --debug                output the final swc config (default: false)
  -h, --help             Display this message
  -v, --version          Display version number
```
