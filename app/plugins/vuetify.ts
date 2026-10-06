import { createVuetify } from 'vuetify'
import type { IconProps } from 'vuetify'
import { zhHans } from 'vuetify/locale'
import { UIcon } from '#components'

export default defineNuxtPlugin((nuxtApp) => {
  const vuetify = createVuetify({
    ssr: true,
    locale: { locale: 'zhHans', messages: { zhHans } },
    date: { locale: { zhHans: 'zh-CN' } },
    icons: {
      defaultSet: 'lucide',
      aliases: {
        close: 'i-lucide-x',
        clear: 'i-lucide-x',
        delete: 'i-lucide-x',
        dropdown: 'i-lucide-chevron-down',
        expand: 'i-lucide-chevron-down',
        collapse: 'i-lucide-chevron-up',
        prev: 'i-lucide-chevron-left',
        next: 'i-lucide-chevron-right',
        first: 'i-lucide-chevrons-left',
        last: 'i-lucide-chevrons-right',
        success: 'i-lucide-circle-check',
        info: 'i-lucide-info',
        warning: 'i-lucide-triangle-alert',
        error: 'i-lucide-circle-alert',
        complete: 'i-lucide-check',
        checkboxOn: 'i-lucide-square-check',
        checkboxOff: 'i-lucide-square',
        checkboxIndeterminate: 'i-lucide-square-minus',
        menu: 'i-lucide-menu',
        subgroup: 'i-lucide-chevron-down',
        loading: 'i-lucide-loader-circle',
        calendar: 'i-lucide-calendar-days',
        edit: 'i-lucide-pencil',
      },
      sets: {
        lucide: { component: (props: IconProps) => h(props.tag, [h(UIcon, { name: String(props.icon) })]) },
      },
    },
    defaults: {
      VBtn: {
        rounded: 'lg',
        elevation: 0,
        height: 40,
        style: 'text-transform: none; letter-spacing: normal',
      },
      VTab: { rounded: 0 },
      VCard: { rounded: 'lg', elevation: 0, border: true },
      VTextField: { variant: 'outlined', density: 'comfortable', color: 'primary', hideDetails: 'auto' },
      VTextarea: { variant: 'outlined', density: 'comfortable', color: 'primary', hideDetails: 'auto' },
      VSelect: {
        menuProps: { contentClass: 'admin admin-vuetify' },
        variant: 'outlined',
        density: 'comfortable',
        color: 'primary',
        hideDetails: 'auto',
      },
      VCombobox: {
        menuProps: { contentClass: 'admin admin-vuetify' },
        variant: 'outlined',
        density: 'comfortable',
        color: 'primary',
        hideDetails: 'auto',
      },
      VDateInput: {
        variant: 'outlined',
        density: 'comfortable',
        color: 'primary',
        hideDetails: 'auto',
        prependIcon: '',
        appendInnerIcon: '$calendar',
        inputFormat: 'yyyy-mm-dd',
        menuProps: { contentClass: 'admin admin-vuetify admin-date-menu' },
      },
      VAlert: { variant: 'tonal', rounded: 'lg', density: 'compact' },
    },
    theme: {
      utilities: false,
      defaultTheme: 'adminLight',
      themes: {
        adminLight: {
          dark: false,
          colors: {
            primary: '#7056D8',
            background: '#F5F6FA',
            surface: '#FFFFFF',
            'surface-variant': '#ECEEF4',
            'on-surface': '#25283D',
            'on-background': '#25283D',
            success: '#24856B',
            error: '#C74754',
            info: '#526FAD',
          },
        },
        adminDark: {
          dark: true,
          colors: {
            primary: '#B9A5FF',
            background: '#151721',
            surface: '#1F2230',
            'surface-variant': '#2B2F40',
            'on-surface': '#ECECF7',
            'on-background': '#ECECF7',
            success: '#6AD2AF',
            error: '#FF9AA5',
            info: '#9AB5F2',
          },
        },
      },
    },
  })
  nuxtApp.vueApp.use(vuetify)
})
