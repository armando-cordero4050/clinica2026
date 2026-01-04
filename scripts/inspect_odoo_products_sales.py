import xmlrpc.client
import os
import json
from dotenv import load_dotenv

# Load environment variables
load_dotenv('.env.local')

url = os.getenv('ODOO_URL')
db = os.getenv('ODOO_DB')
username = os.getenv('ODOO_USERNAME')
password = os.getenv('ODOO_PASSWORD')

if not all([url, db, username, password]):
    print("❌ Missing environment variables. Check .env.local")
    exit(1)

print(f"CONNECTING TO: {url} ({db})")

try:
    common = xmlrpc.client.ServerProxy('{}/xmlrpc/2/common'.format(url))
    uid = common.authenticate(db, username, password, {})
    
    if not uid:
        print("❌ Authentication Failed")
        exit(1)
        
    print(f"✅ Authenticated with UID: {uid}")
    models = xmlrpc.client.ServerProxy('{}/xmlrpc/2/object'.format(url))

    # --- TEST PRODUCTS (product.template) ---
    print("\n📦 FETCHING PRODUCTS (product.template)...")
    
    # Fields to inspect
    fields = [
        'id', 
        'name', 
        'detailed_type',    # service, product (storable), consu (consumable)
        'list_price',       # Sales Price
        'standard_price',   # Cost
        'categ_id',         # Category
        'default_code',     # Internal Reference / SKU
        'active',
        'taxes_id'          # Taxes
    ]
    
    # Fetch first 10 products
    products = models.execute_kw(db, uid, password, 'product.template', 'search_read',
        [[('active', '=', True)]], 
        {'fields': fields, 'limit': 10}
    )
    
    print(f"Found {len(products)} products. Analyzing structure...\n")
    
    for p in products:
        # Handle empty numeric fields with default 0 as requested
        price = p.get('list_price') or 0.0
        cost = p.get('standard_price') or 0.0
        
        print(f"ID: {p['id']} | [{p.get('default_code') or 'NO-SKU'}] {p['name']}")
        print(f"   Type: {p.get('detailed_type')} | Cat: {p.get('categ_id')}")
        print(f"   Price: {price} | Cost: {cost}")
        print("-" * 50)

    # --- TEST SALES (sale.order) ---
    print("\n💰 FETCHING SALES (sale.order)...")
    sale_fields = ['id', 'name', 'partner_id', 'amount_total', 'state', 'date_order', 'order_line']
    sales = models.execute_kw(db, uid, password, 'sale.order', 'search_read',
        [], 
        {'fields': sale_fields, 'limit': 5}
    )
    
    for s in sales:
        total = s.get('amount_total') or 0.0
        print(f"ID: {s['id']} | {s['name']} | Status: {s['state']}")
        print(f"   Client: {s['partner_id']}")
        print(f"   Total: {total} | Date: {s.get('date_order')}")
        print("-" * 50)

except Exception as e:
    print(f"\n❌ ERROR: {e}")
