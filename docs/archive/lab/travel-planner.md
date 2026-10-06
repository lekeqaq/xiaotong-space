---
experiment: '003'
title: 'AI Travel Planner'
description: '用 AI 生成个性化的周末旅行计划。'
status: 'building'
tech: ['Vue', 'LLM', 'Planning']
order: 3
icon: 'i-lucide-map'
---

## 把旅行变得简单一点

旅行规划不应只是把景点填进时间表。这个实验希望根据出发城市、预算与兴趣，生成更轻松的两天路线。

## 输入与约束

每个方案先满足时间与交通条件，再考虑偏好。缺少可靠交通数据时，输出明确的核对提示。

## 和主项目的关系

这是“逃个周末”的 AI 规划模块设计，产品构思见 [项目 Case Study](/projects/weekend)。当前未提供可验证的在线规划接口。

## 实验计划

先手动准备几个可靠的周末目的地，验证约束与输出结构，再探索工具调用。避免在事实没有来源时直接生成完整行程。
