#!/usr/bin/env node
/**
 * Sort a folder of mixed product photos into per-item sub-folders.
 *
 * Usage:
 *   node scripts/sort_images.mjs prepare <input-folder>
 *   node scripts/sort_images.mjs apply <sort-plan.json> [--output <dir>] [--move]
 *   node scripts/sort_images.mjs --self-test
 */

import { copyFileSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { applySortPlan, prepareThumbnails, validateSortPlan, writeSortPlan } from '../lib/image_sort.mjs'
import { OUTPUT_DIR, PREPARED_STATE_DIR, timestampSlug } from '../lib/runtime_paths.mjs'

async function cmdPrepare(inputDir) {
  if (!inputDir) {
    console.error('Error: input directory required.')
    console.error('Usage: node scripts/sort_images.mjs prepare <input-folder>')
    process.exit(1)
  }

  const absoluteInputDir = resolve(inputDir)
  if (!existsSync(absoluteInputDir)) {
    console.error(`Error: input directory not found: ${absoluteInputDir}`)
    process.exit(1)
  }

  const runSlug = timestampSlug()
  const runDir = join(PREPARED_STATE_DIR, runSlug)
  mkdirSync(runDir, { recursive: true })

  console.log(`Preparing thumbnails from: ${absoluteInputDir}`)
  const items = prepareThumbnails(absoluteInputDir, runDir)

  const manifestPath = join(runDir, 'manifest.json')
  writeFileSync(manifestPath, JSON.stringify({ source_dir: absoluteInputDir, items }, null, 2))

  console.log(`Prepared ${items.length} items.`)
  console.log(`Thumbnails saved to: ${join(runDir, 'thumbnails')}`)
  console.log(`Manifest saved to: ${manifestPath}`)
}

async function cmdApply(planPath, outputOpt, moveOpt) {
  if (!planPath) {
    console.error('Error: sort plan JSON path required.')
    console.error('Usage: node scripts/sort_images.mjs apply <sort-plan.json> [--output <dir>] [--move]')
    process.exit(1)
  }

  const absolutePlanPath = resolve(planPath)
  if (!existsSync(absolutePlanPath)) {
    console.error(`Error: sort plan not found: ${absolutePlanPath}`)
    process.exit(1)
  }

  const plan = JSON.parse(readFileSync(absolutePlanPath, 'utf8'))
  const validation = validateSortPlan(plan)

  if (!validation.isValid) {
    console.error('Error: Sort plan is invalid:')
    for (const err of validation.errors) {
      console.error(`  - ${err}`)
    }
    process.exit(1)
  }

  let outputDir = outputOpt
  if (!outputDir) {
    // default output is next to source dir as "<source-dir>-sorted/"
    outputDir = `${plan.source_dir}-sorted`
  }
  const absoluteOutputDir = resolve(outputDir)

  console.log(`Applying sort plan...`)
  console.log(`Source: ${plan.source_dir}`)
  console.log(`Output: ${absoluteOutputDir}`)
  console.log(`Mode: ${moveOpt ? 'Move' : 'Copy'}`)

  try {
    const result = applySortPlan(absolutePlanPath, absoluteOutputDir, { move: moveOpt })
    console.log(`Successfully ${result.mode} ${result.filesProcessed} files into ${result.groupsCreated} folders.`)
  } catch (err) {
    console.error(`Error applying sort plan: ${err.message}`)
    process.exit(1)
  }
}

async function selfTest() {
  console.log('Running self-test...')
  const testDir = join(OUTPUT_DIR, 'sort_self_test_' + Date.now())
  const sourceDir = join(testDir, 'source')
  const preparedDir = join(testDir, 'prepared')
  const outputDir = join(testDir, 'output')

  mkdirSync(sourceDir, { recursive: true })
  mkdirSync(preparedDir, { recursive: true })

  // Create fake files
  writeFileSync(join(sourceDir, 'IMG_1.jpg'), 'fake jpg')
  writeFileSync(join(sourceDir, 'IMG_2.png'), 'fake png')
  writeFileSync(join(sourceDir, 'IMG_3.mov'), 'fake mov')

  // Mock sips indirectly by overriding the prepareThumbnails sips call
  // We can't easily mock execFileSync, so we create a dummy file for 'sips' if we wanted to
  // Actually, prepareThumbnails uses execFileSync. In self-test we could just skip prepareThumbnails or let it fail?
  // Let's create an actual image so sips doesn't fail, or just mock prepareThumbnails output.
  // Wait, user instructions: "Test prepareThumbnails (mock sips by just copying files)".
  // We can't mock node built-ins easily without jest/sinon. We can mock the PATH.
  
  const sipsMockPath = join(testDir, 'sips')
  writeFileSync(sipsMockPath, '#!/usr/bin/env bash\nSRC=""; OUT=""\nfor arg in "$@"; do\n  case "$prev" in\n    --out) OUT="$arg" ;;\n  esac\n  prev="$arg"\ndone\n# Last non-flag positional before --out is the source\nfor arg in "$@"; do\n  [[ "$arg" == --* ]] && continue\n  [[ "$arg" == jpeg ]] && continue\n  [[ "$arg" == format ]] && continue\n  [[ "$arg" == 512 ]] && continue\n  [[ -f "$arg" ]] && SRC="$arg"\ndone\nif [[ -n "$SRC" && -n "$OUT" ]]; then cp "$SRC" "$OUT"; fi\n', { mode: 0o755 })
  process.env.PATH = `${testDir}:${process.env.PATH}`

  try {
    const items = prepareThumbnails(sourceDir, preparedDir)
    if (items.length !== 3) throw new Error('Expected 3 items')
    
    const planPath = join(testDir, 'plan.json')
    const groups = [
      { name: 'group-a', description: 'desc A', files: ['IMG_1.jpg'] },
      { name: 'group-b', description: 'desc B', files: ['IMG_2.png', 'IMG_3.mov'] }
    ]
    
    writeSortPlan(items, groups, planPath)
    
    const plan = JSON.parse(readFileSync(planPath, 'utf8'))
    const valid = validateSortPlan(plan)
    if (!valid.isValid) throw new Error('Plan should be valid: ' + valid.errors.join(', '))
    
    applySortPlan(planPath, outputDir, { move: false })
    
    if (!existsSync(join(outputDir, 'group-a', 'IMG_1.jpg'))) throw new Error('IMG_1.jpg not copied')
    if (!existsSync(join(outputDir, 'group-b', 'IMG_2.png'))) throw new Error('IMG_2.png not copied')
    if (!existsSync(join(outputDir, 'group-b', 'IMG_3.mov'))) throw new Error('IMG_3.mov not copied')
    
    console.log('Self-test passed.')
  } finally {
    rmSync(testDir, { recursive: true, force: true })
  }
}

const isMain = resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))

if (isMain) {
  const args = process.argv.slice(2)
  const cmd = args[0]

  if (cmd === '--self-test') {
    selfTest().catch(err => {
      console.error(err)
      process.exit(1)
    })
  } else if (cmd === 'prepare') {
    cmdPrepare(args[1])
  } else if (cmd === 'apply') {
    const planPath = args[1]
    let outputOpt = null
    let moveOpt = false
    
    for (let i = 2; i < args.length; i++) {
      if (args[i] === '--output') {
        outputOpt = args[++i]
      } else if (args[i] === '--move') {
        moveOpt = true
      }
    }
    
    cmdApply(planPath, outputOpt, moveOpt)
  } else {
    console.error('Unknown command. Use prepare, apply, or --self-test')
    process.exit(1)
  }
}
