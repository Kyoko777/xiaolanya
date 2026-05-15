# [口腔简易病历管理软件] 实现计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 构建一个适配 Mac M1 的本地化、极简风格口腔病历管理 Electron 应用。

**Architecture:** 采用 Electron + Next.js (App Router) + Better-SQLite3。前端通过 IPC (Inter-Process Communication) 与主进程通信进行数据库操作。

**Tech Stack:** Electron, Next.js, Tailwind CSS, Lucide React (Icons), Better-SQLite3.

---

### Task 1: 项目初始化
**Files:**
- Create: `package.json`, `main/main.js`, `main/preload.js`, `next.config.js`
- Modify: `src/app/page.tsx`

**Step 1: 初始化项目结构**
执行 `npm init` 并安装依赖。

**Step 2: 编写 Electron 入口**
实现窗口创建逻辑，支持 M1 芯片原生架构。

**Step 3: 验证运行**
运行 `npm run dev`，确保看到基础窗口。

---

### Task 2: 数据库层实现
**Files:**
- Create: `main/db.js`
- Create: `main/schema.sql`

**Step 1: 编写数据库 Schema**
定义 Patients, Records, Snippets 表结构。

**Step 2: 初始化数据库连接**
使用 `better-sqlite3` 在用户数据目录创建 .db 文件。

---

### Task 3: 前端 UI (Bento Layout)
**Files:**
- Create: `src/components/Layout.tsx`
- Create: `src/components/Sidebar.tsx`
- Create: `src/components/Editor.tsx`

**Step 1: 实现侧边栏搜索逻辑**
**Step 2: 实现 2x2 牙位图网格**
**Step 3: 实现主诊疗区域**

---

### Task 4: 快捷指令 (Slash Commands)
**Files:**
- Create: `src/hooks/useSnippets.ts`
- Modify: `src/components/Editor.tsx`

**Step 1: 实现 / 触发监听器**
**Step 2: 实现短语库实时过滤与填入**

