/**
 * WordPress XML to Markdown Converter
 * Converts WordPress export XML to Astro-compatible Markdown files
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// XML parsing without external dependencies
function parseXML(xml) {
    const posts = [];
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    let match;

    while ((match = itemRegex.exec(xml)) !== null) {
        const item = match[1];

        // Extract post type
        const postType = extractCDATA(item, 'wp:post_type');
        if (postType !== 'post') continue;

        // Extract status
        const status = extractCDATA(item, 'wp:status');
        if (status !== 'publish') continue;

        // Extract fields
        const title = extractCDATA(item, 'title');
        const content = extractCDATA(item, 'content:encoded');
        const pubDate = extractTag(item, 'pubDate');
        const postName = extractCDATA(item, 'wp:post_name');

        // Extract categories
        const categories = [];
        const categoryRegex = /<category domain="category"[^>]*><!\[CDATA\[(.*?)\]\]><\/category>/g;
        let catMatch;
        while ((catMatch = categoryRegex.exec(item)) !== null) {
            categories.push(catMatch[1]);
        }

        // Extract tags
        const tags = [];
        const tagRegex = /<category domain="post_tag"[^>]*><!\[CDATA\[(.*?)\]\]><\/category>/g;
        let tagMatch;
        while ((tagMatch = tagRegex.exec(item)) !== null) {
            tags.push(tagMatch[1]);
        }

        if (title && content && postName) {
            posts.push({
                title: title.replace(/&amp;/g, '&').replace(/&#8211;/g, '-').replace(/&#8217;/g, "'"),
                content,
                pubDate: pubDate ? new Date(pubDate) : new Date(),
                slug: postName,
                category: categories[0] || '',
                tags
            });
        }
    }

    return posts;
}

function extractCDATA(xml, tag) {
    const regex = new RegExp(`<${tag}><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>`, 'i');
    const match = xml.match(regex);
    return match ? match[1] : '';
}

function extractTag(xml, tag) {
    const regex = new RegExp(`<${tag}>([^<]*)<\\/${tag}>`, 'i');
    const match = xml.match(regex);
    return match ? match[1] : '';
}

function htmlToMarkdown(html) {
    if (!html) return '';

    let md = html;

    // Remove common WordPress/archive.org artifacts
    md = md.replace(/https?:\/\/web\.archive\.org\/web\/\d+(?:im_)?\/(?:https?:\/\/)?/g, 'https://');

    // Convert headers
    md = md.replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, '\n# $1\n');
    md = md.replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, '\n## $1\n');
    md = md.replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, '\n### $1\n');
    md = md.replace(/<h4[^>]*>([\s\S]*?)<\/h4>/gi, '\n#### $1\n');

    // Convert paragraphs
    md = md.replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, '\n$1\n');

    // Convert bold and italic
    md = md.replace(/<strong[^>]*>([\s\S]*?)<\/strong>/gi, '**$1**');
    md = md.replace(/<b[^>]*>([\s\S]*?)<\/b>/gi, '**$1**');
    md = md.replace(/<em[^>]*>([\s\S]*?)<\/em>/gi, '*$1*');
    md = md.replace(/<i[^>]*>([\s\S]*?)<\/i>/gi, '*$1*');

    // Convert links
    md = md.replace(/<a[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi, '[$2]($1)');

    // Convert images
    md = md.replace(/<img[^>]*src="([^"]*)"[^>]*alt="([^"]*)"[^>]*\/?>/gi, '![$2]($1)');
    md = md.replace(/<img[^>]*src="([^"]*)"[^>]*\/?>/gi, '![]($1)');

    // Convert lists
    md = md.replace(/<ul[^>]*>([\s\S]*?)<\/ul>/gi, '$1');
    md = md.replace(/<ol[^>]*>([\s\S]*?)<\/ol>/gi, '$1');
    md = md.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, '- $1\n');

    // Convert blockquotes
    md = md.replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, '\n> $1\n');

    // Convert horizontal rules
    md = md.replace(/<hr\s*\/?>/gi, '\n---\n');

    // Convert line breaks
    md = md.replace(/<br\s*\/?>/gi, '\n');

    // Remove remaining HTML tags
    md = md.replace(/<figure[^>]*>[\s\S]*?<\/figure>/gi, '');
    md = md.replace(/<div[^>]*>([\s\S]*?)<\/div>/gi, '$1');
    md = md.replace(/<span[^>]*>([\s\S]*?)<\/span>/gi, '$1');
    md = md.replace(/<[^>]+>/g, '');

    // Clean up HTML entities
    md = md.replace(/&nbsp;/g, ' ');
    md = md.replace(/&amp;/g, '&');
    md = md.replace(/&lt;/g, '<');
    md = md.replace(/&gt;/g, '>');
    md = md.replace(/&quot;/g, '"');
    md = md.replace(/&#8217;/g, "'");
    md = md.replace(/&#8220;/g, '"');
    md = md.replace(/&#8221;/g, '"');
    md = md.replace(/&#8211;/g, '-');
    md = md.replace(/&#8212;/g, '—');

    // Remove TOC section IDs
    md = md.replace(/\[CDATA\[.*?\]\]/g, '');

    // Clean up excessive whitespace
    md = md.replace(/\n{3,}/g, '\n\n');
    md = md.trim();

    return md;
}

function generateDescription(content) {
    // Get first meaningful sentence
    const text = content
        .replace(/[#*_\[\]()!]/g, '')
        .replace(/\n+/g, ' ')
        .trim();

    const sentences = text.match(/[^.!?]+[.!?]+/g);
    if (sentences && sentences.length > 0) {
        const firstSentence = sentences[0].trim();
        return firstSentence.length > 160
            ? firstSentence.substring(0, 157) + '...'
            : firstSentence;
    }

    return text.substring(0, 160) + (text.length > 160 ? '...' : '');
}

function createMarkdownFile(post) {
    const markdown = htmlToMarkdown(post.content);
    const description = generateDescription(markdown);

    // Format date
    const dateStr = post.pubDate.toISOString().split('T')[0];

    // Create frontmatter
    const frontmatter = `---
title: "${post.title.replace(/"/g, '\\"')}"
description: "${description.replace(/"/g, '\\"')}"
pubDate: "${dateStr}"
${post.category ? `category: "${post.category}"` : ''}
${post.tags.length > 0 ? `tags: [${post.tags.map(t => `"${t}"`).join(', ')}]` : ''}
---

`;

    return frontmatter + markdown;
}

async function main() {
    const xmlPath = path.join(__dirname, 'sidebuzcom-sidehustleideasforstudentstomakeextramoneyonline.WordPress.2025-12-24.xml');
    const outputDir = path.join(__dirname, 'src', 'content', 'blog');

    // Create output directory
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    console.log('Reading WordPress XML...');
    const xml = fs.readFileSync(xmlPath, 'utf-8');

    console.log('Parsing posts...');
    const posts = parseXML(xml);
    console.log(`Found ${posts.length} published posts`);

    // Convert and save posts
    let count = 0;
    for (const post of posts) {
        const content = createMarkdownFile(post);
        const filename = `${post.slug}.md`;
        const filepath = path.join(outputDir, filename);

        fs.writeFileSync(filepath, content, 'utf-8');
        console.log(`✓ Created: ${filename}`);
        count++;
    }

    console.log(`\n✅ Successfully converted ${count} posts!`);
    console.log(`📁 Output: ${outputDir}`);
}

main().catch(console.error);
