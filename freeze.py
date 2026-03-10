"""
Generate static HTML files for GitHub Pages deployment
Custom implementation to avoid frozen-flask compatibility issues
"""
from app import app, BLOG_POSTS
import os
import shutil
import re
from pathlib import Path

def fix_paths_in_html(html_content, depth=0):
    """
    Fix absolute paths to relative paths for static site hosting.
    depth: how many levels deep the file is (0 for root, 1 for /about/, 2 for /blog/post/)
    """
    prefix = '../' * depth if depth > 0 else './'
    
    # Fix static asset paths
    html_content = re.sub(r'href="/static/', f'href="{prefix}static/', html_content)
    html_content = re.sub(r'src="/static/', f'src="{prefix}static/', html_content)
    
    # Fix navigation links based on depth
    if depth == 0:
        # Root level: index.html
        html_content = re.sub(r'<a href="/"', '<a href="index.html"', html_content)
        html_content = re.sub(r'<a href="/about"', '<a href="about/index.html"', html_content)
        html_content = re.sub(r'<a href="/blog"', '<a href="blog/index.html"', html_content)
        # Fix blog post links
        html_content = re.sub(r'href="/blog/([^"]+)"', r'href="blog/\1/index.html"', html_content)
    elif depth == 1:
        # First level subdirectory: /about/ or /blog/
        html_content = re.sub(r'<a href="/"', '<a href="../index.html"', html_content)
        html_content = re.sub(r'<a href="/about"', '<a href="../about/index.html"', html_content)
        html_content = re.sub(r'<a href="/blog"', '<a href="../blog/index.html"', html_content)
        # Fix blog post links from blog listing
        html_content = re.sub(r'href="/blog/([^"]+)"', r'href="\1/index.html"', html_content)
    elif depth == 2:
        # Second level: /blog/post-name/
        html_content = re.sub(r'<a href="/"', '<a href="../../index.html"', html_content)
        html_content = re.sub(r'<a href="/about"', '<a href="../../about/index.html"', html_content)
        html_content = re.sub(r'<a href="/blog"', '<a href="../../blog/index.html"', html_content)
        # Fix blog post links
        html_content = re.sub(r'href="/blog/([^"]+)"', r'href="../\1/index.html"', html_content)
    
    return html_content

def generate_static_site():
    """Generate static HTML files from Flask app"""
    
    # Clean and create docs directory
    docs_dir = Path('docs')
    if docs_dir.exists():
        shutil.rmtree(docs_dir)
    docs_dir.mkdir()
    
    print("🔥 Generating static HTML files...")
    print(f"📁 Output directory: {docs_dir}")
    print()
    
    with app.test_client() as client:
        # Generate home page
        print("  📄 Generating index.html")
        response = client.get('/')
        html = fix_paths_in_html(response.get_data(as_text=True), depth=0)
        (docs_dir / 'index.html').write_text(html)
        
        # Generate about page
        print("  📄 Generating about/index.html")
        response = client.get('/about')
        about_dir = docs_dir / 'about'
        about_dir.mkdir()
        html = fix_paths_in_html(response.get_data(as_text=True), depth=1)
        (about_dir / 'index.html').write_text(html)
        
        # Generate blog listing page
        print("  📄 Generating blog/index.html")
        response = client.get('/blog')
        blog_dir = docs_dir / 'blog'
        blog_dir.mkdir()
        html = fix_paths_in_html(response.get_data(as_text=True), depth=1)
        (blog_dir / 'index.html').write_text(html)
        
        # Generate individual blog posts
        for post in BLOG_POSTS:
            slug = post['slug']
            print(f"  📄 Generating blog/{slug}/index.html")
            response = client.get(f'/blog/{slug}')
            post_dir = blog_dir / slug
            post_dir.mkdir()
            html = fix_paths_in_html(response.get_data(as_text=True), depth=2)
            (post_dir / 'index.html').write_text(html)
        
        # Copy static files
        print("  📦 Copying static files...")
        static_src = Path('static')
        static_dst = docs_dir / 'static'
        if static_src.exists():
            shutil.copytree(static_src, static_dst)
        
        # Create .nojekyll file
        print("  📝 Creating .nojekyll file")
        (docs_dir / '.nojekyll').touch()
    
    print()
    print("✅ Static site generated successfully!")
    print()
    print(f"📊 Generated {3 + len(BLOG_POSTS)} HTML pages")
    print(f"📁 Output: {docs_dir.absolute()}")
    print()
    print("🧪 Test locally:")
    print(f"   open {docs_dir / 'index.html'}")
    print()
    print("📋 Deploy to GitHub Pages:")
    print("   git add docs/")
    print("   git commit -m 'Deploy to GitHub Pages'")
    print("   git push")
    print()
    print("⚙️  Enable GitHub Pages:")
    print("   Settings → Pages → Source: 'main branch /docs folder'")
    print()
    print("🌐 Your blog will be available at:")
    print("   https://yourusername.github.io/dev-blog/")

if __name__ == '__main__':
    try:
        generate_static_site()
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
        exit(1)
