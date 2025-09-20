#!/usr/bin/env python3
"""
Initialize data directories with sample data for Railway
"""
import os
import shutil
from pathlib import Path

def init_data_directories():
    """Create necessary directories and sample files"""
    directories = [
        "data/pdfs",
        "data/uploads", 
        "data/companies",
        "data/filtered_amms",
        "data/logs",
        "data/vector_db",
        "data/rbi-pdf",
        "data/dgft-pdfs",
        "data/gst-pdfs"
    ]
    
    for directory in directories:
        os.makedirs(directory, exist_ok=True)
        print(f"Created directory: {directory}")
    
    # Create empty metadata files if they don't exist
    metadata_files = [
        "data/metadata.json",
        "data/metadataRBI.json", 
        "data/metadataDGFT.json",
        "data/metadataGST.json"
    ]
    
    for file in metadata_files:
        if not os.path.exists(file):
            with open(file, 'w') as f:
                f.write('[]')
            print(f"Created empty metadata: {file}")

if __name__ == "__main__":
    init_data_directories()