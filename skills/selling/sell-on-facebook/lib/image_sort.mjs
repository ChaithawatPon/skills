import { execFileSync } from 'node:child_process'
import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, renameSync, statSync, writeFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { basename, extname, join } from 'node:path'

function getExtension(filename) {
  return extname(filename).toLowerCase()
}

function isImage(ext) {
  return ['.heic', '.jpg', '.jpeg', '.png'].includes(ext)
}

function isVideo(ext) {
  return ['.mov', '.mp4'].includes(ext)
}

export function prepareThumbnails(inputDir, preparedDir) {
  if (!existsSync(inputDir)) {
    throw new Error(`Input directory not found: ${inputDir}`)
  }

  const thumbDir = join(preparedDir, 'thumbnails')
  mkdirSync(thumbDir, { recursive: true })

  const files = readdirSync(inputDir)
  const items = []

  for (const file of files) {
    if (file.startsWith('.')) continue
    
    const ext = getExtension(file)
    const originalPath = join(inputDir, file)
    
    if (isImage(ext)) {
      const thumbFilename = `${basename(file, extname(file))}.jpg`
      const thumbPath = join(thumbDir, thumbFilename)
      
      try {
        if (ext === '.heic') {
          execFileSync('sips', ['-s', 'format', 'jpeg', '-Z', '512', originalPath, '--out', thumbPath])
        } else {
          execFileSync('sips', ['-Z', '512', originalPath, '--out', thumbPath])
        }
        
        items.push({
          original: originalPath,
          thumbnail: thumbPath,
          filename: file,
          type: 'image'
        })
      } catch (err) {
        console.error(`Failed to process thumbnail for ${file}:`, err.message)
      }
    } else if (isVideo(ext)) {
      items.push({
        original: originalPath,
        thumbnail: null,
        filename: file,
        type: 'video'
      })
    }
  }

  return items
}

export function writeSortPlan(items, groups, outputPath) {
  const plan = {
    created_at: new Date().toISOString(),
    source_dir: dirnameOf(items[0]?.original) || '',
    groups: groups.map(g => ({
      folder_name: g.name,
      description: g.description,
      files: g.files,
      file_count: g.files.length
    })),
    ungrouped: items.map(i => i.filename).filter(f => !groups.some(g => g.files.includes(f))),
    total_files: items.length,
    total_groups: groups.length
  }
  
  // Set source_dir correctly if possible
  if (items.length > 0 && plan.source_dir === '') {
     const p = items[0].original
     plan.source_dir = p.substring(0, p.lastIndexOf('/'))
  }

  writeFileSync(outputPath, JSON.stringify(plan, null, 2))
  return plan
}

function dirnameOf(path) {
  if (!path) return ''
  const idx = path.lastIndexOf('/')
  return idx !== -1 ? path.substring(0, idx) : ''
}

export function validateSortPlan(plan) {
  const errors = []
  const seenFiles = new Set()
  
  if (!plan.source_dir || !existsSync(plan.source_dir)) {
    errors.push(`Source directory missing or not found: ${plan.source_dir}`)
  }

  const folderNameRegex = /^[a-z0-9-]+$/
  
  for (const group of (plan.groups || [])) {
    if (!folderNameRegex.test(group.folder_name)) {
      errors.push(`Invalid folder name (must be kebab-case): ${group.folder_name}`)
    }
    
    for (const file of group.files) {
      if (seenFiles.has(file)) {
        errors.push(`File appears in multiple groups: ${file}`)
      }
      seenFiles.add(file)
      
      const srcPath = join(plan.source_dir, file)
      if (!existsSync(srcPath)) {
        errors.push(`Source file not found: ${srcPath}`)
      }
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

export function applySortPlan(planPath, outputDir, opts = {}) {
  const plan = JSON.parse(readFileSync(planPath, 'utf8'))
  const validation = validateSortPlan(plan)
  
  if (!validation.isValid) {
    throw new Error(`Invalid sort plan:\n${validation.errors.join('\n')}`)
  }
  
  const operations = []
  for (const group of plan.groups) {
    for (const file of group.files) {
      const srcPath = join(plan.source_dir, file)
      const destPath = join(outputDir, group.folder_name, file)
      if (!existsSync(destPath)) {
        operations.push({ srcPath, destPath, status: 'copy' })
        continue
      }
      if (sameFileContents(srcPath, destPath)) {
        operations.push({ srcPath, destPath, status: 'identical' })
        continue
      }
      throw new Error(`Destination collision with different content: ${destPath}`)
    }
  }

  mkdirSync(outputDir, { recursive: true })
  let processedFiles = 0
  let identicalFiles = 0
  
  for (const group of plan.groups) {
    if (group.files.length === 0) continue
    
    const groupDir = join(outputDir, group.folder_name)
    mkdirSync(groupDir, { recursive: true })
    
    for (const file of group.files) {
      const operation = operations.find((row) => row.destPath === join(groupDir, file))
      const { srcPath, destPath } = operation
      if (operation.status === 'identical') {
        identicalFiles++
        continue
      }
      
      if (opts.move) {
        renameSync(srcPath, destPath)
      } else {
        copyFileSync(srcPath, destPath)
      }
      processedFiles++
    }
  }
  
  return {
    success: true,
    groupsCreated: plan.groups.length,
    filesProcessed: processedFiles,
    identicalFiles,
    mode: opts.move ? 'moved' : 'copied'
  }
}

function fileHash(path) {
  return createHash('sha256').update(readFileSync(path)).digest('hex')
}

function sameFileContents(left, right) {
  if (statSync(left).size !== statSync(right).size) return false
  return fileHash(left) === fileHash(right)
}
