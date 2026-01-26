# 部署指南

本项目是一个标准的 Vite + React 应用，可以轻松部署到各种静态网站托管服务上。以下是几种推荐的部署方案：

## 方案 1: 使用 Vercel (推荐)

Vercel 是部署前端应用最简单、最快捷的方式，对 Vite 支持极好。

1.  **准备代码**：确保你的代码已经提交到 GitHub、GitLab 或 Bitbucket。
2.  **注册/登录**：访问 [Vercel](https://vercel.com/) 并使用你的代码托管账号登录。
3.  **新建项目**：
    *   在 Vercel 控制台点击 "Add New..." -> "Project"。
    *   导入你的 Git 仓库 (`small_games`)。
4.  **配置**：
    *   **Framework Preset**: 选择 `Vite`。
    *   **Root Directory**: 保持默认 (或者 `./` )。
    *   **Build Command**: `npm run build` (默认)。
    *   **Output Directory**: `dist` (默认)。
5.  **部署**：点击 "Deploy"。等待一分钟左右，你的应用就会上线，并获得一个免费的 HTTPS 域名。

## 方案 2: 使用 Netlify

Netlify 是另一个非常流行的静态托管服务，支持拖拽部署和 Git 集成。

### 方法 A: Git 集成 (推荐)
1.  登录 [Netlify](https://www.netlify.com/)。
2.  点击 "Add new site" -> "Import from existing project"。
3.  连接你的 Git 提供商 (GitHub 等)。
4.  选择你的仓库。
5.  构建设置通常会自动检测：
    *   **Build command**: `npm run build`
    *   **Publish directory**: `dist`
6.  点击 "Deploy site"。

### 方法 B: 拖拽部署 (无需 Git)
1.  在本地运行构建命令：
    ```bash
    npm run build
    ```
2.  这会生成一个 `dist` 文件夹。
3.  登录 Netlify，在 "Sites" 页面，直接把本地的 `dist` 文件夹拖拽到浏览器窗口中。
4.  几秒钟后即可上线。

## 方案 3: GitHub Pages

如果你想直接托管在 GitHub 上：

1.  **修改配置**：
    打开 `vite.config.ts`，添加 `base` 配置。
    *   如果是部署到 `https://<USERNAME>.github.io/<REPO>/`，设置为：
        ```typescript
        export default defineConfig({
          base: '/<REPO>/', // 例如 '/small_games/'
          plugins: [react(), tailwindcss()],
        })
        ```
    *   如果是部署到用户主页 `https://<USERNAME>.github.io/`，则不需要修改或设置为 `'/'`。

2.  **安装部署脚本** (可选但推荐)：
    安装 `gh-pages` 包：
    ```bash
    npm install gh-pages --save-dev
    ```

3.  **修改 `package.json`**：
    在 `scripts` 中添加：
    ```json
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist"
    ```

4.  **部署**：
    运行命令：
    ```bash
    npm run deploy
    ```

## 方案 4: 传统服务器 (Nginx/Apache)

如果你有自己的 Linux 服务器：

1.  **构建项目**：
    ```bash
    npm run build
    ```
2.  **上传文件**：
    将生成的 `dist` 目录中的所有文件上传到服务器的 Web 目录（例如 `/var/www/html`）。
3.  **配置 Nginx**：
    确保配置了 SPA 的路由重定向（如果你的应用有多页路由），虽然本项目目前主要是单页游戏，但加上这个配置是个好习惯：
    ```nginx
    server {
        listen 80;
        server_name your-domain.com;
        root /var/www/html;
        index index.html;

        location / {
            try_files $uri $uri/ /index.html;
        }
    }
    ```
