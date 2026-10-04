---
title: "逃个周末"
subtitle: "AI Weekend Planner"
description: "用 AI 把复杂的旅行攻略，变成两天就能执行的松弛周末。"
year: 2026
cover: "/images/personal/coast.jpg"
tech: ["Vue 3", "UniApp", "FastAPI", "LLM"]
featured: true
status: "building"
order: 1
kind: "travel"
---

::content-callout{title="项目说明"}
这是首版作品集的示例 Case Study，记录产品设计与技术方案。产品尚未提供可验证的在线 Demo，界面为概念预览。
::

## 一个小小的出发点

周末只有两天，但找到合适的目的地、比较交通、整理景点与餐馆，常常消耗掉期待旅行的心情。逃个周末希望回答一个更简单的问题：从我所在的城市出发，这个周末可以去哪里？

目标不是生成尽可能多的行程，而是在时间、预算和兴趣的约束里，给出少量可以执行的选择。

## 产品如何工作

1. 选择出发城市、周末日期与出行方式。
2. 告诉系统你想去山里、海边，还是换一座城市散步。
3. 查看两到三个目的地方案，先比较通勤成本，再决定行程。
4. 保存一份可调整的两天路线，保留充足的自由时间。

## 技术选择

前端方案采用 Vue 3 与 UniApp，将目的地卡片、行程编辑与状态反馈拆成独立组件。TypeScript 描述行程数据，避免模型返回内容直接进入渲染层。

未来的旅行产品服务计划使用 FastAPI；它属于本示例产品的技术设计，不是当前作品集网站的运行依赖。当前网站由 Nuxt Content 维护全部静态内容。

## 把 AI 放在合适的位置

LLM 适合解释偏好与组织路线，但交通时间、地点是否营业等事实需要可信数据来源。方案先进行约束校验，再生成说明。缺少数据时明确标记，避免把推测包装成事实。

```ts
interface WeekendPlan {
  city: string
  days: 2
  budget: number
  interests: string[]
  stops: Array<{ name: string; day: 1 | 2; verified: boolean }>
}
```

## 下一步

先验证从深圳出发的少量目的地，再完善路线调整与保存体验。效果将通过计划可执行性、生成耗时与访客反馈评估，而不是仅比较输出文字长度。

> 周末不赶路，只去有意思的地方。
