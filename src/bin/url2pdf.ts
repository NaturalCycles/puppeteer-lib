#!/usr/bin/env node

import { url2pdfCommand } from '../url2pdf.util'

url2pdfCommand().catch(err => {
  console.error(err)
  process.exit(1)
})
