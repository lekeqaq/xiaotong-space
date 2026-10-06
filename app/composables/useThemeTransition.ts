export function useThemeTransition() {
  const colorMode = useColorMode()
  const transitioning = useState('theme-transitioning', () => false)
  async function toggleTheme(event: MouseEvent) {
    if (transitioning.value) return
    const preference = colorMode.value === 'dark' ? 'light' : 'dark'
    const applyTheme = async () => {
      colorMode.preference = preference
      await nextTick()
    }
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      await applyTheme()
      return
    }
    const root = document.documentElement
    if (!document.startViewTransition) {
      transitioning.value = true
      root.classList.add('theme-fading')
      // Commit the transition styles before changing the theme variables.
      void root.offsetWidth
      await applyTheme()
      window.setTimeout(() => {
        root.classList.remove('theme-fading')
        transitioning.value = false
      }, 1500)
      return
    }
    transitioning.value = true
    const rect = (event.currentTarget as HTMLButtonElement).getBoundingClientRect()
    const x = rect.left + rect.width / 2
    const y = rect.top + rect.height / 2
    const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y))
    root.classList.add('theme-revealing')
    try {
      const transition = document.startViewTransition(applyTheme)
      await transition.ready
      await root.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
        {
          duration: 1500,
          easing: 'cubic-bezier(.4,0,.2,1)',
          pseudoElement: '::view-transition-new(root)',
          fill: 'both',
        },
      ).finished
      await transition.finished
    } catch {
      // Hidden tabs or unsupported snapshot animation still receive the chosen theme.
      await applyTheme()
    } finally {
      root.classList.remove('theme-revealing')
      transitioning.value = false
    }
  }
  return { colorMode, toggleTheme }
}
