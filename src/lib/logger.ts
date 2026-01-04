import fs from 'fs'
import path from 'path'

const LOG_DIR = path.join(process.cwd(), 'logs')
const LOG_FILE = path.join(LOG_DIR, 'debug.log')

// Ensure log directory exists
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR)
}

export const logger = {
  log: (message: string, data?: any) => {
    writeLog('INFO', message, data)
  },
  error: (message: string, error?: any) => {
    writeLog('ERROR', message, error)
  },
  debug: (message: string, data?: any) => {
    writeLog('DEBUG', message, data)
  }
}

function writeLog(level: string, message: string, data?: any) {
  const timestamp = new Date().toISOString()
  let logEntry = `[${timestamp}] [${level}] ${message}`
  
  if (data) {
    if (data instanceof Error) {
        logEntry += `\nSTACK: ${data.stack}`
    } else {
        try {
            logEntry += `\nDATA: ${JSON.stringify(data, null, 2)}`
        } catch (e) {
            logEntry += `\nDATA: [Circular or Unserializable]`
        }
    }
  }
  
  logEntry += '\n' + '-'.repeat(80) + '\n'

  try {
    fs.appendFileSync(LOG_FILE, logEntry)
  } catch (err) {
    console.error('Failed to write to log file:', err)
  }
}
