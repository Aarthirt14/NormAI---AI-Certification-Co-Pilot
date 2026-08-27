"""
scripts/migrate.py
==================
Performs database migrations to add the `embedding` column to `standard_clauses`.
Handles fallback gracefully:
1. Attempts to run `CREATE EXTENSION IF NOT EXISTS vector;`
2. If successful, creates the `embedding` column as `vector(768)`.
3. If the extension is not available (e.g. pgvector DLL not installed yet),
   creates the `embedding` column as `float8[]` (double precision array)
   so the application can run and perform semantic matching without crashing.
"""
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import psycopg2
from app.config import get_settings

def run_migration():
    settings = get_settings()
    db_url = settings.DATABASE_URL
    print(f"Connecting to database: {db_url}")

    try:
        conn = psycopg2.connect(db_url)
        cur = conn.cursor()

        # 1. Try to create pgvector extension
        has_extension = False
        try:
            cur.execute("CREATE EXTENSION IF NOT EXISTS vector;")
            conn.commit()
            has_extension = True
            print("pgvector extension created or verified in database.")
        except Exception as e:
            conn.rollback()
            print(f"Note: pgvector extension is not available on PostgreSQL server ({e.pgcode if hasattr(e, 'pgcode') else str(e).strip()}).")
            print("Falling back to float8[] array for embeddings.")

        # 2. Add column standard_clauses.embedding
        # First, check if column already exists
        cur.execute("""
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'standard_clauses' AND column_name = 'embedding'
        """)
        row = cur.fetchone()

        if row:
            print(f"Column 'embedding' already exists with type: {row[1]}")
        else:
            if has_extension:
                print("Adding 'embedding' column as 'vector(768)'...")
                cur.execute("ALTER TABLE standard_clauses ADD COLUMN embedding vector(768);")
            else:
                print("Adding 'embedding' column as 'float8[]'...")
                cur.execute("ALTER TABLE standard_clauses ADD COLUMN embedding float8[];")
            conn.commit()
            print("Column 'embedding' successfully added.")

        cur.close()
        conn.close()
        print("Migration completed successfully.")

    except Exception as e:
        print(f"Migration failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    run_migration()
