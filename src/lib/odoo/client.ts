/**
 * Odoo XML-RPC Client
 * Handles authentication and API calls to Odoo ERP
 */

import xmlrpc from 'xmlrpc'

export interface OdooConfig {
  url: string
  database: string
  username: string
  password: string
}

export interface OdooSearchParams {
  domain?: any[]
  fields?: string[]
  limit?: number
  offset?: number
  order?: string
}

export class OdooClient {
  private config: OdooConfig
  private uid: number | null = null
  private commonClient: any
  private objectClient: any

  constructor(config: OdooConfig) {
    this.config = config
    
    // Parse URL to get host and port
    const urlObj = new URL(config.url)
    const host = urlObj.hostname
    const port = urlObj.port ? parseInt(urlObj.port) : (urlObj.protocol === 'https:' ? 443 : 80)
    const isSecure = urlObj.protocol === 'https:'

    // Create XML-RPC clients
    const clientOptions = {
      host,
      port,
      path: '/xmlrpc/2/common',
      ...(isSecure && { 
        protocol: 'https:',
        rejectUnauthorized: false // For self-signed certificates in dev
      })
    }

    this.commonClient = isSecure 
      ? xmlrpc.createSecureClient(clientOptions)
      : xmlrpc.createClient(clientOptions)

    this.objectClient = isSecure
      ? xmlrpc.createSecureClient({ ...clientOptions, path: '/xmlrpc/2/object' })
      : xmlrpc.createClient({ ...clientOptions, path: '/xmlrpc/2/object' })
  }

  /**
   * Authenticate with Odoo and get UID
   */
  async authenticate(): Promise<number> {
    return new Promise((resolve, reject) => {
      this.commonClient.methodCall(
        'authenticate',
        [this.config.database, this.config.username, this.config.password, {}],
        (error: any, uid: number) => {
          if (error) {
            reject(new Error(`Odoo authentication failed: ${error.message}`))
          } else if (!uid) {
            reject(new Error('Invalid credentials'))
          } else {
            this.uid = uid
            resolve(uid)
          }
        }
      )
    })
  }

  /**
   * Execute a method on an Odoo model
   */
  private async execute(
    model: string,
    method: string,
    args: any[] = [],
    kwargs: any = {}
  ): Promise<any> {
    if (!this.uid) {
      await this.authenticate()
    }

    return new Promise((resolve, reject) => {
      this.objectClient.methodCall(
        'execute_kw',
        [
          this.config.database,
          this.uid,
          this.config.password,
          model,
          method,
          args,
          kwargs
        ],
        (error: any, result: any) => {
          if (error) {
            reject(new Error(`Odoo API error: ${error.message}`))
          } else {
            resolve(result)
          }
        }
      )
    })
  }

  /**
   * Search for records
   */
  async search(model: string, params: OdooSearchParams = {}): Promise<number[]> {
    const domain = params.domain || []
    const kwargs: any = {}
    
    if (params.limit) kwargs.limit = params.limit
    if (params.offset) kwargs.offset = params.offset
    if (params.order) kwargs.order = params.order

    return this.execute(model, 'search', [domain], kwargs)
  }

  /**
   * Read records by IDs
   */
  async read(model: string, ids: number[], fields: string[] = []): Promise<any[]> {
    const kwargs = fields.length > 0 ? { fields } : {}
    return this.execute(model, 'read', [ids], kwargs)
  }

  /**
   * Search and read in one call
   */
  async searchRead(model: string, params: OdooSearchParams = {}): Promise<any[]> {
    const domain = params.domain || []
    const kwargs: any = {}
    
    if (params.fields) kwargs.fields = params.fields
    if (params.limit) kwargs.limit = params.limit
    if (params.offset) kwargs.offset = params.offset
    if (params.order) kwargs.order = params.order

    return this.execute(model, 'search_read', [domain], kwargs)
  }

  /**
   * Create a new record
   */
  async create(model: string, values: any): Promise<number> {
    return this.execute(model, 'create', [values])
  }

  /**
   * Update existing records
   */
  async write(model: string, ids: number[], values: any): Promise<boolean> {
    return this.execute(model, 'write', [ids, values])
  }

  /**
   * Delete records
   */
  async unlink(model: string, ids: number[]): Promise<boolean> {
    return this.execute(model, 'unlink', [ids])
  }

  /**
   * Get fields definition for a model
   */
  async fieldsGet(model: string, fields: string[] = []): Promise<any> {
    const kwargs = fields.length > 0 ? { attributes: ['string', 'type', 'required', 'readonly'] } : {}
    return this.execute(model, 'fields_get', fields.length > 0 ? [fields] : [], kwargs)
  }

  /**
   * Check access rights
   */
  async checkAccessRights(model: string, operation: 'read' | 'write' | 'create' | 'unlink'): Promise<boolean> {
    return this.execute(model, 'check_access_rights', [operation], { raise_exception: false })
  }
}

/**
 * Helper function to create Odoo client from config
 */
export async function createOdooClient(config: OdooConfig): Promise<OdooClient> {
  const client = new OdooClient(config)
  await client.authenticate()
  return client
}
