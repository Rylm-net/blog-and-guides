# Rylm.net Blog & Guides

This repository contains all MDX blog posts and guides for Rylm.net, served from the CDN at `https://guidecdn.rylm.net`.

## 🚀 Quick Start

### Adding a New Post

1. Create a new `.mdx` file in the appropriate category folder (`guides/`, `tutorials/`, or `news/`)
2. Add frontmatter with required metadata
3. Write your content using Markdown/MDX
4. Commit and push to `main` branch
5. GitHub Action automatically generates `manifest.json`
6. Sync to your nginx CDN server

## 📁 Directory Structure

```
blog-and-guides/
├── guides/           # How-to guides
├── tutorials/        # Step-by-step tutorials
├── news/            # News and announcements
├── manifest.json    # Auto-generated (DO NOT EDIT)
└── README.md
```

See full documentation in this README below.
