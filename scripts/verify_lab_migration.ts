
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing env vars');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function verify() {
  console.log('Verifying Lab Order Schema...');

  // 1. Check Lab Materials View
  const { data: materials, error: matError } = await supabase
    .from('lab_materials') 
    .select('*');

  if (matError) {
    console.error('❌ Failed to fetch lab_materials:', matError.message);
  } else {
    console.log(`✅ lab_materials view accessible. Count: ${materials?.length}`);
    if (materials && materials.length > 0) {
        console.log('Sample Material:', materials[0].name);
    } else {
        console.warn('⚠️ lab_materials is empty! Seed data failed?');
    }
  }

  // 2. Check Lab Configurations View
  const { count, error: countError } = await supabase
    .from('lab_configurations')
    .select('*', { count: 'exact', head: true });

  if (countError) {
     console.error('❌ Failed to fetch lab_configurations:', countError.message);
  } else {
     console.log(`✅ lab_configurations count: ${count}`);
  }

   // 3. Check Lab Orders View
  const { error: orderError } = await supabase
    .from('lab_orders')
    .select('id').limit(1);

  if (orderError) {
     console.error('❌ Failed to access lab_orders:', orderError.message);
  } else {
     console.log('✅ lab_orders view accessible.');
  }

  // 4. Test Nested Query (Simulating getLabCatalog)
  console.log('Testing Nested Query (Materials -> Types -> Configs)...');
  const { data: catalog, error: catalogError } = await supabase
      .from('lab_materials')
      .select(`
        id,
        name,
        slug,
        types:lab_material_types (
          id,
          name,
          slug,
          configurations:lab_configurations (
            id,
            name,
            slug,
            base_price
          )
        )
      `)
      .limit(1);

  if (catalogError) {
      console.error('❌ Nested query failed:', catalogError.message);
      console.error('Hint: PostgREST might not detect FKs across views/schemas properly without explicit hints or if views obscure them.');
  } else {
      console.log('✅ Nested query SUCCESS!');
      if (catalog && catalog.length > 0) {
          const mat = catalog[0];
          console.log(`- Material: ${mat.name}`);
          // @ts-ignore
          if (mat.types && mat.types.length > 0) {
               // @ts-ignore
              console.log(`  - Type: ${mat.types[0].name}`);
               // @ts-ignore
              if (mat.types[0].configurations && mat.types[0].configurations.length > 0) {
                   // @ts-ignore
                  console.log(`    - Config: ${mat.types[0].configurations[0].name}`);
              } else {
                  console.warn('    - No configs found for type.');
              }
          } else {
              console.warn('  - No types found for material.');
          }
      }
  }

}

verify();
