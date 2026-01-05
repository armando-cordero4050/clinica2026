import os
import shutil
import zipfile
import json
import csv
import datetime
import logging
from typing import List
from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import psycopg2
import psycopg2.extras
from dotenv import load_dotenv

# Setup Logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Load Env
# Load Env
load_dotenv(os.path.join(os.path.dirname(__file__), '../../.env'))

app = FastAPI(title="DentalFlow Backup Sidecar")

# Config with Absolute Paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
TEMPLATES_DIR = os.path.join(BASE_DIR, "templates")
templates = Jinja2Templates(directory=TEMPLATES_DIR)

BACKUP_ROOT = r"D:\DentalFlow_Backups"
SOURCE_DIR = r"D:\DentalFlow"
DATABASE_URL = os.getenv("DATABASE_URL")

# --- Utilities ---

def get_db_connection():
    if not DATABASE_URL:
        raise Exception("DATABASE_URL not found in .env")
    return psycopg2.connect(DATABASE_URL)

def get_all_tables(conn):
    """Retrieve all user tables from public and app schemas."""
    query = """
    SELECT table_schema, table_name 
    FROM information_schema.tables 
    WHERE table_type = 'BASE TABLE' 
    AND table_schema IN ('public', 'schema_core', 'schema_medical', 'schema_lab', 'schema_logistics', 'auth');
    """
    with conn.cursor() as cur:
        cur.execute(query)
        return cur.fetchall()

def dump_table_to_json(conn, schema, table, output_file):
    """Select * from table and write to JSON Lines file."""
    query = f'SELECT * FROM "{schema}"."{table}"'
    with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
        try:
            cur.execute(query)
            with open(output_file, 'w', encoding='utf-8') as f:
                for row in cur:
                    # Convert datetimes to string
                    json_row = json.dumps(row, default=str)
                    f.write(json_row + '\n')
            return True
        except Exception as e:
            logger.error(f"Failed to dump {schema}.{table}: {e}")
            return False

def zip_source_code(output_path):
    """Zip specific folders from D:\DentalFlow."""
    # Exclude heavy folders
    EXCLUDE_DIRS = {'node_modules', '.next', '.git', 'logs', 'tmp', '.gemini'}
    
    with zipfile.ZipFile(output_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk(SOURCE_DIR):
            # Block excluded dirs from traversal
            dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRS]
            
            for file in files:
                file_path = os.path.join(root, file)
                arcname = os.path.relpath(file_path, SOURCE_DIR)
                zipf.write(file_path, arcname)

# --- Routes ---

class BackupRequest(BaseModel):
    include_code: bool = True
    include_db: bool = True
    note: str = ""

@app.get("/", response_class=HTMLResponse)
async def read_dashboard(request: Request):
    return templates.TemplateResponse("dashboard.html", {"request": request})

@app.get("/api/backup/list")
def list_backups():
    if not os.path.exists(BACKUP_ROOT):
        return {"backups": []}
        
    backups = []
    for entry in os.scandir(BACKUP_ROOT):
        if entry.is_dir():
            meta_path = os.path.join(entry.path, "meta.json")
            if os.path.exists(meta_path):
                try:
                    with open(meta_path, 'r') as f:
                        meta = json.load(f)
                        # Calculate size
                        size_bytes = sum(f.stat().st_size for f in os.scandir(entry.path) if f.is_file())
                        meta['size'] = f"{size_bytes / (1024*1024):.2f} MB"
                        backups.append(meta)
                except:
                    pass
    
    # Sort by date desc
    backups.sort(key=lambda x: x['timestamp'], reverse=True)
    return {"backups": backups}

@app.post("/api/backup/create")
def create_backup(payload: BackupRequest):
    timestamp = datetime.datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
    backup_dir = os.path.join(BACKUP_ROOT, timestamp)
    os.makedirs(backup_dir, exist_ok=True)
    
    summary = {
        "id": timestamp,
        "timestamp": datetime.datetime.now().isoformat(),
        "date": timestamp,
        "type": [],
        "note": payload.note,
        "files": []
    }

    try:
        # 1. DB Backup
        if payload.include_db:
            db_dir = os.path.join(backup_dir, "database")
            os.makedirs(db_dir, exist_ok=True)
            logger.info("Starting DB Backup...")
            
            conn = get_db_connection()
            tables = get_all_tables(conn)
            
            for schema, table in tables:
                file_name = f"{schema}_{table}.jsonl"
                out_file = os.path.join(db_dir, file_name)
                if dump_table_to_json(conn, schema, table, out_file):
                    summary['files'].append(file_name)
            
            conn.close()
            summary['type'].append("DB")
            logger.info("DB Backup complete.")

        # 2. Code Backup
        if payload.include_code:
            logger.info("Starting Code Backup...")
            code_zip = os.path.join(backup_dir, f"source_{timestamp}.zip")
            zip_source_code(code_zip)
            summary['type'].append("CODE")
            logger.info("Code Backup complete.")

        # Save Metadata
        summary['type'] = " + ".join(summary['type'])
        with open(os.path.join(backup_dir, "meta.json"), 'w') as f:
            json.dump(summary, f, indent=2)

        return {"success": True, "message": "Backup created successfully", "backup_id": timestamp, "path": backup_dir}

    except Exception as e:
        logger.error(f"Backup failed: {str(e)}")
        return {"success": False, "message": str(e)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
