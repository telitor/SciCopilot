# SciPilot

<p align="center">
  <strong>面向软件工程科研场景的 AI 智能体平台</strong>
</p>

<p align="center">
  <em>AI-powered Research Agent Platform for Software Engineering</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Status-MVP-blueviolet" />
  <img src="https://img.shields.io/badge/Frontend-React%20%2B%20TypeScript-61DAFB" />
  <img src="https://img.shields.io/badge/Backend-FastAPI-009688" />
  <img src="https://img.shields.io/badge/Database-Supabase-3ECF8E" />
  <img src="https://img.shields.io/badge/Agent-Paper%20Reading-orange" />
</p>

---

## 项目简介

**SciPilot** 是一个面向软件工程科研与学习场景的 AI 智能体平台，旨在通过大模型、知识组织、论文解析与对话式交互，辅助用户完成论文精读、科研理解、问题分析与项目规划等任务。

当前版本以 **论文精读助手** 作为首个核心 Agent，已初步打通从用户登录、论文上传、结构化分析、智能追问到消息保存的 MVP 闭环。

> SciPilot 的目标不是构建一个普通聊天工具，而是打造一个面向软件工程垂直领域的科研智能副驾驶。

---

## 核心能力

- **用户认证**：基于 Supabase Auth 实现登录与鉴权。
- **论文上传**：支持 PDF 文件上传与后端解析。
- **论文精读**：调用论文精读 Agent 生成结构化分析结果。
- **智能追问**：用户可围绕当前论文继续提问。
- **对话保存**：用户消息与 Agent 回复写入 Supabase。
- **前后端分离**：React 前端 + FastAPI 后端。
- **安全代理**：Agent API Key 仅保存在后端，前端不暴露敏感密钥。

---

## 当前闭环

```text
用户登录
  ↓
上传 PDF 论文
  ↓
后端解析论文文本
  ↓
调用论文精读 Agent
  ↓
生成结构化精读报告
  ↓
前端展示论文分析结果
  ↓
用户继续追问论文内容
  ↓
后端调用 Agent 返回回答
  ↓
Supabase 保存对话记录
```

---

## 系统架构

```text
┌──────────────────────────────┐
│            Frontend          │
│   React + TypeScript + Vite  │
│                              │
│   登录 / 论文精读 / 聊天界面   │
└───────────────┬──────────────┘
                │ REST API
                ▼
┌──────────────────────────────┐
│             Backend          │
│            FastAPI           │
│                              │
│   Auth / Chat / Paper Analyze│
└───────────────┬──────────────┘
                │
                ▼
┌──────────────────────────────┐
│            Supabase          │
│                              │
│   Auth / PostgreSQL / RLS    │
└───────────────┬──────────────┘
                │
                ▼
┌──────────────────────────────┐
│       Paper Reading Agent    │
│                              │
│   论文解析 / 精读 / 智能问答   │
└──────────────────────────────┘
```

---

## 技术栈

| 模块 | 技术 |
|---|---|
| 前端 | React, TypeScript, Vite, Tailwind CSS, Zustand, Axios |
| 后端 | FastAPI, Python, Uvicorn, Pydantic |
| 数据库 | Supabase PostgreSQL |
| 认证 | Supabase Auth |
| 权限 | Row Level Security |
| Agent | 后端统一代理论文精读 Agent |
| 文件解析 | PDF Text Extraction |

---

## 功能模块

### 1. 用户认证

- 用户登录
- Token 持久化
- 后端接口鉴权
- 当前用户信息读取

### 2. 论文精读

- PDF 上传
- 文本解析
- 结构化报告生成
- 研究背景、核心方法、实验结果、关键结论展示

### 3. 论文追问

- 基于当前论文上下文提问
- Agent 返回针对性回答
- 前端实时展示对话
- 后端保存消息记录

### 4. 对话管理

- 创建会话
- 查询会话
- 保存 user / assistant 消息
- 按 conversation_id 读取历史消息

---

## 后端接口

| 方法 | 路径 | 说明 |
|---|---|---|
| GET | `/` | Health Check |
| POST | `/auth/login` | 用户登录 |
| POST | `/auth/register` | 用户注册 |
| GET | `/users/me` | 当前用户信息 |
| GET | `/agents` | 获取 Agent 列表 |
| POST | `/conversations` | 创建对话 |
| GET | `/conversations` | 查询对话 |
| GET | `/conversations/{conversation_id}/messages` | 查询消息 |
| POST | `/chat` | Agent 对话 |
| POST | `/papers/analyze` | 论文解析与精读 |

---

## 数据库设计

```text
profiles
├── id
├── email
├── username
├── avatar_url
├── created_at
└── updated_at

agents
├── id
├── name
├── description
├── category
├── system_prompt
├── is_public
├── created_at
└── updated_at

conversations
├── id
├── user_id
├── agent_id
├── title
├── created_at
└── updated_at

messages
├── id
├── conversation_id
├── user_id
├── role
├── content
└── created_at
```

---

## 项目结构

```text
SciPilot
├── Agent
│   └── PaperReading.md
│
├── backend
│   ├── main.py
│   ├── requirements.txt
│   ├── .env.example
│   └── services
│       ├── supabase_service.py
│       ├── llm_service.py
│       └── xunfei_agent_service.py
│
├── frontend
│   ├── public
│   ├── src
│   │   ├── components
│   │   ├── pages
│   │   ├── services
│   │   ├── store
│   │   └── main.tsx
│   ├── package.json
│   ├── vite.config.ts
│   └── .env.example
│
├── supabase
│   └── migrations
│       ├── 001_init_schema.sql
│       ├── 002_updated_at_trigger.sql
│       └── 003_rls_policies.sql
│
├── docs
├── .gitignore
└── README.md
```

---

## 本地运行

### 1. 克隆项目

```bash
git clone https://github.com/telitor/SciPilot.git
cd SciPilot
```

### 2. 启动后端

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
python -m uvicorn main:app --reload
```

后端地址：

```text
http://localhost:8000
```

接口文档：

```text
http://localhost:8000/docs
```

### 3. 启动前端

```bash
cd frontend
npm install
copy .env.example .env
npm run dev
```

前端地址：

```text
http://localhost:5173
```

---

## 环境变量

### Backend `.env`

```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

XF_AGENT_APP_ID=your_app_id
XF_AGENT_API_KEY=your_api_key
XF_AGENT_API_SECRET=your_api_secret
XF_AGENT_ASSISTANT_ID=your_assistant_id
```

### Frontend `.env`

```env
VITE_API_BASE_URL=http://localhost:8000
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

---

## 当前进度

| 功能 | 状态 |
|---|---|
| 项目结构搭建 | 已完成 |
| Supabase 数据库设计 | 已完成 |
| RLS 权限策略 | 已完成 |
| FastAPI 基础接口 | 已完成 |
| 用户登录鉴权 | 已完成 |
| Agent 列表接口 | 已完成 |
| 会话与消息接口 | 已完成 |
| 论文精读 Agent 接入 | 已完成 |
| PDF 上传与解析 | 已初步完成 |
| 论文结构化展示 | 已初步完成 |
| 右侧论文追问 | 已初步完成 |
| 重新上传论文 | 已初步完成 |
| 前后端小闭环 | 已跑通 |

---

## 后续规划

- 优化 PDF 解析稳定性
- 提升 Agent JSON 输出稳定性
- 增加论文历史记录
- 增加论文长期上下文保存
- 支持更多科研 Agent
- 引入代码解释与实验复现能力
- 优化前端交互体验
- 完善部署与软著材料

---

## 安全原则

本项目遵循前后端密钥隔离原则：

- 前端只使用 Supabase anon key
- 后端保存 service role key 与 Agent secret
- `.env` 文件不提交 GitHub
- Agent 调用统一由 FastAPI 后端代理
- 前端不直接访问任何大模型密钥

---

## 项目特色

- 面向软件工程科研场景
- 首个 Agent 聚焦论文精读
- 前后端分离架构清晰
- Supabase 提供认证与数据库能力
- FastAPI 统一管理业务接口
- 具备多 Agent 扩展潜力
- 已完成 MVP 小闭环验证

---

## 开发状态

```text
当前阶段：MVP 小闭环验证
当前核心 Agent：论文精读助手
当前状态：本地联调通过，持续迭代中
```

---

<p align="center">
  <strong>SciPilot · 让 AI 成为科研学习过程中的智能副驾驶</strong>
</p>
