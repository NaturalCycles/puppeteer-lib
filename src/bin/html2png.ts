#!/usr/bin/env node

import { html2pngCommand } from '../html2png.util'

html2pngCommand().catch(err => {
  console.error(err)
  process.exit(1)
})
