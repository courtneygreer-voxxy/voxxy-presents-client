import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import path from 'path'
import { matchRoutes } from 'react-router-dom'

// Extract the actual route patterns defined in App.tsx and verify URL matching
// with React Router's own matcher. Guards against accidentally breaking
// vendor-facing links (emails, QR codes, bookmarks) when routes change.

const source = readFileSync(path.resolve(__dirname, '../../App.tsx'), 'utf-8')

const routePaths = [...source.matchAll(/<Route\s+path="([^"]+)"/g)].map((m) => m[1])
const routes = routePaths.map((p) => ({ path: p }))

function matchedRoute(url: string): string | undefined {
  const matches = matchRoutes(routes, url)
  return matches?.[matches.length - 1]?.route.path
}

describe('App routes — vendor-facing URLs keep resolving', () => {
  it('defines all critical public route patterns', () => {
    expect(routePaths).toContain('/events/:slug/apply/:applicationId')
    expect(routePaths).toContain('/events/*')
    expect(routePaths).toContain('/portal/*')
    expect(routePaths).toContain('/apply/:code')
    expect(routePaths).toContain('/applications/track/:ticketCode')
    expect(routePaths).toContain('/invitations/:token')
    expect(routePaths).toContain('/unsubscribe/:token')
  })

  it('matches legacy event page URLs (plain slug)', () => {
    expect(matchedRoute('/events/brooklyn-show-45')).toBe('/events/*')
  })

  it('matches namespaced event page URLs (org-slug/event-slug)', () => {
    expect(matchedRoute('/events/pancake-and-booze-12/brooklyn-show-45')).toBe('/events/*')
  })

  it('matches application form URLs (plain slug + application id)', () => {
    expect(matchedRoute('/events/brooklyn-show-45/apply/3')).toBe(
      '/events/:slug/apply/:applicationId',
    )
  })

  it('documents the known limitation: namespaced apply URLs fall through to the event page', () => {
    // The app never generates this URL shape; if this assertion starts failing,
    // someone changed apply-route matching — make sure old links still work.
    expect(matchedRoute('/events/pancake-and-booze-12/brooklyn-show-45/apply/3')).toBe('/events/*')
  })

  it('matches vendor portal URLs (slug, namespaced slug, and access token)', () => {
    expect(matchedRoute('/portal/brooklyn-show-45')).toBe('/portal/*')
    expect(matchedRoute('/portal/pancake-and-booze-12/brooklyn-show-45')).toBe('/portal/*')
    expect(matchedRoute('/portal/aBcDeFgHiJkLmNoPqRsTuVwXyZ0123456789_-abcde')).toBe('/portal/*')
  })

  it('matches short links and application tracking URLs', () => {
    expect(matchedRoute('/apply/X7K2M')).toBe('/apply/:code')
    expect(matchedRoute('/applications/track/TICKET123')).toBe('/applications/track/:ticketCode')
  })
})

describe('App routes — dashboard wildcard routing', () => {
  it('defines the dashboard wildcard route', () => {
    expect(routePaths).toContain('/dashboard/*')
  })

  it('matches bare /dashboard and nested dashboard URLs', () => {
    expect(matchedRoute('/dashboard')).toBe('/dashboard/*')
    expect(matchedRoute('/dashboard/events')).toBe('/dashboard/*')
    expect(matchedRoute('/dashboard/events/brooklyn-show-45/applicants')).toBe('/dashboard/*')
    expect(matchedRoute('/dashboard/network/lists')).toBe('/dashboard/*')
  })
})
