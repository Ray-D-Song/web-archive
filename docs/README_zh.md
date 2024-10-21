## Web Archive
Web Archive 是一个网页归档工具，包含以下几个部分：

- 浏览器插件：将网页保存为快照，并上传到服务端。
- 服务端：   接收浏览器插件上传的快照，并存储在数据库和存储桶中。
- web 客户端： 查询快照并展示。

服务端基于 Cloudflare Worker 的全套服务，包含 D1 数据库、R2 存储桶。

## 部署指南
部署要求本地安装了 node 环境。

### 1. 登录
```bash
npx wrangler login
```

### 2. 创建 r2 存储桶
```bash
npx wrangler r2 bucket create web-archive
```
成功输出：
```bash
 ⛅️ wrangler 3.78.10 (update available 3.80.4)
--------------------------------------------------------

Creating bucket web-archive with default storage class set to Standard.
Created bucket web-archive with default storage class set to Standard.
```

### 3. 创建 d1 数据库
```bash
# 创建数据库
npx wrangler d1 create web-archive
```

执行输出：

```bash
 ⛅️ wrangler 3.78.10 (update available 3.80.4)
--------------------------------------------------------

✅ Successfully created DB 'web-archive' in region UNKNOWN
Created your new D1 database.

[[d1_databases]]
binding = "DB" # i.e. available in your Worker on env.DB
database_name = "web-archive"
database_id = "xxxx-xxxx-xxxx-xxxx-xxxx"
```
拷贝最后一行，替换 `wrangler.toml` 文件中 `database_id` 的值。

然后执行初始化 sql:
```bash
npx wrangler d1 execute web-archive --remote --file=./init.sql
```

成功输出：
```bash
🌀 Executing on remote database web-archive (7fd5a5ce-79e7-4519-a5fb-2f9a3af71064):
🌀 To execute on your local development database, remove the --remote flag from your wrangler command.
Note: if the execution fails to complete, your DB will return to its original state and you can safely retry.
├ 🌀 Uploading 7fd5a5ce-79e7-4519-a5fb-2f9a3af71064.0a40ff4fc67b5bdf.sql
│ 🌀 Uploading complete.
│
🌀 Starting import...
🌀 Processed 9 queries.
🚣 Executed 9 queries in 0.00 seconds (13 rows read, 13 rows written)
   Database is currently at bookmark 00000001-00000005-00004e2b-c977a6f2726e175274a1c75055c23607.
┌────────────────────────┬───────────┬──────────────┬────────────────────┐
│ Total queries executed │ Rows read │ Rows written │ Database size (MB) │
├────────────────────────┼───────────┼──────────────┼────────────────────┤
│ 9                      │ 13        │ 13           │ 0.04               │
└────────────────────────┴───────────┴──────────────┴────────────────────┘
```
### 4. 修改 BEARER_TOKEN
BEARER_TOKEN 是访问 web-archive 的凭证，相当于密码，修改 `wrangler.toml` 文件中 `BEARER_TOKEN` 的值。

### 5. 部署服务
```bash
# 部署服务
npx wrangler pages deploy
```

成功输出：
```bash
The project you specified does not exist: "web-archive". Would you like to create it?
❯ Create a new project
✔ Enter the production branch name: … dev
✨ Successfully created the 'web-archive' project.
▲ [WARNING] Warning: Your working directory is a git repo and has uncommitted changes

  To silence this warning, pass in --commit-dirty=true

🌎  Uploading... (3/3)

✨ Success! Uploaded 3 files (3.29 sec)

✨ Compiled Worker successfully
✨ Uploading Worker bundle
✨ Uploading _routes.json
🌎 Deploying...
✨ Deployment complete! Take a peek over at https://web-archive-xxxx.pages.dev
```
