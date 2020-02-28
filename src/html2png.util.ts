import { pMap } from '@naturalcycles/js-lib'
import * as fileUrl from 'file-url'
import * as fs from 'fs-extra'
import * as globby from 'globby'
import { Browser } from 'puppeteer'
import * as puppeteer from 'puppeteer'
import * as yargs from 'yargs'

const FORMAT_MAP = {
  jpeg: 'jpg', // because `.jpeg` is ugly
} as const

export async function html2pngCommand(): Promise<void> {
  const { _: inputPatterns, wh, concurrency, format, quality, fullPage, verbose } = yargs.options({
    concurrency: {
      type: 'number',
      default: 8,
    },
    outDir: {
      type: 'string',
      desc: 'Output directory (required for url inputs)',
    },
    wh: {
      type: 'string',
      desc: 'Width/height of viewport, specified as e.g `800x600`',
      default: '800x600',
    },
    format: {
      type: 'string',
      desc: 'Image format: png of jpeg',
      default: 'png',
    },
    quality: {
      type: 'number',
      desc: 'Image quality, only applies to JPEG',
    },
    fullPage: {
      type: 'boolean',
      default: true,
    },
    verbose: {
      type: 'boolean',
      default: false,
    },
  }).argv

  const [width, height] = wh.split('x').map(Number)

  const inputs = await globby(inputPatterns)

  if (verbose) console.log({ inputPatterns, inputs })

  // Validate that all input files exist
  inputs.forEach(inputPath => {
    if (!fs.existsSync(inputPath)) {
      throw new Error(`Input file doesn't exist: ${inputPath}`)
    }
  })

  if (!inputs.length) {
    console.log({ inputPatterns, inputs })
    throw new Error(`Couldn't find any files, please check your input arguments`)
  }

  const browser = await puppeteer.launch({ args: ['--no-sandbox'] })

  await pMap(
    inputs,
    inputPath =>
      html2pngFile(
        browser,
        inputPath,
        width,
        height,
        format as 'png' | 'jpeg',
        quality,
        fullPage,
        verbose,
      ),
    {
      concurrency,
    },
  ).finally(() => {
    return browser.close()
  })

  console.log(`DONE! Created ${inputs.length} images`)
}

async function html2pngFile(
  browser: Browser,
  inputPath: string,
  width = 800,
  height = 600,
  format: 'png' | 'jpeg' = 'png',
  quality?: number,
  fullPage = true,
  verbose = false,
): Promise<void> {
  const d = Date.now()
  // const outPath = path.join(outDir, path.basename(inputPath) + '.pdf')
  const outPath = `${inputPath}.${FORMAT_MAP[format] || format}`
  // console.log({outPath})

  const page = await browser.newPage()

  await page.setViewport({
    width,
    height,
  })

  const url = fileUrl(inputPath)
  if (verbose) console.log(`Opening ${url}...`)

  await page.goto(url)
  if (verbose) console.log(`Opened ${url}`)

  await page.screenshot({
    path: outPath,
    type: format,
    quality,
    fullPage,
  })

  await page.close()

  console.log(`${inputPath} done in ${Date.now() - d} ms`)
}
