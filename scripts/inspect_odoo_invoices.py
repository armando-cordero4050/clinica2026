import xmlrpc.client
import os
from dotenv import load_dotenv

load_dotenv('.env.local')

url = os.getenv('ODOO_URL')
db = os.getenv('ODOO_DB')
username = os.getenv('ODOO_USERNAME')
password = os.getenv('ODOO_PASSWORD')

if not all([url, db, username, password]):
    exit(1)

common = xmlrpc.client.ServerProxy('{}/xmlrpc/2/common'.format(url))
uid = common.authenticate(db, username, password, {})
models = xmlrpc.client.ServerProxy('{}/xmlrpc/2/object'.format(url))

print("📄 FETCHING INVOICES (account.move)...")

# 'move_type' = 'out_invoice' (Customer Invoice)
domain = [('move_type', '=', 'out_invoice')]
fields = [
    'id', 'name', 'partner_id', 'amount_total', 'amount_tax', 
    'state', 'invoice_date', 'payment_state', 'invoice_line_ids'
]

invoices = models.execute_kw(db, uid, password, 'account.move', 'search_read',
    [domain], 
    {'fields': fields, 'limit': 5}
)

print(f"Found {len(invoices)} invoices.\n")

for inv in invoices:
    total = inv.get('amount_total') or 0.0
    print(f"ID: {inv['id']} | {inv['name']} | Status: {inv['state']}")
    print(f"   Client: {inv['partner_id']}")
    print(f"   Total: {total} | Payment: {inv.get('payment_state')}")
    print("-" * 50)
