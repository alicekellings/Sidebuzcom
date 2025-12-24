# SideBuzCom Blog

A modern blog about side hustle ideas for students to make extra money online.

## 🚀 Project Structure

```
├── public/           # Static assets
├── src/
│   ├── components/   # Astro components
│   ├── content/      # Blog posts (Markdown)
│   ├── layouts/      # Page layouts
│   └── pages/        # Routes
├── astro.config.mjs  # Astro configuration
└── convert-wp.js     # WordPress XML converter
```

## 📝 Commands

| Command | Action |
|---------|--------|
| `npm install` | Install dependencies |
| `npm run dev` | Start dev server at `localhost:4321` |
| `npm run build` | Build production site to `./dist/` |
| `npm run preview` | Preview build locally |
| `npm run convert` | Convert WordPress XML to Markdown |

## 🚀 Deploy to Vercel

1. Push this repository to GitHub
2. Connect your GitHub repo to [Vercel](https://vercel.com)
3. Vercel will auto-detect Astro and deploy

## ✍️ Adding New Posts

Create a new `.md` file in `src/content/blog/` with this format:

```markdown
---
title: "Your Post Title"
description: "Short description"
pubDate: "2024-01-01"
category: "Side Hustle"
tags: ["money", "passive income"]
---

Your content here...
```

## 📦 Tech Stack

- [Astro](https://astro.build) - Fast static site generator
- [MDX](https://mdxjs.com) - Markdown with JSX
- Deployed on [Vercel](https://vercel.com)
