'use server'

import { logSyncStart, logSyncSuccess } from '../utils/sync-logger'

export async function syncSalesFromOdoo() {
    console.log('🚧 Sync Sales: Not implemented yet')
    return { success: true, message: 'Modulo Ventas: Pendiente de implementación (Placeholder)' }
}

export async function syncInvoicesFromOdoo() {
    console.log('🚧 Sync Invoices: Not implemented yet')
    return { success: true, message: 'Modulo Facturas: Pendiente de implementación (Placeholder)' }
}
