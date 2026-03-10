"""
Dev Blog - A blogging website for sharing learnings on Software Engineering and AI Interpretability
"""
from flask import Flask, render_template, abort
from datetime import datetime
import markdown
import os
from pathlib import Path

app = Flask(__name__)
app.config['SECRET_KEY'] = 'dev-secret-key-change-in-production'

# Blog posts data structure
BLOG_POSTS = [
    {
        'id': 1,
        'title': 'Understanding DynamoDB: Design Patterns for Scale',
        'slug': 'understanding-dynamodb-design-patterns',
        'date': datetime(2026, 3, 5),
        'category': 'Software Engineering',
        'tags': ['distributed-systems', 'databases', 'aws', 'dynamodb'],
        'excerpt': 'Deep dive into DynamoDB design patterns learned from building systems that serve millions of users.',
        'read_time': '8 min read'
    },
    {
        'id': 2,
        'title': 'Mechanistic Interpretability: A Practical Introduction',
        'slug': 'mechanistic-interpretability-intro',
        'date': datetime(2026, 3, 1),
        'category': 'AI Interpretability',
        'tags': ['interpretability', 'transformers', 'ai-safety', 'pytorch'],
        'excerpt': 'An introduction to mechanistic interpretability and why understanding model internals matters for AI safety.',
        'read_time': '12 min read'
    },
    {
        'id': 3,
        'title': 'Building Distributed Systems: Lessons from the Trenches',
        'slug': 'distributed-systems-lessons',
        'date': datetime(2026, 2, 20),
        'category': 'Software Engineering',
        'tags': ['distributed-systems', 'microservices', 'kafka', 'architecture'],
        'excerpt': 'Real-world lessons learned from building and scaling distributed systems for millions of users.',
        'read_time': '10 min read'
    },
    {
        'id': 4,
        'title': 'Transformer Circuits: Understanding Attention Mechanisms',
        'slug': 'transformer-circuits-attention',
        'date': datetime(2026, 2, 15),
        'category': 'AI Interpretability',
        'tags': ['transformers', 'attention', 'interpretability', 'neural-networks'],
        'excerpt': 'Breaking down how attention mechanisms work in transformers using TransformerLens and circuit analysis.',
        'read_time': '15 min read'
    }
]

@app.route('/')
def home():
    """Home page with latest blog posts"""
    # Sort posts by date, newest first
    posts = sorted(BLOG_POSTS, key=lambda x: x['date'], reverse=True)
    return render_template('home.html', posts=posts)

@app.route('/about')
def about():
    """About page"""
    return render_template('about.html')

@app.route('/blog')
def blog():
    """Blog listing page"""
    # Sort posts by date, newest first
    posts = sorted(BLOG_POSTS, key=lambda x: x['date'], reverse=True)
    return render_template('blog.html', posts=posts)

@app.route('/blog/<slug>')
def blog_post(slug):
    """Individual blog post page"""
    # Find post by slug
    post = next((p for p in BLOG_POSTS if p['slug'] == slug), None)
    
    if not post:
        abort(404)
    
    # Load blog post content from markdown file
    post_file = Path(f'posts/{slug}.md')
    if post_file.exists():
        with open(post_file, 'r', encoding='utf-8') as f:
            content = f.read()
            # Convert markdown to HTML
            html_content = markdown.markdown(content, extensions=['fenced_code', 'codehilite', 'tables'])
            post['content'] = html_content
    else:
        post['content'] = '<p>Content coming soon...</p>'
    
    return render_template('post.html', post=post)

@app.template_filter('format_date')
def format_date(date):
    """Format date for display"""
    return date.strftime('%B %d, %Y')

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001)
