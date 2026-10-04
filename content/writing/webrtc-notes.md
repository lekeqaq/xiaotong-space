---
title: "WebRTC 到底是怎么工作的？"
description: "从连接建立到媒体传输，整理一次实时通信链路中的核心概念。"
date: "2026-09-11"
cover: "/images/writing/headphones.jpg"
tags: ["WebRTC", "Network"]
category: "Engineering"
draft: false
featured: true
readingTime: 5
---

## 从一次通话开始

WebRTC 提供浏览器间实时传输音视频和数据的能力。实际建立连接时，仍然需要交换双方的信息，并找到网络中可用的传输路径。

这篇笔记整理前端接入时的基本心智模型，避免把“实时通信”理解为一个只需调用一次的 API。

## 信令负责交换信息

信令不是 WebRTC 自带的固定协议。应用需要通过自己的通道交换 offer、answer 和网络候选信息。WebSocket 是常见选择，但不是唯一方案。

信令传输连接描述，媒体传输则由 WebRTC 的连接完成，两者承担不同职责。

## 连接描述与候选地址

SDP 描述媒体能力与会话参数，ICE 候选用于寻找双方可连接的网络路径。STUN 帮助了解公网映射信息，无法直接连接时可通过 TURN 中继。

```ts
const connection = new RTCPeerConnection({
  iceServers: [], // 部署时填写实际的 STUN / TURN 配置
})

connection.addEventListener('connectionstatechange', () => {
  console.log(connection.connectionState)
})
```

代码只是连接对象的起点。实际应用还需要媒体授权、信令协商、候选交换、异常恢复与资源清理。

## 观察状态，而不是猜测

连接失败可能来自信令消息、候选处理、网络策略或设备权限。把连接状态变化、ICE 状态和错误记录下来，比单纯延长重试时间更容易定位问题。

## 离开页面时清理

媒体轨道需要停止，连接对象需要关闭，信令监听也应解除。否则可能出现页面已经离开但麦克风仍在工作的问题。

```ts
function cleanup(stream: MediaStream, peer: RTCPeerConnection) {
  stream.getTracks().forEach(track => track.stop())
  peer.close()
}
```

## 下一次实践的重点

用两个页面建立最小通信链路，分别观察同一网络、不同网络和受限网络下的行为。把每个环节拆开验证，实时通信会更容易理解。

参考：[MDN WebRTC API](https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API)。
