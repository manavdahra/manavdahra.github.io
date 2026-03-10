# GitHub Pages Deployment Guide

Your blog has been set up for static site generation and is ready to deploy to GitHub Pages!

## 🚀 Quick Deploy

### 1. Generate Static Files
```bash
python freeze.py
```

This creates a `docs/` folder with all the static HTML, CSS, and assets.

### 2. Commit to GitHub
```bash
git add docs/
git add freeze.py
git commit -m "Add static site for GitHub Pages"
git push origin main
```

### 3. Enable GitHub Pages

1. Go to your repository on GitHub
2. Click **Settings** → **Pages** (in the left sidebar)
3. Under "Source", select:
   - **Branch**: `main`
   - **Folder**: `/docs`
4. Click **Save**

### 4. Access Your Blog

Your blog will be available at:
```
https://<your-username>.github.io/dev-blog/
```

For example: `https://manavdahra.github.io/dev-blog/`

⏱️ It usually takes 1-2 minutes for the site to go live after pushing.

---

## 📝 Adding New Blog Posts

### Step 1: Write Content

Create a new Markdown file in the `posts/` directory:
```bash
posts/my-new-post.md
```

### Step 2: Add Metadata

Edit `app.py` and add your post to the `BLOG_POSTS` list:

```python
{
    'id': 5,
    'title': 'My New Post Title',
    'slug': 'my-new-post',  # Must match filename without .md
    'date': datetime(2026, 3, 15),
    'category': 'Software Engineering',  # or 'AI Interpretability'
    'tags': ['tag1', 'tag2', 'tag3'],
    'excerpt': 'Brief description of the post',
    'read_time': '7 min read'
}
```

### Step 3: Regenerate & Deploy

```bash
# Generate static files
python freeze.py

# Commit and push
git add docs/ app.py posts/
git commit -m "Add new blog post: My New Post"
git push
```

Your new post will be live in 1-2 minutes!

---

## 🎨 Customizing

### Update Colors

Edit `static/css/style.css` - the CSS variables at the top:

```css
:root {
    --primary-color: #bdb76b;
    --secondary-color: #828631;
    --bg-primary: #213636;
    /* ... */
}
```

After making changes:
```bash
python freeze.py  # Regenerate
git add docs/
git commit -m "Update styling"
git push
```

### Update About Page

Edit the content in `templates/about.html`, then regenerate:

```bash
python freeze.py
git add docs/
git commit -m "Update about page"
git push
```

---

## 🔧 Troubleshooting

### Pages Not Updating?

1. Clear your browser cache (Ctrl+Shift+R or Cmd+Shift+R)
2. Check GitHub Actions tab for build errors
3. Make sure you ran `python freeze.py` before pushing

### CSS Not Loading?

Make sure the `.nojekyll` file exists in the `docs/` folder:
```bash
ls docs/.nojekyll
```

If missing:
```bash
touch docs/.nojekyll
git add docs/.nojekyll
git commit -m "Add .nojekyll"
git push
```

### Wrong URL Structure?

GitHub Pages expects:
- Homepage: `/docs/index.html`
- Pages: `/docs/page-name/index.html`

The freeze script handles this automatically.

---

## 🌐 Custom Domain (Optional)

### Using a Custom Domain

1. Add a `CNAME` file to `docs/`:
   ```bash
   echo "yourdomain.com" > docs/CNAME
   ```

2. Configure DNS:
   - Add A records pointing to GitHub's IPs:
     - 185.199.108.153
     - 185.199.109.153
     - 185.199.110.153
     - 185.199.111.153
   - Or CNAME to `<username>.github.io`

3. In GitHub Settings → Pages:
   - Enter your custom domain
   - Check "Enforce HTTPS"

---

## 📦 Project Structure

```
dev-blog/
├── app.py              # Flask application (development)
├── freeze.py           # Static site generator
├── templates/          # HTML templates
├── static/css/         # Stylesheets
├── posts/             # Blog post content (Markdown)
└── docs/              # Generated static site (GitHub Pages serves from here)
    ├── .nojekyll      # Tells GitHub not to use Jekyll
    ├── index.html     # Homepage
    ├── about/
    ├── blog/
    └── static/
```

---

## ✨ Tips

- **Preview locally**: Open `docs/index.html` in your browser before deploying
- **Test the Flask app**: Run `python app.py` for local development with live reload
- **Automation**: Set up a GitHub Action to run `freeze.py` automatically on push
- **Analytics**: Add Google Analytics by editing `templates/base.html`

---

## Need Help?

Common commands:
```bash
# Development server (with live reload)
python app.py

# Generate static site
python freeze.py

# Check generated files
ls -R docs/

# Deploy to GitHub
git add docs/
git commit -m "Update site"
git push
```

Happy blogging! 🎉
