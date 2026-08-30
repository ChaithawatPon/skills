import { existsSync } from 'node:fs'
import { homedir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)))
const REPO_ROOT = dirname(ROOT)
const OUTPUT_DIR = join(ROOT, 'output')
const STATE_DIR = join(ROOT, 'state')
const OPERATOR_PROFILE_PATH = join(STATE_DIR, 'operator-profile.json')
// Set MARKETPLACE_BROWSER_STATE_DIR to reuse an existing headed Facebook profile.
// The default is portable and does not assume a private workspace layout.
const DEFAULT_FACEBOOK_BROWSER_DIR = join(homedir(), '.cache', 'facebook-marketplace-browser')
const BROWSER_STATE_DIR = process.env.MARKETPLACE_BROWSER_STATE_DIR || DEFAULT_FACEBOOK_BROWSER_DIR
const FOLLOW_UP_STATE_FILE = join(STATE_DIR, 'marketplace-follow-ups.json')
const PREPARED_STATE_DIR = join(STATE_DIR, 'prepared')
const LISTING_FACTS_DIR = join(STATE_DIR, 'listing-facts')

// The curated-repo installer is owned by the repository, not by this package, and it
// has already moved once (repo-root scripts/ -> scripts/curated-repo-tools/). Resolve
// it in one place so code and tests can never drift onto different paths, and never
// keep a second copy at the old location.
const INSTALLER_ENV_VAR = 'MARKETPLACE_INSTALLER_SCRIPT'
const INSTALLER_CANDIDATES = [
  join(REPO_ROOT, 'scripts', 'curated-repo-tools', 'install-skill.py'),
  join(REPO_ROOT, 'scripts', 'install-skill.py'),
]

function resolveInstallerScript({ repoRoot = REPO_ROOT, env = process.env } = {}) {
  const override = env[INSTALLER_ENV_VAR]
  if (override) {
    if (!existsSync(override)) {
      throw new Error(`${INSTALLER_ENV_VAR} points at a missing file: ${override}`)
    }
    return override
  }

  const candidates =
    repoRoot === REPO_ROOT
      ? INSTALLER_CANDIDATES
      : [
          join(repoRoot, 'scripts', 'curated-repo-tools', 'install-skill.py'),
          join(repoRoot, 'scripts', 'install-skill.py'),
        ]

  const found = candidates.find((candidate) => existsSync(candidate))
  if (!found) {
    throw new Error(
      `curated-repo installer not found. Looked in:\n  ${candidates.join('\n  ')}\n` +
        `Set ${INSTALLER_ENV_VAR} to point at install-skill.py.`
    )
  }
  return found
}

function timestampSlug(date = new Date()) {
  return date.toISOString().replace(/[:.]/g, '-')
}

export {
  BROWSER_STATE_DIR,
  FOLLOW_UP_STATE_FILE,
  INSTALLER_CANDIDATES,
  INSTALLER_ENV_VAR,
  LISTING_FACTS_DIR,
  OUTPUT_DIR,
  OPERATOR_PROFILE_PATH,
  PREPARED_STATE_DIR,
  REPO_ROOT,
  ROOT,
  STATE_DIR,
  resolveInstallerScript,
  timestampSlug,
}
