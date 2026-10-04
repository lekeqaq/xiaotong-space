/** Only conceal off-screen content after mount; SSR and reduced-motion stay readable. */
export function useScrollReveal(container: Ref<HTMLElement | null>) {
  let observer: IntersectionObserver | undefined
  let reduced: MediaQueryList | undefined
  const revealAll = () => {
    observer?.disconnect()
    container.value?.querySelectorAll('.reveal-ready').forEach((el) => el.classList.remove('reveal-ready'))
  }
  const onMotionChange = () => {
    if (reduced?.matches) revealAll()
  }
  onMounted(() => {
    reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (reduced.matches || !('IntersectionObserver' in window)) return
    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed')
            observer?.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.08 },
    )
    container.value?.querySelectorAll('[data-reveal]').forEach((el) => {
      if (el.getBoundingClientRect().top >= window.innerHeight) {
        el.classList.add('reveal-ready')
        observer?.observe(el)
      }
    })
    reduced.addEventListener('change', onMotionChange)
  })
  onBeforeUnmount(() => {
    observer?.disconnect()
    reduced?.removeEventListener('change', onMotionChange)
  })
}
