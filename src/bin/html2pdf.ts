#!/usr/bin/env node

import { html2pdfCommand } from '../html2pdf.util'

html2pdfCommand().catch(err => {
  console.error(err)
  process.exit(1)
})
