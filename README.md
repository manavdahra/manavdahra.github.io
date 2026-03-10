# Dev Blog - Software Engineering & AI Interpretability

A blogging website for sharing insights on Software Engineering and AI Interpretability, built with Flask and deployable to GitHub Pages as a static site.

## 🚀 Quick Start

### Development Mode (Flask with live reload)
```bash
# Install dependencies
uv sync

# Run development server
python app.py

# Visit http://localhost:5001
```

### Production (Deploy to GitHub Pages)
```bash
# Generate static files
python freeze.py

# Push to GitHub
git add docs/
git commit -m "Deploy to GitHub Pages"
git push
```

📖 **See [DEPLOYMENT.md](DEPLOYMENT.md) for complete deployment instructions**

## About

This blog is maintained by **Manav Dahra**, a backend engineer with 10 years of experience who recently pivoted toward AI safety research and mechanistic interpretability.

### Topics Covered
- **Software Engineering**: Distributed systems, databases, microservices, scalable applications
- **AI Interpretability**: Mechanistic interpretability, transformer circuits, AI safety
- **System Design**: Architectural patterns, performance optimization
- **Deep Learning**: PyTorch, transformers, practical ML applications

## 📝 Adding New Posts

1. **Create markdown file**: `posts/my-new-post.md`
2. **Add metadata** in `app.py` to the `BLOG_POSTS` list:
   ```python
   {
       'id': 5,
       'title': 'My Post Title',
       'slug': 'my-new-post',
       'date': datetime(2026, 3, 15),
       'category': 'Software Engineering',
       'tags': ['tag1', 'tag2'],
       'excerpt': 'Brief description',
       'read_time': '8 min read'
   }
   ```
3. **Regenerate static site**: `python freeze.py`
4. **Deploy**: Commit and push the `docs/` folder

## 🎨 Features

✅ Clean, responsive dark theme (matching [manavdahra.github.io](https://manavdahra.github.io))  
✅ Markdown support with syntax highlighting  
✅ Category tagging & filtering  
✅ Reading time estimates  
✅ Mobile-friendly design  
✅ Static site generation for GitHub Pages

## 📁 Project Structure

```
dev-blog/
├── app.py              # Flask application
├── freeze.py           # Static site generator
├── templates/          # Jinja2 templates
│   ├── base.html
│   ├── home.html
│   ├── about.html
│   ├── blog.html
│   └── post.html
├── static/css/         # Stylesheets
│   └── style.css
├── posts/             # Blog posts (Markdown)
│   ├── understanding-dynamodb-design-patterns.md
│   ├── mechanistic-interpretability-intro.md
│   ├── distributed-systems-lessons.md
│   └── transformer-circuits-attention.md
└── docs/              # Generated static site (for GitHub Pages)
    ├── .nojekyll
    ├── index.html
    ├── about/
    ├── blog/
    └── static/
```

## 🛠️ Tech Stack

- **Backend**: Flask (Python)
- **Frontend**: HTML5, CSS3, Jinja2
- **Content**: Markdown
- **Deployment**: GitHub Pages (static generation)
- **Fonts**: Inter, JetBrains Mono

## 🌐 Deployment

This blog uses a hybrid approach:
- **Development**: Flask server with live reload (`python app.py`)
- **Production**: Static HTML generated for GitHub Pages (`python freeze.py`)

The `freeze.py` script generates a complete static site in the `docs/` folder. Push this to GitHub and enable Pages from the `/docs` folder.

**📖 See [DEPLOYMENT.md](DEPLOYMENT.md) for step-by-step deployment instructions**

## 👤 Author

**Manav Dahra** - Backend Engineer & AI Interpretability Enthusiast

- LinkedIn: [linkedin.com/in/manav-dahra](https://www.linkedin.com/in/manav-dahra)
- Portfolio: [manavdahra.github.io](https://manavdahra.github.io/)
- Email: manav.dahra@gmail.com

### Current Experience
- **Senior Software Engineer @ Cisco ThousandEyes** (Oct 2024 - Present)
  - Building distributed systems for diagnostic internet tests on 100M+ home routers
  - Tech: DynamoDB, Kafka, Go, persistent connections

### AI Safety Research Focus
- Completed ARENA (AI Alignment Research Engineer Accelerator)
- Replicated papers from Anthropic's interpretability team
- Core stack: PyTorch, TransformerLens, Einops

## 📄 License

Personal blog content - all rights reserved.

---

**📖 Documentation:**
- [DEPLOYMENT.md](DEPLOYMENT.md) - Complete deployment guide for GitHub Pages
- [BLOG_README.md](BLOG_README.md) - Detailed blog features and usage
