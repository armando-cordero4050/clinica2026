"""
Script 3: Demo Complete Odoo Sync
Sincronización completa de Odoo → Supabase
"""
import xmlrpc.client
from supabase import create_client, Client
from dotenv import load_dotenv
import os
import json
from datetime import datetime
from typing import Dict, List, Optional

# Cargar variables de entorno
load_dotenv('.env.local')

# Configuración
ODOO_URL = os.getenv('ODOO_URL')
ODOO_DB = os.getenv('ODOO_DB')
ODOO_USERNAME = os.getenv('ODOO_USERNAME')
ODOO_PASSWORD = os.getenv('ODOO_PASSWORD')
SUPABASE_URL = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY')

# Mapeo de categorías a días de entrega
TURNAROUND_MAP = {
    'Prótesis': 10,
    'Ortodoncia': 7,
    'Implantes': 14,
    'Coronas': 5,
}

class OdooSyncDemo:
    def __init__(self):
        self.odoo_uid = None
        self.odoo_models = None
        self.supabase: Optional[Client] = None
        self.stats = {
            'clinics_synced': 0,
            'clinics_errors': 0,
            'services_synced': 0,
            'services_errors': 0,
            'errors': []
        }
    
    def connect_odoo(self) -> bool:
        """Conectar a Odoo"""
        print("=" * 60)
        print("PASO 1: Conectando a Odoo")
        print("=" * 60)
        
        try:
            common = xmlrpc.client.ServerProxy(f'{ODOO_URL}/xmlrpc/2/common')
            self.odoo_uid = common.authenticate(ODOO_DB, ODOO_USERNAME, ODOO_PASSWORD, {})
            
            if self.odoo_uid:
                self.odoo_models = xmlrpc.client.ServerProxy(f'{ODOO_URL}/xmlrpc/2/object')
                print(f"✅ Conectado a Odoo (UID: {self.odoo_uid})")
                return True
            else:
                print("❌ Error: Autenticación fallida")
                return False
                
        except Exception as e:
            print(f"❌ Error conectando a Odoo: {str(e)}")
            return False
    
    def connect_supabase(self) -> bool:
        """Conectar a Supabase"""
        print("\n" + "=" * 60)
        print("PASO 2: Conectando a Supabase")
        print("=" * 60)
        
        try:
            self.supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
            print("✅ Conectado a Supabase")
            return True
            
        except Exception as e:
            print(f"❌ Error conectando a Supabase: {str(e)}")
            return False
    
    def fetch_odoo_partners(self, limit: int = 10) -> List[Dict]:
        """Obtener partners de Odoo"""
        print("\n" + "=" * 60)
        print(f"PASO 3: Obteniendo Partners de Odoo (límite: {limit})")
        print("=" * 60)
        
        try:
            # Buscar partners
            partner_ids = self.odoo_models.execute_kw(
                ODOO_DB, self.odoo_uid, ODOO_PASSWORD,
                'res.partner', 'search',
                [[('is_company', '=', True), ('customer_rank', '>', 0)]],
                {'limit': limit}
            )
            
            print(f"📋 Encontrados {len(partner_ids)} partners")
            
            if not partner_ids:
                return []
            
            # Leer datos completos
            partners = self.odoo_models.execute_kw(
                ODOO_DB, self.odoo_uid, ODOO_PASSWORD,
                'res.partner', 'read',
                [partner_ids],
                {'fields': ['id', 'name', 'email', 'phone', 'mobile', 'vat',
                           'street', 'city', 'country_id', 'property_payment_term_id']}
            )
            
            print(f"✅ Datos obtenidos de {len(partners)} partners")
            return partners
            
        except Exception as e:
            print(f"❌ Error obteniendo partners: {str(e)}")
            return []
    
    def transform_partner_to_clinic(self, partner: Dict) -> Dict:
        """Transformar partner de Odoo a clinic de la app"""
        # Determinar teléfono (preferir mobile)
        phone = partner.get('mobile') or partner.get('phone') or ''
        
        # Construir dirección
        street = partner.get('street') or ''
        city = partner.get('city') or ''
        address = f"{street}, {city}".strip(', ')
        
        # Determinar payment_policy
        payment_term = partner.get('property_payment_term_id')
        if payment_term and isinstance(payment_term, list):
            payment_policy = 'credit' if payment_term[0] > 1 else 'cash'
        else:
            payment_policy = 'cash'
        
        # Construir objeto para Supabase
        clinic = {
            'odoo_id': partner['id'],
            'name': partner['name'],
            'email': partner.get('email'),
            'phone': phone,
            'address': address,
            'payment_policy': payment_policy,
            'odoo_raw_data': partner  # Guardar datos completos
        }
        
        return clinic
    
    def sync_clinics(self, partners: List[Dict]):
        """Sincronizar partners como clinics en Supabase"""
        print("\n" + "=" * 60)
        print(f"PASO 4: Sincronizando {len(partners)} Clinics a Supabase")
        print("=" * 60)
        
        for i, partner in enumerate(partners, 1):
            try:
                # Transformar
                clinic = self.transform_partner_to_clinic(partner)
                
                print(f"\n[{i}/{len(partners)}] Sincronizando: {clinic['name']}")
                print(f"   Odoo ID: {clinic['odoo_id']}")
                print(f"   Email: {clinic.get('email') or 'N/A'}")
                print(f"   Phone: {clinic.get('phone') or 'N/A'}")
                print(f"   Payment: {clinic['payment_policy']}")
                
                # Upsert en Supabase
                response = self.supabase.table('clinics').upsert(
                    clinic,
                    on_conflict='odoo_id'
                ).execute()
                
                if response.data:
                    print(f"   ✅ Sincronizado (ID: {response.data[0]['id']})")
                    self.stats['clinics_synced'] += 1
                else:
                    print(f"   ⚠️  Sin datos retornados")
                    self.stats['clinics_errors'] += 1
                    
            except Exception as e:
                error_msg = f"Error sincronizando {partner.get('name')}: {str(e)}"
                print(f"   ❌ {error_msg}")
                self.stats['clinics_errors'] += 1
                self.stats['errors'].append(error_msg)
    
    def fetch_odoo_products(self, limit: int = 10) -> List[Dict]:
        """Obtener productos de Odoo"""
        print("\n" + "=" * 60)
        print(f"PASO 5: Obteniendo Productos de Odoo (límite: {limit})")
        print("=" * 60)
        
        try:
            # Buscar productos
            product_ids = self.odoo_models.execute_kw(
                ODOO_DB, self.odoo_uid, ODOO_PASSWORD,
                'product.product', 'search',
                [[('sale_ok', '=', True), ('active', '=', True), ('type', '=', 'service')]],
                {'limit': limit}
            )
            
            print(f"📋 Encontrados {len(product_ids)} productos")
            
            if not product_ids:
                return []
            
            # Leer datos completos
            products = self.odoo_models.execute_kw(
                ODOO_DB, self.odoo_uid, ODOO_PASSWORD,
                'product.product', 'read',
                [product_ids],
                {'fields': ['id', 'default_code', 'name', 'categ_id',
                           'list_price', 'standard_price', 'description', 'active']}
            )
            
            print(f"✅ Datos obtenidos de {len(products)} productos")
            return products
            
        except Exception as e:
            print(f"❌ Error obteniendo productos: {str(e)}")
            return []
    
    def transform_product_to_service(self, product: Dict) -> Dict:
        """Transformar producto de Odoo a service de la app"""
        # Extraer categoría
        category = ''
        if product.get('categ_id') and isinstance(product['categ_id'], list):
            category = product['categ_id'][1]
        
        # Determinar días de entrega
        turnaround_days = TURNAROUND_MAP.get(category, 7)
        
        # Construir objeto para Supabase
        service = {
            'odoo_id': product['id'],
            'code': product.get('default_code') or f"PROD-{product['id']}",
            'name': product['name'],
            'category': category,
            'cost_price_gtq': float(product.get('list_price', 0)),
            'cost_price_usd': float(product.get('standard_price', 0)),
            'description': product.get('description'),
            'turnaround_days': turnaround_days,
            'is_active': product.get('active', True),
            'raw_data': product  # Guardar datos completos
        }
        
        return service
    
    def sync_services(self, products: List[Dict]):
        """Sincronizar productos como services en Supabase"""
        print("\n" + "=" * 60)
        print(f"PASO 6: Sincronizando {len(products)} Services a Supabase")
        print("=" * 60)
        
        for i, product in enumerate(products, 1):
            try:
                # Transformar
                service = self.transform_product_to_service(product)
                
                print(f"\n[{i}/{len(products)}] Sincronizando: {service['name']}")
                print(f"   Odoo ID: {service['odoo_id']}")
                print(f"   Código: {service['code']}")
                print(f"   Categoría: {service.get('category') or 'N/A'}")
                print(f"   Precio GTQ: Q{service['cost_price_gtq']:.2f}")
                print(f"   Precio USD: ${service['cost_price_usd']:.2f}")
                
                # Upsert en Supabase
                response = self.supabase.table('services').upsert(
                    service,
                    on_conflict='odoo_id'
                ).execute()
                
                if response.data:
                    print(f"   ✅ Sincronizado (ID: {response.data[0]['id']})")
                    self.stats['services_synced'] += 1
                else:
                    print(f"   ⚠️  Sin datos retornados")
                    self.stats['services_errors'] += 1
                    
            except Exception as e:
                error_msg = f"Error sincronizando {product.get('name')}: {str(e)}"
                print(f"   ❌ {error_msg}")
                self.stats['services_errors'] += 1
                self.stats['errors'].append(error_msg)
    
    def print_summary(self):
        """Imprimir resumen de la sincronización"""
        print("\n" + "=" * 60)
        print("RESUMEN DE SINCRONIZACIÓN")
        print("=" * 60)
        
        print(f"\n📊 Clínicas:")
        print(f"   ✅ Sincronizadas: {self.stats['clinics_synced']}")
        print(f"   ❌ Errores: {self.stats['clinics_errors']}")
        
        print(f"\n📦 Servicios:")
        print(f"   ✅ Sincronizados: {self.stats['services_synced']}")
        print(f"   ❌ Errores: {self.stats['services_errors']}")
        
        total_synced = self.stats['clinics_synced'] + self.stats['services_synced']
        total_errors = self.stats['clinics_errors'] + self.stats['services_errors']
        
        print(f"\n🎯 Total:")
        print(f"   ✅ Sincronizados: {total_synced}")
        print(f"   ❌ Errores: {total_errors}")
        
        if self.stats['errors']:
            print(f"\n⚠️  Errores detallados:")
            for error in self.stats['errors']:
                print(f"   - {error}")
        
        # Guardar reporte
        report = {
            'timestamp': datetime.now().isoformat(),
            'stats': self.stats
        }
        
        with open('scripts/sync_report.json', 'w', encoding='utf-8') as f:
            json.dump(report, f, indent=2, ensure_ascii=False)
        
        print(f"\n💾 Reporte guardado en 'scripts/sync_report.json'")
    
    def run(self, limit_clinics: int = 10, limit_services: int = 10):
        """Ejecutar sincronización completa"""
        print("\n🚀 DEMO: Sincronización Completa Odoo → Supabase\n")
        
        # Conectar a Odoo
        if not self.connect_odoo():
            return
        
        # Conectar a Supabase
        if not self.connect_supabase():
            return
        
        # Sincronizar Clinics
        partners = self.fetch_odoo_partners(limit=limit_clinics)
        if partners:
            self.sync_clinics(partners)
        
        # Sincronizar Services
        products = self.fetch_odoo_products(limit=limit_services)
        if products:
            self.sync_services(products)
        
        # Resumen
        self.print_summary()
        
        print("\n" + "=" * 60)
        print("✅ SINCRONIZACIÓN COMPLETADA")
        print("=" * 60)
        print("\n")

def main():
    """Función principal"""
    # Verificar variables de entorno
    required_vars = [
        'ODOO_URL', 'ODOO_DB', 'ODOO_USERNAME', 'ODOO_PASSWORD',
        'NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'
    ]
    
    missing = [var for var in required_vars if not os.getenv(var)]
    
    if missing:
        print("❌ Error: Faltan variables de entorno:")
        for var in missing:
            print(f"   - {var}")
        return
    
    # Ejecutar demo
    demo = OdooSyncDemo()
    demo.run(limit_clinics=10, limit_services=10)

if __name__ == "__main__":
    main()
