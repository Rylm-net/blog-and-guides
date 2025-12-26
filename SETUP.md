# Blog & Guides Setup Instructions

## ✅ What's Been Created

Your blog content repository is ready at `/Users/hundeklemmen/documents/github/rylm/blog-and-guides`

### File Structure

```
blog-and-guides/
├── .github/
│   ├── workflows/
│   │   └── generate-manifest.yml    # Auto-generates manifest on push
│   └── scripts/
│       └── generate-manifest.js     # Manifest generator script
├── guides/
│   ├── getting-started.mdx         # Sample guide (NEW)
│   ├── create-your-first-server.mdx
│   └── server-customization.mdx
├── tutorials/                       # Empty, ready for content
├── news/                           # Empty, ready for content
├── manifest.json                   # Auto-generated index
├── package.json                    # Dependencies
├── .gitignore
└── README.md                       # Full documentation
```

## 🚀 Next Steps

### 1. Push to GitHub

```bash
cd /Users/hundeklemmen/documents/github/rylm/blog-and-guides

# If not already initialized
git init
git add .
git commit -m "Initial blog setup with GitHub Actions"

# Create repo on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/blog-and-guides.git
git branch -M main
git push -u origin main
```

### 2. Enable GitHub Actions

1. Go to your repository on GitHub
2. Click **Actions** tab
3. Enable workflows if prompted
4. The manifest will auto-generate on every push!

### 3. Set Up nginx CDN Server

On your server at `guidecdn.rylm.net`:

```bash
# Clone the repository
cd /var/www
git clone https://github.com/YOUR_USERNAME/blog-and-guides.git guidecdn.rylm.net

# Set up auto-pull (optional)
cd guidecdn.rylm.net
git config pull.rebase false
```

**nginx configuration** (`/etc/nginx/sites-available/guidecdn.rylm.net`):

```nginx
server {
    listen 443 ssl http2;
    server_name guidecdn.rylm.net;

    root /var/www/guidecdn.rylm.net;
    index index.html;

    # CORS headers (REQUIRED)
    add_header Access-Control-Allow-Origin * always;
    add_header Access-Control-Allow-Methods 'GET, OPTIONS' always;
    add_header Access-Control-Allow-Headers 'Origin, Content-Type, Accept' always;

    # MDX files
    location ~ \.(mdx|md)$ {
        add_header Content-Type text/plain;
        add_header Access-Control-Allow-Origin * always;
    }

    # JSON files
    location ~ \.json$ {
        add_header Content-Type application/json;
        add_header Access-Control-Allow-Origin * always;
    }

    # SSL (use certbot)
    ssl_certificate /etc/letsencrypt/live/guidecdn.rylm.net/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/guidecdn.rylm.net/privkey.pem;
}
```

Enable and reload:

```bash
sudo ln -s /etc/nginx/sites-available/guidecdn.rylm.net /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 4. Set Up Auto-Sync (Recommended)

**Option A: Webhook (Automatic)**

Install webhook handler on server:

```bash
sudo apt install webhook

# Create webhook script
cat > /usr/local/bin/sync-blog.sh << 'EOF'
#!/bin/bash
cd /var/www/guidecdn.rylm.net
git pull origin main
EOF

chmod +x /usr/local/bin/sync-blog.sh

# Configure webhook (see GitHub webhook docs)
```

**Option B: Cron Job (Simple)**

```bash
# Edit crontab
crontab -e

# Add line to pull every 5 minutes
*/5 * * * * cd /var/www/guidecdn.rylm.net && git pull origin main > /dev/null 2>&1
```

**Option C: GitHub Actions SSH Deploy (Advanced)**

Add to `.github/workflows/generate-manifest.yml`:

```yaml
- name: Deploy to CDN
  uses: appleboy/ssh-action@v1.0.0
  with:
    host: guidecdn.rylm.net
    username: deploy
    key: ${{ secrets.SSH_PRIVATE_KEY }}
    script: |
      cd /var/www/guidecdn.rylm.net
      git pull origin main
```

Add SSH key to GitHub Secrets:
- Settings → Secrets → New repository secret
- Name: `SSH_PRIVATE_KEY`
- Value: Your server's SSH private key

### 5. Test the Setup

**Test manifest generation locally:**

```bash
cd /Users/hundeklemmen/documents/github/rylm/blog-and-guides
npm run generate-manifest
cat manifest.json
```

**Test CDN accessibility:**

```bash
# Check manifest
curl https://guidecdn.rylm.net/manifest.json

# Check MDX file
curl https://guidecdn.rylm.net/guides/getting-started.mdx

# Check CORS
curl -I https://guidecdn.rylm.net/manifest.json | grep -i access-control
```

**Test on Rylm.net:**

1. Visit: https://rylm.net/blog
2. Should see your posts listed
3. Click a post to view full content
4. Test search and category filters

## 📝 Adding New Content

### Create a New Guide

```bash
cd /Users/hundeklemmen/documents/github/rylm/blog-and-guides

# Create new file
nano guides/my-new-guide.mdx
```

Add content:

```mdx
---
title: "My Awesome Guide"
description: "Learn something amazing"
author: "Your Name"
category: "guides"
publishedAt: "2025-01-26T12:00:00Z"
slug: "my-new-guide"
tags: ["tutorial", "beginner"]
---

# My Awesome Guide

Your content here...
```

Commit and push:

```bash
git add guides/my-new-guide.mdx
git commit -m "Add guide: My Awesome Guide"
git push
```

The GitHub Action will automatically:
1. Regenerate `manifest.json`
2. Commit and push the updated manifest
3. Sync to CDN (if auto-sync is set up)

## 🔧 Troubleshooting

### Manifest not updating?

```bash
# Check GitHub Actions
# Go to: https://github.com/YOUR_USERNAME/blog-and-guides/actions

# Or regenerate manually
cd /Users/hundeklemmen/documents/github/rylm/blog-and-guides
npm run generate-manifest
git add manifest.json
git commit -m "chore: update manifest"
git push
```

### Posts not showing on blog?

1. **Check CDN sync:**
   ```bash
   # On server
   cd /var/www/guidecdn.rylm.net
   git log -1  # Should show recent commits
   ```

2. **Check CORS headers:**
   ```bash
   curl -I https://guidecdn.rylm.net/manifest.json
   # Should see: access-control-allow-origin: *
   ```

3. **Check manifest content:**
   ```bash
   curl https://guidecdn.rylm.net/manifest.json | jq
   ```

4. **Clear browser cache** and reload

### Invalid frontmatter error?

- Ensure YAML frontmatter is valid
- Use ISO 8601 date format: `2025-01-26T12:00:00Z`
- Quoted strings for special characters
- Arrays use `[item1, item2]` syntax

## 📚 Resources

- **Main README**: Full documentation
- **Dashboard Repo**: `/Users/hundeklemmen/Documents/GitHub/rylm/dashboard`
- **Blog Implementation**: See `app/blog/`, `components/blog/`, `lib/blog-cdn.ts`

## 🎉 You're All Set!

Your blog system is ready to go. Just:

1. ✅ Push to GitHub
2. ✅ Configure nginx CDN
3. ✅ Set up auto-sync
4. ✅ Start writing content!

Need help? Check README.md or open an issue on GitHub.
