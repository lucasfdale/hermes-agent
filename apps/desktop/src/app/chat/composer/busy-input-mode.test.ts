import { describe, expect, it } from 'vitest'

import { normalizeBusyInputMode, resolveBusyComposerAction } from './busy-input-mode'

describe('normalizeBusyInputMode', () => {
  it('keeps queue and steer', () => {
    expect(normalizeBusyInputMode('queue')).toBe('queue')
    expect(normalizeBusyInputMode('steer')).toBe('steer')
  })

  it('falls unknown values back to interrupt', () => {
    expect(normalizeBusyInputMode(undefined)).toBe('interrupt')
    expect(normalizeBusyInputMode('')).toBe('interrupt')
    expect(normalizeBusyInputMode('drop')).toBe('interrupt')
  })
})

describe('resolveBusyComposerAction', () => {
  const capable = {
    busy: true,
    canRedirect: true,
    canSteer: true,
    compacting: false,
    hasPayload: true
  }

  it('interrupt with a payload is the historical Send/steer action', () => {
    expect(resolveBusyComposerAction({ ...capable, mode: 'interrupt' })).toBe('steer')
  })

  it('steer with a payload stays Send (tool-boundary steer)', () => {
    expect(resolveBusyComposerAction({ ...capable, mode: 'steer' })).toBe('steer')
  })

  it('queue with a payload is queue', () => {
    expect(resolveBusyComposerAction({ ...capable, mode: 'queue' })).toBe('queue')
  })

  it('empty composer mid-turn is stop', () => {
    expect(resolveBusyComposerAction({ ...capable, hasPayload: false, mode: 'steer' })).toBe('stop')
  })

  it('compacting cannot redirect or steer', () => {
    expect(resolveBusyComposerAction({ ...capable, compacting: true, mode: 'interrupt' })).toBe('queue')
    expect(resolveBusyComposerAction({ ...capable, compacting: true, mode: 'steer' })).toBe('queue')
  })
})
