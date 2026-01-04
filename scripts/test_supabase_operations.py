"""
Script 2: Test Supabase Read/Write
Prueba lectura y escritura en Supabase
"""
from supabase import create_client, Client
from dotenv import load_dotenv
import os
import json
from datetime import datetime

# Cargar variables de entorno
load_dotenv('.env.local')

# Configuración de Supabase
SUPABASE_URL = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY')

def test_connection():
    """Prueba la conexión con Supabase"""
    print("=" * 60)
    print("TEST 1: Conexión con Supabase")
    print("=" * 60)
    
    try:
        print(f"\n📡 Conectando a: {SUPABASE_URL}")
        
        supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
        
        print("✅ Cliente de Supabase creado exitosamente")
        
        return supabase
        
    except Exception as e:
        print(f"\n❌ Error de conexión: {str(e)}")
        return None

def test_read_clinics(supabase: Client):
    """Lee clínicas desde Supabase"""
    print("\n" + "=" * 60)
    print("TEST 2: Leer Clínicas (schema_medical.clinics)")
    print("=" * 60)
    
    try:
        # Leer primeras 5 clínicas
        response = supabase.table('clinics').select('*').limit(5).execute()
        
        clinics = response.data
        
        print(f"\n📋 Encontradas {len(clinics)} clínicas (mostrando primeras 5)")
        
        if clinics:
            for i, clinic in enumerate(clinics, 1):
                print(f"\n{'─' * 60}")
                print(f"Clínica #{i}")
                print(f"{'─' * 60}")
                print(f"ID:              {clinic.get('id')}")
                print(f"Odoo ID:         {clinic.get('odoo_id') or 'N/A'}")
                print(f"Nombre:          {clinic.get('name')}")
                print(f"Email:           {clinic.get('email') or 'N/A'}")
                print(f"Teléfono:        {clinic.get('phone') or 'N/A'}")
                print(f"Dirección:       {clinic.get('address') or 'N/A'}")
                print(f"Payment Policy:  {clinic.get('payment_policy') or 'N/A'}")
                print(f"Creado:          {clinic.get('created_at')}")
                print(f"Actualizado:     {clinic.get('updated_at')}")
            
            # Guardar JSON
            print(f"\n{'─' * 60}")
            print("💾 Guardando datos en 'supabase_clinics_sample.json'")
            with open('scripts/supabase_clinics_sample.json', 'w', encoding='utf-8') as f:
                json.dump(clinics, f, indent=2, ensure_ascii=False, default=str)
            print("✅ Archivo guardado exitosamente")
        else:
            print("\n⚠️  No se encontraron clínicas")
            
    except Exception as e:
        print(f"\n❌ Error leyendo clínicas: {str(e)}")

def test_read_services(supabase: Client):
    """Lee servicios desde Supabase"""
    print("\n" + "=" * 60)
    print("TEST 3: Leer Servicios (schema_lab.services)")
    print("=" * 60)
    
    try:
        # Leer primeros 5 servicios
        response = supabase.table('services').select('*').limit(5).execute()
        
        services = response.data
        
        print(f"\n📋 Encontrados {len(services)} servicios (mostrando primeros 5)")
        
        if services:
            for i, service in enumerate(services, 1):
                print(f"\n{'─' * 60}")
                print(f"Servicio #{i}")
                print(f"{'─' * 60}")
                print(f"ID:              {service.get('id')}")
                print(f"Odoo ID:         {service.get('odoo_id') or 'N/A'}")
                print(f"Código:          {service.get('code')}")
                print(f"Nombre:          {service.get('name')}")
                print(f"Categoría:       {service.get('category') or 'N/A'}")
                print(f"Precio GTQ:      Q{service.get('cost_price_gtq', 0):.2f}")
                print(f"Precio USD:      ${service.get('cost_price_usd', 0):.2f}")
                print(f"Días entrega:    {service.get('turnaround_days')} días")
                print(f"Activo:          {'Sí' if service.get('is_active') else 'No'}")
                print(f"Creado:          {service.get('created_at')}")
            
            # Guardar JSON
            print(f"\n{'─' * 60}")
            print("💾 Guardando datos en 'supabase_services_sample.json'")
            with open('scripts/supabase_services_sample.json', 'w', encoding='utf-8') as f:
                json.dump(services, f, indent=2, ensure_ascii=False, default=str)
            print("✅ Archivo guardado exitosamente")
        else:
            print("\n⚠️  No se encontraron servicios")
            
    except Exception as e:
        print(f"\n❌ Error leyendo servicios: {str(e)}")

def test_write_clinic(supabase: Client):
    """Prueba escritura de una clínica de prueba"""
    print("\n" + "=" * 60)
    print("TEST 4: Escribir Clínica de Prueba")
    print("=" * 60)
    
    try:
        # Datos de prueba
        test_clinic = {
            'name': 'Clínica de Prueba Python',
            'email': 'test@python.com',
            'phone': '+502 1234-5678',
            'address': 'Dirección de Prueba, Guatemala',
            'odoo_id': 99999,  # ID ficticio
            'payment_policy': 'cash',
            'odoo_raw_data': {
                'test': True,
                'created_by': 'Python Script',
                'timestamp': datetime.now().isoformat()
            }
        }
        
        print("\n📝 Insertando clínica de prueba...")
        print(json.dumps(test_clinic, indent=2, ensure_ascii=False, default=str))
        
        # Insertar (upsert para evitar duplicados)
        response = supabase.table('clinics').upsert(
            test_clinic,
            on_conflict='odoo_id'
        ).execute()
        
        if response.data:
            print("\n✅ Clínica insertada exitosamente!")
            print(f"   ID generado: {response.data[0].get('id')}")
            
            # Leer de vuelta para verificar
            clinic_id = response.data[0].get('id')
            verify = supabase.table('clinics').select('*').eq('id', clinic_id).execute()
            
            if verify.data:
                print("\n🔍 Verificación de datos insertados:")
                print(json.dumps(verify.data[0], indent=2, ensure_ascii=False, default=str))
            
            return clinic_id
        else:
            print("\n⚠️  No se retornaron datos después de la inserción")
            return None
            
    except Exception as e:
        print(f"\n❌ Error escribiendo clínica: {str(e)}")
        return None

def test_update_clinic(supabase: Client, clinic_id: str):
    """Prueba actualización de una clínica"""
    print("\n" + "=" * 60)
    print("TEST 5: Actualizar Clínica de Prueba")
    print("=" * 60)
    
    try:
        # Datos de actualización
        update_data = {
            'name': 'Clínica de Prueba Python (ACTUALIZADA)',
            'payment_policy': 'credit'
        }
        
        print(f"\n📝 Actualizando clínica ID: {clinic_id}")
        print(json.dumps(update_data, indent=2, ensure_ascii=False))
        
        # Actualizar
        response = supabase.table('clinics').update(update_data).eq('id', clinic_id).execute()
        
        if response.data:
            print("\n✅ Clínica actualizada exitosamente!")
            print("\n🔍 Datos actualizados:")
            print(json.dumps(response.data[0], indent=2, ensure_ascii=False, default=str))
        else:
            print("\n⚠️  No se retornaron datos después de la actualización")
            
    except Exception as e:
        print(f"\n❌ Error actualizando clínica: {str(e)}")

def test_delete_clinic(supabase: Client, clinic_id: str):
    """Prueba eliminación de una clínica"""
    print("\n" + "=" * 60)
    print("TEST 6: Eliminar Clínica de Prueba")
    print("=" * 60)
    
    try:
        print(f"\n🗑️  Eliminando clínica ID: {clinic_id}")
        
        # Eliminar
        response = supabase.table('clinics').delete().eq('id', clinic_id).execute()
        
        if response.data:
            print("\n✅ Clínica eliminada exitosamente!")
        else:
            print("\n⚠️  No se retornaron datos después de la eliminación")
            
    except Exception as e:
        print(f"\n❌ Error eliminando clínica: {str(e)}")

def main():
    """Función principal"""
    print("\n🚀 Iniciando tests de Supabase...\n")
    
    # Verificar variables de entorno
    if not all([SUPABASE_URL, SUPABASE_KEY]):
        print("❌ Error: Faltan variables de entorno")
        print("   Asegúrate de tener configurado .env.local con:")
        print("   - NEXT_PUBLIC_SUPABASE_URL")
        print("   - SUPABASE_SERVICE_ROLE_KEY")
        return
    
    # Test 1: Conexión
    supabase = test_connection()
    
    if supabase:
        # Test 2: Leer clínicas
        test_read_clinics(supabase)
        
        # Test 3: Leer servicios
        test_read_services(supabase)
        
        # Test 4: Escribir clínica
        clinic_id = test_write_clinic(supabase)
        
        if clinic_id:
            # Test 5: Actualizar clínica
            test_update_clinic(supabase, clinic_id)
            
            # Test 6: Eliminar clínica
            test_delete_clinic(supabase, clinic_id)
        
        print("\n" + "=" * 60)
        print("✅ TODOS LOS TESTS COMPLETADOS")
        print("=" * 60)
        print("\n📁 Archivos generados:")
        print("   - scripts/supabase_clinics_sample.json")
        print("   - scripts/supabase_services_sample.json")
        print("\n")
    else:
        print("\n❌ No se pudo completar los tests debido a error de conexión")

if __name__ == "__main__":
    main()
