import { pMap } from '@naturalcycles/promise-lib'
import * as fileUrl from 'file-url'
import * as fs from 'fs-extra'
import globby from 'globby'
import { Browser, PDFFormat } from 'puppeteer'
import * as puppeteer from 'puppeteer'
import * as yargs from 'yargs'

export async function html2pdfCommand (): Promise<void> {
  const { _: inputPatterns, concurrency, scale, format, landscape, verbose } = yargs.options({
    concurrency: {
      type: 'number',
      default: 8,
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
    inputPath => html2pdfFile(browser, inputPath, scale, format as PDFFormat, landscape, verbose),
    {
      concurrency,
    },
  ).finally(() => {
    return browser.close()
  })

  console.log(`DONE! Created ${inputs.length} PDFs`)
}

async function html2pdfFile (
  browser: Browser,
  inputPath: string,
  scale = 1,
  format: PDFFormat = 'A4',
  landscape = false,
  verbose = false,
): Promise<void> {
  const d = Date.now()
  // const outPath = path.join(outDir, path.basename(inputPath) + '.pdf')
  const outPath = inputPath + '.pdf'
  // console.log({outPath})

  const page = await browser.newPage()
  const url = fileUrl(inputPath)
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

  console.log(`${inputPath} done in ${Date.now() - d} ms`)
}
