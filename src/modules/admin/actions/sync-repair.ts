'use server'

import { createClient } from '@/lib/supabase/server'
import { OdooClient } from '@/lib/odoo/client'
import { getOdooConfig } from '@/modules/odoo/actions'

export async function repairClinicLinks() {
  const logMessages: string[] = []
  
  const log = (msg: string) => {
    console.log(`[Sync Repair] ${msg}`)
    logMessages.push(msg)
  }

  try {
    log('🚀 Iniciando reparación de vínculos...')
    const supabase = await createClient()

    // 1. Configurar Odoo
    const config = await getOdooConfig()
    if (!config) {
        throw new Error('No hay configuración de Odoo activa')
    }

    const odoo = new OdooClient(config)
    const uid = await odoo.authenticate()
    if (!uid) {
        throw new Error('Fallo autenticación Odoo')
    }
    log(`✅ Conectado a Odoo. UID: ${uid}`)

    // 2. Obtener Clínicas Locales
    const { data: clinics, error } = await supabase.from('clinics').select('*')
    if (error) throw error

    log(`📋 Encontradas ${clinics.length} clínicas en local.`)
    let fixedCount = 0

    for (const clinic of clinics) {
      log(`🏥 Procesando: ${clinic.name} (${clinic.email})`)

      // Buscar en Odoo por email
      const partners = await odoo.searchRead('res.partner', {
        domain: [['email', '=', clinic.email]],
        fields: ['id', 'name'],
        limit: 1
      })

      let odooId = null

      if (partners.length > 0) {
        odooId = partners[0].id
        log(`   ✅ Encontrado en Odoo: ID ${odooId} - ${partners[0].name}`)
      } else {
        log(`   🔸 No encontrado en Odoo. Creando...`)
        odooId = await odoo.create('res.partner', {
          name: clinic.name,
          email: clinic.email,
          phone: clinic.phone,
          active: true,
          customer_rank: 1, // Es cliente
          company_type: 'company'
        })
        log(`   ✨ Creado en Odoo con ID: ${odooId}`)
      }

      if (odooId) {
        // Actualizar Supabase
        // Only update if different to avoid noise? No, always ensure
        const { error: updateError } = await supabase
          .from('clinics')
          .update({ odoo_partner_id: odooId })
          .eq('id', clinic.id)

        if (updateError) {
          log(`   ❌ Error actualizando Supabase: ${updateError.message}`)
        } else {
          log(`   🔗 Vinculado exitosamente en DB Local`)
          fixedCount++
        }
      }
    }

    return { success: true, message: `Reparación completada. ${fixedCount} clínicas verificadas.`, logs: logMessages }
  } catch (error: any) {
    log(`❌ Error Critico: ${error.message}`)
    return { success: false, message: error.message, logs: logMessages }
  }
}
