#!/usr/bin/env node

import { url2pngCommand } from '../url2png.util'

url2pngCommand().catch(err => {
  console.error(err)
  process.exit(1)
})
