# SideBuz.com 全站改造计划

## 🎯 目标
- 全站改为白底黑字风格
- 开发学生赚钱工具（核心）
- 集成 Groq AI 提供个性化建议
- 通过联盟营销变现

---

## 🛠️ 技术栈

| 技术 | 用途 |
|------|------|
| Astro 5.x | 静态站点框架 |
| 原生 JavaScript | 工具交互 |
| Groq API | AI 个性化建议 |
| Vercel | 部署托管 |

---

## 🎨 设计规范

### 新配色 (白色主题)
```css
:root {
  /* 背景 */
  --bg-primary: #FFFFFF;
  --bg-secondary: #F8FAFC;
  --bg-tertiary: #F1F5F9;
  
  /* 文字 */
  --text-primary: #1F2937;
  --text-secondary: #6B7280;
  --text-muted: #9CA3AF;
  
  /* 主色调 */
  --accent-primary: #2563EB;
  --accent-secondary: #059669;
  --accent-cta: #F59E0B;
  
  /* 边框和阴影 */
  --border-color: #E5E7EB;
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
  --shadow-md: 0 4px 6px rgba(0,0,0,0.07);
  --shadow-lg: 0 10px 25px rgba(0,0,0,0.1);
  
  /* AI 特效 */
  --ai-gradient: linear-gradient(135deg, #667eea, #764ba2);
}
```

---

## 📋 改造步骤

### Phase 0: 基础设施 ✅ 完成
- [x] 0.1 创建全局样式文件 `src/styles/global.css`
- [x] 0.2 创建联盟配置 `src/data/affiliates.js`
- [x] 0.3 配置 Groq API `src/lib/groq.js`
- [x] 0.4 创建环境变量 `.env.example`

### Phase 1: 全站风格改造 ✅ 完成
- [x] 1.1 修改 `Header.astro` - 白色导航栏
- [x] 1.2 修改 `Footer.astro` - 浅灰底部
- [x] 1.3 修改 `index.astro` - 首页白色
- [x] 1.4 修改 `blog/index.astro` - 博客列表
- [x] 1.5 修改 `[...slug].astro` - 博客详情
- [x] 1.6 修改 `BlogPost.astro` - 文章布局
- [x] 1.7 修改 `category/[category].astro` - 分类页
- [x] 1.8 修改 `about.astro` - 关于页

### Phase 2: 工具开发 ✅ 完成
- [x] 2.1 创建 `tools/index.astro` - 工具列表
- [x] 2.2 创建推荐数据 `src/data/student-recommendations.js`
- [x] 2.3 创建 `tools/student-income-finder.astro`
- [x] 2.4 集成 AI 分析（已准备 Groq，当前使用 fallback）
- [x] 2.5 嵌入联盟链接

### Phase 3: 测试部署
- [ ] 3.1 全站功能测试
- [ ] 3.2 移动端适配
- [ ] 3.3 SEO 检查
- [ ] 3.4 部署 Vercel

---

## 🤖 Groq AI 配置

### API 信息
- 模型: `llama-3.1-70b-versatile` 或 `mixtral-8x7b-32768`
- 端点: `https://api.groq.com/openai/v1/chat/completions`

### 调用场景
1. 用户完成问卷后，生成个性化分析
2. 生成 30 天行动计划建议

### Prompt 模板
```
You are a career advisor for students. Based on the following profile:
- Major: {major}
- Year: {year}
- Available hours: {hours}/week
- Skills: {skills}
- Income goal: {goal}

Provide a personalized 2-3 sentence analysis explaining why the recommended income methods are suitable. Be encouraging and specific. Keep it under 100 words.
```

---

## 💰 联盟配置

```javascript
export const affiliates = {
  chegg: {
    name: "Chegg Tutors",
    url: "https://www.chegg.com/tutors/",
    cta: "Start Tutoring",
    commission: "$100+/signup"
  },
  coursehero: {
    name: "Course Hero",
    url: "https://www.coursehero.com/",
    cta: "Join Now",
    commission: "$50+/sub"
  },
  fiverr: {
    name: "Fiverr",
    url: "https://www.fiverr.com/",
    cta: "Create Gig",
    commission: "$15-50/signup"
  },
  upwork: {
    name: "Upwork",
    url: "https://www.upwork.com/",
    cta: "Find Work",
    commission: "$15-50/signup"
  },
  studypool: {
    name: "Studypool",
    url: "https://www.studypool.com/",
    cta: "Answer Questions",
    commission: "$30+/signup"
  }
};
```

---

## 📁 文件结构

```
src/
├── components/
│   ├── BaseHead.astro
│   ├── Header.astro         ← 修改
│   ├── Footer.astro         ← 修改
│   ├── FormattedDate.astro
│   ├── RelatedPosts.astro
│   ├── AffiliateButton.astro ← 新建
│   └── tools/
│       ├── QuizContainer.astro  ← 新建
│       ├── QuizQuestion.astro   ← 新建
│       ├── QuizProgress.astro   ← 新建
│       ├── ResultCard.astro     ← 新建
│       └── AIAnalysis.astro     ← 新建
├── data/
│   ├── affiliates.js            ← 新建
│   └── student-recommendations.js ← 新建
├── layouts/
│   └── BlogPost.astro       ← 修改
├── lib/
│   └── groq.js              ← 新建
├── pages/
│   ├── index.astro          ← 修改
│   ├── about.astro          ← 修改
│   ├── [...slug].astro      ← 修改
│   ├── blog/
│   │   └── index.astro      ← 修改
│   ├── category/
│   │   └── [category].astro ← 修改
│   └── tools/
│       ├── index.astro          ← 新建
│       └── student-income-finder.astro ← 新建
└── styles/
    └── global.css           ← 新建
```

---

## ⏰ 时间预估

| Phase | 预计时间 |
|-------|---------|
| Phase 0 | 30分钟 |
| Phase 1 | 2-3小时 |
| Phase 2 | 3-4小时 |
| Phase 3 | 1小时 |
| **总计** | **1天** |

---

## 🔑 需要的信息

- [ ] Groq API Key
- [ ] 联盟平台账号/链接 (可后期添加)

---

## ✅ 当前状态

**准备开始 Phase 0**

等待确认后开始执行。
