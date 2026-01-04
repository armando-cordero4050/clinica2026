"""
Query Odoo: Companies and their Contacts
"""
import xmlrpc.client
from dotenv import load_dotenv
import os
from tabulate import tabulate

# Cargar variables de entorno
load_dotenv('.env.local')

# Configuración de Odoo
ODOO_URL = os.getenv('ODOO_URL')
ODOO_DB = os.getenv('ODOO_DB')
ODOO_USERNAME = os.getenv('ODOO_USERNAME')
ODOO_PASSWORD = os.getenv('ODOO_PASSWORD')

def main():
    print("=" * 80)
    print("CONSULTA ODOO: Empresas y sus Contactos")
    print("=" * 80)
    
    try:
        # Conectar a Odoo
        common = xmlrpc.client.ServerProxy(f'{ODOO_URL}/xmlrpc/2/common')
        uid = common.authenticate(ODOO_DB, ODOO_USERNAME, ODOO_PASSWORD, {})
        
        if not uid:
            print("❌ Error: Autenticación fallida")
            return
        
        print(f"\n✅ Conectado a Odoo (UID: {uid})")
        
        models = xmlrpc.client.ServerProxy(f'{ODOO_URL}/xmlrpc/2/object')
        
        # 1. Obtener empresas (is_company=True, customer_rank>0)
        print("\n📋 Obteniendo empresas...")
        company_ids = models.execute_kw(
            ODOO_DB, uid, ODOO_PASSWORD,
            'res.partner', 'search',
            [[('is_company', '=', True), ('customer_rank', '>', 0)]],
            {'limit': 20}
        )
        
        companies = models.execute_kw(
            ODOO_DB, uid, ODOO_PASSWORD,
            'res.partner', 'read',
            [company_ids],
            {'fields': ['id', 'name', 'email', 'phone', 'mobile', 'vat', 'child_ids']}
        )
        
        print(f"✅ Encontradas {len(companies)} empresas\n")
        
        # 2. Para cada empresa, obtener sus contactos
        all_data = []
        
        for company in companies:
            company_name = company['name']
            company_id = company['id']
            company_email = company.get('email') or 'N/A'
            company_phone = company.get('phone') or company.get('mobile') or 'N/A'
            company_vat = company.get('vat') or 'N/A'
            
            # Obtener contactos (child_ids)
            contact_ids = company.get('child_ids', [])
            
            if contact_ids:
                contacts = models.execute_kw(
                    ODOO_DB, uid, ODOO_PASSWORD,
                    'res.partner', 'read',
                    [contact_ids],
                    {'fields': ['id', 'name', 'email', 'phone', 'mobile', 'function']}
                )
                
                for contact in contacts:
                    all_data.append([
                        company_id,
                        company_name,
                        company_vat,
                        company_email,
                        company_phone,
                        contact['id'],
                        contact['name'],
                        contact.get('function') or 'N/A',
                        contact.get('email') or 'N/A',
                        contact.get('phone') or contact.get('mobile') or 'N/A'
                    ])
            else:
                # Empresa sin contactos
                all_data.append([
                    company_id,
                    company_name,
                    company_vat,
                    company_email,
                    company_phone,
                    '-',
                    'Sin contactos',
                    '-',
                    '-',
                    '-'
                ])
        
        # 3. Mostrar tabla
        headers = [
            'Empresa ID',
            'Empresa',
            'NIT',
            'Email Empresa',
            'Tel Empresa',
            'Contacto ID',
            'Contacto',
            'Puesto',
            'Email Contacto',
            'Tel Contacto'
        ]
        
        print("\n" + "=" * 80)
        print("TABLA: EMPRESAS Y SUS CONTACTOS")
        print("=" * 80 + "\n")
        
        print(tabulate(all_data, headers=headers, tablefmt='grid'))
        
        # 4. Resumen
        print("\n" + "=" * 80)
        print("RESUMEN")
        print("=" * 80)
        print(f"Total de empresas: {len(companies)}")
        print(f"Total de contactos: {len([d for d in all_data if d[5] != '-'])}")
        print(f"Empresas sin contactos: {len([d for d in all_data if d[5] == '-'])}")
        
    except Exception as e:
        print(f"\n❌ Error: {str(e)}")

if __name__ == "__main__":
    main()
