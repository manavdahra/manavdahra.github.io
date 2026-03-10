# Deployment Documentation

This repository contains a static blog generated from Flask templates and Markdown content, deployed via GitHub Pages.

## Deployment Process

### Generate Static Files
```bash
python freeze.py
```

Creates the `docs/` directory with static HTML, CSS, and assets.

### Commit and Push
```bash
git add docs/
git add freeze.py
git commit -m "Add static site for GitHub Pages"
git push origin main
```

### GitHub Pages Configuration

Repository Settings → Pages:
- **Branch**: `main`
- **Folder**: `/docs`

Site URL: `https://<username>.github.io/dev-blog/`

Note: Changes typically propagate within 1-2 minutes.

## Adding New Blog Posts

### Create Markdown File

Add content to `posts/` directory:
```bash
posts/my-new-post.md
```

### Update Post Registry

Edit `app.py` and add entry to `BLOG_POSTS`:

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

### Deploy Updated Content

```bash
python freeze.py
git add docs/ app.py posts/
git commit -m "Add new blog post: My New Post"
git push
```


## Customization

### Color Scheme

Modify CSS variables in `static/css/style.css`:

```css
:root {
    --primary-color: #bdb76b;
    --secondary-color: #828631;
    --bg-primary: #213636;
    /* ... */
}
```

Regenerate and deploy:
```bash
python freeze.py
git add docs/
git commit -m "Update styling"
git push
```

### About Page Content

Edit `templates/about.html`, then regenerate:

```bash
python freeze.py
git add docs/
git commit -m "Update about page"
git push
```

## Troubleshooting

### Page Updates Not Reflecting

1. Clear browser cache (Ctrl+Shift+R or Cmd+Shift+R)
2. Check GitHub Actions tab for build errors
3. Verify `python freeze.py` was run before pushing

### CSS Not Loading

Verify `.nojekyll` file exists in `docs/`:
```bash
ls docs/.nojekyll
```

If missing, create it:
```bash
touch docs/.nojekyll
git add docs/.nojekyll
git commit -m "Add .nojekyll"
git push
```

### URL Structure Issues

GitHub Pages expects:
- Homepage: `/docs/index.html`
- Pages: `/docs/page-name/index.html`

The `freeze.py` script handles this structure automatically.

## Custom Domain (Optional)

### Setup Steps

1. Create CNAME file in `docs/`:
   ```bash
   echo "yourdomain.com" > docs/CNAME
   ```

2. Configure DNS records:
   - A records pointing to GitHub Pages IPs:
     - 185.199.108.153
     - 185.199.109.153
     - 185.199.110.153
     - 185.199.111.153
   - Or CNAME record to `<username>.github.io`

3. GitHub Settings → Pages:
   - Enter custom domain
   - Enable "Enforce HTTPS"

## Project Structure

```
dev-blog/
├── app.py              # Flask application (development server)
├── freeze.py           # Static site generator
├── templates/          # HTML templates
├── static/css/         # Stylesheets
├── posts/             # Blog post content (Markdown)
└── docs/              # Generated static site (served by GitHub Pages)
    ├── .nojekyll      # Disables Jekyll processing
    ├── index.html     # Homepage
    ├── about/
    ├── blog/
    └── static/
```

## Development Workflow

### Local Preview
```bash
# Development server with live reload
python app.py

# Or preview static output
open docs/index.html
```

### Build and Deploy
```bash
# Generate static site
python freeze.py

# Verify output
ls -R docs/

# Deploy
git add docs/
git commit -m "Update site"
git push
```

## Future Enhancements

- GitHub Action for automatic `freeze.py` execution on push
- Google Analytics integration via `templates/base.html`
- Additional automation as needed
