const fs = require('fs');
// Try to read .env manually to avoid dotenv ambiguity for debug
const envConfig = require('dotenv').parse(fs.readFileSync('.env'));
for (const k in envConfig) {
  process.env[k] = envConfig[k]
}
const xmlrpc = require('xmlrpc');

const config = {
    url: process.env.ODOO_URL,
    db: process.env.ODOO_DB,
    username: process.env.ODOO_USERNAME,
    password: process.env.ODOO_PASSWORD
};

console.log('Testing with Env Vars:');
console.log('URL:', config.url);
console.log('DB:', config.db);
console.log('User:', config.username);
console.log('Pass Length:', config.password ? config.password.length : 'N/A');
console.log('Pass First/Last:', config.password ? `${config.password[0]}...${config.password[config.password.length-1]}` : 'N/A');

if (!config.password) {
    console.error('❌ Password is MISSING in env vars!');
    process.exit(1);
}

const urlParts = new URL(config.url);
const clientOptions = {
    host: urlParts.hostname,
    port: urlParts.port ? parseInt(urlParts.port) : 8069,
    path: '/xmlrpc/2/common'
};

const client = xmlrpc.createClient(clientOptions);

client.methodCall('authenticate', [
    config.db,
    config.username,
    config.password,
    {}
], (error, uid) => {
    if (error) {
        console.error('❌ Connection Error:', error);
    } else if (!uid) {
        console.error('❌ Authentication Failed (UID is false/null)');
    } else {
        console.log('✅ Success! UID:', uid);
    }
});
