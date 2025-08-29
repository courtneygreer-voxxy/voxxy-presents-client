#!/usr/bin/env node

/**
 * Security Check Script - Voxxy Presents Client
 * Scans for exposed API keys, secrets, and sensitive data
 */

import { readFileSync, readdirSync, statSync } from 'fs'
import { join, extname } from 'path'

const SECURITY_PATTERNS = [
  // API Keys
  { pattern: /VITE_FIREBASE_API_KEY=/g, description: 'Firebase API Key (should not be secret)' },
  { pattern: /AIza[0-9A-Za-z_-]{35}/g, description: 'Google API Key' },
  { pattern: /SG\.[0-9A-Za-z_-]{22}\.[0-9A-Za-z_-]{43}/g, description: 'SendGrid API Key' },
  
  // Suspicious patterns
  { pattern: /password\s*[:=]\s*['"][^'"]{8,}/gi, description: 'Hardcoded Password' },
  { pattern: /secret\s*[:=]\s*['"][^'"]{8,}/gi, description: 'Hardcoded Secret' },
  { pattern: /token\s*[:=]\s*['"][^'"]{20,}/gi, description: 'Hardcoded Token' },
  
  // Private keys
  { pattern: /-----BEGIN PRIVATE KEY-----/g, description: 'Private Key' },
  { pattern: /-----BEGIN RSA PRIVATE KEY-----/g, description: 'RSA Private Key' },
]

const ALLOWED_FILES = [
  '.env.example',
  'BACKEND_EMAIL_SETUP.md',  // Contains example API keys
  'FIREBASE_SECURITY.md',    // Documentation with examples
  'scripts/check-security.js', // This script itself
  'scripts/sync-staging-data.ts' // Contains legitimate staging API keys
]

const SAFE_PATTERNS = [
  'your_sendgrid_api_key_here',
  'your_firebase_api_key',
  'AIzaSyDZ1_PgIRsVjHc7N2unw_AgTfvdP3yuCp4',  // Known dev Firebase key
  'AIzaSyCllC4e-OZWJLdu97cgmEyuxpq75_ln5Ms',  // Staging sync key
  'VITE_FIREBASE_API_KEY=',  // Pattern examples
  '-----BEGIN PRIVATE KEY-----',  // Pattern examples
  '-----BEGIN RSA PRIVATE KEY-----'  // Pattern examples
]

function scanDirectory(dir, results = []) {
  const files = readdirSync(dir)
  
  for (const file of files) {
    const fullPath = join(dir, file)
    const stat = statSync(fullPath)
    
    // Skip common directories and files
    if (file.startsWith('.git') || file === 'node_modules' || file === 'dist' || file === 'build') {
      continue
    }
    
    if (stat.isDirectory()) {
      scanDirectory(fullPath, results)
    } else if (stat.isFile()) {
      const ext = extname(file).toLowerCase()
      
      // Only scan text files
      if (['.ts', '.tsx', '.js', '.jsx', '.json', '.env', '.md', '.txt', '.yml', '.yaml'].includes(ext)) {
        scanFile(fullPath, results)
      }
    }
  }
  
  return results
}

function scanFile(filePath, results) {
  try {
    const content = readFileSync(filePath, 'utf8')
    const fileName = filePath.replace(process.cwd() + '/', '')
    
    for (const { pattern, description } of SECURITY_PATTERNS) {
      const matches = content.match(pattern)
      
      if (matches) {
        for (const match of matches) {
          // Skip if this is an allowed file or safe pattern
          if (ALLOWED_FILES.some(allowed => fileName.includes(allowed)) ||
              SAFE_PATTERNS.some(safe => match.includes(safe))) {
            continue
          }
          
          results.push({
            file: fileName,
            pattern: description,
            match: match.length > 50 ? match.substring(0, 50) + '...' : match,
            line: getLineNumber(content, match)
          })
        }
      }
    }
  } catch (error) {
    // Skip binary files or permission errors
  }
}

function getLineNumber(content, searchText) {
  const lines = content.substring(0, content.indexOf(searchText)).split('\n')
  return lines.length
}

console.log('🔍 Scanning Voxxy Presents Client for security issues...\n')

const results = scanDirectory(process.cwd())

if (results.length === 0) {
  console.log('✅ No security issues found!')
  console.log('\nScanned for:')
  SECURITY_PATTERNS.forEach(p => console.log(`  • ${p.description}`))
  process.exit(0)
} else {
  console.log('⚠️  Security issues detected:\n')
  
  results.forEach(({ file, pattern, match, line }) => {
    console.log(`❌ ${file}:${line}`)
    console.log(`   Type: ${pattern}`)
    console.log(`   Found: ${match}`)
    console.log('')
  })
  
  console.log('🚨 Please remove or secure these items before deployment!')
  process.exit(1)
}