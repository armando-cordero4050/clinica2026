/**
 * Test script to verify clinic sync from Odoo
 * Run with: node test-sync.js
 */

const https = require('https');
const http = require('http');

// Test 1: Check if Odoo is accessible
async function testOdooConnection() {
  console.log('🔍 Testing Odoo connection...');
  
  return new Promise((resolve, reject) => {
    const req = http.get('http://localhost:8069/web/database/selector', (res) => {
      console.log(`✅ Odoo is accessible (Status: ${res.statusCode})`);
      resolve(true);
    });
    
    req.on('error', (error) => {
      console.error('❌ Odoo is NOT accessible:', error.message);
      resolve(false);
    });
    
    req.setTimeout(5000, () => {
      console.error('❌ Odoo connection timeout');
      req.destroy();
      resolve(false);
    });
  });
}

// Test 2: Check if Next.js app is running
async function testNextApp() {
  console.log('\n🔍 Testing Next.js app...');
  
  return new Promise((resolve, reject) => {
    const req = http.get('http://localhost:3000/dashboard/medical/clinics', (res) => {
      console.log(`✅ Next.js app is accessible (Status: ${res.statusCode})`);
      resolve(true);
    });
    
    req.on('error', (error) => {
      console.error('❌ Next.js app is NOT accessible:', error.message);
      resolve(false);
    });
    
    req.setTimeout(5000, () => {
      console.error('❌ Next.js app connection timeout');
      req.destroy();
      resolve(false);
    });
  });
}

// Run all tests
async function runTests() {
  console.log('🚀 Starting connectivity tests...\n');
  
  const odooOk = await testOdooConnection();
  const nextOk = await testNextApp();
  
  console.log('\n📊 Test Results:');
  console.log(`   Odoo: ${odooOk ? '✅ OK' : '❌ FAIL'}`);
  console.log(`   Next.js: ${nextOk ? '✅ OK' : '❌ FAIL'}`);
  
  if (odooOk && nextOk) {
    console.log('\n✅ All systems are operational!');
    console.log('\n💡 Next steps:');
    console.log('   1. Open http://localhost:3000/dashboard/medical/clinics');
    console.log('   2. Click "Sincronizar desde Odoo"');
    console.log('   3. Check browser console (F12) for errors');
  } else {
    console.log('\n❌ Some systems are not accessible');
    if (!odooOk) {
      console.log('   → Start Odoo: docker-compose up -d (or your Odoo start command)');
    }
    if (!nextOk) {
      console.log('   → Start Next.js: npm run dev');
    }
  }
}

runTests().catch(console.error);
