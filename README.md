<div align="center">

# 🚀 SciCopilot

### 面向软件工程学科的智能体学习与项目辅助平台

**Software Engineering · AI Agents · Learning Assistant · Project Copilot**

<br/>

![Version](https://img.shields.io/badge/version-v0.1%20MVP-blue)
![Status](https://img.shields.io/badge/status-planning%20%26%20initial%20development-orange)
![Backend](https://img.shields.io/badge/backend-FastAPI-009688)
![Database](https://img.shields.io/badge/database-Supabase-3ECF8E)
![Frontend](https://img.shields.io/badge/frontend-React%20%2F%20Next.js-black)
![License](https://img.shields.io/badge/license-TBD-lightgrey)

<br/>

> SciCopilot is an AI-powered vertical platform for Software Engineering.  
> The first version focuses on a clean and reliable MVP: **login, agent list, chat, conversation history, and data persistence**.

</div>

---

## 📌 Table of Contents

- [1. Product Vision](#1-product-vision)
- [2. MVP Definition](#2-mvp-definition)
- [3. Core User Flow](#3-core-user-flow)
- [4. Feature Scope](#4-feature-scope)
- [5. System Architecture](#5-system-architecture)
- [6. Tech Stack](#6-tech-stack)
- [7. Data Model](#7-data-model)
- [8. API Design](#8-api-design)
- [9. Project Structure](#9-project-structure)
- [10. Environment Variables](#10-environment-variables)
- [11. Local Development](#11-local-development)
- [12. Security Notes](#12-security-notes)
- [13. Development Roadmap](#13-development-roadmap)
- [14. Team Responsibility](#14-team-responsibility)
- [15. Product Principles](#15-product-principles)

---

## 1. Product Vision

**SciCopilot** 希望成为一个面向软件工程学习与软件项目开发的垂直领域智能平台。

它不是一个普通的通用聊天机器人，而是围绕软件工程学科中的真实学习与开发任务，提供专业化、结构化、可追溯的智能体服务。

第一版不追求复杂功能堆叠，而是先建立一个稳定的产品底座：

```text
用户系统
  ↓
智能体入口
  ↓
聊天交互
  ↓
数据保存
  ↓
历史记录
  ↓
权限隔离
```

当这个闭环稳定之后，后续才能自然扩展到知识库问答、项目分析、多智能体协作、代码仓库理解等高级能力。

---

## 2. MVP Definition

当前版本为：

```text
SciCopilot v0.1 MVP
```

### MVP 目标

第一版只解决一个核心问题：

> 让用户能够登录平台，选择一个软件工程方向智能体，与其对话，并在下次登录时继续查看历史记录。

### MVP 成功标准

只要完成以下 7 件事，第一版就算成功：

| No. | Capability | Success Criteria |
| --- | --- | --- |
| 1 | 用户认证 | 用户可以注册、登录、退出 |
| 2 | 智能体列表 | 用户登录后可以看到预设智能体 |
| 3 | 创建对话 | 用户可以选择智能体并开启新对话 |
| 4 | AI 回复 | 用户发送消息后可以收到模型回复 |
| 5 | 消息保存 | 用户消息和 AI 回复都能保存到数据库 |
| 6 | 历史记录 | 用户刷新页面或重新登录后仍能查看历史对话 |
| 7 | 权限隔离 | 不同用户不能访问彼此的对话数据 |

---

## 3. Core User Flow

### 3.1 User Journey

```text
Open SciCopilot
      ↓
Register / Login
      ↓
Enter Dashboard
      ↓
Choose an Agent
      ↓
Start Conversation
      ↓
Send Message
      ↓
Receive AI Reply
      ↓
Conversation Saved
      ↓
Reopen History Later
```

### 3.2 MVP Product Pages

| Page | Route | Description |
| --- | --- | --- |
| Login | `/login` | 用户登录 |
| Register | `/register` | 用户注册 |
| Dashboard | `/` or `/dashboard` | 智能体列表与产品入口 |
| Chat | `/chat/:conversationId` | 对话页面 |
| History | Integrated in chat sidebar | 历史对话侧边栏 |

---

## 4. Feature Scope

## 4.1 In Scope

第一版必须完成的功能：

### Authentication

- Email 注册
- Email 登录
- 退出登录
- 获取当前登录用户

### Agent List

第一版预设 3 个智能体：

| Agent | Purpose |
| --- | --- |
| 软件工程学习助手 | 解释软件工程课程知识 |
| 代码解释助手 | 解释代码、分析报错、给出修改建议 |
| 项目规划助手 | 拆解项目功能、规划技术路线、设计模块 |

### Chat

- 创建新对话
- 发送用户消息
- 调用大模型生成回复
- 展示 AI 回复
- 保存完整消息记录

### Conversation History

- 查看历史对话列表
- 打开历史对话
- 继续已有对话

### Permission Control

- 用户只能读取自己的 conversations
- 用户只能读取自己的 messages
- 用户不能访问其他用户的私有数据

---

## 4.2 Out of Scope for v0.1

为了保证第一版可以快速落地，以下功能暂不进入 v0.1：

| Feature | Reason |
| --- | --- |
| 多智能体协作 | 需要更复杂的任务编排 |
| RAG 知识库 | 需要文件解析、切块、向量检索 |
| PDF 上传问答 | 依赖 Storage 与文档解析链路 |
| GitHub 仓库分析 | 需要代码解析与权限处理 |
| 团队空间 | 需要组织、角色、邀请系统 |
| 付费系统 | 与 MVP 核心闭环无关 |
| 管理员后台 | 后续可独立扩展 |

---

## 5. System Architecture

### 5.1 MVP Architecture

```text
┌────────────────────────────────────┐
│              Frontend              │
│       React / Next.js Client        │
│                                    │
│  Login · Dashboard · Chat · History │
└─────────────────┬──────────────────┘
                  │
                  │ Auth / API Request
                  ▼
┌────────────────────────────────────┐
│             Supabase               │
│                                    │
│  Auth · PostgreSQL · RLS · Storage  │
└─────────────────┬──────────────────┘
                  │
                  │ User Data / Chat Data
                  ▼
┌────────────────────────────────────┐
│             FastAPI Backend         │
│                                    │
│  Chat API · Agent Logic · LLM Call   │
└─────────────────┬──────────────────┘
                  │
                  │ Prompt + User Message
                  ▼
┌────────────────────────────────────┐
│              LLM API                │
│                                    │
│  OpenAI / DeepSeek / Qwen / Others  │
└────────────────────────────────────┘
```

### 5.2 Backend Responsibility

FastAPI 后端在第一版中只做必要逻辑：

```text
1. 接收用户消息
2. 验证用户身份
3. 获取对应智能体 system_prompt
4. 保存用户消息
5. 调用大模型
6. 保存 AI 回复
7. 返回结果给前端
```

---

## 6. Tech Stack

### 6.1 Frontend

| Technology | Usage |
| --- | --- |
| React / Next.js | 页面与路由 |
| TypeScript | 类型安全 |
| Tailwind CSS | UI 样式 |
| Supabase JS SDK | 登录与数据访问 |

### 6.2 Backend

| Technology | Usage |
| --- | --- |
| Python | 后端主要语言 |
| FastAPI | 后端 API 服务 |
| Uvicorn | 本地后端运行 |
| Supabase Python SDK | 访问 Supabase 数据 |
| LLM API SDK / HTTP Client | 调用大模型 |

### 6.3 Cloud & Data

| Technology | Usage |
| --- | --- |
| Supabase Auth | 用户认证 |
| Supabase PostgreSQL | 业务数据库 |
| Supabase RLS | 数据权限控制 |
| Supabase Storage | 后续文件存储 |
| GitHub | 代码版本管理 |

---

## 7. Data Model

第一版只保留最小必要数据模型。

### 7.1 Entity Relationship

```text
auth.users
    │
    │ 1 : 1
    ▼
profiles

auth.users
    │
    │ 1 : many
    ▼
conversations
    │
    │ 1 : many
    ▼
messages

agents
    │
    │ 1 : many
    ▼
conversations
```

---

### 7.2 `profiles`

用户资料表，用于保存 Supabase Auth 之外的扩展信息。

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| id | uuid | Yes | 对应 Supabase Auth 用户 ID |
| username | text | No | 用户名 |
| avatar_url | text | No | 用户头像 |
| role | text | Yes | 用户角色，默认 `user` |
| created_at | timestamptz | Yes | 创建时间 |

---

### 7.3 `agents`

智能体表，保存第一版平台内置智能体配置。

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| id | uuid | Yes | 智能体 ID |
| name | text | Yes | 智能体名称 |
| description | text | No | 智能体介绍 |
| system_prompt | text | Yes | 智能体系统提示词 |
| category | text | No | 分类 |
| is_public | boolean | Yes | 是否公开 |
| created_at | timestamptz | Yes | 创建时间 |

#### Initial Agents

| Name | Category | Description |
| --- | --- | --- |
| 软件工程学习助手 | `software-engineering` | 解释软件工程课程知识 |
| 代码解释助手 | `coding` | 解释代码、分析报错、提出修改建议 |
| 项目规划助手 | `project-planning` | 拆解项目、规划技术路线与模块 |

---

### 7.4 `conversations`

对话表，用于保存一次完整聊天会话。

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| id | uuid | Yes | 对话 ID |
| user_id | uuid | Yes | 所属用户 |
| agent_id | uuid | Yes | 使用的智能体 |
| title | text | No | 对话标题 |
| created_at | timestamptz | Yes | 创建时间 |
| updated_at | timestamptz | Yes | 更新时间 |

---

### 7.5 `messages`

消息表，用于保存每一条用户消息和 AI 回复。

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| id | uuid | Yes | 消息 ID |
| conversation_id | uuid | Yes | 所属对话 |
| user_id | uuid | Yes | 所属用户 |
| role | text | Yes | `user` / `assistant` / `system` |
| content | text | Yes | 消息内容 |
| created_at | timestamptz | Yes | 创建时间 |

---

## 8. API Design

### 8.1 Health Check

```http
GET /
```

Response:

```json
{
  "status": "ok",
  "service": "SciCopilot Backend"
}
```

---

### 8.2 Get Agents

```http
GET /agents
```

Description:

获取所有公开智能体。

Response:

```json
[
  {
    "id": "agent_id",
    "name": "软件工程学习助手",
    "description": "帮助用户学习软件工程课程知识",
    "category": "software-engineering"
  }
]
```

---

### 8.3 Create Conversation

```http
POST /conversations
```

Request:

```json
{
  "agent_id": "agent_id",
  "title": "新的对话"
}
```

Response:

```json
{
  "id": "conversation_id",
  "agent_id": "agent_id",
  "title": "新的对话",
  "created_at": "2026-07-06T00:00:00Z"
}
```

---

### 8.4 Get Conversation List

```http
GET /conversations
```

Description:

获取当前用户的历史对话列表。

Response:

```json
[
  {
    "id": "conversation_id",
    "agent_id": "agent_id",
    "title": "需求分析学习",
    "updated_at": "2026-07-06T00:00:00Z"
  }
]
```

---

### 8.5 Get Messages

```http
GET /conversations/{conversation_id}/messages
```

Description:

获取某个对话中的完整消息记录。

Response:

```json
[
  {
    "id": "message_id",
    "role": "user",
    "content": "什么是需求分析？",
    "created_at": "2026-07-06T00:00:00Z"
  },
  {
    "id": "message_id",
    "role": "assistant",
    "content": "需求分析是软件工程中的关键阶段……",
    "created_at": "2026-07-06T00:00:00Z"
  }
]
```

---

### 8.6 Chat

```http
POST /chat
```

Description:

发送用户消息，调用对应智能体生成回复，并保存完整消息记录。

Request:

```json
{
  "conversation_id": "conversation_id",
  "agent_id": "agent_id",
  "message": "请解释一下软件工程中的需求分析"
}
```

Backend workflow:

```text
1. Validate current user
2. Validate conversation ownership
3. Fetch agent system_prompt
4. Insert user message into messages table
5. Call LLM API
6. Insert assistant reply into messages table
7. Update conversation updated_at
8. Return assistant reply
```

Response:

```json
{
  "reply": "需求分析是软件工程中的重要阶段，它的目标是明确系统应该做什么……"
}
```

---

## 9. Project Structure

推荐第一版项目结构如下：

```text
SciCopilot/
│
├── frontend/
│   ├── app/
│   ├── components/
│   ├── lib/
│   ├── package.json
│   └── README.md
│
├── backend/
│   ├── main.py
│   ├── requirements.txt
│   ├── .env.example
│   └── services/
│       ├── llm_service.py
│       └── supabase_service.py
│
├── supabase/
│   ├── migrations/
│   └── config.toml
│
├── docs/
│   ├── api.md
│   └── database.md
│
├── README.md
└── .gitignore
```

### Directory Responsibility

| Directory | Responsibility |
| --- | --- |
| `frontend/` | 前端页面、组件、样式与 Supabase Client |
| `backend/` | FastAPI 服务、大模型调用、业务接口 |
| `supabase/` | Supabase 配置与数据库迁移 |
| `docs/` | 接口文档、数据库说明、产品说明 |
| `README.md` | 项目入口说明 |

---

## 10. Environment Variables

### 10.1 Backend `.env`

Create a `.env` file in `backend/`.

```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

LLM_API_KEY=your_llm_api_key
LLM_BASE_URL=your_llm_base_url
LLM_MODEL=your_model_name
```

### 10.2 Frontend `.env.local`

Create a `.env.local` file in `frontend/`.

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

### 10.3 Important Rule

```text
.env files must never be committed to GitHub.
service_role key must never be exposed to frontend code.
```

---

## 11. Local Development

### 11.1 Clone Repository

```bash
git clone https://github.com/telitor/SciCopilot.git
cd SciCopilot
```

---

### 11.2 Backend Setup

```bash
cd backend
python -m venv .venv
```

Activate virtual environment:

Windows:

```bash
.venv\Scripts\activate
```

macOS / Linux:

```bash
source .venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Run backend:

```bash
uvicorn main:app --reload
```

Default backend URL:

```text
http://localhost:8000
```

---

### 11.3 Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Default frontend URL:

```text
http://localhost:3000
```

---

### 11.4 Supabase Setup

Basic workflow:

```text
1. Create a Supabase project
2. Configure Auth
3. Create database tables
4. Enable RLS
5. Add initial agents
6. Connect frontend and backend
```

---

## 12. Security Notes

Security is part of the MVP, not a later feature.

### 12.1 API Key Boundary

| Key | Where to Use | Safe in Frontend? |
| --- | --- | --- |
| Supabase anon key | Frontend / Backend | Yes, with RLS |
| Supabase service_role key | Backend only | No |
| LLM API key | Backend only | No |

### 12.2 RLS Rules

Private tables must enable RLS:

| Table | RLS Required | Rule |
| --- | --- | --- |
| `profiles` | Yes | User can access own profile |
| `conversations` | Yes | User can access own conversations |
| `messages` | Yes | User can access own messages |
| `agents` | Optional | Public agents can be readable |

### 12.3 Minimum Security Requirements

- Do not commit `.env`
- Do not expose service keys
- Do not allow users to read other users' conversations
- Validate conversation ownership before chat
- Store AI messages with the correct `user_id`

---

## 13. Development Roadmap

### Phase 1 — Product Foundation

- [ ] Create GitHub repository
- [ ] Write initial README
- [ ] Decide project structure
- [ ] Create Supabase project
- [ ] Create frontend and backend directories

### Phase 2 — Supabase Base

- [ ] Create `profiles` table
- [ ] Create `agents` table
- [ ] Create `conversations` table
- [ ] Create `messages` table
- [ ] Insert initial agents
- [ ] Configure Supabase Auth
- [ ] Enable RLS for private tables

### Phase 3 — Backend MVP

- [ ] Create FastAPI app
- [ ] Add health check API
- [ ] Add agent list API
- [ ] Add conversation API
- [ ] Add message API
- [ ] Add chat API
- [ ] Connect LLM API
- [ ] Save user and assistant messages

### Phase 4 — Frontend MVP

- [ ] Build login page
- [ ] Build register page
- [ ] Build dashboard page
- [ ] Build agent cards
- [ ] Build chat page
- [ ] Build message list
- [ ] Build conversation sidebar
- [ ] Connect frontend with backend

### Phase 5 — MVP Polish

- [ ] Loading state
- [ ] Error handling
- [ ] Empty state
- [ ] Basic responsive layout
- [ ] README update
- [ ] Demo screenshots
- [ ] Deployment preparation

---

## 14. Team Responsibility

### Backend

Responsible for:

- Supabase database design
- Auth and RLS configuration
- FastAPI backend service
- LLM API integration
- Chat data persistence
- API documentation

### Frontend

Responsible for:

- Login / register page
- Dashboard page
- Agent list UI
- Chat interface
- Conversation history sidebar
- API integration

### AI / Product

Responsible for:

- Agent role definition
- System prompt writing
- Software engineering knowledge organization
- MVP workflow design
- Future feature planning

---

## 15. Product Principles

SciCopilot v0.1 follows these principles:

### 15.1 Small but Complete

第一版不追求功能多，而追求闭环完整。

```text
能登录
能选择智能体
能聊天
能保存
能查看历史
```

### 15.2 Data First

聊天产品的核心不是只返回一句 AI 回复，而是要有完整的数据结构：

```text
User
Agent
Conversation
Message
```

这些结构稳定后，后续功能才能扩展。

### 15.3 Security by Default

用户私有数据必须默认隔离。  
RLS 和后端权限校验是基础能力，不是可选项。

### 15.4 AI Logic Behind Backend

大模型 API Key 不出现在前端。  
所有 AI 调用都应该经过后端服务。

### 15.5 Build for Iteration

v0.1 只做基础功能，但项目结构要允许后续扩展：

```text
v0.1 Basic Chat Platform
v0.2 Knowledge Base
v0.3 Multi-Agent Workflow
v0.4 Project Workspace
```

---

<div align="center">

## SciCopilot v0.1

**Start small. Build the loop. Then scale the intelligence.**

</div>
