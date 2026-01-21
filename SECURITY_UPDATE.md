# Neon 数据库密码更新指南

## 步骤 1：登录 Neon 控制面板
1. 访问 https://console.neon.tech
2. 使用您的 GitHub/Google 账户登录
3. 选择您的项目

## 步骤 2：重置数据库密码
1. 在左侧菜单中找到 "SQL Editor" 或 "Users" 部分
2. 找到数据库用户 "neondb_owner"
3. 点击 "Reset password" 或类似选项
4. 复制新的密码

## 步骤 3：更新本地配置
1. 打开 `.env.development.local` 文件
2. 更新 DATABASE_URL 中的密码部分：
   ```
   postgresql://neondb_owner:【NEW_PASSWORD】@host/database?sslmode=require...
   ```
3. 同时更新 `.env.local` 和 `.env.production.local`

## 步骤 4：测试连接
重启 API 服务器并测试是否能连接到数据库：
```bash
cd nest-api
npm run start:dev
```

如果看到 API 正常启动（无数据库连接错误），说明更新成功。
