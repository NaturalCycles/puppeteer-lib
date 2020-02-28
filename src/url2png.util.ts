import { pMap } from '@naturalcycles/js-lib'
import * as fs from 'fs-extra'
import * as path from 'path'
import { Browser } from 'puppeteer'
import * as puppeteer from 'puppeteer'
import * as yargs from 'yargs'

const FORMAT_MAP = {
  jpeg: 'jpg', // because `.jpeg` is ugly
} as const

export async function url2pngCommand(): Promise<void> {
  const { _: urls, outDir, wh, concurrency, format, quality, fullPage, verbose } = yargs.options({
    concurrency: {
      type: 'number',
      default: 8,
    },
    outDir: {
      type: 'string',
      desc: 'Output directory (default to current working directory)',
      default: process.cwd(),
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

  await fs.ensureDir(outDir)

  if (verbose) console.log({ urls })

  if (!urls.length) {
    console.log({ urls })
    throw new Error(`Please provide some urls in input arguments`)
  }

  const browser = await puppeteer.launch({ args: ['--no-sandbox'] })

  await pMap(
    urls,
    (url, i) =>
      url2png(
        browser,
        outDir,
        url,
        i + 1,
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

  console.log(`DONE! Created ${urls.length} screenshots`)
}

async function url2png(
  browser: Browser,
  outDir: string,
  url: string,
  index: number,
  width = 800,
  height = 600,
  format: 'png' | 'jpeg' = 'png',
  quality?: number,
  fullPage = true,
  verbose = false,
): Promise<void> {
  const d = Date.now()
  const outPath = path.join(outDir, `${index}.${FORMAT_MAP[format] || format}`)
  // console.log({outPath})

  const page = await browser.newPage()

  await page.setViewport({
    width,
    height,
  })

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

  console.log(`${url} done in ${Date.now() - d} ms`)
}
