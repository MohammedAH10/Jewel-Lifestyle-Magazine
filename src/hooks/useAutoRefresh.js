import { useEffect, useRef } from 'react'

/**
 * Keeps admin data current without a manual refresh.
 *
 * Every admin panel loaded its data once on mount, so an edit made in another
 * tab, a vote arriving from the public site, or a colleague's change only
 * appeared after a full browser refresh.
 *
 * Polls on an interval, and also refreshes when the tab regains focus or
 * becomes visible again, since that is usually when someone looks back at the
 * page expecting current data.
 *
 * @param {Function} refresh     called with `{ silent: true }` for background polls
 * @param {Object}   [options]
 * @param {number}   [options.interval=15000] poll interval in ms
 * @param {boolean}  [options.enabled=true]    pause polling entirely when false
 * @param {boolean}  [options.refreshOnFocus=true]
 *
 * Background polls pass `silent: true` so a panel can refresh its data without
 * flashing its loading spinner, which would otherwise make the admin page look
 * like it was reloading every few seconds.
 */
export default function useAutoRefresh(refresh, options = {}) {
  const { interval = 15000, enabled = true, refreshOnFocus = true } = options

  // Held in a ref so a new inline callback each render does not tear down and
  // restart the interval.
  const refreshRef = useRef(refresh)
  refreshRef.current = refresh

  useEffect(() => {
    if (!enabled) return undefined

    let timer = null

    const run = (silent) => {
      const result = refreshRef.current?.({ silent })
      // Swallow rejections: a failed background poll should not surface as an
      // unhandled rejection, and the next tick will try again.
      if (result && typeof result.catch === 'function') result.catch(() => {})
    }

    const start = () => {
      stop()
      timer = setInterval(() => run(true), interval)
    }

    const stop = () => {
      if (timer) clearInterval(timer)
      timer = null
    }

    const onFocus = () => {
      // Only refresh if the poll has actually lapsed, so switching windows
      // quickly does not fire a request per switch.
      run(true)
      start()
    }

    const onVisibility = () => {
      if (document.visibilityState === 'visible') {
        run(true)
        start()
      } else {
        // No point polling a tab nobody is looking at.
        stop()
      }
    }

    start()

    if (refreshOnFocus) {
      window.addEventListener('focus', onFocus)
      document.addEventListener('visibilitychange', onVisibility)
    }

    return () => {
      stop()
      if (refreshOnFocus) {
        window.removeEventListener('focus', onFocus)
        document.removeEventListener('visibilitychange', onVisibility)
      }
    }
  }, [interval, enabled, refreshOnFocus])
}
