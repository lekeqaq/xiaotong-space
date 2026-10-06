import { parseMarkdown } from '@nuxtjs/mdc/runtime'
import type { MDCNode } from '@nuxtjs/mdc'
import type { Article, RenderedArticle } from '../../shared/admin'
const allowed = new Set(
  'p div span a blockquote code pre em h1 h2 h3 h4 h5 h6 hr img ul ol li strong table thead tbody td th tr br del sup sub content-callout'.split(
    ' ',
  ),
)
export async function renderArticle(article: Article): Promise<RenderedArticle> {
  const parsed = await parseMarkdown(article.markdown, {
    highlight: {
      theme: { default: 'github-light', dark: 'github-dark' },
    },
    toc: { depth: 3, searchDepth: 3 },
  })
  function sanitize(node: MDCNode) {
    if (node.type === 'element') {
      if (['script', 'style'].includes(node.tag)) node.children = []
      if (!allowed.has(node.tag)) {
        node.tag = 'div'
        node.props = {}
      }
      node.props ||= {}
      for (const key of Object.keys(node.props)) {
        const value = String(node.props[key])
        if (
          /^(on|@|:|v-)/i.test(key) ||
          ['srcdoc', 'is'].includes(key) ||
          (['href', 'src', 'xlink:href'].includes(key) && !/^(https?:\/\/|\/(?!\/)|#|mailto:)/i.test(value))
        )
          Reflect.deleteProperty(node.props, key)
      }
    }
    if ('children' in node) node.children.forEach(sanitize)
  }
  parsed.body.children.forEach(sanitize)
  return {
    ...article,
    body: { ...parsed.body, toc: parsed.toc || { title: '', depth: 3, searchDepth: 3, links: [] } },
  }
}
