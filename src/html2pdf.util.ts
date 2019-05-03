import { pMap } from '@naturalcycles/promise-lib'
import * as fileUrl from 'file-url'
import * as fs from 'fs-extra'
import globby from 'globby'
import { Browser, PDFFormat } from 'puppeteer'
import * as puppeteer from 'puppeteer'
import * as yargs from 'yargs'
import { footerTextTmpl } from './tmpl/footerTextTmpl'
import { headerTextTmpl } from './tmpl/headerTextTmpl'

export async function html2pdfCommand (): Promise<void> {
  const { argv } = yargs.options({
    scale: {
      type: 'number',
      desc: 'Document scale',
      default: 1,
    },
    format: {
      type: 'string',
      desc: 'Paper format (A4, A3, Letter, etc)',
      default: 'A4',
    },
    landscape: {
      type: 'boolean',
      default: false,
    },
    margins: {
      type: 'string',
      desc: 'Top/right/bottom/left margins (as in css) separated by space',
      default: '8mm 8mm 8mm 8mm',
    },
    headerTemplate: {
      type: 'string',
      desc: 'HTML to render in the page header',
    },
    footerTemplate: {
      type: 'string',
      desc: 'HTML to render in the page footer',
    },
    headerTemplateFile: {
      type: 'string',
      desc: 'File to load HTML to render in the page header',
    },
    footerTemplateFile: {
      type: 'string',
      desc: 'File to load HTML to render in the page footer',
    },
    headerText: {
      type: 'string',
      desc: 'Text to render in the page header',
    },
    footerText: {
      type: 'string',
      desc: 'Text to render in the page footer',
    },
    headerTextFile: {
      type: 'string',
      desc: 'File to load TEXT to render in the page header (will be rendered as <pre>)',
    },
    footerTextFile: {
      type: 'string',
      desc: 'File to load TEXT to render in the page footer (will be rendered as <pre>)',
    },
    concurrency: {
      type: 'number',
      desc: 'Concurrency',
      default: 8,
    },
    verbose: {
      type: 'boolean',
      default: false,
    },
    debug: {
      type: 'boolean',
      default: false,
    },
  })

  let {
    _: inputPatterns,
    concurrency,
    scale,
    format,
    landscape,
    margins,
    headerTemplate,
    footerTemplate,
    headerTemplateFile,
    footerTemplateFile,
    headerText,
    footerText,
    headerTextFile,
    footerTextFile,
    verbose,
    debug,
  } = argv
  verbose = verbose || debug
  if (debug) console.log({ argv })

  const inputs = await globby(inputPatterns)

  if (verbose) console.log({ inputs })

  // Validation

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

  // Templates

  if (headerTextFile) {
    headerText = await fs.readFile(headerTextFile, 'utf8')
  }

  if (headerText) {
    headerTemplate = headerTextTmpl(headerText.trim())
  } else if (headerTemplateFile) {
    headerTemplate = await fs.readFile(headerTemplateFile, 'utf8')
  }

  if (footerTextFile) {
    footerText = await fs.readFile(footerTextFile, 'utf8')
  }

  if (footerText) {
    footerTemplate = footerTextTmpl(footerText.trim())
  } else if (footerTemplateFile) {
    footerTemplate = await fs.readFile(footerTemplateFile, 'utf8')
  }

  const browser = await puppeteer.launch({ args: ['--no-sandbox'] })

  await pMap(
    inputs,
    inputPath =>
      html2pdfFile(
        browser,
        inputPath,
        scale,
        format as PDFFormat,
        landscape,
        margins,
        headerTemplate,
        footerTemplate,
        verbose,
      ),
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
  margins = '8mm 8mm 8mm 8mm',
  headerTemplate = '',
  footerTemplate = '',
  verbose = false,
): Promise<void> {
  const d = Date.now()
  // const outPath = path.join(outDir, path.basename(inputPath) + '.pdf')
  const outPath = inputPath + '.pdf'
  // console.log({outPath})

  const [top, right, bottom, left] = margins.split(' ')
  const margin = { top, right: right || top, bottom: bottom || top, left: left || right || top }

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
    headerTemplate: headerTemplate || ' ', // to skip default header
    footerTemplate: footerTemplate || ' ', // to skip default footer
    displayHeaderFooter: !!(headerTemplate || footerTemplate),
    margin,
  })

  await page.close()

  console.log(`${inputPath} done in ${Date.now() - d} ms`)
}
