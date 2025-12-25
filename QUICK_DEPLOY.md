# 🚀 快速部署指南

## 一键推送脚本

### 📝 使用方法

#### 方法1：默认提交信息
```powershell
.\quick-push.ps1
```
提交信息：`chore: Quick update`

#### 方法2：自定义提交信息
```powershell
.\quick-push.ps1 "feat: Add new feature"
```

#### 方法3：特定类型的提交
```powershell
# 功能更新
.\quick-push.ps1 "feat: Add Udemy affiliate"

# Bug修复
.\quick-push.ps1 "fix: Fix broken link"

# 样式调整
.\quick-push.ps1 "style: Update button colors"

# 重构
.\quick-push.ps1 "refactor: Clean up affiliate code"

# 文档更新
.\quick-push.ps1 "docs: Update README"
```

---

## 🔧 其他常用命令

### 查看当前状态
```powershell
git status
```

### 查看提交历史
```powershell
git log --oneline -10
```

### 撤销上次提交（保留更改）
```powershell
git reset --soft HEAD~1
```

### 强制推送（谨慎使用）
```powershell
git push --force origin main
```

---

## 📦 提交信息规范

| 类型 | 说明 | 示例 |
|------|------|------|
| `feat` | 新功能 | `feat: Add new affiliate link` |
| `fix` | Bug修复 | `fix: Fix broken image` |
| `style` | 样式调整 | `style: Update header design` |
| `refactor` | 重构代码 | `refactor: Simplify affiliate logic` |
| `docs` | 文档更新 | `docs: Update affiliate guide` |
| `chore` | 杂项更新 | `chore: Update dependencies` |
| `perf` | 性能优化 | `perf: Optimize image loading` |

---

## ⚡ 快速开发流程

```powershell
# 1. 启动开发服务器
npm run dev

# 2. 修改代码...

# 3. 一键推送
.\quick-push.ps1 "feat: Your changes"

# 4. 等待2-3分钟Vercel自动部署
```

---

## 🛠️ 故障排查

### 推送失败
```powershell
# 先拉取最新代码
git pull origin main

# 解决冲突后再推送
.\quick-push.ps1 "merge: Resolve conflicts"
```

### 执行权限问题
```powershell
# 允许运行脚本（管理员权限）
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```
