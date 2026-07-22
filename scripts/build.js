import fs from 'fs';
import path from 'path';
import { globSync } from 'glob';
import matter from 'gray-matter';
import { marked } from 'marked';
import crypto from 'crypto';

const CONFIG = {
  url: 'https://aasrithvarma.github.io',
  author: 'Dr. Tanmai Aasrith Varma Ayenampudi',
  publicationName: "Dr. Ayenampudi's Clinical Notebook",
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
const newsSitemapItems = [];
const articlesList = [];
const rssItems = [];

const twoDaysAgo = new Date();
twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

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
  let htmlContent = marked(parsed.content);
  
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
    
    if (relativePath.startsWith('articles/')) {
      const articleDateObj = parsed.data.date ? new Date(parsed.data.date) : new Date(relativePath.match(/\d{4}-\d{2}-\d{2}/)?.[0] || Date.now());
      const formattedDate = articleDateObj.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
      const displayTitle = parsed.data.title || 'Untitled Clinical Update';
      const year = articleDateObj.getFullYear();
      
      const clinId = parsed.data.doi || `CN-${year}.${crypto.createHash('md5').update(relativePath).digest('hex').substring(0, 6)}`;
      const pageUrl = `${CONFIG.url}${urlPath}`;

      // Update the zenodoDoi variable once your release badge is generated on Zenodo
      const zenodoDoi = parsed.data.zenodo || '10.5281/zenodo.XXXXXXX'; 
      const zenodoBadgeUrl = `https://zenodo.org/badge/DOI/${zenodoDoi}.svg`;
      const zenodoLink = `https://doi.org/${zenodoDoi}`;

      const articleHeaderMeta = `
        <div class="article-meta-header" style="border-bottom: 1px solid #eaeaea; padding-bottom: 1.25rem; margin-bottom: 2rem;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem;">
            <span style="font-size: 0.9rem; color: #0056b3; font-weight: 600;">
              Clin Notebook. ${year} ${formattedDate}; ID: ${clinId}
            </span>
            <button onclick="if(navigator.share){navigator.share({title: document.title, url: window.location.href}).catch(()=>{})}else{navigator.clipboard.writeText(window.location.href);alert('Article link copied to clipboard!');}" style="background: #fff; border: 1px solid #ccc; padding: 4px 12px; border-radius: 4px; font-size: 0.85rem; cursor: pointer; color: #333;">Share</button>
          </div>
          <h1 style="margin: 0.5rem 0 1rem 0; font-size: 2.2rem; line-height: 1.2; text-transform: uppercase;">${displayTitle}</h1>
          <div style="font-size: 1.05rem; color: #0056b3; margin-bottom: 0.75rem;">
            <span style="font-weight: 500; color: #0056b3;">${CONFIG.author}</span> <sup style="font-size: 0.75rem; color: #555;">1</sup>
          </div>
          <div style="font-size: 0.85rem; color: #555; display: flex; flex-wrap: wrap; gap: 1rem; align-items: center; border-top: 1px dashed #eaeaea; padding-top: 0.75rem; margin-top: 0.5rem;">
            <span><strong>Repository Indexing ID:</strong> ${clinId}</span>
            <a href="${zenodoLink}" target="_blank" style="margin-left: auto;"><img src="${zenodoBadgeUrl}" alt="DOI Badge"></a>
          </div>
        </div>
      `;

      const vancouverCitation = `${CONFIG.author}. ${displayTitle}. Clinical Notebook. ${formattedDate}. Available from: ${pageUrl}`;
      const apaCitation = `${CONFIG.author} (${year}). ${displayTitle}. <i>Clinical Notebook</i>. ${pageUrl}`;

      const citationBlockHtml = `
        <hr style="margin: 3rem 0 1.5rem 0; border: none; border-top: 1px solid #eaeaea;">
        <section class="academic-citations" style="background: #f9f9f9; padding: 1.25rem; border-radius: 6px; font-size: 0.9rem; color: #444;">
          <h3 style="margin-top: 0; margin-bottom: 0.75rem; font-size: 1rem; color: #222;">How to Cite This Article</h3>
          <p style="margin-bottom: 0.5rem;"><strong>Vancouver:</strong><br><span style="font-family: monospace; color: #555;">${vancouverCitation}</span></p>
          <p style="margin-bottom: 0;"><strong>APA:</strong><br><span style="font-family: monospace; color: #555;">${apaCitation}</span></p>
        </section>
      `;

      htmlContent = articleHeaderMeta + htmlContent + citationBlockHtml;

      articlesList.push({
        title: displayTitle,
        date: articleDateObj,
        url: urlPath,
        description: parsed.data.description || displayTitle
      });

      rssItems.push(`
        <item>
          <title><![CDATA[${displayTitle}]]></title>
          <link>${CONFIG.url}${urlPath}</link>
          <guid>${CONFIG.url}${urlPath}</guid>
          <pubDate>${articleDateObj.toUTCString()}</pubDate>
          <description><![CDATA[${parsed.data.description || displayTitle}]]></description>
        </item>
      `);

      if (articleDateObj >= twoDaysAgo) {
        newsSitemapItems.push(`
  <url>
    <loc>${CONFIG.url}${urlPath}</loc>
    <news:news>
      <news:publication>
        <news:name>${CONFIG.publicationName}</news:name>
        <news:language>en</news:language>
      </news:publication>
      <news:publication_date>${articleDateObj.toISOString()}</news:publication_date>
      <news:title><![CDATA[${displayTitle}]]></news:title>
    </news:news>
  </url>`);
      }
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

articlesList.sort((a, b) => b.date - a.date);
let articlesHtml = '<h1>Clinical Notebook</h1><p style="font-size: 1.1rem; color: #555;">Recent clinical updates, academic insights, and case reviews.</p><ul style="list-style-type: none; padding-left: 0;">';
articlesList.forEach(article => {
  const dateString = article.date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  articlesHtml += `<li style="margin-bottom: 1.5rem;"><a href="${article.url}" style="font-size: 1.25rem; font-weight: bold; text-decoration: none; color: #0056b3;">${article.title}</a><br><small style="color: #666;">${dateString}</small></li>`;
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

const rssXml = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0">
  <channel>
    <title>Clinical Notebook | ${CONFIG.author}</title>
    <link>${CONFIG.url}/articles/</link>
    <description>Recent clinical updates and medical insights.</description>
    <language>en-us</language>
    ${rssItems.join('')}
  </channel>
</rss>`;
fs.writeFileSync(path.join(CONFIG.outDir, 'rss.xml'), rssXml);
sitemap.push(`<url><loc>${CONFIG.url}/rss.xml</loc><lastmod>${new Date().toISOString()}</lastmod></url>`);

const newsSitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${newsSitemapItems.join('')}
</urlset>`;
fs.writeFileSync(path.join(CONFIG.outDir, 'news-sitemap.xml'), newsSitemapXml);
sitemap.push(`<url><loc>${CONFIG.url}/news-sitemap.xml</loc><lastmod>${new Date().toISOString()}</lastmod></url>`);

fs.writeFileSync(path.join(CONFIG.outDir, 'search.json'), JSON.stringify(searchIndex));
fs.writeFileSync(path.join(CONFIG.outDir, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${sitemap.join('')}</urlset>`);
fs.writeFileSync(path.join(CONFIG.outDir, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${CONFIG.url}/sitemap.xml`);
console.log('Build completed cleanly with Zenodo DOI badge integration.');
