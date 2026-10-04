import prettier from 'eslint-config-prettier/flat'
import withNuxt from './.nuxt/eslint.config.mjs'
export default withNuxt(prettier, {
  rules: { 'vue/multi-word-component-names': ['error', { ignores: ['index', 'about', 'error', '[slug]'] }] },
})
