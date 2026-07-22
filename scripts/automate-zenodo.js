import fs from 'fs';
import { globSync } from 'glob';
import matter from 'gray-matter';

const ZENODO_API_URL = 'https://sandbox.zenodo.org/api';
const TOKEN = process.env.ZENODO_TOKEN;

if (!TOKEN) {
  console.error('Error: ZENODO_TOKEN environment variable is missing.');
  process.exit(1);
}

async function publishArticles() {
  const files = globSync('content/articles/**/*.md');

  for (const file of files) {
    const content = fs.readFileSync(file, 'utf-8');
    const parsed = matter(content);

    if (!parsed.data.doi) {
      console.log(`Processing new article for Zenodo DOI: ${parsed.data.title || file}`);

      try {
        const createRes = await fetch(`${ZENODO_API_URL}/deposit/depositions`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${TOKEN}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            metadata: {
              title: parsed.data.title || 'Clinical Notebook Article',
              upload_type: 'publication',
              publication_type: 'article',
              description: parsed.data.description || 'Clinical update and academic insight.',
              creators: [{ name: 'Ayenampudi, Dr. Tanmai Aasrith Varma', affiliation: 'Faculty of Medicine' }]
            }
          })
        });

        if (!createRes.ok) {
          throw new Error(`Failed to create deposit: ${createRes.statusText}`);
        }

        const depositData = await createRes.json();
        const doi = depositData.metadata.prereserve_doi.doi;
        console.log(`Successfully reserved DOI: ${doi}`);

        parsed.data.doi = doi;
        const updatedMarkdown = matter.stringify(parsed.content, parsed.data);
        fs.writeFileSync(file, updatedMarkdown, 'utf-8');
        console.log(`Updated frontmatter for ${file}`);

      } catch (err) {
        console.error(`Error processing ${file}:`, err.message);
      }
    }
  }
}

publishArticles();
