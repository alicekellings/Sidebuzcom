# Quick Push Script for SideBuz.com
# 一键推送脚本 - 自动执行 git add, commit, push

param(
    [string]$message = "chore: Quick update"
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  SideBuz.com Quick Push Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 1. Git Add
Write-Host "[1/3] Adding files..." -ForegroundColor Yellow
git add .
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Git add failed!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Files added" -ForegroundColor Green
Write-Host ""

# 2. Git Commit
Write-Host "[2/3] Committing changes..." -ForegroundColor Yellow
Write-Host "Message: $message" -ForegroundColor Gray
git commit -m "$message"
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  No changes to commit or commit failed" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Checking git status..." -ForegroundColor Gray
    git status
    exit 0
}
Write-Host "✅ Changes committed" -ForegroundColor Green
Write-Host ""

# 3. Git Push
Write-Host "[3/3] Pushing to GitHub..." -ForegroundColor Yellow
git push origin main
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Push failed!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Successfully pushed to GitHub!" -ForegroundColor Green
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  ✨ Deployment Complete!" -ForegroundColor Green
Write-Host "  Vercel will auto-deploy in 2-3 minutes" -ForegroundColor Gray
Write-Host "========================================" -ForegroundColor Cyan
