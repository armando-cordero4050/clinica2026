'use server'

import { createOdooClient } from '@/lib/odoo/client'

export async function testOdooConnection() {
  try {
    const client = createOdooClient()
    const uid = await client.connect()
    
    // Fetch Company Info as a test
    const companies = await client.searchRead('res.company', [], ['name', 'currency_id'], 1)
    
    return {
      success: true,
      message: `Connected! UID: ${uid}. Company: ${companies[0]?.name || 'Unknown'}`,
      data: companies[0]
    }
  } catch (error: any) {
    console.error('Odoo Error:', error)
    const debugInfo = `URL=${process.env.ODOO_URL}, DB=${process.env.ODOO_DB?.slice(0,3)}..., User=${process.env.ODOO_USERNAME}`
    return {
      success: false,
      message: `${error.message} (${debugInfo})`
    }
  }
}
