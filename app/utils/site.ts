export const navigation = [
  { label: 'Home', to: '/' },
  { label: 'Projects', to: '/projects' },
  { label: 'Writing', to: '/writing' },
  { label: 'AI Lab', to: '/lab' },
  { label: 'About', to: '/about' },
]

export const journey = [
  { year: '2021', title: 'Frontend', skills: ['Vue', 'TypeScript'] },
  { year: '2022', title: '工程化', skills: ['组件库', '性能优化'] },
  { year: '2023', title: '全栈探索', skills: ['Python', 'Docker'] },
  { year: '2024', title: 'AI 兴趣萌芽', skills: ['LLM', 'Prompt'] },
  { year: '2025', title: '开始实践', skills: ['RAG', 'AI 应用'] },
  { year: '2026', title: 'Agent', skills: ['构建有趣的产品', 'Still exploring…'] },
]

export function formatDate(date: string) {
  return date.replaceAll('-', '.')
}
