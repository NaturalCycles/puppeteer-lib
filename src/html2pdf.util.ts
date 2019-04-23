import { pMap } from '@naturalcycles/promise-lib'
import * as fileUrl from 'file-url'
import * as fs from 'fs-extra'
import globby from 'globby'
import { Browser } from 'puppeteer'
import * as puppeteer from 'puppeteer'
import * as yargs from 'yargs'

export async function html2pdfCommand (): Promise<void> {
  const { input, concurrency, verbose } = yargs.options({
    input: {
      type: 'string',
      array: true,
      desc: 'Path to input html file(s). Globs are supported.',
      demandOption: true,
    },
    concurrency: {
      type: 'number',
      default: 4,
    },
    verbose: {
      type: 'boolean',
      default: false,
    },
  }).argv

  const inputs = await globby(input)

  if (verbose) console.log({ input, inputs })

  // Validate that all input files exist
  inputs.forEach(inputPath => {
    if (!fs.existsSync(inputPath)) {
      throw new Error(`Input file doesn't exist: ${inputPath}`)
    }
  })

  if (!inputs.length) {
    console.log({ input, inputs })
    throw new Error(`Couldn't find any files specified in --input`)
  }

  const browser = await puppeteer.launch()

  await pMap(inputs, inputPath => html2pdfFile(browser, inputPath, verbose), {
    concurrency,
  }).finally(() => {
    return browser.close()
  })

  console.log(`DONE! Created ${input.length} PDFs`)
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
