import { OdooClient } from '../src/lib/odoo/client'
import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config()

async function resetOdoo() {
  console.log('🚀 Iniciando reset de datos en Odoo...')

  // 1. Obtener configuración de Supabase
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: configData, error: configError } = await supabase
    .from('odoo_config')
    .select('*')
    .eq('is_active', true)
    .maybeSingle()

  if (configError || !configData) {
    console.error('❌ Error al obtener configuración de Odoo:', configError?.message || 'No activa')
    return
  }

  const client = new OdooClient({
    url: configData.url,
    database: configData.database,
    username: configData.username,
    password: configData.api_key
  })

  try {
    console.log('🔑 Autenticando en Odoo...')
    const uid = await client.authenticate()
    console.log('✅ Autenticado con UID:', uid)

    // ORDEN DE BORRADO PARA EVITAR ERRORES DE INTEGRIDAD
    const modelsToDelete = [
      { name: 'account.partial.reconcile', label: 'Reconciliaciones' },
      { name: 'account.payment', label: 'Pagos' },
      { name: 'account.move.line', label: 'Apuntes Contables' },
      { name: 'account.move', label: 'Facturas/Asientos' },
      { name: 'sale.order.line', label: 'Líneas de Venta' },
      { name: 'sale.order', label: 'Órdenes de Venta' },
      { name: 'product.product', label: 'Productos' },
      { name: 'res.partner', label: 'Contactos/Clientes', domain: [['id', '!=', uid], ['parent_id', '=', false]] }
    ]


    for (const model of modelsToDelete) {
      console.log(`\n--- Procesando: ${model.label} ---`)
      
      const ids = await client.search(model.name, { 
        domain: (model as any).domain || [],
        limit: 1000 
      })

      if (ids.length === 0) {
        console.log(`ℹ️ No se encontraron registros en ${model.name}`)
        continue
      }

      console.log(`🗑️ Borrando ${ids.length} registros en ${model.name}...`)
      
      // Borramos en bloques para mayor estabilidad
      const chunkSize = 50
      for (let i = 0; i < ids.length; i += chunkSize) {
        const chunk = ids.slice(i, i + chunkSize)
        try {
          await client.unlink(model.name, chunk)
          process.stdout.write('.')
        } catch (e: any) {
          console.error(`\n⚠️ Error parcial borrando bloque en ${model.name}: ${e.message}`)
        }
      }
      console.log(`\n✅ Finalizado: ${model.label}`)
    }

    console.log('\n✨ Reset de Odoo completado con éxito.')

  } catch (error: any) {
    console.error('\n❌ Fallo crítico durante el reset:', error.message)
  }
}

resetOdoo()
