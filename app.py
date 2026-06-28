"""
Dev Blog - A blogging website for sharing learnings on Software Engineering and AI Interpretability
"""
from flask import Flask, render_template, abort, send_from_directory
from datetime import datetime
import markdown
import re
import os
from pathlib import Path

app = Flask(__name__)
app.config['SECRET_KEY'] = 'dev-secret-key-change-in-production'

# Blog posts data structure
BLOG_POSTS = [
    {
        'title': 'Hypothesis generation and Maximum Likelihood Estimation',
        'slug': 'aimlj-2-hypothesis',
        'date': datetime(2026, 6, 27),
        'category': 'AI/ML',
        'tags': ['ai', 'ml', 'ml-principle', 'math'],
        'excerpt': 'The guiding principle to follow for building models',
        'read_time': '15 min read',
        'type': 'interactive',
    },
    {
        'title': 'Intro to Machine learning',
        'slug': 'aimlj-1',
        'date': datetime(2026, 6, 24),
        'category': 'AI/ML',
        'tags': ['ai', 'ml', 'general advice'],
        'excerpt': 'The right way to approach ML and why it is important to learn the Math',
        'read_time': '15 min read',
    },
    {
        'title': '3D Snake Game: WebGL Physics Demo',
        'slug': 'snake-game',
        'date': datetime(2026, 3, 10),
        'category': 'Interactive Demo',
        'tags': ['webgl', 'three.js', 'cannon.js', 'game-dev', 'javascript'],
        'excerpt': 'A playable 3D snake game built with Three.js and Cannon.js physics engine. Use arrow keys or touch controls to play!',
        'read_time': '12 min read',
        'type': 'game'
    },
    {
        'title': 'Understanding DynamoDB: Design Patterns for Scale',
        'slug': 'understanding-dynamodb-design-patterns',
        'date': datetime(2026, 3, 5),
        'category': 'Software Engineering',
        'tags': ['distributed-systems', 'databases', 'aws', 'dynamodb'],
        'excerpt': 'Deep dive into DynamoDB design patterns learned from building systems that serve millions of users.',
        'read_time': '8 min read'
    },
    {
        'title': 'Building Distributed Systems: Lessons from the Trenches',
        'slug': 'distributed-systems-lessons',
        'date': datetime(2026, 2, 20),
        'category': 'Software Engineering',
        'tags': ['distributed-systems', 'microservices', 'kafka', 'architecture'],
        'excerpt': 'Real-world lessons learned from building and scaling distributed systems for millions of users.',
        'read_time': '10 min read'
    },
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
            # Extract mermaid blocks before markdown processing (codehilite mangles them)
            content = re.sub(
                r'```mermaid\n(.*?)```',
                lambda m: '<div class="mermaid">' + m.group(1) + '</div>',
                content,
                flags=re.DOTALL
            )
            # Protect math expressions from markdown processing (_underscores_ become <em>)
            math_blocks = []
            def stash_math(m):
                math_blocks.append(m.group(0))
                return f'MATHSTASH{len(math_blocks) - 1}END'

            content = re.sub(r'\\begin\{[^}]+\}.+?\\end\{[^}]+\}', stash_math, content, flags=re.DOTALL)
            content = re.sub(r'\$\$.+?\$\$', stash_math, content, flags=re.DOTALL)
            content = re.sub(r'\$[^\$\n]+?\$', stash_math, content)
            # Convert markdown to HTML
            html_content = markdown.markdown(content, extensions=['fenced_code', 'codehilite', 'tables'])
            # Restore math expressions
            for i, block in enumerate(math_blocks):
                html_content = html_content.replace(f'MATHSTASH{i}END', block)
            post['content'] = html_content
    else:
        post['content'] = '<p>Content coming soon...</p>'
    
    # Snake game uses a dedicated game template; all other posts use post.html
    if post.get('type') == 'game':
        return render_template('post_game.html', post=post)
    
    return render_template('post.html', post=post)

@app.route('/game/<path:filename>')
def serve_game_files(filename):
    """Serve game files (JS modules)"""
    response = send_from_directory('src/game', filename)
    if filename.endswith('.js'):
        response.headers['Content-Type'] = 'application/javascript'
    return response

@app.route('/aiml/<path:filename>')
def serve_aiml_files(filename):
    """Serve AI/ML interactive demo files"""
    response = send_from_directory('src/aiml', filename)
    if filename.endswith('.js'):
        response.headers['Content-Type'] = 'application/javascript'
    return response

@app.template_filter('format_date')
def format_date(date):
    """Format date for display"""
    return date.strftime('%B %d, %Y')

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001)
