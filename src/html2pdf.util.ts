import { pMap } from '@naturalcycles/promise-lib'
import * as fileUrl from 'file-url'
import * as fs from 'fs-extra'
import globby from 'globby'
import { Browser } from 'puppeteer'
import * as puppeteer from 'puppeteer'
import * as yargs from 'yargs'

export async function html2pdfCommand (): Promise<void> {
  const { _: inputPatterns, concurrency, verbose } = yargs.options({
    concurrency: {
      type: 'number',
      default: 4,
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

  await pMap(inputs, inputPath => html2pdfFile(browser, inputPath, verbose), {
    concurrency,
  }).finally(() => {
    return browser.close()
  })

  console.log(`DONE! Created ${inputs.length} PDFs`)
}

async function html2pdfFile (browser: Browser, inputPath: string, verbose = false): Promise<void> {
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
    format: 'A4',
  })

  console.log(`${inputPath} done`)
}
