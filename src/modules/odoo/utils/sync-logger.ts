'use server'

import { writeFile, appendFile } from 'fs/promises'
import { join } from 'path'

export interface SyncLogEntry {
  timestamp: string
  module: string
  status: 'SUCCESS' | 'ERROR' | 'WARNING' | 'INFO'
  message: string
  details?: any
}

const LOG_FILE = join(process.cwd(), 'INSTRUCCIONES', 'ODOO_SYNC_LOG.md')

export async function logSync(entry: SyncLogEntry) {
  const icon = {
    SUCCESS: '✅',
    ERROR: '❌',
    WARNING: '⚠️',
    INFO: 'ℹ️'
  }[entry.status]

  const logLine = `\n[${entry.timestamp}] [${entry.module.toUpperCase()}] ${icon} ${entry.status} - ${entry.message}`
  
  // Log detallado si hay detalles
  let detailsText = ''
  if (entry.details) {
    detailsText = `\n\`\`\`json\n${JSON.stringify(entry.details, null, 2)}\n\`\`\`\n`
  }

  try {
    await appendFile(LOG_FILE, logLine + detailsText)
    console.log(logLine) // También log en consola
  } catch (error) {
    console.error('Error escribiendo log:', error)
  }
}

export async function clearSyncLog() {
  const header = `# Log de Sincronización Odoo

**Última actualización:** ${new Date().toLocaleString('es-GT')}

---

## Logs de Sincronización

`
  try {
    await writeFile(LOG_FILE, header)
  } catch (error) {
    console.error('Error limpiando log:', error)
  }
}

export async function logSyncStart(module: string) {
  await logSync({
    timestamp: new Date().toISOString(),
    module,
    status: 'INFO',
    message: `Iniciando sincronización de ${module}`
  })
}

export async function logSyncSuccess(module: string, recordsProcessed: number, recordsFailed: number) {
  await logSync({
    timestamp: new Date().toISOString(),
    module,
    status: recordsFailed > 0 ? 'WARNING' : 'SUCCESS',
    message: `Sincronización completada: ${recordsProcessed} exitosos, ${recordsFailed} fallidos`
  })
}

export async function logSyncError(module: string, error: any, context?: string) {
  await logSync({
    timestamp: new Date().toISOString(),
    module,
    status: 'ERROR',
    message: context || 'Error en sincronización',
    details: {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint
    }
  })
}
