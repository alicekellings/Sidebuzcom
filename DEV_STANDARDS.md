# SideBuz.com 开发技术标准

> 统一的代码规范和开发标准，确保项目一致性

---

## 📁 项目结构

```
src/
├── components/          # 可复用组件
│   ├── BaseHead.astro   # HTML head 元数据
│   ├── Header.astro     # 全局导航栏
│   ├── Footer.astro     # 全局页脚
│   ├── FormattedDate.astro
│   ├── RelatedPosts.astro
│   ├── AffiliateButton.astro  # 联盟按钮组件
│   └── tools/           # 工具专用组件
│       ├── QuizContainer.astro
│       ├── QuizQuestion.astro
│       ├── QuizProgress.astro
│       ├── ResultCard.astro
│       └── AIAnalysis.astro
├── data/                # 静态数据配置
│   ├── affiliates.js    # 联盟链接配置
│   └── recommendations/ # 推荐数据
├── layouts/             # 页面布局
│   └── BlogPost.astro
├── lib/                 # 工具函数
│   └── groq.js          # AI API 封装
├── pages/               # 页面路由
│   ├── index.astro
│   ├── about.astro
│   ├── blog/
│   ├── category/
│   └── tools/
└── styles/
    └── global.css       # 全局样式变量
```

---

## 🎨 设计令牌 (Design Tokens)

### 颜色
```css
/* 必须使用以下 CSS 变量，禁止硬编码颜色 */

/* 背景 */
--bg-primary: #FFFFFF;       /* 主背景 */
--bg-secondary: #F8FAFC;     /* 次要背景 */
--bg-tertiary: #F1F5F9;      /* 输入框/卡片背景 */

/* 文字 */
--text-primary: #1F2937;     /* 标题/主要文字 */
--text-secondary: #4B5563;   /* 正文 */
--text-muted: #9CA3AF;       /* 辅助文字 */

/* 主色调 */
--accent-primary: #2563EB;   /* 链接/主按钮 */
--accent-secondary: #059669; /* 成功/收入相关 */
--accent-cta: #F59E0B;       /* CTA 按钮 */
--accent-danger: #EF4444;    /* 错误/警告 */

/* 边框 */
--border-color: #E5E7EB;

/* AI 主题 */
--ai-gradient: linear-gradient(135deg, #667eea, #764ba2);
```

### 间距
```css
--spacing-xs: 0.25rem;   /* 4px */
--spacing-sm: 0.5rem;    /* 8px */
--spacing-md: 1rem;      /* 16px */
--spacing-lg: 1.5rem;    /* 24px */
--spacing-xl: 2rem;      /* 32px */
--spacing-2xl: 3rem;     /* 48px */
```

### 圆角
```css
--radius-sm: 4px;
--radius-md: 8px;
--radius-lg: 12px;
--radius-xl: 16px;
--radius-full: 9999px;   /* 胶囊形状 */
```

### 阴影
```css
--shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
--shadow-md: 0 4px 6px -1px rgba(0,0,0,0.07);
--shadow-lg: 0 10px 15px -3px rgba(0,0,0,0.08);
```

---

## 📐 组件规范

### 按钮样式

```html
<!-- 主按钮 (蓝色) -->
<a href="" class="btn btn-primary">Button Text</a>

<!-- CTA 按钮 (橙色) -->
<a href="" class="btn btn-cta">Get Started →</a>

<!-- 描边按钮 -->
<a href="" class="btn btn-outline">Learn More</a>
```

### 卡片样式

```html
<div class="card">
  <h3 class="card-title">Title</h3>
  <p class="card-description">Description text</p>
</div>
```

### 分类标签

```html
<!-- 蓝色标签 (默认) -->
<span class="tag tag-primary">Category</span>

<!-- 绿色标签 (成功/收入) -->
<span class="tag tag-success">$20/hour</span>

<!-- 黄色标签 (警告/提醒) -->
<span class="tag tag-warning">New</span>
```

### AI 分析框

```html
<div class="ai-box">
  <div class="ai-box-header">
    ✨ AI Analysis
  </div>
  <div class="ai-box-content">
    AI generated content here...
  </div>
</div>
```

---

## 🔗 联盟链接规范

### 使用方式

```javascript
// 1. 导入配置
import { affiliates, getAffiliate } from '../data/affiliates.js';

// 2. 获取链接
const chegg = getAffiliate('chegg');
```

### HTML 属性

```html
<!-- 所有联盟链接必须包含以下属性 -->
<a 
  href="{affiliate.url}"
  target="_blank"
  rel="noopener sponsored"
  class="affiliate-btn"
  data-affiliate="{affiliate.id}"
>
  {affiliate.cta} →
</a>
```

### 披露声明

每个包含联盟链接的页面底部必须有：

```html
<p class="affiliate-disclosure">
  <small>
    Affiliate Disclosure: Some links on this page are affiliate links. 
    We may earn a commission if you make a purchase, at no extra cost to you.
  </small>
</p>
```

---

## 🤖 AI 集成规范

### Groq API 调用

```javascript
import { generateAIAnalysis } from '../lib/groq.js';

// 在服务端调用 (Astro 组件)
const analysis = await generateAIAnalysis(
  userProfile,      // 用户问卷答案
  recommendations,  // 匹配的推荐
  import.meta.env.GROQ_API_KEY
);
```

### 前端 AI 调用 (可选)

```javascript
// 通过 API 路由调用，避免暴露 key
const response = await fetch('/api/analyze', {
  method: 'POST',
  body: JSON.stringify({ profile, recommendations })
});
```

### AI 内容展示

- 使用 `.ai-box` 容器
- 添加打字效果（可选）
- 显示 AI 图标/标识

---

## 📱 响应式断点

```css
/* 手机 */
@media (max-width: 480px) { }

/* 平板 */
@media (max-width: 768px) { }

/* 小桌面 */
@media (max-width: 900px) { }

/* 大桌面 */
@media (min-width: 1200px) { }
```

### 响应式规则

1. 移动优先设计
2. 网格布局使用 `grid-template-columns: repeat(auto-fill, minmax(Xpx, 1fr))`
3. 图片必须设置 `max-width: 100%`
4. 按钮在移动端至少 44px 高度

---

## 📝 命名规范

### 文件命名

| 类型 | 规范 | 示例 |
|------|------|------|
| 页面 | kebab-case | `student-income-finder.astro` |
| 组件 | PascalCase | `QuizContainer.astro` |
| 数据 | camelCase | `affiliates.js` |
| 样式 | kebab-case | `global.css` |

### CSS 类命名

- 使用 BEM 风格：`block__element--modifier`
- 工具类：`mt-2`, `text-center`
- 组件类：`quiz-option`, `result-card`

### JavaScript 命名

- 函数：camelCase `generateAIAnalysis()`
- 常量：UPPER_SNAKE_CASE `GROQ_API_URL`
- 变量：camelCase `userProfile`

---

## ✅ 代码检查清单

开发每个组件/页面时确认：

- [ ] 使用 CSS 变量，无硬编码颜色
- [ ] 响应式适配（手机/平板/桌面）
- [ ] 联盟链接有正确属性
- [ ] 图片有 alt 属性
- [ ] 页面有正确的 meta 标签
- [ ] 无控制台错误
- [ ] 构建成功

---

## 🚫 禁止事项

1. ❌ 硬编码颜色值（必须用变量）
2. ❌ 内联样式（使用 `<style>` 块）
3. ❌ 在前端暴露 API Key
4. ❌ 联盟链接没有 `rel="sponsored"`
5. ❌ 图片没有 alt 属性
6. ❌ 使用 `!important`（除非绝对必要）

---

## 📚 参考资源

- [Astro 文档](https://docs.astro.build)
- [Groq API 文档](https://console.groq.com/docs)
- [CSS 变量](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties)
