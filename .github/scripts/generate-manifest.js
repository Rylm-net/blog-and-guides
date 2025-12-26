const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

// Configuration
const ROOT_DIR = process.cwd();
const OUTPUT_FILE = path.join(ROOT_DIR, 'manifest.json');
const CATEGORIES = ['guides', 'tutorials', 'news', 'blog', 'technical']; // Add more categories as needed

/**
 * Recursively find all MDX files in a directory
 */
function findMdxFiles(dir, fileList = []) {
  if (!fs.existsSync(dir)) {
    return fileList;
  }

  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      findMdxFiles(filePath, fileList);
    } else if (file.endsWith('.mdx') || file.endsWith('.md')) {
      fileList.push(filePath);
    }
  });

  return fileList;
}

/**
 * Extract category from file path
 * e.g., guides/getting-started.mdx -> "guides"
 */
function extractCategory(filePath) {
  const relativePath = path.relative(ROOT_DIR, filePath);
  const parts = relativePath.split(path.sep);
  return parts.length > 1 ? parts[0] : 'uncategorized';
}

/**
 * Extract slug from filename
 * e.g., getting-started.mdx -> "getting-started"
 */
function extractSlug(filePath) {
  const filename = path.basename(filePath);
  return filename.replace(/\.(mdx|md)$/, '');
}

/**
 * Parse MDX file and extract metadata
 */
function parseMdxFile(filePath) {
  try {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const { data } = matter(fileContent);

    const category = extractCategory(filePath);
    const slug = data.slug || extractSlug(filePath);
    const relativePath = path.relative(ROOT_DIR, filePath);

    return {
      slug,
      category,
      file: relativePath,
      metadata: {
        title: data.title || 'Untitled',
        description: data.description || '',
        author: data.author || 'Unknown',
        category: data.category || category,
        publishedAt: data.publishedAt || data.date || new Date().toISOString(),
        updatedAt: data.updatedAt,
        slug,
        tags: data.tags || [],
        image: data.image,
        featured: data.featured || false,
      }
    };
  } catch (error) {
    console.error(`Error parsing ${filePath}:`, error.message);
    return null;
  }
}

/**
 * Generate the manifest
 */
function generateManifest() {
  console.log('🔍 Searching for MDX files in categories:', CATEGORIES.join(', '));

  let allMdxFiles = [];

  // Search in each category folder
  CATEGORIES.forEach(category => {
    const categoryDir = path.join(ROOT_DIR, category);
    if (fs.existsSync(categoryDir)) {
      const files = findMdxFiles(categoryDir);
      console.log(`   - ${category}: Found ${files.length} file(s)`);
      allMdxFiles = allMdxFiles.concat(files);
    } else {
      console.log(`   - ${category}: Directory not found (skipping)`);
    }
  });

  console.log(`\n📝 Total: ${allMdxFiles.length} MDX file(s)`);

  if (allMdxFiles.length === 0) {
    console.log('⚠️  No MDX files found, creating empty manifest');

    const emptyManifest = {
      lastUpdated: new Date().toISOString(),
      posts: []
    };

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(emptyManifest, null, 2));
    console.log('✅ Created empty manifest.json');
    return;
  }

  const posts = allMdxFiles
    .map(parseMdxFile)
    .filter(post => post !== null)
    .sort((a, b) => {
      // Sort by published date, newest first
      const dateA = new Date(a.metadata.publishedAt).getTime();
      const dateB = new Date(b.metadata.publishedAt).getTime();
      return dateB - dateA;
    });

  const manifest = {
    lastUpdated: new Date().toISOString(),
    posts
  };

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(manifest, null, 2));
  console.log(`\n✅ Generated manifest.json with ${posts.length} post(s)`);

  // Log summary
  const categoryCounts = posts.reduce((acc, post) => {
    acc[post.category] = (acc[post.category] || 0) + 1;
    return acc;
  }, {});

  console.log('\n📊 Posts by category:');
  Object.entries(categoryCounts).forEach(([category, count]) => {
    console.log(`   - ${category}: ${count}`);
  });

  // Log featured posts
  const featuredCount = posts.filter(p => p.metadata.featured).length;
  if (featuredCount > 0) {
    console.log(`\n⭐ Featured posts: ${featuredCount}`);
  }
}

// Run the generator
generateManifest();