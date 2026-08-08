import fs from 'node:fs/promises'
import path from 'node:path'

const projectRoot = process.cwd()
const sourceRoot = process.argv[2]
const sourceSongNameArg = process.argv[3]

if (!sourceRoot) {
  console.error('Usage: node scripts/import-stems.mjs "<sourceFolder>" [songName]')
  process.exit(1)
}

const destinationRoot = path.join(projectRoot, 'public', 'api', 'mock-stems')
const catalogPath = path.join(projectRoot, 'public', 'api', 'mock-stem-catalog.json')

const allowedExtensions = new Set(['.wav', '.mp3', '.flac', '.m4a', '.ogg', '.aac', '.aif', '.aiff'])

async function exists(targetPath) {
  try {
    await fs.access(targetPath)
    return true
  } catch {
    return false
  }
}

function normalizeText(value) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function toStemLabel(fileName) {
  const withoutExtension = fileName.replace(/\.[^.]+$/, '')
  return withoutExtension
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function inferMimeType(fileName) {
  const extension = path.extname(fileName).toLowerCase()
  if (extension === '.wav') return 'audio/wav'
  if (extension === '.flac') return 'audio/flac'
  if (extension === '.ogg') return 'audio/ogg'
  if (extension === '.aac') return 'audio/aac'
  if (extension === '.m4a') return 'audio/mp4'
  if (extension === '.aif' || extension === '.aiff') return 'audio/aiff'
  return 'audio/mpeg'
}

async function readAudioFiles(folderPath) {
  const entries = await fs.readdir(folderPath, { withFileTypes: true })
  return entries
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .filter((fileName) => allowedExtensions.has(path.extname(fileName).toLowerCase()))
    .sort((a, b) => a.localeCompare(b, 'es'))
}

async function main() {
  const absoluteSource = path.resolve(sourceRoot)
  const sourceExists = await exists(absoluteSource)
  if (!sourceExists) {
    console.error(`Source folder does not exist: ${absoluteSource}`)
    process.exit(1)
  }

  const sourceStats = await fs.stat(absoluteSource)
  if (!sourceStats.isDirectory()) {
    console.error(`Source path is not a folder: ${absoluteSource}`)
    process.exit(1)
  }

  const sourceFolderName = path.basename(absoluteSource)
  const songTitle = sourceSongNameArg && sourceSongNameArg.trim().length > 0 ? sourceSongNameArg.trim() : sourceFolderName
  const songId = normalizeText(songTitle) || `song-${Date.now()}`

  await fs.mkdir(destinationRoot, { recursive: true })

  const destinationSongDir = path.join(destinationRoot, songId)
  await fs.rm(destinationSongDir, { recursive: true, force: true })
  await fs.mkdir(destinationSongDir, { recursive: true })

  const audioFiles = await readAudioFiles(absoluteSource)
  if (audioFiles.length === 0) {
    console.error('No supported audio files found in source folder.')
    process.exit(1)
  }

  const stems = []

  for (const [index, fileName] of audioFiles.entries()) {
    const sourceFile = path.join(absoluteSource, fileName)
    const destinationFile = path.join(destinationSongDir, fileName)
    await fs.copyFile(sourceFile, destinationFile)

    stems.push({
      id: `${songId}-stem-${index + 1}`,
      label: toStemLabel(fileName) || `Stem ${index + 1}`,
      audioUrl: `/api/mock-stems/${songId}/${fileName}`,
      mimeType: inferMimeType(fileName),
      durationMs: 0,
    })
  }

  let existingCatalog = { songs: [] }

  if (await exists(catalogPath)) {
    try {
      const raw = await fs.readFile(catalogPath, 'utf8')
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed.songs)) {
        existingCatalog = parsed
      }
    } catch {
      existingCatalog = { songs: [] }
    }
  }

  const nextSongs = (existingCatalog.songs || []).filter((song) => song.id !== songId)
  nextSongs.push({
    id: songId,
    title: songTitle,
    bpm: 120,
    stems,
  })

  await fs.writeFile(catalogPath, JSON.stringify({ songs: nextSongs }, null, 2) + '\n', 'utf8')

  console.log(`Imported ${stems.length} stems for song "${songTitle}".`)
  console.log(`Catalog updated: ${path.relative(projectRoot, catalogPath)}`)
  console.log(`Stems copied to: ${path.relative(projectRoot, destinationSongDir)}`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
