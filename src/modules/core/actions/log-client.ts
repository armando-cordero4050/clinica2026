'use server'

import { logger } from "@/lib/logger"

export async function logClientEvent(message: string, data?: any) {
  logger.log(`[CLIENT] ${message}`, data)
  return { success: true }
}
