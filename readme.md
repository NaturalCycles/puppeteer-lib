## @naturalcycles/puppeteer-lib

> CLI to quickly produce PDFs from HTML files using Puppeteer

[![npm](https://img.shields.io/npm/v/@naturalcycles/puppeteer-lib/latest.svg)](https://www.npmjs.com/package/@naturalcycles/puppeteer-lib)
[![](https://circleci.com/gh/NaturalCycles/puppeteer-lib.svg?style=shield&circle-token=123)](https://circleci.com/gh/NaturalCycles/puppeteer-lib)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)

# Install

    yarn add @naturalcycles/puppeteer-lib

OR

    npm i @naturalcycles/puppeteer-lib

# Features

- `yarn html2pdf`
- `yarn html2png`

# html2pdf

    yarn html2pdf index.html

Will produce `index.html.pdf` file next to the original file.

Positional arguments:

- List of paths to process. Multiple files are supported. Globs are supported (see examples below).

Options:

Run `yarn html2pdf help` to see all available options.

- `--verbose` Print more logs.
- `--concurrency` Concurrency for opened Puppeteer pages. Default to 8. Tune if something is not
  working.
- `--scale` Print scale, e.g `0.5`. Default: `1`.
- `--format`. Default: `A4`. Google which PDF formats Puppeteer supports.
- `--landscape`. Default: `false`.

Example, convert many matching files:

    yarn html2pdf index1.html index2.html

Example, convert all matching files:

    yarn html2pdf './someFolder/**/*.html'

# html2png

    yarn html2pdf index.html

Will produce `index.html.png` file next to the original file.

Positional arguments:

- List of paths to process. Multiple files are supported. Globs are supported (see examples below).

Options:

Run `yarn html2png help` to see all available options.

- `--verbose` Print more logs.
- `--concurrency` Concurrency for opened Puppeteer pages. Default to 8. Tune if something is not
  working.
- `--format`. Default: `png`. `jpeg` is also supported.
  - `--quality` `0-100`, only for `jpeg`
- `--wh` (Width/Height). Default: `800x600`. String, width/height separated by `x` character.
- `--fullpage`

Example, convert many matching files:

    yarn html2pdf index1.html index2.html

Example, convert all matching files:

    yarn html2pdf './someFolder/**/*.html'
