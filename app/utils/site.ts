export const navigation = [
  { label: 'Home', to: '/' },
  { label: 'Projects', to: '/projects' },
  { label: 'Writing', to: '/writing' },
  { label: 'About', to: '/about' },
]

export const journey = [
  {
    title: '从前端出发',
    description: '用 Vue 和 TypeScript，把页面与交互做好。',
    note: '日常开发',
    icon: 'i-lucide-code-xml',
  },
  {
    title: '试着接入 AI',
    description: '从具体问题开始，学习模型与语音的连接。',
    note: '动手尝试',
    icon: 'i-lucide-sparkles',
  },
  {
    title: '做两个小项目',
    description: '逃个周末、声伴，一点点打磨使用体验。',
    note: '继续完善',
    icon: 'i-lucide-blocks',
  },
  {
    title: '慢慢走向全栈',
    description: '从页面到接口、数据与部署，把完整链路串起来。',
    note: '拓宽边界',
    icon: 'i-lucide-layers',
  },
  {
    title: '边做，边记录',
    description: '把遇到的问题和学到的东西，留在这里。',
    note: '保持好奇',
    icon: 'i-lucide-notebook-pen',
  },
]

export function formatDate(date: string) {
  return date.replaceAll('-', '.')
}
