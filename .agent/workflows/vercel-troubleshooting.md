---
description: Vercel deployment issues and how to fix them
---

# Vercel Deployment Troubleshooting

## Common Issue: Vercel Uses Stale Build Cache

### Symptoms
- Code pushed to GitHub successfully
- Vercel shows "Ready" status
- But website still shows old content
- Build logs show: `Using prebuilt build artifacts from .vercel/output`

### Root Cause
The `.vercel/output` directory was accidentally committed to Git. Vercel detects this and uses it directly instead of running `npm run build`.

### Solution

1. **Remove .vercel from Git tracking:**
   ```bash
   git rm -r --cached .vercel
   git commit -m "fix: Remove .vercel directory from git tracking"
   git push
   ```

2. **Ensure .vercel is in .gitignore:**
   ```
   # Vercel build cache
   .vercel/
   ```

3. **Force redeploy without cache:**
   - Go to Vercel Dashboard → Deployments
   - Click three-dot menu on latest deployment
   - Select "Redeploy"
   - **Uncheck** "Use existing Build Cache"
   - Click Redeploy

### Prevention
**ALWAYS** ensure `.vercel/` is in `.gitignore` BEFORE running `vercel build` or any local Vercel commands.

---

## Other Common Issue: Wrong CSS Path in Astro Pages

### Symptoms
- Console shows: `GET /src/styles/global.css 404 (Not Found)`
- Page styles are broken

### Root Cause
Using `<link rel="stylesheet" href="/src/styles/global.css" />` in Astro pages. Astro bundles CSS, so `/src/` paths don't exist in production.

### Solution
Remove manual CSS link tags. Use Astro's built-in `BaseHead` component which handles global styles correctly.

**Wrong:**
```html
<head>
    <BaseHead ... />
    <link rel="stylesheet" href="/src/styles/global.css" />
</head>
```

**Correct:**
```html
<head>
    <BaseHead ... />
</head>
```

The `BaseHead` component already imports global styles properly.
