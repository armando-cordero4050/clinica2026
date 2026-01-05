import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

// Force reload env
const envPath = path.resolve(process.cwd(), '.env');
const envConfig = dotenv.parse(fs.readFileSync(envPath));
for (const k in envConfig) {
  process.env[k] = envConfig[k];
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://uadurfgrkjjbexnpcjdq.supabase.co';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SERVICE_KEY) {
  console.error('❌ Error: SUPABASE_SERVICE_ROLE_KEY not found');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
  db: { schema: 'public' }
});

async function introspectDirectly() {
  console.log('🔍 Reading Supabase schema using direct queries...\n');

  let output = `# Supabase Schema Snapshot\n\n`;
  output += `**Generated:** ${new Date().toISOString()}\n\n`;
  output += `**Method:** Direct table inspection via Supabase client\n\n`;
  output += `---\n\n`;

  // List of known tables from our migrations
  const knownTables = [
    'clinics',
    'users',
    'patients',
    'appointments',
    'lab_orders',
    'lab_order_items',
    'lab_stages',
    'lab_services',
    'dental_chart',
    'budgets',
    'budget_items',
    'odoo_customers',
    'odoo_products',
    'settings'
  ];

  for (const tableName of knownTables) {
    try {
      const { data, error, count } = await supabase
        .from(tableName)
        .select('*', { count: 'exact', head: true });

      if (!error) {
        output += `## ✅ Table: \`${tableName}\`\n\n`;
        output += `- **Row Count:** ${count || 0}\n`;
        output += `- **Status:** Accessible\n\n`;
        
        // Try to get one row to see structure
        const { data: sampleRow } = await supabase
          .from(tableName)
          .select('*')
          .limit(1)
          .single();

        if (sampleRow) {
          output += `### Sample Columns\n\n`;
          output += `\`\`\`json\n${JSON.stringify(Object.keys(sampleRow), null, 2)}\n\`\`\`\n\n`;
        }
      } else {
        output += `## ❌ Table: \`${tableName}\`\n\n`;
        output += `- **Error:** ${error.message}\n\n`;
      }

      output += `---\n\n`;
    } catch (e: any) {
      output += `## ⚠️ Table: \`${tableName}\`\n\n`;
      output += `- **Exception:** ${e.message}\n\n`;
      output += `---\n\n`;
    }
  }

  // Save to file
  const outputPath = path.join(process.cwd(), 'INSTRUCCIONES', 'SUPABASE_SCHEMA.md');
  fs.writeFileSync(outputPath, output, 'utf-8');

  console.log(`✅ Schema saved to: ${outputPath}`);
}

introspectDirectly();
