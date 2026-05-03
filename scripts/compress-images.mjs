/**
 * Image compression script — converts JPG/PNG to WebP, max 1400px wide, quality 82
 * Run: node scripts/compress-images.mjs
 */
import sharp from 'sharp'
import { readdir, stat, mkdir } from 'fs/promises'
import { join, extname, basename, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '../public/images')

const MAX_WIDTH  = 1400
const QUALITY    = 82
const SKIP_EXTS  = new Set(['.webp', '.svg', '.gif', '.DS_Store'])

async function getFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true })
  const files   = []
  for (const e of entries) {
    const full = join(dir, e.name)
    if (e.isDirectory()) files.push(...await getFiles(full))
    else files.push(full)
  }
  return files
}

async function compress(filePath) {
  const ext = extname(filePath).toLowerCase()
  if (SKIP_EXTS.has(ext)) return null
  if (!['.jpg', '.jpeg', '.png'].includes(ext)) return null

  const outPath = filePath.replace(/\.(jpg|jpeg|png)$/i, '.webp')

  // Skip if webp already exists and is newer
  try {
    const [srcStat, outStat] = await Promise.all([stat(filePath), stat(outPath)])
    if (outStat.mtimeMs > srcStat.mtimeMs) {
      return { skipped: true, path: outPath }
    }
  } catch {}

  const meta = await sharp(filePath).metadata()
  const resize = meta.width > MAX_WIDTH ? { width: MAX_WIDTH } : undefined

  await sharp(filePath)
    .resize(resize)
    .webp({ quality: QUALITY, effort: 4 })
    .toFile(outPath)

  const [origSize, newSize] = await Promise.all([
    stat(filePath).then(s => s.size),
    stat(outPath).then(s => s.size),
  ])

  return {
    file:    filePath.replace(ROOT, ''),
    orig:    (origSize / 1024).toFixed(0) + 'KB',
    new:     (newSize  / 1024).toFixed(0) + 'KB',
    savings: Math.round((1 - newSize / origSize) * 100) + '%',
  }
}

const files   = await getFiles(ROOT)
const results = await Promise.all(files.map(compress))
const done    = results.filter(r => r && !r.skipped)
const skipped = results.filter(r => r?.skipped).length

console.log('\n📸 Image Compression Results\n')
for (const r of done) {
  console.log(`✓ ${r.file}`)
  console.log(`  ${r.orig} → ${r.new}  (saved ${r.savings})\n`)
}
console.log(`Done: ${done.length} compressed, ${skipped} skipped (already up-to-date)`)
