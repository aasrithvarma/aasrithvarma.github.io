import fs from 'fs';
import path from 'path';
import { globSync } from 'glob';
import matter from 'gray-matter';
import { marked } from 'marked';

const CONFIG = {
  url: 'https://aasrithvarma.github.io',
  author: 'Dr. Tanmai Aasrith Varma Ayenampudi, M.D.',
  srcDir: 'content',
  outDir: 'docs',
  templateDir: 'src/templates',
  assetsDir: 'assets'
};

if (!fs.existsSync(CONFIG.outDir)) fs.mkdirSync(CONFIG.outDir, { recursive: true });

const copyAssets = (src, dest) => {
  if (!fs.existsSync(src)) return;
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) copyAssets(srcPath, destPath);
    else fs.copyFileSync(srcPath, destPath);
  }
};
copyAssets(CONFIG.assetsDir, path.join(CONFIG.outDir, 'assets'));
copyAssets('src/admin', path.join(CONFIG.outDir, 'admin'));

const baseTemplate = fs.readFileSync(path.join(CONFIG.templateDir, 'base.html'), 'utf-8');
const files = globSync(`${CONFIG.srcDir}/**/*.md`);
const searchIndex = [];
const sitemap = [];
const articlesList = [];

const generateSchema = (data, urlPath) => {
  const type = data.type === 'publication' ? 'MedicalScholarlyArticle' : data.type === 'post' ? 'BlogPosting' : 'ProfilePage';
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": type,
    "mainEntity": {
      "@type": "Physician",
      "name": CONFIG.author,
      "medicalSpecialty": "Pediatric Cardiac Surgery",
      "url": CONFIG.url
    },
    "headline": data.title || "Clinical Notebook",
    "url": `${CONFIG.url}${urlPath}`,
    "author": { "@type": "Person", "name": CONFIG.author }
  });
};

files.forEach(file => {
  const content = fs.readFileSync(file, 'utf-8');
  const parsed = matter(content);
  const htmlContent = marked(parsed.content);
  
  let relativePath = path.relative(CONFIG.srcDir, file).replace(/\.md$/, '');
  let urlPath, outPath;

  if (relativePath === 'index') {
    urlPath = '/';
    outPath = path.join(CONFIG.outDir, 'index.html');
  } else if (relativePath === '404') {
    urlPath = '/404.html';
    outPath = path.join(CONFIG.outDir, '404.html');
  } else {
    urlPath = `/${relativePath}/`;
    outPath = path.join(CONFIG.outDir, relativePath, 'index.html');
    
    // Extract metadata for the automated articles index
    if (relativePath.startsWith('articles/')) {
      articlesList.push({
        title: parsed.data.title || 'Untitled',
        date: parsed.data.date ? new Date(parsed.data.date) : new Date(relativePath.match(/\d{4}-\d{2}-\d{2}/)?.[0] || Date.now()),
        url: urlPath
      });
    }
  }

  const title = parsed.data.title ? `${parsed.data.title} | ${CONFIG.author}` : CONFIG.author;
  const description = parsed.data.description || 'Academic digital identity.';
  
  let finalHtml = baseTemplate
    .replace(/{{title}}/g, title)
    .replace(/{{description}}/g, description)
    .replace(/{{content}}/g, htmlContent)
    .replace(/{{canonical}}/g, `${CONFIG.url}${urlPath}`)
    .replace(/{{schema}}/g, generateSchema(parsed.data, urlPath))
    .replace(/{{current_year}}/g, new Date().getFullYear());

  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, finalHtml);

  if (relativePath !== '404') {
    searchIndex.push({
      title: parsed.data.title,
      url: urlPath,
      content: parsed.content.replace(/[#*`_]/g, '').replace(/\n/g, ' ').substring(0, 300)
    });
    sitemap.push(`<url><loc>${CONFIG.url}${urlPath}</loc><lastmod>${new Date().toISOString()}</lastmod></url>`);
  }
});

// Compile and output the dynamic /articles/ index page
articlesList.sort((a, b) => b.date - a.date);
let articlesHtml = '<h1>Clinical Notebook</h1><p>Recent clinical updates, academic insights, and case reviews.</p><ul>';
articlesList.forEach(article => {
  const dateString = article.date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  articlesHtml += `<li style="margin-bottom: 15px;"><a href="${article.url}"><strong>${article.title}</strong></a><br><small>${dateString}</small></li>`;
});
articlesHtml += '</ul>';

const articlesIndexHtml = baseTemplate
  .replace(/{{title}}/g, `Clinical Notebook | ${CONFIG.author}`)
  .replace(/{{description}}/g, 'Index of published clinical updates and articles.')
  .replace(/{{content}}/g, articlesHtml)
  .replace(/{{canonical}}/g, `${CONFIG.url}/articles/`)
  .replace(/{{schema}}/g, '{}')
  .replace(/{{current_year}}/g, new Date().getFullYear());

fs.mkdirSync(path.join(CONFIG.outDir, 'articles'), { recursive: true });
fs.writeFileSync(path.join(CONFIG.outDir, 'articles', 'index.html'), articlesIndexHtml);
sitemap.push(`<url><loc>${CONFIG.url}/articles/</loc><lastmod>${new Date().toISOString()}</lastmod></url>`);

fs.writeFileSync(path.join(CONFIG.outDir, 'search.json'), JSON.stringify(searchIndex));
fs.writeFileSync(path.join(CONFIG.outDir, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${sitemap.join('')}</urlset>`);
fs.writeFileSync(path.join(CONFIG.outDir, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${CONFIG.url}/sitemap.xml`);
console.log('Build completed.');
