/**
 * Blocking FOUC script — keep in sync with ThemeProvider.
 * Preference: localStorage `app-color-scheme` = light | dark
 * Applied dark only under `/dashboard` paths. Legacy `system` → light.
 * Also migrates legacy `medsynthea-color-scheme` once.
 */
export const themeInitScript = `
;(function () {
  var PREF_KEY = 'app-color-scheme'
  var LEGACY_PREF_KEY = 'medsynthea-color-scheme'
  var path = location.pathname || ''
  var onDashboard = path === '/dashboard' || path.indexOf('/dashboard/') === 0
  var pref = null
  try {
    pref = localStorage.getItem(PREF_KEY)
    if (pref !== 'dark' && pref !== 'light') {
      pref = localStorage.getItem(LEGACY_PREF_KEY)
      if (pref === 'dark' || pref === 'light') {
        localStorage.setItem(PREF_KEY, pref)
        localStorage.removeItem(LEGACY_PREF_KEY)
      }
    }
  } catch (e) {}
  if (pref !== 'dark' && pref !== 'light') pref = 'light'
  var theme = onDashboard && pref === 'dark' ? 'dark' : 'light'
  var root = document.documentElement
  root.classList.remove('light', 'dark')
  root.classList.add(theme)
  root.style.colorScheme = theme
  root.classList.add('no-transition')
  window.addEventListener('load', function () {
    setTimeout(function () {
      root.classList.remove('no-transition')
    }, 100)
  })
})()
`
