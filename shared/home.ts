import type { HomeContent } from './content'

export const initialHome: HomeContent = {
  photos: [
    {
      id: 'coast',
      src: '/images/personal/coast.jpg',
      caption: '去有风的地方。',
      alt: '海岸、远山与开阔的海面',
    },
    {
      id: 'mountain',
      src: '/images/personal/mountain.jpg',
      caption: '偶尔，让思绪离线。',
      alt: '云层之下的雪山',
    },
    {
      id: 'camera',
      src: '/images/personal/camera.jpg',
      caption: '收集日常的小瞬间。',
      alt: '记录生活的相机',
    },
    {
      id: 'notebook',
      src: '/images/personal/notebook.jpg',
      caption: '好想法，先记下来。',
      alt: '摊开的笔记本',
    },
    {
      id: 'architecture',
      src: '/images/writing/architecture.jpg',
      caption: '抬头，也有新的风景。',
      alt: '晴空下线条分明的现代建筑',
    },
  ],
  thoughts: [
    { id: 'curious', text: '比起标准答案，\n更想做点有意思的东西。' },
    { id: 'grow', text: '先做一个小小的版本，\n再让它慢慢长大。' },
    { id: 'wander', text: '保持好奇，\n允许自己绕一点远路。' },
    { id: 'steps', text: '慢一点也没关系，\n每一步都算数。' },
    { id: 'space', text: '给生活留一点空白，\n好让灵感悄悄进来。' },
    { id: 'life', text: '认真做喜欢的事，\n也记得好好生活。' },
  ],
}
