"""
Dev Blog - Main entry point
Run the Flask application
"""
import subprocess
import sys

def main():
    """Run the Flask blog application"""
    print("Starting Dev Blog...")
    print("Visit http://localhost:5000 in your browser")
    print("\nPress Ctrl+C to stop the server\n")
    
    # Run the Flask app
    subprocess.run([sys.executable, "app.py"])


if __name__ == "__main__":
    main()
