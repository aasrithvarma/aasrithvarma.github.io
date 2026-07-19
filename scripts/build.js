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

const baseTemplate = fs.readFileSync(path.join(CONFIG.templateDir, 'base.html'), 'utf-8');
const files = globSync(`${CONFIG.srcDir}/**/*.md`);
const searchIndex = [];
const sitemap = [];

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
    "headline": data.title,
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

fs.writeFileSync(path.join(CONFIG.outDir, 'search.json'), JSON.stringify(searchIndex));
fs.writeFileSync(path.join(CONFIG.outDir, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${sitemap.join('')}</urlset>`);
fs.writeFileSync(path.join(CONFIG.outDir, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${CONFIG.url}/sitemap.xml`);
console.log('Build completed.');
