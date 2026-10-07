<script setup lang="ts">
import Vditor from 'vditor'
import 'vditor/dist/index.css'
import { fromEditorMarkdown, toEditorMarkdown } from '~/utils/adminEditorMarkdown'

const props = defineProps<{ modelValue: string; disabled?: boolean }>()
const emit = defineEmits<{ 'update:modelValue': [value: string]; 'select-image': [] }>()
const host = useTemplateRef<HTMLDivElement>('host')
const colorMode = useColorMode()
const ready = ref(false)
const loadError = ref('')
const { notify } = useAdminToast()
let disposed = false
let instance: Vditor | undefined
let baseline = ''
let publishedValue = props.modelValue
let imageRange: Range | undefined

function pasteMarkdown(event: ClipboardEvent) {
  const markdown = event.clipboardData?.getData('text/plain')
  const html = event.clipboardData?.getData('text/html') || ''
  // Editors such as VS Code also put a styled <pre> on the clipboard. Prefer
  // Markdown source over that HTML, otherwise an entire article becomes code.
  if (
    !markdown ||
    !instance ||
    props.disabled ||
    (html &&
      !/<pre\b|font-family:[^;"']*monospace/i.test(html) &&
      !/(^|\n)(#{1,6}\s|\s*[-*+]\s|\s*\d+[.)]\s|>|`{3,}|~{3,}|::[a-zA-Z]|\||[-=]{3,}\s*$)|\*[^\n]+\*|~~[^\n]+~~|!?\[[^\]]+\]\([^)]+\)/m.test(
        markdown,
      ))
  )
    return
  event.preventDefault()
  event.stopPropagation()
  instance.insertMD(toEditorMarkdown(markdown))
  flush()
}

function flush() {
  if (!ready.value || !instance) return
  const value = instance.getValue()
  if (value === baseline) return
  baseline = value
  publishedValue = fromEditorMarkdown(value)
  emit('update:modelValue', publishedValue)
}

function flushOutside(event: PointerEvent) {
  if (!host.value?.contains(event.target as Node)) flush()
}

function insertImage(src: string) {
  if (!instance || !ready.value || props.disabled) return
  instance.focus()
  if (imageRange && host.value?.contains(imageRange.commonAncestorContainer)) {
    const selection = window.getSelection()
    selection?.removeAllRanges()
    selection?.addRange(imageRange)
  }
  instance.insertMD(`\n![图片描述](${src})\n`)
  imageRange = undefined
  flush()
}
defineExpose({ flush, insertImage })

watch(
  () => props.modelValue,
  (value) => {
    if (!instance || !ready.value || value === publishedValue) return
    publishedValue = value
    instance.setValue(toEditorMarkdown(value), true)
    baseline = instance.getValue()
  },
)
watch(
  () => props.disabled,
  (disabled) => {
    if (!ready.value) return
    if (disabled) instance?.disabled()
    else instance?.enable()
  },
)
watch(
  () => colorMode.value,
  (mode) => {
    if (ready.value) instance?.setTheme(mode === 'dark' ? 'dark' : 'classic')
  },
)

function loadScript(path: string, id: string) {
  if (document.getElementById(id)) return Promise.resolve()
  return new Promise<void>((resolve, reject) => {
    const script = document.createElement('script')
    script.src = `/vendor/vditor/dist/js/${path}`
    script.onload = () => {
      script.id = id
      resolve()
    }
    script.onerror = () => {
      script.remove()
      reject(new Error('编辑器资源加载失败，请刷新页面重试。'))
    }
    document.head.appendChild(script)
  })
}

onMounted(async () => {
  try {
    await Promise.all([
      loadScript('i18n/zh_CN.js', 'vditorI18nScriptzh_CN'),
      loadScript('lute/lute.min.js', 'vditorLuteScript'),
      loadScript('icons/ant.js', 'vditorIconScript'),
    ])
  } catch (error) {
    if (!disposed) {
      loadError.value = adminError(error)
      notify(loadError.value, 'error')
    }
    return
  }
  if (disposed) return
  document.addEventListener('pointerdown', flushOutside, true)
  window.addEventListener('beforeunload', flush, true)
  instance = new Vditor(host.value!, {
    value: toEditorMarkdown(props.modelValue),
    mode: 'wysiwyg',
    theme: colorMode.value === 'dark' ? 'dark' : 'classic',
    lang: 'zh_CN',
    i18n: window.VditorI18n,
    cdn: '/vendor/vditor',
    cache: { enable: false },
    minHeight: 520,
    undoDelay: 100,
    placeholder: '写下你的思考，或直接粘贴 Markdown 内容…',
    toolbar: [
      'headings',
      'bold',
      'italic',
      'strike',
      'link',
      '|',
      'list',
      'ordered-list',
      'check',
      'quote',
      'code',
      'inline-code',
      'table',
      {
        name: 'library-image',
        tip: '插入图片',
        tipPosition: 'n',
        icon: '<svg><use href="#vditor-icon-upload"></use></svg>',
        click: () => {
          const selection = window.getSelection()
          if (selection?.rangeCount && host.value?.contains(selection.anchorNode))
            imageRange = selection.getRangeAt(0).cloneRange()
          emit('select-image')
        },
      },
      '|',
      'undo',
      'redo',
    ],
    toolbarConfig: { pin: false },
    preview: {
      mode: 'editor',
      actions: [],
      theme: { current: '', path: '' },
      hljs: { enable: false },
      markdown: { sanitize: true, mathBlockPreview: false },
    },
    hint: { emoji: {}, emojiPath: '/vendor/vditor/dist/images/emoji' },
    input: flush,
    blur: flush,
    after: () => {
      if (!instance) return
      // Initialization and read-only previews must never normalize the saved draft.
      if (publishedValue !== props.modelValue) instance.setValue(toEditorMarkdown(props.modelValue), true)
      publishedValue = props.modelValue
      baseline = instance.getValue()
      instance.vditor.wysiwyg?.element.setAttribute('aria-label', '文章正文')
      instance.vditor.wysiwyg?.element.setAttribute('role', 'textbox')
      instance.vditor.wysiwyg?.element.setAttribute('aria-multiline', 'true')
      host.value?.querySelector('.vditor-toolbar')?.setAttribute('aria-label', '正文格式工具')
      host.value?.querySelector('.vditor-toolbar')?.setAttribute('role', 'toolbar')
      ready.value = true
      if (props.disabled) instance.disabled()
    },
  })
})
onBeforeUnmount(() => {
  disposed = true
  document.removeEventListener('pointerdown', flushOutside, true)
  window.removeEventListener('beforeunload', flush, true)
  // Cancel Vditor's pending callbacks before destroying its detached DOM.
  if (instance?.vditor.wysiwyg) clearTimeout(instance.vditor.wysiwyg.afterRenderTimeoutId)
  instance?.destroy()
  instance = undefined
})
</script>

<template>
  <div class="admin-rich-editor">
    <div ref="host" @paste.capture="pasteMarkdown" @input="flush" />
    <p v-if="loadError" class="admin-empty" role="alert">{{ loadError }}</p>
    <p v-else-if="!ready" class="admin-empty" role="status">正在加载正文编辑器…</p>
    <p class="admin-rich-editor-hint">支持直接粘贴 Markdown · ⌘ / Ctrl + S 保存草稿</p>
  </div>
</template>
