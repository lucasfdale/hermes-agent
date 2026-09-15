export type BusyInputMode = 'interrupt' | 'queue' | 'steer'
export type BusyComposerAction = 'queue' | 'steer' | 'stop'

export const normalizeBusyInputMode = (value: unknown): BusyInputMode =>
  value === 'queue' || value === 'steer' ? value : 'interrupt'

/**
 * Maps `display.busy_input_mode` to the composer's visible busy action.
 * `interrupt` keeps the historical Send label (`steer`) because Desktop's
 * interrupt path is an active-turn redirect, not a hard stop.
 */
export function resolveBusyComposerAction({
  busy,
  canRedirect,
  canSteer,
  compacting,
  hasPayload,
  mode
}: {
  busy: boolean
  canRedirect: boolean
  canSteer: boolean
  compacting: boolean
  hasPayload: boolean
  mode: BusyInputMode
}): BusyComposerAction {
  if (!busy) {
    return 'stop'
  }

  if (mode === 'queue') {
    return hasPayload ? 'queue' : 'stop'
  }

  if (!compacting && hasPayload && mode === 'interrupt' && canRedirect) {
    return 'steer'
  }

  if (!compacting && hasPayload && mode === 'steer' && canSteer) {
    return 'steer'
  }

  return hasPayload ? 'queue' : 'stop'
}
