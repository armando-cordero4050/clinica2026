
import os
import psycopg2
from dotenv import load_dotenv

load_dotenv(r'd:\DentalFlow\.env')

def inspect_users():
    try:
        conn = psycopg2.connect(os.getenv('DATABASE_URL'))
        cur = conn.cursor()
        cur.execute("SELECT column_name, data_type FROM information_schema.columns WHERE table_schema = 'schema_core' AND table_name = 'users';")
        rows = cur.fetchall()
        print("Columns in schema_core.users:")
        for r in rows:
            print(f"- {r[0]} ({r[1]})")
        
        print("\nSample Data (first 1):")
        cur.execute("SELECT * FROM schema_core.users LIMIT 1;")
        cols = [desc[0] for desc in cur.description]
        row = cur.fetchone()
        if row:
            print(dict(zip(cols, row)))
        
        conn.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    inspect_users()
