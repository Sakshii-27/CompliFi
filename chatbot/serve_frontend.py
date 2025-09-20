#!/usr/bin/env python3
"""
Simple HTTP server to serve the React frontend files
Run this if you have Node.js issues
"""
import http.server
import socketserver
import os
import webbrowser

PORT = 3000
DIRECTORY = "frontend"

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

if __name__ == "__main__":
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        print(f"Serving frontend at http://localhost:{PORT}")
        print("Press Ctrl+C to stop")
        
        # Try to open browser
        try:
            webbrowser.open(f"http://localhost:{PORT}")
        except:
            pass
            
        httpd.serve_forever()
