"""
Script 1: Test Odoo Connection
Prueba la conexión con Odoo y lista los primeros partners
"""
import xmlrpc.client
from dotenv import load_dotenv
import os
import json

# Cargar variables de entorno
load_dotenv('.env.local')

# Configuración de Odoo
ODOO_URL = os.getenv('ODOO_URL')
ODOO_DB = os.getenv('ODOO_DB')
ODOO_USERNAME = os.getenv('ODOO_USERNAME')
ODOO_PASSWORD = os.getenv('ODOO_PASSWORD')

def test_connection():
    """Prueba la conexión con Odoo"""
    print("=" * 60)
    print("TEST 1: Conexión con Odoo")
    print("=" * 60)
    
    try:
        # Conectar a Odoo
        common = xmlrpc.client.ServerProxy(f'{ODOO_URL}/xmlrpc/2/common')
        
        # Autenticar
        print(f"\n📡 Conectando a: {ODOO_URL}")
        print(f"📊 Base de datos: {ODOO_DB}")
        print(f"👤 Usuario: {ODOO_USERNAME}")
        
        uid = common.authenticate(ODOO_DB, ODOO_USERNAME, ODOO_PASSWORD, {})
        
        if uid:
            print(f"\n✅ Autenticación exitosa! UID: {uid}")
            
            # Obtener versión de Odoo
            version = common.version()
            print(f"\n📦 Versión de Odoo:")
            print(f"   - Server: {version.get('server_version')}")
            print(f"   - Protocol: {version.get('protocol_version')}")
            
            return uid
        else:
            print("\n❌ Error: Autenticación fallida")
            return None
            
    except Exception as e:
        print(f"\n❌ Error de conexión: {str(e)}")
        return None

def list_partners(uid):
    """Lista los primeros 5 partners de Odoo"""
    print("\n" + "=" * 60)
    print("TEST 2: Listar Partners (Clientes)")
    print("=" * 60)
    
    try:
        models = xmlrpc.client.ServerProxy(f'{ODOO_URL}/xmlrpc/2/object')
        
        # Buscar partners que sean compañías y clientes
        partner_ids = models.execute_kw(
            ODOO_DB, uid, ODOO_PASSWORD,
            'res.partner', 'search',
            [[('is_company', '=', True), ('customer_rank', '>', 0)]],
            {'limit': 5}
        )
        
        print(f"\n📋 Encontrados {len(partner_ids)} partners (mostrando primeros 5)")
        
        if partner_ids:
            # Leer datos de los partners
            partners = models.execute_kw(
                ODOO_DB, uid, ODOO_PASSWORD,
                'res.partner', 'read',
                [partner_ids],
                {'fields': ['id', 'name', 'email', 'phone', 'mobile', 'vat', 
                           'street', 'city', 'country_id', 'property_payment_term_id']}
            )
            
            # Mostrar cada partner
            for i, partner in enumerate(partners, 1):
                print(f"\n{'─' * 60}")
                print(f"Partner #{i}")
                print(f"{'─' * 60}")
                print(f"ID:       {partner.get('id')}")
                print(f"Nombre:   {partner.get('name')}")
                print(f"Email:    {partner.get('email') or 'N/A'}")
                print(f"Teléfono: {partner.get('phone') or 'N/A'}")
                print(f"Móvil:    {partner.get('mobile') or 'N/A'}")
                print(f"NIT:      {partner.get('vat') or 'N/A'}")
                print(f"Calle:    {partner.get('street') or 'N/A'}")
                print(f"Ciudad:   {partner.get('city') or 'N/A'}")
                
                country = partner.get('country_id')
                if country and isinstance(country, list):
                    print(f"País:     {country[1]} (ID: {country[0]})")
                else:
                    print(f"País:     N/A")
                
                payment_term = partner.get('property_payment_term_id')
                if payment_term and isinstance(payment_term, list):
                    print(f"Término:  {payment_term[1]} (ID: {payment_term[0]})")
                else:
                    print(f"Término:  N/A")
            
            # Guardar JSON completo para referencia
            print(f"\n{'─' * 60}")
            print("💾 Guardando datos completos en 'odoo_partners_sample.json'")
            with open('scripts/odoo_partners_sample.json', 'w', encoding='utf-8') as f:
                json.dump(partners, f, indent=2, ensure_ascii=False)
            print("✅ Archivo guardado exitosamente")
            
        else:
            print("\n⚠️  No se encontraron partners")
            
    except Exception as e:
        print(f"\n❌ Error listando partners: {str(e)}")

def list_products(uid):
    """Lista los primeros 5 productos de Odoo"""
    print("\n" + "=" * 60)
    print("TEST 3: Listar Productos (Servicios)")
    print("=" * 60)
    
    try:
        models = xmlrpc.client.ServerProxy(f'{ODOO_URL}/xmlrpc/2/object')
        
        # Buscar productos que sean servicios y estén activos
        product_ids = models.execute_kw(
            ODOO_DB, uid, ODOO_PASSWORD,
            'product.product', 'search',
            [[('sale_ok', '=', True), ('active', '=', True), ('type', '=', 'service')]],
            {'limit': 5}
        )
        
        print(f"\n📋 Encontrados {len(product_ids)} productos (mostrando primeros 5)")
        
        if product_ids:
            # Leer datos de los productos
            products = models.execute_kw(
                ODOO_DB, uid, ODOO_PASSWORD,
                'product.product', 'read',
                [product_ids],
                {'fields': ['id', 'default_code', 'name', 'categ_id', 
                           'list_price', 'standard_price', 'description', 'active']}
            )
            
            # Mostrar cada producto
            for i, product in enumerate(products, 1):
                print(f"\n{'─' * 60}")
                print(f"Producto #{i}")
                print(f"{'─' * 60}")
                print(f"ID:          {product.get('id')}")
                print(f"Código:      {product.get('default_code') or 'N/A'}")
                print(f"Nombre:      {product.get('name')}")
                
                category = product.get('categ_id')
                if category and isinstance(category, list):
                    print(f"Categoría:   {category[1]} (ID: {category[0]})")
                else:
                    print(f"Categoría:   N/A")
                
                print(f"Precio GTQ:  Q{product.get('list_price', 0):.2f}")
                print(f"Costo USD:   ${product.get('standard_price', 0):.2f}")
                print(f"Activo:      {'Sí' if product.get('active') else 'No'}")
                
                desc = product.get('description')
                if desc:
                    print(f"Descripción: {desc[:50]}..." if len(desc) > 50 else f"Descripción: {desc}")
            
            # Guardar JSON completo para referencia
            print(f"\n{'─' * 60}")
            print("💾 Guardando datos completos en 'odoo_products_sample.json'")
            with open('scripts/odoo_products_sample.json', 'w', encoding='utf-8') as f:
                json.dump(products, f, indent=2, ensure_ascii=False)
            print("✅ Archivo guardado exitosamente")
            
        else:
            print("\n⚠️  No se encontraron productos")
            
    except Exception as e:
        print(f"\n❌ Error listando productos: {str(e)}")

def main():
    """Función principal"""
    print("\n🚀 Iniciando tests de conexión con Odoo...\n")
    
    # Verificar variables de entorno
    if not all([ODOO_URL, ODOO_DB, ODOO_USERNAME, ODOO_PASSWORD]):
        print("❌ Error: Faltan variables de entorno")
        print("   Asegúrate de tener configurado .env.local con:")
        print("   - ODOO_URL")
        print("   - ODOO_DB")
        print("   - ODOO_USERNAME")
        print("   - ODOO_PASSWORD")
        return
    
    # Test 1: Conexión
    uid = test_connection()
    
    if uid:
        # Test 2: Listar partners
        list_partners(uid)
        
        # Test 3: Listar productos
        list_products(uid)
        
        print("\n" + "=" * 60)
        print("✅ TODOS LOS TESTS COMPLETADOS")
        print("=" * 60)
        print("\n📁 Archivos generados:")
        print("   - scripts/odoo_partners_sample.json")
        print("   - scripts/odoo_products_sample.json")
        print("\n")
    else:
        print("\n❌ No se pudo completar los tests debido a error de conexión")

if __name__ == "__main__":
    main()
