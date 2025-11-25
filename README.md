# Meme GenAI Classifier

![来源](description.jpeg)

一个用于快速给中文文本贴梗词标签的全栈 Next.js 应用。UI 与 `/api/classify` 接口运行在同一个 Next.js 进程中，所有与 DeepSeek/OpenAI 兼容接口的通信都发生在服务器端，避免在浏览器中暴露密钥。

## 项目结构

- `backend/next-app/app` – Next.js App Router 前端页面（`page.tsx` 等）
- `backend/next-app/pages/api/classify.ts` – Next.js API 路由，负责与 DeepSeek/OpenAI 通信
- `pnpm-workspace.yaml` – workspace 配置，根目录脚本会自动代理到 Next.js 应用

## 准备工作

- Node.js 18+
- pnpm 9+（推荐通过 `corepack enable` 启用）

## 安装依赖

项目使用 `pnpm` 工作区统一管理依赖，只需要在仓库根目录运行一次安装：

```bash
pnpm install
```

## 配置环境变量

在 `backend/next-app/.env.local` 中设置：

```ini
DEEPSEEK_API_KEY=sk-your-key
DEEPSEEK_BASE_URL=https://api.deepseek.com   # 可选
ALLOWED_ORIGINS=http://localhost:3000      # 可选，限制允许访问 API 的来源
```

## 本地运行

运行一个命令即可启动完整的 Next.js 应用（页面 + API）：

```bash
pnpm run dev
```

- 浏览器访问：`http://localhost:3000`
- API 调用：`http://localhost:3000/api/classify`

同理，`pnpm run build` / `pnpm run start` / `pnpm run lint` 会直接调用 Next.js 对应脚本。

## 隐私与部署提示

- 浏览器永远不会直接触达 DeepSeek/OpenAI API，密钥只存在于服务器环境变量中。
- 可以直接将 `backend/next-app` 作为 Next.js 项目部署到 Vercel、Azure 或自托管环境。
- 如需限制可访问 API 的域名，设置 `ALLOWED_ORIGINS` 即可；若留空则默认同源访问。
