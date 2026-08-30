import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { existsSync, mkdtempSync, readdirSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import test from 'node:test'

import {
  INSTALLER_ENV_VAR,
  REPO_ROOT,
  resolveInstallerScript,
} from '../lib/runtime_paths.mjs'

const INSTALLER = resolveInstallerScript()

test('installer resolution rejects a missing override instead of silently falling back', () => {
  assert.throws(
    () => resolveInstallerScript({ env: { [INSTALLER_ENV_VAR]: '/definitely/missing/install-skill.py' } }),
    new RegExp(INSTALLER_ENV_VAR)
  )
})

test('install-skill installs production deps and installed runtime can resolve playwright', () => {
  const destinationParent = mkdtempSync('/private/tmp/marketplace-install-test-')
  try {
    const installedPath = execFileSync(
      'python3',
      [INSTALLER, 'sell-on-facebook', '--dest', destinationParent, '--root', REPO_ROOT],
      { encoding: 'utf8' }
    ).trim().split(/\r?\n/).filter(Boolean).at(-1)

    assert.ok(existsSync(installedPath), 'installed package path should exist')
    assert.equal(existsSync(join(installedPath, 'node_modules')), true)
    assert.equal(existsSync(join(installedPath, 'node_modules', 'playwright')), true)
    assert.equal(existsSync(join(installedPath, 'output')), false)
    assert.equal(existsSync(join(installedPath, 'state')), false)
    assert.ok(readdirSync(installedPath).includes('SKILL.md'))

    const output = execFileSync(
      process.execPath,
      [
        '--input-type=module',
        '-e',
        "const { chromium } = await import('playwright'); console.log(typeof chromium.launch)",
      ],
      { cwd: installedPath, encoding: 'utf8' }
    )
    assert.match(output, /function/)
  } finally {
    rmSync(destinationParent, { recursive: true, force: true })
  }
})

test('install-skill rolls back the target when destination dependency install fails', () => {
  const destinationParent = mkdtempSync('/private/tmp/marketplace-install-rollback-test-')
  try {
    assert.throws(
      () =>
        execFileSync(
          'python3',
          [
            INSTALLER,
            'sell-on-facebook',
            '--dest',
            destinationParent,
            '--root',
            REPO_ROOT,
            '--npm-bin',
            '/definitely/missing/npm',
          ],
          { encoding: 'utf8', stdio: 'pipe' }
        ),
      /installation failed and was rolled back/
    )

    assert.equal(existsSync(join(destinationParent, 'sell-on-facebook')), false)
    assert.deepEqual(readdirSync(destinationParent), [])
  } finally {
    rmSync(destinationParent, { recursive: true, force: true })
  }
})
