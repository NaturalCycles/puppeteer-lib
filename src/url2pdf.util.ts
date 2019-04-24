import { pMap } from '@naturalcycles/promise-lib'
import * as fs from 'fs-extra'
import * as path from 'path'
import { Browser, PDFFormat } from 'puppeteer'
import * as puppeteer from 'puppeteer'
import * as yargs from 'yargs'

export async function url2pdfCommand (): Promise<void> {
  const { _: urls, outDir, concurrency, scale, format, landscape, verbose } = yargs.options({
    concurrency: {
      type: 'number',
      default: 8,
    },
    outDir: {
      type: 'string',
      desc: 'Output directory (default to current working directory)',
      default: process.cwd(),
    },
    scale: {
      type: 'number',
      default: 1,
    },
    format: {
      type: 'string',
      default: 'A4',
    },
    landscape: {
      type: 'boolean',
      default: false,
    },
    verbose: {
      type: 'boolean',
      default: false,
    },
  }).argv

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
      url2pdf(browser, outDir, url, i + 1, scale, format as PDFFormat, landscape, verbose),
    {
      concurrency,
    },
  ).finally(() => {
    return browser.close()
  })

  console.log(`DONE! Created ${urls.length} PDFs`)
}

async function url2pdf (
  browser: Browser,
  outDir: string,
  url: string,
  index: number,
  scale = 1,
  format: PDFFormat = 'A4',
  landscape = false,
  verbose = false,
): Promise<void> {
  const d = Date.now()
  // const outPath = path.join(outDir, path.basename(inputPath) + '.pdf')
  const outPath = path.join(outDir, `${index}.pdf`)
  // console.log({outPath})

  const page = await browser.newPage()
  if (verbose) console.log(`Opening ${url}...`)

  await page.goto(url)
  if (verbose) console.log(`Opened ${url}`)

  await page.pdf({
    path: outPath,
    format,
    landscape,
    printBackground: true,
    scale,
    margin: {
      top: '8mm',
      bottom: '8mm',
      right: '8mm',
      left: '8mm',
    },
  })

  await page.close()

  console.log(`${url} done in ${Date.now() - d} ms`)
}
