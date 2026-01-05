
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error('Missing Supabase env vars.');
    process.exit(1);
}

// Credentials for Dr. Celeste
const EMAIL = 'dr.celeste@clinica1.com';
const PASSWORD = 'Clinica2026!';

async function runTest() {
    console.log(`1. Authenticating as ${EMAIL}...`);
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    // Login
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: EMAIL,
        password: PASSWORD
    });

    if (authError || !authData.session) {
        console.error('Login failed:', authError?.message);
        process.exit(1);
    }
    
    console.log('   Login successful. Access Token acquired.');
    const user = authData.user;

    // 2. Get Clinic ID (Doctor should belong to one)
    console.log('2. Fetching Clinic Staff info...');
    const { data: staff, error: staffError } = await supabase
        .from('clinic_staff')
        .select('clinic_id')
        .eq('user_id', user.id)
        .single();
    
    if (staffError || !staff) {
        console.error('Failed to get clinic staff info:', staffError?.message);
        process.exit(1);
    }
    const clinicId = staff.clinic_id;
    console.log(`   Clinic ID: ${clinicId}`);

    // 3. Find or Create a Patient
    console.log('3. Fetching a patient...');
    const { data: patients, error: patientError } = await supabase
        .from('patients')
        .select('id')
        .eq('clinic_id', clinicId)
        .limit(1);

    if (patientError) {
        console.error('Error fetching patients:', patientError.message);
        process.exit(1);
    }

    let patientId = patients?.[0]?.id;
    if (!patientId) {
        console.log('   No patient found. Creating dummy patient...');
        const { data: newPatient, error: createError } = await supabase
            .from('patients')
            .insert({
                clinic_id: clinicId,
                first_name: 'Test',
                last_name: 'LabOrder',
                email: `test_lab_${Date.now()}@example.com`,
                phone: '555-0000'
            })
            .select()
            .single();
        
        if (createError) {
            console.error('Failed to create patient:', createError.message);
            process.exit(1);
        }
        patientId = newPatient.id;
        console.log(`   Created Patient: ${patientId}`);
    } else {
        console.log(`   Using Patient: ${patientId}`);
    }

    // 4. Create Clinical Finding (Dental Chart) via RPC
    console.log('4. Inserting Clinical Finding (Dental Chart) via RPC...');
    
    // Check for existing first to avoid duplication logic if we run multiple times without cleanup
    // But upsert_tooth_condition handles upsert potentially? 
    // Let's check the params: patient_id, tooth_number, etc.
    
    const { data: findingIdData, error: findingError } = await supabase
        .rpc('upsert_tooth_condition', {
            p_patient_id: patientId,
            p_tooth_number: 18,
            p_surface: 'whole',
            p_condition: 'caries',
            p_notes: 'Test finding for lab order via Script'
        });

    let findingId = findingIdData; // RPC returns ID or void depending on implementation. 
    // clinical.ts says: returns { success: true, id: newId } wrapper? No, clinical.ts WRAPS the RPC.
    // Let's check clinical.ts: const { data: newId, error } = await supabase.rpc(...)
    // So it returns ID directly.

    if (findingError) {
        console.error('Failed to create finding via RPC:', findingError.message);
        process.exit(1);
    }
    
    console.log(`   Finding ID: ${findingId}`);

    if (!findingId) {
        // Fallback: fetch it if it returned null (maybe updated existing row and didn't return ID?)
        // Standard RPCs usually return the ID.
        const { data: existing } = await supabase.from('dental_chart')
             .select('id')
             // We can't select from dental_chart if it's hidden... 
             // But valid RPC upsert should return ID.
             // If this fails, we are stuck.
             // Let's assume it works.
             // If dental_chart is hidden, we might need another RPC to "get" it?
             // clinical.ts has 'get_patient_dental_chart'.
             // Let's use that if findingId is missing.
             .limit(1); // Placeholder, likely fails.
             
        if (!findingId) {
             const { data: chart } = await supabase.rpc('get_patient_dental_chart', { p_patient_id: patientId });
             const item = chart?.find((c: any) => c.tooth_number === 18 && c.surface === 'whole');
             if (item) {
                 // findingId = item.id; // item might not have ID exposed?
                 // clinical.ts interface ToothCondition doesn't show ID.
                 // This potentially blocks us if get_patient_dental_chart doesn't return ID.
                 console.warn("Could not retrieve Finding ID from RPC response or getter.");
             }
        }
    }
    
    // We strictly need findingID for the next step.
    // If the RPC `upsert_tooth_condition` returns the ID (which `clinical.ts` implies), we are good.
    // If not, we need to fix the RPC or the script.
    
    if (!findingId) {
         // Try a direct select hacks if possible, or fail.
         // Let's try selecting via RPC if we can?
         // No, let's assume upsert returns ID.
         console.warn("RPC did not return ID. Proceeding might fail.");
         // Mocking ID if we just want to test Order Creation part?
         // findingId = '0000...';
    }

    // 5. Create Lab Order via RPC (Transaction)
    console.log('5. Creating Lab Order via RPC (Transaction)...');
    
    const itemsPayload = [{
        configuration_id: '00000000-0000-0000-0000-000000000000', // Dummy UUID, might fail FK if checked. 
        // We need a valid Configuration ID.
        // Let's fetch one from lab_configurations if possible, or assume one exists?
        // LabSchema usually has FK constraints.
        // We should fetch a valid config first.
        tooth_number: 18,
        color: 'A1',
        unit_price: 100,
        clinical_finding_id: findingId
    }];
    
    // Fetch a valid config first
    const { data: config } = await supabase.from('lab_configurations').select('id').limit(1).single();
    if (config) {
        itemsPayload[0].configuration_id = config.id;
    } else {
        console.warn('   No lab_configurations found. RPC might fail on FK.');
    }

    const { data: orderId, error: rpcError } = await supabase.rpc('create_lab_order_transaction', {
        p_clinic_id: clinicId,
        p_patient_id: patientId,
        p_doctor_id: user.id,
        p_priority: 'normal',
        p_target_date: new Date().toISOString(),
        p_notes: 'Test Order via RPC Script',
        p_items: itemsPayload
    });

    if (rpcError) {
        console.error('RPC Failed:', rpcError.message);
        process.exit(1);
    }
    console.log(`   Order Created via RPC: ${orderId}`);

    // 6. Verify Link
    // (Link is handled inside RPC)
    console.log('6. Verifying Link Update...');
    // We already have findingId
    const order = { id: orderId }; // shim for next step usage

    // 7. Verify
    console.log('7. Verifying data consistency...');
    const { data: checkFinding } = await supabase
        .from('dental_chart')
        .select('lab_order_id')
        .eq('id', findingId)
        .single();
    
    if (checkFinding?.lab_order_id === order.id) {
        console.log('✅ SUCCESS: Lab Order linked to Clinical Finding correctly.');
        // Cleanup (Optional - maybe keep for review)
        // await supabase.from('lab_orders').delete().eq('id', order.id);
    } else {
        console.error('❌ FAILURE: Link was not persisted.');
    }
}

runTest().catch(console.error);
