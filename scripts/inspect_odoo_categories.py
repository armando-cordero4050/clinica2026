import xmlrpc.client
import os
from dotenv import load_dotenv

load_dotenv('.env.local')

url = os.getenv('ODOO_URL')
db = os.getenv('ODOO_DB')
username = os.getenv('ODOO_USERNAME')
password = os.getenv('ODOO_PASSWORD')

if not all([url, db, username, password]):
    print("❌ Missing vars")
    exit(1)

common = xmlrpc.client.ServerProxy('{}/xmlrpc/2/common'.format(url))
uid = common.authenticate(db, username, password, {})
models = xmlrpc.client.ServerProxy('{}/xmlrpc/2/object'.format(url))

print("📦 ANALYZING CATEGORIES...")

# Get unique category IDs from products first
products = models.execute_kw(db, uid, password, 'product.template', 'search_read',
    [], 
    {'fields': ['categ_id', 'detailed_type'], 'limit': 100}
)

cat_ids = set()
types = set()

for p in products:
    if p.get('categ_id'):
        cat_ids.add(p['categ_id'][0])
    types.add(p.get('detailed_type'))

print(f"Found types: {types}")

# Fetch Category Details
if cat_ids:
    cats = models.execute_kw(db, uid, password, 'product.category', 'search_read',
        [[('id', 'in', list(cat_ids))]], 
        {'fields': ['id', 'name', 'parent_id']}
    )
    
    print("\nEXISTING ODOO CATEGORIES:")
    for c in cats:
        parent = c.get('parent_id')
        p_name = parent[1] if parent else "Root"
        print(f"ID: {c['id']} | Name: {c['name']} (Parent: {p_name})")

print("\n⚠️  CHECK CONSTRAINT IN DB: ('fija', 'removible', 'ortodoncia', 'implantes')")
