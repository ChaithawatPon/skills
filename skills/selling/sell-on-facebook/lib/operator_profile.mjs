import { existsSync, readFileSync } from 'node:fs'
import { OPERATOR_PROFILE_PATH } from './runtime_paths.mjs'

const REQUIRED = ['country', 'city', 'language']

function validateOperatorProfile(profile) {
  const errors = []
  if (!profile || typeof profile !== 'object') return { ok: false, errors: ['profile must be an object'] }
  for (const field of REQUIRED) if (!String(profile[field] || '').trim()) errors.push(`${field} is required`)
  const radius = Number(profile.radius_km)
  if (!Number.isFinite(radius) || radius < 1 || radius > 500) errors.push('radius_km must be between 1 and 500')
  if (!Array.isArray(profile.fulfillment) || profile.fulfillment.length === 0) errors.push('fulfillment must contain pickup or shipping')
  if (profile.fulfillment?.some((value) => !['pickup', 'shipping'].includes(value))) errors.push('fulfillment may only contain pickup or shipping')
  return { ok: errors.length === 0, errors }
}

function loadOperatorProfile(path = OPERATOR_PROFILE_PATH) {
  if (!existsSync(path)) return null
  const profile = JSON.parse(readFileSync(path, 'utf8'))
  const validation = validateOperatorProfile(profile)
  if (!validation.ok) throw new Error(`Invalid operator profile:\n${validation.errors.join('\n')}`)
  return profile
}

function requireOperatorProfile(path = OPERATOR_PROFILE_PATH) {
  const profile = loadOperatorProfile(path)
  if (!profile) throw new Error(`Operator setup is required. Run: npm run setup`)
  return profile
}

export { loadOperatorProfile, requireOperatorProfile, validateOperatorProfile }
