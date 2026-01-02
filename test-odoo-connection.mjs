import xmlrpc from 'xmlrpc'

const config = {
    url: 'http://localhost:8069',
    db: 'clinica-test',
    username: 'jhernandez@smartnetgt.com',
    password: 'Guate502#'
}

console.log('Testing Odoo Connection...', config)

const urlParts = new URL(config.url)
const clientOptions = {
    host: urlParts.hostname,
    port: urlParts.port ? parseInt(urlParts.port) : 8069,
    path: '/xmlrpc/2/common',
    headers: { 'User-Agent': 'NodeJS-Test-Script' }
}

const client = xmlrpc.createClient(clientOptions)

client.methodCall('authenticate', [
    config.db,
    config.username,
    config.password,
    {}
], (error, uid) => {
    if (error) {
        console.error('❌ Connection Failed:', error)
    } else if (!uid) {
        console.error('❌ Authentication Failed: Invalid credentials')
    } else {
        console.log('✅ Connection Success! UID:', uid)
        
        // Try to read company
        const objectClient = xmlrpc.createClient({ ...clientOptions, path: '/xmlrpc/2/object' })
        objectClient.methodCall('execute_kw', [
            config.db,
            uid,
            config.password,
            'res.company',
            'search_read',
            [[]],
            { fields: ['name'], limit: 1 }
        ], (err, companies) => {
            if (err) console.error('❌ Read Failed:', err)
            else console.log('✅ Read Success! Company:', companies[0]?.name)
        })
    }
})
