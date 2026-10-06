import { addComponent, defineNuxtModule } from 'nuxt/kit'

// Let Nuxt import only components used by admin routes, instead of bundling the entire library.
export default defineNuxtModule({
  meta: { name: 'admin-vuetify' },
  setup() {
    const groups = {
      VApp: ['VApp'],
      VMain: ['VMain'],
      VBtn: ['VBtn'],
      VCard: ['VCard'],
      VTextField: ['VTextField'],
      VTextarea: ['VTextarea'],
      VSelect: ['VSelect'],
      VCombobox: ['VCombobox'],
      VDateInput: ['VDateInput'],
      VAlert: ['VAlert'],
      VChip: ['VChip'],
      VTabs: ['VTabs', 'VTab'],
      VDialog: ['VDialog'],
      VDivider: ['VDivider'],
      VNavigationDrawer: ['VNavigationDrawer'],
      VList: ['VList', 'VListItem'],
      VAppBar: ['VAppBar'],
      VProgressLinear: ['VProgressLinear'],
      VPagination: ['VPagination'],
    }
    for (const [group, names] of Object.entries(groups)) {
      for (const name of names) addComponent({ name, export: name, filePath: `vuetify/components/${group}` })
    }
  },
})
