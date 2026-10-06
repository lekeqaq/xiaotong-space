<template>
  <section class="still-building container">
    <NuxtImg
      format="webp"
      src="/images/personal/mountain.jpg"
      width="1400"
      height="240"
      alt=""
      loading="lazy"
      sizes="sm:100vw xl:1280px"
    />
    <div class="still-building-shade" />
    <div>
      <h2>Still building<span>.</span></h2>
      <p>更多有趣的想法，正在路上。</p>
    </div>
    <svg viewBox="0 0 800 100" aria-hidden="true">
      <path
        d="M5 44C160 0 140 110 300 60S500 10 620 48S730 58 790 65"
        fill="none"
        stroke="#b4bd78"
        stroke-dasharray="4 5"
      />
      <circle cx="300" cy="60" r="5" fill="#c8ea8a" />
      <path d="m782 60 9 5-9 4" fill="none" stroke="#c8ea8a" /></svg
    ><NuxtLink to="/writing" class="next-stop"
      >Next stop<UIcon name="i-lucide-arrow-up-right" /><span>A little more<br />possibility.</span></NuxtLink
    >
  </section>
</template>
